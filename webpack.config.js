const path = require('path');

const backgroundEntries = ['./src/typescript/background.ts'];

if ('test' == process.env.NODE_ENV) {
    backgroundEntries.push('./tests/webdriver/browser-instruction-receiver.ts');
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
        entry: [
            './node_modules/jquery/dist/jquery.min.js',
            './node_modules/materialize-css/dist/js/materialize.min.js',
            './src/typescript/ui.ts'
        ],
        output: {
            filename: 'ui.js',
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