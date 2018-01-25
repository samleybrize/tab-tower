import { NativeRecentlyClosedTabAssociation } from './native-recently-closed-tab-association';

export interface NativeRecentlyClosedTabAssociationPersister {
    getAll(): Promise<NativeRecentlyClosedTabAssociation[]>;
    setAll(associationList: NativeRecentlyClosedTabAssociation[]): Promise<void>;
}
