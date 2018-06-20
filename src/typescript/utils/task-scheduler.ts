import { Logger } from '../logger/logger';

type Task = () => void;

export class TaskScheduler {
    private pendingTasks: Task[] = [];
    private isExecutingTasks = false;

    constructor(private logger: Logger) {
    }

    add(task: Task): TaskScheduler {
        this.pendingTasks.push(task);

        return this;
    }

    async executeAll(): Promise<void> {
        if (this.isExecutingTasks) {
            return;
        }

        this.isExecutingTasks = true;

        try {
            while (this.pendingTasks.length) {
                const task = this.pendingTasks.shift();
                await task();
            }
        } catch (error) {
            this.logger.error({message: 'Error detected in a task', context: error});
        }

        this.isExecutingTasks = false;
    }
}

export class TaskSchedulerFactory {
    constructor(private logger: Logger) {
    }

    create() {
        return new TaskScheduler(this.logger);
    }
}
