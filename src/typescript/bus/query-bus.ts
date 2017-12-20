export interface Query<T> {
    getResult(): T;
}

interface QueryType<T> {
    new(...args: any[]): T;
    queryIdentifier?: number;
}

type QueryHandler<T> = (query: T) => Promise<T>;

export class QueryBus {
    private handlerList = new Map<number, QueryHandler<any>>();

    register<T>(queryType: QueryType<T>, handler: QueryHandler<T>, bindToHandler?: object) {
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
        const queryIdentifier = (query.constructor as QueryType<any>).queryIdentifier;
        const queryHandler = this.handlerList.get(queryIdentifier);

        if (null == queryHandler) {
            console.debug(`No query handler found for "${query.constructor.name}" query`);

            return;
        }

        await queryHandler(query);

        return query.getResult();
    }
}
