import { OpenUiSmall } from '../command/open-ui-small';

export class UiSmallOpener {
    async openUiSmall(command: OpenUiSmall) {
        await browser.sidebarAction.open();
    }
}
