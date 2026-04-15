import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { goalSchema } from '../schemas/goalSchema';

const serializeBigInt = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
};

/**
 * @openapi
 * /goals:
 *   post:
 *     summary: Criar ou atualizar meta
 *     tags:
 *       - Goals
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Goal'
 */
export const createOrUpdateGoal = async (req: any, res: Response) => {
    try {
        const validation = goalSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: 'Dados inválidos', details: validation.error.format() });
        }

        const data = validation.data;
        const requester = req.user;

        if (!requester) return res.status(401).json({ error: 'Não autenticado' });

        // Hierarquia de Permissões
        if (requester.type === 'admin') {
            // Admin pode tudo (BU, Head, Team, Seller)
        } else if (requester.type === 'coord') {
            if (data.target_type === 'bu') {
                const myBU = await prisma.seller_business.findFirst({ 
                    where: { seller_id: BigInt(requester.id) } 
                });
                if (!myBU || myBU.business_id !== Number(data.target_id)) {
                    return res.status(403).json({ error: "Você só pode definir metas para sua própria BU" });
                }
            } else if (data.target_type === 'team') {
                const teamId = Number(data.target_id);
                const team = await prisma.teams.findUnique({ where: { id: teamId } });
                if (!team || team.head_id?.toString() !== requester.id.toString()) {
                    return res.status(403).json({ error: "Você só pode definir metas para equipes sob sua gestão" });
                }
            } else if (data.target_type === 'seller') {
                const seller = await prisma.sellers.findUnique({ where: { id: data.target_id } });
                if (!seller || seller.head_id?.toString() !== requester.id.toString()) {
                    return res.status(403).json({ error: "Vendedor não pertence à sua equipe" });
                }
            } else {
                return res.status(403).json({ error: "Coordenadores não definem metas pessoais ou de outros tipos" });
            }
        } else if (requester.type === 'head') {
            if (data.target_type === 'bu' || data.target_type === 'head') {
                return res.status(403).json({ error: "Heads não definem metas de BU ou metas pessoais de Head (estas são definidas pelo Admin)" });
            }
            if (data.target_type === 'team') {
                const teamId = Number(data.target_id);
                const team = await prisma.teams.findUnique({ where: { id: teamId } });
                if (!team || team.head_id?.toString() !== requester.id.toString()) {
                    // Fallback para o caso onde head_id é usado como target_id (legado/pessoal)
                    if (data.target_id.toString() !== requester.id.toString()) {
                        return res.status(403).json({ error: "Você só pode definir metas para equipes sob sua gestão" });
                    }
                }
            }
            if (data.target_type === 'seller') {
                const seller = await prisma.sellers.findUnique({ where: { id: data.target_id } });
                if (!seller || seller.head_id?.toString() !== requester.id.toString()) {
                    return res.status(403).json({ error: "Vendedor não pertence à sua equipe" });
                }
            }
        } else {
            return res.status(403).json({ error: "Vendedores não têm permissão para definir metas" });
        }

        const goal = await prisma.goals.upsert({
            where: {
                target_type_target_id_month_year: {
                    target_type: data.target_type,
                    target_id: data.target_id,
                    month: data.month,
                    year: data.year
                }
            },
            create: {
                ...data,
                created_by: BigInt(requester.id)
            },
            update: {
                ...data,
                updated_at: new Date()
            }
        });

        res.json(serializeBigInt(goal));
    } catch (error: any) {
        console.error('GOAL_UPSERT_ERROR:', error);
        res.status(500).json({ error: 'Erro ao processar meta', details: error.message });
    }
};

/**
 * @openapi
 * /goals:
 *   get:
 *     summary: Listar metas filtradas por visibilidade
 *     tags:
 *       - Goals
 */
