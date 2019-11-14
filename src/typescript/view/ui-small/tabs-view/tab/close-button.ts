import { CommandBus } from '../../../../bus/command-bus';
import { CloseOpenedTab } from '../../../../tab/opened-tab/command';

export class CloseButton {
    constructor(containerElement: HTMLElement, private openedTabId: string, commandBus: CommandBus) {
        containerElement.addEventListener('click', () => {
            commandBus.handle(new CloseOpenedTab(this.openedTabId));
        });
    }

    setTabId(openedTabId: string) {
        this.openedTabId = openedTabId;
    }
}
