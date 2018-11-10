import { Sidenav, SidenavFactory } from './sidenav';
import { TabTagAssign, TabTagAssignFactory } from './tab-tag-assign';
import { TabTagEditForm, TabTagEditFormFactory } from './tab-tag-edit-form';
import { TabsView, TabsViewFactory } from './tabs-view';

export class UiSmall {
    private tabsView: TabsView;
    private sidenav: Sidenav;
    private tabTagEditForm: TabTagEditForm;
    private tabTagAssign: TabTagAssign;

    constructor(tabsViewFactory: TabsViewFactory, sidenavFactory: SidenavFactory, tabTagEditFormFactory: TabTagEditFormFactory, tabTagAssignFactory: TabTagAssignFactory) {
        this.tabsView = tabsViewFactory.create(document.querySelector('.tab-list'));
        this.sidenav = sidenavFactory.create(document.querySelector('.sidenav'));
        this.tabTagEditForm = tabTagEditFormFactory.create(document.querySelector('.tab-tag-edit'));
        this.tabTagAssign = tabTagAssignFactory.create(document.querySelector('.tab-tag-assign'));
    }
}
