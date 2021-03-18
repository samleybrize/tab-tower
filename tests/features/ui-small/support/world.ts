import { setDefaultTimeout, setWorldConstructor } from 'cucumber';
import { TestsConfig } from '../../../tests-config';
import { UrlDelayer } from '../../../utils/url-delayer';
import { TestPageDescriptorRetriever } from '../../../webdriver/test-page-descriptor';
import { WebDriverRetriever } from '../../../webdriver/webdriver-retriever';
import { BrowserSupport } from './browser-support';
import { OpenedTabListSupport } from './opened-tab-list-support';
import { SettingsSupport } from './settings-support';
import { SidenavSupport } from './sidenav-support';
import { TabTagAssignmentSupport } from './tab-tag-assignment-support';
import { TabTagEditSupport } from './tab-tag-edit-support';
import { TabTagListSupport } from './tab-tag-list-support';
import { TabsViewSupport } from './tabs-view-support';

export class World {
    public readonly defaultWaitTimeout = 15000;
    public readonly webdriverRetriever: WebDriverRetriever;
    public readonly testsConfig: TestsConfig;
    public readonly testPageDescriptorRetriever: TestPageDescriptorRetriever;
    public readonly urlDelayer: UrlDelayer;
    public readonly browserSupport: BrowserSupport;
    public readonly openedTabListSupport: OpenedTabListSupport;
    public readonly settingsSupport: SettingsSupport;
    public readonly sidenavSupport: SidenavSupport;
    public readonly tabsViewSupport: TabsViewSupport;
    public readonly tabTagAssignmentSupport: TabTagAssignmentSupport;
    public readonly tabTagEditSupport: TabTagEditSupport;

    constructor() {
        this.webdriverRetriever = WebDriverRetriever.getInstance();
        this.testsConfig = TestsConfig.getInstance();
        this.urlDelayer = UrlDelayer.getInstance();
        this.urlDelayer.init();

        const tabTagListSupport = new TabTagListSupport(this.webdriverRetriever, this.defaultWaitTimeout);
        this.testPageDescriptorRetriever = new TestPageDescriptorRetriever(this.webdriverRetriever.getFirefoxConfig(), this.urlDelayer);
        this.browserSupport = new BrowserSupport(this.webdriverRetriever, this.defaultWaitTimeout);
        this.openedTabListSupport = new OpenedTabListSupport(this.webdriverRetriever, this.browserSupport);
        this.settingsSupport = new SettingsSupport(this.webdriverRetriever);
        this.sidenavSupport = new SidenavSupport(this.webdriverRetriever, this.browserSupport, tabTagListSupport);
        this.tabsViewSupport = new TabsViewSupport(this.webdriverRetriever);
        this.tabTagAssignmentSupport = new TabTagAssignmentSupport(this.webdriverRetriever, tabTagListSupport);
        this.tabTagEditSupport = new TabTagEditSupport(this.webdriverRetriever, this.browserSupport);
    }
}

setWorldConstructor(World);
setDefaultTimeout(30000);
