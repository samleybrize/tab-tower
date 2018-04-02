const path = require('path');

function getJqueryPath() {
    return ('test' == process.env.NODE_ENV) ? './node_modules/jquery/dist/jquery.js' : './node_modules/jquery/dist/jquery.min.js';
}

function getMaterializePath() {
    return ('test' == process.env.NODE_ENV) ? './node_modules/materialize-css/dist/js/materialize.js' : './node_modules/materialize-css/dist/js/materialize.min.js';
}

const backgroundEntries = ['./src/typescript/background/background.ts'];
const controlCenterDesktopEntries = [
    getJqueryPath(),
    getMaterializePath(),
    './src/typescript/view/control-center-desktop.ts',
];

if ('test' == process.env.NODE_ENV) {
    backgroundEntries.unshift('./tests/utils/declare-test-environment.ts');
    controlCenterDesktopEntries.unshift('./tests/utils/declare-test-environment.ts');

    backgroundEntries.push('./tests/utils/browser-instruction-receiver.ts');
    controlCenterDesktopEntries.push('./tests/utils/test-tab-opener.ts');
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
        entry: controlCenterDesktopEntries,
        output: {
            filename: 'control-center-desktop.js',
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
        entry: './src/typescript/view/browser-action.ts',
        output: {
            filename: 'browser-action.js',
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