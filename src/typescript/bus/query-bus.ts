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
        console.debug(`Handling query "${query.constructor.name}"`, query);

        const queryIdentifier = (query.constructor as QueryType<any>).queryIdentifier;
        const queryHandler = this.handlerList.get(queryIdentifier);

        if (null == queryHandler) {
            console.debug(`No query handler found for "${query.constructor.name}" query`);

            return;
        }

        const queryResult = await queryHandler(query);
        console.debug(`Query "${query.constructor.name}" done`, queryResult);

        return queryResult;
    }
}
