import { TabClosed } from '../event/tab-closed';
import { TabOpenState } from '../opened-tab/tab-open-state';
import { GetSessionIdAssociatedToOpenLongLivedId } from '../query/get-session-id-associated-to-open-long-lived-id';
import { NativeRecentlyClosedTabAssociation } from './native-recently-closed-tab-association';
import { NativeRecentlyClosedTabAssociationPersister } from './native-recently-closed-tab-association-persister';

export class NativeRecentlyClosedTabAssociationMaintainer {
    private nativeRecentlyClosedTabAssociationList: NativeRecentlyClosedTabAssociation[] = [];
    private closedTabsToAssociate: TabOpenState[] = [];
    private isHandlingRecentlyClosedTabListChange = false;
    private reDoRecentlyClosedTabListChange = false;
    private isHandlingClosedTabsAssociation = false;

    constructor(private associationPersister: NativeRecentlyClosedTabAssociationPersister) {
        browser.sessions.onChanged.addListener(this.onRecentlyClosedTabListChange.bind(this));
    }

    async init() {
        this.nativeRecentlyClosedTabAssociationList = await this.associationPersister.getAll();
        await this.refreshRecentlyClosedTabList(true);
    }

    private async onRecentlyClosedTabListChange() {
        this.refreshRecentlyClosedTabList(false);
    }

    private async refreshRecentlyClosedTabList(markUnassociatedAsIgnored: boolean) {
        if (this.isHandlingRecentlyClosedTabListChange) {
            this.reDoRecentlyClosedTabListChange = true;
            return;
        }

        this.reDoRecentlyClosedTabListChange = false;
        this.isHandlingRecentlyClosedTabListChange = true;
        this.nativeRecentlyClosedTabAssociationList = await this.getNativeRecentlyClosedTabList();
        await this.saveAssociationList();

        if (markUnassociatedAsIgnored) {
            this.ignoreUnassociatedRecentlyClosedTabs(this.nativeRecentlyClosedTabAssociationList);
        }

        if (this.reDoRecentlyClosedTabListChange) {
            this.refreshRecentlyClosedTabList(false);
            return;
        }

        this.isHandlingRecentlyClosedTabListChange = false;
    }

    private async getNativeRecentlyClosedTabList() {
        const nativeRecentlyClosedSessionList = await browser.sessions.getRecentlyClosed();
        const associationList: NativeRecentlyClosedTabAssociation[] = [];

        for (const nativeRecentlyClosedSession of nativeRecentlyClosedSessionList) {
            if (null == nativeRecentlyClosedSession.tab) {
                continue;
            }

            const uniqueId = await this.getNativeRecentlyClosedTabUniqueId(nativeRecentlyClosedSession);
            const nativeRecentlyClosedTabAssociation = new NativeRecentlyClosedTabAssociation(
                uniqueId,
                nativeRecentlyClosedSession.tab.sessionId,
                nativeRecentlyClosedSession.tab.url,
                nativeRecentlyClosedSession.tab.favIconUrl,
            );
            associationList.push(nativeRecentlyClosedTabAssociation);
        }

        this.updateNewAssociationListFromTheExistingOne(associationList);

        return associationList;
    }

    private async getNativeRecentlyClosedTabUniqueId(nativeRecentlyClosedTab: browser.sessions.Session) {
        const parts = [
            nativeRecentlyClosedTab.lastModified,
            nativeRecentlyClosedTab.tab.lastAccessed,
            nativeRecentlyClosedTab.tab.url,
            nativeRecentlyClosedTab.tab.favIconUrl,
            nativeRecentlyClosedTab.tab.title,
            nativeRecentlyClosedTab.tab.index,
        ];

        return parts.join('##');
    }

