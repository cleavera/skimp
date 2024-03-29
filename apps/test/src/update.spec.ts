import { LOGGER, LogLevel } from '@skimp/debug';
import { IJsonApi } from '@skimp/json-api';
import { Expect, Setup, SetupFixture, Teardown, TeardownFixture, Test, TestFixture } from 'alsatian';
import { Response } from 'request';
import { RequestPromiseOptions } from 'request-promise-native';
import * as uuid from 'uuid';

import { TestServer } from './classes/test-server';
import * as DATA_PATH from './data/path';
import { makeRequest } from './helpers/request.helper';
import { SCHEMAS } from './schemas';

@TestFixture('Update')
export class UpdateSpec {
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

    @Test('When putting an existing resource')
    public async existingResource(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        await makeRequest(this.location, baseOptions);

        const putOptions: RequestPromiseOptions = {
            ...baseOptions,
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
        };

        const putResponse: Response = await makeRequest(this.location, putOptions);

        Expect(putResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2',
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

        Expect(putResponse.statusCode).toBe(200);

        const getSingleResponse: Response = await makeRequest(this.location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2',
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
                        fullName: 'Anthony Cleaver2',
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

    @Test('When putting a new resource')
    public async happyPath(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        let success: boolean = false;
        const location: string = `/person/${uuid.v4()}`;

        try {
            await makeRequest(location, baseOptions);

            success = true;
        } catch (e) {
            Expect((e as Response).statusCode).toEqual(404);
        }

        Expect(success).toBe(false);

        const putOptions: RequestPromiseOptions = {
            ...baseOptions,
            method: 'PUT',
            body: {
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver2'
                    },
                    type: 'person'
                }
            } as IJsonApi
        };

        const putResponse: Response = await makeRequest(location, putOptions);

        Expect(putResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2',
                    dateOfBirth: null,
                    height: null,
                    weight: null,
                    employed: null,
                    gender: null
                },
                id: location,
                type: 'person'
            }
        } as IJsonApi);

        Expect(putResponse.statusCode).toBe(201);

        const getSingleResponse: Response = await makeRequest(location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2',
                    dateOfBirth: null,
                    height: null,
                    weight: null,
                    employed: null,
                    gender: null
                },
                id: location,
                type: 'person'
            }
        } as IJsonApi);

        const getResponse: Response = await makeRequest('/person', baseOptions);

        Expect(getResponse.body).toEqual([
            {
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver2',
                        dateOfBirth: null,
                        height: null,
                        weight: null,
                        employed: null,
                        gender: null
                    },
                    id: location,
                    type: 'person'
                }
            } as IJsonApi,
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

    @Test('When putting a resource with unknown fields')
    public async unknownFields(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const location: string = `/person/${uuid.v4()}`;

        const putOptions: RequestPromiseOptions = {
            ...baseOptions,
            method: 'PUT',
            body: {
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver2',
                        unknownField: 123
                    },
                    type: 'person'
                }
            } as IJsonApi
        };

        const putResponse: Response = await makeRequest(location, putOptions);

        Expect(putResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2',
                    dateOfBirth: null,
                    height: null,
                    weight: null,
                    employed: null,
                    gender: null
                },
                id: location,
                type: 'person'
            }
        } as IJsonApi);

        Expect(putResponse.statusCode).toBe(201);

        const getSingleResponse: Response = await makeRequest(location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2',
                    dateOfBirth: null,
                    height: null,
                    weight: null,
                    employed: null,
                    gender: null
                },
                id: location,
                type: 'person'
            }
        } as IJsonApi);

        const getResponse: Response = await makeRequest('/person', baseOptions);

        Expect(getResponse.body).toEqual([
            {
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver2',
                        dateOfBirth: null,
                        height: null,
                        weight: null,
                        employed: null,
                        gender: null
                    },
                    id: location,
                    type: 'person'
                }
            } as IJsonApi,
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

    @Test('When putting a model missing required fields')
    public async modelMissingRequiredFields(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const postOptions: RequestPromiseOptions = {
            ...baseOptions,
            method: 'PUT',
            body: {
                data: {
                    attributes: {
                        dateOfBirth: '1990-05-04'
                    },
                    type: 'person'
                }
            } as IJsonApi
        };

        const location: string = `/person/${uuid.v4()}`;
        let success: boolean = false;

        try {
            await makeRequest(location, postOptions);

            success = true;
        } catch (e) {
            Expect((e as Response).statusCode).toEqual(400);
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

    @Test('When putting to a schema that does not exist')
    public async schemaDoesNotExist(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        const postOptions: RequestPromiseOptions = {
            ...baseOptions,
            method: 'PUT',
            body: {
                data: {
                    attributes: {
                        name: 'Anthony Cleaver'
                    },
                    type: 'person'
                }
            } as IJsonApi
        };

        const location: string = `/invalid/${uuid.v4()}`;
        let success: boolean = false;

        try {
            await makeRequest(location, postOptions);

            success = true;
        } catch (e) {
            Expect((e as Response).statusCode).toEqual(404);
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

    @Test('When removing the relationship between two resources')
    public async removeRelationship(): Promise<void> {
        const jobLocation: string = await this.createJob();
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        await makeRequest(this.location, baseOptions);

        const putOptions: RequestPromiseOptions = {
            ...baseOptions,
            method: 'PUT',
            body: {
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver'
                    },
                    id: this.location,
                    type: 'person'
                }
            } as IJsonApi
        };

        const putResponse: Response = await makeRequest(this.location, putOptions);

        Expect(putResponse.body).toEqual({
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

        Expect(putResponse.statusCode).toBe(200);

        const getSingleResponse: Response = await makeRequest(this.location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
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

        const getJobResponse: Response = await makeRequest('/job', baseOptions);

        Expect(getJobResponse.body).toEqual([
            {
                data: {
                    attributes: {
                        name: 'Web developer'
                    },
                    id: jobLocation,
                    type: 'job'
                }
            }
        ]);

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
}
