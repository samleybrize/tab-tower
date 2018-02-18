import { ChildProcess, ExecOptions, ExecOptionsWithBufferEncoding, ExecOptionsWithStringEncoding, SpawnOptions } from 'child_process';

export function exec(command: string, options?: ExecOptions | ExecOptionsWithStringEncoding | ExecOptionsWithBufferEncoding): ChildProcessPromise<ChildProcessExecResponse>;
export function spawn(command: string, args?: string[], options?: ExtendedSpawnOptions): ChildProcessPromise<ChildProcessSpawnResponse>;

export interface ChildProcessPromise<T> extends Promise<T> {
    childProcess: ChildProcess;
}

export interface ChildProcessExecResponse {
    childProcess: ChildProcess;
    stdout: string;
    stderr: string;
    code?: number;
}

export interface ChildProcessSpawnResponse {
    childProcess: ChildProcess;
    code: number;
    stdout?: string;
    stderr?: string;
}

export interface ExtendedSpawnOptions extends SpawnOptions {
    capture: ['stdout' | 'stderr'];
}
