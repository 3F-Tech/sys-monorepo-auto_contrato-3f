import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginZod } from '@kubb/plugin-zod';
import { pluginClient } from '@kubb/plugin-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    root: __dirname,
    input: {
        path: path.resolve(__dirname, './apps/api/swagger.json'),
    },
    output: {
        path: path.resolve(__dirname, './apps/web/src/gen'),
        clean: true,
    },
    plugins: [
        pluginOas({ validate: true }),
        pluginTs({
            output: { path: 'types' },
        }),
        pluginZod({
            output: { path: 'zod' },
        }),
        pluginClient({
            output: { path: 'hooks' },
        }),
    ],
});