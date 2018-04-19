import { Entity } from '../../file-system';

export class Url {
    public parts: Array<string>;
    public dirName: string;
    private readonly _url: string;

    constructor(url: string) {
        this._url = url;
        this.parts = url.split('/');
        this.dirName = url.substr(0, url.lastIndexOf('/'));
    }

    public toString(): string {
        return this._url;
    }

    public valueOf(): string {
        return this.toString();
    }

    public *[Symbol.iterator](): IterableIterator<string> {
        for (const part of this.parts) {
            yield part;
        }

        return;
    }

    public static fromEntity(entity: Entity): Url {
        return new Url(entity.path.replace('.json', '').replace(/\\/g, '/'));
    }
}
