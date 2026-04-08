import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

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
      where: { id: BigInt(req.params.id) },
      include: {
        seller_business: {
          include: {
            business: true,
          },
        },
      },
    });
    res.json(seller);
  } catch (error) {
    console.error("Erro ao buscar vendedor por ID:", error);
    res.status(500).json({ error: "Falha ao buscar vendedor por ID" });
  }
};

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
      where: { email: req.params.email },
      include: {
        seller_business: {
          include: {
            business: true,
          },
        },
      },
    });
    res.json(seller);
  } catch (error) {
    console.error("Erro ao buscar vendedor por email:", error);
    res.status(500).json({ error: "Falha ao buscar vendedor por email" });
  }
};

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
 *         description: Filtrar por tipo de usuário (seller, sdr, head, coord, admin)
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
    if (requester && requester.type !== "admin") {
      if (requester.type === "coord") {
        // Coordenador vê apenas sua própria equipe
        where.head_id = BigInt(requester.id);
      } else if (requester.type === "head") {
        // Head vê todos vinculados à BU dele
        // 1. Descobrir a BU do Head
        const headBusiness = await prisma.seller_business.findFirst({
          where: { seller_id: BigInt(requester.id) },
        });

        if (headBusiness) {
          where.seller_business = {
            some: {
              business_id: headBusiness.business_id,
            },
          };
        } else {
          // Se o head não tem BU, não vê ninguém (ou erro)
          return res.json([]);
        }
      } else {
        // Seller / SDR: a princípio só enxergam a si mesmos
        // EXCEÇÃO: Podem consultar Heads de BU e Coordenadores para UI de contratos
        // EXCEÇÃO 2: Podem consultar SDRs que pertencem à mesma equipe (mesmo head_id)
        if (type !== 'head' && type !== 'coord' && type !== 'sdr') {
          where.id = BigInt(requester.id);
        } else if (type === 'sdr') {
          // Se estiver buscando SDRs, filtra para ver apenas os da sua equipe
          const me = await prisma.sellers.findUnique({ where: { id: BigInt(requester.id) } });
          if (me && me.head_id) {
            // Caso 1: Eu tenho um líder (sou closer/sdr) e busco quem tem o mesmo líder que eu
            where.head_id = me.head_id;
          } else {
            // Caso 2: Eu sou o líder (head) de alguém (caso raro para o tipo seller)
            where.head_id = BigInt(requester.id);
          }
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
            business: true,
          },
        },
      },
    });

    // Converte BigInt para string antes de enviar para o JSON
    const serializedSellers = JSON.parse(
      JSON.stringify(sellers, (key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );

    res.json(serializedSellers);
  } catch (error: any) {
    console.error("Erro ao listar vendedores:", error);
    res.status(500).json({ error: "Falha ao buscar vendedores", details: error?.message });
  }
};

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

    const normalizedEmail = email.toLowerCase().trim();

    const seller = await prisma.sellers.findUnique({
      where: { email: normalizedEmail },
      include: {
        seller_business: true,
      },
    });

    if (!seller) {
      return res
        .status(401)
        .json({ error: "E-mail não encontrado. Verifique e tente novamente." });
    }

    const md5 = (str: string) =>
      crypto.createHash("md5").update(str).digest("hex");

    // Atualmente no banco temos casos de 1x, 2x e até 3x MD5 (devido a bugs anteriores de hashing duplo no front + back)
    // Vamos testar até 4 níveis para garantir acesso e auto-reparo.
    const h1 = md5(password);
    const h2 = md5(h1);
    const h3 = md5(h2);
    const h4 = md5(h3);

    let isCorrect = false;
    let finalHashToSave = h1; // Sempre queremos normalizar para 1x MD5
    let needsRepair = false;

    if (h1 === seller.password) {
      isCorrect = true;
    } else if (h2 === seller.password) {
      isCorrect = true;
      needsRepair = true;
    } else if (h3 === seller.password) {
      isCorrect = true;
      needsRepair = true;
    } else if (h4 === seller.password) {
      isCorrect = true;
      needsRepair = true;
    } else if (password === seller.password) {
      // Caso raríssimo de estar em texto plano
      isCorrect = true;
      needsRepair = true;
    }

    if (!isCorrect) {
      return res
        .status(401)
        .json({ error: "Senha incorreta. Tente novamente." });
    }

    // Auto-repair para normalizar o hash no banco (Sempre para 1x MD5)
    if (needsRepair) {
      await prisma.sellers.update({
        where: { id: seller.id },
        data: { password: finalHashToSave },
      });
      console.log(
        `[LOGIN] Senha auto-reparada (normalizada para 1x MD5) para o usuário: ${normalizedEmail}`,
      );
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: seller.id.toString(), email: seller.email, type: seller.type },
      JWT_SECRET,
      { expiresIn: "12h" }, // Aumentei para 12h conforme comum em sistemas internos
    );

    // Remove password before sending
    const { password: _, ...userWithoutPassword } = seller;

    // Serializa BigInt
    const userSerialized = JSON.parse(
      JSON.stringify(userWithoutPassword, (key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );

    res.json({
      user: userSerialized,
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

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

    if (!requester || !["admin", "head", "coord"].includes(requester.type)) {
      return res.status(403).json({
        error: "Acesso negado. Você não tem permissão para criar usuários.",
      });
    }

    // Validação de Nome completo
    if (data.name !== undefined) {
      const nameParts = data.name.trim().split(/\s+/);
      if (nameParts.length < 2) {
        return res.status(400).json({
          error: "Por favor, informe o nome completo (nome e sobrenome).",
        });
      }
    }

    // Validação de CPF
    if (data.cpf) {
      const cpfClean = data.cpf.replace(/\D/g, "");
      if (cpfClean.length !== 11) {
        return res
          .status(400)
          .json({ error: "CPF incompleto. O CPF deve ter 11 dígitos." });
      }
      data.cpf = cpfClean;
    }

    // Hashing password and normalizing email
    if (data.password) {
      data.password = crypto
        .createHash("md5")
        .update(data.password)
        .digest("hex");
    }
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
    }

    // Verificar se CPF já existe
    if (data.cpf) {
      const existingCpf = await prisma.sellers.findFirst({
        where: { cpf: data.cpf },
      });
      if (existingCpf) {
        return res
          .status(400)
          .json({ error: "Este CPF já está cadastrado no sistema." });
      }
    }

    // Verificar se email já existe
    if (data.email) {
      const existingEmail = await prisma.sellers.findFirst({
        where: { email: data.email },
      });
      if (existingEmail) {
        return res
          .status(400)
          .json({ error: "Este e-mail já está cadastrado no sistema." });
      }
    }

    // Restrições específicas para Coordenador de Equipe (Head agora é livre para usuários da BU)
    if (requester.type === "coord") {
      if (data.type !== "sdr") data.type = "seller"; // Coord só cria seller ou sdr
      data.head_id = BigInt(requester.id); // Vendedor vinculado ao coord
    }

    const seller = await prisma.sellers.create({
      data: data,
    });

    const serializedSeller = JSON.parse(
      JSON.stringify(seller, (key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );

    res.json(serializedSeller);
  } catch (error) {
    console.error("Erro ao criar vendedor:", error);
    res.status(500).json({ error: "Falha ao criar vendedor" });
  }
};

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
    const targetId = BigInt(req.params.id);

    if (!requester) {
      return res.status(403).json({
        error: "Acesso negado. Você não tem permissão para editar usuários.",
      });
    }

    // Sellers podem editar apenas a si mesmos
    const isSelfEdit = targetId.toString() === requester.id.toString();

    // Se não for admin/head/coord, só pode editar o próprio perfil
    if (!["admin", "head", "coord"].includes(requester.type)) {
      if (!isSelfEdit) {
        return res.status(403).json({
          error:
            "Acesso negado. Você não tem permissão para editar outros usuários.",
        });
      }
    }

    // Validação de escopo para Coordenador
    if (requester.type === "coord") {
      const target = await prisma.sellers.findUnique({
        where: { id: targetId },
      });

      // Coordenador pode editar ele mesmo
      const isSelfEdit = targetId.toString() === requester.id.toString();

      // Verifica se o vendedor pertence à equipe do Coordenador (ou se é ele mesmo)
      if (
        !target ||
        (!isSelfEdit && target.head_id?.toString() !== requester.id.toString())
      ) {
        return res.status(403).json({
          error: "Acesso negado. Você só pode editar vendedores da sua equipe.",
        });
      }

      // Se for auto-edição, não aplicar as restrições de cargo/vínculo
      if (!isSelfEdit) {
        // Coord não pode mudar cargo nesse fluxo, a menos que seja seller <-> sdr?
        // Para simplificar, vamos manter a trava mas permitir sdr se o alvo for da equipe.
        // Atualmente o head_id trava o escopo.
        delete data.type; // Segurança: Coord não pode mudar cargo nesse fluxo

        // Lógica de Vínculo:
        // 1. Se head_id for enviado como null ou "null" -> Desassociar
        if (data.head_id === null || data.head_id === "null") {
          data.head_id = null;
        }
        // 2. Se head_id for enviado com valor (tentativa de reatribuição) -> Força o próprio Coord
        else if (data.head_id !== undefined) {
          data.head_id = BigInt(requester.id);
        }
        // 3. Se head_id não for enviado -> Não altera o vínculo
      }
    }

    // Head de BU (head) não tem travas de re-atribuição de cargo ou vínculo para os usuários que vê

    // Validação de Nome completo
    if (data.name !== undefined) {
      const nameParts = data.name.trim().split(/\s+/);
      if (nameParts.length < 2) {
        return res.status(400).json({
          error: "Por favor, informe o nome completo (nome e sobrenome).",
        });
      }
    }

    // Validação de CPF
    if (data.cpf) {
      const cpfClean = data.cpf.replace(/\D/g, "");
      if (cpfClean.length !== 11) {
        return res
          .status(400)
          .json({ error: "CPF incompleto. O CPF deve ter 11 dígitos." });
      }
      data.cpf = cpfClean;
    }

    // Hashing password if provided and normalizing email
    if (data.password) {
      data.password = crypto
        .createHash("md5")
        .update(data.password)
        .digest("hex");
    }
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
    }

    const seller = await prisma.sellers.update({
      where: {
        id: targetId,
      },
      data: data,
    });

    const serializedSeller = JSON.parse(
      JSON.stringify(seller, (key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );

    res.json(serializedSeller);
  } catch (error) {
    console.error("Erro ao atualizar vendedor:", error);
    res.status(500).json({ error: "Falha ao atualizar vendedor" });
  }
};

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
    const targetId = BigInt(req.params.id);

    if (!requester || !["admin", "head", "coord"].includes(requester.type)) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // Validação de escopo para Coordenador
    if (requester.type === "coord") {
      const target = await prisma.sellers.findUnique({
        where: { id: targetId },
      });
      if (!target || target.head_id?.toString() !== requester.id.toString()) {
        return res
          .status(403)
          .json({ error: "Você só pode excluir vendedores da sua equipe" });
      }
    }

    const seller = await prisma.sellers.delete({
      where: {
        id: targetId,
      },
    });

    const serializedSeller = JSON.parse(
      JSON.stringify(seller, (key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );

    res.json(serializedSeller);
  } catch (error: any) {
    console.error("Erro ao excluir vendedor:", error);
    res.status(500).json({
      error: "Falha ao excluir vendedor",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
