import { IJsonValue } from '../../../core/src/index';

export interface IOptions<T extends IJsonValue = IJsonValue> extends Array<T> { } // tslint:disable-line no-empty-interface
