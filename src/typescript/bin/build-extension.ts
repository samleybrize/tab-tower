import * as archiver from 'archiver';
import * as childProcessPromise from 'child-process-promise';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as semver from 'semver';

const isTestEnv = 'test' == process.env.NODE_ENV;
const rootPath = path.join(__dirname, '../..');
const exportPath = path.join(os.tmpdir(), 'tab-tower-build');
const relativePathToIncludeList = [
    'dist/css',
    'dist/js',
    'icons',
    'ui',
    'manifest.json',
];
const relativePathToRemoveList = [
    'dist/css/style.css.map',
    'dist/js/background.js.map',
    'dist/js/ui-small.js.map',
];

if (isTestEnv) {
    relativePathToIncludeList.push('tests/resources');
}

function log(message: string) {
    const dateStart = new Date().toISOString();
    console.info(`[${dateStart}] ${message}`);
}

async function checkVersion() {
    if (isTestEnv) {
        return;
    }

    const versionFromGitTag = await getVersionFromGitTagOnCurrentCommit();
    const versionFromManifest = getVersionFromManifest();
    const versionFromPackageJson = getVersionFromPackageJson();

    if (versionFromGitTag != versionFromManifest) {
        console.error('The version retrieved from git tags is not equal to the version retrieved from the manifest');
        process.exit(1);
    } else if (versionFromGitTag != versionFromPackageJson) {
        console.error('The version retrieved from git tags is not equal to the version retrieved from the package.json');
        process.exit(1);
    }
}

async function getVersionFromGitTagOnCurrentCommit(): Promise<string> {
    let gitTagsOnCurrentCommit: string[];

    try {
        const gitTagResponse = await childProcessPromise.exec(`git tag -l --points-at HEAD`, {cwd: rootPath});
        gitTagsOnCurrentCommit = gitTagResponse.stdout.split('\n');
    } catch (error) {
        console.error('An error occured when trying to retrieve git tags');
        process.exit(1);
    }

    const gitVersionsFromGitTags: string[] = [];

    for (const gitTag of gitTagsOnCurrentCommit) {
        const version = semver.valid(gitTag);

        if (version) {
            gitVersionsFromGitTags.push(version);
        }
    }

    if (0 == gitVersionsFromGitTags.length) {
        console.error('No git tag with a valid version found on the current commit');
        process.exit(1);
    } else if (gitVersionsFromGitTags.length > 1) {
        console.error('Found several git tags with a valid version on the current commit');
        process.exit(1);
    }

    return gitVersionsFromGitTags[0];
}

function getVersionFromManifest(): string {
    const manifestPath = path.join(rootPath, 'manifest.json');
    const manifestContent = '' + fs.readFileSync(manifestPath);
    const manifestJson = JSON.parse(manifestContent);
    const manifestVersion: string = semver.valid(manifestJson.version);

    if ('string' != typeof manifestVersion || 0 == manifestVersion.length) {
        console.error('No valid version found in the manifest');
        process.exit(1);
    }

    return manifestVersion;
}

function getVersionFromPackageJson(): string {
    const packagePath = path.join(rootPath, 'package.json');
    const packageContent = '' + fs.readFileSync(packagePath);
    const packageJson = JSON.parse(packageContent);
    const packageVersion: string = semver.valid(packageJson.version);

    if ('string' != typeof packageVersion || 0 == packageVersion.length) {
        console.error('No valid version found in the package.json');
        process.exit(1);
    }

    return packageVersion;
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

    if (!isTestEnv) {
        for (const relativePathToRemove of relativePathToRemoveList) {
            fs.unlinkSync(path.join(exportPath, relativePathToRemove));
        }
    }
}

async function buildFirefoxExtension() {
    let outputFile = path.join(rootPath, 'dist/tab-tower.xpi');

    if (isTestEnv) {
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

checkVersion().then(() => {
    exportProjectFiles();
    buildFirefoxExtension().then(() => {
        fs.removeSync(exportPath);
    });
});
