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
        const testsConfig = TestsConfig.getInstance();
        const firefoxOptions = new Options();

        // used to fix the random uuid assigned by firefox to the extension
        const extensionId = this.getExtensionId();
        const extensionInternalId = this.getExtensionInternalId();

        if (testsConfig.isHeadlessModeEnabled) {
            firefoxOptions.addArguments('-headless');
        }

        if (testsConfig.isBrowserConsoleEnabled) {
            firefoxOptions.addArguments('-jsconsole');
        }

        firefoxOptions.addExtensions(this.getExtensionPath());
        firefoxOptions.setPreference('xpinstall.signatures.required', false);
        firefoxOptions.setPreference('security.csp.enable', false);
        firefoxOptions.setPreference('extensions.webextensions.uuids', `{"${extensionId}":"${extensionInternalId}"}`);
        firefoxOptions.setBinary(this.getFirefoxBinaryPath());

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
}
