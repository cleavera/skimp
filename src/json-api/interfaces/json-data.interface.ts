import { IAttributes } from './attributes.interface';
import { ILink } from './link.interface';

export interface IJsonData {
    data: {
        attributes: IAttributes;
        id?: string;
        type: string;
        relationships?: Array<ILink | IJsonData>
    };
}
