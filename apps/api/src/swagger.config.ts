import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Automação de Contratos',
            version: '1.0.0',
            description: 'Documentação da API',
        },
        servers: [{ url: 'http://localhost:3007' }],
        components: {
            schemas: {
                Business: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string', nullable: true },
                        cnpj: { type: 'string', nullable: true },
                        color: { type: 'string', nullable: true },
                        img_base64: { type: 'string', nullable: true },
                        created_at: { type: 'string', format: 'date-time', nullable: true },
                        update_at: { type: 'string', format: 'date-time', nullable: true },
                    },
                },
                Sellers: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'BigInt serializado' },
                        name: { type: 'string', nullable: true },
                        cpf: { type: 'string', nullable: true },
                        email: { type: 'string', nullable: true },
                        phone: { type: 'string', nullable: true },
                        type: { type: 'string' },
                        head_id: { type: 'string', nullable: true, description: 'BigInt serializado' },
                        team_id: { type: 'integer', nullable: true },
                        created_at: { type: 'string', format: 'date-time', nullable: true },
                        update_at: { type: 'string', format: 'date-time', nullable: true },
                    },
                },
                SellerBusiness: {
                    type: 'object',
                    properties: {
                        seller_id: { type: 'string', description: 'BigInt serializado' },
                        business_id: { type: 'integer' },
                        created_at: { type: 'string', format: 'date-time' },
                    },
                },
                Contracts: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'BigInt serializado' },
                        title: { type: 'string', nullable: true },
                        link: { type: 'string', nullable: true },
                        cnpj_client: { type: 'string', nullable: true },
                        seller_id: { type: 'string', description: 'BigInt serializado' },
                        bu_id: { type: 'integer' },
                        monthly_fee: { type: 'string', description: 'Decimal', nullable: true },
                        implementation_fee: { type: 'string', description: 'Decimal', nullable: true },
                        contractual_term: { type: 'integer', nullable: true },
                        due_date: { type: 'string', format: 'date-time', nullable: true },
                        type_contract: { type: 'string', nullable: true },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                        signed: { type: 'boolean' },
                        change_status: { type: 'string', nullable: true },
                        change_description: { type: 'string', nullable: true },
                        signed_date: { type: 'string', format: 'date-time', nullable: true },
                        first_payment_date: { type: 'string', format: 'date-time', nullable: true },
                        first_payment_amount: { type: 'string', description: 'Decimal', nullable: true },
                        document_id: { type: 'string', nullable: true },
                        sdr_id: { type: 'string', description: 'BigInt serializado', nullable: true },
                        envelope_id: { type: 'string', nullable: true },
                        signed_count: { type: 'integer', nullable: true },
                        total_signers: { type: 'integer', nullable: true },
                        canceled_at: { type: 'string', format: 'date-time', nullable: true },
                        approved: { type: 'boolean', nullable: true },
                        approved_at: { type: 'string', format: 'date-time', nullable: true },
                        type_of_negociation: { type: 'string', nullable: true },
                        first_quant: { type: 'string', description: 'BigInt serializado', nullable: true },
                        first_value: { type: 'number', nullable: true },
                        last_quant: { type: 'string', description: 'BigInt serializado', nullable: true },
                        last_value: { type: 'number', nullable: true },
                        tcv: { type: 'string', description: 'Decimal', nullable: true },
                    },
                },
                ContractData: {
                    type: 'object',
                    additionalProperties: {
                        type: 'string',
                    },
                    description: 'Objeto dinâmico contendo os dados do formulário do contrato',
                },
                Goal: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        target_type: { type: 'string', enum: ['seller', 'head', 'team', 'bu'] },
                        target_id: { type: 'string', description: 'BigInt serializado' },
                        p1: { type: 'string', nullable: true, description: 'Decimal' },
                        tcv: { type: 'string', nullable: true, description: 'Decimal' },
                        nmrr: { type: 'string', nullable: true, description: 'Decimal' },
                        implementation: { type: 'string', nullable: true, description: 'Decimal' },
                        monthly: { type: 'string', nullable: true, description: 'Decimal' },
                        month: { type: 'integer' },
                        year: { type: 'integer' },
                        created_by: { type: 'string', description: 'BigInt serializado' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                BuCac: {
                    type: 'object',
                    properties: {
                        bu_id: { type: 'integer' },
                        bu_name: { type: 'string' },
                        amount: { type: 'number' },
                        is_inherited: { type: 'boolean' },
                        month: { type: 'integer' },
                        year: { type: 'integer' },
                    },
                },
            },
        },
    },
    // Scaneia rotas e controladores para encontrar os JSDocs @openapi
    apis: [
        path.join(__dirname, './routes/*.ts'),
        path.join(__dirname, './controllers/*.ts'),
        path.join(__dirname, './index.ts'),
    ],
};

export const specs = swaggerJsdoc(options);