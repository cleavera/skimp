import { IApi, Location, LOCATION_REGISTER, NoLocationRegisteredException, ValidationException } from '../../router';
import { Response, ResponseCode } from '../../server';
import { Nullable } from '../../shared';
import { RequestNotValidDataException } from '../exception/request-not-valid-data.exception';
import { IJsonApi } from '../interfaces/json-api.interface';
import { IJsonData } from '../interfaces/json-data.interface';
import { Serialiser } from './serialiser';

export class Api implements IApi {
    public serialiser: Serialiser;

    constructor() {
        this.serialiser = new Serialiser();
    }

    public respond(response: Response, model: Array<any> | any, created?: boolean): void {
        if (Array.isArray(model)) {
            model = model.map((item: any) => {
                const location: Nullable<Location> = LOCATION_REGISTER.getLocation(item);

                if (!location) {
                    throw new NoLocationRegisteredException(item);
                }

                return this.serialiser.serialise(item, location);
            });
        } else {
            const location: Nullable<Location> = LOCATION_REGISTER.getLocation(model);

            if (!location) {
                throw new NoLocationRegisteredException(model);
            }

            model = this.serialiser.serialise(model, location);

            if (created) {
                response.statusCode = ResponseCode.CREATED;

                response.location = location.toString();
            }
        }

        response.json(model);
        response.commit();
    }

    public error(response: Response, code: ResponseCode, errors?: Array<ValidationException>): void {
        response.statusCode = code;

        if (errors && errors.length) {
            response.json(this.serialiser.error(errors));
        }

        response.commit();
    }

    public deserialise(json: IJsonApi, location: Location): any {
        if (!this.isData(json)) {
            throw new RequestNotValidDataException(json);
        }

        const model: any = this.serialiser.deserialise(json as IJsonData);

        LOCATION_REGISTER.register(model, location);

        return model;
    }

    private isData(json: IJsonApi): json is IJsonData {
        return 'data' in json && 'attributes' in json.data && 'type' in json.data;
    }
}
