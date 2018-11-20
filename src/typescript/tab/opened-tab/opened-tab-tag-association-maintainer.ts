import { EventBus } from '../../bus/event-bus';
import { TaskScheduler } from '../../utils/task-scheduler';
import { TabTagDeleted } from '../tab-tag/event/tab-tag-deleted';
import { AddTabTagToOpenedTab } from './command/add-tab-tag-to-opened-tab.ts';
import { RemoveTabTagFromOpenedTab } from './command/remove-tab-tag-from-opened-tab';
import { OpenedTabClosed } from './event/opened-tab-closed';
import { TabOpened } from './event/tab-opened';
import { TabTagAddedToOpenedTab } from './event/tab-tag-added-to-opened-tab';
import { TabTagRemovedFromOpenedTab } from './event/tab-tag-removed-from-opened-tab';
import { OpenedTabTagAssociationBackend } from './opened-tab-tag-association-backend';
import { GetTabCountForAllTags } from './query/get-tab-count-for-all-tags';

export class OpenedTabTagAssociationMaintainer {
    private openedTabToTagMap = new Map<string, string[]>();
    private tagToOpenedTabMap = new Map<string, string[]>();

    constructor(private eventBus: EventBus, private backend: OpenedTabTagAssociationBackend, private taskScheduler: TaskScheduler) {
    }

    async getAssociatedTabTagIdList(openedTabId: string): Promise<string[]> {
        if (!this.openedTabToTagMap.has(openedTabId)) {
            const tagIdList = await this.backend.getAssociatedTabTagIdList(openedTabId);
            this.addTagIdListToOpenedTab(openedTabId, tagIdList);
            this.addOpenedTabIdToTagIdList(openedTabId, tagIdList);
        }

        return this.openedTabToTagMap.get(openedTabId);
    }

    private addTagIdListToOpenedTab(openedTabId: string, tagIdList: string[]) {
        const isTabKnown = this.openedTabToTagMap.has(openedTabId);
        const associatedTagIdList = this.openedTabToTagMap.get(openedTabId) || [];

        for (const tagId of tagIdList) {
            associatedTagIdList.push(tagId);
        }

        if (!isTabKnown) {
            this.openedTabToTagMap.set(openedTabId, associatedTagIdList);
        }
    }

    private addOpenedTabIdToTagIdList(openedTabId: string, tagIdList: string[]) {
        for (const tagId of tagIdList) {
            const isTagKnown = this.tagToOpenedTabMap.has(tagId);
            const associatedTabIdList = this.tagToOpenedTabMap.get(tagId) || [];
            associatedTabIdList.push(openedTabId);

            if (!isTagKnown) {
                this.tagToOpenedTabMap.set(tagId, associatedTabIdList);
            }
        }
    }

    async queryTabCountForAllTags(query: GetTabCountForAllTags) {
        const countMap = new Map<string, number>();
        this.tagToOpenedTabMap.forEach((openedTabIdList, tagId) => {
            countMap.set(tagId, openedTabIdList.length);
        });

        return countMap;
    }

    async addTabTagToOpenedTab(command: AddTabTagToOpenedTab) {
        // TODO tag id is added twice on the tab (backend too?)
        await this.taskScheduler.add(async () => {
            if (this.isTagAssociatedToOpenedTab(command.tabId, command.tagId)) {
                return;
            }

            this.addTagIdListToOpenedTab(command.tabId, [command.tagId]);
            this.addOpenedTabIdToTagIdList(command.tabId, [command.tagId]);
            await this.backend.addTabTagToOpenedTab(command.tabId, command.tagId);

            this.eventBus.publish(new TabTagAddedToOpenedTab(command.tabId, command.tagId));
        }).executeAll();
    }

    private isTagAssociatedToOpenedTab(openedTabId: string, tagId: string) {
        const associatedTagList = this.openedTabToTagMap.get(openedTabId);

        return associatedTagList && associatedTagList.indexOf(tagId) >= 0;
    }

    async removeTabTagFromOpenedTab(command: RemoveTabTagFromOpenedTab) {
        await this.taskScheduler.add(async () => {
            if (!this.isTagAssociatedToOpenedTab(command.tabId, command.tagId)) {
                return;
            }

            this.removeTagFromOpenedTabMap(command.tabId, command.tagId);
            this.removeOpenedTabFromTagMap(command.tabId, command.tagId);
            await this.backend.removeTabTagFromOpenedTab(command.tabId, command.tagId);

            this.eventBus.publish(new TabTagRemovedFromOpenedTab(command.tabId, command.tagId));
        }).executeAll();
    }

    async onTabTagDelete(event: TabTagDeleted) {
        await this.taskScheduler.add(async () => {
            if (!this.tagToOpenedTabMap.has(event.tag.id)) {
                return;
            }

            const openedTabIdList = this.tagToOpenedTabMap.get(event.tag.id);

            for (const openedTabId of openedTabIdList) {
                this.removeTagFromOpenedTabMap(openedTabId, event.tag.id);
                await this.backend.removeTabTagFromOpenedTab(openedTabId, event.tag.id);
            }

            this.tagToOpenedTabMap.delete(event.tag.id);
        }).executeAll();
    }

    private removeTagFromOpenedTabMap(openedTabId: string, tagIdToRemove: string) {
        const tagList = this.openedTabToTagMap.get(openedTabId);

        if (null == tagList) {
            return;
        }

        const index = tagList.indexOf(tagIdToRemove);

        if (index >= 0) {
            tagList.splice(index, 1);
        }
    }

    async onTabOpen(event: TabOpened) {
        await this.getAssociatedTabTagIdList(event.tab.id);
    }

    async onTabClose(event: OpenedTabClosed) {
        const tagIdList = this.openedTabToTagMap.get(event.closedTab.id) || [];

        for (const tagId of tagIdList) {
            this.removeOpenedTabFromTagMap(event.closedTab.id, tagId);
        }

        this.openedTabToTagMap.delete(event.closedTab.id);
    }

    private removeOpenedTabFromTagMap(openedTabIdToRemove: string, tagId: string) {
        const openedTabList = this.tagToOpenedTabMap.get(tagId);

        if (null == openedTabList) {
            return;
        }

        const index = openedTabList.indexOf(openedTabIdToRemove);

        if (index >= 0) {
            openedTabList.splice(index, 1);
        }
    }
}
