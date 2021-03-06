import { DetectedBrowser } from '../../../browser/detected-browser';
import { CommandBus } from '../../../bus/command-bus';
import { CloseOpenedTab, FocusOpenedTab } from '../../../tab/opened-tab/command';
import { MoveTabsMarkedAsBeingMovedAboveTab } from './command/move-tabs-marked-as-being-moved-above-tab';
import { CloseButton } from './tab/close-button';
import { MuteButton } from './tab/mute-button';
import { TabContextMenu, TabContextMenuFactory } from './tab/tab-context-menu';
import { CheckboxShiftClickObserver, CheckboxStateChangeObserver, TabSelector } from './tab/tab-selector';
import { UnmuteButton } from './tab/unmute-button';

type ClickOnTitleObserver = () => void;

export class Tab {
    readonly htmlElement: HTMLElement;
    private faviconElement: HTMLImageElement;
    private titleElement: HTMLElement;
    private urlElement: HTMLElement;
    private urlDomainElement: HTMLElement;
    private closeButton: CloseButton;
    private muteButton: MuteButton;
    private unmuteButton: UnmuteButton;
    private tabSelector: TabSelector;
    private contextMenu: TabContextMenu;
    private position: number;
    private focused: boolean;
    private tagIdList: string[] = [];
    private showOnlyIfTag: string = null;
    private _isFilteredOut: boolean = false;
    private hidden: boolean = false;
    private isMiddleClickAllowed = false;
    private beingMoved = false;
    private title: string = null;
    private tabId: string;
    private clickOnTitleObserverList: ClickOnTitleObserver[] = [];

    get id() {
        return this.tabId;
    }

    set id(id: string) {
        this.tabId = id;
        this.closeButton.setTabId(id);
        this.muteButton.setTabId(id);
        this.unmuteButton.setTabId(id);
        this.tabSelector.setId(id);
        this.contextMenu.setTabId(id);
    }

    constructor(
        private detectedBrowser: DetectedBrowser,
        private commandBus: CommandBus,
        private tabContextMenuFactory: TabContextMenuFactory,
        private defaultFaviconUrl: string,
        openedTabId: string,
        fromExistingTab?: Tab,
    ) {
        if (!fromExistingTab) {
            this.htmlElement = this.createElement();
        } else {
            this.htmlElement = fromExistingTab.htmlElement.cloneNode(true) as HTMLElement;
            this.position = fromExistingTab.getPosition();
        }

        this.tabId = openedTabId;
        this.initElement();
    }

    private createElement() {
        const htmlElement = document.createElement('div');
        htmlElement.classList.add('tab');
        htmlElement.innerHTML = `
            <span class="favicon">
                <img src="" alt="" />
                <span class="tab-selector">
                    <input type="checkbox" id="" title="Select tab" />
                    <span class="checkbox-icon">
                        <label class="material-icons checked" for="">check_box</label>
                        <label class="material-icons unchecked" for="">check_box_outline_blank</label>
                    </span>
                </span>
            </span>
            <span class="title-container">
                <span class="title"></span>
                <span class="url"></span>
                <span class="domain"></span>
            </span>
            <span class="audible-icon"><i class="material-icons" title="Mute tab">volume_up</i></span>
            <span class="muted-icon"><i class="material-icons" title="Unmute tab">volume_off</i></span>
            <span class="close-button"><i class="material-icons" title="Close tab">close</i></span>
            <span class="pin-icon"><img alt="" src="/ui/images/pin.svg" /></span>
            <span class="focused-tab-icon"><i class="material-icons">gps_fixed</i></span>
            <span class="move-above-button" title="Move above"><i class="material-icons">keyboard_arrow_up</i></span>
        `;

        return htmlElement;
    }

