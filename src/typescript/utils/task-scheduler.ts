type Task = () => void;

export class TaskScheduler {
    private pendingTasks: Task[] = [];
    private isExecutingTasks = false;

    add(task: Task): TaskScheduler {
        this.pendingTasks.push(task);

        return this;
    }

    async executeAll(): Promise<void> {
        if (this.isExecutingTasks) {
            return;
        }

        this.isExecutingTasks = true;

        while (this.pendingTasks.length) {
            const task = this.pendingTasks.shift();
            await task();
        }

        this.isExecutingTasks = false;
    }
}
