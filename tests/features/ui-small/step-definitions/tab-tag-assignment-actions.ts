import { When } from 'cucumber';
import { World } from '../support/world';

When('I click on the tab tag assignment back button', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;

    const backButton = tabTagAssignmentSupport.getCancelButtonElement();

    await browserSupport.clickElementOnceAvailable(
        backButton,
        `Tab tag management back button is not clickable`,
    );
});

When('I click on the tab tag assignment view "add tag" button', async function() {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;

    const addTagButton = tabTagAssignmentSupport.getAddTagButtonElement();

    await browserSupport.clickElementOnceAvailable(
        addTagButton,
        `Tab tag management view add tag button is not clickable`,
    );
});

When('I click on the tag {int} checkbox in the tab tag assignment view', async function(tagPosition: number) {
    const world = this as World;
    const browserSupport = world.browserSupport;
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;

    const tagElement = await tabTagAssignmentSupport.getTagAtPosition(tagPosition, 'visible');
    const checkboxElement = await tabTagAssignmentSupport.getTagClickableCheckboxElement(tagElement);

    await browserSupport.clickElementOnceAvailable(
        checkboxElement,
        `The checkbox of the tag "${tagPosition}" in the tab tag assignment view is not clickable`,
    );
});

When('I type {string} in the tag filter input on the tab tag assignment view', async function(inputText: string) {
    const world = this as World;
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;

    const filterInputElement = tabTagAssignmentSupport.getFilterInputElement();
    await filterInputElement.sendKeys(inputText);
});

When('I delete all characters in the tag filter input on the tab tag assignment view', async function() {
    const world = this as World;
    const tabTagAssignmentSupport = world.tabTagAssignmentSupport;

    const filterInputElement = tabTagAssignmentSupport.getFilterInputElement();
    await filterInputElement.clear();
});
