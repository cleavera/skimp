import { $isNull, Maybe } from '@cleavera/utils';
import { IApi, MissingCreatedDateException, MODEL_REGISTER, ResourceLocation } from '@skimp/core';
import { IResponse, ResponseCode } from '@skimp/http';
import { NoLocationRegisteredException } from '@skimp/router';
import { ValidationException } from '@skimp/schema';

import { RequestNotValidDataException } from '../exception/request-not-valid-data.exception';
import { IJsonApi } from '../interfaces/json-api.interface';
import { IJsonData } from '../interfaces/json-data.interface';
import { Serialiser } from './serialiser';

export class Api implements IApi {
    public serialiser: Serialiser;

    constructor() {
        this.serialiser = new Serialiser();
    }

    public respond(response: IResponse, model: Array<any> | any, _location: ResourceLocation, created?: boolean): void {
        if (Array.isArray(model)) {
            model = model.sort((a: any, b: any): number => {
                const aCreated: Maybe<Date> = MODEL_REGISTER.getCreatedDate(a);
                const bCreated: Maybe<Date> = MODEL_REGISTER.getCreatedDate(b);

                if ($isNull(aCreated)) {
                    throw new MissingCreatedDateException(a);
                }

                if ($isNull(bCreated)) {
                    throw new MissingCreatedDateException(b);
                }

                if (aCreated < bCreated) {
                    return 1;
                }

                if (aCreated > bCreated) {
                    return -1;
                }

                return 0;
            }).map((item: any) => {
                const location: Maybe<ResourceLocation> = MODEL_REGISTER.getLocation(item);

                if ($isNull(location)) {
                    throw new NoLocationRegisteredException(item);
                }

                return this.serialiser.serialise(item, location);
            });

            response.setAllow(true, false, false);
        } else {
            const location: Maybe<ResourceLocation> = MODEL_REGISTER.getLocation(model);

            if ($isNull(location)) {
                throw new NoLocationRegisteredException(model);
            }

            model = this.serialiser.serialise(model, location);

            if (created) {
                response.statusCode = ResponseCode.CREATED;

                response.location = location.toString();
            }

            response.setAllow(location.isResource(), location.isEntity(), location.isEntity());
        }

        response.json(model);
        response.commit();
    }

    public error(response: IResponse, code: ResponseCode, errors: Maybe<Array<ValidationException>> = null): void {
        response.statusCode = code;

        if (!$isNull(errors) && errors.length) {
            response.json(this.serialiser.error(errors));
        }

        response.commit();
    }

    public deserialise(content: string, location: ResourceLocation): any {
        const json: IJsonApi = JSON.parse(content);

        if (!Api.isData(json)) {
            throw new RequestNotValidDataException(json);
        }

        const model: any = this.serialiser.deserialise(json as IJsonData);

        MODEL_REGISTER.setLocation(model, location);

        return model;
    }

    private static isData(json: IJsonApi): json is IJsonData {
        return 'data' in json && 'attributes' in json.data && 'type' in json.data;
    }
}
