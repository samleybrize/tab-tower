const client = new WebSocket('ws://localhost:8888');

client.onmessage = async function (event) {
    const message = JSON.parse(event.data);

    switch (message.action) {
        case 'open-tab':
            browser.tabs.create({url: message.data.url, active: !!message.data.active});
            break;

        case 'change-tab-url':
            const matchingTabs = await browser.tabs.query({index: message.data.tabIndex});

            if (1 !== matchingTabs.length) {
                return;
            }

            browser.tabs.update(matchingTabs[0].id, {url: message.data.url});
            break;
    }
}

client.onerror = function (error) {
    console.error(error);
};