export const getGoals = async (req: any, res: Response) => {
    try {
        const requester = req.user;
        const { month, year } = req.query;

        if (!requester) return res.status(401).json({ error: 'Não autenticado' });

        const where: any = {};
        if (month) where.month = Number(month);
        if (year) where.year = Number(year);

        // Lógica de Visibilidade (Filtros Adicionais)
        if (requester.type === 'admin') {
            // Vê tudo
        } else if (requester.type === 'coord') {
            // Vê a BU dele + suas equipes + seus sellers
            const myBU = await prisma.seller_business.findFirst({
                where: { seller_id: BigInt(requester.id) }
            });
            
            const teamSellers = await prisma.sellers.findMany({
                where: { head_id: BigInt(requester.id) },
                select: { id: true }
            });
            const sellerIds = teamSellers.map(s => s.id);

            const managedTeams = await prisma.teams.findMany({
                where: { head_id: BigInt(requester.id) },
                select: { id: true }
            });
            const managedTeamIds = managedTeams.map(t => BigInt(t.id));

            where.OR = [
                { target_type: 'seller', target_id: { in: sellerIds } },
                { target_type: 'seller', target_id: BigInt(requester.id) }, // Vê a própria se tiver
                { target_type: 'team', target_id: { in: managedTeamIds } }
            ];

            if (myBU) {
                where.OR.push({ target_type: 'bu', target_id: BigInt(myBU.business_id) });
            }
        } else if (requester.type === 'head') {
            // Vê sua própria meta de Equipe (team e head) + metas dos seus sellers + metas de suas BUs
            const teamSellers = await prisma.sellers.findMany({
                where: { head_id: BigInt(requester.id) },
                select: { id: true }
            });
            const sellerIds = teamSellers.map(s => s.id);
            
            const myBUs = await prisma.seller_business.findMany({
                where: { seller_id: BigInt(requester.id) },
                select: { business_id: true }
            });
            const buIds = myBUs.map(sb => BigInt(sb.business_id));

            where.OR = [
                { target_type: 'head', target_id: BigInt(requester.id) },
                { target_type: 'seller', target_id: BigInt(requester.id) }, // Vê a própria meta de vendedor (common for Head)
                { target_type: 'seller', target_id: { in: sellerIds } },
                { target_type: 'bu', target_id: { in: buIds } }
            ];
            
            // Também vê se estiver em uma equipe específica pelo ID da equipe (teams liderados ou onde é membro)
            const managedTeams = await prisma.teams.findMany({
                where: { head_id: BigInt(requester.id) },
                select: { id: true }
            });
            const managedTeamIds = managedTeams.map(t => BigInt(t.id));

            const me = await prisma.sellers.findUnique({ where: { id: BigInt(requester.id) }, select: { team_id: true } });
            
            if (managedTeamIds.length > 0) {
                where.OR.push({ target_type: 'team', target_id: { in: managedTeamIds } });
            }
            if (me?.team_id) {
                where.OR.push({ target_type: 'team', target_id: BigInt(me.team_id) });
            }

        } else {
            // Seller / SDR vê a sua + a de sua equipe (se houver) + vendedores da mesma equipe + metas das BUs vinculadas
            const me = await prisma.sellers.findUnique({
                where: { id: BigInt(requester.id) },
                include: { seller_business: true }
            });

            if (!me) return res.status(404).json({ error: 'Perfil não encontrado' });

            const buIds = me.seller_business.map(sb => BigInt(sb.business_id));
            const orConditions: any[] = [
                { target_type: 'seller', target_id: BigInt(requester.id) },
                { target_type: 'bu', target_id: { in: buIds } }
            ];

            if (me.team_id) {
                const teamSellers = await prisma.sellers.findMany({
                    where: { team_id: me.team_id },
                    select: { id: true }
                });
                const teammateIds = teamSellers.map(s => s.id);

                orConditions.push({ target_type: 'seller', target_id: { in: teammateIds } });
                orConditions.push({ target_type: 'team', target_id: BigInt(me.team_id) });
            }

            where.OR = orConditions;
        }

        let goalsList = await prisma.goals.findMany({ where });

        // Cálculo automático de meta de equipe (Soma dos vendedores)
        const sellerGoals = goalsList.filter(g => g.target_type === 'seller');
        
        if (sellerGoals.length > 0) {
            // Buscamos a relação seller -> team_id (apenas IDs únicos para performance)
            const uniqueSellerIds = Array.from(new Set(sellerGoals.map(g => g.target_id.toString()))).map(id => BigInt(id));
            
            const sellers = await prisma.sellers.findMany({
                where: { id: { in: uniqueSellerIds } },
                select: { id: true, team_id: true }
            });

            const teamSums = new Map<string, any>();
            const sellerToTeam = new Map(sellers.map(s => [s.id.toString(), s.team_id]));

            sellerGoals.forEach(g => {
                const teamId = sellerToTeam.get(g.target_id.toString());
                if (teamId) {
                    const key = `${teamId}-${g.month}-${g.year}`;
                    
                    if (!teamSums.has(key)) {
                        teamSums.set(key, {
                            target_type: 'team',
                            target_id: BigInt(teamId),
                            month: g.month,
                            year: g.year,
                            p1: 0,
                            tcv: 0,
                            nmrr: 0,
                            implementation: 0,
                            monthly: 0,
                            p1_period_1: 0,
                            p1_period_2: 0,
                            p1_period_3: 0,
                            p1_period_4: 0,
                            isVirtual: true
                        });
                    }
                    const s = teamSums.get(key);
                    s.p1 = Number(s.p1) + Number(g.p1 || 0);
                    s.tcv = Number(s.tcv) + Number(g.tcv || 0);
                    s.nmrr = Number(s.nmrr) + Number(g.nmrr || 0);
                    s.implementation = Number(s.implementation) + Number(g.implementation || 0);
                    s.monthly = Number(s.monthly) + Number(g.monthly || 0);
                    s.p1_period_1 = Number(s.p1_period_1) + Number(g.p1_period_1 || 0);
                    s.p1_period_2 = Number(s.p1_period_2) + Number(g.p1_period_2 || 0);
                    s.p1_period_3 = Number(s.p1_period_3) + Number(g.p1_period_3 || 0);
                    s.p1_period_4 = Number(s.p1_period_4) + Number(g.p1_period_4 || 0);
                }
            });

            // Convert Map to array e removemos metas reais de equipe onde houver virtualizada
            const virtualTeamGoals = Array.from(teamSums.values()).map((vg) => ({
                ...vg,
                id: -(Number(vg.target_id) + Number(vg.month) * 1000 + Number(vg.year) * 10000) 
            }));

            const teamKeysToVirtualize = new Set(Array.from(teamSums.keys()));
            
            goalsList = goalsList.filter(g => {
                if (g.target_type !== 'team') return true;
                const key = `${g.target_id}-${g.month}-${g.year}`;
                return !teamKeysToVirtualize.has(key);
            });

            goalsList = [...goalsList, ...virtualTeamGoals];
        }

        res.json(serializeBigInt(goalsList));
    } catch (error: any) {
        console.error('GOAL_FETCH_ERROR:', error);
        res.status(500).json({ error: 'Erro ao buscar metas', details: error.message });
    }
};

