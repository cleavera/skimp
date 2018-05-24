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
import { LOGGER, LogLevel } from '../src/debug';
import { Entity } from '../src/file-system';
import { IJsonApi } from '../src/json-api/interfaces/json-api.interface';
import * as DATA_PATH from './data/path';
import { SCHEMAS } from './schemas';

@TestFixture('Delete')
export class DeleteSpec {
    public location: string;
    private _server: Server;

    @AsyncSetupFixture
    public async setup(): Promise<void> {
        this._server = await init(1338, DATA_PATH, SCHEMAS);
        LOGGER.setLogLevel(LogLevel.ERROR);
    }

    @AsyncTeardownFixture
    public async teardown(): Promise<void> {
        await this._server.close();
    }

    public async createJob(): Promise<string> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const postOptions: RequestPromiseOptions = Object.assign({}, baseOptions, {
            method: 'POST',
            body: {
                data: {
                    attributes: {
                        name: 'Web developer'
                    },
                    type: 'job',
                    relationships: [
                        {
                            href: this.location,
                            type: 'person'
                        }
                    ]
                }
            } as IJsonApi
        });

        const postResponse: Response = await request('/job', postOptions);
        const location: string = postResponse.headers.location || '';

        Expect(postResponse.body).toEqual({
            data: {
                attributes: {
                    name: 'Web developer'
                },
                id: location,
                type: 'job',
                relationships: [
                    {
                        href: this.location,
                        type: 'person'
                    }
                ]
            }
        } as IJsonApi);

        const getResponse: Response = await request('/job', baseOptions);

        Expect(getResponse.body).toEqual([{
            data: {
                attributes: {
                    name: 'Web developer'
                },
                id: location,
                type: 'job',
                relationships: [
                    {
                        href: this.location,
                        type: 'person'
                    }
                ]
            }
        } as IJsonApi]);

        const getSingleResponse: Response = await request(location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    name: 'Web developer'
                },
                id: location,
                type: 'job',
                relationships: [
                    {
                        href: this.location,
                        type: 'person'
                    }
                ]
            }
        } as IJsonApi);

        const getSinglePersonResponse: Response = await request(this.location, baseOptions);

        Expect(getSinglePersonResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver'
                },
                id: this.location,
                type: 'person',
                relationships: [
                    {
                        href: location,
                        type: 'job'
                    }
                ]
            }
        } as IJsonApi);

        return location;
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
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver'
                    },
                    type: 'person'
                }
            } as IJsonApi
        });

        const postResponse: Response = await request('/person', postOptions);
        this.location = postResponse.headers.location || '';

        Expect(postResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver'
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([{
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver'
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi]);
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
        const jobLocation: string = await this.createJob();
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

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([]);

        let success: boolean = false;

        try {
            await request(this.location, baseOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(404);
        }

        Expect(success).toBe(false);

        const getSingleJobResponse: Response = await request(jobLocation, baseOptions);

        Expect(getSingleJobResponse.body).toEqual({
            data: {
                attributes: {
                    name: 'Web developer'
                },
                id: jobLocation,
                type: 'job'
            }
        });
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
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver'
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi]);
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
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver'
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi]);
    }
}
