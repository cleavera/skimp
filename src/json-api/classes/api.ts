import { Response, Url } from '../../server';
import { Serialiser } from './serialiser';

export class Api {
    public serialiser: Serialiser;

    constructor() {
        this.serialiser = new Serialiser();
    }

    public respond(response: Response, model: any, location: Url, created?: boolean): void {
        if (created) {
            response.statusCode = 201;

            response.location = location.toString();
        }

        if (Array.isArray(model)) {
            model = model.map((item: any) => {
                return this.serialiser.serialise(item, location);
            });
        } else {
            model = this.serialiser.serialise(model, location);
        }

        response.json(model);
        response.commit();
    }

    public deserialise(json: any): any {
        return this.serialiser.deserialise(json);
    }
}
