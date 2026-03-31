import { Request, Response } from 'express';
import { prisma } from '../prisma';

/**
 * @openapi
 * /cac:
 *   get:
 *     summary: Listar CAC por BU para um mês específico (com fallback histórico)
 *     tags:
 *       - CAC
 */
export const getCac = async (req: any, res: Response) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ error: "Mês e ano são obrigatórios" });
        }

        const m = parseInt(month as string);
        const y = parseInt(year as string);

        // 1. Buscar todas as BUs
        const businesses = await prisma.business.findMany();

        // 2. Para cada BU, encontrar o CAC (valor atual ou último disponível)
        const cacResults = await Promise.all(businesses.map(async (bu) => {
            // Tenta o valor exato do mês
            const exact = await prisma.bu_cac.findUnique({
                where: {
                    bu_id_month_year: {
                        bu_id: bu.id,
                        month: m,
                        year: y
                    }
                }
            });

            if (exact) {
                return {
                    bu_id: bu.id,
                    bu_name: bu.name,
                    amount: Number(exact.amount),
                    is_inherited: false,
                    month: m,
                    year: y
                };
            }

            // Fallback: Busca o mais recente ANTES do mês/ano solicitado
            const fallback = await prisma.bu_cac.findFirst({
                where: {
                    bu_id: bu.id,
                    OR: [
                        { year: { lt: y } },
                        { year: y, month: { lt: m } }
                    ]
                },
                orderBy: [
                    { year: 'desc' },
                    { month: 'desc' }
                ]
            });

            return {
                bu_id: bu.id,
                bu_name: bu.name,
                amount: fallback ? Number(fallback.amount) : 0,
                is_inherited: !!fallback,
                month: m,
                year: y
            };
        }));

        res.json(cacResults);
    } catch (error) {
        console.error('Erro ao buscar CAC:', error);
        res.status(500).json({ error: "Falha ao buscar indicadores de CAC" });
    }
};

/**
 * @openapi
 * /cac:
 *   post:
 *     summary: Definir valor de CAC para uma BU
 *     tags:
 *       - CAC
 */
export const upsertCac = async (req: any, res: Response) => {
    try {
        const requester = req.user;
        if (!['admin', 'head', 'coord'].includes(requester.type)) {
            return res.status(403).json({ error: "Você não tem permissão para definir o CAC" });
        }

        const { bu_id, amount, month, year } = req.body;

        const cac = await prisma.bu_cac.upsert({
            where: {
                bu_id_month_year: {
                    bu_id: parseInt(bu_id),
                    month: parseInt(month),
                    year: parseInt(year)
                }
            },
            create: {
                bu_id: parseInt(bu_id),
                amount: parseFloat(amount),
                month: parseInt(month),
                year: parseInt(year)
            },
            update: {
                amount: parseFloat(amount),
                updated_at: new Date()
            }
        });

        res.json(cac);
    } catch (error) {
        console.error('Erro ao salvar CAC:', error);
        res.status(500).json({ error: "Falha ao salvar valor de CAC" });
    }
};
