import { DetectedBrowser } from '../../../browser/detected-browser';
import { CommandBus } from '../../../bus/command-bus';
import { FocusOpenedTab } from '../../../tab/opened-tab/command';
import { CloseButton } from './tab/close-button';
import { MuteButton } from './tab/mute-button';
import { CheckboxShiftClickObserver, CheckboxStateChangeObserver, TabSelector } from './tab/tab-selector';
import { UnmuteButton } from './tab/unmute-button';

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
    private position: number;
    private focused: boolean;
    readonly id: string;

    constructor(private detectedBrowser: DetectedBrowser, private commandBus: CommandBus, private defaultFaviconUrl: string, openedTabId: string, fromExistingTab?: Tab) {
        if (!fromExistingTab) {
            this.htmlElement = this.createElement();
        } else {
            this.htmlElement = fromExistingTab.htmlElement.cloneNode(true) as HTMLElement;
            this.position = fromExistingTab.getPosition();
        }

        this.id = openedTabId;
        this.initElement(openedTabId);
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
            <span class="move-above-button" title="Move above"><i class="material-icons">keyboard_arrow_up</i></span>
        `;

        return htmlElement;
    }

    private initElement(openedTabId: string) {
        const titleContainerElement = this.htmlElement.querySelector('.title-container');
        this.titleElement = this.htmlElement.querySelector('.title');
        this.urlElement = this.htmlElement.querySelector('.url');
        this.urlDomainElement = this.htmlElement.querySelector('.domain');
        this.initFavicon();

        const random = ('' + Math.random()).substr(2);
        const tabSelectorId = `tab-selector-${openedTabId}-${random}`;
        this.htmlElement.querySelector('.tab-selector input').id = tabSelectorId;
        this.htmlElement.querySelector('.tab-selector .checked').setAttribute('for', tabSelectorId);
        this.htmlElement.querySelector('.tab-selector .unchecked').setAttribute('for', tabSelectorId);

        const tabHtmlId = `tab-${openedTabId}-${random}`;
        this.htmlElement.id = tabHtmlId;

        this.closeButton = new CloseButton(this.htmlElement.querySelector('.close-button'), openedTabId, this.commandBus); // TODO still needed?
        this.muteButton = new MuteButton(this.htmlElement.querySelector('.audible-icon'), openedTabId, this.commandBus); // TODO still needed?
        this.unmuteButton = new UnmuteButton(this.htmlElement.querySelector('.muted-icon'), openedTabId, this.commandBus); // TODO still needed?
        this.tabSelector = new TabSelector(this.htmlElement, this.htmlElement.querySelector('.tab-selector'), openedTabId);

        titleContainerElement.addEventListener('click', () => {
            this.commandBus.handle(new FocusOpenedTab(openedTabId));
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

    hide() {
        this.htmlElement.classList.add('hide');
    }

    unhide() {
        this.htmlElement.classList.remove('hide');
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

    setTitle(title: string) {
        this.titleElement.textContent = title;
        this.titleElement.setAttribute('title', title);
    }

    setPosition(position: number) {
        this.position = position;
    }

    getPosition() {
        return this.position;
    }

    markAsAudible() {
        this.htmlElement.classList.add('audible');
    }

    markAsNotAudible() {
        this.htmlElement.classList.remove('audible');
    }

    markAsAudioMuted() {
        this.htmlElement.classList.add('muted');
    }

    markAsNotAudioMuted() {
        this.htmlElement.classList.remove('muted');
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
    }

    markAsNotDiscarded() {
        this.htmlElement.classList.remove('discarded');
    }

    markAsLoading() {
        this.htmlElement.classList.add('loading');
    }

    markAsNotLoading() {
        this.htmlElement.classList.remove('loading');
    }

    markAsPinned() {
        this.htmlElement.classList.add('pinned');
    }

    markAsNotPinned() {
        this.htmlElement.classList.remove('pinned');
    }

    clone(openedTabId: string): Tab {
        return new Tab(this.detectedBrowser, this.commandBus, this.defaultFaviconUrl, openedTabId, this);
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

    observeSelectStateChange(observer: CheckboxStateChangeObserver) {
        this.tabSelector.observeStateChange(observer);
    }

    observeShiftClick(observer: CheckboxShiftClickObserver) {
        this.tabSelector.observeShiftClick(observer);
    }
}

export class TabFactory {
    constructor(private detectedBrowser: DetectedBrowser, private commandBus: CommandBus, private defaultFaviconUrl: string) {
    }

    create(openedTabId: string) {
        return new Tab(this.detectedBrowser, this.commandBus, this.defaultFaviconUrl, openedTabId);
    }
}
