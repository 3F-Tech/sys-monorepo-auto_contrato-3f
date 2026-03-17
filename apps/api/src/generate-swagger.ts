import { specs } from './swagger.config';
import fs from 'fs';
import path from 'path';

const outputPath = path.resolve(process.cwd(), 'swagger.json');

fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));
console.log(`✅ Swagger JSON gerado em: ${outputPath}`);
