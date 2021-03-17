import { When } from 'cucumber';
import { By, WebElement } from 'selenium-webdriver';
import { TagContextMenuButtons } from '../support/sidenav-support';
import { World } from '../support/world';

When('I click on the settings button in the sidenav', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const sidenavSupport = world.sidenavSupport;

    const settingsButton = sidenavSupport.getSettingsButtonElement();

    await browserSupport.clickElementOnceAvailable(
        settingsButton,
        `Settings button in the sidenav is not clickable`,
    );
});

When('I click on the sidenav back button', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const sidenavSupport = world.sidenavSupport;

    const backButton = sidenavSupport.getCloseButtonElement();

    await browserSupport.clickElementOnceAvailable(
        backButton,
        `Sidenav back button is not clickable`,
    );
});

When('I click on "all opened tabs" on the sidenav', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const sidenavSupport = world.sidenavSupport;

    const rowElement = sidenavSupport.getAllOpenedTabsButtonElement();

    await browserSupport.clickElementOnceAvailable(
        rowElement,
        `"all opened tabs" is not clickable`,
    );
});

When('I click on the tag {int} on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');

    await browserSupport.clickElementOnceAvailable(
        tagElement,
        `Tag "${tagPosition}" on the sidenav is not clickable`,
    );
});

When('I click on the sidenav "add tag" button', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const sidenavSupport = world.sidenavSupport;

    const addTagButton = sidenavSupport.getAddTagButtonElement();

    await browserSupport.clickElementOnceAvailable(
        addTagButton,
        `Sidenav add tag button is not clickable`,
    );
});

When('I type {string} in the tag filter input on the sidenav', async function(inputText: string) {
    const world = this as World;
    const sidenavSupport = world.sidenavSupport;

    const filterInputElement = sidenavSupport.getTagFilterInputElement();
    await filterInputElement.sendKeys(inputText);
});

When('I delete all characters in the tag filter input on the sidenav', async function() {
    const world = this as World;
    const sidenavSupport = world.sidenavSupport;

    const filterInputElement = sidenavSupport.getTagFilterInputElement();
    await filterInputElement.clear();
});

When('I click on the tag context menu edit button of the tag {int} on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');
    const buttonElement = sidenavSupport.getTabContextMenuButtonElement(tagElement, TagContextMenuButtons.EDIT);

    await clickOnTagContextMenuButton(world, tagElement, buttonElement, `Tag context menu edit button of tag at position ${tagPosition} on the sidenav is not clickable`);
});

When('I click on the tag context menu delete button of the tag {int} on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');
    const buttonElement = sidenavSupport.getTabContextMenuButtonElement(tagElement, TagContextMenuButtons.DELETE);

    await clickOnTagContextMenuButton(world, tagElement, buttonElement, `Tag context menu delete button of tag at position ${tagPosition} on the sidenav is not clickable`);
});

When('I click on the yes button on the tag {int} delete confirmation box on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');
    const buttonElement = sidenavSupport.getTagDeleteConfirmationYesButtonElement(tagElement);

    await browserSupport.clickElementOnceAvailable(
        buttonElement,
        `Tag delete confirmation "yes" button of tag at position ${tagPosition} on the sidenav is not clickable`,
    );
});

When('I click on the no button on the tag {int} delete confirmation box on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');
    const buttonElement = sidenavSupport.getTagDeleteConfirmationNoButtonElement(tagElement);

    await browserSupport.clickElementOnceAvailable(
        buttonElement,
        `Tag delete confirmation "no" button of tag at position ${tagPosition} on the sidenav is not clickable`,
    );
});

When('I right click on the tag {int} on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const sidenavSupport = world.sidenavSupport;

    const tagElement = await sidenavSupport.getTagAtPosition(tagPosition, 'visible');

    await openTagContextMenu(world, tagElement, `Failed to open the context menu of the tag ${tagPosition} on the sidenav`);
});

When('I click outside of the tag context menu on the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const sidenavSupport = world.sidenavSupport;

    const headerElement = sidenavSupport.getHeaderElement();

    await webdriver.actions().move({origin: headerElement}).click().perform();
});

async function openTagContextMenu(world: World, tag: WebElement, errorMessage: string) {
    await world.browserSupport.contextClickElementOnceAvailable(tag, errorMessage);
}

async function clickOnTagContextMenuButton(world: World, tab: WebElement, buttonElement: WebElement, errorMessage: string) {
    await openTagContextMenu(world, tab, `${errorMessage} (context menu could not be shown)`);
    await world.browserSupport.clickElementOnceAvailable(buttonElement, errorMessage);
}
