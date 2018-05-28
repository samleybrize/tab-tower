import { OpenedTab } from './opened-tab';

export interface OpenedTabBackend {
    getAll(): Promise<OpenedTab[]>;
}
