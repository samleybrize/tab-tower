import { NativeTabIdAssociationGetter } from './native-tab-id-association-getter';

export interface NativeTabIdAssociationMaintainer extends NativeTabIdAssociationGetter {
    associateNativeTabId(openedTabId: string, nativeTabId: number): Promise<void>;
    onNativeTabOpen(nativeTabId: number): Promise<void>;
    onNativeTabClose(nativeTabId: number): Promise<void>;
}
