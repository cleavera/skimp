import { IJsonValue } from '@skimp/shared';

export interface IOptions<T extends IJsonValue = IJsonValue> extends Array<T> { } // tslint:disable-line no-empty-interface
