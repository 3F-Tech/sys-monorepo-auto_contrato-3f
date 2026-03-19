import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @openapi
 * /contracts:
 *   get:
 *     summary: Listar todos os contratos
 *     tags:
 *       - Contracts
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contracts'
 */
export const getContracts = async (req: Request, res: Response) => {
    try {
        const contracts = await prisma.contracts.findMany();
        res.json(contracts);
    } catch (error: any) {
        console.error('Erro ao obter contratos:', error);
        res.status(500).json({ error: 'Falha ao obter contratos', details: error.message });
    }
};

/**
 * @openapi
 * /contracts/seller/{sellerId}:
 *   get:
 *     summary: Listar contratos por ID do Vendedor
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do Vendedor (BigInt)
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contracts'
 */
export const getContractBySellerId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const contracts = await prisma.contracts.findMany({
            where: { seller_id: BigInt(id) },
        });
        res.json(contracts);
    } catch (error: any) {
        console.error('Erro ao obter contratos por ID do vendedor:', error);
        res.status(500).json({ error: 'Falha ao obter contratos', details: error.message });
    }
};

/**
 * @openapi
 * /contracts/bu/{buId}:
 *   get:
 *     summary: Listar contratos por ID da BU
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: buId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da Unidade de Negócio
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contracts'
 */
export const getContractByBuId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const contracts = await prisma.contracts.findMany({
            where: { bu_id: Number(id) },
        });
        res.json(contracts);
    } catch (error: any) {
        console.error('Erro ao obter contratos por ID da BU:', error);
        res.status(500).json({ error: 'Falha ao obter contratos', details: error.message });
    }
};

/**
 * @openapi
 * /contracts/head/{headId}:
 *   get:
 *     summary: Listar contratos da equipe (por ID do Head)
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: headId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do Head (BigInt)
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contracts'
 */
export const getContractByHeadId = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        // Find all sellers whose head_id matches
        const teamSellers = await prisma.sellers.findMany({
            where: { head_id: BigInt(id) },
            select: { id: true }
        });
        
        const sellerIds = teamSellers.map(s => s.id);
        
        // We also want to include the head's own contracts, just in case
        sellerIds.push(BigInt(id));

        const contracts = await prisma.contracts.findMany({
            where: { seller_id: { in: sellerIds } },
        });
        
        res.json(contracts);
    } catch (error: any) {
        console.error('Erro ao obter contratos da equipe:', error);
        res.status(500).json({ error: 'Falha ao obter contratos da equipe', details: error.message });
    }
};

/**
 * @openapi
 * /contracts:
 *   post:
 *     summary: Criar novo registro de contrato no banco
 *     tags:
 *       - Contracts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/Contracts'
 *     responses:
 *       201:
 *         description: Contrato criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contracts'
 */
export const createContract = async (req: Request, res: Response) => {
    try {
        const { data } = req.body;
        if (!data) return res.status(400).json({ error: 'Dados não fornecidos' });

        const contract = await prisma.contracts.create({
            data: {
                ...data
            },
        });

        res.json(contract);
    } catch (error: any) {
        console.error('Erro ao criar contrato:', error);
        res.status(500).json({ error: 'Falha ao criar contrato', details: error.message });
    }
};

/**
 * @openapi
 * /contracts/{id}:
 *   put:
 *     summary: Atualizar status/dados de um contrato
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do Contrato (BigInt)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signed:
 *                 type: boolean
 *               signed_date:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               link:
 *                 type: string
 *               change_status:
 *                 type: string
 *                 nullable: true
 *               change_description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Contrato atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contracts'
 */
export const updateContract = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { signed, signed_date, link, change_status, change_description } = req.body;
        
        // Verifica se pelo menos uma propriedade foi enviada no body (mesmo que seja false ou null)
        if (signed === undefined && signed_date === undefined && link === undefined && change_status === undefined && change_description === undefined) {
            return res.status(400).json({ error: 'Dados não fornecidos' });
        }

        const contract = await prisma.contracts.update({
            where: { id: BigInt(id) },
            data: {
                ...(signed !== undefined && { signed }),
                ...(signed_date !== undefined && { signed_date }),
                ...(link !== undefined && { link }),
                ...(change_status !== undefined && { change_status }),
                ...(change_description !== undefined && { change_description })
            },
        });

        res.json(contract);
    } catch (error: any) {
        console.error('Erro ao atualizar contrato:', error);
        res.status(500).json({ error: 'Falha ao atualizar contrato', details: error.message });
    }
};

/**
 * @openapi
 * /contracts/{id}:
 *   delete:
 *     summary: Excluir um contrato
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do Contrato (BigInt)
 *     responses:
 *       200:
 *         description: Contrato deletado
 */
export const deleteContract = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const contract = await prisma.contracts.delete({
            where: { id: BigInt(id) },
        });
        res.json(contract);
    } catch (error: any) {
        console.error('Erro ao deletar contrato:', error);
        res.status(500).json({ error: 'Falha ao deletar contrato', details: error.message });
    }
};