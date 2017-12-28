import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Options, Profile } from 'selenium-webdriver/firefox';
import * as which from 'which';

export class FirefoxConfig {
    private isExtensionBuilded = false;

    getWebdriverOptions() {
        this.buildExtension();

        const firefoxProfile = new Profile();
        firefoxProfile.addExtension(this.getExtensionPath());
        firefoxProfile.addExtension(this.getHelperExtensionPath());
        firefoxProfile.setPreference('xpinstall.signatures.required', false);

        // used to fix the random uuid assigned by firefox to the extension
        const extensionId = this.getExtensionId();
        const extensionInternalId = this.getExtensionInternalId();
        firefoxProfile.setPreference('extensions.webextensions.uuids', `{"${extensionId}":"${extensionInternalId}"}`);

        const firefoxPath = this.getFirefoxBinaryPath();
        const firefoxOptions = new Options().setProfile(firefoxProfile).setBinary(firefoxPath);

        return firefoxOptions;
    }

    private buildExtension() {
        if (this.isExtensionBuilded) {
            return;
        }

        const extensionPath = this.getExtensionPath();
        const helperExtensionPath = this.getHelperExtensionPath();
        const rootPath = this.getRootProjectPath();

        childProcess.execSync(`cd '${rootPath}' && zip -r ${extensionPath} dist icons ui manifest.json tests/resources`); // TODO
        childProcess.execSync(`cd '${rootPath}/tests/webdriver/browser-instruction-receiver-extension' && zip -r ${helperExtensionPath} background.js manifest.json`); // TODO

        this.isExtensionBuilded = true;
    }

    private getRootProjectPath() {
        return path.join(__dirname, '../../../..');
    }

    private getExtensionPath() {
        return path.join(os.tmpdir(), 'tab-tower.xpi');
    }

    private getHelperExtensionPath() {
        return path.join(os.tmpdir(), 'tab-tower-helper.xpi');
    }

    private getFirefoxBinaryPath() {
        const firefoxPath = which.sync('firefox-developer-edition');

        if (null == firefoxPath) {
            throw new Error('Unable to find firefox-developer-edition');
        }

        return firefoxPath;
    }

    getExtensionId() {
        return '{9da846ee-eae7-11e7-80c1-9a214cf093ae}';
    }

    getExtensionInternalId() {
        return 'd4d9eeaa-1c5c-481a-b0d3-e7c5482e176b';
    }

    getExtensionUrl(relativeUrl: string) {
        const extensionInternalId = this.getExtensionInternalId();
        return `moz-extension://${extensionInternalId}${relativeUrl}`;
    }
}
