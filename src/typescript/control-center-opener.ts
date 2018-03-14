import { GoToControlCenter } from './tab/command/go-to-control-center';

export class ControlCenterOpener {
    constructor(private controlCenterDesktopUrl: string) {
    }

    async goToControlCenter(command: GoToControlCenter) {
        const controlCenterTabs = await browser.tabs.query({url: this.controlCenterDesktopUrl});

        if (controlCenterTabs.length > 0) {
            browser.tabs.update(controlCenterTabs[0].id, {active: true});

            return;
        }

        browser.tabs.create({
            active: true,
            index: 0,
            url: this.controlCenterDesktopUrl,
        });
    }
}
