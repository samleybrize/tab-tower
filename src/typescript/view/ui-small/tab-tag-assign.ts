import { CommandBus } from '../../bus/command-bus';
import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { AddTabTagToOpenedTab, RemoveTabTagFromOpenedTab } from '../../tab/opened-tab/command';
import { GetOpenedTabById } from '../../tab/opened-tab/query';
import { TabTagCreated } from '../../tab/tab-tag/event/tab-tag-created';
import { TabTagDeleted } from '../../tab/tab-tag/event/tab-tag-deleted';
import { TabTagUpdated } from '../../tab/tab-tag/event/tab-tag-updated';
import { GetTabTags } from '../../tab/tab-tag/query/get-tab-tags';
import { TabTag } from '../../tab/tab-tag/tab-tag';
import { TaskScheduler, TaskSchedulerFactory } from '../../utils/task-scheduler';
import { ManageTabTagAssignment } from './tab-tab-assign/command/manage-tab-tag-assignment';
import { CheckboxState, TabTagAssignEntry, TabTagAssignEntryFactory } from './tab-tab-assign/tab-tag-assign-entry';
import { TabTagAssignFilter, TabTagAssignFilterFactory } from './tab-tab-assign/tab-tag-assign-filter';
import { ShowCreateTabTagForm } from './tab-tag-edit-form/command/show-create-tab-tag-form';

// TODO rename (TabTagAssignmentManager ?)
export class TabTagAssign {
    private tabTagFilter: TabTagAssignFilter;
    private tabTagList: TabTagAssignEntry[] = [];
    private tabTagMap = new Map<string, TabTagAssignEntry>();
    private tabTagListContainer: HTMLElement;
    private noTagMatchesSearchElement: HTMLElement;
    private assignToTabIdList: string[] = [];
    private tagCheckState: Map<string, CheckboxState>;

    constructor(
        private containerElement: HTMLElement,
        private commandBus: CommandBus,
        private eventBus: EventBus,
        private queryBus: QueryBus,
        tabTagAssignFilterFactory: TabTagAssignFilterFactory,
        private tabTagAssignEntryFactory: TabTagAssignEntryFactory,
        private taskScheduler: TaskScheduler,
    ) {
        this.commandBus.register(ManageTabTagAssignment, this.show, this);

        this.tabTagListContainer = this.containerElement.querySelector('.content');

        this.containerElement.querySelector('.cancel-button').addEventListener('click', () => {
            this.hide();
        });
        this.containerElement.querySelector('.new-tag-button').addEventListener('click', () => {
            this.commandBus.handle(new ShowCreateTabTagForm());
        });

        this.taskScheduler.add(async () => {
            this.eventBus.subscribe(TabTagCreated, this.onTabTagCreate, this);
            this.eventBus.subscribe(TabTagDeleted, this.onTabTagDelete, this);
            this.eventBus.subscribe(TabTagUpdated, this.onTabTagUpdate, this);

            this.noTagMatchesSearchElement = this.createNoTagMatchesSearchElement();
            this.containerElement.appendChild(this.noTagMatchesSearchElement);

            const tagList = await this.queryBus.query(new GetTabTags());
            tagList.sort((a, b) => {
                return a.label.localeCompare(b.label);
            });

            for (const tag of tagList) {
                this.addTabTag(tag, false);
            }

            this.tabTagFilter = tabTagAssignFilterFactory.create(containerElement.querySelector('.filter'));
            this.tabTagFilter.observeFilterResultRetrieval(this.onTagFilterResultRetrieve.bind(this));
            this.tabTagFilter.observeFilterClear(this.onTagFilterClear.bind(this));
        }).executeAll();
    }

    private createNoTagMatchesSearchElement() {
        const element = document.createElement('div');
        element.classList.add('no-tag-matches-search');
        element.classList.add('hide');
        element.textContent = 'No tag matches your search';

        return element;
    }

    private addTabTag(tag: TabTag, sort: boolean) {
        const tagEntry = this.tabTagAssignEntryFactory.create(tag.id, tag.label, tag.colorId);
        tagEntry.observeCheckStateChange((tagId, newState) => {
            const oldState = this.tagCheckState.get(tag.id) || 'unchecked';
            this.tagCheckState.set(tag.id, newState);

            if ('indeterminate' === newState || oldState === newState) {
                return;
            }

            const command = 'checked' === newState ? AddTabTagToOpenedTab : RemoveTabTagFromOpenedTab;

            for (const openedTabId of this.assignToTabIdList) {
                this.commandBus.handle(new command(openedTabId, tag.id));
            }
        });

        if (sort) {
            this.insertTagEntryElement(tagEntry);
        } else {
            this.insertTagEntryAsLastElement(tagEntry);
        }

        return tagEntry;
    }

    private insertTagEntryElement(tagEntryToInsert: TabTagAssignEntry) {
        if (this.tabTagMap.has(tagEntryToInsert.id)) {
            this.removeTabTabFromTagList(tagEntryToInsert);
        }

        let insertAtTheEnd = true;

        const insertAtIndex = this.tabTagList.findIndex((tabEntry) => {
            const labelToCompare = tabEntry.getLabel().toLocaleLowerCase();
            const toInsertLabel = tagEntryToInsert.getLabel().toLocaleLowerCase();

            return tabEntry.id !== tagEntryToInsert.id && labelToCompare.localeCompare(toInsertLabel) > 0;
        });

        if (insertAtIndex >= 0) {
            this.tabTagList[insertAtIndex].htmlElement.insertAdjacentElement('beforebegin', tagEntryToInsert.htmlElement);
            this.tabTagList.splice(insertAtIndex, 0, tagEntryToInsert);
            insertAtTheEnd = false;
        }

        if (insertAtTheEnd) {
            this.insertTagEntryAsLastElement(tagEntryToInsert);
        } else {
            this.tabTagMap.set(tagEntryToInsert.id, tagEntryToInsert);
        }
    }

