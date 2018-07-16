import { Response } from 'request';
import * as request from 'request-promise-native';

export function $request(location: string, options: request.RequestPromiseOptions): Promise<Response> {
    return request(location, options);
}
