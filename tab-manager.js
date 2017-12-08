const savedTabList = [];
const savedTabIdList = [];

async function getTabs() {
    const {tabList, tabIdList} = await getOpenedTabs();
    console.log(savedTabList); // TODO

    for (const tab of savedTabList) {
        if (tabIdList.indexOf(tab.id) >= 0) {
            continue;
        }

        tabList.push(tab);
    }

    return tabList;
}

async function getOpenedTabs() {
    const rawTabs = await browser.tabs.query({});
    const tabList = [];
    const tabIdList = [];

    for (const tab of rawTabs) {
        const tabUrl = tab.url;

        if (0 == tabUrl.indexOf('about:') || 0 == tabUrl.indexOf('moz-extension:')) {
            continue;
        }

        tabIdList.push(tab.id);
        tabList.push({
            id: tab.id,
            index: tab.index,
            title: tab.title,
            isIncognito: tab.incognito,
            url: tab.url,
            faviconUrl: tab.favIconUrl,
            isOpened: true,
            isSaved: savedTabIdList.indexOf(tab.id) >= 0,
        });
    }

    return {
        tabList: tabList,
        tabIdList: tabIdList,
    };
}

async function refresh() {
    const tabs = await getTabs();
    const tabListElement = document.querySelector("#tabList tbody");
    
    while (tabListElement.firstChild) {
        tabListElement.firstChild.remove();
    }

    for (const tab of tabs) {
        // TODO favicon may not exists, or fail to load
        const titleElement = document.createElement('td');
        const incognitoElement = document.createElement('td');
        const faviconElement = document.createElement('td');
        const openedElement = document.createElement('td');
        const registerElement = document.createElement('td');

        const faviconImageElement = document.createElement('img');
        faviconImageElement.src = tab.faviconUrl;
        faviconElement.appendChild(faviconImageElement);

        const linkElement = document.createElement('a');
        linkElement.href = tab.url;
        linkElement.target = '_blank';
        linkElement.textContent = tab.title;
        titleElement.appendChild(linkElement);

        incognitoElement.textContent = tab.isIncognito ? 'Yes' : 'No';
        openedElement.textContent = tab.isOpened ? 'Yes' : 'No';
        openedElement.classList.add('isOpened');

        const row = document.createElement('tr');
        row.setAttribute('data-index', tab.index);
        row.setAttribute('data-id', tab.id);
        row.appendChild(faviconElement);
        row.appendChild(titleElement);
        row.appendChild(incognitoElement);
        row.appendChild(openedElement);
        row.appendChild(registerElement);

        if (!tab.isSaved) {
            const registerButton = document.createElement('a');
            registerButton.textContent = 'Register';
            registerButton.addEventListener('mouseup', (event) => {
                let element = event.target;

                while ((element = element.parentElement) && null == element.getAttribute('data-id'));

                if (null == element) {
                    console.error('Unable to find a tab id');
                }

                tab.isSaved = true;
                savedTabList.push(tab);
                savedTabIdList.push(tab.id);
                refresh();
            });

            registerElement.appendChild(registerButton);
        }

        tabListElement.appendChild(row);
    }
}

browser.tabs.onCreated.addListener(refresh);
browser.tabs.onMoved.addListener(refresh);
browser.tabs.onUpdated.addListener(refresh);

browser.tabs.onRemoved.addListener((event) => {
    const tabId = event;
    const i = savedTabIdList.indexOf(tabId);

    if (i >= 0) {
        savedTabList[i].isOpened = false;
        document.querySelector(`#tabList tbody tr[data-id='${tabId}'] .isOpened`).textContent = 'No';

        return;
    }

    document.querySelector(`#tabList tbody [data-id='${tabId}']`).remove();
});

refresh();
