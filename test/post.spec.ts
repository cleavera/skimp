import {
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
import { IJsonApi } from '../src/json-api/interfaces/json-api.interface';
import * as DATA_PATH from './data/path';
import { PersonSchema } from './schemas/person';

@TestFixture('Post')
export class PostSpec {
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

    @AsyncTeardown
    public async clear(): Promise<void> {
        const files: Array<string> = await (await Entity.fromPath('/person')).listChildren();

        await Promise.all(files.map(async(file: string) => {
            await (await Entity.fromPath(file)).delete();
        }));
    }

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

        const getSingleResponse: Response = await request(this.location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver'
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi);
    }

    @AsyncTest('Happy path')
    public async happyPath(): Promise<void> {
        await this.create();
    }

    @AsyncTest('When sending invalid json data')
    public async invalidJsonData(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const postOptions: RequestPromiseOptions = Object.assign({}, baseOptions, {
            method: 'POST',
            body: {
                errors: []
            } as IJsonApi
        });

        let success: boolean = false;

        try {
            await request('/person', postOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(400);
            Expect(e.error).toEqual({
                errors: [
                    {
                        code: 'invalidJsonData',
                        source: {
                            pointer: ''
                        }
                    }
                ]
            });
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([]);
    }

    @AsyncTest('When omitting a required field')
    public async missingRequiredField(): Promise<void> {
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
                        dateOfBirth: '1990-05-04'
                    },
                    type: 'person'
                }
            } as IJsonApi
        });

        let success: boolean = false;

        try {
            await request('/person', postOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(400);
            Expect(e.error).toEqual({
                errors: [
                    {
                        code: 'required',
                        source: {
                            pointer: '/data/attributes/fullName'
                        }
                    }
                ]
            });
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([]);
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
                data: {
                    attributes: {
                        name: 'Anthony Cleaver'
                    },
                    type: 'invalid'
                }
            } as IJsonApi
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

    @AsyncTest('When posting to a resource that does not exist')
    public async postToNonExistentResource(): Promise<void> {
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

        let success: boolean = false;

        try {
            await request('/person/123', postOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(404);
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([]);
    }

    @AsyncTest('When posting to a resource that exists')
    public async postToExistingResource(): Promise<void> {
        await this.create();

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

        let success: boolean = false;

        try {
            await request(this.location, postOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(405);
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
