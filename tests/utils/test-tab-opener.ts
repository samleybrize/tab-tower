interface Window {
    openTestTabs: any;
}

const availableUrls = [
    `${location.origin}/tests/resources/test-filter-with-other-text.html`,
    `${location.origin}/tests/resources/test-filter-with-some-text.html`,
    `${location.origin}/tests/resources/test-filter1.html`,
    `${location.origin}/tests/resources/test-page-with-not-found-favicon.html`,
    `${location.origin}/tests/resources/test-page-without-favicon.html`,
    `${location.origin}/tests/resources/test-page1.html`,
    `${location.origin}/tests/resources/test-page2.html`,
];

async function openTestTabs(numberOfTabs: number) {
    for (let i = 0; i < numberOfTabs; i++) {
        const urlIndex = i % availableUrls.length;
        const tab = await browser.tabs.create({
            url: availableUrls[urlIndex],
            active: false,
        });

        followOpenedTab(tab.id);
    }
}

function followOpenedTab(tabId: number) {
    const followButton = document.querySelector(`tr[data-tab-id="${tabId}"] .followButton`) as HTMLElement;

    if (null == followButton) {
        setTimeout(followOpenedTab.bind(this, tabId), 500);

        return;
    }

    followButton.click();
}

window.openTestTabs = openTestTabs;
