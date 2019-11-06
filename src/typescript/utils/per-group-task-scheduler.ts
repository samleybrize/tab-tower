import { Logger } from '../logger/logger';
import { sleep } from './sleep';

type Task = () => void;

export class PerGroupTaskScheduler {
    private pendingTasks: Map<string, Task[]> = new Map();
    private isExecutingTasks: Map<string, boolean> = new Map();
    private isInitHasFinished = false;

    constructor(private logger: Logger, waitForInit: boolean) {
        if (!waitForInit) {
            this.isInitHasFinished = true;
        }
    }

    add(groupId: 'init'|string, task: Task): PerGroupTaskScheduler {
        if (!this.pendingTasks.has(groupId)) {
            this.pendingTasks.set(groupId, []);
            this.isExecutingTasks.set(groupId, false);
        }

        this.pendingTasks.get(groupId).push(task);

        return this;
    }

    async executeAll(groupId: 'init'|string): Promise<void> {
        if (this.isExecutingTasks.get(groupId) || !this.pendingTasks.has(groupId)) {
            return;
        }

        this.isExecutingTasks.set(groupId, true);

        while ('init' !== groupId && !this.isInitHasFinished) {
            await sleep(300);
        }

        const pendingTasks = this.pendingTasks.get(groupId);

        try {
            while (pendingTasks.length) {
                const task = pendingTasks.shift();
                await task();
            }
        } catch (error) {
            this.logger.error({message: 'Error detected in a task', context: error});
        }

        this.isExecutingTasks.set(groupId, false);

        if ('init' === groupId) {
            this.isInitHasFinished = true;
        }
    }
}

export class PerGroupTaskSchedulerFactory {
    constructor(private logger: Logger) {
    }

    create(waitForInit: boolean) {
        return new PerGroupTaskScheduler(this.logger, waitForInit);
    }
}
