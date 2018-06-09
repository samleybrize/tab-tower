import * as fs from 'fs';
import * as path from 'path';
import { Binary, Options, Profile } from 'selenium-webdriver/firefox';
import * as which from 'which';

import { TestsConfig } from '../tests-config';

export class FirefoxConfig {
    private rootProjectPath: string;

    constructor() {
        this.findRootProjectPath();
    }

    private findRootProjectPath() {
        let rootPath = __dirname;

        while (!fs.existsSync(path.join(rootPath, 'package.json'))) {
            rootPath = path.dirname(rootPath);
        }

        this.rootProjectPath = rootPath;
    }

    getWebdriverOptions() {
        const firefoxProfile = new Profile();
        firefoxProfile.addExtension(this.getExtensionPath());
        firefoxProfile.setPreference('xpinstall.signatures.required', false);
        firefoxProfile.setPreference('security.csp.enable', false);

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

        if (testsConfig.isBrowserConsoleEnabled) {
            firefoxBinary.addArguments('-jsconsole');
        }

        const firefoxOptions = new Options().setProfile(firefoxProfile).setBinary(firefoxBinary);

        return firefoxOptions;
    }

    private getExtensionPath() {
        return path.join(this.rootProjectPath, 'dist', 'tab-tower-test.xpi');
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

    // TODO todel
    getReaderModeTestPageUrl() {
        return 'https://www.mozilla.org/en-US/mission/';
    }
}
