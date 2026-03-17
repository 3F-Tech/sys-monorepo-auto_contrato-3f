import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

/**
 * @openapi
 * /sellers/{id}:
 *   get:
 *     summary: Obter vendedor por ID
 *     tags:
 *       - Sellers
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
 *               $ref: '#/components/schemas/Sellers'
 */
export const getSellerById = async (req: Request, res: Response) => {
    try {
        const seller = await prisma.sellers.findUnique({
            where: { id: Number(req.params.id) }, include: {
                seller_business: {
                    include: {
                        business: true
                    }
                }
            }
        });
        res.json(seller);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch seller" });
    }
}

/**
 * @openapi
 * /sellers/email/{email}:
 *   get:
 *     summary: Obter vendedor por email
 *     tags:
 *       - Sellers
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sellers'
 */
export const getSellerByEmail = async (req: Request, res: Response) => {
    try {
        const seller = await prisma.sellers.findUnique({
            where: { email: req.params.email }, include: {
                seller_business: {
                    include: {
                        business: true
                    }
                }
            }
        });
        res.json(seller);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch seller" });
    }
}

/**
 * @openapi
 * /sellers:
 *   get:
 *     summary: Listar vendedores
 *     tags:
 *       - Sellers
 *     parameters:
 *       - in: query
 *         name: head_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID do Head (BigInt serializado)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de usuário (seller, head, coord, admin)
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sellers'
 */
export const getSellers = async (req: any, res: Response) => {
    try {
        const { head_id, type } = req.query;
        const requester = req.user;
        const where: any = {};

        // Se não for admin, impõe filtros de visibilidade
        if (requester && requester.type !== 'admin') {
            if (requester.type === 'head') {
                // Head vê apenas sua própria equipe
                where.head_id = BigInt(requester.id);
            } else if (requester.type === 'coord') {
                // Coordenador vê todos vinculados à BU dele
                // 1. Descobrir a BU do coordenador
                const coordBusiness = await prisma.seller_business.findFirst({
                    where: { seller_id: Number(requester.id) }
                });

                if (coordBusiness) {
                    where.seller_business = {
                        some: {
                            business_id: coordBusiness.business_id
                        }
                    };
                } else {
                    // Se o coordenador não tem BU, não vê ninguém (ou erro)
                    return res.json([]);
                }
            }
        } else {
            // Admin ou filtros manuais via query
            if (head_id) {
                where.head_id = BigInt(head_id as string);
            }
        }

        if (type) {
            where.type = type as string;
        }

        const sellers = await prisma.sellers.findMany({
            where,
            include: {
                seller_business: {
                    include: {
                        business: true
                    }
                }
            }
        });

        // Converte BigInt para string antes de enviar para o JSON
        const serializedSellers = JSON.parse(JSON.stringify(sellers, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(serializedSellers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao buscar vendedores" });
    }
}

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Autenticação de usuário
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       401:
 *         description: Credenciais inválidas
 */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
             return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
        }

        const seller = await prisma.sellers.findUnique({
            where: { email },
            include: {
                seller_business: true
            }
        });

        if (!seller) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

        if (hashedPassword !== seller.password) {
            return res.status(401).json({ error: "Credenciais inválidas" });
        }

        // Gera o token JWT
        const token = jwt.sign(
            { id: seller.id.toString(), email: seller.email, type: seller.type },
            JWT_SECRET,
            { expiresIn: '3h' }
        );

        // Remove password before sending
        const { password: _, ...userWithoutPassword } = seller;

        // Serializa BigInt
        const userSerialized = JSON.parse(JSON.stringify(userWithoutPassword, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({
            user: userSerialized,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
}

/**
 * @openapi
 * /sellers:
 *   post:
 *     summary: Criar novo vendedor
 *     tags:
 *       - Sellers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/Sellers'
 *     responses:
 *       201:
 *         description: Criado
 */
export const createSeller = async (req: any, res: Response) => {
    try {
        const { data } = req.body;
        const requester = req.user;

        if (!requester || !['admin', 'head', 'coord'].includes(requester.type)) {
            return res.status(403).json({ error: "Acesso negado" });
        }

        // Restrições específicas para Head (Coordenador agora é livre para usuários)
        if (requester.type === 'head') {
            data.type = 'seller'; // Head só cria seller
            data.head_id = BigInt(requester.id); // Vendedor vinculado ao head
        }

        const seller = await prisma.sellers.create({
            data: data,
        });
        
        const serializedSeller = JSON.parse(JSON.stringify(seller, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(serializedSeller);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao criar vendedor" });
    }
}

/**
 * @openapi
 * /sellers/{id}:
 *   put:
 *     summary: Atualizar vendedor
 *     tags:
 *       - Sellers
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
 *                 $ref: '#/components/schemas/Sellers'
 *     responses:
 *       200:
 *         description: Atualizado
 */
export const updateSeller = async (req: any, res: Response) => {
    try {
        const { data } = req.body;
        const requester = req.user;
        const targetId = Number(req.params.id);

        if (!requester || !['admin', 'head', 'coord'].includes(requester.type)) {
            return res.status(403).json({ error: "Acesso negado" });
        }

        // Validação de escopo para Head
        if (requester.type === 'head') {
            const target = await prisma.sellers.findUnique({ where: { id: targetId } });
            if (!target || target.head_id?.toString() !== requester.id.toString()) {
                return res.status(403).json({ error: "Você só pode editar vendedores da sua equipe" });
            }
            delete data.type; // Head não pode mudar cargo
            data.head_id = BigInt(requester.id); // Garante vínculo
        }
        
        // Coordenador (coord) não tem travas de re-atribuição de cargo ou vínculo para os usuários que vê

        const seller = await prisma.sellers.update({
            where: {
                id: targetId,
            },
            data: data,
        });

        const serializedSeller = JSON.parse(JSON.stringify(seller, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(serializedSeller);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao atualizar vendedor" });
    }
}

/**
 * @openapi
 * /sellers/{id}:
 *   delete:
 *     summary: Deletar vendedor
 *     tags:
 *       - Sellers
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
export const deleteSeller = async (req: any, res: Response) => {
    try {
        const requester = req.user;
        const targetId = Number(req.params.id);

        if (!requester || !['admin', 'head', 'coord'].includes(requester.type)) {
            return res.status(403).json({ error: "Acesso negado" });
        }

        // Validação de escopo para Head
        if (requester.type === 'head') {
            const target = await prisma.sellers.findUnique({ where: { id: targetId } });
            if (!target || target.head_id?.toString() !== requester.id.toString()) {
                return res.status(403).json({ error: "Você só pode excluir vendedores da sua equipe" });
            }
        }

        const seller = await prisma.sellers.delete({
            where: {
                id: targetId,
            },
        });

        const serializedSeller = JSON.parse(JSON.stringify(seller, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json(serializedSeller);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao excluir vendedor" });
    }
}