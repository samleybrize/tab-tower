import { CommandBus } from '../../../bus/command-bus';
import { OpenTab } from '../../../tab/opened-tab/command';

export class NewTabButton {
    constructor(element: HTMLElement, commandBus: CommandBus) {
        element.addEventListener('click', () => {
            commandBus.handle(new OpenTab(true));
        });
    }
}

export class NewTabButtonFactory {
    constructor(private commandBus: CommandBus) {
    }

    create(element: HTMLElement) {
        return new NewTabButton(element, this.commandBus);
    }
}
