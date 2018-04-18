import { createReadStream, readdir, readFile, ReadStream } from 'fs';
import { ServerResponse } from 'http';
import { join } from 'path';
import { Writable } from 'stream';
import { ResponseType } from '../constants/response-types.constant';

export class Response {
    private _response: ServerResponse;

    constructor(response: ServerResponse) {
        this._response = response;
    }

    public get statusCode(): number {
        return this._response.statusCode;
    }

    public set statusCode(code: number) {
        this._response.statusCode = code;
    }

    public get stream(): Writable {
        return this._response;
    }

    public async file(path: string, statusCode: number = 200, contentType: ResponseType = ResponseType.TEXT): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (error: Error) => void): void => {
            this.statusCode = statusCode;
            this._response.setHeader('Content-Type', contentType);

            const stream: ReadStream = createReadStream(path);

            stream.on('open', () => {
                stream.pipe(this.stream);
            });

            stream.on('close', () => {
                resolve();
                this._response.end();
            });
            stream.on('error', (e: Error) => {
                this.notFound();
                reject(e);
            });
        });
    }

    public async dir(path: string, statusCode: number = 200): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (error: Error) => void): void => {
            this.statusCode = statusCode;
            this._response.setHeader('Content-Type', ResponseType.JSON);

            readdir(path, async(err: Error, files: Array<string>) => {
                if (err) {
                    this.notFound();
                    reject(err);
                }

                const promises: Array<Promise<any>> = []; // tslint:disable-line no-any

                files.forEach((file: string) => {
                    promises.push(new Promise<any>((resolveFileRead: (result: any) => void, rejectFileRead: (reason: Error) => void): void => { // tslint:disable-line no-any
                        readFile(join(path, file), 'utf-8', (readFileError: Error, data: string): void => {
                            if (readFileError) {
                                this.serverError(readFileError);
                                rejectFileRead(readFileError);
                            }

                            try {
                                resolveFileRead(JSON.parse(data));
                            } catch (e) {
                                this.serverError(e);
                                rejectFileRead(e);
                            }
                        });
                    }));
                });

                this._response.write(JSON.stringify(await Promise.all(promises)));
                this._response.end();

                resolve();
            });
        });
    }

    public notFound(): void {
        this.statusCode = 404;
        this._response.write('');
        this._response.end();
    }

    public methodNotAllowed(): void {
        this.statusCode = 405;
        this._response.write('');
        this._response.end();
    }

    public noContent(): void {
        this.statusCode = 204;
        this._response.end();
    }

    public serverError(error?: Error): void {
        this.statusCode = 500;
        this._response.write(JSON.stringify(error));
        this._response.end();
    }
}
