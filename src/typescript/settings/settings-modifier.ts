import { EventBus } from '../bus/event-bus';
import { TaskScheduler } from '../utils/task-scheduler';
import { ConfigureCloseTabOnMiddleClick } from './command/configure-close-tab-on-middle-click';
import { ConfigureShowCloseButtonOnTabHover } from './command/configure-show-close-button-on-tab-hover';
import { ConfigureShowTabTitleOnSeveralLines } from './command/configure-show-tab-title-on-several-lines';
import { ConfigureShowTabUrlOnSeveralLines } from './command/configure-show-tab-url-on-several-lines';
import { ConfigureTabAddressToShow } from './command/configure-tab-address-to-show';
import { CloseTabOnMiddleClickConfigured } from './event/close-tab-on-middle-click-configured';
import { ShowCloseButtonOnTabHoverConfigured } from './event/show-close-button-on-tab-hover-configured';
import { ShowTabTitleOnSeveralLinesConfigured } from './event/show-tab-title-on-several-lines-configured';
import { ShowTabUrlOnSeveralLinesConfigured } from './event/show-tab-url-on-several-lines-configured';
import { TabAddressToShowConfigured } from './event/tab-address-to-show-configured';
import { SettingsPersister } from './settings-persister';

export class SettingsModifier {
    constructor(private eventBus: EventBus, private settingsPersister: SettingsPersister, private taskScheduler: TaskScheduler) {
    }

    async configureCloseTabOnMiddleClick(command: ConfigureCloseTabOnMiddleClick) {
        this.taskScheduler.add(async () => {
            const settings = await this.settingsPersister.get();
            settings.tabs.closeTabOnMiddleClick = command.closeTabOnMiddleClick;
            await this.settingsPersister.set(settings);

            this.eventBus.publish(new CloseTabOnMiddleClickConfigured(command.closeTabOnMiddleClick));
        }).executeAll();
    }

    async configureShowCloseButtonButtonOnTabHover(command: ConfigureShowCloseButtonOnTabHover) {
        this.taskScheduler.add(async () => {
            const settings = await this.settingsPersister.get();
            settings.tabs.showCloseButtonOnHover = command.showCloseButton;
            await this.settingsPersister.set(settings);

            this.eventBus.publish(new ShowCloseButtonOnTabHoverConfigured(command.showCloseButton));
        }).executeAll();
    }

    async configureShowTabTitleOnSeveralLines(command: ConfigureShowTabTitleOnSeveralLines) {
        this.taskScheduler.add(async () => {
            const settings = await this.settingsPersister.get();
            settings.tabs.showTitleOnSeveralLines = command.showTabTitleOnSeveralLines;
            await this.settingsPersister.set(settings);

            this.eventBus.publish(new ShowTabTitleOnSeveralLinesConfigured(command.showTabTitleOnSeveralLines));
        }).executeAll();
    }

    async configureShowTabUrlOnSeveralLines(command: ConfigureShowTabUrlOnSeveralLines) {
        this.taskScheduler.add(async () => {
            const settings = await this.settingsPersister.get();
            settings.tabs.showUrlOnSeveralLines = command.showTabUrlOnSeveralLines;
            await this.settingsPersister.set(settings);

            this.eventBus.publish(new ShowTabUrlOnSeveralLinesConfigured(command.showTabUrlOnSeveralLines));
        }).executeAll();
    }

    async configureTabAddressToShow(command: ConfigureTabAddressToShow) {
        this.taskScheduler.add(async () => {
            const settings = await this.settingsPersister.get();
            settings.tabs.addressToShow = command.tabAddressToShow;
            await this.settingsPersister.set(settings);

            this.eventBus.publish(new TabAddressToShowConfigured(command.tabAddressToShow));
        }).executeAll();
    }
}
