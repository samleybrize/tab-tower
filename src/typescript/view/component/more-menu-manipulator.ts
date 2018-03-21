export enum MoreActionType {
    Close = 'close',
    Delete = 'deleteRecentlyUnfollowedTab',
    Duplicate = 'duplicate',
    Follow = 'follow',
    Move = 'move',
    Mute = 'mute',
    Reload = 'reload',
    RestoreRecentlyUnfollowedTab = 'restoreRecentlyUnfollowedTab',
    Pin = 'pin',
    Separator = 'separator',
    Unfollow = 'unfollow',
    Unmute = 'unmute',
    Unpin = 'unpin',
}

export type MoreMenu = {[index in MoreActionType]?: MoreActionClickHandler};

export type MoreActionClickHandler = (clickedElement: HTMLAnchorElement) => void;

interface MoreActionDescriptor {
    cssClassName: string;
    label: string;
    iconName: string;
    isDangerous: boolean;
    isSeparator?: boolean;
}

const moreActionDescriptors: {[index in MoreActionType]: MoreActionDescriptor} = {
    close: {cssClassName: 'closeButton', label: 'Close', iconName: 'close', isDangerous: true},
    deleteRecentlyUnfollowedTab: {cssClassName: 'deleteRecentlyUnfollowedTabButton', label: 'Delete', iconName: 'delete', isDangerous: true},
    duplicate: {cssClassName: 'duplicateButton', label: 'Duplicate', iconName: 'content_copy', isDangerous: false},
    follow: {cssClassName: 'followButton', label: 'Follow', iconName: 'settings_backup_restore', isDangerous: false},
    move: {cssClassName: 'moveButton', label: 'Move', iconName: 'swap_vert', isDangerous: false},
    mute: {cssClassName: 'muteButton', label: 'Mute', iconName: 'volume_off', isDangerous: false},
    reload: {cssClassName: 'reloadButton', label: 'Reload', iconName: 'autorenew', isDangerous: false},
    restoreRecentlyUnfollowedTab: {cssClassName: 'restoreRecentlyUnfollowedTabButton', label: 'Restore', iconName: 'settings_backup_restore', isDangerous: false},
    pin: {cssClassName: 'pinButton', label: 'Pin', iconName: 'stars', isDangerous: false},
    separator: {cssClassName: null, label: null, iconName: null, isDangerous: false, isSeparator: true},
    unfollow: {cssClassName: 'unfollowButton', label: 'Unfollow', iconName: 'not_interested', isDangerous: true},
    unmute: {cssClassName: 'unmuteButton', label: 'Unmute', iconName: 'volume_up', isDangerous: false},
    unpin: {cssClassName: 'unpinButton', label: 'Unpin', iconName: 'stars', isDangerous: false},
};

export class MoreMenuManipulator {
    create(moreMenu: MoreMenu, idPrefix: string, buttonTooltipText: string, isHidden: boolean) {
        const dropdownId = `${idPrefix}-tab-action`;
        const moreButton = this.createMoreButton(dropdownId, buttonTooltipText);
        const dropdownElement = this.createMoreDropdown(moreMenu, dropdownId);

        const element = document.createElement('div');
        element.appendChild(moreButton);
        element.appendChild(dropdownElement);

        if (isHidden) {
            moreButton.classList.add('transparent');
        }

        return element;
    }

    private createMoreButton(dropdownId: string, buttonTooltipText: string) {
        const moreButton = document.createElement('a');
        moreButton.classList.add('more');
        moreButton.classList.add('waves-effect');
        moreButton.classList.add('waves-teal');
        moreButton.classList.add('btn-flat');
        moreButton.setAttribute('data-activates', dropdownId);
        moreButton.setAttribute('href', '#');
        moreButton.setAttribute('data-tooltip', buttonTooltipText);
        moreButton.innerHTML = '<i class="material-icons">more_vert</i>';
        jQuery(moreButton).tooltip();

        return moreButton;
    }

