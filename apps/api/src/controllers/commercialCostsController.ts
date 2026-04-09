import { Response } from 'express';
import { prisma } from '../prisma';

const toPlainObject = (costs: any) => {
    if (!costs) return null;
    return {
        ...costs,
        media_investment: Number(costs.media_investment || 0),
        commercial_tools: Number(costs.commercial_tools || 0),
        remuneration_coord: Number(costs.remuneration_coord || 0),
        referral_commission: Number(costs.referral_commission || 0),
        members: (costs.members || []).map((m: any) => ({
            ...m,
            value: Number(m.value || 0)
        }))
    };
};

/**
 * @openapi
 * /commercial-costs:
 *   get:
 *     summary: Listar custos comerciais para um mês específico
 *     tags:
 *       - Commercial Costs
 */
export const getCommercialCosts = async (req: any, res: Response) => {
    try {
        const { month, year, bu_id } = req.query;
        if (!month || !year) {
            return res.status(400).json({ error: "Mês e ano são obrigatórios" });
        }

        const m = parseInt(month as string);
        const y = parseInt(year as string);
        const buId = bu_id ? parseInt(bu_id as string) : null;

        // Se bu_id === 'all' ou não especificado, soma todos os registros do mês
        if (bu_id === 'all' || !bu_id) {
            const allCosts = await prisma.commercial_costs.findMany({
                where: { month: m, year: y },
                include: { members: true }
            });

            if (!allCosts.length) {
                return res.json({ month: m, year: y, bu_id: null, media_investment: 0, commercial_tools: 0, remuneration_coord: 0, referral_commission: 0, members: [] });
            }

            // Soma todos os registros de BUs
            const summed = allCosts.reduce((acc, c) => {
                const costs = toPlainObject(c);
                return {
                    media_investment: acc.media_investment + costs.media_investment,
                    commercial_tools: acc.commercial_tools + costs.commercial_tools,
                    remuneration_coord: acc.remuneration_coord + costs.remuneration_coord,
                    referral_commission: acc.referral_commission + costs.referral_commission,
                    members: [...acc.members, ...costs.members],
                    items: [...acc.items, costs]
                };
            }, { media_investment: 0, commercial_tools: 0, remuneration_coord: 0, referral_commission: 0, members: [] as any[], items: [] as any[] });

            return res.json({ 
                month: m, 
                year: y, 
                bu_id: null, 
                ...summed
            });
        }

        // Busca custos de uma BU específica
        const costs = await prisma.commercial_costs.findFirst({
            where: { month: m, year: y, bu_id: buId },
            include: { members: true }
        });

        if (!costs) {
            return res.json({ month: m, year: y, bu_id: buId, media_investment: 0, commercial_tools: 0, remuneration_coord: 0, referral_commission: 0, members: [] });
        }

        res.json(toPlainObject(costs));
    } catch (error) {
        console.error('Erro ao buscar custos comerciais:', error);
        res.status(500).json({ error: "Falha ao buscar indicadores de custos" });
    }
};

/**
 * @openapi
 * /commercial-costs:
 *   post:
 *     summary: Definir custos comerciais para um mês
 *     tags:
 *       - Commercial Costs
 */
export const upsertCommercialCosts = async (req: any, res: Response) => {
    try {
        const requester = req.user;
        if (!['admin', 'head', 'coord'].includes(requester.type)) {
            return res.status(403).json({ error: "Você não tem permissão para definir os custos" });
        }

        const {
            month,
            year,
            bu_id,
            media_investment,
            commercial_tools,
            remuneration_coord,
            referral_commission,
            members // Array de { type: 'SDR' | 'CLOSER', value: number }
        } = req.body;

        if (!bu_id) {
            return res.status(400).json({ error: "BU é obrigatória para salvar os custos" });
        }

        const data = {
            media_investment: parseFloat(media_investment) || 0,
            commercial_tools: parseFloat(commercial_tools) || 0,
            remuneration_coord: parseFloat(remuneration_coord) || 0,
            referral_commission: parseFloat(referral_commission) || 0,
        };

        const buIdInt = parseInt(bu_id);

        // Busca registro existente para esse bu_id + month + year
        const existing = await prisma.commercial_costs.findFirst({
            where: { month: parseInt(month), year: parseInt(year), bu_id: buIdInt }
        });

        let costs;
        if (existing) {
            // Limpa membros antigos e cria novos para sincronizar (mais simples que update individual)
            await prisma.commercial_cost_member.deleteMany({
                where: { cost_id: existing.id }
            });

            costs = await prisma.commercial_costs.update({
                where: { id: existing.id },
                data: { 
                    ...data, 
                    bu_id: buIdInt, 
                    updated_at: new Date(),
                    members: {
                        createMany: {
                            data: Array.isArray(members) ? members.map((m: any) => ({
                                type: m.type,
                                value: parseFloat(m.value) || 0
                            })) : []
                        }
                    }
                },
                include: { members: true }
            });
        } else {
            costs = await prisma.commercial_costs.create({
                data: {
                    month: parseInt(month),
                    year: parseInt(year),
                    bu_id: buIdInt,
                    ...data,
                    members: {
                        createMany: {
                            data: Array.isArray(members) ? members.map((m: any) => ({
                                type: m.type,
                                value: parseFloat(m.value) || 0
                            })) : []
                        }
                    }
                },
                include: { members: true }
            });
        }

        res.json(toPlainObject(costs));
    } catch (error) {
        console.error('Erro ao salvar custos comerciais:', error);
        res.status(500).json({ error: "Falha ao salvar indicadores de custos" });
    }
};
