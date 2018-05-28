import { NativeTabIdAssociationMaintainer } from './native-tab-id-association-maintainer';

const sessionKey = 'openedTabId';

export class NativeTabIdAssociationMaintainerFirefox implements NativeTabIdAssociationMaintainer {
    private openedTabIdMap = new Map<string, number>();
    private nativeTabIdMap = new Map<number, string>();

    async init() {
        const nativeTabList = await browser.tabs.query({});

        for (const nativeTab of nativeTabList) {
            const associatedOpenedTabId = await browser.sessions.getTabValue(nativeTab.id, sessionKey) as string;

            if (null == associatedOpenedTabId) {
                continue;
            }

            this.addToMaps(associatedOpenedTabId, nativeTab.id);
        }
    }

    private addToMaps(openedTabId: string, nativeTabId: number) {
        this.openedTabIdMap.set(openedTabId, nativeTabId);
        this.nativeTabIdMap.set(nativeTabId, openedTabId);
    }

    async associateNativeTabId(openedTabId: string, nativeTabId: number): Promise<void> {
        await browser.sessions.setTabValue(nativeTabId, sessionKey, openedTabId);
        this.addToMaps(openedTabId, nativeTabId);
    }

    async getAssociatedNativeTabId(openedTabId: string): Promise<number> {
        if (!this.openedTabIdMap.has(openedTabId)) {
            return null;
        }

        return this.openedTabIdMap.get(openedTabId);
    }

    async getAssociatedOpenedTabId(nativeTabId: number): Promise<string> {
        if (!this.nativeTabIdMap.has(nativeTabId)) {
            return null;
        }

        return this.nativeTabIdMap.get(nativeTabId);
    }

    async onNativeTabOpen(nativeTabId: number): Promise<void> {
        const associatedOpenedTabId = await browser.sessions.getTabValue(nativeTabId, sessionKey) as string;

        if (null != associatedOpenedTabId) {
            this.addToMaps(associatedOpenedTabId, nativeTabId);
        }
    }

    async onNativeTabClose(nativeTabId: number): Promise<void> {
        if (!this.nativeTabIdMap.has(nativeTabId)) {
            return;
        }

        const associatedOpenedTabId = this.nativeTabIdMap.get(nativeTabId);
        this.nativeTabIdMap.delete(nativeTabId);
        this.openedTabIdMap.delete(associatedOpenedTabId);
    }
}
