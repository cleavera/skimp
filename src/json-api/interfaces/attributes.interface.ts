import { IJsonValue } from '../../serialiser/interfaces/json-value.interface';

export interface IAttributes {
    [attribute: string]: IJsonValue;
}
