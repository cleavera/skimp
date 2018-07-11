export class Uri {
    public readonly parts: Array<string>;
    public readonly dirName: string;
    public readonly resourceName: string;
    public readonly resourceId: string;
    private readonly _uri: string;

    constructor(uri: string) {
        this._uri = uri;
        this.parts = uri.substring(1).split('/');
        this.resourceName = this.parts[0];
        this.resourceId = this.parts[1];
        this.dirName = uri.substr(0, uri.lastIndexOf('/'));
    }

    public toString(): string {
        return this._uri;
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
