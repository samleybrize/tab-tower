const client = new WebSocket('ws://localhost:8888'); // TODO param

client.onmessage = async (event) => {
    const message = JSON.parse(event.data);
    let targetTabId;

    switch (message.action) {
        case 'reload-tab':
            targetTabId = await getTabIdByIndex(message.data.tabIndex);
            await browser.tabs.reload(targetTabId, {bypassCache: message.data.bypassCache});
            break;

        case 'open-tab':
            await browser.tabs.create({url: message.data.url, active: !!message.data.active});
            break;

        case 'close-tab':
            targetTabId = await getTabIdByIndex(message.data.tabIndex);
            await browser.tabs.remove(targetTabId);
            break;

        case 'move-tab':
            targetTabId = await getTabIdByIndex(message.data.tabIndex);
            await browser.tabs.move(targetTabId, {index: message.data.targetIndex});
            break;

        case 'change-tab-url':
            targetTabId = await getTabIdByIndex(message.data.tabIndex);
            browser.tabs.update(targetTabId, {url: message.data.url});
            break;

        case 'toggle-reader-mode':
            const currentTabId = (await browser.tabs.query({active: true}))[0].id;
            targetTabId = await getTabIdByIndex(message.data.tabIndex);

            await browser.tabs.update(targetTabId, {active: true});
            await sleep(500);
            await browser.tabs.toggleReaderMode(targetTabId);
            await browser.tabs.update(currentTabId, {active: true});
            break;

        case 'create-window':
            await browser.windows.create({incognito: !!message.data.isIncognito, url: message.data.url});
            break;

        case 'make-tab-go-to-previous-page':
            targetTabId = await getTabIdByIndex(message.data.tabIndex);
            const code = `
                history.back();
            `;
            await browser.tabs.executeScript(targetTabId, {code});
            break;

        case 'focus-tab':
            targetTabId = await getTabIdByIndex(message.data.tabIndex);
            await browser.tabs.update(targetTabId, {active: true});
            break;
    }
};

client.onerror = (error) => {
    console.error(error);
};

async function getTabIdByIndex(tabIndex: number) {
    const matchingTabs = await browser.tabs.query({index: tabIndex});

    if (1 !== matchingTabs.length) {
        throw new Error(`Can't find a tab at index ${tabIndex}`);
    }

    return matchingTabs[0].id;
}

function sleep(milliseconds: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}