import { BeginsWith } from './begins-with';
import { Contains } from './contains';
import { DoesNotContains } from './does-not-contains';
import { EndsWith } from './ends-with';
import { Is } from './is';
import { IsNot } from './is-not';
import { StringMatcher } from './string-matcher';

export class StringMatchers {
    private static matchers: Map<string, StringMatcher> = null;

    static get(): Map<string, StringMatcher> {
        if (null == this.matchers) {
            this.matchers = new Map<string, StringMatcher>();
            this.matchers.set('contains', new Contains());
            this.matchers.set('does-not-contains', new DoesNotContains());
            this.matchers.set('is', new Is());
            this.matchers.set('is-not', new IsNot());
            this.matchers.set('begins-with', new BeginsWith());
            this.matchers.set('ends-with', new EndsWith());
        }

        return this.matchers;
    }
}
