import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { OpenAIService } from '../services/openaiService';

/**
 * @openapi
 * /negotiation-templates/generate:
 *   post:
 *     summary: Gerar cláusula de negociação com IA
 *     tags:
 *       - NegotiationTemplates
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 description: Descrição da negociação em linguagem natural
 *     responses:
 *       200:
 *         description: Cláusula gerada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                 numItems:
 *                   type: integer
 *       400:
 *         description: Descrição não fornecida
 *       500:
 *         description: Erro ao gerar cláusula
 */
/**
 * @openapi
 * /negotiation-templates:
 *   post:
 *     summary: Criar um novo template de negociação
 *     tags:
 *       - NegotiationTemplates
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - caluse_template
 *               - num_max_item
 *             properties:
 *               name:
 *                 type: string
 *               caluse_template:
 *                 type: string
 *               num_max_item:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Template criado com sucesso
 *       400:
 *         description: Campos obrigatórios não fornecidos
 *       500:
 *         description: Erro ao criar template
 */
/**
 * @openapi
 * /negotiation-templates:
 *   get:
 *     summary: Listar templates de negociação ativos
 *     tags:
 *       - NegotiationTemplates
 *     responses:
 *       200:
 *         description: Lista de templates
 *       500:
 *         description: Erro ao listar templates
 */
export const getNegotiationTemplates = async (req: any, res: Response) => {
    try {
        const user = req.user;
        let where: any = { is_active: true };

        if (user?.type === 'seller' || user?.type === 'sdr') {
            // JWT não tem head_id — busca do banco
            const seller = await prisma.sellers.findUnique({
                where: { id: BigInt(user.id) },
                select: { head_id: true },
            });
            const headId = seller?.head_id;
            where.OR = [
                ...(headId ? [{ created_by: headId }] : []),
                { created_by: null }
            ];
        } else if (user?.type === 'coord') {
            where.OR = [
                { created_by: BigInt(user.id) },
                { created_by: null }
            ];
        }
        // admin e head veem todos os ativos

        const templates = await prisma.negociation_template.findMany({
            where,
            orderBy: { created_at: 'desc' },
        });

        const serialized = JSON.parse(JSON.stringify(templates, (_key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(serialized);
    } catch (error: any) {
        console.error('[TEMPLATE] Erro ao listar:', error.message);
        res.status(500).json({ error: 'Falha ao listar templates', details: error.message });
    }
};

export const createNegotiationTemplate = async (req: any, res: Response) => {
    try {
        const { name, caluse_template, num_max_item, created_by } = req.body;
        const userId = req.user?.id;

        if (!name?.trim() || !caluse_template?.trim() || num_max_item == null) {
            return res.status(400).json({ error: 'Campos obrigatórios: name, caluse_template, num_max_item' });
        }

        // Logic for created_by:
        // - if created_by is explicitly provided in body (can be a head_id or null), use it
        // - otherwise fallback to userId
        let finalCreatedBy = userId ? BigInt(userId) : null;
        if (created_by !== undefined) {
            finalCreatedBy = created_by ? BigInt(created_by) : null;
        }

        const template = await prisma.negociation_template.create({
            data: {
                name: name.trim(),
                caluse_template: caluse_template.trim(),
                num_max_item: BigInt(num_max_item),
                created_by: finalCreatedBy,
            },
        });

        const serialized = JSON.parse(JSON.stringify(template, (_key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.status(201).json(serialized);
    } catch (error: any) {
        console.error('[TEMPLATE] Erro ao criar:', error.message);
        res.status(500).json({ error: 'Falha ao criar template', details: error.message });
    }
};

/**
 * @openapi
 * /negotiation-templates/{id}:
 *   put:
 *     summary: Editar um template de negociação existente
 *     tags:
 *       - NegotiationTemplates
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               caluse_template:
 *                 type: string
 *               num_max_item:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Template atualizado com sucesso
 *       400:
 *         description: Nenhum campo fornecido
 *       404:
 *         description: Template não encontrado
 *       500:
 *         description: Erro ao atualizar template
 */
export const updateNegotiationTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, caluse_template, num_max_item, created_by, is_active } = req.body;

        if (!name?.trim() && !caluse_template?.trim() && num_max_item == null && created_by === undefined && is_active === undefined) {
            return res.status(400).json({ error: 'Forneça ao menos um campo para atualizar' });
        }

        const data: any = { updated_at: new Date() };
        if (name?.trim()) data.name = name.trim();
        if (caluse_template?.trim()) data.caluse_template = caluse_template.trim();
        if (num_max_item != null) data.num_max_item = BigInt(num_max_item);
        if (created_by !== undefined) data.created_by = created_by ? BigInt(created_by) : null;
        if (is_active !== undefined) data.is_active = Boolean(is_active);

        const template = await prisma.negociation_template.update({
            where: { id: BigInt(id) },
            data,
        });

        const serialized = JSON.parse(JSON.stringify(template, (_key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(serialized);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Template não encontrado' });
        }
        console.error('[TEMPLATE] Erro ao atualizar:', error.message);
        res.status(500).json({ error: 'Falha ao atualizar template', details: error.message });
    }
};

/**
 * @openapi
 * /negotiation-templates/{id}/toggle:
 *   patch:
 *     summary: Ativar/desativar um template de negociação (soft delete)
 *     tags:
 *       - NegotiationTemplates
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template atualizado com sucesso
 *       404:
 *         description: Template não encontrado
 *       500:
 *         description: Erro ao atualizar template
 */
export const toggleNegotiationTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const existing = await prisma.negociation_template.findUnique({
            where: { id: BigInt(id) },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Template não encontrado' });
        }

        const template = await prisma.negociation_template.update({
            where: { id: BigInt(id) },
            data: {
                is_active: !existing.is_active,
                updated_at: new Date(),
            },
        });

        const serialized = JSON.parse(JSON.stringify(template, (_key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(serialized);
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Template não encontrado' });
        }
        console.error('[TEMPLATE] Erro ao toggle:', error.message);
        res.status(500).json({ error: 'Falha ao atualizar template', details: error.message });
    }
};

export const generateNegotiationClause = async (req: Request, res: Response) => {
    try {
        const { description } = req.body;

        if (!description || !description.trim()) {
            return res.status(400).json({ error: 'Descrição da negociação é obrigatória' });
        }

        const result = await OpenAIService.generateNegotiationClause(description.trim());
        res.json(result);
    } catch (error: any) {
        console.error('[IA] Erro ao gerar cláusula:', error.message);
        res.status(500).json({ error: 'Falha ao gerar cláusula com IA', details: error.message });
    }
};
