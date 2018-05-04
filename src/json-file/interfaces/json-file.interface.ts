import { IData } from './data.interface';
import { IRelationship } from './relationship.interface';

export interface IJsonFile {
    data: IData;
    type: string;
    relationships?: Array<IRelationship>;
}
