import { createReadStream, lstat, readdir, readFile, ReadStream, Stats, unlink, writeFile } from 'fs';
import { join } from 'path';
import { Writable } from 'stream';
import { EntityDoesNotExistException } from '../exceptions/entity-does-not-exist.exception';
import { EntityNotADirectoryException } from '../exceptions/entity-not-a-directory.exception';
import { EntityNotAFileException } from '../exceptions/entity-not-a-file.exception';
import { EntityNotValidJsonException } from '../exceptions/entity-not-valid-json.exception';

export class Entity {
    public readonly path: string;
    private _stats: Stats | void;

    private constructor(path: string, stats?: Stats) {
        this.path = path;
        this._stats = stats;
    }

    public exists(): boolean {
        return !!this._stats;
    }

    public isDirectory(): boolean {
        this.assertExists();

        return (this._stats as Stats).isDirectory();
    }

    public isFile(): boolean {
        this.assertExists();

        return (this._stats as Stats).isFile();
    }

    public async write(content: string): Promise<void> {
        return new Promise<void>((resolve: () => void, reject: (reason: Error) => void): void => {
            writeFile(this.path, content, 'utf-8', async(writeError: Error) => {
                if (writeError) {
                    reject(writeError);

                    return;
                }

                if (!this.exists()) {
                    this._stats = await Entity.getStats(this.path);
                }

                resolve();
            });
        });
    }

    public async delete(): Promise<void> {
        this.assertExists();

        return new Promise<void>((resolve: () => void, reject: (reason: Error) => void): void => {
            unlink(this.path, (error: Error) => {
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
            throw new EntityNotValidJsonException(this.path, content);
        }
    }

    public async readContent(): Promise<string> {
        this.assertExists();

        if (!this.isFile()) {
            throw new EntityNotAFileException(this.path);
        }

        return new Promise((resolve: (contents: string) => void, reject: (reason: Error) => void): void => {
            readFile(this.path, 'utf-8', (err: Error, data: string): void => {
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
            throw new EntityNotADirectoryException(this.path);
        }

        return new Promise((resolve: (children: Array<string>) => void, reject: (reason: Error) => void): void => {
            readdir(this.path, async(err: Error, files: Array<string>) => {
                if (err) {
                    reject(err);
                }

                resolve(files.map((filePath: string): string => {
                    return join(this.path, filePath);
                }));
            });
        });
    }

    public async streamTo(stream: Writable): Promise<void> {
        this.assertExists();

        return new Promise<void>((resolve: () => void, reject: (error: Error) => void): void => {
            const readStream: ReadStream = createReadStream(this.path);

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
            throw new EntityDoesNotExistException(this.path);
        }
    }

    public static async fromPath(path: string): Promise<Entity> {
        try {
            return new Entity(path, await this.getStats(path));
        } catch (e) {
            return new Entity(path);
        }
    }

    private static async getStats(path: string): Promise<Stats> {
        return new Promise((resolve: (entity: Stats) => void, reject: (reason: Error) => void): void => {
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
