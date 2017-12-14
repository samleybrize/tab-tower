export class OpenTab {
    constructor(
        public readonly url: string,
        public readonly readerMode: boolean,
        public readonly followId?: string,
    ) {
    }
}
