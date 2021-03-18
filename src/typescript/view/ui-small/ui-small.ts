import { SidenavFactory } from './sidenav';
import { TabTagAssignFactory } from './tab-tag-assign';
import { TabTagEditFormFactory } from './tab-tag-edit-form';
import { TabsViewFactory } from './tabs-view';

export class UiSmall {
    static init(tabsViewFactory: TabsViewFactory, sidenavFactory: SidenavFactory, tabTagEditFormFactory: TabTagEditFormFactory, tabTagAssignFactory: TabTagAssignFactory) {
        tabsViewFactory.create(document.querySelector('.tab-list'));
        sidenavFactory.create(document.querySelector('.sidenav'));
        tabTagEditFormFactory.create(document.querySelector('.tab-tag-edit'));
        tabTagAssignFactory.create(document.querySelector('.tab-tag-assign'));
    }
}
