import { $isNull, Maybe } from '@cleavera/utils';
import { MODEL_REGISTER, ResourceLocation } from '@skimp/core';
import { IJsonData, Serialiser } from '@skimp/json-api';
import { ISchema, SCHEMA_REGISTER, SchemaNotRegisteredException } from '@skimp/schema';

import { HttpRequest } from './http-request';

export class Api {
    public basePath: string;
    private _serialiser: Serialiser;

    constructor(basePath: string) {
        this.basePath = basePath;
        this._serialiser = new Serialiser();
    }

    public async get<T extends object>(_schema: ISchema<T>, location: ResourceLocation): Promise<T> {
        const json: IJsonData = await HttpRequest.get<IJsonData>(this._constructUrl(location));
        const model: T = this._serialiser.deserialise(json) as T;

        MODEL_REGISTER.setLocation(model, location);

        return model;
    }

    public async list<T extends object>(schema: ISchema<T>): Promise<Array<T>> {
        const resourceName: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);

        if ($isNull(resourceName)) {
            throw new SchemaNotRegisteredException(schema);
        }

        const location: ResourceLocation = new ResourceLocation(resourceName);
        const json: Array<IJsonData> = await HttpRequest.get<Array<IJsonData>>(this._constructUrl(location));

        return json.map<T>((data: IJsonData) => {
            const model: T = this._serialiser.deserialise(data) as T;

            const modelLocation: ResourceLocation = ResourceLocation.FromString(data.data.id as string);

            MODEL_REGISTER.setLocation(model, modelLocation);

            return model;
        });
    }

    public async save<T extends object>(model: T): Promise<T> {
        const schema: ISchema<T> = model.constructor as ISchema<T>;
        let location: Maybe<ResourceLocation> = MODEL_REGISTER.getLocation(model);
        const resourceName: Maybe<string> = SCHEMA_REGISTER.getSchemaResourceName(schema);

        if ($isNull(resourceName)) {
            throw new SchemaNotRegisteredException(schema);
        }

        let json: Maybe<IJsonData> = null;

        if ($isNull(location)) {
            json = await HttpRequest.post<IJsonData>(this._constructUrl(new ResourceLocation(resourceName)), JSON.parse(this._serialiser.serialiseModel(model)));
            location = ResourceLocation.FromString(json.data.id as string);
        } else {
            json = await HttpRequest.put<IJsonData>(this._constructUrl(location), JSON.parse(this._serialiser.serialiseModel(model)));
        }

        const savedModel: T = this._serialiser.deserialise(json) as T;

        MODEL_REGISTER.setLocation(savedModel, location);

        return savedModel;
    }

    public async remove(location: ResourceLocation): Promise<void> {
        await HttpRequest.delete(this._constructUrl(location));
    }

    private _constructUrl(resourceLocation: ResourceLocation): string {
        return `${this.basePath}${resourceLocation.toString()}`;
    }
}
