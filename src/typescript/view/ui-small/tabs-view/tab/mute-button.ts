import { CommandBus } from '../../../../bus/command-bus';
import { MuteOpenedTab } from '../../../../tab/opened-tab/command';

export class MuteButton {
    constructor(containerElement: HTMLElement, openedTabId: string, commandBus: CommandBus) {
        containerElement.addEventListener('click', () => {
            commandBus.handle(new MuteOpenedTab(openedTabId));
        });
    }
}
