import { IAttributes } from './attributes.interface';
import { ILinks } from './links.interface';
import { IRelationship } from './relationship.interface';

export interface IJsonData {
    data: {
        attributes: IAttributes;
        id?: string;
        type: string;
        relationships?: Array<IRelationship>,
        links?: ILinks
    };
}
