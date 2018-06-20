import { Logger } from '../logger/logger';

interface CommandType<T> {
    new(...args: any[]): T;
    commandIdentifier?: number;
}

type CommandHandler<T> = (command: T) => Promise<void>;

export class CommandBus {
    private handlerList = new Map<number, CommandHandler<any>>();

    constructor(private logger: Logger) {
    }

    register<T>(commandType: CommandType<T>, handler: CommandHandler<T>, bindToHandler?: object) {
        if (null == commandType.commandIdentifier) {
            commandType.commandIdentifier = this.generateCommandIdentifier();
        }

        if (bindToHandler) {
            handler = handler.bind(bindToHandler);
        }

        this.handlerList.set(commandType.commandIdentifier, handler);
    }

    private generateCommandIdentifier() {
        return Math.random();
    }

    async handle<T>(command: T) {
        this.logger.debug({message: `Handling command "${command.constructor.name}"`, context: command});

        const commandIdentifier = (command.constructor as CommandType<T>).commandIdentifier;
        const commandHandler = this.handlerList.get(commandIdentifier);

        if (null == commandHandler) {
            this.logger.debug({message: `No command handler found for "${command.constructor.name}" command`});

            return;
        }

        await commandHandler(command);
    }
}
