const fsExtra = require('fs-extra');
const path = require('path');

const rootPath = path.join(__dirname, '..');
const distPath = path.join(rootPath, 'dist');

fsExtra.removeSync(distPath);
