import { TabTag } from '../tab-tag/tab-tag';

export class OpenedTab {
    id: string = null;
    position: number = null;
    title: string = null;
    url: string = null;
    faviconUrl: string = null;
    isAudible: boolean = false;
    isAudioMuted: boolean = false;
    isDiscarded: boolean = false;
    isFocused: boolean = false;
    isLoading: boolean = false;
    isPinned: boolean = false;
    lastAccess: Date = null;
    tabTagIdList: string[] = [];
}