    private initElement() {
        const titleContainerElement = this.htmlElement.querySelector('.title-container');
        this.titleElement = this.htmlElement.querySelector('.title');
        this.urlElement = this.htmlElement.querySelector('.url');
        this.urlDomainElement = this.htmlElement.querySelector('.domain');
        this.initFavicon();

        const random = ('' + Math.random()).substr(2);
        const tabSelectorId = `tab-selector-${this.tabId}-${random}`;
        this.htmlElement.querySelector('.tab-selector input').id = tabSelectorId;
        this.htmlElement.querySelector('.tab-selector .checked').setAttribute('for', tabSelectorId);
        this.htmlElement.querySelector('.tab-selector .unchecked').setAttribute('for', tabSelectorId);

        const tabHtmlId = `tab-${this.tabId}-${random}`;
        this.htmlElement.id = tabHtmlId;

        this.closeButton = new CloseButton(this.htmlElement.querySelector('.close-button'), this.tabId, this.commandBus);
        this.muteButton = new MuteButton(this.htmlElement.querySelector('.audible-icon'), this.tabId, this.commandBus);
        this.unmuteButton = new UnmuteButton(this.htmlElement.querySelector('.muted-icon'), this.tabId, this.commandBus);
        const moveAboveButton = this.htmlElement.querySelector('.move-above-button');
        this.tabSelector = new TabSelector(this.htmlElement, this.htmlElement.querySelector('.tab-selector'), this.tabId);
        this.contextMenu = this.tabContextMenuFactory.create(this.htmlElement, this.tabId);
        this.htmlElement.appendChild(this.contextMenu.htmlElement);

        titleContainerElement.addEventListener('click', (event: MouseEvent) => {
            this.commandBus.handle(new FocusOpenedTab(this.tabId));

            for (const observer of this.clickOnTitleObserverList) {
                observer();
            }
        });
        titleContainerElement.addEventListener('contextmenu', (event: MouseEvent) => {
            event.preventDefault();
            this.contextMenu.open({x: event.clientX, y: event.clientY});
        });
        titleContainerElement.addEventListener('auxclick', (event: MouseEvent) => {
            event.preventDefault();

            // middle click
            if (2 == event.which && this.isMiddleClickAllowed) {
                this.commandBus.handle(new CloseOpenedTab(this.tabId));
            }
        });
        moveAboveButton.addEventListener('click', (event: MouseEvent) => {
            this.commandBus.handle(new MoveTabsMarkedAsBeingMovedAboveTab(this.tabId));
        });
    }

    private initFavicon() {
        this.faviconElement = this.htmlElement.querySelector('.favicon img');

        this.faviconElement.addEventListener('error', (event) => {
            (event.target as HTMLImageElement).src = this.defaultFaviconUrl;
        });

        if ('firefox' == this.detectedBrowser.name && this.detectedBrowser.majorVersion < 59) {
            // prior to firefox 59, images on a host that requires authentication causes the http auth popup to open
            this.faviconElement.setAttribute('crossorigin', 'anonymous');
        }
    }

    isFilteredOut() {
        return this._isFilteredOut;
    }

    markAsFilteredOut() {
        this._isFilteredOut = true;
        this.updateVisibility();
    }

    private updateVisibility() {
        let show = true;

        if (this._isFilteredOut) {
            show = false;
        } else if (this.showOnlyIfTag && this.tagIdList.indexOf(this.showOnlyIfTag) < 0) {
            show = false;
        }

        if (show) {
            this.unhide();
        } else {
            this.hide();
        }
    }

    private hide() {
        this.htmlElement.classList.add('hide');
        this.hidden = true;
    }

    private unhide() {
        this.htmlElement.classList.remove('hide');
        this.hidden = false;
    }

    markAsNotFilteredOut() {
        this._isFilteredOut = false;
        this.updateVisibility();
    }

    isHidden() {
        return this.hidden;
    }

    getFaviconUrl() {
        return this.faviconElement.src;
    }

    setFaviconUrl(faviconUrl: string) {
        if (null == faviconUrl) {
            this.faviconElement.src = this.defaultFaviconUrl;
        } else {
            this.faviconElement.src = faviconUrl;
        }
    }

    setTabUrl(url: string) {
        const urlObject = new URL(url);

        this.urlElement.textContent = url;
        this.urlDomainElement.textContent = urlObject.hostname ? urlObject.hostname : url;
    }

    getTitle() {
        return this.title;
    }

    setTitle(title: string) {
        this.title = title;
        this.titleElement.textContent = title;
        this.titleElement.setAttribute('title', title);
    }

