export enum IndicatorType {
    Audible = 'audible',
    Followed = 'followed',
    Incognito = 'incognito',
    Muted = 'muted',
    Opened = 'opened',
    Pinned = 'pinned',
    ReaderView = 'readerView',
}

interface IndicatorDescriptor {
    cssClassName: string;
}
interface BadgeIndicatorDescriptor extends IndicatorDescriptor {
    cssClassName: string;
    label: string;
}
interface IconIndicatorDescriptor extends IndicatorDescriptor {
    cssClassName: string;
    iconName: string;
    tooltipTextWhenOn: string;
}

const badgeIndicatorDescriptors = new Map<IndicatorType, BadgeIndicatorDescriptor>();
badgeIndicatorDescriptors.set(IndicatorType.Followed, {cssClassName: 'followedIndicator', label: 'followed'});
badgeIndicatorDescriptors.set(IndicatorType.Incognito, {cssClassName: 'incognitoIndicator', label: 'incognito'});
badgeIndicatorDescriptors.set(IndicatorType.Muted, {cssClassName: 'muteIndicator', label: 'muted'});
badgeIndicatorDescriptors.set(IndicatorType.Opened, {cssClassName: 'openIndicator', label: 'opened'});
badgeIndicatorDescriptors.set(IndicatorType.Pinned, {cssClassName: 'pinIndicator', label: 'pinned'});
badgeIndicatorDescriptors.set(IndicatorType.ReaderView, {cssClassName: 'readerModeIndicator', label: 'reader view'});

const iconIndicatorDescriptors = new Map<IndicatorType, IconIndicatorDescriptor>();
iconIndicatorDescriptors.set(IndicatorType.Audible, {cssClassName: 'audibleIndicator', iconName: 'volume_up', tooltipTextWhenOn: 'Produces sound'});

export class IndicatorManipulator {
    create(indicatorType: IndicatorType) {
        if (badgeIndicatorDescriptors.has(indicatorType)) {
            const indicatorDescriptor = badgeIndicatorDescriptors.get(indicatorType);

            return this.createBadgeIndicator(indicatorDescriptor.cssClassName, indicatorDescriptor.label);
        } else if (iconIndicatorDescriptors.has(indicatorType)) {
            const indicatorDescriptor = iconIndicatorDescriptors.get(indicatorType);

            return this.createIconIndicator(indicatorDescriptor.cssClassName, indicatorDescriptor.iconName);
        } else {
            console.error(`Uknown indicator type "${indicatorType}"`);
        }
    }

    private createBadgeIndicator(className: string, label: string) {
        const indicatorElement = document.createElement('span');
        indicatorElement.classList.add(className);
        indicatorElement.classList.add('indicator');
        indicatorElement.classList.add('badge');
        indicatorElement.classList.add('off');
        indicatorElement.innerHTML = `<i class="material-icons">cancel</i> <span>${label}</span>`;

        return indicatorElement;
    }

    private createIconIndicator(className: string, iconName: string) {
        const indicatorElement = document.createElement('span');
        indicatorElement.classList.add(className);
        indicatorElement.classList.add('indicator');
        indicatorElement.classList.add('off');
        indicatorElement.innerHTML = `<i class="material-icons">${iconName}</i>`;

        return indicatorElement;
    }

    turnOn(row: HTMLElement, indicatorType: IndicatorType) {
        this.changeState(row, indicatorType, true);
    }

    turnOff(row: HTMLElement, indicatorType: IndicatorType) {
        this.changeState(row, indicatorType, false);
    }

    changeState(row: HTMLElement, indicatorType: IndicatorType, isOn: boolean) {
        const isBadge = badgeIndicatorDescriptors.has(indicatorType);
        const isIcon = iconIndicatorDescriptors.has(indicatorType);

        let indicatorDescriptor: IndicatorDescriptor;

        if (isBadge) {
            indicatorDescriptor = badgeIndicatorDescriptors.get(indicatorType);
        } else if (isIcon) {
            indicatorDescriptor = iconIndicatorDescriptors.get(indicatorType);
        } else {
            console.error(`Uknown indicator type "${indicatorType}"`);
        }

        const indicatorElement = row.querySelector(`.${indicatorDescriptor.cssClassName}`) as HTMLElement;
        let classToAdd: string;
        let classToRemove: string;

        if (null == indicatorElement) {
            return;
        } else if (isOn) {
            classToAdd = 'on';
            classToRemove = 'off';
        } else {
            classToAdd = 'off';
            classToRemove = 'on';
        }

        indicatorElement.classList.add(classToAdd);
        indicatorElement.classList.remove(classToRemove);

        if (isBadge) {
            this.changeBadgeIndicatorState(indicatorElement, indicatorDescriptor as BadgeIndicatorDescriptor, isOn);
        } else if (isIcon) {
            this.changeIconIndicatorState(indicatorElement, indicatorDescriptor as IconIndicatorDescriptor, isOn);
        }
    }

    private changeBadgeIndicatorState(indicatorElement: HTMLElement, indicatorDescriptor: BadgeIndicatorDescriptor, isOn: boolean) {
        const badgeIcon = isOn ? 'check_circle' : 'cancel';
        indicatorElement.querySelector('.material-icons').textContent = badgeIcon;
    }

    private changeIconIndicatorState(indicatorElement: HTMLElement, indicatorDescriptor: IconIndicatorDescriptor, isOn: boolean) {
        if (isOn && indicatorDescriptor.tooltipTextWhenOn) {
            indicatorElement.setAttribute('data-tooltip', indicatorDescriptor.tooltipTextWhenOn);
            jQuery(indicatorElement).tooltip();
        } else {
            jQuery(indicatorElement).tooltip('remove');
        }
    }
}
