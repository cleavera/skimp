export class Url {
    public readonly parts: Array<string>;
    public readonly dirName: string;
    public readonly resourceName: string;
    public readonly resourceId: string;
    private readonly _url: string;

    constructor(url: string) {
        this._url = url;
        this.parts = url.substring(1).split('/');
        this.resourceName = this.parts[0];
        this.resourceId = this.parts[1];
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
}
