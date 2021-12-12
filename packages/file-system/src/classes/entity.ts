import { isNull } from '@cleavera/utils';
import { IEntity } from '@skimp/json-file';
import { createReadStream, promises as fs, ReadStream, Stats } from 'fs';
import { join } from 'path';
import { Writable } from 'stream';

import { EntityDoesNotExistException } from '../exceptions/entity-does-not-exist.exception';
import { EntityNotADirectoryException } from '../exceptions/entity-not-a-directory.exception';
import { EntityNotAFileException } from '../exceptions/entity-not-a-file.exception';
import { EntityNotValidJsonException } from '../exceptions/entity-not-valid-json.exception';

export class Entity implements IEntity {
    public readonly path: string;
    private _stats: Stats | null;

    private constructor(path: string, stats: Stats | null = null) {
        this.path = path;
        this._stats = stats;
    }

    public exists(): boolean {
        return !isNull(this._stats);
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
        await fs.writeFile(this.path, content, {
            encoding: 'utf-8',
            flag: 'w'
        });

        if (!this.exists()) {
            this._stats = await Entity.getStats(this.path);
        }
    }

    public async delete(): Promise<void> {
        this.assertExists();

        await fs.unlink(this.path);
    }

    public async readJSON(): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
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

        return fs.readFile(this.path, 'utf-8');
    }

    public async listChildren(): Promise<Array<string>> {
        this.assertExists();

        if (!this.isDirectory()) {
            throw new EntityNotADirectoryException(this.path);
        }

        const files: Array<string> = await fs.readdir(this.path);

        return files.filter((filePath: string) => {
            return filePath.indexOf('.json') === filePath.length - 5;
        }).map((filePath: string): string => {
            return join(this.path, filePath);
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
        return await fs.lstat(path);
    }
}