    private createMoreDropdown(moreMenu: MoreMenu, dropdownId: string) {
        const dropdownElement = document.createElement('ul');
        dropdownElement.classList.add('dropdown-content');
        dropdownElement.classList.add('tabRowDropdown');
        dropdownElement.setAttribute('id', dropdownId);

        const actionTypeList = Object.getOwnPropertyNames(moreMenu) as MoreActionType[];

        for (const actionType of actionTypeList) {
            const actionDescriptor = moreActionDescriptors[actionType];
            const actionClickListener = moreMenu[actionType];

            if (actionDescriptor.isSeparator) {
                this.addActionSeparator(dropdownElement);
            } else {
                this.addAction(dropdownElement, actionDescriptor.label, actionDescriptor.cssClassName, actionDescriptor.iconName, actionDescriptor.isDangerous, actionClickListener);
            }
        }

        return dropdownElement;
    }

    private addAction(dropdownElement: HTMLElement, label: string, cssClass: string, iconName: string, isDangerous: boolean, clickListener: MoreActionClickHandler) {
        const containerElement = document.createElement('li');
        containerElement.classList.add(cssClass);
        containerElement.innerHTML = `<a class="waves-effect"><i class="material-icons">${iconName}</i> ${label}</a>`;
        const button = containerElement.querySelector('a');

        if (isDangerous) {
            containerElement.classList.add('warning');
        }

        button.addEventListener('click', () => {
            clickListener(button);
        });

        dropdownElement.appendChild(containerElement);
    }

    private addActionSeparator(dropdownElement: HTMLElement) {
        const separatorElement = document.createElement('li');
        separatorElement.classList.add('divider');

        dropdownElement.appendChild(separatorElement);
    }

    initMoreDropdown(row: HTMLElement) {
        const moreButton = this.getMoreButton(row);
        jQuery(moreButton).dropdown({constrainWidth: false});
    }

    private getMoreButton(row: HTMLElement) {
        return row.querySelector('.more');
    }

    showMoreButton(row: HTMLElement) {
        const moreButton = this.getMoreButton(row);

        if (moreButton) {
            moreButton.classList.remove('transparent');
        }
    }

    hideMoreButton(row: HTMLElement) {
        const moreButton = this.getMoreButton(row);

        if (moreButton) {
            moreButton.classList.add('transparent');
        }
    }

    enableAction(row: HTMLElement, actionType: MoreActionType) {
        const actionElement = this.getActionElement(row, actionType);

        if (actionElement) {
            actionElement.classList.remove('disabled');
        }
    }

    private getActionElement(row: HTMLElement, actionType: MoreActionType) {
        const actionDescriptor = moreActionDescriptors[actionType];
        const actionElement = row.querySelector(`.${actionDescriptor.cssClassName}`);

        return actionElement;
    }

    disableAction(row: HTMLElement, actionType: MoreActionType) {
        const actionElement = this.getActionElement(row, actionType);

        if (actionElement) {
            actionElement.classList.add('disabled');
        }
    }

    isActionDisabled(row: HTMLElement, actionType: MoreActionType) {
        const actionElement = this.getActionElement(row, actionType);

        return actionElement ? actionElement.classList.contains('disabled') : null;
    }

    showAction(row: HTMLElement, actionType: MoreActionType) {
        const actionElement = this.getActionElement(row, actionType);

        if (actionElement) {
            actionElement.classList.remove('transparent');
        }
    }

    hideAction(row: HTMLElement, actionType: MoreActionType) {
        const actionElement = this.getActionElement(row, actionType);

        if (actionElement) {
            actionElement.classList.add('transparent');
        }
    }

    triggerAction(row: HTMLElement, actionType: MoreActionType) {
        const actionElement = this.getActionElement(row, actionType);

        if (actionElement) {
            actionElement.querySelector('a').click();
        }
    }
}
