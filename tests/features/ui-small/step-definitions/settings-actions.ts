import { When } from 'cucumber';
import { World } from '../support/world';

When('I click on the checkbox of the tab middle click close setting', async function() {
    const world = this as World;
    const settingsSupport = world.settingsSupport;

    const checkboxElement = settingsSupport.getCloseTabOnMiddleClickElement();
    await checkboxElement.click();
});

When('I click on the checkbox of the tab close button on hover setting', async function() {
    const world = this as World;
    const settingsSupport = world.settingsSupport;

    const checkboxElement = settingsSupport.getShowTabCloseButtonOnHoverElement();
    await checkboxElement.click();
});

When('I click on the checkbox of the show tab title on several lines setting', async function() {
    const world = this as World;
    const settingsSupport = world.settingsSupport;

    const checkboxElement = settingsSupport.getShowTabTitleOnSeveralLinesElement();
    await checkboxElement.click();
});

When('I click on the checkbox of the show tab url on several lines setting', async function() {
    const world = this as World;
    const settingsSupport = world.settingsSupport;

    const checkboxElement = settingsSupport.getShowTabUrlOnSeveralLinesElement();
    await checkboxElement.click();
});

When('I set the show tab url setting to "domain only"', async function() {
    const world = this as World;

    await selectUrlSetting(world, 'domain');
});

When('I set the show tab url setting to "yes"', async function() {
    const world = this as World;

    await selectUrlSetting(world, 'url');
});

When('I set the show tab url setting to "no"', async function() {
    const world = this as World;

    await selectUrlSetting(world, 'none');
});

async function selectUrlSetting(world: World, value: string) {
    const selectorElement = world.settingsSupport.getShowTabUrlElement();
    await world.browserSupport.selectOption(selectorElement, value);
}