    private insertTagEntryAsLastElement(tagEntryToInsert: TabTagAssignEntry) {
        if (this.tabTagMap.has(tagEntryToInsert.id)) {
            this.removeTabTabFromTagList(tagEntryToInsert);
        }

        this.tabTagMap.set(tagEntryToInsert.id, tagEntryToInsert);
        this.tabTagList.push(tagEntryToInsert);
        this.tabTagListContainer.appendChild(tagEntryToInsert.htmlElement);
    }

    private removeTabTag(tagId: string) {
        const tagEntry = this.tabTagMap.get(tagId);

        if (tagEntry) {
            this.tabTagMap.delete(tagId);
            this.removeTabTabFromTagList(tagEntry);
            tagEntry.htmlElement.remove();
        }
    }

    private removeTabTabFromTagList(tagEntry: TabTagAssignEntry) {
        const indexInTagList = this.tabTagList.indexOf(tagEntry);

        if (indexInTagList >= 0) {
            this.tabTagList.splice(indexInTagList, 1);
        }
    }

    private hide() {
        this.containerElement.classList.remove('show');
    }

    async show(command: ManageTabTagAssignment) {
        this.assignToTabIdList = command.openedTabIdList;
        this.tagCheckState = new Map<string, CheckboxState>();
        const numberOfTabsAssignedToTags = new Map<string, number>();

        for (const openedTabId of this.assignToTabIdList) {
            const openedTab = await this.queryBus.query(new GetOpenedTabById(openedTabId));
            const tabTagIdList = openedTab.tabTagIdList.filter((v, i, a) => a.indexOf(v) === i); // TODO unique values, due to a bug in firefox

            for (const assignedTagId of tabTagIdList) {
                numberOfTabsAssignedToTags.set(
                    assignedTagId,
                    (numberOfTabsAssignedToTags.get(assignedTagId) | 0) + 1,
                );
            }
        }

        for (const tabTag of this.tabTagList) {
            const numberOfAssignedTabs = numberOfTabsAssignedToTags.get(tabTag.id);

            if (numberOfAssignedTabs === command.openedTabIdList.length) {
                this.tagCheckState.set(tabTag.id, 'checked');
                tabTag.markAsChecked();
            } else if (numberOfAssignedTabs > 0) {
                this.tagCheckState.set(tabTag.id, 'indeterminate');
                tabTag.markAsIndeterminate();
            } else {
                this.tagCheckState.set(tabTag.id, 'unchecked');
                tabTag.markAsUnchecked();
            }
        }

        this.containerElement.classList.add('show');
    }

    async onTabTagCreate(event: TabTagCreated) {
        this.taskScheduler.add(async () => {
            const tagEntry = this.addTabTag(event.tag, true);

            if (await this.tabTagFilter.isTabTagSatisfiesFilter(tagEntry.id)) {
                tagEntry.unhide();
            } else {
                tagEntry.hide();
            }
        }).executeAll();
    }

    async onTabTagUpdate(event: TabTagUpdated) {
        this.taskScheduler.add(async () => {
            const tagEntry = this.tabTagMap.get(event.tag.id);

            if (tagEntry) {
                tagEntry.updateLabel(event.tag.label);
                tagEntry.updateColor(event.tag.colorId);
                this.insertTagEntryElement(tagEntry);

                if (await this.tabTagFilter.isTabTagSatisfiesFilter(tagEntry.id)) {
                    tagEntry.unhide();
                } else {
                    tagEntry.hide();
                }
            }
        }).executeAll();
    }

    async onTabTagDelete(event: TabTagDeleted) {
        this.taskScheduler.add(async () => {
            this.removeTabTag(event.tag.id);
        }).executeAll();
    }

    private onTagFilterResultRetrieve(matchingTagIds: string[]) {
        for (const tagEntry of this.tabTagList) {
            if (matchingTagIds.indexOf(tagEntry.id) >= 0) {
                tagEntry.unhide();
            } else {
                tagEntry.hide();
            }
        }

        if (matchingTagIds.length > 0) {
            this.noTagMatchesSearchElement.classList.add('hide');
        } else {
            this.noTagMatchesSearchElement.classList.remove('hide');
        }
    }

    private onTagFilterClear() {
        this.noTagMatchesSearchElement.classList.add('hide');

        for (const tagEntry of this.tabTagList) {
            tagEntry.unhide();
        }
    }
}

export class TabTagAssignFactory {
    constructor(
        private commandBus: CommandBus,
        private eventBus: EventBus,
        private queryBus: QueryBus,
        private tabTagAssignFilterFactory: TabTagAssignFilterFactory,
        private tabTagAssignEntryFactory: TabTagAssignEntryFactory,
        private taskSchedulerFactory: TaskSchedulerFactory) {
    }

    create(containerElement: HTMLElement) {
        return new TabTagAssign(containerElement, this.commandBus, this.eventBus, this.queryBus, this.tabTagAssignFilterFactory, this.tabTagAssignEntryFactory, this.taskSchedulerFactory.create());
    }
}
