import * as archiver from 'archiver';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

const rootPath = path.join(__dirname, '../..');
const exportPath = path.join(os.tmpdir(), 'tab-tower-build');
const relativePathToIncludeList = [
    'dist/css',
    'dist/js',
    'icons',
    'ui',
    'manifest.json',
];

if ('test' == process.env.NODE_ENV) {
    relativePathToIncludeList.push('tests/resources');
}

function log(message: string) {
    const dateStart = new Date().toISOString();
    console.info(`[${dateStart}] ${message}`);
}

function exportProjectFiles() {
    if (fs.existsSync(exportPath)) {
        fs.removeSync(exportPath);
    }

    fs.mkdirSync(exportPath);

    for (const relativePathToInclude of relativePathToIncludeList) {
        fs.copySync(
            path.join(rootPath, relativePathToInclude),
            path.join(exportPath, relativePathToInclude),
            {dereference: true},
        );
    }
}

async function buildFirefoxExtension() {
    let outputFile = path.join(rootPath, 'dist/tab-tower.xpi');

    if ('test' == process.env.NODE_ENV) {
        outputFile = path.join(rootPath, 'dist/tab-tower-test.xpi');
    }

    log('Building firefox extension...');
    const outputStream = fs.createWriteStream(outputFile);

    const archive = archiver('zip', {
        zlib: { level: 9 },
    });
    archive.on('error', (error) => {
        throw error;
    });
    archive.on('warning', (error) => {
        throw error;
    });
    archive.pipe(outputStream);

    for (const relativePathToInclude of relativePathToIncludeList) {
        const absolutePath = path.join(exportPath, relativePathToInclude);
        const stat = fs.statSync(absolutePath);

        if (stat.isDirectory()) {
            archive.directory(absolutePath, relativePathToInclude);
        } else {
            archive.file(absolutePath, {name: relativePathToInclude});
        }

        log(`  Add "${relativePathToInclude}"`);
    }

    await archive.finalize();
    log(`Successfully builded firefox extension at "${outputFile}"`);
}

exportProjectFiles();
buildFirefoxExtension().then(() => {
    fs.removeSync(exportPath);
});
