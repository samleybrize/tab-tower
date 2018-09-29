import { CommandBus } from '../../bus/command-bus';
import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { TaskScheduler, TaskSchedulerFactory } from '../../utils/task-scheduler';
import { ShowSidenav } from './sidenav/command/show-sidenav';
import { SidenavEntry } from './sidenav/sidenav-entry';
import { SidenavTabTagListFactory } from './sidenav/sidenav-tab-tag-list';

export class Sidenav {
    private allOpenedTabsEntry: SidenavEntry;

    constructor(
        private containerElement: HTMLElement,
        private commandBus: CommandBus,
        eventBus: EventBus,
        private queryBus: QueryBus, // TODO still needed?
        sidenavTabTagListFactory: SidenavTabTagListFactory,
        private taskScheduler: TaskScheduler, // TODO still needed?
    ) {
        const tabTagListElement = this.containerElement.querySelector('.tab-tag-list') as HTMLElement;
        sidenavTabTagListFactory.create(tabTagListElement);

        this.allOpenedTabsEntry = new SidenavEntry(this.containerElement.querySelector('.row.all-opened-tabs'));
        this.allOpenedTabsEntry.markAsActive();

        this.containerElement.querySelector('.close-sidenav-button').addEventListener('click', () => {
            this.containerElement.classList.remove('show');
        });

        this.commandBus.register(ShowSidenav, this.show, this);

        // TODO all opened tabs

        this.containerElement.querySelector('.settings').addEventListener('click', () => {
            browser.runtime.openOptionsPage();
        });
    }

    async show(command: ShowSidenav) {
        this.containerElement.classList.add('show');
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
