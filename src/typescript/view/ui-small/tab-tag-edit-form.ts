import { CommandBus } from '../../bus/command-bus';
import { QueryBus } from '../../bus/query-bus';
import { CreateTabTag } from '../../tab/tab-tag/command/create-tab-tag';
import { UpdateTabTag } from '../../tab/tab-tag/command/update-tab-tag';
import { GetTabTagById } from '../../tab/tab-tag/query/get-tab-tag-by-id';
import { ShowCreateTabTagForm } from './tab-tag-edit-form/command/show-create-tab-tag-form';
import { ShowEditTabTagForm } from './tab-tag-edit-form/command/show-edit-tab-tag-form';

const numberOfColors = 10;

export class TabTagEditForm {
    private labelInput: HTMLInputElement;
    private colorContainer: HTMLElement;
    private titleEditLabelElement: HTMLElement;
    private titleCreateLabelElement: HTMLElement;

    constructor(
        private containerElement: HTMLElement,
        private commandBus: CommandBus,
        private queryBus: QueryBus,
    ) {
        this.commandBus.register(ShowCreateTabTagForm, this.showCreateForm, this);
        this.commandBus.register(ShowEditTabTagForm, this.showEditForm, this);

        this.titleEditLabelElement = this.containerElement.querySelector('.header .edit');
        this.titleCreateLabelElement = this.containerElement.querySelector('.header .create');

        this.labelInput = this.containerElement.querySelector('.label input');
        this.colorContainer = this.containerElement.querySelector('.color-selector div');
        this.createColorButtons();

        this.containerElement.querySelector('.cancel-button').addEventListener('click', () => {
            this.hide();
        });
        this.containerElement.querySelector('.submit').addEventListener('click', () => {
            this.save();
        });
        this.labelInput.addEventListener('keypress', (event) => {
            // enter key
            if (13 === event.keyCode) {
                this.save();
            }
        });
    }

    private createColorButtons() {
        for (let colorId = 0; colorId < numberOfColors; colorId++) {
            const elementId = 'tab-tag-edit-color-' + Math.random();

            const labelElement = document.createElement('label');
            labelElement.setAttribute('for', elementId);
            labelElement.classList.add(`color-${colorId}`);

            const inputElement = document.createElement('input');
            inputElement.id = elementId;
            inputElement.setAttribute('type', 'radio');
            inputElement.setAttribute('name', 'color');
            inputElement.setAttribute('value', '' + colorId);

            this.colorContainer.appendChild(inputElement);
            this.colorContainer.appendChild(labelElement);
        }
    }

    private hide() {
        this.containerElement.classList.remove('show');
    }

    async showCreateForm(command: ShowCreateTabTagForm) {
        this.containerElement.removeAttribute('data-tag-id');
        this.labelInput.value = '';
        this.selectDefaultColor();

        this.titleEditLabelElement.classList.add('hide');
        this.titleCreateLabelElement.classList.remove('hide');

        this.containerElement.classList.add('show');
        this.labelInput.focus();
    }

    private selectDefaultColor() {
        this.selectColor(0);
    }

    private selectColor(colorId: number) {
        const colorButton = this.colorContainer.querySelector(`input[value="${colorId}"]`) as HTMLSelectElement;

        if (colorButton) {
            colorButton.click();
        } else {
            this.selectDefaultColor();
        }
    }

    async showEditForm(command: ShowEditTabTagForm) {
        this.containerElement.classList.add('show');

        const tag = await this.queryBus.query(new GetTabTagById(command.tagId));

        if (tag) {
            this.containerElement.setAttribute('data-tag-id', command.tagId);
            this.labelInput.value = tag.label;
            this.selectColor(tag.colorId);

            this.titleEditLabelElement.classList.remove('hide');
            this.titleCreateLabelElement.classList.add('hide');

            this.labelInput.focus();
        } else {
            this.hide();
        }
    }

    private async save() {
        const tagId = this.containerElement.getAttribute('data-tag-id');
        const label = this.labelInput.value;
        const colorId = this.getSelectedColorValue();

        if (tagId) {
            this.commandBus.handle(new UpdateTabTag(tagId, label, colorId));
        } else {
            this.commandBus.handle(new CreateTabTag(label, colorId));
        }

        this.hide();
    }

    private getSelectedColorValue() {
        const selectedColorElement = this.colorContainer.querySelector('input:checked') as HTMLSelectElement;

        if (null == selectedColorElement) {
            return;
        }

        const colorId = selectedColorElement.value;

        if ('string' == typeof colorId && colorId.length > 0) {
            return +colorId;
        } else {
            return null;
        }
    }
}

export class TabTagEditFormFactory {
    constructor(private commandBus: CommandBus, private queryBus: QueryBus) {
    }

    create(containerElement: HTMLElement) {
        return new TabTagEditForm(containerElement, this.commandBus, this.queryBus);
    }
}
