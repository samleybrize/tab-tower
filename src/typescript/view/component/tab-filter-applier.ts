import { StringMatcher } from '../../utils/string-matcher';

export type PreTabFilterCallback = () => boolean;
export type PostTabFilterCallback = (numberOfVisibleTabs: number, totalNumberOfTabs: number) => void;

export class TabFilterApplier {
    private filterTerms: string[] = null;
    private preTabFilterCallback: PreTabFilterCallback;
    private postTabFilterCallback: PostTabFilterCallback;

    constructor(private stringMatcher: StringMatcher, private root: HTMLElement) {
    }

    init(preTabFilterCallback: PreTabFilterCallback, postTabFilterCallback: PostTabFilterCallback) {
        this.preTabFilterCallback = preTabFilterCallback;
        this.postTabFilterCallback = postTabFilterCallback;
    }

    setFilterTerms(filterTerms: string[]) {
        this.filterTerms = [];

        for (const filterTerm of filterTerms) {
            this.filterTerms.push(filterTerm.toLowerCase().trim());
        }
    }

    applyFilter() {
        if (!this.preTabFilterCallback()) {
            return;
        } else if (!this.hasFilterTerms()) {
            this.unfilterAll();
            this.postTabFilterCallback(this.getNumberOfVisibleTabs(), this.getTotalNumberOfTabs());

            return;
        }

        const filtrableElementList = Array.from<HTMLElement>(this.root.querySelectorAll('.filtrable'));
        let totalNumberOfTabs = 0;

        for (const filtrableElement of filtrableElementList) {
            const matchableTexts = this.getTextsToMatch(filtrableElement);

            if (this.stringMatcher.isCaseSensitiveMatch(this.filterTerms, matchableTexts)) {
                filtrableElement.classList.remove('filtered');
            } else {
                filtrableElement.classList.add('filtered');
            }

            totalNumberOfTabs++;
        }

        this.postTabFilterCallback(this.getNumberOfVisibleTabs(), totalNumberOfTabs);
    }

    private getTotalNumberOfTabs() {
        return this.root.querySelectorAll('.filtrable').length;
    }

    private getNumberOfVisibleTabs() {
        return this.root.querySelectorAll('.filtrable:not(.filtered)').length;
    }

    private hasFilterTerms() {
        return null !== this.filterTerms && this.filterTerms.length > 0;
    }

    private getTextsToMatch(filtrableElement: HTMLElement) {
        const matchableElementList = Array.from(filtrableElement.querySelectorAll('[data-filter-matchable-text]'));
        const matchableTexts: string[] = [];

        for (const matchableElement of matchableElementList) {
            const filterMatchableText = matchableElement.getAttribute('data-filter-matchable-text');
            matchableTexts.push(filterMatchableText.toLowerCase().trim());
        }

        return matchableTexts;
    }

    private unfilterAll() {
        const filteredElementList = Array.from<HTMLElement>(this.root.querySelectorAll('.filtrable.filtered'));

        for (const filteredElement of filteredElementList) {
            filteredElement.classList.remove('filtered');
        }
    }
}
