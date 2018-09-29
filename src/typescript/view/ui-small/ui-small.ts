import { Sidenav, SidenavFactory } from './sidenav';
import { TabTagEditForm, TabTagEditFormFactory } from './tab-tag-edit-form';
import { TabsView, TabsViewFactory } from './tabs-view';

export class UiSmall {
    private tabsView: TabsView;
    private sidenav: Sidenav;
    private tabTagEditForm: TabTagEditForm;

    constructor(tabsViewFactory: TabsViewFactory, sidenavFactory: SidenavFactory, tabTagEditFormFactory: TabTagEditFormFactory) {
        this.tabsView = tabsViewFactory.create(document.querySelector('.tab-list'));
        this.sidenav = sidenavFactory.create(document.querySelector('.sidenav'));
        this.tabTagEditForm = tabTagEditFormFactory.create(document.querySelector('.tab-tag-edit'));
    }
}
