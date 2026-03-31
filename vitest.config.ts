import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', 'dist'],
        coverage: {
            enabled: true,
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: 'coverage',
            exclude: [
                'node_modules/',
                'tests/',
                'dist/',
                '.next/',
                '**/*.config.ts',
                '**/*.d.ts',
                '**/*.{test,spec}.{ts,tsx}',
                '**/__tests__/**',
                'postcss.config.mjs',
                'src/mock-data.ts',

            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
