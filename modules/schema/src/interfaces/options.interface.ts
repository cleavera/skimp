import { IJsonValue } from '@cleavera/utils';

export interface IOptions<T extends IJsonValue = IJsonValue> extends Array<T> { } // eslint-disable-line @typescript-eslint/no-empty-interface
