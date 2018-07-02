import { UrlDelayer } from '../utils/url-delayer';
import { FirefoxConfig } from './firefox-config';

export enum TestPageNames {
    UI_SMALL = 'ui-small',
    TEST_PAGE1 = 'test-page1',
    TEST_PAGE2 = 'test-page2',
    TEST_PAGE_WITH_SOUND = 'test-with-sound',
    TEST_FILTER_WITH_OTHER_TEXT = 'test-filter-with-other-text',
    TEST_FILTER_WITH_SOME_TEXT = 'test-filter-with-some-text',
    TEST_FILTER_1 = 'test-filter1',
    TEST_PAGE_WITH_NOT_FOUND_FAVICON = 'test-page-with-not-found-favicon',
    TEST_PAGE_WITHOUT_FAVICON = 'test-page-without-favicon',
    TEST_PAGE_WITH_FAVICON_401 = 'test-page-with-favicon-401',
    TEST_DELAYED1 = 'test-delayed1',
}

interface TestPageDescriptor {
    name: TestPageNames;
    title: string;
    url: string;
    domain: string;
    faviconUrl: string;
}

export class TestPageDescriptorRetriever {
    private descriptorMap = new Map<string, TestPageDescriptor>();

    constructor(firefoxConfig: FirefoxConfig, urlDelayer: UrlDelayer) {
        this.addDescriptor({
            name: TestPageNames.UI_SMALL,
            title: 'Tab Tower - Sidebar',
            url: firefoxConfig.getExtensionUrl('/ui/ui-small.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: firefoxConfig.getExtensionUrl('/icons/tab-tower.svg'),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE1,
            title: 'Test page 1',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-page1.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: firefoxConfig.getExtensionUrl('/tests/resources/favicon1.png'),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE2,
            title: 'Test page 2',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-page2.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: firefoxConfig.getExtensionUrl('/tests/resources/favicon2.png'),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE_WITH_SOUND,
            title: 'Test page with sound',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-with-sound.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: firefoxConfig.getExtensionUrl('/tests/resources/favicon2.png'),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_FILTER_WITH_OTHER_TEXT,
            title: 'Filter title with other qwerty',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-filter-with-other-text.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: firefoxConfig.getExtensionUrl('/tests/resources/favicon1.png'),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_FILTER_WITH_SOME_TEXT,
            title: 'Filter title with azerty',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-filter-with-some-text.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: firefoxConfig.getExtensionUrl('/tests/resources/favicon1.png'),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_FILTER_1,
            title: 'Filter title 1',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-filter1.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: firefoxConfig.getExtensionUrl('/tests/resources/favicon1.png'),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE_WITH_NOT_FOUND_FAVICON,
            title: 'Test page with not found favicon',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-page-with-not-found-favicon.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: firefoxConfig.getExtensionUrl('/ui/images/default-favicon.svg'),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE_WITHOUT_FAVICON,
            title: 'Test page without favicon',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-page-without-favicon.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: firefoxConfig.getExtensionUrl('/ui/images/default-favicon.svg'),
        });
        this.addDescriptor({
            name: TestPageNames.TEST_PAGE_WITH_FAVICON_401,
            title: 'Test page with favicon 401',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-page-with-favicon-401.html'),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: firefoxConfig.getExtensionUrl('/ui/images/default-favicon.svg'),
        });

        const delayedImageUrl = urlDelayer.getDelayedUrl('', 1000);
        this.addDescriptor({
            name: TestPageNames.TEST_DELAYED1,
            title: 'Test delayed 1',
            url: firefoxConfig.getExtensionUrl('/tests/resources/test-delayed1.html?' + encodeURI(delayedImageUrl)),
            domain: firefoxConfig.getExtensionInternalId(),
            faviconUrl: firefoxConfig.getExtensionUrl('/tests/resources/favicon2.png'),
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
}
