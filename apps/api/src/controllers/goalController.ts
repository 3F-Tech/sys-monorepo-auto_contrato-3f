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
            if (data.target_type !== 'bu') {
                return res.status(403).json({ error: "Coordenadores só definem metas de BU" });
            }
            const myBU = await prisma.seller_business.findFirst({ 
                where: { seller_id: BigInt(requester.id) } 
            });
            if (!myBU || myBU.business_id !== Number(data.target_id)) {
                return res.status(403).json({ error: "Você só pode definir metas para sua própria BU" });
            }
        } else if (requester.type === 'head') {
            if (data.target_type === 'bu' || data.target_type === 'head') {
                return res.status(403).json({ error: "Heads não definem metas de BU ou metas pessoais de Head (estas são definidas pelo Admin)" });
            }
            if (data.target_type === 'team' && data.target_id.toString() !== requester.id.toString()) {
                return res.status(403).json({ error: "Heads só definem metas para sua própria equipe" });
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
            // Vê a BU dele
            const myBU = await prisma.seller_business.findFirst({
                where: { seller_id: BigInt(requester.id) }
            });
            if (myBU) {
                where.OR = [
                    { target_type: 'bu', target_id: BigInt(myBU.business_id) }
                ];
            } else {
                return res.json([]);
            }
        } else if (requester.type === 'head') {
            // Vê sua própria meta de Equipe (team) + sua meta pessoal (head) + metas dos seus sellers
            const teamSellers = await prisma.sellers.findMany({
                where: { head_id: BigInt(requester.id) },
                select: { id: true }
            });
            const sellerIds = teamSellers.map(s => s.id);
            
            where.OR = [
                { target_type: 'head', target_id: BigInt(requester.id) },
                { target_type: 'team', target_id: BigInt(requester.id) },
                { target_type: 'seller', target_id: { in: sellerIds } }
            ];
        } else {
            // Seller vê apenas a sua
            where.target_type = 'seller';
            where.target_id = BigInt(requester.id);
        }

        const goals = await prisma.goals.findMany({ where });
        res.json(serializeBigInt(goals));
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
            if (goal.target_type !== 'bu') {
                return res.status(403).json({ error: 'Coordenadores só podem excluir metas de BU' });
            }
            const myBU = await prisma.seller_business.findFirst({
                where: { seller_id: BigInt(requester.id) }
            });
            if (!myBU || myBU.business_id !== Number(goal.target_id)) {
                return res.status(403).json({ error: 'Você só pode excluir metas da sua BU' });
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
