import { When } from 'cucumber';
import { By, Key, WebDriver, WebElement } from 'selenium-webdriver';
import { SelectedTabsContextMenuButtons } from '../support/tabs-view-support';
import { World } from '../support/world';

When('I click on the "go to sidenav" button', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const tabsViewSupport = world.tabsViewSupport;

    const button = tabsViewSupport.getGoToSidenavButtonElement();

    await browserSupport.clickElementOnceAvailable(
        button,
        '"go to sidenav" button is not clickable',
        {name: 'data-init', value: '1'},
    );
});

When('I type {string} in the tab filter input', async function(filterText: string) {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const inputElement = tabsViewSupport.getTabFilterInputElement();
    await inputElement.sendKeys(filterText);
});

When('I delete all characters in the tab filter input', async function() {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const inputElement = tabsViewSupport.getTabFilterInputElement();
    await inputElement.clear();
});

When('I click on the clear tab filter button', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getTabFilterClearInputElement();

    await browserSupport.clickElementOnceAvailable(
        buttonElement,
        'Clear tab filter button is not clickable',
    );
});

When('I click on the general tab selector', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const tabsViewSupport = world.tabsViewSupport;

    const generalTabSelectorElement = tabsViewSupport.getGeneralTabSelectorClickableElement();

    await browserSupport.clickElementOnceAvailable(
        generalTabSelectorElement,
        'General tab selector is not clickable',
    );
});

When('I click on the new tab button', async function() {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const newTabButtonElement = tabsViewSupport.getNewTabButtonElement();
    await newTabButtonElement.click();
});

When('I click outside of the tab context menu', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const visibleContextMenuBoundingRect = await getVisibleContextMenuBoundingRect(webdriver);
    const tabSelector = await getTabSelectorNotHiddenByRect(webdriver, visibleContextMenuBoundingRect);

    await webdriver.actions().move({origin: tabSelector}).click().perform();
});

When('I click on the selected tabs actions button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tabsViewSupport = world.tabsViewSupport;

    const selectedTabsActionsButton = tabsViewSupport.getSelectedTabsActionsButtonElement();
    await selectedTabsActionsButton.click();
});

When('I click on the selected tabs actions reload button', async function() {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getSelectedTabsContextMenuButtonElement(SelectedTabsContextMenuButtons.RELOAD);
    await clickOnSelectedTabsContextMenuButton(world, buttonElement, 'Selected tabs actions reload button is not clickable');
});

When('I click on the selected tabs actions mute button', async function() {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getSelectedTabsContextMenuButtonElement(SelectedTabsContextMenuButtons.MUTE);
    await clickOnSelectedTabsContextMenuButton(world, buttonElement, 'Selected tabs actions mute button is not clickable');
});

When('I click on the selected tabs actions unmute button', async function() {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getSelectedTabsContextMenuButtonElement(SelectedTabsContextMenuButtons.UNMUTE);
    await clickOnSelectedTabsContextMenuButton(world, buttonElement, 'Selected tabs actions unmute button is not clickable');
});

When('I click on the selected tabs actions pin button', async function() {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getSelectedTabsContextMenuButtonElement(SelectedTabsContextMenuButtons.PIN);
    await clickOnSelectedTabsContextMenuButton(world, buttonElement, 'Selected tabs actions pin button is not clickable');
});

When('I click on the selected tabs actions unpin button', async function() {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getSelectedTabsContextMenuButtonElement(SelectedTabsContextMenuButtons.UNPIN);
    await clickOnSelectedTabsContextMenuButton(world, buttonElement, 'Selected tabs actions unpin button is not clickable');
});

When('I click on the selected tabs actions duplicate button', async function() {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getSelectedTabsContextMenuButtonElement(SelectedTabsContextMenuButtons.DUPLICATE);
    await clickOnSelectedTabsContextMenuButton(world, buttonElement, 'Selected tabs actions duplicate button is not clickable');
});

