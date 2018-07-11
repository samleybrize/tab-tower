import { MoveOpenedTabs } from '../command/move-opened-tabs';
import { NativeTabIdAssociationGetter } from './native-tab-id-association-getter';

export class OpenedTabMover {
    constructor(private nativeTabIdAssociationGetter: NativeTabIdAssociationGetter) {
    }

    async moveOpenedTabs(command: MoveOpenedTabs) {
        const targetIndex = command.targetPosition;
        let nextIndexForIndexesHigherThanTargetIndex = targetIndex;

        for (const tabIdToMove of command.tabIdList) {
            const nativeTabIdToMove = await this.nativeTabIdAssociationGetter.getAssociatedNativeTabId(tabIdToMove);

            if (null == nativeTabIdToMove) {
                continue;
            }

            const tab = await browser.tabs.get(nativeTabIdToMove);

            if (-1 == targetIndex) {
                // move the tab at the end of the tab list
                await browser.tabs.move(nativeTabIdToMove, {index: targetIndex});
            } else if (tab.index < targetIndex) {
                // when a tab is moved, its index become unoccupied and higher indexes are then modified (they are lowered)
                await browser.tabs.move(nativeTabIdToMove, {index: targetIndex - 1});
            } else {
                await browser.tabs.move(nativeTabIdToMove, {index: nextIndexForIndexesHigherThanTargetIndex});
                nextIndexForIndexesHigherThanTargetIndex++;
            }
        }
    }
}
