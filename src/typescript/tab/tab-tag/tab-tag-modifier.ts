import * as uuid from 'uuid';

import { EventBus } from '../../bus/event-bus';
import { QueryBus } from '../../bus/query-bus';
import { TaskScheduler } from '../../utils/task-scheduler';
import { CreateTabTag } from './command/create-tab-tag';
import { DeleteTabTag } from './command/delete-tab-tag';
import { UpdateTabTag } from './command/update-tab-tag';
import { TabTagCreated } from './event/tab-tag-created';
import { TabTagDeleted } from './event/tab-tag-deleted';
import { TabTagUpdated } from './event/tab-tag-updated';
import { GetTabTagById } from './query/get-tab-tag-by-id';
import { TabTag } from './tab-tag';
import { TabTagPersister } from './tab-tag-persister';

export class TabTagModifier {
    constructor(
        private eventBus: EventBus,
        private queryBus: QueryBus,
        private tagPersister: TabTagPersister,
        private taskScheduler: TaskScheduler,
    ) {
    }

    async createTabTag(command: CreateTabTag) {
        this.taskScheduler.add(async () => {
            const tag = new TabTag();
            tag.id = uuid.v1();
            tag.label = command.label;
            tag.colorId = command.colorId;

            await this.tagPersister.store(tag);
            this.eventBus.publish(new TabTagCreated(tag));
        }).executeAll();
    }

    async deleteTabTag(command: DeleteTabTag) {
        this.taskScheduler.add(async () => {
            const tag = await this.queryBus.query(new GetTabTagById(command.tagId));

            if (null == tag) {
                return;
            }

            await this.tagPersister.delete(tag);
            this.eventBus.publish(new TabTagDeleted(tag));
        }).executeAll();
    }

    async updateTabTag(command: UpdateTabTag) {
        this.taskScheduler.add(async () => {
            const tag = await this.queryBus.query(new GetTabTagById(command.tagId));

            if (null == tag) {
                return;
            }

            tag.label = command.label;
            tag.colorId = command.colorId;

            await this.tagPersister.store(tag);
            this.eventBus.publish(new TabTagUpdated(tag));
        }).executeAll();
    }
}
