import { Response } from 'express';
import { prisma } from '../prisma';

const toPlainObject = (costs: any) => {
    if (!costs) return null;
    return {
        ...costs,
        media_investment: Number(costs.media_investment || 0),
        commercial_tools: Number(costs.commercial_tools || 0),
        remuneration_pre_sales_1: Number(costs.remuneration_pre_sales_1 || 0),
        remuneration_pre_sales_2: Number(costs.remuneration_pre_sales_2 || 0),
        remuneration_closer_1: Number(costs.remuneration_closer_1 || 0),
        remuneration_closer_2: Number(costs.remuneration_closer_2 || 0),
        remuneration_coord: Number(costs.remuneration_coord || 0),
        referral_commission: Number(costs.referral_commission || 0),
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
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ error: "Mês e ano são obrigatórios" });
        }

        const m = parseInt(month as string);
        const y = parseInt(year as string);

        const costs = await prisma.commercial_costs.findUnique({
            where: {
                month_year: {
                    month: m,
                    year: y
                }
            }
        });

        if (!costs) {
            return res.json({
                month: m,
                year: y,
                media_investment: 0,
                commercial_tools: 0,
                remuneration_pre_sales_1: 0,
                remuneration_pre_sales_2: 0,
                remuneration_closer_1: 0,
                remuneration_closer_2: 0,
                remuneration_coord: 0,
                referral_commission: 0
            });
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
        if (requester.type !== 'admin') {
            return res.status(403).json({ error: "Apenas administradores podem definir os custos" });
        }

        const {
            month,
            year,
            media_investment,
            commercial_tools,
            remuneration_pre_sales_1,
            remuneration_pre_sales_2,
            remuneration_closer_1,
            remuneration_closer_2,
            remuneration_coord,
            referral_commission
        } = req.body;

        const data = {
            media_investment: parseFloat(media_investment) || 0,
            commercial_tools: parseFloat(commercial_tools) || 0,
            remuneration_pre_sales_1: parseFloat(remuneration_pre_sales_1) || 0,
            remuneration_pre_sales_2: parseFloat(remuneration_pre_sales_2) || 0,
            remuneration_closer_1: parseFloat(remuneration_closer_1) || 0,
            remuneration_closer_2: parseFloat(remuneration_closer_2) || 0,
            remuneration_coord: parseFloat(remuneration_coord) || 0,
            referral_commission: parseFloat(referral_commission) || 0,
        };

        const costs = await prisma.commercial_costs.upsert({
            where: {
                month_year: {
                    month: parseInt(month),
                    year: parseInt(year)
                }
            },
            create: {
                month: parseInt(month),
                year: parseInt(year),
                ...data
            },
            update: {
                ...data,
                updated_at: new Date()
            }
        });

        res.json(toPlainObject(costs));
    } catch (error) {
        console.error('Erro ao salvar custos comerciais:', error);
        res.status(500).json({ error: "Falha ao salvar indicadores de custos" });
    }
};
