import { FollowedTabView } from '../view/followed-tab-view';
import { OpenedTabView } from '../view/opened-tab-view';

export class HeaderView {
    private openedTabButton: HTMLElement;
    private followedTabButton: HTMLElement;
    private newTabButton: HTMLElement;
    private breadcrumb: HTMLElement;

    constructor(private followedTabView: FollowedTabView, private openedTabView: OpenedTabView, headerContainer: HTMLElement) {
        this.openedTabButton = headerContainer.querySelector('.openedTabs');
        this.followedTabButton = headerContainer.querySelector('.followedTabs');
        this.newTabButton = headerContainer.querySelector('.newTab');
        this.breadcrumb = headerContainer.querySelector('.brand-logo span');
    }

    init() {
        this.openedTabButton.addEventListener('click', () => {
            this.openedTabView.show();
            this.followedTabView.hide();

            this.openedTabButton.classList.add('active');
            this.followedTabButton.classList.remove('active');

            this.changeBreadcrumbText('Opened tabs');
        });

        this.followedTabButton.addEventListener('click', () => {
            this.openedTabView.hide();
            this.followedTabView.show();

            this.openedTabButton.classList.remove('active');
            this.followedTabButton.classList.add('active');

            this.changeBreadcrumbText('Followed tabs');
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
}
