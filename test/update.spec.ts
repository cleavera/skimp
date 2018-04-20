import {
    AsyncSetup,
    AsyncSetupFixture,
    AsyncTeardown,
    AsyncTeardownFixture,
    AsyncTest,
    Expect,
    TestFixture
} from 'alsatian';
import { Response } from 'request';
import { RequestPromiseOptions } from 'request-promise-native';
import * as request from 'request-promise-native';
import { init, Server } from '../src';
import { Entity } from '../src/file-system';
import * as DATA_PATH from './data/path';

@TestFixture('Update')
export class UpdateSpec {
    public location: string;
    private _server: Server;

    @AsyncSetupFixture
    public async setup(): Promise<void> {
        this._server = init(1338, DATA_PATH);
    }

    @AsyncTeardownFixture
    public async teardown(): Promise<void> {
        await this._server.close();
    }

    @AsyncSetup
    public async create(): Promise<void> {
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

        this.location = postResponse.headers.location || '';
    }

    @AsyncTeardown
    public async clear(): Promise<void> {
        const files: Array<string> = await (await Entity.fromPath('/person')).listChildren();

        await Promise.all(files.map(async(file: string) => {
            await (await Entity.fromPath(file)).delete();
        }));
    }

    @AsyncTest('When putting an existing resource')
    public async existingResource(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        await request(this.location, baseOptions);

        const putOptions: RequestPromiseOptions = Object.assign({}, baseOptions, {
            method: 'PUT',
            body: {
                name: 'Anthony Cleaver2'
            }
        });

        const putResponse: Response = await request(this.location, putOptions);

        Expect(putResponse.body).toEqual({
            name: 'Anthony Cleaver2'
        });

        Expect(putResponse.statusCode).toBe(200);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([
            {
                name: 'Anthony Cleaver2'
            }
        ]);

        const getSingleResponse: Response = await request(this.location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            name: 'Anthony Cleaver2'
        });
    }

    @AsyncTest('When putting a new resource')
    public async happyPath(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        let success: boolean = false;

        try {
            await request('/person/123', baseOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(404);
        }

        Expect(success).toBe(false);

        const putOptions: RequestPromiseOptions = Object.assign({}, baseOptions, {
            method: 'PUT',
            body: {
                name: 'Anthony Cleaver'
            }
        });

        const putResponse: Response = await request('/person/123', putOptions);

        Expect(putResponse.body).toEqual({
            name: 'Anthony Cleaver'
        });

        Expect(putResponse.statusCode).toBe(201);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([
            {
                name: 'Anthony Cleaver'
            },
            {
                name: 'Anthony Cleaver'
            }
        ]);

        const getSingleResponse: Response = await request('/person/123', baseOptions);

        Expect(getSingleResponse.body).toEqual({
            name: 'Anthony Cleaver'
        });
    }

    @AsyncTest('When putting to a schema that does not exist')
    public async schemaDoesNotExist(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const postOptions: RequestPromiseOptions = Object.assign({}, baseOptions, {
            method: 'PUT',
            body: {
                name: 'Anthony Cleaver'
            }
        });

        let success: boolean = false;

        try {
            await request('/invalid/123', postOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(404);
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([
            {
                name: 'Anthony Cleaver'
            }
        ]);
    }
}
