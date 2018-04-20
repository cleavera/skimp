import { AsyncSetupFixture, AsyncTeardown, AsyncTeardownFixture, AsyncTest, Expect, TestFixture } from 'alsatian';
import { Response } from 'request';
import { RequestPromiseOptions } from 'request-promise-native';
import * as request from 'request-promise-native';
import { init, Server } from '../src';
import { Entity } from '../src/file-system';
import * as DATA_PATH from './data/path';
import { PersonSchema } from './schemas/person';

@TestFixture('Post')
export class PostSpec {
    private _server: Server;

    @AsyncSetupFixture
    public async setup(): Promise<void> {
        this._server = await init(1338, DATA_PATH, [PersonSchema]);
    }

    @AsyncTeardownFixture
    public async teardown(): Promise<void> {
        await this._server.close();
    }

    @AsyncTeardown
    public async clear(): Promise<void> {
        const files: Array<string> = await (await Entity.fromPath('/person')).listChildren();

        await Promise.all(files.map(async(file: string) => {
            await (await Entity.fromPath(file)).delete();
        }));
    }

    @AsyncTest('Happy path')
    public async happyPath(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const postOptions: RequestPromiseOptions = Object.assign({}, baseOptions, {
            method: 'POST',
            body: {
                name: 'Anthony Cleaver'
            }
        });

        const postResponse: Response = await request('/person', postOptions);

        Expect(postResponse.body).toEqual({
            name: 'Anthony Cleaver'
        });

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([{
            name: 'Anthony Cleaver'
        }]);

        const location: string = postResponse.headers.location || '';

        const getSingleResponse: Response = await request(location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            name: 'Anthony Cleaver'
        });
    }

    @AsyncTest('When posting to a schema that does not exist')
    public async schemaDoesNotExist(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const postOptions: RequestPromiseOptions = Object.assign({}, baseOptions, {
            method: 'POST',
            body: {
                name: 'Anthony Cleaver'
            }
        });

        let success: boolean = false;

        try {
            await request('/invalid', postOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(404);
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([]);
    }
}
