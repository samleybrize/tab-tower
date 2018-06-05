import { TabsView, TabsViewFactory } from './tabs-view';

export class UiSmall {
    private tabsView: TabsView;

    constructor(tabsViewFactory: TabsViewFactory) {
        this.tabsView = tabsViewFactory.create(document.querySelector('.tab-list'));
    }
}
