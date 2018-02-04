export class TestsConfig {
    private static instance: TestsConfig;

    public readonly isHeadlessModeEnabled: boolean = true;
    public readonly keepBrowserOpened: boolean = false;

    static getInstance() {
        if (null == this.instance) {
            this.instance = new this();
        }

        return this.instance;
    }

    private constructor() {
        if ('0' === process.env.HEADLESS) {
            this.isHeadlessModeEnabled = false;
        }

        if (process.env.KEEP_BROWSER) {
            this.isHeadlessModeEnabled = false;
            this.keepBrowserOpened = true;
        }
    }
}
