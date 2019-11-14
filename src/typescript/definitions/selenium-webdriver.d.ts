import { Button, WebElement } from 'selenium-webdriver';

declare module 'selenium-webdriver' {
    type Origin = 'pointer'|'viewport';

    interface ActionMoveOptions {
        x?: number;
        y?: number;
        duration?: number;
        origin?: Origin|WebElement;
    }

    interface ActionSequence {
        move(options: ActionMoveOptions): ActionSequence;
        contextClick(element?: WebElement): ActionSequence;
        press(button?: string): ActionSequence;
        release(button?: string): ActionSequence;
    }
}
