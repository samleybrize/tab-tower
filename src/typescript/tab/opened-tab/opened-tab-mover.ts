import { MoveOpenedTabs } from '../command/move-opened-tabs';

export class OpenedTabMover {
    async moveOpenedTabs(command: MoveOpenedTabs) {
        let targetIndex = command.targetIndex;

        for (const tabIdToMove of command.tabIdList) {
            browser.tabs.move(tabIdToMove, {index: targetIndex});
            targetIndex++;
        }
    }
}
