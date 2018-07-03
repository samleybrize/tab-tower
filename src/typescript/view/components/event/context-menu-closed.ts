import { ContextMenu } from '../context-menu';

export class ContextMenuClosed {
    constructor(public readonly contextMenu: ContextMenu) {
    }
}
