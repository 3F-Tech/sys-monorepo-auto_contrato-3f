export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Minha API Monorepo',
            version: '1.0.0',
        },
        servers: [{ url: 'http://localhost:3007' }],
    },
    apis: ['./src/routes/*.ts'], // Onde o swagger vai procurar os comentários JSDoc
};