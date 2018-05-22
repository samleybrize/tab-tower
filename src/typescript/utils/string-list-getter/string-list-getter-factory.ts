import { StringListGetter } from './string-list-getter';

export interface StringListGetterDescriptor {
    readonly type: string;
}

export interface StringListGetterFactory {
    create(descriptor: StringListGetterDescriptor): StringListGetter;
}
