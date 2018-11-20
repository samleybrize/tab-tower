import { CommandBus } from '../../bus/command-bus';
import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { TaskScheduler, TaskSchedulerFactory } from '../../utils/task-scheduler';
import { HideSidenav } from './sidenav/command/hide-sidenav';
import { ShowSidenav } from './sidenav/command/show-sidenav';
import { SidenavEntry } from './sidenav/sidenav-entry';
import { SidenavTabTagListFactory } from './sidenav/sidenav-tab-tag-list';
import { ShowAllOpenedTabs } from './tabs-view/command/show-all-opened-tabs';

export class Sidenav {
    private allOpenedTabsEntry: SidenavEntry;
    private activeEntry: SidenavEntry;

    constructor(
        private containerElement: HTMLElement,
        private commandBus: CommandBus,
        eventBus: EventBus,
        private queryBus: QueryBus, // TODO still needed?
        sidenavTabTagListFactory: SidenavTabTagListFactory,
        private taskScheduler: TaskScheduler, // TODO still needed?
    ) {
        const tabTagListElement = this.containerElement.querySelector('.tab-tag-list') as HTMLElement;
        const sidenavTabTagList = sidenavTabTagListFactory.create(tabTagListElement);
        sidenavTabTagList.observeActiveEntryChange((newActiveEntry) => {
            this.onActiveEntryChange(newActiveEntry);
        });

        this.allOpenedTabsEntry = new SidenavEntry(this.containerElement.querySelector('.row.all-opened-tabs'));
        this.onActiveEntryChange(this.allOpenedTabsEntry);
        this.allOpenedTabsEntry.observeClick(() => {
            this.commandBus.handle(new ShowAllOpenedTabs());
            this.hide(null);
            this.onActiveEntryChange(this.allOpenedTabsEntry);

            browser.storage.local.remove('active-tab-tag'); // TODO
        });

        this.containerElement.querySelector('.close-sidenav-button').addEventListener('click', () => {
            this.hide(null);
        });

        this.commandBus.register(ShowSidenav, this.show, this);
        this.commandBus.register(HideSidenav, this.hide, this);

        this.containerElement.querySelector('.settings').addEventListener('click', () => {
            browser.runtime.openOptionsPage();
        });
    }

    private onActiveEntryChange(newActiveEntry: SidenavEntry) {
        if (this.activeEntry) {
            this.activeEntry.markAsNotActive();
        }

        newActiveEntry.markAsActive();
        this.activeEntry = newActiveEntry;
    }

    async show(command: ShowSidenav) {
        this.containerElement.classList.add('show');
    }

    async hide(command: HideSidenav) {
        this.containerElement.classList.remove('show');
    }
}

export class SidenavFactory {
    constructor(
        private commandBus: CommandBus,
        private eventBus: EventBus,
        private queryBus: QueryBus,
        private sidenavTabTagListFactory: SidenavTabTagListFactory,
        private taskSchedulerFactory: TaskSchedulerFactory,
    ) {
    }

    create(containerElement: HTMLElement) {
        return new Sidenav(
            containerElement,
            this.commandBus,
            this.eventBus,
            this.queryBus,
            this.sidenavTabTagListFactory,
            this.taskSchedulerFactory.create(),
        );
    }
}
