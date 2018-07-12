import { LogLevel } from '../constants/log-level.constant';
import { NoLoggerException } from '../exceptions/no-logger.exception';
import { ILogger } from '../interfaces/logger.interface';

export class Logger implements ILogger {
    private _logger: ILogger;
    private _logLevel: LogLevel;

    public setLogger(loggerClass: ILogger): void {
        this._logger = loggerClass;
    }

    public setLogLevel(level: LogLevel): void {
        this._logLevel = level;
    }

    public debug(...messages: Array<any>): void {
        if (!this._logger) {
            throw new NoLoggerException();
        }

        if (this._logLevel > LogLevel.DEBUG) {
            return;
        }

        this._logger.debug(...messages);
    }

    public warn(...exceptions: Array<Error>): void {
        if (!this._logger) {
            throw new NoLoggerException();
        }

        if (this._logLevel > LogLevel.WARNING) {
            return;
        }

        this._logger.warn(...exceptions);
    }

    public error(...exception: Array<Error>): void {
        if (!this._logger) {
            throw new NoLoggerException();
        }

        if (this._logLevel > LogLevel.ERROR) {
            return;
        }

        this._logger.error(...exception);
    }
}
