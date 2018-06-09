import { TestsConfig } from '../tests-config';

const testsConfig = TestsConfig.getInstance();
const client = new WebSocket('ws://localhost:' + testsConfig.browserInstructionPort);

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
