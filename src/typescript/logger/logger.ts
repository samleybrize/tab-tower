export interface Log {
    message: string;
    context?: any;
}

export interface Logger {
    debug(log: Log): void;
    info(log: Log): void;
    warning(log: Log): void;
    error(log: Log): void;
}
