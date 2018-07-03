import { setDefaultTimeout, setWorldConstructor } from 'cucumber';
import { TestsConfig } from '../../../tests-config';
import { UrlDelayer } from '../../../utils/url-delayer';
import { TestPageDescriptorRetriever } from '../../../webdriver/test-page-descriptor';
import { WebDriverRetriever } from '../../../webdriver/webdriver-retriever';

export class World {
    public readonly webdriverRetriever: WebDriverRetriever;
    public readonly testsConfig: TestsConfig;
    public readonly testPageDescriptorRetriever: TestPageDescriptorRetriever;
    public readonly urlDelayer: UrlDelayer;

    constructor() {
        this.webdriverRetriever = WebDriverRetriever.getInstance();
        this.testsConfig = TestsConfig.getInstance();
        this.urlDelayer = UrlDelayer.getInstance();
        this.urlDelayer.init();

        this.testPageDescriptorRetriever = new TestPageDescriptorRetriever(this.webdriverRetriever.getFirefoxConfig(), this.urlDelayer);
    }
}

setWorldConstructor(World);
setDefaultTimeout(20000);
