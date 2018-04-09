import { FollowedTabMoved } from './followed-tab-moved';
import { OpenedTabAssociatedToFollowedTab } from './opened-tab-associated-to-followed-tab';
import { OpenedTabAudibleStateUpdated } from './opened-tab-audible-state-updated';
import { OpenedTabAudioMuteStateUpdated } from './opened-tab-audio-mute-state-updated';
import { OpenedTabCloseHandled } from './opened-tab-close-handled';
import { OpenedTabClosed } from './opened-tab-closed';
import { OpenedTabFaviconUrlUpdated } from './opened-tab-favicon-url-updated';
import { OpenedTabFocused } from './opened-tab-focused';
import { OpenedTabFollowed } from './opened-tab-followed';
import { OpenedTabIsLoading } from './opened-tab-is-loading';
import { OpenedTabLoadingIsComplete } from './opened-tab-loading-is-complete';
import { OpenedTabMoved } from './opened-tab-moved';
import { OpenedTabPinStateUpdated } from './opened-tab-pin-state-updated';
import { OpenedTabReaderModeStateUpdated } from './opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './opened-tab-url-updated';
import { RecentlyUnfollowedTabAdded } from './recently-unfollowed-tab-added';
import { RecentlyUnfollowedTabDeleted } from './recently-unfollowed-tab-deleted';
import { TabFilterRequested } from './tab-filter-requested';
import { TabOpened } from './tab-opened';
import { TabUnfollowed } from './tab-unfollowed';

export const tabEvents = [
    FollowedTabMoved,
    OpenedTabAssociatedToFollowedTab,
    OpenedTabAudibleStateUpdated,
    OpenedTabAudioMuteStateUpdated,
    OpenedTabCloseHandled,
    OpenedTabClosed,
    OpenedTabFaviconUrlUpdated,
    OpenedTabFocused,
    OpenedTabFollowed,
    OpenedTabIsLoading,
    OpenedTabLoadingIsComplete,
    OpenedTabMoved,
    OpenedTabPinStateUpdated,
    OpenedTabReaderModeStateUpdated,
    OpenedTabTitleUpdated,
    OpenedTabUrlUpdated,
    RecentlyUnfollowedTabAdded,
    RecentlyUnfollowedTabDeleted,
    TabFilterRequested,
    TabOpened,
    TabUnfollowed,
];
