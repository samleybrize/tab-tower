import { Browser, BrowserInfo, detect as detectBrowser } from 'detect-browser';

export class DetectedBrowser {
    readonly name: Browser | 'node';
    readonly version: string;
    readonly majorVersion: number;
    readonly minorVersion: number;
    readonly patchVersion: number;

    constructor() {
        const detectedBrowser = detectBrowser() as BrowserInfo;
        this.name = detectedBrowser.name;
        this.version = detectedBrowser.version;

        const versionParts = detectedBrowser.version.split('.');
        this.majorVersion = +versionParts[0];
        this.minorVersion = +versionParts[1];
        this.patchVersion = +versionParts[2];
    }
}
