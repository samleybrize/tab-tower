export interface StringExtractor<T> {
    getFrom(fromObject: T): string;
}
