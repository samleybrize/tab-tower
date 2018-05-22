import { FixedStringListGetter } from './fixed-string-list-getter';
import { StringListGetterDescriptor, StringListGetterFactory } from './string-list-getter-factory';

export interface FixedStringListGetterDescriptor extends StringListGetterDescriptor {
    readonly stringList: string[];
}

export class FixedStringListGetterFactory implements StringListGetterFactory {
    create(descriptor: FixedStringListGetterDescriptor): FixedStringListGetter {
        if (!(descriptor.stringList instanceof Array)) {
            throw new Error('Property "stringList" must be an array of string');
        }

        return new FixedStringListGetter(descriptor.stringList);
    }
}
