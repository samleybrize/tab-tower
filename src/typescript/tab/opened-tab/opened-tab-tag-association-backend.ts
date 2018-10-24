export interface OpenedTabTagAssociationBackend {
    getAssociatedTabTagIdList(openedTabId: string): Promise<string[]>;
    addTabTagToOpenedTab(openedTabId: string, tagId: string): Promise<void>;
    removeTabTagFromOpenedTab(openedTabId: string, tagId: string): Promise<void>;
}
