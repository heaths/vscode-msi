//@ts-check

'use strict';

const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const wasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
    target: 'node',
    mode: 'none',
    entry: './src/extension.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2'
    },
    externals: {
        vscode: 'commonjs vscode'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            }
        ]
    },
    plugins: [
        new htmlWebpackPlugin({
            template: path.resolve(__dirname, "src/index.html")
        }),
        new wasmPackPlugin({
            crateDirectory: path.resolve(__dirname, "crates/msi-wasm"),
            outDir: path.resolve(__dirname, 'pkg')
        })
    ],
    devtool: 'nosources-source-map',
    infrastructureLogging: {
        level: "log",
    },
    experiments: {
        asyncWebAssembly: true
    }
};
module.exports = [extensionConfig];
