const path = require('path');

const backgroundEntries = ['./src/typescript/background/background.ts'];
const uiSmallEntries = ['./src/typescript/view/ui-small-main.ts'];

if ('test' == process.env.NODE_ENV) {
    backgroundEntries.unshift('./tests/utils/declare-test-environment.ts');
    backgroundEntries.push('./tests/utils/browser-instruction-receiver.ts');

    uiSmallEntries.unshift('./tests/utils/declare-test-environment.ts');
}

module.exports = [
    {
        entry: backgroundEntries,
        output: {
            filename: 'background.js',
            path: path.resolve(__dirname, 'dist/js'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        devtool: 'sourcemap',
        mode: 'development',
        module: {
            rules: [
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
        entry: uiSmallEntries,
        output: {
            filename: 'ui-small.js',
            path: path.resolve(__dirname, 'dist/js'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        devtool: 'sourcemap',
        mode: 'development',
        module: {
            rules: [
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
        entry: './src/typescript/view/ui-settings-main.ts',
        output: {
            filename: 'ui-settings.js',
            path: path.resolve(__dirname, 'dist/js'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        devtool: 'sourcemap',
        mode: 'development',
        module: {
            rules: [
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