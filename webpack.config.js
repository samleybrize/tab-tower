const path = require('path');
  
module.exports = [
    {
        entry: './src/typescript/background.ts',
        output: {
            filename: 'background.js',
            path: path.resolve(__dirname, 'dist/js'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        devtool: 'sourcemap',
        module: {
            loaders: [
                {
                    test: /\.tsx?$/,
                    loader: 'awesome-typescript-loader',
                    options: {
                        configFileName: 'tsconfig.json',
                    },
                }
            ],
        },
    },
    {
        entry: './src/typescript/tab-tower.ts',
        output: {
            filename: 'tab-tower.js',
            path: path.resolve(__dirname, 'dist/js'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        devtool: 'sourcemap',
        module: {
            loaders: [
                {
                    test: /\.tsx?$/,
                    loader: 'awesome-typescript-loader',
                    options: {
                        configFileName: 'tsconfig.json',
                    },
                }
            ],
        },
    }
];