import { CommandBus } from '../bus/command-bus';
import { QueryBus } from '../bus/query-bus';
import { GoToControlCenter } from '../tab/command/go-to-control-center';
import { FollowTab } from '../tab/followed-tab/command/follow-tab';
import { UnfollowTab } from '../tab/followed-tab/command/unfollow-tab';
import { GetTabAssociationByOpenId } from '../tab/tab-association/query/get-tab-association-by-open-id';

export class BrowserActionView {
    private followedContainer: HTMLElement;
    private notFollowedContainer: HTMLElement;
    private followButton: HTMLButtonElement;
    private unfollowButton: HTMLButtonElement;

    constructor(private commandBus: CommandBus, private queryBus: QueryBus, private containerElement: HTMLElement) {
    }

    async init() {
        this.followedContainer = this.containerElement.querySelector('.currentTabFollowed');
        this.notFollowedContainer = this.containerElement.querySelector('.currentTabNotFollowed');
        this.followButton = this.notFollowedContainer.querySelector('button');
        this.unfollowButton = this.followedContainer.querySelector('button');

        this.unfollowButton.addEventListener('click', this.handleUnfollowButtonClick.bind(this));
        this.followButton.addEventListener('click', this.handleFollowButtonClick.bind(this));
        this.containerElement.querySelector('.goToControlCenter').addEventListener('click', this.goToControlCenter.bind(this));

        this.updateView();
    }

    private async handleFollowButtonClick(event: MouseEvent) {
        const buttonElement = event.currentTarget as HTMLButtonElement;

        if (buttonElement.hasAttribute('disabled')) {
            return;
        }

        this.followActiveTab();
    }

    private async followActiveTab() {
        const activeTabAssociation = await this.getTabAssociationForActiveOpenedTab();
        this.commandBus.handle(new FollowTab(activeTabAssociation));
        this.closeView();
    }

    private async getTabAssociationForActiveOpenedTab() {
        const tabList = await browser.tabs.query({active: true});
        const activeTab = tabList[0];
        const tabAssociation = await this.queryBus.query(new GetTabAssociationByOpenId(activeTab.id));

        return tabAssociation;
    }

    private closeView() {
        window.close();
    }

    private async handleUnfollowButtonClick(event: MouseEvent) {
        const buttonElement = event.currentTarget as HTMLButtonElement;

        if (buttonElement.hasAttribute('disabled')) {
            return;
        }

        this.unfollowActiveTab();
    }

    private async unfollowActiveTab() {
        const activeTabAssociation = await this.getTabAssociationForActiveOpenedTab();
        this.commandBus.handle(new UnfollowTab(activeTabAssociation));
        this.closeView();
    }

    private async goToControlCenter() {
        this.commandBus.handle(new GoToControlCenter());
        this.closeView();
    }

    private async updateView() {
        const activeTabAssociation = await this.getTabAssociationForActiveOpenedTab();

        if (activeTabAssociation.followState) {
            this.notFollowedContainer.classList.add('transparent');
            this.followedContainer.classList.remove('transparent');
        } else {
            this.notFollowedContainer.classList.remove('transparent');
            this.followedContainer.classList.add('transparent');
        }

        if (activeTabAssociation.openState.isPrivileged || activeTabAssociation.openState.isIgnored) {
            this.followButton.setAttribute('disabled', 'disabled');
        } else {
            this.followButton.removeAttribute('disabled');
        }
    }
}
