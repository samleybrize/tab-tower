import { AfterAll } from 'cucumber';
import { TestsConfig } from '../../../tests-config';
import { UrlDelayer } from '../../../utils/url-delayer';
import { WebDriverRetriever } from '../../../webdriver/webdriver-retriever';

AfterAll(async () => {
    const webdriverRetriever = WebDriverRetriever.getInstance();
    const testsConfig = TestsConfig.getInstance();
    const urlDelayer = UrlDelayer.getInstance();

    if (!testsConfig.keepBrowserOpened && webdriverRetriever.isDriverCreated()) {
        await webdriverRetriever.getDriver().quit();
    }

    await webdriverRetriever.getBrowserInstructionSender().shutdown();
    await urlDelayer.shutdown();
});