/**
 * @openapi
 * /goals/{id}:
 *   delete:
 *     summary: Excluir uma meta
 *     tags:
 *       - Goals
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
export const deleteGoal = async (req: any, res: Response) => {
    try {
        const requester = req.user;
        if (!requester) return res.status(401).json({ error: 'Não autenticado' });

        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

        const goal = await prisma.goals.findUnique({ where: { id } });
        if (!goal) return res.status(404).json({ error: 'Meta não encontrada' });

        // Verificação de permissão
        if (requester.type === 'admin') {
            // Admin pode excluir qualquer meta
        } else if (requester.type === 'coord') {
            if (goal.target_type === 'bu') {
                const myBU = await prisma.seller_business.findFirst({
                    where: { seller_id: BigInt(requester.id) }
                });
                if (!myBU || myBU.business_id !== Number(goal.target_id)) {
                    return res.status(403).json({ error: 'Você só pode excluir metas da sua BU' });
                }
            } else if (goal.target_type === 'team') {
                const team = await prisma.teams.findUnique({ where: { id: Number(goal.target_id) } });
                if (!team || team.head_id?.toString() !== requester.id.toString()) {
                    return res.status(403).json({ error: 'Você só pode excluir metas de equipes sob sua gestão' });
                }
            } else if (goal.target_type === 'seller') {
                const seller = await prisma.sellers.findUnique({ where: { id: goal.target_id } });
                if (!seller || seller.head_id?.toString() !== requester.id.toString()) {
                    return res.status(403).json({ error: 'Vendedor não pertence à sua equipe' });
                }
            } else {
                return res.status(403).json({ error: 'Coordenadores não podem excluir este tipo de meta' });
            }
        } else if (requester.type === 'head') {
            if (goal.target_type === 'bu' || goal.target_type === 'head') {
                return res.status(403).json({ error: 'Heads não podem excluir metas de BU ou metas pessoais de Head (contate o Admin)' });
            }
            if (goal.target_type === 'team' && goal.target_id.toString() !== requester.id.toString()) {
                return res.status(403).json({ error: 'Você só pode excluir sua própria meta de equipe' });
            }
            if (goal.target_type === 'seller') {
                const seller = await prisma.sellers.findUnique({ where: { id: goal.target_id } });
                if (!seller || seller.head_id?.toString() !== requester.id.toString()) {
                    return res.status(403).json({ error: 'Vendedor não pertence à sua equipe' });
                }
            }
        } else {
            return res.status(403).json({ error: 'Sem permissão para excluir metas' });
        }

        await prisma.goals.delete({ where: { id } });
        res.json({ message: 'Meta excluída com sucesso', id });
    } catch (error: any) {
        console.error('GOAL_DELETE_ERROR:', error);
        res.status(500).json({ error: 'Erro ao excluir meta', details: error.message });
    }
};
