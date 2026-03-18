
import { GoogleDriveService } from './services/googleDriveService';
import { GoogleDocsService } from './services/googleDocsService';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'c:/Projects/automacao_contratos/apps/api/.env' });

async function testAutomation() {
    const modelId = '1spS9qELVjiyJ9mnmXAHu1denp0-15yAaiZetlDj2sME';
    const destinationFolderId = '1E2zHJstMemuUhvB-9u7AY83ioYy8Ic3H';
    const fileName = 'TESTE AUTOMAÇÃO PLANO 2 - ANTIGRAVITY';

    try {
        console.log('🚀 Iniciando teste de automação...');
        
        // 1. Copiar modelo
        console.log('1. Copiando modelo...');
        const newFile = await GoogleDriveService.copyFile(modelId, destinationFolderId, fileName);
        if (!newFile || !newFile.id) throw new Error('Falha ao copiar arquivo');
        console.log(`✅ Arquivo copiado com ID: ${newFile.id}`);

        // 2. Substituir variáveis
        console.log('2. Substituindo variáveis...');
        const replacements = {
            'RAZAO-SOCIAL-DO-CONTRATANTE': 'EMPRESA TESTE LTDA',
            'CNPJ-DO-CONTRATANTE': '00.000.000/0001-00',
            'NOME-DO-REPRESENTANTE': 'REPRESENTANTE TESTE',
            'VALOR-MENSALIDADE': 'R$ 1.500,00',
            'NOME-VENDEDOR': 'VENDEDOR TESTE',
            'NOME-COORD-BU': 'COORD TESTE'
        };

        await GoogleDocsService.replaceVariables(newFile.id, replacements);
        console.log('✅ Variáveis substituídas com sucesso!');
        console.log(`🔗 Link para revisão: https://docs.google.com/document/d/${newFile.id}/edit`);

    } catch (error: any) {
        console.error('❌ Erro no teste:', error.message);
    }
}

testAutomation();
