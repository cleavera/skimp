import { createReadStream, lstat, readdir, readFile, ReadStream, Stats, unlink, writeFile } from 'fs';
import { join } from 'path';
import { Writable } from 'stream';

import { $isNull, IPromiseRejector, IPromiseResolver, Maybe } from '@skimp/shared';

import { FILE_SYSTEM } from '../constants/file-system.constant';
import { EntityDoesNotExistException } from '../exceptions/entity-does-not-exist.exception';
import { EntityNotADirectoryException } from '../exceptions/entity-not-a-directory.exception';
import { EntityNotAFileException } from '../exceptions/entity-not-a-file.exception';
import { EntityNotValidJsonException } from '../exceptions/entity-not-valid-json.exception';

export class Entity {
    public readonly path: string;
    private _stats: Maybe<Stats>;

    private get _absolutePath(): string {
        return Entity.getAbsolutePath(this.path);
    }

    private constructor(path: string, stats: Maybe<Stats> = null) {
        this.path = path;
        this._stats = stats;
    }

    public exists(): boolean {
        return !$isNull(this._stats);
    }

    public isDirectory(): boolean {
        this.assertExists();

        return (this._stats as Stats).isDirectory();
    }

    public createdDate(): Date {
        this.assertExists();

        return (this._stats as Stats).birthtime;
    }

    public isFile(): boolean {
        this.assertExists();

        return (this._stats as Stats).isFile();
    }

    public async write(content: string): Promise<void> {
        return new Promise<void>((resolve: IPromiseResolver<void>, reject: IPromiseRejector): void => {
            writeFile(this._absolutePath, content, 'utf-8', async(writeError: Error) => {
                if (writeError) {
                    reject(writeError);

                    return;
                }

                if (!this.exists()) {
                    this._stats = await Entity.getStats(this._absolutePath);
                }

                resolve();
            });
        });
    }

    public async delete(): Promise<void> {
        this.assertExists();

        return new Promise<void>((resolve: IPromiseResolver<void>, reject: IPromiseRejector): void => {
            unlink(this._absolutePath, (error: Error) => {
                if (error) {
                    reject(error);

                    return;
                }

                resolve();
            });
        });
    }

    public async readJSON(): Promise<any> { // tslint:disable-line no-any
        const content: string = await this.readContent();

        try {
            return JSON.parse(content);
        } catch (e) {
            throw new EntityNotValidJsonException(this._absolutePath, content);
        }
    }

    public async readContent(): Promise<string> {
        this.assertExists();

        if (!this.isFile()) {
            throw new EntityNotAFileException(this._absolutePath);
        }

        return new Promise((resolve: IPromiseResolver<string>, reject: IPromiseRejector): void => {
            readFile(this._absolutePath, 'utf-8', (err: Error, data: string): void => {
                if (err) {
                    reject(err);
                }

                resolve(data);
            });
        });
    }

    public async listChildren(): Promise<Array<string>> {
        this.assertExists();

        if (!this.isDirectory()) {
            throw new EntityNotADirectoryException(this._absolutePath);
        }

        return new Promise((resolve: IPromiseResolver<Array<string>>, reject: IPromiseRejector): void => {
            readdir(this._absolutePath, async(err: Error, files: Array<string>) => {
                if (err) {
                    reject(err);
                }

                resolve(files.filter((filePath: string) => {
                    return filePath.indexOf('.json') === filePath.length - 5;
                }).map((filePath: string): string => {
                    return join(this.path, filePath);
                }));
            });
        });
    }

    public async streamTo(stream: Writable): Promise<void> {
        this.assertExists();

        return new Promise<void>((resolve: IPromiseResolver<void>, reject: IPromiseRejector): void => {
            const readStream: ReadStream = createReadStream(this._absolutePath);

            readStream.on('open', () => {
                readStream.pipe(stream);
            });

            readStream.on('close', () => {
                resolve();
            });

            readStream.on('error', (e: Error) => {
                reject(e);
            });
        });
    }

    private assertExists(): void {
        if (!this.exists()) {
            throw new EntityDoesNotExistException(this._absolutePath);
        }
    }

    public static async fromPath(path: string): Promise<Entity> {
        try {
            return new Entity(path, await this.getStats(this.getAbsolutePath(path)));
        } catch (e) {
            return new Entity(path);
        }
    }

    private static getAbsolutePath(path: string): string {
        return join(FILE_SYSTEM.path, path);
    }

    private static async getStats(path: string): Promise<Stats> {
        return new Promise((resolve: IPromiseResolver<Stats>, reject: IPromiseRejector): void => {
            lstat(path, async(err: Error, stats: Stats): Promise<void> => {
                if (err) {
                    reject(err);

                    return;
                }

                resolve(stats);
            });
        });
    }
}
