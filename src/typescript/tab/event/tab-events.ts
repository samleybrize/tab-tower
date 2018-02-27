import { FollowedTabMoved } from './followed-tab-moved';
import { OpenedTabAssociatedToFollowedTab } from './opened-tab-associated-to-followed-tab';
import { OpenedTabAudibleStateUpdated } from './opened-tab-audible-state-updated';
import { OpenedTabAudioMuteStateUpdated } from './opened-tab-audio-mute-state-updated';
import { OpenedTabFaviconUrlUpdated } from './opened-tab-favicon-url-updated';
import { OpenedTabFocused } from './opened-tab-focused';
import { OpenedTabIsLoading } from './opened-tab-is-loading';
import { OpenedTabLoadingIsComplete } from './opened-tab-loading-is-complete';
import { OpenedTabMoved } from './opened-tab-moved';
import { OpenedTabPinStateUpdated } from './opened-tab-pin-state-updated';
import { OpenedTabReaderModeStateUpdated } from './opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './opened-tab-url-updated';
import { TabCloseHandled } from './tab-close-handled';
import { TabClosed } from './tab-closed';
import { TabFilterRequested } from './tab-filter-requested';
import { TabFollowed } from './tab-followed';
import { TabOpened } from './tab-opened';
import { TabUnfollowed } from './tab-unfollowed';

export const tabEvents = [
    FollowedTabMoved,
    OpenedTabAssociatedToFollowedTab,
    OpenedTabAudibleStateUpdated,
    OpenedTabAudioMuteStateUpdated,
    OpenedTabFaviconUrlUpdated,
    OpenedTabFocused,
    OpenedTabIsLoading,
    OpenedTabLoadingIsComplete,
    OpenedTabMoved,
    OpenedTabPinStateUpdated,
    OpenedTabReaderModeStateUpdated,
    OpenedTabTitleUpdated,
    OpenedTabUrlUpdated,
    TabCloseHandled,
    TabClosed,
    TabFilterRequested,
    TabFollowed,
    TabOpened,
    TabUnfollowed,
];
