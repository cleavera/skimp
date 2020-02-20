import { IDb, MODEL_REGISTER, ResourceDoesNotExistException, ResourceLocation } from '@skimp/core';

import { IEntityFactory } from '../interfaces/entity-factory.interface';
import { IEntity } from '../interfaces/entity.interface';
import { Serialiser } from './serialiser';

export class Db implements IDb {
    public serialiser: Serialiser;
    public entityFactory: IEntityFactory;

    private constructor(entityFactory: IEntityFactory) {
        this.serialiser = new Serialiser();
        this.entityFactory = entityFactory;
    }

    public async exists(location: ResourceLocation): Promise<boolean> {
        const filePath: string = this._getFilePath(location);
        const file: IEntity = await this.entityFactory.fromPath(filePath);

        return file.exists();
    }

    public async get(location: ResourceLocation): Promise<object> {
        const filePath: string = this._getFilePath(location);
        const file: IEntity = await this.entityFactory.fromPath(filePath);

        if (!file.exists()) {
            throw new ResourceDoesNotExistException(location);
        }

        const model: object = this.serialiser.deserialise(await file.readContent());

        MODEL_REGISTER.setLocation(model, location);
        MODEL_REGISTER.setCreatedDate(model, file.createdDate());

        return model;
    }

    public async list(location: ResourceLocation): Promise<Array<object>> {
        const entity: IEntity = await this.entityFactory.fromPath(location.toString());
        const files: Array<string> = await entity.listChildren();

        return Promise.all(files.map((filePath: string): Promise<object> => {
            return this.get(this.entityFactory.parseResourceLocation(filePath));
        }));
    }

    public async delete(location: ResourceLocation): Promise<void> {
        const filePath: string = this._getFilePath(location);
        const file: IEntity = await this.entityFactory.fromPath(filePath);

        if (!file.exists()) {
            throw new ResourceDoesNotExistException(location);
        }

        await file.delete();
    }

    public async set(location: ResourceLocation, model: object): Promise<void> {
        const filePath: string = this._getFilePath(location);
        const file: IEntity = await this.entityFactory.fromPath(filePath);

        MODEL_REGISTER.setLocation(model, location);

        await file.write(this.serialiser.serialise(model));
    }

    public static create(entityFactory: IEntityFactory): Db {
        return new Db(entityFactory);
    }

    private _getFilePath(location: ResourceLocation): string {
        return `${location.toString()}.json`;
    }
}
