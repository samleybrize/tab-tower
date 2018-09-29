import { CommandBus } from '../../bus/command-bus';
import { QueryBus } from '../../bus/query-bus';
import { CreateTabTag, UpdateTabTag } from '../../tab/tab-tag/command';
import { GetTabTagById } from '../../tab/tab-tag/query/get-tab-tag-by-id';
import { ColorManipulator } from '../../utils/color-maniplator';
import { ShowCreateTabTagForm } from './tab-tag-edit-form/command/show-create-tab-tag-form.ts';
import { ShowEditTabTagForm } from './tab-tag-edit-form/command/show-edit-tab-tag-form.ts';

const hexColorList: string[] = [
    null,
    'ff0000',
    '00ff00',
    'ffa500',
    'ff00ff',
    '00ffff',
    'ffff00',
    '6495ed',
    'da70d6',
    'cd953f',
];

export class TabTagEditForm {
    private labelInput: HTMLInputElement;
    private colorContainer: HTMLElement;
    private titleEditLabelElement: HTMLElement;
    private titleCreateLabelElement: HTMLElement;

    constructor(
        private containerElement: HTMLElement,
        private commandBus: CommandBus,
        private queryBus: QueryBus,
        private colorManipulator: ColorManipulator,
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
        for (const hexColor of hexColorList) {
            const elementId = 'tab-tag-edit-color-' + Math.random();

            const labelElement = document.createElement('label');
            labelElement.setAttribute('for', elementId);
            labelElement.innerHTML = '<i class="material-icons">done</i>';

            const inputElement = document.createElement('input');
            inputElement.id = elementId;
            inputElement.setAttribute('type', 'radio');
            inputElement.setAttribute('name', 'color');

            if (hexColor) {
                const strokeColor = this.colorManipulator.darken(hexColor, 20);
                inputElement.setAttribute('value', hexColor);
                labelElement.style.backgroundColor = `#${hexColor}`;
                labelElement.style.border = `1px solid #${strokeColor}`;
                labelElement.style.textShadow = `-1px -1px 0 #${strokeColor}bb, 1px -1px 0 #${strokeColor}bb, -1px 1px 0 #${strokeColor}bb, 1px 1px 0 #${strokeColor}bb`;
            }

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
        const colorButton = this.colorContainer.querySelector('input ') as HTMLSelectElement;
        colorButton.click();
    }

    private selectColor(hexColor: string) {
        const colorButton = this.colorContainer.querySelector(`input[value="${hexColor}"]`) as HTMLSelectElement;

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
            tag.hexColor ? this.selectColor(tag.hexColor) : this.selectDefaultColor();

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
        const hexColor = this.getSelectedColorValue();

        if (tagId) {
            this.commandBus.handle(new UpdateTabTag(tagId, label, hexColor));
        } else {
            this.commandBus.handle(new CreateTabTag(label, hexColor));
        }

        this.hide();
    }

    private getSelectedColorValue() {
        const selectedColorElement = this.colorContainer.querySelector('input:checked') as HTMLSelectElement;

        if (null == selectedColorElement) {
            return;
        }

        const hexColor = selectedColorElement.value;

        if ('string' == typeof hexColor && hexColor.length > 0) {
            return hexColor;
        } else {
            return null;
        }
    }
}

export class TabTagEditFormFactory {
    constructor(private commandBus: CommandBus, private queryBus: QueryBus, private colorManipulator: ColorManipulator) {
    }

    create(containerElement: HTMLElement) {
        return new TabTagEditForm(containerElement, this.commandBus, this.queryBus, this.colorManipulator);
    }
}
