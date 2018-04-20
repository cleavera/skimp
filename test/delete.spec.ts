import { AsyncSetup, AsyncSetupFixture, AsyncTeardown, AsyncTeardownFixture, AsyncTest, Expect, TestFixture } from 'alsatian';
import { Response } from 'request';
import { RequestPromiseOptions } from 'request-promise-native';
import * as request from 'request-promise-native';
import { init, Server } from '../src';
import { Entity } from '../src/file-system';
import * as DATA_PATH from './data/path';
import { PersonSchema } from './schemas/person';

@TestFixture('Delete')
export class DeleteSpec {
    public location: string;
    private _server: Server;

    @AsyncSetupFixture
    public async setup(): Promise<void> {
        this._server = await init(1338, DATA_PATH, [PersonSchema]);
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

    @AsyncTest('Happy path')
    public async happyPath(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const deleteOptions: RequestPromiseOptions = Object.assign({}, baseOptions, {
            method: 'DELETE'
        });

        const deleteResponse: Response = await request(this.location, deleteOptions);

        Expect(deleteResponse.body).not.toBeDefined();
        Expect(deleteResponse.statusCode).toBe(204);
    }

    @AsyncTest('When trying to delete a directory should 405')
    public async deleteADirectory(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const deleteOptions: RequestPromiseOptions = Object.assign({}, baseOptions, {
            method: 'DELETE'
        });

        let success: boolean = false;

        try {
            await request('/person', deleteOptions);

            success = true;
        } catch (e) {
            Expect(e.body).not.toBeDefined();
            Expect(e.statusCode).toBe(405);
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([{
            name: 'Anthony Cleaver'
        }]);
    }

    @AsyncTest('When trying to delete a resource that does not exist should 404')
    public async deleteAMissingFile(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const deleteOptions: RequestPromiseOptions = Object.assign({}, baseOptions, {
            method: 'DELETE'
        });

        let success: boolean = false;

        try {
            await request('/person/12345', deleteOptions);

            success = true;
        } catch (e) {
            Expect(e.body).not.toBeDefined();
            Expect(e.statusCode).toBe(404);
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([{
            name: 'Anthony Cleaver'
        }]);
    }
}
