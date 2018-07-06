import { When } from 'cucumber';
import { By, Key, WebDriver, WebElement } from 'selenium-webdriver';
import { TabSupport } from '../support/tab-support';
import { World } from '../support/world';

When('I click on the close button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    await webdriver.actions().move({origin: tab}).perform();

    const closeButton = tab.findElement(By.css('.close-button'));
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        closeButton,
        `Close button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`,
    );
});

When('I click on the mute button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    await webdriver.actions().move({origin: tab}).perform();

    const muteButton = tab.findElement(By.css('.audible-icon'));
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        muteButton,
        `Mute button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`,
    );
});

When('I click on the unmute button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    await webdriver.actions().move({origin: tab}).perform();

    const unmuteButton = tab.findElement(By.css('.muted-icon'));
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        unmuteButton,
        `Unmute button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`,
    );
});

When('I click on the title of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    await webdriver.actions().move({origin: tab}).perform();

    const titleContainer = tab.findElement(By.css('.title-container'));
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        titleContainer,
        `Title of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`,
    );
});

When('I click where the title of the tab {int} on the workspace {string} is', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    await webdriver.actions().move({origin: tab}).click().perform();
});

When('I hover the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    await webdriver.actions().move({origin: tab}).perform();
});

When('I click on the tab selector of the tab {int} on workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);

    await webdriver.actions().move({origin: tab}).perform();

    await TabSupport.clickElementOnceAvailable(
        webdriver,
        tab.findElement(By.css('.tab-selector')),
        `Tab selector of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`,
    );
});

When('I shift click on the tab selector of the tab {int} on workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    const tabSelector = tab.findElement(By.css('.tab-selector'));

    await webdriver.actions().keyDown(Key.SHIFT).click(tabSelector).keyUp(Key.SHIFT).perform();
});

When('I right click on the title of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);

    await showTabContextMenu(webdriver, tab, `The title of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`);
});

async function showTabContextMenu(webdriver: WebDriver, tab: WebElement, errorMessage: string) {
    const titleElement = tab.findElement(By.css('.title'));

    await webdriver.actions().contextClick(titleElement).perform();
}

When('I click on the tab context menu reload button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    const buttonElement = tab.findElement(By.css('.context-menu .reload-button'));

    await clickOnTabContextMenuButton(webdriver, tab, buttonElement, `Tab context menu reload button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`);
});

async function clickOnTabContextMenuButton(webdriver: WebDriver, tab: WebElement, buttonElement: WebElement, errorMessage: string) {
    await showTabContextMenu(webdriver, tab, `${errorMessage} (context menu could not be shown)`);
    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, errorMessage);
}

When('I click on the tab context menu mute button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    const buttonElement = tab.findElement(By.css('.context-menu .mute-button'));

    await clickOnTabContextMenuButton(webdriver, tab, buttonElement, `Tab context menu mute button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`);
});

When('I click on the tab context menu unmute button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    const buttonElement = tab.findElement(By.css('.context-menu .unmute-button'));

    await clickOnTabContextMenuButton(webdriver, tab, buttonElement, `Tab context menu unmute button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`);
});

When('I click on the tab context menu pin button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    const buttonElement = tab.findElement(By.css('.context-menu .pin-button'));

    await clickOnTabContextMenuButton(webdriver, tab, buttonElement, `Tab context menu pin button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`);
});

When('I click on the tab context menu unpin button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    const buttonElement = tab.findElement(By.css('.context-menu .unpin-button'));

    await clickOnTabContextMenuButton(webdriver, tab, buttonElement, `Tab context menu unpin button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`);
});

When('I click on the tab context menu duplicate button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    const buttonElement = tab.findElement(By.css('.context-menu .duplicate-button'));

    await clickOnTabContextMenuButton(webdriver, tab, buttonElement, `Tab context menu duplicate button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`);
});

When('I click on the tab context menu close button of the tab {int} on the workspace {string}', async function(tabPosition: number, workspaceId: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tab = await TabSupport.getTabAtPosition(webdriver, workspaceId, tabPosition);
    const buttonElement = tab.findElement(By.css('.context-menu .close-button'));

    await clickOnTabContextMenuButton(webdriver, tab, buttonElement, `Tab context menu close button of tab at position ${tabPosition} of workspace "${workspaceId}" is not clickable`);
});
