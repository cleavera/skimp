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
import { IJsonApi } from '../src/json-api/interfaces/json-api.interface';
import * as DATA_PATH from './data/path';
import { PersonSchema } from './schemas/person';

@TestFixture('Update')
export class UpdateSpec {
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
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver2'
                    },
                    id: this.location,
                    type: 'person'
                }
            } as IJsonApi
        });

        const putResponse: Response = await request(this.location, putOptions);

        Expect(putResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2'
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi);

        Expect(putResponse.statusCode).toBe(200);

        const getSingleResponse: Response = await request(this.location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2'
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([{
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2'
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi]);
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
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver2'
                    },
                    type: 'person'
                }
            } as IJsonApi
        });

        const location: string = '/person/123';

        const putResponse: Response = await request(location, putOptions);

        Expect(putResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2'
                },
                id: location,
                type: 'person'
            }
        } as IJsonApi);

        Expect(putResponse.statusCode).toBe(201);

        const getSingleResponse: Response = await request(location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2'
                },
                id: location,
                type: 'person'
            }
        } as IJsonApi);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([
            {
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver2'
                    },
                    id: location,
                    type: 'person'
                }
            } as IJsonApi,
            {
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver'
                    },
                    id: this.location,
                    type: 'person'
                }
            } as IJsonApi
        ]);
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
                data: {
                    attributes: {
                        name: 'Anthony Cleaver'
                    },
                    type: 'person'
                }
            } as IJsonApi
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
