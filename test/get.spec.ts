import {
    AsyncSetup,
    AsyncSetupFixture,
    AsyncTeardown,
    AsyncTeardownFixture, AsyncTest,
    Expect,
    TestFixture
} from 'alsatian';
import { Response } from 'request';
import { RequestPromiseOptions } from 'request-promise-native';
import * as request from 'request-promise-native';
import { init, Server } from '../src';
import { LOGGER, LogLevel } from '../src/debug';
import { IJsonApi } from '../src/json-api/interfaces/json-api.interface';
import * as DATA_PATH from './data/path';
import { $clearDB } from './helpers/clear-db.helper';
import { SCHEMAS } from './schemas';

@TestFixture('Get')
export class GetSpec {
    public personLocation: string;
    public jobLocation: string;
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

    public async createJob(): Promise<void> {
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
                            href: this.personLocation,
                            type: 'person'
                        }
                    ]
                }
            } as IJsonApi
        });

        const postResponse: Response = await request('/job', postOptions);
        this.jobLocation = postResponse.headers.location || '';

        Expect(postResponse.body).toEqual({
            data: {
                attributes: {
                    name: 'Web developer'
                },
                id: this.jobLocation,
                type: 'job',
                relationships: [
                    {
                        href: this.personLocation,
                        type: 'person',
                        meta: {
                            methods: {
                                GET: true,
                                POST: false,
                                PUT: true,
                                DELETE: true
                            }
                        }
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
                id: this.jobLocation,
                type: 'job',
                relationships: [
                    {
                        href: this.personLocation,
                        type: 'person',
                        meta: {
                            methods: {
                                GET: true,
                                POST: false,
                                PUT: true,
                                DELETE: true
                            }
                        }
                    }
                ]
            }
        } as IJsonApi]);

        const getSingleResponse: Response = await request(this.jobLocation, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    name: 'Web developer'
                },
                id: this.jobLocation,
                type: 'job',
                relationships: [
                    {
                        href: this.personLocation,
                        type: 'person',
                        meta: {
                            methods: {
                                GET: true,
                                POST: false,
                                PUT: true,
                                DELETE: true
                            }
                        }
                    }
                ]
            }
        } as IJsonApi);

        const getSinglePersonResponse: Response = await request(this.personLocation, baseOptions);

        Expect(getSinglePersonResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver'
                },
                id: this.personLocation,
                type: 'person',
                relationships: [
                    {
                        href: this.jobLocation,
                        type: 'job',
                        meta: {
                            methods: {
                                GET: true,
                                POST: false,
                                PUT: true,
                                DELETE: true
                            }
                        }
                    }
                ]
            }
        } as IJsonApi);
    }

    public async createPerson(): Promise<void> {
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
        this.personLocation = postResponse.headers.location || '';

        Expect(postResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver'
                },
                id: this.personLocation,
                type: 'person'
            }
        } as IJsonApi);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([{
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver'
                },
                id: this.personLocation,
                type: 'person'
            }
        } as IJsonApi]);
    }

    @AsyncSetup
    public async setupTests(): Promise<void> {
        await this.createPerson();
        await this.createJob();
    }

    @AsyncTeardown
    public async clear(): Promise<void> {
        await $clearDB();
    }

    @AsyncTest()
    public async getRootResource(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const getResponse: Response = await request('/', baseOptions);

        Expect(getResponse.body).toEqual({
            data: {
                attributes: {
                    version: 'UNVERSIONED'
                },
                id: '/',
                type: 'ROOT',
                links: {
                    person: '/person',
                    job: '/job',
                    team: '/team'
                }
            }
        } as IJsonApi);
    }

    @AsyncTest()
    public async getRootResourceAtAlias(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        let success: boolean = false;

        try {
            await request('/ROOT', baseOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(404);
        }

        Expect(success).toBe(false);
    }

    @AsyncTest()
    public async getSingleResource(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const getResponse: Response = await request(this.personLocation, baseOptions);

        Expect(getResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver'
                },
                id: this.personLocation,
                type: 'person',
                relationships: [
                    {
                        href: this.jobLocation,
                        type: 'job',
                        meta: {
                            methods: {
                                GET: true,
                                POST: false,
                                PUT: true,
                                DELETE: true
                            }
                        }
                    }
                ]
            }
        } as IJsonApi);

        Expect(getResponse.headers.allow).toEqual('GET, PUT, DELETE');
    }

    @AsyncTest()
    public async getMultipleResource(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([{
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver'
                },
                id: this.personLocation,
                type: 'person',
                relationships: [
                    {
                        href: this.jobLocation,
                        type: 'job',
                        meta: {
                            methods: {
                                GET: true,
                                POST: false,
                                PUT: true,
                                DELETE: true
                            }
                        }
                    }
                ]
            }
        } as IJsonApi]);

        Expect(getResponse.headers.allow).toEqual('GET, POST');
    }
}
