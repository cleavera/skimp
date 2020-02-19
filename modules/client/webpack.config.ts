import { resolve } from 'path';
import { Configuration } from 'webpack';

const config: Configuration = {
    entry: {
        main: resolve(__dirname, './src/index.ts')
    },

    output: {
        path: resolve(__dirname, './dist'),
        filename: 'index.js',
        libraryTarget: 'commonjs'
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    'ts-loader'
                ]

            }
        ]
    },

    target: 'web',
    externals: /^@(?:angular|skimp)\//,

    resolve: {
        modules: [
            'node_modules'
        ],
        extensions: ['.ts', '.js']
    },

    mode: 'production'
};

export = config;
