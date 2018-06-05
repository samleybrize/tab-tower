// import { TabFollowState } from '../../src/typescript/tab/followed-tab/tab-follow-state';
import { TestsConfig } from '../tests-config';

const testsConfig = TestsConfig.getInstance();
const client = new WebSocket('ws://localhost:' + testsConfig.browserInstructionPort);

client.onmessage = async (event) => {
    const message = JSON.parse(event.data);
    let tabId: number;
    let targetTabId;
    let tab: browser.tabs.Tab;
    let tabList: browser.tabs.Tab[];
    let recentlyClosedTabList: browser.sessions.Session[];

    switch (message.action) {
        case 'reset-browser-state':
            await closeAllTabs();
            await clearRecentlyClosedTabs();
            await browser.storage.local.clear();

            client.send(JSON.stringify({messageId: message.data.messageId}));
            break;

        case 'reload-tab':
            targetTabId = await getTabIdByIndex(message.data.tabIndex);
            await browser.tabs.reload(targetTabId, {bypassCache: message.data.bypassCache});
            break;

        case 'open-tab':
            let url = message.data.url;

            if ('string' != typeof url || '' == url) {
                url = undefined;
            }

            await browser.tabs.create({url, active: !!message.data.active, index: message.data.index});
            break;

        case 'duplicate-tab':
            const tabIdToDuplicate = await getTabIdByIndex(message.data.tabIndex);
            const newTab = await browser.tabs.duplicate(tabIdToDuplicate);

            client.send(JSON.stringify({messageId: message.data.messageId, newTab}));
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

            while (true) {
                const targetTab = await browser.tabs.get(targetTabId);

                if ('complete' == targetTab.status) {
                    break;
                }
            }

            await browser.tabs.update(targetTabId, {active: true});
            await sleep(500);
            await browser.tabs.toggleReaderMode(targetTabId);
            await browser.tabs.update(currentTabId, {active: true});
            break;

        case 'pin-tab':
            targetTabId = await getTabIdByIndex(message.data.tabIndex);
            await browser.tabs.update(targetTabId, {pinned: true});
            break;

        case 'unpin-tab':
            targetTabId = await getTabIdByIndex(message.data.tabIndex);
            await browser.tabs.update(targetTabId, {pinned: false});
            break;

        case 'mute-tab':
            targetTabId = await getTabIdByIndex(message.data.tabIndex);
            await browser.tabs.update(targetTabId, {muted: true});
            break;

        case 'unmute-tab':
            targetTabId = await getTabIdByIndex(message.data.tabIndex);
            await browser.tabs.update(targetTabId, {muted: false});
            break;

        // case 'set-followed-tab-reader-mode-status-as-disabled':
        //     const objectId = `followState.${message.data.followId}`;
        //     const storageObject = await browser.storage.local.get(objectId);
        //     (storageObject[objectId] as TabFollowState).isInReaderMode = false;
        //     await browser.storage.local.set(storageObject);
        //     break;

        case 'create-window':
            await browser.windows.create({incognito: !!message.data.isIncognito, url: message.data.url});
            break;

        case 'restore-recently-closed-tab':
            recentlyClosedTabList = await browser.sessions.getRecentlyClosed();
            const restoredSession = await browser.sessions.restore(recentlyClosedTabList[message.data.index].tab.sessionId);

            client.send(JSON.stringify({messageId: message.data.messageId, restoredTabId: restoredSession.tab.id, restoredTabIndex: restoredSession.tab.index}));
            break;

        case 'clear-recently-closed-tabs':
            await clearRecentlyClosedTabs();

            client.send(JSON.stringify({messageId: message.data.messageId}));
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

            client.send(JSON.stringify({messageId: message.data.messageId}));
            break;

        case 'set-to-webstorage':
            await browser.storage.local.set(message.data.storageObject);

            client.send(JSON.stringify({
                messageId: message.data.messageId,
            }));
            break;

        case 'clear-webstorage':
            await browser.storage.local.clear();

            client.send(JSON.stringify({
                messageId: message.data.messageId,
            }));
            break;

        case 'reload-extension':
            browser.runtime.reload();
            break;

        case 'get-active-tab':
            tabList = await browser.tabs.query({active: true});

            client.send(JSON.stringify({
                messageId: message.data.messageId,
                activeTab: tabList ? tabList[0] : null,
            }));
            break;

        case 'get-tab-by-id':
            tabId = message.data.tabId;
            tab = await browser.tabs.get(tabId);

            client.send(JSON.stringify({
                messageId: message.data.messageId,
                tab,
            }));
            break;

        case 'get-tab-by-index':
            tabId = await getTabIdByIndex(message.data.tabIndex);
            tab = await browser.tabs.get(tabId);

            client.send(JSON.stringify({
                messageId: message.data.messageId,
                tab,
            }));
            break;

        case 'get-all-tabs':
            tabList = await browser.tabs.query({});

            client.send(JSON.stringify({
                messageId: message.data.messageId,
                tabList,
            }));
            break;

        case 'get-all-recently-closed-tabs':
            recentlyClosedTabList = await browser.sessions.getRecentlyClosed();

            client.send(JSON.stringify({
                messageId: message.data.messageId,
                recentlyClosedTabList,
            }));
            break;

        case 'get-browser-action-badge':
            tabId = await getTabIdByIndex(message.data.tabIndex);

            client.send(JSON.stringify({
                messageId: message.data.messageId,
                text: await browser.browserAction.getBadgeText({tabId}),
                backgroundColor: await browser.browserAction.getBadgeBackgroundColor({tabId}),
            }));
            break;

        case 'get-webstorage-content':
            client.send(JSON.stringify({
                messageId: message.data.messageId,
                storageObject: await browser.storage.local.get(),
            }));
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

async function closeAllTabs() {
    const tabList = await browser.tabs.query({});
    const idList: number[] = [];

    for (const tab of tabList) {
        idList.push(tab.id);
    }

    if (idList.length > 0) {
        await browser.tabs.remove(idList);
    }
}

async function clearRecentlyClosedTabs() {
    const recentlyClosedTabList = await browser.sessions.getRecentlyClosed();

    for (const recentlyClosedTab of recentlyClosedTabList) {
        if (recentlyClosedTab.tab) {
            await browser.sessions.forgetClosedTab(recentlyClosedTab.tab.windowId, recentlyClosedTab.tab.sessionId);
        }
    }
}
