import { FollowedTabView } from '../view/followed-tab-view';
import { OpenedTabView } from '../view/opened-tab-view';
import { RecentlyUnfollowedTabView } from './recently-unfollowed-tab-view';

export class HeaderView {
    private openedTabButton: HTMLElement;
    private followedTabButton: HTMLElement;
    private recentlyUnfollowedTabButton: HTMLElement;
    private newTabButton: HTMLElement;
    private breadcrumb: HTMLElement;

    constructor(
        private followedTabView: FollowedTabView,
        private openedTabView: OpenedTabView,
        private recentlyUnfollowedTabView: RecentlyUnfollowedTabView,
        headerContainer: HTMLElement,
    ) {
        this.openedTabButton = headerContainer.querySelector('.openedTabs');
        this.followedTabButton = headerContainer.querySelector('.followedTabs');
        this.recentlyUnfollowedTabButton = headerContainer.querySelector('.recentlyUnfollowedTabs');
        this.newTabButton = headerContainer.querySelector('.newTab');
        this.breadcrumb = headerContainer.querySelector('.brand-logo span');
    }

    init() {
        this.openedTabButton.addEventListener('click', () => {
            this.openedTabView.show();
            this.followedTabView.hide();
            this.recentlyUnfollowedTabView.hide();

            this.openedTabButton.classList.add('active');
            this.followedTabButton.classList.remove('active');
            this.recentlyUnfollowedTabButton.classList.remove('active');

            this.changeBreadcrumbText('Opened tabs');
        });

        this.followedTabButton.addEventListener('click', () => {
            this.openedTabView.hide();
            this.followedTabView.show();
            this.recentlyUnfollowedTabView.hide();

            this.openedTabButton.classList.remove('active');
            this.followedTabButton.classList.add('active');
            this.recentlyUnfollowedTabButton.classList.remove('active');

            this.changeBreadcrumbText('Followed tabs');
        });

        this.recentlyUnfollowedTabButton.addEventListener('click', () => {
            this.openedTabView.hide();
            this.followedTabView.hide();
            this.recentlyUnfollowedTabView.show();

            this.openedTabButton.classList.remove('active');
            this.followedTabButton.classList.remove('active');
            this.recentlyUnfollowedTabButton.classList.add('active');

            this.changeBreadcrumbText('Recently Unfollowed tabs');
        });

        this.newTabButton.setAttribute('data-tooltip', 'New tab');
        jQuery(this.newTabButton).tooltip();
        this.newTabButton.addEventListener('click', () => {
            browser.tabs.create({url: null});
        });

        this.openedTabButton.click();
    }

    private changeBreadcrumbText(newText: string) {
        this.breadcrumb.classList.remove('transition');

        // needed to trigger the animation
        setTimeout(() => {
            this.breadcrumb.textContent = newText;
            this.breadcrumb.classList.add('transition');
        }, 0);
    }

    notifyNumberOfOpenedTabsChanged(counter: number) {
        const counterElement = this.openedTabButton.querySelector('.counter');

        if (counter > 999) {
            counterElement.textContent = '+999';
            counterElement.classList.add('tooLong');
        } else {
            counterElement.textContent = '' + counter;
            counterElement.classList.remove('tooLong');
        }
    }

    notifyNumberOfFollowedTabsChanged(counter: number) {
        const counterElement = this.followedTabButton.querySelector('.counter');

        if (counter > 999) {
            counterElement.textContent = '+999';
            counterElement.classList.add('tooLong');
        } else {
            counterElement.textContent = '' + counter;
            counterElement.classList.remove('tooLong');
        }
    }

    notifyNumberOfRecentlyUnfollowedTabsChanged(counter: number) {
        const counterElement = this.recentlyUnfollowedTabButton.querySelector('.counter');

        if (counter > 999) {
            counterElement.textContent = '+999';
            counterElement.classList.add('tooLong');
        } else {
            counterElement.textContent = '' + counter;
            counterElement.classList.remove('tooLong');
        }
    }
}
