import { When } from 'cucumber';
import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { TabSupport } from '../support/tab-support';
import { World } from '../support/world';

When('I click on the settings button in the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const settingsButton = webdriver.findElement(By.css('.sidenav .settings'));

    // TODO TabSupport ?
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        settingsButton,
        `Settings button in the sidenav is not clickable`,
    );
});

When('I click on the sidenav back button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const backButton = webdriver.findElement(By.css('.sidenav .close-sidenav-button'));

    // TODO TabSupport ?
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        backButton,
        `Sidenav back button is not clickable`,
    );
});

When('I click on "all opened tabs" on the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const rowElement = webdriver.findElement(By.css('.sidenav .all-opened-tabs'));

    // TODO TabSupport ?
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        rowElement,
        `"all opened tabs" is not clickable`,
    );
});

When('I click on the tag {int} on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const tagElement = await getTagAtPosition(webdriver, tagPosition);

    // TODO TabSupport ?
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        tagElement,
        `Tag "${tagPosition}" on the sidenav is not clickable`,
    );
});

When('I click on the sidenav "add tag" button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const addTagButton = webdriver.findElement(By.css('.sidenav .new-tag-button'));

    // TODO TabSupport ?
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        addTagButton,
        `Sidenav add tag button is not clickable`,
    );
});

When('I type {string} in the tag filter input on the sidenav', async function(inputText: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const filterInputElement = webdriver.findElement(By.css('.sidenav .tab-tag-list .filter input'));
    await filterInputElement.sendKeys(inputText);
});

When('I delete all characters in the tag filter input on the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const filterInputElement = webdriver.findElement(By.css('.sidenav .tab-tag-list .filter input'));
    await filterInputElement.clear();
});

When('I click on the tag context menu edit button of the tag {int} on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    const buttonElement = tagElement.findElement(By.css('.context-menu .edit-button'));

    await clickOnTagContextMenuButton(webdriver, tagElement, buttonElement, `Tag context menu edit button of tag at position ${tagPosition} on the sidenav is not clickable`);
});

When('I click on the tag context menu delete button of the tag {int} on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    const buttonElement = tagElement.findElement(By.css('.context-menu .delete-button'));

    await clickOnTagContextMenuButton(webdriver, tagElement, buttonElement, `Tag context menu delete button of tag at position ${tagPosition} on the sidenav is not clickable`);
});

When('I click on the yes button on the tag {int} delete confirmation box on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    const buttonElement = tagElement.findElement(By.css('.delete-confirmation .yes'));

    // TODO TabSupport ?
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        buttonElement,
        `Tag delete confirmation "yes" button of tag at position ${tagPosition} on the sidenav is not clickable`,
    );
});

When('I click on the no button on the tag {int} delete confirmation box on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    const buttonElement = tagElement.findElement(By.css('.delete-confirmation .no'));

    // TODO TabSupport ?
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        buttonElement,
        `Tag delete confirmation "no" button of tag at position ${tagPosition} on the sidenav is not clickable`,
    );
});

When('I right click on the tag {int} on the sidenav', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);

    await openTagContextMenu(webdriver, tagElement, `Failed to open the context menu of the tag ${tagPosition} on the sidenav`);
});

When('I click outside of the tag context menu on the sidenav', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const headerElement = webdriver.findElement(By.css('.sidenav .header'));

    await webdriver.actions().move({origin: headerElement}).click().perform();
});

// TODO duplicated
async function getTagAtPosition(webdriver: WebDriver, tagPosition: number, condition?: 'visible'|'filtered') {
    let includeTagSelector = '';

    if ('filtered' == condition) {
        includeTagSelector = '.hide';
    } else {
        includeTagSelector = ':not(.hide)';
    }

    let tag: WebElement;
    await webdriver.wait(async () => {
        const tagList = await webdriver.findElements(By.css(`.sidenav .tab-tag-list .tab-tag${includeTagSelector}`));
        tag = tagList[tagPosition];

        return !!tag;
    }, 10000, `Tag at position ${tagPosition} on the sidenav does not exists`);

    return tag;
}

async function openTagContextMenu(webdriver: WebDriver, tag: WebElement, errorMessage: string) {
    try {
        await webdriver.actions().contextClick(tag).perform();
    } catch (error) {
        throw new Error(`${errorMessage} - Error: ${error}`);
    }
}

async function clickOnTagContextMenuButton(webdriver: WebDriver, tab: WebElement, buttonElement: WebElement, errorMessage: string) {
    await openTagContextMenu(webdriver, tab, `${errorMessage} (context menu could not be shown)`);
    await TabSupport.clickElementOnceAvailable(webdriver, buttonElement, errorMessage); // TODO TabSupport ??
}
