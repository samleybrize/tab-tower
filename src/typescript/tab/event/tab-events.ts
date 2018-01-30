import { OpenedTabAssociatedToFollowedTab } from './opened-tab-associated-to-followed-tab';
import { OpenedTabFaviconUrlUpdated } from './opened-tab-favicon-url-updated';
import { OpenedTabFocused } from './opened-tab-focused';
import { OpenedTabMoved } from './opened-tab-moved';
import { OpenedTabReaderModeStateUpdated } from './opened-tab-reader-mode-state-updated';
import { OpenedTabTitleUpdated } from './opened-tab-title-updated';
import { OpenedTabUrlUpdated } from './opened-tab-url-updated';
import { TabClosed } from './tab-closed';
import { TabFilterRequested } from './tab-filter-requested';
import { TabFollowed } from './tab-followed';
import { TabOpened } from './tab-opened';
import { TabUnfollowed } from './tab-unfollowed';

export const tabEvents = [
    OpenedTabFocused,
    OpenedTabAssociatedToFollowedTab,
    OpenedTabFaviconUrlUpdated,
    OpenedTabMoved,
    OpenedTabReaderModeStateUpdated,
    OpenedTabTitleUpdated,
    OpenedTabUrlUpdated,
    TabClosed,
    TabFilterRequested,
    TabFollowed,
    TabOpened,
    TabUnfollowed,
];
