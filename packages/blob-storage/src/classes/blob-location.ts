import { BlobItem, ContainerClient } from '@azure/storage-blob';

export class BlobLocation {
    public container: string;
    public file: string | null;

    constructor(container: string, file: string | null = null) {
        this.container = container;
        this.file = file;
    }

    public toString(): string {
        if (this.file === null) {
            return this.container;
        }

        return `${this.container}/${this.file}`;
    }

    public static FromFilePath(path: string): BlobLocation {
        const [
            container,
            file
        ]: [
            string, string
        ] = path.substring(1).split('/') as [string, string];

        return new BlobLocation(container, file);
    }

    public static FromBlobItem(container: ContainerClient, blobItem: BlobItem): BlobLocation {
        return new BlobLocation(container.containerName, blobItem.name);
    }
}
