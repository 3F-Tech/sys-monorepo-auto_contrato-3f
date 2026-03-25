import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger.config'; 
import fs from 'fs';
import path from 'path';
import apiRoutes from './routes';

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir a documentação via Swagger UI (Antes das rotas para evitar authMiddleware)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/api-docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

// Routes
app.use('/', apiRoutes);

// Gerar o swagger.json para o Kubb ler
const swaggerJsonPath = path.join(__dirname, '../swagger.json');
fs.writeFileSync(swaggerJsonPath, JSON.stringify(specs, null, 2));

console.log(`Swagger JSON gerado em: ${swaggerJsonPath}`);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
});
