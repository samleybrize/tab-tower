import { StringExtractor } from '../../utils/string-extractor';
import { StringListGetterDescriptor, StringListGetterFactory } from '../../utils/string-list-getter/string-list-getter-factory';
import { StringMatcher } from '../matcher/string-matcher/string-matcher';
import { MatchingRuleDescriptor, MatchingRuleFactory } from './matching-rule-factory';
import { StringMatchingRule } from './string-matching-rule';

export interface StringMatchingRuleDescriptor extends MatchingRuleDescriptor {
    readonly stringExtractor: string;
    readonly stringMatcher: string;
    readonly stringListGetter: StringListGetterDescriptor;
}

export class StringMatchingRuleFactory<T> implements MatchingRuleFactory<T> {
    constructor(
        private stringExtractorMap: Map<string, StringExtractor<T>>,
        private stringMatcherMap: Map<string, StringMatcher>,
        private stringListGetterFactoryMap: Map<string, StringListGetterFactory>,
    ) {
    }

    create(descriptor: StringMatchingRuleDescriptor): StringMatchingRule<T> {
        const stringExtractor = this.getStringExtractor(descriptor.stringExtractor);
        const stringMatcher = this.getStringMatcher(descriptor.stringMatcher);
        const stringListGetter = this.getStringListGetter(descriptor.stringListGetter);

        return new StringMatchingRule<T>(stringExtractor, stringMatcher, stringListGetter);
    }

    private getStringExtractor(type: string) {
        if (!this.stringExtractorMap.has(type)) {
            throw new Error(`Unable to find a string extractor of type "${type}"`);
        }

        return this.stringExtractorMap.get(type);
    }

    private getStringMatcher(type: string) {
        if (!this.stringMatcherMap.has(type)) {
            throw new Error(`Unable to find a string matcher of type "${type}"`);
        }

        return this.stringMatcherMap.get(type);
    }

    private getStringListGetter(descriptor: StringListGetterDescriptor) {
        if (!this.stringListGetterFactoryMap.has(descriptor.type)) {
            throw new Error(`Unable to find a string list getter factory of type "${descriptor.type}"`);
        }

        const factory = this.stringListGetterFactoryMap.get(descriptor.type);

        return factory.create(descriptor);
    }
}
