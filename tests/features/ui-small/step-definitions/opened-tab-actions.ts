import { When } from 'cucumber';
import { WebElement } from 'selenium-webdriver';
import { TabContextMenuButtons } from '../support/opened-tab-list-support';
import { World } from '../support/world';

When('I click on the close button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const closeButton = openedTabListSupport.getTabCloseButtonElement(tab);

    await browserSupport.hoverElement(tab);
    await browserSupport.clickElementOnceAvailable(
        closeButton,
        `Close button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`,
    );
});

When('I click on the mute button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const muteButton = openedTabListSupport.getTabAudibleIconElement(tab);

    await browserSupport.hoverElement(tab);
    await browserSupport.clickElementOnceAvailable(
        muteButton,
        `Mute button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`,
    );
});

When('I click on the unmute button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const unmuteButton = openedTabListSupport.getTabMutedIconElement(tab);

    await browserSupport.hoverElement(tab);
    await browserSupport.clickElementOnceAvailable(
        unmuteButton,
        `Unmute button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`,
    );
});

When('I click on the mute button of the sticky focused tab', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getStickyFocusedTab();
    const muteButton = openedTabListSupport.getTabAudibleIconElement(tab);

    await browserSupport.hoverElement(tab);
    await browserSupport.clickElementOnceAvailable(
        muteButton,
        `Mute button of the sticky focused tab is not clickable`,
    );
});

When('I click on the unmute button of the sticky focused tab', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getStickyFocusedTab();
    const unmuteButton = openedTabListSupport.getTabMutedIconElement(tab);

    await browserSupport.hoverElement(tab);
    await browserSupport.clickElementOnceAvailable(
        unmuteButton,
        `Unmute button of sticky focused tab is not clickable`,
    );
});

When('I click on the title of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const titleContainer = openedTabListSupport.getTabTitleContainerElement(tab);

    await browserSupport.hoverElement(tab);
    await browserSupport.clickElementOnceAvailable(
        titleContainer,
        `Title of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`,
    );
});

When('I click where the title of the tab {int} on the tab list {string} is', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    await webdriver.actions().move({origin: tab}).click().perform();
});

When('I hover the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    await browserSupport.hoverElement(tab);
});

When('I click on the tab selector of the tab {int} on tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const tabSelectorElement = openedTabListSupport.getTabSelectorElement(tab);

    await browserSupport.hoverElement(tab);
    await browserSupport.clickElementOnceAvailable(
        tabSelectorElement,
        `Tab selector of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`,
    );
});

When('I shift click on the tab selector of the tab {int} on tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const tabSelectorElement = openedTabListSupport.getTabSelectorElement(tab);

    await browserSupport.shiftClickElement(tabSelectorElement);
});

When('I middle click on the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

    await browserSupport.middleClickElement(tab);
});

When('I right click on the title of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');

    await openTabContextMenu(world, tab, `The title of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`);
});

When('I click on the tab context menu reload button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, TabContextMenuButtons.RELOAD);

    await clickOnTabContextMenuButton(world, tab, buttonElement, `Tab context menu reload button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`);
});

When('I click on the tab context menu mute button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, TabContextMenuButtons.MUTE);

    await clickOnTabContextMenuButton(world, tab, buttonElement, `Tab context menu mute button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`);
});

When('I click on the tab context menu unmute button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, TabContextMenuButtons.UNMUTE);

    await clickOnTabContextMenuButton(world, tab, buttonElement, `Tab context menu unmute button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`);
});

When('I click on the tab context menu pin button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, TabContextMenuButtons.PIN);

    await clickOnTabContextMenuButton(world, tab, buttonElement, `Tab context menu pin button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`);
});

When('I click on the tab context menu unpin button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, TabContextMenuButtons.UNPIN);

    await clickOnTabContextMenuButton(world, tab, buttonElement, `Tab context menu unpin button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`);
});

When('I click on the tab context menu duplicate button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, TabContextMenuButtons.DUPLICATE);

    await clickOnTabContextMenuButton(world, tab, buttonElement, `Tab context menu duplicate button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`);
});

When('I click on the tab context menu discard button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, TabContextMenuButtons.DISCARD);

    await clickOnTabContextMenuButton(world, tab, buttonElement, `Tab context menu discard button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`);
});

When('I click on the tab context menu close button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, TabContextMenuButtons.CLOSE);

    await clickOnTabContextMenuButton(world, tab, buttonElement, `Tab context menu close button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`);
});

When('I click on the tab context menu manage tags button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, TabContextMenuButtons.MANAGE_TAGS);

    await clickOnTabContextMenuButton(world, tab, buttonElement, `Tab context menu manage tags button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`);
});

When('I click on the tab context menu manage tags button of the sticky focused tab', async function() {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getStickyFocusedTab();
    const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, TabContextMenuButtons.MANAGE_TAGS);

    await clickOnTabContextMenuButton(world, tab, buttonElement, `Tab context menu manage tags button of the sticky focused tab is not clickable`);
});

When('I click on the tab context menu move button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabContextMenuButtonElement(tab, TabContextMenuButtons.MOVE);

    await clickOnTabContextMenuButton(world, tab, buttonElement, `Tab context menu move button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`);
});

When('I click on the move above button of the tab {int} on the tab list {string}', async function(tabPosition: number, tabListId: string) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const openedTabListSupport = world.openedTabListSupport;

    const tab = await openedTabListSupport.getTabAtPosition(tabListId, tabPosition, 'visible');
    const buttonElement = openedTabListSupport.getTabMoveAboveButtonElement(tab);

    await browserSupport.clickElementOnceAvailable(buttonElement, `Tab move above button of tab at position ${tabPosition} of tab list "${tabListId}" is not clickable`);
});

async function openTabContextMenu(world: World, tab: WebElement, errorMessage: string) {
    const titleElement = world.openedTabListSupport.getTabTitleElement(tab);
    await world.browserSupport.contextClickElementOnceAvailable(titleElement, errorMessage);
}

async function clickOnTabContextMenuButton(world: World, tab: WebElement, buttonElement: WebElement, errorMessage: string) {
    await openTabContextMenu(world, tab, `${errorMessage} (context menu could not be shown)`);
    await world.browserSupport.clickElementOnceAvailable(buttonElement, errorMessage);
}
