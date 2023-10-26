
'use strict';

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @typedef {import('esbuild-loader').LoaderOptions} LoaderOptions **/

const path = require('path');
const webpack = require('webpack');
const { EsbuildPlugin } = require('esbuild-loader');

//#region rules
const rules = [
    {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
            {
                loader: 'esbuild-loader',
                /** @type LoaderOptions **/
                options: {
                    tsconfig: './tsconfig.json',
                    target: 'es2020',
                },
            },
        ],
    },
];

//#endregion

/** @type WebpackConfig */
const webExtensionConfig = {
    name: 'web',
    mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
    target: 'webworker', // extensions run in a webworker context
    entry: {
        webMain: './src/web/main.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, './dist/web'),
        libraryTarget: 'commonjs',
        devtoolModuleFilenameTemplate: '../../[resource-path]',
    },
    resolve: {
        mainFields: ['browser', 'module', 'main'], // look for `browser` entry point in imported node modules
        extensions: ['.ts', '.js'], // support ts-files and js-files
        alias: {
            // provides alternate implementation for node module and source files
        },
    },
    watchOptions: {
        ignored: '**/dist',
    },
    module: {
        rules: rules,
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1, // disable chunks by default since web extensions must be a single bundle
        }),
    ],
    performance: {
        hints: false,
    },
    devtool: 'nosources-source-map', // create a source map that points to the original source file
    infrastructureLogging: {
        level: 'log', // enables logging required for problem matchers
    },
    stats: {
        errorDetails: true,
    },
    optimization: {
        usedExports: process.env.production === 'true' ? true : false,
        minimizer: [
            new EsbuildPlugin({
                treeShaking: process.env.production === 'true' ? true : false,
                minify: process.env.production === 'true' ? true : false,
                target: 'es2020',
            }),
        ],
    },
};

/** @type WebpackConfig */
const desktopExtensionConfig = {
    name: 'desktop',
    target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

    entry: {
        desktopMain: './src/desktop/main.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    },

    output: {
        // the bundle is stored in the 'dist/desktop' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, 'dist/desktop'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../../[resource-path]',
    },
    resolve: {
        mainFields: ['module', 'main'], // look for `browser` entry point in imported node modules
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.ts', '.js'],
    },
    watchOptions: {
        ignored: '**/dist',
    },
    module: {
        rules: rules,
    },
    devtool: 'nosources-source-map',
    infrastructureLogging: {
        level: 'log', // enables logging required for problem matchers
    },
    stats: {
        errorDetails: true,
    },
    optimization: {
        usedExports: process.env.production === 'true' ? true : false,
        minimizer: [
            new EsbuildPlugin({
                treeShaking: process.env.production === 'true' ? true : false,
                minify: process.env.production === 'true' ? true : false,
                target: 'es2020',
            }),
        ],
    },
};
module.exports = [webExtensionConfig, desktopExtensionConfig];
