import { Response } from 'request';
import { RequestPromiseOptions } from 'request-promise-native';
import * as request from 'request-promise-native';

export function $request(location: string, options: RequestPromiseOptions): Promise<Response> {
    return request(location, options).promise();
}
