import { IJsonValue } from '../../serialiser/interfaces/json-value.interface';

export interface IData {
    [attribute: string]: IJsonValue;
}
