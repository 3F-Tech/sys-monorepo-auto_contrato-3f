import { Router } from 'express';
import { checkHealth } from '../controllers/healthController';
import { getSellers, getSellerById, createSeller, updateSeller, deleteSeller, getSellerByEmail, login } from '../controllers/sellerController';
import { getBusiness, getBusinessById, createBusiness, updateBusiness, deleteBusiness } from '../controllers/businessController';
import {
    submitImpulsePlano1,
    submitImpulsePlano2,
    submitSeedPlano1,
    submitSeedPlano2,
    submitSeedGrowth,
    submitBommaAssessoria,
    submitBommaConsultoria,
    submitBommaAssessoriaSocialIlimitado,
    submitBommaAssessoriaSocialArtes,
    submitBommaAssessoriaSocialDeterminada,
    submitBommaAssessoriaSocialVideos,
    submitBommaSocialIlimitado,
    submitBommaSocialDeterminada
} from '../controllers/contractAutomationController';
import { getSellerBusinessBySeller, getSellerBusinessByBusiness, updateSellerBusiness } from '../controllers/sellerBussinessController';
import { authMiddleware } from '../middleware/authMiddleware';
import { getContracts, getContractBySellerId, getContractByBuId, getContractByHeadId, createContract, updateContract, deleteContract } from '../controllers/contractController';
import { getGoals, createOrUpdateGoal, deleteGoal } from '../controllers/goalController';
import { getTeams, createTeam, updateTeam, addTeamMember, removeTeamMember, deleteTeam } from '../controllers/teamController';
import { getCac, upsertCac } from '../controllers/cacController';
import { getCommercialCosts, upsertCommercialCosts } from '../controllers/commercialCostsController';

const router = Router();

router.get('/health', checkHealth);

// Rotas Públicas
router.post('/login', login);

// Middleware de Autenticação (Afeta tudo abaixo)
router.use(authMiddleware);

// SELLER ROUTES
router.get('/sellers', getSellers);
router.get('/sellers/:id', getSellerById);
router.post('/sellers', createSeller);
router.put('/sellers/:id', updateSeller);
router.delete('/sellers/:id', deleteSeller);
router.get('/sellers/email/:email', getSellerByEmail);

// BUSINESS ROUTES
router.get('/business', getBusiness);
router.get('/business/:id', getBusinessById);
router.post('/business', createBusiness);
router.put('/business/:id', updateBusiness);
router.delete('/business/:id', deleteBusiness);

// SELLER BUSINESS ROUTES
router.get('/seller-business', getSellerBusinessBySeller);
router.get('/seller-business/:id', getSellerBusinessByBusiness);
router.put('/seller-business', updateSellerBusiness);

// CONTRACT SHEETS ROUTES
router.post('/contracts-sheets/impulse-plano-1', submitImpulsePlano1);
router.post('/contracts-sheets/impulse-plano-2', submitImpulsePlano2);
router.post('/contracts-sheets/seed-plano-1', submitSeedPlano1);
router.post('/contracts-sheets/seed-plano-2', submitSeedPlano2);
router.post('/contracts-sheets/seed-plano-growth', submitSeedGrowth);
router.post('/contracts-sheets/bomma-assessoria', submitBommaAssessoria);
router.post('/contracts-sheets/bomma-consultoria', submitBommaConsultoria);
router.post('/contracts-sheets/bomma-assessoria-social-ilimitado', submitBommaAssessoriaSocialIlimitado);
router.post('/contracts-sheets/bomma-assessoria-social-artes', submitBommaAssessoriaSocialArtes);
router.post('/contracts-sheets/bomma-assessoria-social-determinada', submitBommaAssessoriaSocialDeterminada);
router.post('/contracts-sheets/bomma-assessoria-social-videos', submitBommaAssessoriaSocialVideos);
router.post('/contracts-sheets/bomma-social-ilimitado', submitBommaSocialIlimitado);
router.post('/contracts-sheets/bomma-social-determinada', submitBommaSocialDeterminada);

// CONTRACT ROUTES
router.get('/contracts', getContracts);
router.get('/contracts/seller/:id', getContractBySellerId);
router.get('/contracts/bu/:id', getContractByBuId);
router.get('/contracts/head/:id', getContractByHeadId);
router.post('/contracts', createContract);
router.put('/contracts/:id', updateContract);
router.delete('/contracts/:id', deleteContract);

// GOAL ROUTES
router.get('/goals', getGoals);
router.post('/goals', createOrUpdateGoal);
router.delete('/goals/:id', deleteGoal);

// TEAM ROUTES
router.get('/teams', getTeams);
router.post('/teams', createTeam);
router.put('/teams/:id', updateTeam);
router.post('/teams/:id/members', addTeamMember);
router.delete('/teams/:id/members/:sellerId', removeTeamMember);
router.delete('/teams/:id', deleteTeam);

// CAC ROUTES
router.get('/cac', getCac);
router.post('/cac', upsertCac);

// COMMERCIAL COSTS ROUTES
router.get('/commercial-costs', getCommercialCosts);
router.post('/commercial-costs', upsertCommercialCosts);

// AUTH ROUTES
// (A rota de login foi movida para o topo das Rotas Públicas)

export default router;
