import { IAttributes } from './attributes.interface';
import { ILinks } from './links.interface';

export interface IJsonApi {
    data: {
        attributes: IAttributes;
        id?: string;
        type: string;
        relationships?: Array<ILinks | IJsonApi>
    };
}
