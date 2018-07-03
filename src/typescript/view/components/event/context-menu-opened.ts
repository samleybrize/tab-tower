import { ContextMenu } from '../context-menu';

export class ContextMenuOpened {
    constructor(public readonly contextMenu: ContextMenu) {
    }
}
