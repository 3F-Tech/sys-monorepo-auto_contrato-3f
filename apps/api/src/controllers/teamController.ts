import { Request, Response } from "express";
import { prisma } from "../prisma";

/**
 * @openapi
 * /teams:
 *   get:
 *     summary: Listar equipes (Coordenador vê apenas as dele, Admin vê todas)
 *     tags:
 *       - Teams
 */
export const getTeams = async (req: any, res: Response) => {
  try {
    const requester = req.user;
    const where: any = {};

    if (requester.type === "head" || requester.type === "coord") {
      where.head_id = BigInt(requester.id);
    } else if (requester.type === "seller") {
      const seller = await prisma.sellers.findUnique({
        where: { id: BigInt(requester.id) },
        select: { team_id: true },
      });
      if (seller?.team_id) {
        where.id = seller.team_id;
      } else {
        return res.json([]);
      }
    }

    const teams = await prisma.teams.findMany({
      where,
      include: {
        sellers_sellers_team_idToteams: true,
      },
    });

    const serialized = JSON.parse(
      JSON.stringify(teams, (key, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );

    res.json(serialized);
  } catch (error) {
    console.error("Erro ao listar equipes:", error);
    res.status(500).json({ error: "Falha ao buscar equipes" });
  }
};

/**
 * @openapi
 * /teams:
 *   post:
 *     summary: Criar nova equipe
 *     tags:
 *       - Teams
 */
export const createTeam = async (req: any, res: Response) => {
  try {
    const { name, photo_url, description } = req.body;
    const requester = req.user;

    if (!["admin", "head", "coord"].includes(requester.type)) {
      return res.status(403).json({
        error: "Acesso negado. Você não tem permissão para criar equipes.",
      });
    }

    const team = await prisma.teams.create({
      data: {
        name,
        photo_url,
        description,
        head_id: BigInt(requester.id),
      },
    });

    res
      .status(201)
      .json(
        JSON.parse(
          JSON.stringify(team, (k, v) =>
            typeof v === "bigint" ? v.toString() : v,
          ),
        ),
      );
  } catch (error) {
    console.error("Erro ao criar equipe:", error);
    res.status(500).json({ error: "Falha ao criar equipe" });
  }
};

/**
 * @openapi
 * /teams/{id}:
 *   put:
 *     summary: Atualizar equipe (Nome, foto, descrição)
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
export const updateTeam = async (req: any, res: Response) => {
  try {
    const { name, photo_url, description } = req.body;
    const requester = req.user;
    const teamId = parseInt(req.params.id);

    const team = await prisma.teams.findUnique({ where: { id: teamId } });
    if (
      !team ||
      (["head", "coord"].includes(requester.type) &&
        team.head_id?.toString() !== requester.id.toString())
    ) {
      return res.status(403).json({
        error: "Acesso negado. Você não tem permissão para editar esta equipe.",
      });
    }

    const updated = await prisma.teams.update({
      where: { id: teamId },
      data: { name, photo_url, description },
    });

    res.json(
      JSON.parse(
        JSON.stringify(updated, (k, v) =>
          typeof v === "bigint" ? v.toString() : v,
        ),
      ),
    );
  } catch (error) {
    console.error("Erro ao atualizar equipe:", error);
    res.status(500).json({ error: "Falha ao atualizar equipe" });
  }
};

/**
 * @openapi
 * /teams/{id}/members:
 *   post:
 *     summary: Adicionar vendedor à equipe
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
export const addTeamMember = async (req: any, res: Response) => {
  try {
    const { sellerId } = req.body;
    const teamId = parseInt(req.params.id);
    const requester = req.user;

    const team = await prisma.teams.findUnique({ where: { id: teamId } });
    if (
      !team ||
      (["head", "coord"].includes(requester.type) &&
        team.head_id?.toString() !== requester.id.toString())
    ) {
      return res.status(403).json({
        error:
          "Acesso negado. Você não tem permissão para adicionar membros a esta equipe.",
      });
    }

    if (requester.type === "coord") {
      const seller = await prisma.sellers.findUnique({
        where: { id: BigInt(sellerId) },
        select: { head_id: true },
      });
      if (seller?.head_id?.toString() !== requester.id.toString()) {
        return res.status(403).json({
          error:
            "Acesso negado. Este vendedor não pertence à sua hierarquia.",
        });
      }
    }

    await prisma.sellers.update({
      where: { id: BigInt(sellerId) },
      data: { team_id: teamId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao adicionar membro:", error);
    res.status(500).json({ error: "Falha ao adicionar membro" });
  }
};

/**
 * @openapi
 * /teams/{id}/members/{sellerId}:
 *   delete:
 *     summary: Remover vendedor da equipe
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 */
export const removeTeamMember = async (req: any, res: Response) => {
  try {
    const teamId = parseInt(req.params.id);
    const sellerId = BigInt(req.params.sellerId);
    const requester = req.user;

    const team = await prisma.teams.findUnique({ where: { id: teamId } });
    if (
      !team ||
      (["head", "coord"].includes(requester.type) &&
        team.head_id?.toString() !== requester.id.toString())
    ) {
      return res.status(403).json({
        error:
          "Acesso negado. Você não tem permissão para remover membros desta equipe.",
      });
    }

    await prisma.sellers.update({
      where: { id: sellerId },
      data: { team_id: null },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    res.status(500).json({ error: "Falha ao remover membro" });
  }
};

/**
 * @openapi
 * /teams/{id}:
 *   delete:
 *     summary: Deletar equipe
 *     tags:
 *       - Teams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
export const deleteTeam = async (req: any, res: Response) => {
  try {
    const teamId = parseInt(req.params.id);
    const requester = req.user;

    const team = await prisma.teams.findUnique({ where: { id: teamId } });
    if (
      !team ||
      (["head", "coord"].includes(requester.type) &&
        team.head_id?.toString() !== requester.id.toString())
    ) {
      return res.status(403).json({
        error:
          "Acesso negado. Você não tem permissão para excluir esta equipe.",
      });
    }

    // Antes de deletar, limpa os vínculos
    await prisma.sellers.updateMany({
      where: { team_id: teamId },
      data: { team_id: null },
    });

    await prisma.teams.delete({ where: { id: teamId } });
    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar equipe:", error);
    res.status(500).json({ error: "Falha ao deletar equipe" });
  }
};
