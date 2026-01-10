import { defineConfig } from 'orval';

export default defineConfig({
    votedeck: {
        output: {
            mode: 'single',
            target: 'src/lib/api/generated.ts',
            client: 'react-query',
            override: {
                mutator: {
                    path: 'src/lib/api.ts',
                    name: 'customInstance',
                },
            },
        },
        input: {
            target: 'src/lib/api-spec.json',
        },
    },
});
