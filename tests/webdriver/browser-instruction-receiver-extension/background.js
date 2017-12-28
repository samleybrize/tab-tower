const client = new WebSocket('ws://localhost:8888');

client.onmessage = function (event) {
    const message = JSON.parse(event.data);

    switch (message.action) {
        case 'open-tab':
            browser.tabs.create({url: message.data.url, active: !!message.data.active});
            break;
    }
}

client.onerror = function (error) {
    console.error(error);
};
