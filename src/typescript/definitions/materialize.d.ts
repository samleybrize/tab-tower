/// <reference types="jquery" />

declare namespace M {
    interface DropdownOptions {
        inDuration?: number;
        outDuration?: number;
        constrainWidth?: boolean;
        hover?: boolean;
        gutter?: number;
        belowOrigin?: boolean;
        alignment?: string;
        stopPropagation?: boolean;
    }
}

interface JQuery {
    dropdown(method: 'open' | 'close' | M.DropdownOptions): any;

    tooltip(method: 'open' | 'close' | 'remove'): JQuery;
}
