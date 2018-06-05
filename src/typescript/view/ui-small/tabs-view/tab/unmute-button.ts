import { CommandBus } from '../../../../bus/command-bus';
import { UnmuteOpenedTab } from '../../../../tab/opened-tab/command';

export class UnmuteButton {
    constructor(containerElement: HTMLElement, openedTabId: string, commandBus: CommandBus) {
        containerElement.addEventListener('click', () => {
            commandBus.handle(new UnmuteOpenedTab(openedTabId));
        });
    }
}
