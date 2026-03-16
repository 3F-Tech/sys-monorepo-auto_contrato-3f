import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginZod } from '@kubb/plugin-zod';
import { pluginClient } from '@kubb/plugin-client';

export default defineConfig({
    root: '.',
    input: {
        path: './apps/api/swagger.json',
    },
    output: {
        path: './apps/web/src/gen',
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