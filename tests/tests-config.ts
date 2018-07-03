export class TestsConfig {
    private static instance: TestsConfig;

    public readonly isHeadlessModeEnabled: boolean = true;
    public readonly isBrowserConsoleEnabled: boolean = true;
    public readonly keepBrowserOpened: boolean = false;
    public readonly browserInstructionPort: number = 8888;
    public readonly urlDelayerPort: number = 9999;

    static getInstance() {
        if (null == this.instance) {
            this.instance = new this();
        }

        return this.instance;
    }

    private constructor() {
        const slaveId = +process.env.CUCUMBER_SLAVE_ID || 0;

        if ('0' === process.env.HEADLESS) {
            this.isHeadlessModeEnabled = false;
        }

        if ('1' === process.env.KEEP_BROWSER) {
            this.isHeadlessModeEnabled = false;
            this.isBrowserConsoleEnabled = true;
            this.keepBrowserOpened = true;
        }

        if (+process.env.BROWSER_INSTRUCTION_PORT > 0) {
            this.browserInstructionPort = +process.env.BROWSER_INSTRUCTION_PORT;
        }

        if (+process.env.URL_DELAYER_PORT > 0) {
            this.urlDelayerPort = +process.env.URL_DELAYER_PORT;
        }

        this.browserInstructionPort += slaveId;
        this.urlDelayerPort += slaveId;
    }
}