    private updateNewAssociationListFromTheExistingOne(newAssociationList: NativeRecentlyClosedTabAssociation[]) {
        const existingAssociationMap = new Map<string, NativeRecentlyClosedTabAssociation>();

        for (const nativeRecentlyClosedTabAssociation of this.nativeRecentlyClosedTabAssociationList) {
            existingAssociationMap.set(nativeRecentlyClosedTabAssociation.uniqueId, nativeRecentlyClosedTabAssociation);
        }

        for (const newAssociation of newAssociationList) {
            if (!existingAssociationMap.has(newAssociation.uniqueId)) {
                continue;
            }

            const existingAssociation = existingAssociationMap.get(newAssociation.uniqueId);
            newAssociation.associatedOpenedTabLongLivedId = existingAssociation.associatedOpenedTabLongLivedId;
            newAssociation.isIgnored = existingAssociation.isIgnored;
        }
    }

    private async saveAssociationList() {
        await this.associationPersister.setAll(this.nativeRecentlyClosedTabAssociationList);
    }

    private ignoreUnassociatedRecentlyClosedTabs(associationList: NativeRecentlyClosedTabAssociation[]) {
        for (const association of associationList) {
            if (null == association.associatedOpenedTabLongLivedId) {
                association.isIgnored = true;
            }
        }
    }

    async querySessionIdAssociatedToOpenLongLivedId(command: GetSessionIdAssociatedToOpenLongLivedId) {
        for (const association of this.nativeRecentlyClosedTabAssociationList) {
            if (association.associatedOpenedTabLongLivedId === command.openLongLivedId) {
                return association.sessionId;
            }
        }

        return null;
    }

    async onTabClose(event: TabClosed) {
        this.closedTabsToAssociate.push(event.closedTab);
        this.scheduleNextClosedTabAssociation(false);
    }

    private scheduleNextClosedTabAssociation(evenIfHandlingClosedTabsAssociation: boolean) {
        if (this.isHandlingClosedTabsAssociation && !evenIfHandlingClosedTabsAssociation) {
            return;
        } else if (0 == this.closedTabsToAssociate.length) {
            this.isHandlingClosedTabsAssociation = false;
            return;
        }

        this.isHandlingClosedTabsAssociation = true;
        setTimeout(this.associateNextClosedTab.bind(this, 0), 1);
    }

    private async associateNextClosedTab(attempt: number) {
        if (attempt > 50) {
            this.closedTabsToAssociate.shift();
            this.scheduleNextClosedTabAssociation(true);

            return;
        }

        const closedTab = this.closedTabsToAssociate[0];

        if (!this.isThereNewRecentlyClosedTabs()) {
            setTimeout(this.associateNextClosedTab.bind(this, attempt + 1), 100);

            return;
        }

        this.closedTabsToAssociate.shift();
        const recentlyClosedTab = this.getOldestUnassociatedRecentlyClosedTab();

        if (this.isClosedTabMatchesRecentlyClosedTab(closedTab, recentlyClosedTab)) {
            recentlyClosedTab.associatedOpenedTabLongLivedId = closedTab.longLivedId;
            await this.saveAssociationList();
        }

        this.scheduleNextClosedTabAssociation(true);
    }

    private isThereNewRecentlyClosedTabs() {
        const firstRecentlyClosedTab = this.nativeRecentlyClosedTabAssociationList[0];

        return firstRecentlyClosedTab && null == firstRecentlyClosedTab.associatedOpenedTabLongLivedId;
    }

    private isClosedTabMatchesRecentlyClosedTab(tab: TabOpenState, recentlyClosedTab: NativeRecentlyClosedTabAssociation) {
        return tab.url == recentlyClosedTab.url && tab.faviconUrl == recentlyClosedTab.faviconUrl;
    }

    private getOldestUnassociatedRecentlyClosedTab() {
        let  nativeRecentlyClosedTabAssociationToReturn: NativeRecentlyClosedTabAssociation = null;

        for (const nativeRecentlyClosedTabAssociation of this.nativeRecentlyClosedTabAssociationList) {
            if (nativeRecentlyClosedTabAssociation.isIgnored || null != nativeRecentlyClosedTabAssociation.associatedOpenedTabLongLivedId) {
                break;
            }

            nativeRecentlyClosedTabAssociationToReturn = nativeRecentlyClosedTabAssociation;
        }

        return nativeRecentlyClosedTabAssociationToReturn;
    }
}
