import { Log, Logger } from './logger';

export class BrowserConsoleLogger implements Logger {
    debug(log: Log): void {
        if (log.context) {
            console.debug(this.getMessage(log), log.context);
        } else {
            console.debug(this.getMessage(log));
        }
    }

    private getMessage(log: Log) {
        const date = new Date().toISOString();

        return `[${date}] ${log.message}`;
    }

    info(log: Log): void {
        if (log.context) {
            console.info(this.getMessage(log), log.context);
        } else {
            console.info(this.getMessage(log));
        }
    }

    warning(log: Log): void {
        if (log.context) {
            console.warn(this.getMessage(log), log.context);
        } else {
            console.warn(this.getMessage(log));
        }
    }

    error(log: Log): void {
        if (log.context) {
            console.error(this.getMessage(log), log.context);
        } else {
            console.error(this.getMessage(log));
        }
    }
}
