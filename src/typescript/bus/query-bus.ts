import { Logger } from '../logger/logger';

export interface Query<T> {
    readonly resultType: T;
}

interface QueryType<T> {
    new(...args: any[]): T;
    queryIdentifier?: number;
}

type QueryHandler<T extends Query<K>, K> = (query: T) => Promise<K>;

export class QueryBus {
    private handlerList = new Map<number, QueryHandler<any, any>>();

    constructor(private logger: Logger) {
    }

    register<T extends Query<K>, K>(queryType: QueryType<T>, handler: QueryHandler<T, K>, bindToHandler?: object) {
        if (null == queryType.queryIdentifier) {
            queryType.queryIdentifier = this.generateQueryIdentifier();
        }

        if (bindToHandler) {
            handler = handler.bind(bindToHandler);
        }

        this.handlerList.set(queryType.queryIdentifier, handler);
    }

    private generateQueryIdentifier() {
        return Math.random();
    }

    async query<TResult>(query: Query<TResult>): Promise<TResult> {
        this.logger.debug({message: `Handling query "${query.constructor.name}"`, context: query});

        const queryIdentifier = (query.constructor as QueryType<any>).queryIdentifier;
        const queryHandler = this.handlerList.get(queryIdentifier);

        if (null == queryHandler) {
            this.logger.debug({message: `No query handler found for "${query.constructor.name}" query`});

            return;
        }

        const queryResult = await queryHandler(query);
        this.logger.debug({message: `Query "${query.constructor.name}" done`, context: queryResult});

        return queryResult;
    }
}
