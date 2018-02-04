import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Binary, Options, Profile } from 'selenium-webdriver/firefox';
import * as which from 'which';

import { TestsConfig } from '../tests-config';

export class FirefoxConfig {
    private isExtensionBuilded = false;

    getWebdriverOptions() {
        this.buildExtension();

        const firefoxProfile = new Profile();
        firefoxProfile.addExtension(this.getExtensionPath());
        firefoxProfile.setPreference('xpinstall.signatures.required', false);

        // used to fix the random uuid assigned by firefox to the extension
        const extensionId = this.getExtensionId();
        const extensionInternalId = this.getExtensionInternalId();
        firefoxProfile.setPreference('extensions.webextensions.uuids', `{"${extensionId}":"${extensionInternalId}"}`);

        const firefoxPath = this.getFirefoxBinaryPath();
        const firefoxBinary = new Binary(firefoxPath);
        const testsConfig = TestsConfig.getInstance();

        if (testsConfig.isHeadlessModeEnabled) {
            firefoxBinary.addArguments('-headless');
        }

        const firefoxOptions = new Options().setProfile(firefoxProfile).setBinary(firefoxBinary);

        return firefoxOptions;
    }

    private buildExtension() {
        if (this.isExtensionBuilded) {
            return;
        }

        const extensionPath = this.getExtensionPath();
        const rootPath = this.getRootProjectPath();

        childProcess.execSync(`cd '${rootPath}' && zip -r ${extensionPath} dist icons ui manifest.json tests/resources`); // TODO

        this.isExtensionBuilded = true;
    }

    private getRootProjectPath() {
        return path.join(__dirname, '../../../..');
    }

    private getExtensionPath() {
        return path.join(os.tmpdir(), 'tab-tower.xpi');
    }

    private getFirefoxBinaryPath() {
        const firefoxPath = which.sync('firefox-developer-edition');

        if (null == firefoxPath) {
            throw new Error('Unable to find firefox-developer-edition');
        }

        return firefoxPath;
    }

    getExtensionId() {
        return 'tab-tower@stephen.berquet';
    }

    getExtensionInternalId() {
        return 'd4d9eeaa-1c5c-481a-b0d3-e7c5482e176b';
    }

    getExtensionUrl(relativeUrl: string) {
        const extensionInternalId = this.getExtensionInternalId();
        return `moz-extension://${extensionInternalId}${relativeUrl}`;
    }

    getReaderModeTestPageUrl() {
        return 'https://www.mozilla.org/en-US/mission/';
    }
}
