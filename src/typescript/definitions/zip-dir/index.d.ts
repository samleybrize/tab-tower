/// <reference types="node" />

import { Stats } from 'fs';

declare function ZipWrite(rootDir: string, callback: ZipWrite.ZipCallback): void;
declare function ZipWrite(rootDir: string, options: ZipWrite.ZipOptions, callback: ZipWrite.ZipCallback): void;

declare namespace ZipWrite {
    interface ZipOptions {
        saveTo?: string;
        filter?: ZipFilterCallback;
        each?: ZipEachCallback;
    }

    type ZipFilterCallback = (fullPath: string, stat: Stats) => boolean;
    type ZipEachCallback = (fullPath: string) => void;
    type ZipCallback = (err: NodeJS.ErrnoException, buffer: Buffer) => void;
}

export = ZipWrite;
