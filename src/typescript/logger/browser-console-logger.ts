import { Log, Logger } from './logger';

export class BrowserConsoleLogger implements Logger {
    constructor(private loggerName: string, private nameColor: string) {
    }

    debug(log: Log): void {
        console.debug.apply(console, this.getMessage(log));
    }

    private getMessage(log: Log) {
        const parts: any[] = [];

        const date = new Date().toISOString();
        parts.push(`%c[%s]%c[%s]%c`, 'color:silver', date, `color:${this.nameColor}`, this.loggerName, 'color:inherit');

        parts.push(log.message);

        if (log.context) {
            parts.push(log.context);
        }

        return parts;
    }

    info(log: Log): void {
        console.info.apply(console, this.getMessage(log));
    }

    warning(log: Log): void {
        console.warn.apply(console, this.getMessage(log));
    }

    error(log: Log): void {
        console.error.apply(console, this.getMessage(log));
    }
}