When('I click on the selected tabs actions discard button', async function() {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getSelectedTabsContextMenuButtonElement(SelectedTabsContextMenuButtons.DISCARD);
    await clickOnSelectedTabsContextMenuButton(world, buttonElement, 'Selected tabs actions discard button is not clickable');
});

When('I click on the selected tabs actions close button', async function() {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getSelectedTabsContextMenuButtonElement(SelectedTabsContextMenuButtons.CLOSE);
    await clickOnSelectedTabsContextMenuButton(world, buttonElement, 'Selected tabs actions close button is not clickable');
});

When('I click on the selected tabs actions manage tags button', async function() {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getSelectedTabsContextMenuButtonElement(SelectedTabsContextMenuButtons.MANAGE_TAGS);
    await clickOnSelectedTabsContextMenuButton(world, buttonElement, 'Selected tabs actions manage tags button is not clickable');
});

When('I click on the selected tabs actions move button', async function() {
    const world = this as World;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getSelectedTabsContextMenuButtonElement(SelectedTabsContextMenuButtons.MOVE);
    await clickOnSelectedTabsContextMenuButton(world, buttonElement, 'Selected tabs actions move button is not clickable');
});

When('I click on the move below all button', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getMoveBelowAllButtonElement();
    await browserSupport.clickElementOnceAvailable(buttonElement, 'The move tab below all button is not clickable');
});

When('I click on the cancel tab move button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const browserSupport = world.browserSupport;
    const tabsViewSupport = world.tabsViewSupport;

    const buttonElement = tabsViewSupport.getCancelTabMoveButtonClickableElement();
    await browserSupport.clickElementOnceAvailable(buttonElement, 'The cancel tab move button is not clickable');
});

When('I scroll the unpinned tabs list down', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const openedTabListSupport = world.openedTabListSupport;

    const unpinnedTabsElement = openedTabListSupport.getUnpinnedTabsListElement();

    await webdriver.actions().move({origin: unpinnedTabsElement}).click().sendKeys(Key.ARROW_DOWN, Key.ARROW_DOWN, Key.ARROW_DOWN, Key.ARROW_DOWN).perform();
});

async function getVisibleContextMenuBoundingRect(webdriver: WebDriver) {
    const contextMenuList = await webdriver.findElements(By.css('.tab-list .context-menu'));
    let visibleContextMenu: WebElement = null;

    for (const contextMenu of contextMenuList) {
        if (!await contextMenu.isDisplayed()) {
            visibleContextMenu = contextMenu;

            break;
        }
    }

    if (null === visibleContextMenu) {
        throw new Error('No visible context menu found');
    }

    return webdriver.executeScript<Promise<ClientRect>>((element: HTMLElement) => {
        return element.getBoundingClientRect();
    }, visibleContextMenu);
}

async function getTabSelectorNotHiddenByRect(webdriver: WebDriver, rect: ClientRect) {
    const tabSelectorList = await webdriver.findElements(By.css('.tab-list .tab-selector'));

    for (const tabSelector of tabSelectorList) {
        const tabSelectorRect = await webdriver.executeScript<Promise<ClientRect>>((element: HTMLElement) => {
            return element.getBoundingClientRect();
        }, tabSelector);

        if (tabSelectorRect.top > rect.bottom || tabSelectorRect.bottom < rect.top || tabSelectorRect.right < rect.left || tabSelectorRect.left > rect.right) {
            return tabSelector;
        }
    }
}

async function openSelectedTabsContextMenu(world: World, errorMessage: string) {
    const buttonElement = world.tabsViewSupport.getSelectedTabsActionsButtonElement();
    await world.browserSupport.clickElementOnceAvailable(buttonElement, errorMessage);
}

async function clickOnSelectedTabsContextMenuButton(
    world: World,
    buttonElement: WebElement,
    errorMessage: string,
) {
    await openSelectedTabsContextMenu(world, `${errorMessage} (context menu could not be shown)`);
    await world.browserSupport.clickElementOnceAvailable(buttonElement, errorMessage);
}
