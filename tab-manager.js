async function getTabs() {
    const rawTabs = await browser.tabs.query({});
    const tabs = [];

    for (const tab of rawTabs) {
        const tabUrl = tab.url;

        if (0 == tabUrl.indexOf('about:') || 0 == tabUrl.indexOf('moz-extension:')) {
            continue;
        }

        tabs.push({
            id: tab.id,
            index: tab.index,
            title: tab.title,
            incognito: tab.incognito,
            url: tab.url,
            faviconUrl: tab.favIconUrl,
        });
    }

    return tabs;
}

async function refresh() {
    const tabs = await getTabs();
    const tabListElement = document.querySelector("#tabList tbody");
    
    while (tabListElement.firstChild) {
        tabListElement.firstChild.remove();
    }

    for (const tab of tabs) {
        // TODO favicon may not exists, or fail to load
        const idElement = document.createElement('td');
        const titleElement = document.createElement('td');
        const incognitoElement = document.createElement('td');
        const faviconElement = document.createElement('td');

        const faviconImageElement = document.createElement('img');
        faviconImageElement.src = tab.faviconUrl;
        faviconElement.appendChild(faviconImageElement);

        const linkElement = document.createElement('a');
        linkElement.href = tab.url;
        linkElement.target = '_blank';
        linkElement.textContent = tab.title;
        titleElement.appendChild(linkElement);

        idElement.textContent = tab.id;
        incognitoElement.textContent = tab.incognito ? 'Yes' : 'No';

        const row = document.createElement('tr');
        row.setAttribute('data-index', tab.index);
        row.appendChild(idElement);
        row.appendChild(faviconElement);
        row.appendChild(titleElement);
        row.appendChild(incognitoElement);

        tabListElement.appendChild(row);
        console.log(row);
    }
}

// TODO refresh when a tab change
refresh();
