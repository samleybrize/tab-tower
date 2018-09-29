import { CommandBus } from '../../../bus/command-bus';
import { EventBus } from '../../../bus/event-bus';
import { QueryBus } from '../../../bus/query-bus';
import { TabTagCreated } from '../../../tab/tab-tag/event/tab-tag-created';
import { TabTagDeleted } from '../../../tab/tab-tag/event/tab-tag-deleted';
import { TabTagUpdated } from '../../../tab/tab-tag/event/tab-tag-updated';
import { GetTabTags } from '../../../tab/tab-tag/query';
import { TabTag } from '../../../tab/tab-tag/tab-tag';
import { TaskScheduler, TaskSchedulerFactory } from '../../../utils/task-scheduler';
import { ShowCreateTabTagForm } from '../tab-tag-edit-form/command/show-create-tab-tag-form.ts';
import { SidenavTabTagFilter, SidenavTabTagFilterFactory } from './sidenav-tab-tag-filter';
import { TabTagEntry, TabTagEntryFactory } from './tab-tag-entry';

export class SidenavTabTagList {
    private tabTagFilter: SidenavTabTagFilter;
    private tabTagMap = new Map<string, TabTagEntry>();
    private tabTagList: TabTagEntry[] = [];

    constructor(
        private containerElement: HTMLElement,
        private commandBus: CommandBus,
        eventBus: EventBus,
        private queryBus: QueryBus,
        sidenavTabTagFilterFactory: SidenavTabTagFilterFactory,
        private tabTagEntryFactory: TabTagEntryFactory,
        private taskScheduler: TaskScheduler,
    ) {
        this.tabTagFilter = sidenavTabTagFilterFactory.create(containerElement.querySelector('.filter'));

        this.taskScheduler.add(async () => {
            eventBus.subscribe(TabTagCreated, this.onTabTagCreate, this);
            eventBus.subscribe(TabTagDeleted, this.onTabTagDelete, this);
            eventBus.subscribe(TabTagUpdated, this.onTabTagUpdate, this);

            const tagList = await this.queryBus.query(new GetTabTags());
            tagList.sort((a, b) => {
                return a.label.localeCompare(b.label);
            });

            for (const tag of tagList) {
                this.addTabTag(tag, false);
            }

            this.tabTagFilter.observeFilterResultRetrieval(this.onTagFilterResultRetrieve.bind(this));
            this.tabTagFilter.observeFilterClear(this.onTagFilterClear.bind(this));
        }).executeAll();

        containerElement.querySelector('.new-tag-button').addEventListener('click', () => {
            this.commandBus.handle(new ShowCreateTabTagForm());
        });
    }

    private addTabTag(tag: TabTag, sort: boolean) {
        const tagEntry = this.tabTagEntryFactory.create(tag.id, tag.label, tag.hexColor);

        if (sort) {
            this.insertTagEntryElement(tagEntry);
        } else {
            this.insertTagEntryAsLastElement(tagEntry);
        }
    }

    private insertTagEntryElement(tagEntryToInsert: TabTagEntry) {
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

    private insertTagEntryAsLastElement(tagEntryToInsert: TabTagEntry) {
        if (this.tabTagMap.has(tagEntryToInsert.id)) {
            this.removeTabTabFromTagList(tagEntryToInsert);
        }

        this.tabTagMap.set(tagEntryToInsert.id, tagEntryToInsert);
        this.tabTagList.push(tagEntryToInsert);
        this.containerElement.appendChild(tagEntryToInsert.htmlElement);
    }

    private removeTabTag(tagId: string) {
        const tagEntry = this.tabTagMap.get(tagId);

        if (tagEntry) {
            this.tabTagMap.delete(tagId);
            this.removeTabTabFromTagList(tagEntry);
            tagEntry.htmlElement.remove();
        }
    }

    private removeTabTabFromTagList(tagEntry: TabTagEntry) {
        const indexInTagList = this.tabTagList.indexOf(tagEntry);

        if (indexInTagList >= 0) {
            this.tabTagList.splice(indexInTagList, 1);
        }
    }

    async onTabTagCreate(event: TabTagCreated) {
        this.taskScheduler.add(async () => {
            this.addTabTag(event.tag, true);
        }).executeAll();
    }

    async onTabTagUpdate(event: TabTagUpdated) {
        this.taskScheduler.add(async () => {
            const tagEntry = this.tabTagMap.get(event.tag.id);

            if (tagEntry) {
                tagEntry.updateLabel(event.tag.label);
                tagEntry.updateColor(event.tag.hexColor);
                this.insertTagEntryElement(tagEntry);
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
    }

    private onTagFilterClear() {
        for (const tagEntry of this.tabTagList) {
            tagEntry.unhide();
        }
    }
}

export class SidenavTabTagListFactory {
    constructor(
        private commandBus: CommandBus,
        private eventBus: EventBus,
        private queryBus: QueryBus,
        private sidenavTabTagFilterFactory: SidenavTabTagFilterFactory,
        private tabTagEntryFactory: TabTagEntryFactory,
        private taskSchedulerFactory: TaskSchedulerFactory,
    ) {
    }

    create(containerElement: HTMLElement) {
        return new SidenavTabTagList(
            containerElement,
            this.commandBus,
            this.eventBus,
            this.queryBus,
            this.sidenavTabTagFilterFactory,
            this.tabTagEntryFactory,
            this.taskSchedulerFactory.create(),
        );
    }
}