    addTag(tagId: string) {
        if (this.tagIdList.indexOf(tagId) < 0) {
            this.htmlElement.classList.add(`with-tag-${tagId}`); // TODO
            this.tagIdList.push(tagId);
            this.updateVisibility();
        }
    }

    removeTag(tagId: string) {
        const index = this.tagIdList.indexOf(tagId);

        if (index >= 0) {
            this.htmlElement.classList.remove(`with-tag-${tagId}`); // TODO
            this.tagIdList.splice(index, 1);
            this.updateVisibility();
        }
    }

    hasTag(tagId: string) {
        return this.tagIdList.indexOf(tagId) >= 0;
    }

    setPosition(position: number) {
        this.position = position;
        this.htmlElement.style.order = '' + position;
    }

    getPosition() {
        return this.position;
    }

    enableMiddleClick() {
        this.isMiddleClickAllowed = true;
    }

    disableMiddleClick() {
        this.isMiddleClickAllowed = false;
    }

    isAudible() {
        return this.htmlElement.classList.contains('audible');
    }

    markAsAudible() {
        this.htmlElement.classList.add('audible');
    }

    markAsNotAudible() {
        this.htmlElement.classList.remove('audible');
    }

    isAudioMuted() {
        return this.htmlElement.classList.contains('muted');
    }

    markAsAudioMuted() {
        this.htmlElement.classList.add('muted');
        this.contextMenu.showUnmuteButton();
    }

    markAsNotAudioMuted() {
        this.htmlElement.classList.remove('muted');
        this.contextMenu.showMuteButton();
    }

    markAsFocused() {
        this.htmlElement.classList.add('active');
        this.focused = true;
    }

    markAsNotFocused() {
        this.htmlElement.classList.remove('active');
        this.focused = false;
    }

    isFocused() {
        return this.focused;
    }

    markAsDiscarded() {
        this.htmlElement.classList.add('discarded');
        this.contextMenu.hideDiscardButton();
    }

    markAsNotDiscarded() {
        this.htmlElement.classList.remove('discarded');
        this.contextMenu.showDiscardButton();
    }

    isLoading() {
        return this.htmlElement.classList.contains('loading');
    }

    markAsLoading() {
        this.htmlElement.classList.add('loading');
    }

    markAsNotLoading() {
        this.htmlElement.classList.remove('loading');
    }

    markAsPinned() {
        this.htmlElement.classList.add('pinned');
        this.contextMenu.showUnpinButton();
    }

    markAsNotPinned() {
        this.htmlElement.classList.remove('pinned');
        this.contextMenu.showPinButton();
    }

    clone(openedTabId: string): Tab {
        return new Tab(this.detectedBrowser, this.commandBus, this.tabContextMenuFactory, this.defaultFaviconUrl, openedTabId, this);
    }

    markAsBeingMoved() {
        this.htmlElement.classList.add('being-moved');
        this.beingMoved = true;
    }

    markAsNotBeingMoved() {
        this.htmlElement.classList.remove('being-moved');
        this.beingMoved = false;
    }

    isBeingMoved() {
        return this.beingMoved;
    }

    markAsSelected() {
        this.tabSelector.markAsChecked();
    }

    markAsUnselected() {
        this.tabSelector.markAsUnchecked();
    }

    isSelected() {
        return this.tabSelector.isChecked();
    }

    observeClickOnTitle(observer: ClickOnTitleObserver) {
        this.clickOnTitleObserverList.push(observer);
    }

    observeSelectStateChange(observer: CheckboxStateChangeObserver) {
        this.tabSelector.observeStateChange(observer);
    }

    observeShiftClick(observer: CheckboxShiftClickObserver) {
        this.tabSelector.observeShiftClick(observer);
    }
}

export class TabFactory {
    constructor(private detectedBrowser: DetectedBrowser, private commandBus: CommandBus, private tabContextMenuFactory: TabContextMenuFactory, private defaultFaviconUrl: string) {
    }

    create(openedTabId: string) {
        return new Tab(this.detectedBrowser, this.commandBus, this.tabContextMenuFactory, this.defaultFaviconUrl, openedTabId);
    }
}
