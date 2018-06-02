import { StringListGetter } from './string-list-getter';

export class WordBreaker implements StringListGetter {
    private wordList: string[];

    constructor(stringToBreak: string) {
        this.setStringToBreak(stringToBreak);
    }

    setStringToBreak(stringToBreak: string) {
        this.wordList = stringToBreak.split(' ');
    }

    get(): string[] {
        return this.wordList;
    }
}
