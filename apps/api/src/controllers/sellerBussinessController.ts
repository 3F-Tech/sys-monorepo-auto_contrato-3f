import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @openapi
 * /seller-business:
 *   get:
 *     summary: Listar associações por vendedor
 *     tags:
 *       - SellerBusiness
 *     responses:
 *       200:
 *         description: Sucesso
 */
export const getSellerBusinessBySeller = async (req: Request, res: Response) => {
    try {
        // Tenta pegar de params (se a rota for alterada) ou de query param ?seller_id=...
        const id = req.params.id || req.query.seller_id;
        if (!id) {
            return res.status(400).json({ error: "ID do vendedor não fornecido" });
        }

        const sellerId = BigInt(id as string);
        const sellerBusiness = await prisma.seller_business.findMany({ 
            where: { seller_id: sellerId },
            include: { business: true }
        });
        
        const serialized = JSON.parse(JSON.stringify(sellerBusiness, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));
        
        res.json(serialized);
    } catch (error) {
        console.error("Erro ao buscar vínculos do vendedor:", error);
        res.status(500).json({ error: "Falha ao buscar vínculo vendedor-empresa" });
    }
}

/**
 * @openapi
 * /seller-business/{id}:
 *   get:
 *     summary: Listar associações por empresa
 *     tags:
 *       - SellerBusiness
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sucesso
 */
export const getSellerBusinessByBusiness = async (req: Request, res: Response) => {
    try {
        const sellerBusiness = await prisma.seller_business.findMany({ where: { business_id: Number(req.params.id) } });
        res.json(sellerBusiness);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao buscar vínculo vendedor-empresa" });
    }
}

/**
 * @openapi
 * /seller-business:
 *   put:
 *     summary: Atualizar associações de um vendedor
 *     tags:
 *       - SellerBusiness
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   seller_id:
 *                     type: integer
 *                   business_ids:
 *                     type: array
 *                     items:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Atualizado com sucesso
 */
export const updateSellerBusiness = async (req: Request, res: Response) => {
    try {
        const { data } = req.body
        if (!data) {
            return res.status(400).json({ error: "Campo 'data' é obrigatório no corpo da requisição" });
        }
        
        const { seller_id, business_ids } = data
        
        if (!seller_id) {
            return res.status(400).json({ error: "seller_id é obrigatório" });
        }

        const bigSellerId = BigInt(seller_id.toString());

        // Usar transação para garantir atomicidade
        await prisma.$transaction(async (tx) => {
            // Remove vínculos antigos
            await tx.seller_business.deleteMany({ 
                where: { seller_id: bigSellerId } 
            });
            
            // Adiciona novos vínculos (usando loop para evitar limitações de createMany com BigInt em alguns contextos)
            if (Array.isArray(business_ids) && business_ids.length > 0) {
                for (const bId of business_ids) {
                    await tx.seller_business.create({
                        data: {
                            seller_id: bigSellerId,
                            business_id: Number(bId)
                        }
                    });
                }
            }
        });

        res.json({ success: true, message: "Vínculos atualizados com sucesso" });
    } catch (error: any) {
        console.error("Erro crítico ao atualizar vínculos BU/Seller:", error);
        res.status(500).json({ 
            error: "Falha ao atualizar vínculo vendedor-empresa",
            details: error.message 
        });
    }
}
