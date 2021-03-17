import { Button, By, error as WebDriverError, Key, WebElement } from 'selenium-webdriver';
import { WebDriverRetriever } from '../../../webdriver/webdriver-retriever';

export class BrowserSupport {
    constructor(private webdriverRetriever: WebDriverRetriever, private waitTimeout: number) {
    }

    async hoverElement(element: WebElement) {
        const webdriver = this.webdriverRetriever.getDriver();
        await webdriver.actions().move({origin: element}).perform();
    }

    async throwErrorIfElementIsClickable(element: WebElement, errorMessage: string) {
        try {
            await element.click();
        } catch (error) {
            if (error instanceof WebDriverError.ElementClickInterceptedError || error instanceof WebDriverError.ElementNotInteractableError) {
                return;
            }

            throw error;
        }

        throw new Error(errorMessage);
    }

    async clickElementOnceAvailable(element: WebElement, failMessage: string, expectedAttribute?: {name: string, value: string}) {
        const webdriver = this.webdriverRetriever.getDriver();

        if (expectedAttribute) {
            await webdriver.wait(async () => {
                const attributeValue = await element.getAttribute(expectedAttribute.name);

                return expectedAttribute.value === attributeValue;
            }, 10000);
        }

        await webdriver.wait(async () => {
            try {
                await element.click();

                return true;
            } catch (error) {
                if (
                    error instanceof WebDriverError.ElementClickInterceptedError
                    || error instanceof WebDriverError.ElementNotInteractableError
                ) {
                    return false;
                }

                throw error;
            }
        }, this.waitTimeout, failMessage);
    }

    async contextClickElementOnceAvailable(element: WebElement, failMessage: string) {
        const webdriver = this.webdriverRetriever.getDriver();

        await webdriver.wait(async () => {
            if (!await this.isElementClickable(element)) {
                return false;
            }

            try {
                await webdriver.actions().contextClick(element).perform();

                return true;
            } catch (error) {
                if (error instanceof WebDriverError.MoveTargetOutOfBoundsError) {
                    return false;
                }

                throw error;
            }
        }, this.waitTimeout, failMessage);
    }

    async isElementClickable(element: WebElement): Promise<boolean> {
        if (await element.getAttribute('disabled')) {
            return false;
        }

        return !await this.isCenterOfElementObscured(element);
    }

    private async isCenterOfElementObscured(element: WebElement) {
        const webdriver = this.webdriverRetriever.getDriver();

        return !await webdriver.executeScript((domElement: HTMLElement) => {
            const elementRect = domElement.getBoundingClientRect();
            const point = {
                x: Math.round((elementRect.width / 2) + elementRect.left),
                y: Math.round((elementRect.height / 2) + elementRect.top),
            };
            const elementFromPoint = document.elementFromPoint(point.x, point.y);

            return domElement.contains(elementFromPoint);
        }, element);
    }

    async shiftClickElement(element: WebElement) {
        const webdriver = this.webdriverRetriever.getDriver();
        await webdriver.actions().keyDown(Key.SHIFT).click(element).keyUp(Key.SHIFT).perform();
    }

    async middleClickElement(element: WebElement) {
        const webdriver = this.webdriverRetriever.getDriver();
        await webdriver.actions().move({origin: element}).press(Button.MIDDLE).release(Button.MIDDLE).perform();
    }

    async hasCssClass(element: WebElement, cssClass: string): Promise<boolean> {
        const classAttribute = '' + await element.getAttribute('class');
        const cssClassList = classAttribute.split(' ');

        return cssClassList.indexOf(cssClass) >= 0;
    }

    async getElementViewportCoordinates(element: WebElement): Promise<ClientRect> {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.executeScript((e: HTMLElement) => {
            return e.getBoundingClientRect();
        }, element) as Promise<ClientRect>;
    }

    async isElementFullyContainedInContainerElement(element: WebElement, containerElement: WebElement) {
        if (!await element.isDisplayed()) {
            return false;
        }

        const containerCoordinates = await this.getElementViewportCoordinates(containerElement);
        const elementCoordinates = await this.getElementViewportCoordinates(element);

        if (elementCoordinates.top < containerCoordinates.top || elementCoordinates.bottom > containerCoordinates.bottom) {
            return false;
        }

        return true;
    }

    async isElementTextOnOneLine(element: WebElement): Promise<boolean> {
        const webdriver = this.webdriverRetriever.getDriver();

        return webdriver.executeScript<boolean>((e: HTMLElement) => {
            const originalHeight = e.offsetHeight;
            const originalText = e.textContent;
            e.textContent = 'I';
            const newHeight = e.offsetHeight;
            e.textContent = originalText;

            return originalHeight === newHeight;
        }, element);
    }

    async selectOption(selectElement: WebElement, optionValue: string) {
        await selectElement.findElement(By.css(`option[value="${optionValue}"]`)).click();
    }

    getSelectedValue(selectElement: WebElement) {
        return selectElement.findElement(By.css('option:checked')).getAttribute('value');
    }

    async getNumberOfVisibleElements(elementList: WebElement[]): Promise<number> {
        let numberOfVisibleElements = 0;

        for (const element of elementList) {
            try {
                if (await element.isDisplayed()) {
                    numberOfVisibleElements++;
                }
            } catch (error) {
                if (!(error instanceof WebDriverError.StaleElementReferenceError)) {
                    throw error;
                }
            }
        }

        return numberOfVisibleElements;
    }
}
