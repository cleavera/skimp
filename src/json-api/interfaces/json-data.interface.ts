import { IAttributes } from './attributes.interface';
import { ILinks } from './links.interface';

export interface IJsonData {
    data: {
        attributes: IAttributes;
        id?: string;
        type: string;
        relationships?: Array<ILinks | IJsonData>
    };
}
