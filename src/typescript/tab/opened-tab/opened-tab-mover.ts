import { MoveOpenedTabs } from './command/move-opened-tabs';

export class OpenedTabMover {
    async moveOpenedTabs(command: MoveOpenedTabs) {
        const targetIndex = command.targetIndex;
        let nextIndexForIndexesHigherThanTargetIndex = targetIndex;

        for (const tabIdToMove of command.tabIdList) {
            const tab = await browser.tabs.get(tabIdToMove);

            if (tab.index < targetIndex) {
                // when a tab is moved, its index become unoccupied and higher indexes are then modified (they are lowered)
                await browser.tabs.move(tabIdToMove, {index: targetIndex - 1});
            } else {
                await browser.tabs.move(tabIdToMove, {index: nextIndexForIndexesHigherThanTargetIndex});
                nextIndexForIndexesHigherThanTargetIndex++;
            }
        }
    }
}
