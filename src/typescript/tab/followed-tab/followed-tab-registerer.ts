import { CommandBus } from '../../bus/command-bus';
import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { GetTabOpenStateByOpenLongLivedId } from '../opened-tab/query/get-tab-open-state-by-open-long-lived-id';
import { AssociateOpenedTabToFollowedTab } from '../tab-association/command/associate-opened-tab-to-followed-tab';
import { TabAssociation } from '../tab-association/tab-association';
import { RegisterTabFollowState } from './command/register-tab-follow-state';
import { OpenedTabFollowed } from './event/opened-tab-followed';
import { FollowStatePersister } from './persister/follow-state-persister';

export class FollowedTabRegisterer {
    constructor(private tabPersister: FollowStatePersister, private commandBus: CommandBus, private eventBus: EventBus, private queryBus: QueryBus) {
    }

    async registerFollowedTab(command: RegisterTabFollowState) {
        const tabAssociation = new TabAssociation();
        tabAssociation.followState = command.followState;

        if (command.followState.openLongLivedId) {
            tabAssociation.openState = await this.queryBus.query(new GetTabOpenStateByOpenLongLivedId(command.followState.openLongLivedId));
        }

        await this.tabPersister.persist(command.followState);
        this.eventBus.publish(new OpenedTabFollowed(tabAssociation));

        if (tabAssociation.openState) {
            await this.commandBus.handle(new AssociateOpenedTabToFollowedTab(tabAssociation.openState, tabAssociation.followState));
        }
    }
}
