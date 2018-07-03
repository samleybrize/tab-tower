import { WebElement } from 'selenium-webdriver';

declare module 'selenium-webdriver' {
    type Origin = 'pointer'|'viewport';

    namespace error {
        class ElementClickInterceptedError {}
    }

    interface ActionMoveOptions {
        x?: number;
        y?: number;
        duration?: number;
        origin?: Origin|WebElement;
    }

    interface ActionSequence {
        move(options: ActionMoveOptions): ActionSequence;
        contextClick(element?: WebElement): ActionSequence;
    }
}
