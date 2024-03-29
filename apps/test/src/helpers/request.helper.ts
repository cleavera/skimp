import { Response } from 'request';
import * as request from 'request-promise-native';

export async function makeRequest(location: string, options: request.RequestPromiseOptions): Promise<Response> {
    return request(location, options).promise();
}
