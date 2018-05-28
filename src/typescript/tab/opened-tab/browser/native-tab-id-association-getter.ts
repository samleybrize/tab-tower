export interface NativeTabIdAssociationGetter {
    getAssociatedNativeTabId(openedTabId: string): Promise<number>;
    getAssociatedOpenedTabId(nativeTabId: number): Promise<string>;
}
