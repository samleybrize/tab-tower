const path = require('path');

function getJqueryPath() {
    return ('test' == process.env.NODE_ENV) ? './node_modules/jquery/dist/jquery.js' : './node_modules/jquery/dist/jquery.min.js';
}

function getMaterializePath() {
    return ('test' == process.env.NODE_ENV) ? './node_modules/materialize-css/dist/js/materialize.js' : './node_modules/materialize-css/dist/js/materialize.min.js';
}

const backgroundEntries = ['./src/typescript/background.ts'];
const uiEntries = [
    getJqueryPath(),
    getMaterializePath(),
    './src/typescript/ui.ts',
];

if ('test' == process.env.NODE_ENV) {
    backgroundEntries.push('./tests/utils/browser-instruction-receiver.ts');
    uiEntries.push('./tests/utils/test-tab-opener.ts');
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
        entry: uiEntries,
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