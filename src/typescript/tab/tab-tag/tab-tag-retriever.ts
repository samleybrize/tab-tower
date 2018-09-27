import { sleep } from '../../utils/sleep';
import { TaskScheduler } from '../../utils/task-scheduler';
import { TabTagCreated } from './event/tab-tag-created';
import { TabTagDeleted } from './event/tab-tag-deleted';
import { TabTagUpdated } from './event/tab-tag-updated';
import { GetTabTagById } from './query/get-tab-tag-by-id';
import { GetTabTags } from './query/get-tab-tags';
import { TabTag } from './tab-tag';
import { TabTagPersister } from './tab-tag-persister';

export class TabTagRetriever {
    private tagMap = new Map<string, TabTag>();
    private tagList: TabTag[] = null;
    private isInitCompleted = false;

    constructor(private tabTagPersister: TabTagPersister, private taskScheduler: TaskScheduler) {
    }

    async init() {
        if (null !== this.tagList) {
            return;
        }

        await this.taskScheduler.add(async () => {
            const tagList = await this.tabTagPersister.getAll();

            for (const tag of tagList) {
                this.tagMap.set(tag.id, tag);
            }

            this.tagList = tagList;
        }).executeAll();

        this.isInitCompleted = true;
    }

    async queryAll(query: GetTabTags): Promise<TabTag[]> {
        await this.waitInitComplete();

        if (null == query.tagIdList) {
            return this.tagList;
        }

        const tagList: TabTag[] = [];

        for (const tagId of query.tagIdList) {
            const tag = this.tagMap.get(tagId);

            if (tag) {
                tagList.push(tag);
            }
        }

        return tagList;
    }

    private async waitInitComplete() {
        while (!this.isInitCompleted) {
            await sleep(100);
        }
    }

    async queryById(query: GetTabTagById): Promise<TabTag> {
        await this.waitInitComplete();

        return this.getById(query.tagId);
    }

    private async getById(tabId: string) {
        return this.tagMap.get(tabId);
    }

    async onTabTagCreate(event: TabTagCreated) {
        await this.taskScheduler.add(async () => {
            const tagToInsert = event.tag;
            this.tagMap.set(tagToInsert.id, tagToInsert);
            this.tagList.push(tagToInsert);
        }).executeAll();
    }

    private sortTabTags() {
        this.tagList.sort((a, b) => {
            const label1 = a.label.toLocaleLowerCase();
            const label2 = b.label.toLocaleLowerCase();

            return label1.localeCompare(label2);
        });
    }

    async onTabTagUpdate(event: TabTagUpdated) {
        await this.taskScheduler.add(async () => {
            const tag = this.tagMap.get(event.tag.id);

            if (tag) {
                tag.label = event.tag.label;
                tag.hexColor = event.tag.hexColor;

                this.sortTabTags();
            }
        }).executeAll();
    }

    async onTabTagDelete(event: TabTagDeleted) {
        await this.taskScheduler.add(async () => {
            this.tagMap.delete(event.tag.id);

            const index = this.tagList.indexOf(event.tag);
            this.tagList.splice(index, 1);
        }).executeAll();
    }
}
