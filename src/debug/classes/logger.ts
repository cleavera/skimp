import { ILogger } from '..';
import { NoLoggerException } from '../exceptions/no-logger.exception';

export class Logger implements ILogger {
    private _logger: ILogger;

    public configure(logger: ILogger): void {
        this._logger = logger;
    }

    public debug(...messages: Array<any>): void { // tslint:disable-line no-any
        if (!this._logger) {
            throw new NoLoggerException();
        }

        this._logger.debug(...messages);
    }

    public warn(...messages: Array<any>): void { // tslint:disable-line no-any
        if (!this._logger) {
            throw new NoLoggerException();
        }

        this._logger.warn(...messages);
    }

    public error(...messages: Array<any>): void { // tslint:disable-line no-any
        if (!this._logger) {
            throw new NoLoggerException();
        }

        this._logger.error(...messages);
    }

    public exception(exception: Error): void {
        if (!this._logger) {
            throw new NoLoggerException();
        }

        this._logger.exception(exception);
    }
}

export const logger: Logger = new Logger();
