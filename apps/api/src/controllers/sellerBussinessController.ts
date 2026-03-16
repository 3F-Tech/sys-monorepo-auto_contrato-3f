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
        const sellerBusiness = await prisma.seller_business.findMany({ where: { seller_id: Number(req.params.id) } });
        res.json(sellerBusiness);
    } catch (error) {
        console.error(error);
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
        const { seller_id, business_ids } = data
        await prisma.seller_business.deleteMany({ where: { seller_id } })
        const payload = business_ids.map((b: number) => {
            return {
                seller_id,
                business_id: b
            }
        })
        const sellerBusiness = await prisma.seller_business.createMany({
            data: payload,
        });
        res.json({ message: "Seller business created successfully", sellerBusiness });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao criar vínculo vendedor-empresa" });
    }
}
