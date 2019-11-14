import { CommandBus } from '../../../../bus/command-bus';
import { UnmuteOpenedTab } from '../../../../tab/opened-tab/command';

export class UnmuteButton {
    constructor(containerElement: HTMLElement, private openedTabId: string, commandBus: CommandBus) {
        containerElement.addEventListener('click', () => {
            commandBus.handle(new UnmuteOpenedTab(this.openedTabId));
        });
    }

    setTabId(openedTabId: string) {
        this.openedTabId = openedTabId;
    }
}
