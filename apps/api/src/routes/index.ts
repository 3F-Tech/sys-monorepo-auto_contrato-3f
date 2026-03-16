import { Router } from 'express';
import { checkHealth } from '../controllers/healthController';
import { getSellers, getSellerById, createSeller, updateSeller, deleteSeller, getSellerByEmail, login } from '../controllers/sellerController';
import { getBusiness, getBusinessById, createBusiness, updateBusiness, deleteBusiness } from '../controllers/businessController';
import {
    submitImpulsePlano1,
    submitImpulsePlano2,
    submitSeedPlano1,
    submitSeedPlano2,
    submitSeedGrowth
} from '../controllers/contractSheetsController';
import { getSellerBusinessBySeller, getSellerBusinessByBusiness, updateSellerBusiness } from '../controllers/sellerBussinessController';
import { authMiddleware } from '../middleware/authMiddleware';
import { getContracts, getContractBySellerId, getContractByBuId, getContractByHeadId, createContract, updateContract, deleteContract } from '../controllers/contractController';

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

// CONTRACT ROUTES
router.get('/contracts', getContracts);
router.get('/contracts/seller/:id', getContractBySellerId);
router.get('/contracts/bu/:id', getContractByBuId);
router.get('/contracts/head/:id', getContractByHeadId);
router.post('/contracts', createContract);
router.put('/contracts/:id', updateContract);
router.delete('/contracts/:id', deleteContract);

// AUTH ROUTES
// (A rota de login foi movida para o topo das Rotas Públicas)

export default router;
