export class ScrollManipulator {
    constructor(private isScrollAnimationEnabled: boolean) {
    }

    scrollToElement(element: HTMLElement) {
        element.scrollIntoView({
            behavior: (this.isScrollAnimationEnabled ? 'smooth' : 'instant') as any, // workaround, TypeScript does not allow "instant"
            block: 'nearest',
        });
    }
}
