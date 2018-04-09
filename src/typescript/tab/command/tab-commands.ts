import { AssociateOpenedTabToFollowedTab } from './associate-opened-tab-to-followed-tab';
import { CloseOpenedTab } from './close-opened-tab';
import { DeleteRecentlyUnfollowedTab } from './delete-recently-unfollowed-tab';
import { DuplicateOpenedTab } from './duplicate-opened-tab';
import { FocusOpenedTab } from './focus-opened-tab';
import { FollowTab } from './follow-tab';
import { GoToControlCenter } from './go-to-control-center';
import { MoveFollowedTabs } from './move-followed-tabs';
import { MoveOpenedTabs } from './move-opened-tabs';
import { MuteOpenedTab } from './mute-opened-tab';
import { PinOpenedTab } from './pin-opened-tab';
import { RegisterTabFollowState } from './register-tab-follow-state';
import { ReloadOpenedTab } from './reload-opened-tab';
import { RestoreFollowedTab } from './restore-followed-tab';
import { RestoreRecentlyUnfollowedTab } from './restore-recently-unfollowed-tab';
import { UnfollowTab } from './unfollow-tab';
import { UnmuteOpenedTab } from './unmute-opened-tab';
import { UnpinOpenedTab } from './unpin-opened-tab';

export const tabCommands = [
    AssociateOpenedTabToFollowedTab,
    CloseOpenedTab,
    DeleteRecentlyUnfollowedTab,
    DuplicateOpenedTab,
    FocusOpenedTab,
    FollowTab,
    GoToControlCenter,
    MoveFollowedTabs,
    MoveOpenedTabs,
    MuteOpenedTab,
    PinOpenedTab,
    RegisterTabFollowState,
    ReloadOpenedTab,
    RestoreFollowedTab,
    RestoreRecentlyUnfollowedTab,
    UnfollowTab,
    UnmuteOpenedTab,
    UnpinOpenedTab,
];
