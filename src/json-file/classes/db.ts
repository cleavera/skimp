import { Entity } from '../../file-system';
import { Location, ResourceDoesNotExistException } from '../../router';
import { Serialiser } from './serialiser';

export class Db {
    public serialiser: Serialiser;

    constructor() {
        this.serialiser = new Serialiser();
    }

    public async exists(location: Location): Promise<boolean> {
        const filePath: string = location.toString() + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        return file.exists();
    }

    public async get(location: Location): Promise<any> {
        const filePath: string = location.toString() + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        if (!file.exists()) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        return this.serialiser.deserialise(await file.readContent());
    }

    public async list(location: Location): Promise<Array<any>> {
        const entity: Entity = await Entity.fromPath(location.toString());
        const files: Array<string> = await entity.listChildren();

        return Promise.all(files.map(async(filePath: string) => {
            const file: Entity = await Entity.fromPath(filePath);

            return this.serialiser.deserialise(await file.readContent());
        }));
    }

    public async delete(location: Location): Promise<void> {
        const filePath: string = location.toString() + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        if (!file.exists()) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        await file.delete();
    }

    public async set(location: Location, resource: any): Promise<void> {
        const filePath: string = location.toString() + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        await file.write(this.serialiser.serialise(resource));
    }
}
