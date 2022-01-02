import { PagedAsyncIterableIterator } from '@azure/core-paging';
import { BlobClient, BlobDownloadResponseParsed, BlobItem, BlobServiceClient, ContainerClient, ContainerGetPropertiesResponse, ContainerListBlobFlatSegmentResponse } from '@azure/storage-blob';
import { IEntity } from '@skimp/json-file';

import { EnvironmentNotNodeException } from '../errors/environment-not-node.exception';
import { BlobLocation } from './blob-location';

export class Entity implements IEntity {
    public readonly location: BlobLocation;
    private readonly _client: BlobServiceClient;

    constructor(client: BlobServiceClient, location: BlobLocation) {
        this.location = location;
        this._client = client;
    }

    public async createdDate(): Promise<Date> {
        const containerClient: ContainerClient = this.getContainerClient();
        const properties: ContainerGetPropertiesResponse = await containerClient.getProperties();

        return properties.lastModified as Date;
    }

    public async delete(): Promise<void> {
        await this.getBlobClient().deleteIfExists();
    }

    public async exists(): Promise<boolean> {
        if (!(await this.getContainerClient().exists())) {
            return false;
        }

        return this.getBlobClient().exists();
    }

    public async listChildren(): Promise<Array<string>> {
        const blobIterator: PagedAsyncIterableIterator<BlobItem, ContainerListBlobFlatSegmentResponse> = this.getContainerClient().listBlobsFlat();
        const blobs: Array<BlobItem> = [];

        for await (const blob of blobIterator) {
            blobs.push(blob);
        }

        return blobs.map((blob: BlobItem) => {
            return BlobLocation.FromBlobItem(this.getContainerClient(), blob).toString();
        });
    }

    public async readContent(): Promise<string> {
        const downloadedBlob: BlobDownloadResponseParsed = await this.getBlobClient().download();

        if (!downloadedBlob.readableStreamBody) {
            throw new EnvironmentNotNodeException();
        }

        return this.streamToString(downloadedBlob.readableStreamBody);
    }

    public async write(content: string): Promise<void> {
        await this.getBlobClient()
            .getBlockBlobClient()
            .uploadData(Buffer.from(content, 'utf-8'));
    }

    public getContainerClient(): ContainerClient {
        return this._client.getContainerClient(this.location.container);
    }

    public getBlobClient(): BlobClient {
        if (this.location.file === null) {
            throw new Error('No file');
        }

        return this.getContainerClient().getBlobClient(this.location.file);
    }

    // eslint-disable-next-line no-undef
    private async streamToString(stream: NodeJS.ReadableStream): Promise<string> {
        const chunks: Array<Buffer> = [];

        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => {
                chunks.push(Buffer.from(chunk));
            });

            stream.on('error', (err) => {
                reject(err);
            });

            stream.on('end', () => {
                resolve(Buffer.concat(chunks).toString('utf8'));
            });
        });
    }

    public static Create(client: BlobServiceClient, location: BlobLocation): Entity {
        return new Entity(client, location);
    }
}
