import { CommandBus } from '../../../../bus/command-bus';
import { CloseOpenedTab } from '../../../../tab/opened-tab/command';

export class CloseButton {
    constructor(containerElement: HTMLElement, openedTabId: string, commandBus: CommandBus) {
        containerElement.addEventListener('click', () => {
            commandBus.handle(new CloseOpenedTab(openedTabId));
        });
    }
}
