import { When } from 'cucumber';
import { By, WebDriver, WebElement } from 'selenium-webdriver';
import { TabSupport } from '../support/tab-support';
import { World } from '../support/world';

When('I click on the tab tag management back button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const backButton = webdriver.findElement(By.css('.tab-tag-assign .cancel-button'));

    // TODO TabSupport ?
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        backButton,
        `Tab tag management back button is not clickable`,
    );
});

When('I click on the tab tag management view "add tag" button', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const addTagButton = webdriver.findElement(By.css('.tab-tag-assign .new-tag-button'));

    // TODO TabSupport ?
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        addTagButton,
        `Tab tag management view add tag button is not clickable`,
    );
});

When('I click on the tag {int} checkbox in the tab tag management view', async function(tagPosition: number) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();
    const tagElement = await getTagAtPosition(webdriver, tagPosition);
    const checkboxContainer = await tagElement.findElement(By.css('.checkbox'));
    const checkboxState = await checkboxContainer.getAttribute('state');
    let checkboxElement: WebElement;

    if ('checked' == checkboxState) {
        checkboxElement = await checkboxContainer.findElement(By.css('.checked-icon'));
    } else if ('unchecked' == checkboxState) {
        checkboxElement = await checkboxContainer.findElement(By.css('.unchecked-icon'));
    } else {
        checkboxElement = await checkboxContainer.findElement(By.css('.indeterminate-icon'));
    }

    // TODO TabSupport ?
    await TabSupport.clickElementOnceAvailable(
        webdriver,
        checkboxElement,
        `The checkbox of the tag "${tagPosition}" in the tab tag management view is not clickable`,
    );
});

When('I type {string} in the tag filter input on the tab tag management view', async function(inputText: string) {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const filterInputElement = webdriver.findElement(By.css('.tab-tag-assign .filter input'));
    await filterInputElement.sendKeys(inputText);
});

When('I delete all characters in the tag filter input on the tab tag management view', async function() {
    const world = this as World;
    const webdriver = world.webdriverRetriever.getDriver();

    const filterInputElement = webdriver.findElement(By.css('.tab-tag-assign .filter input'));
    await filterInputElement.clear();
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
        const tagList = await webdriver.findElements(By.css(`.tab-tag-assign .tab-tag${includeTagSelector}`));
        tag = tagList[tagPosition];

        return !!tag;
    }, 10000, `Tag at position ${tagPosition} on the tab tag management view does not exists`);

    return tag;
}
