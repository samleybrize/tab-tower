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

async function refresh(e) {
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

        const faviconImageElement = document.createElement('img');
        faviconImageElement.src = tab.faviconUrl;
        faviconElement.appendChild(faviconImageElement);

        const linkElement = document.createElement('a');
        linkElement.href = tab.url;
        linkElement.target = '_blank';
        linkElement.textContent = tab.title;
        titleElement.appendChild(linkElement);

        incognitoElement.textContent = tab.incognito ? 'Yes' : 'No';

        const row = document.createElement('tr');
        row.setAttribute('data-index', tab.index);
        row.setAttribute('data-id', tab.id);
        row.appendChild(faviconElement);
        row.appendChild(titleElement);
        row.appendChild(incognitoElement);

        const registerButton = document.createElement('a');
        registerButton.textContent = 'Register';
        registerButton.addEventListener('mouseup', (event) => {
            let element = event.target;

            while ((element = element.parentElement) && null == element.getAttribute('data-id'));

            if (null == element) {
                console.error('Unable to find a tab id');
            }

            console.log(element.getAttribute('data-id')); // TODO
        });
        const registerElement = document.createElement('td');
        registerElement.appendChild(registerButton);
        row.appendChild(registerElement);

        tabListElement.appendChild(row);
    }
}

browser.tabs.onCreated.addListener(refresh);
browser.tabs.onMoved.addListener(refresh);
browser.tabs.onUpdated.addListener(refresh);

browser.tabs.onRemoved.addListener((event) => {
    document.querySelector(`#tabList tbody [data-id='${event}']`).remove();
});

refresh();
