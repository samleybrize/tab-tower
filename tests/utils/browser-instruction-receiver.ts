import { TestsConfig } from '../tests-config';

const testsConfig = TestsConfig.getInstance();

async function initBrowserInstructionReceiver() {
    const storageObject = await browser.storage.local.get('_test.browserInstructionPort');

    if (null == storageObject['_test.browserInstructionPort']) {
        setTimeout(initBrowserInstructionReceiver, 50);

        return;
    }

    const browserInstructionPort = storageObject['_test.browserInstructionPort'] as any;
    createWebSocketClient(browserInstructionPort);
}

async function createWebSocketClient(browserInstructionPort: number) {
    const client = new WebSocket('ws://localhost:' + browserInstructionPort);

    client.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        const args = JSON.stringify(message.args);
        const script = `(${message.script}).apply(null, ${args});`;
        let returnValue: any;

        try {
            /* tslint:disable:no-eval */
            returnValue = eval(script);
            /* tslint:enable:no-eval */

            if (returnValue instanceof Promise) {
                returnValue = await returnValue;
            }
        } catch (error) {
            returnValue = {error: error.message};
        }

        client.send(JSON.stringify({messageId: message.messageId, returnValue}));
    };

    client.onerror = (error) => {
        console.error(error);
    };
}

initBrowserInstructionReceiver();
