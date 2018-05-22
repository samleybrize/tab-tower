import { StringListGetterDescriptor, StringListGetterFactory } from './string-list-getter-factory';
import { WordBreaker } from './word-breaker';

export interface WordBreakerDescriptor extends StringListGetterDescriptor {
    readonly stringToBreak: string;
}

export class WordBreakerFactory implements StringListGetterFactory {
    create(descriptor: WordBreakerDescriptor): WordBreaker {
        if ('string' != typeof descriptor.stringToBreak) {
            throw new Error('Property "stringToBreak" must be a string');
        }

        return new WordBreaker(descriptor.stringToBreak);
    }
}
