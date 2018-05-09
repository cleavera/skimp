import { IApi, Location, LOCATION_REGISTER, NoLocationRegisteredException } from '../../router';
import { Response } from '../../server';
import { Nullable } from '../../shared';
import { IJsonApi } from '../interfaces/json-api.interface';
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
                response.statusCode = 201;

                response.location = location.toString();
            }
        }

        response.json(model);
        response.commit();
    }

    public deserialise(json: IJsonApi, location: Location): any {
        const model: any = this.serialiser.deserialise(json);

        LOCATION_REGISTER.register(model, location);

        return model;
    }
}
