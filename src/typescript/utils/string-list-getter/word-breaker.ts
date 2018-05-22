import { StringListGetter } from './string-list-getter';

export class WordBreaker implements StringListGetter {
    private wordList: string[];

    constructor(stringToBreak: string) {
        this.wordList = stringToBreak.split(' ');
    }

    get(): string[] {
        return this.wordList;
    }
}
