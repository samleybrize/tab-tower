import { promise as getDataUri } from 'datauri';

import { UrlDelayer } from '../utils/url-delayer';
import { FirefoxConfig } from './firefox-config';

const rootPath = '../..';

export enum TestPageNames {
    UI_SMALL = 'ui-small',
    UI_SETTINGS = 'ui-settings',
    TEST_PAGE1 = 'test-page1',
    TEST_PAGE2 = 'test-page2',
    TEST_PAGE_WITH_SOUND = 'test-with-sound',
    TEST_FILTER_WITH_OTHER_TEXT = 'test-filter-with-other-text',
    TEST_FILTER_WITH_SOME_TEXT = 'test-filter-with-some-text',
    TEST_FILTER_1 = 'test-filter1',
    TEST_PAGE_WITH_NOT_FOUND_FAVICON = 'test-page-with-not-found-favicon',
    TEST_PAGE_WITHOUT_FAVICON = 'test-page-without-favicon',
    TEST_FILTER_WITHOUT_TITLE = 'test-filter-without-title',
    TEST_PAGE_WITH_FAVICON_401 = 'test-page-with-favicon-401',
    TEST_PAGE_WITH_LONG_TITLE1 = 'test-page-with-long-title1',
    TEST_PAGE_WITH_LONG_TITLE2 = 'test-page-with-long-title2',
    TEST_DELAYED1 = 'test-delayed1',
}

export enum TestPageFavicons {
    TAB_TOWER = '/icons/tab-tower.svg',
    DEFAULT = '/ui/images/default-favicon.svg',
    FAVICON_1 = '/tests/resources/favicon1.png',
    FAVICON_2 = '/tests/resources/favicon2.png',
}

const testPageFaviconList: string[] = [
    TestPageFavicons.TAB_TOWER,
    TestPageFavicons.DEFAULT,
    TestPageFavicons.FAVICON_1,
    TestPageFavicons.FAVICON_2,
];

interface TestPageDescriptor {
    name: TestPageNames;
    title: string;
    url: string;
    domain: string;
    faviconUrl: string;
}

export class TestPageDescriptorRetriever {
    private descriptorMap = new Map<string, TestPageDescriptor>();
    private faviconUrlMap = new Map<string, string>();

    constructor(private firefoxConfig: FirefoxConfig, urlDelayer: UrlDelayer) {
        this.addDescriptor({
            name: TestPageNames.UI_SMALL,
            title: 'Tab Tower',
            url: firefoxConfig.getExtensionUrl('/ui/ui-small.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.TAB_TOWER),
        });
        this.addDescriptor({
            name: TestPageNames.UI_SETTINGS,
            title: 'Tab Tower - Settings',
            url: firefoxConfig.getExtensionUrl('/ui/ui-settings.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.TAB_TOWER),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE1,
            title: 'Test page 1',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.FAVICON_1),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE2,
            title: 'Test page 2',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-page2.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.FAVICON_2),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE_WITH_SOUND,
            title: 'Test page with sound',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-with-sound.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.FAVICON_2),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_FILTER_WITH_OTHER_TEXT,
            title: 'Filter title with other qwerty',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-filter-with-other-text.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.FAVICON_1),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_FILTER_WITH_SOME_TEXT,
            title: 'Filter title with azerty',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-filter-with-some-text.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.FAVICON_1),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_FILTER_1,
            title: 'Filter title 1',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-filter1.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.FAVICON_1),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE_WITH_NOT_FOUND_FAVICON,
            title: 'Test page with not found favicon',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-page-with-not-found-favicon.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.DEFAULT),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE_WITHOUT_FAVICON,
            title: 'Test page without favicon',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-page-without-favicon.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.DEFAULT),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_FILTER_WITHOUT_TITLE,
            title: '',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-filter-without-title.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.DEFAULT),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE_WITH_FAVICON_401,
            title: 'Test page with favicon 401',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-page-with-favicon-401.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.DEFAULT),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE_WITH_LONG_TITLE1,
            title: 'Test page with a very very very very very very very very very very long title 1',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-page-with-long-title1.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.FAVICON_1),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE_WITH_LONG_TITLE2,
            title: 'Test page with a very very very very very very very very very very long title 2',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-page-with-long-title2.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.FAVICON_1),
        });

        const delayedImageUrl = urlDelayer.getDelayedUrl('', 1000);
        this.addDescriptor({
            name: TestPageNames.TEST_DELAYED1,
            title: 'Test delayed 1',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-delayed1.html?' + encodeURI(delayedImageUrl)),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: this.firefoxConfig.getExtensionUrl(TestPageFavicons.FAVICON_2),
        });
    }

    private addDescriptor(descriptor: TestPageDescriptor) {
        this.descriptorMap.set(descriptor.name, descriptor);
    }

    getDescriptor(name: TestPageNames) {
        const descriptor = this.descriptorMap.get(name);

        if (null == descriptor) {
            throw new Error(`Unknown test page descriptor "${name}"`);
        }

        return descriptor;
    }

    async getFaviconUrlFromDataUri(dataUri: string): Promise<string> {
        await this.initFavicons();

        if (this.faviconUrlMap.has(dataUri)) {
            return this.firefoxConfig.getExtensionUrl(
                this.faviconUrlMap.get(dataUri),
            );
        } else if (testPageFaviconList.indexOf(dataUri) >= 0) {
            return this.firefoxConfig.getExtensionUrl(dataUri);
        }

        return dataUri;
    }

    private async initFavicons() {
        if (this.faviconUrlMap.size > 0) {
            return;
        }

        this.faviconUrlMap.set(await this.getFaviconDataUri(TestPageFavicons.DEFAULT), TestPageFavicons.DEFAULT);
        this.faviconUrlMap.set(await this.getFaviconDataUri(TestPageFavicons.TAB_TOWER), TestPageFavicons.TAB_TOWER);
        this.faviconUrlMap.set(await this.getFaviconDataUri(TestPageFavicons.FAVICON_1), TestPageFavicons.FAVICON_1);
        this.faviconUrlMap.set(await this.getFaviconDataUri(TestPageFavicons.FAVICON_2), TestPageFavicons.FAVICON_2);
    }

    private async getFaviconDataUri(faviconUrl: string) {
        const faviconPath = `${__dirname}/${rootPath}${faviconUrl}`;

        return getDataUri(faviconPath);
    }
}
