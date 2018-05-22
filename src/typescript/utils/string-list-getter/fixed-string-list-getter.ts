import { StringListGetter } from './string-list-getter';

export class FixedStringListGetter implements StringListGetter {
    constructor(private stringList: string[]) {
    }

    get(): string[] {
        return this.stringList;
    }
}
