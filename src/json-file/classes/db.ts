import { Entity } from '../../file-system';
import { ResourceDoesNotExistException } from '../../router/exceptions/resource-does-not-exist.exception';
import { Serialiser } from '../../serialiser/classes/serialiser';
import { Url } from '../../server';

export class Db {
    public async get(location: Url): Promise<any> {
        const filePath: string = location.toString() + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        if (!file.exists()) {
            throw new ResourceDoesNotExistException(location);
        }

        return Serialiser.jsonFile().deserialise(await file.readContent());
    }

    public async list(location: Url): Promise<Array<any>> {
        const entity: Entity = await Entity.fromPath(location.toString());
        const files: Array<string> = await entity.listChildren();

        return Promise.all(files.map(async(filePath: string) => {
            const file: Entity = await Entity.fromPath(filePath);

            return Serialiser.jsonFile().deserialise(await file.readContent());
        }));
    }

    public async delete(location: Url): Promise<void> {
        const filePath: string = location.toString() + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        if (!file.exists()) {
            throw new ResourceDoesNotExistException(location);
        }

        await file.delete();
    }

    public async set(location: Url, resource: any): Promise<void> {
        const filePath: string = location.toString() + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        await file.write(Serialiser.jsonFile().serialise(resource, Url.fromEntity(file)));
    }
}
