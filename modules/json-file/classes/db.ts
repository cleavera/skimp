import { IDb, MODEL_REGISTER, ResourceLocation } from '../../core';
import { Entity } from '../../file-system';
import { ResourceDoesNotExistException } from '../../router';

import { InvalidDatabaseFilePathException } from '../exceptions/invalid-database-file-path.exception';
import { Serialiser } from './serialiser';

export class Db implements IDb {
    public serialiser: Serialiser;

    constructor() {
        this.serialiser = new Serialiser();
    }

    public async exists(location: ResourceLocation): Promise<boolean> {
        const filePath: string = location.toString() + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        return file.exists();
    }

    public async get(location: ResourceLocation): Promise<any> {
        const filePath: string = location.toString() + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        if (!file.exists()) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        const model: any = this.serialiser.deserialise(await file.readContent());

        MODEL_REGISTER.setLocation(model, location);
        MODEL_REGISTER.setCreatedDate(model, file.createdDate());

        return model;
    }

    public async list(location: ResourceLocation): Promise<Array<any>> {
        const entity: Entity = await Entity.fromPath(location.toString());
        const files: Array<string> = await entity.listChildren();

        return Promise.all(files.map(async(filePath: string) => {
            const pathParts: Array<string> = filePath.substring(1, filePath.lastIndexOf('.')).split('\\');

            if (pathParts.length !== 2) {
                throw new InvalidDatabaseFilePathException(filePath);
            }

            const fileLocation: ResourceLocation = new ResourceLocation(pathParts[0], pathParts[1]);

            return this.get(fileLocation);
        }));
    }

    public async delete(location: ResourceLocation): Promise<void> {
        const filePath: string = location.toString() + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        if (!file.exists()) {
            throw new ResourceDoesNotExistException(location.toUrl());
        }

        await file.delete();
    }

    public async set(location: ResourceLocation, model: any): Promise<void> {
        const filePath: string = location.toString() + '.json';
        const file: Entity = await Entity.fromPath(filePath);

        MODEL_REGISTER.setLocation(model, location);

        await file.write(this.serialiser.serialise(model));
    }
}
