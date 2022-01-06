import { LOGGER, LogLevel } from '@skimp/debug';
import { IJsonApi } from '@skimp/json-api';
import { Expect, Setup, SetupFixture, Teardown, TeardownFixture, Test, TestFixture } from 'alsatian';
import { Response } from 'request';
import { RequestPromiseOptions } from 'request-promise-native';

import { TestServer } from './classes/test-server';
import * as DATA_PATH from './data/path';
import { makeRequest } from './helpers/request.helper';
import { SCHEMAS } from './schemas';

@TestFixture('Delete')
export class DeleteSpec {
    public location!: string;
    private _server!: TestServer;

    @SetupFixture
    public async setup(): Promise<void> {
        this._server = await TestServer.create(1338, DATA_PATH, SCHEMAS);
        LOGGER.setLogLevel(LogLevel.ERROR);
    }

    @TeardownFixture
    public async teardown(): Promise<void> {
        await this._server.close();
    }

    public async createJob(): Promise<string> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const postOptions: RequestPromiseOptions = {
            ...baseOptions,
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
        };

        const postResponse: Response = await makeRequest('/job', postOptions);
        const location: string = postResponse.headers.location ?? '';

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

        const getResponse: Response = await makeRequest('/job', baseOptions);

        Expect(getResponse.body).toEqual([
            {
                data: {
                    attributes: {
                        name: 'Web developer'
                    },
                    id: location,
                    type: 'job',
                    relationships: [
                        {
                            href: this.location,
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
            } as IJsonApi
        ]);

        const getSingleResponse: Response = await makeRequest(location, baseOptions);

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

        const getSinglePersonResponse: Response = await makeRequest(this.location, baseOptions);

        Expect(getSinglePersonResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver',
                    dateOfBirth: null,
                    height: null,
                    weight: null,
                    employed: null,
                    gender: null
                },
                id: this.location,
                type: 'person',
                relationships: [
                    {
                        href: location,
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

        return location;
    }

    @Setup
    public async create(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const postOptions: RequestPromiseOptions = {
            ...baseOptions,
            method: 'POST',
            body: {
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver'
                    },
                    type: 'person'
                }
            } as IJsonApi
        };

        const postResponse: Response = await makeRequest('/person', postOptions);
        this.location = postResponse.headers.location ?? '';

        Expect(postResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver',
                    dateOfBirth: null,
                    height: null,
                    weight: null,
                    employed: null,
                    gender: null
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi);

        const getResponse: Response = await makeRequest('/person', baseOptions);

        Expect(getResponse.body).toEqual([
            {
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver',
                        dateOfBirth: null,
                        height: null,
                        weight: null,
                        employed: null,
                        gender: null
                    },
                    id: this.location,
                    type: 'person'
                }
            } as IJsonApi
        ]);
    }

    @Teardown
    public async clear(): Promise<void> {
        await this._server.clearData();
    }

    @Test('Happy path')
    public async happyPath(): Promise<void> {
        const jobLocation: string = await this.createJob();
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const deleteOptions: RequestPromiseOptions = {
            ...baseOptions,
            method: 'DELETE'
        };

        const deleteResponse: Response = await makeRequest(this.location, deleteOptions);

        Expect(deleteResponse.body).not.toBeDefined();
        Expect(deleteResponse.statusCode).toBe(204);

        const getResponse: Response = await makeRequest('/person', baseOptions);

        Expect(getResponse.body).toEqual([]);

        let success: boolean = false;

        try {
            await makeRequest(this.location, baseOptions);

            success = true;
        } catch (e) {
            Expect((e as Response).statusCode).toEqual(404);
        }

        Expect(success).toBe(false);

        const getSingleJobResponse: Response = await makeRequest(jobLocation, baseOptions);

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

    @Test('When trying to delete a directory should 405')
    public async deleteADirectory(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const deleteOptions: RequestPromiseOptions = {
            ...baseOptions,
            method: 'DELETE'
        };

        let success: boolean = false;

        try {
            await makeRequest('/person', deleteOptions);

            success = true;
        } catch (e) {
            Expect((e as Response).body).not.toBeDefined();
            Expect((e as Response).statusCode).toBe(405);
        }

        Expect(success).toBe(false);

        const getResponse: Response = await makeRequest('/person', baseOptions);

        Expect(getResponse.body).toEqual([
            {
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver',
                        dateOfBirth: null,
                        height: null,
                        weight: null,
                        employed: null,
                        gender: null
                    },
                    id: this.location,
                    type: 'person'
                }
            } as IJsonApi
        ]);
    }

    @Test('When trying to delete a resource that does not exist should 404')
    public async deleteAMissingFile(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const deleteOptions: RequestPromiseOptions = {
            ...baseOptions,
            method: 'DELETE'
        };

        let success: boolean = false;

        try {
            await makeRequest('/person/12345', deleteOptions);

            success = true;
        } catch (e) {
            Expect((e as Response).body).not.toBeDefined();
            Expect((e as Response).statusCode).toBe(404);
        }

        Expect(success).toBe(false);

        const getResponse: Response = await makeRequest('/person', baseOptions);

        Expect(getResponse.body).toEqual([
            {
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver',
                        dateOfBirth: null,
                        height: null,
                        weight: null,
                        employed: null,
                        gender: null
                    },
                    id: this.location,
                    type: 'person'
                }
            } as IJsonApi
        ]);
    }
}
