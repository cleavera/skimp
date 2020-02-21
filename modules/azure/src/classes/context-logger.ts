import { Context } from '@azure/functions';
import { ILogger } from '@skimp/debug';

export class ContextLogger implements ILogger {
    private _context: Context;

    constructor(context: Context) {
        this._context = context;
    }

    public debug(...messages: Array<any>): void { // eslint-disable-line
        this._context.log(...messages);
    }

    public warn(...messages: Array<Error>): void {
        this._context.log(...messages);
    }

    public error(...messages: Array<Error>): void {
        this._context.log(...messages);
    }
}
