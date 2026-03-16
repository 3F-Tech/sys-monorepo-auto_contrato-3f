import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @openapi
 * /business/{id}:
 *   get:
 *     summary: Obter empresa por ID
 *     tags:
 *       - Business
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 */
export const getBusinessById = async (req: Request, res: Response) => {
    try {
        const business = await prisma.business.findUnique({
            where: { id: Number(req.params.id) }, include: {
                seller_business: {
                    include: {
                        sellers: true
                    }
                }
            }
        });
        res.json(business);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch business" });
    }
}

/**
 * @openapi
 * /business:
 *   get:
 *     summary: Listar todas as empresas
 *     tags:
 *       - Business
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Business'
 */
export const getBusiness = async (req: Request, res: Response) => {
    try {
        const business = await prisma.business.findMany({
            include: {
                seller_business: {
                    include: {
                        sellers: true
                    }
                }
            }
        });
        res.json(business);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao buscar empresas" });
    }
}

/**
 * @openapi
 * /business:
 *   post:
 *     summary: Criar nova empresa
 *     tags:
 *       - Business
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/Business'
 *     responses:
 *       201:
 *         description: Criado
 */
export const createBusiness = async (req: Request, res: Response) => {
    try {
        const { data } = req.body
        const business = await prisma.business.create({
            data: data,
        });
        res.json(business);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao criar empresa" });
    }
}

/**
 * @openapi
 * /business/{id}:
 *   put:
 *     summary: Atualizar empresa
 *     tags:
 *       - Business
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/Business'
 *     responses:
 *       200:
 *         description: Atualizado
 */
export const updateBusiness = async (req: Request, res: Response) => {
    try {
        const { data } = req.body
        const business = await prisma.business.update({
            where: {
                id: Number(req.params.id),
            },
            data: data,
        });
        res.json(business);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao atualizar empresa" });
    }
}

/**
 * @openapi
 * /business/{id}:
 *   delete:
 *     summary: Deletar empresa
 *     tags:
 *       - Business
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deletado
 */
export const deleteBusiness = async (req: Request, res: Response) => {
    try {
        const business = await prisma.business.delete({
            where: {
                id: Number(req.params.id),
            },
        });
        res.json(business);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao excluir empresa" });
    }
}