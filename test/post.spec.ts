import { AsyncSetupFixture, AsyncTeardown, AsyncTeardownFixture, AsyncTest, Expect, TestCase, TestFixture } from 'alsatian';
import { Response } from 'request';
import * as request from 'request-promise-native';
import { RequestPromiseOptions } from 'request-promise-native';

import { LOGGER, LogLevel } from '../modules/debug';
import { FILE_SYSTEM } from '../modules/file-system';
import { IJsonApi } from '../modules/json-api/interfaces/json-api.interface';
import { init } from '../modules/quickstart';
import { ValidationExceptionCode } from '../modules/schema';
import { Server } from '../modules/server';
import { Gender } from './constants/genders.constant';
import * as DATA_PATH from './data/path';
import { $clearDB } from './helpers/clear-db.helper';
import { SCHEMAS } from './schemas';

@TestFixture('Post')
export class PostSpec {
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
        FILE_SYSTEM.reset();
    }

    @AsyncTeardown
    public async clear(): Promise<void> {
        await $clearDB();
    }

    public async createSecondPerson(): Promise<string> {
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
                        fullName: 'Anthony Cleaver2',
                        dateOfBirth: '1990-05-03',
                        height: 180,
                        weight: 78,
                        employed: true,
                        gender: Gender.FEMALE
                    },
                    type: 'person'
                }
            } as IJsonApi
        });

        const postResponse: Response = await request('/person', postOptions);
        const location: string = postResponse.headers.location || '';

        Expect(postResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2',
                    dateOfBirth: '1990-05-03',
                    height: 180,
                    weight: 78,
                    employed: true,
                    gender: Gender.FEMALE
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
                        fullName: 'Anthony Cleaver2',
                        dateOfBirth: '1990-05-03',
                        height: 180,
                        weight: 78,
                        employed: true,
                        gender: Gender.FEMALE
                    },
                    id: location,
                    type: 'person'
                }
            } as IJsonApi,
            {
                data: {
                    attributes: {
                        fullName: 'Anthony Cleaver',
                        dateOfBirth: '1990-05-04',
                        height: 180,
                        weight: 78,
                        employed: true,
                        gender: Gender.MALE
                    },
                    id: this.location,
                    type: 'person'
                }
            } as IJsonApi
        ]);

        const getSingleResponse: Response = await request(location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver2',
                    dateOfBirth: '1990-05-03',
                    height: 180,
                    weight: 78,
                    employed: true,
                    gender: Gender.FEMALE
                },
                id: location,
                type: 'person'
            }
        } as IJsonApi);

        return location;
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
                    type: 'job'
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
                type: 'job'
            }
        } as IJsonApi);

        const getResponse: Response = await request('/job', baseOptions);

        Expect(getResponse.body).toEqual([{
            data: {
                attributes: {
                    name: 'Web developer'
                },
                id: location,
                type: 'job'
            }
        } as IJsonApi]);

        const getSingleResponse: Response = await request(location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    name: 'Web developer'
                },
                id: location,
                type: 'job'
            }
        } as IJsonApi);

        return location;
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
                        fullName: 'Anthony Cleaver',
                        dateOfBirth: '1990-05-04',
                        height: 180,
                        weight: 78,
                        employed: true,
                        gender: Gender.MALE
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
                    fullName: 'Anthony Cleaver',
                    dateOfBirth: '1990-05-04',
                    height: 180,
                    weight: 78,
                    employed: true,
                    gender: Gender.MALE
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([{
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver',
                    dateOfBirth: '1990-05-04',
                    height: 180,
                    weight: 78,
                    employed: true,
                    gender: Gender.MALE
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi]);

        const getSingleResponse: Response = await request(this.location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver',
                    dateOfBirth: '1990-05-04',
                    height: 180,
                    weight: 78,
                    employed: true,
                    gender: Gender.MALE
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
                        code: ValidationExceptionCode.INVALID_JSON_DATA,
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
                        code: ValidationExceptionCode.REQUIRED,
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

    @TestCase(3)
    @TestCase(true)
    @AsyncTest('When sending an invalid string value')
    public async invalidString(value: any): Promise<void> {
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
                        fullName: value
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
                        code: ValidationExceptionCode.INVALID_STRING,
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

    @TestCase('abc')
    @TestCase(true)
    @AsyncTest('When sending an invalid number value')
    public async invalidNumber(value: any): Promise<void> {
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
                        fullName: 'Anthony Cleaver',
                        height: value
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
                        code: ValidationExceptionCode.INVALID_NUMBER,
                        source: {
                            pointer: '/data/attributes/height'
                        }
                    }
                ]
            });
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([]);
    }

    @TestCase('abc')
    @TestCase(true)
    @TestCase(12.5)
    @AsyncTest('When sending an invalid integer value')
    public async invalidInteger(value: any): Promise<void> {
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
                        fullName: 'Anthony Cleaver',
                        weight: value
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
                        code: ValidationExceptionCode.INVALID_INTEGER,
                        source: {
                            pointer: '/data/attributes/weight'
                        }
                    }
                ]
            });
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([]);
    }

    @TestCase('abc')
    @TestCase(12)
    @AsyncTest('When sending an invalid boolean value')
    public async invalidBoolean(value: any): Promise<void> {
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
                        fullName: 'Anthony Cleaver',
                        employed: value
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
                        code: ValidationExceptionCode.INVALID_BOOLEAN,
                        source: {
                            pointer: '/data/attributes/employed'
                        }
                    }
                ]
            });
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([]);
    }

    @TestCase('Gender.MALES')
    @TestCase('MALE')
    @AsyncTest('When sending an invalid option value')
    public async invalidOption(value: any): Promise<void> {
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
                        fullName: 'Anthony Cleaver',
                        gender: value
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
                        code: ValidationExceptionCode.INVALID_OPTION,
                        source: {
                            pointer: '/data/attributes/gender'
                        }
                    }
                ]
            });
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([]);
    }

    @TestCase(123)
    @TestCase('abc')
    @TestCase('1990-1-2')
    @TestCase('1990-01-2')
    @TestCase('1990-1-02')
    @TestCase('1990-00-02')
    @TestCase('1990-01-00')
    @TestCase('1990-13-12')
    @TestCase('1990-01-32')
    @TestCase('2001-02-29')
    @TestCase('2004-02-30')
    @TestCase('1990-03-32')
    @TestCase('1990-04-31')
    @TestCase('1990-05-32')
    @TestCase('1990-06-31')
    @TestCase('1990-07-32')
    @TestCase('1990-08-32')
    @TestCase('1990-09-31')
    @TestCase('1990-10-32')
    @TestCase('1990-11-31')
    @TestCase('1990-12-32')
    @AsyncTest('When sending an invalid date')
    public async invalidDate(date: any): Promise<void> {
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
                        fullName: 'Anthony Cleaver',
                        dateOfBirth: date
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
                        code: ValidationExceptionCode.INVALID_DATE,
                        source: {
                            pointer: '/data/attributes/dateOfBirth'
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
                    fullName: 'Anthony Cleaver',
                    dateOfBirth: '1990-05-04',
                    height: 180,
                    weight: 78,
                    employed: true,
                    gender: Gender.MALE
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi]);
    }

    @AsyncTest('When adding a relationship')
    public async addRelationship(): Promise<void> {
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
                        name: 'Web developer'
                    },
                    relationships: [
                        {
                            href: this.location
                        }
                    ],
                    type: 'job'
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
                ],
                type: 'job'
            }
        } as IJsonApi);

        const getResponse: Response = await request('/job', baseOptions);

        Expect(getResponse.body).toEqual([{
            data: {
                attributes: {
                    name: 'Web developer'
                },
                id: location,
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
                ],
                type: 'job'
            }
        } as IJsonApi]);

        const getSingleResponse: Response = await request(location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    name: 'Web developer'
                },
                id: location,
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
                ],
                type: 'job'
            }
        } as IJsonApi);

        const getSinglePersonResponse: Response = await request(this.location, baseOptions);

        Expect(getSinglePersonResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver',
                    dateOfBirth: '1990-05-04',
                    height: 180,
                    weight: 78,
                    employed: true,
                    gender: Gender.MALE
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
    }

    @AsyncTest('When adding an implicit relationship')
    public async addImplicitRelationship(): Promise<void> {
        const jobLocation: string = await this.createJob();

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
                        fullName: 'Anthony Cleaver',
                        dateOfBirth: '1990-05-04',
                        height: 180,
                        weight: 78,
                        employed: true,
                        gender: Gender.FEMALE
                    },
                    type: 'person',
                    relationships: [
                        {
                            href: jobLocation
                        }
                    ]
                }
            } as IJsonApi
        });

        const postResponse: Response = await request('/person', postOptions);
        this.location = postResponse.headers.location || '';

        Expect(postResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver',
                    dateOfBirth: '1990-05-04',
                    height: 180,
                    weight: 78,
                    employed: true,
                    gender: Gender.FEMALE
                },
                relationships: [
                    {
                        href: jobLocation,
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
                ],
                id: this.location,
                type: 'person'
            }
        } as IJsonApi);

        const getResponse: Response = await request('/person', baseOptions);

        Expect(getResponse.body).toEqual([{
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver',
                    dateOfBirth: '1990-05-04',
                    height: 180,
                    weight: 78,
                    employed: true,
                    gender: Gender.FEMALE
                },
                relationships: [
                    {
                        href: jobLocation,
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
                ],
                id: this.location,
                type: 'person'
            }
        } as IJsonApi]);

        const getSingleResponse: Response = await request(this.location, baseOptions);

        Expect(getSingleResponse.body).toEqual({
            data: {
                attributes: {
                    fullName: 'Anthony Cleaver',
                    dateOfBirth: '1990-05-04',
                    height: 180,
                    weight: 78,
                    employed: true,
                    gender: Gender.FEMALE
                },
                relationships: [
                    {
                        href: jobLocation,
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
                ],
                id: this.location,
                type: 'person'
            }
        } as IJsonApi);
    }

    @AsyncTest('When adding a relationship with invalid structure')
    public async addInvalidStructureRelationship(): Promise<void> {
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
                    relationships: [
                        {
                            link: '/person/123'
                        } as any
                    ],
                    type: 'job'
                }
            } as IJsonApi
        });

        let success: boolean = false;

        try {
            await request('/job', postOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(400);
            Expect(e.error).toEqual({
                errors: [
                    {
                        code: ValidationExceptionCode.RELATIONSHIP_INVALID_JSON,
                        source: {
                            pointer: '/data/relationships/0'
                        }
                    }
                ]
            });
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/job', baseOptions);

        Expect(getResponse.body).toEqual([]);
    }

    @AsyncTest('When adding a relationship that does not exist')
    public async addNonExistingRelationship(): Promise<void> {
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
                    relationships: [
                        {
                            href: '/person/123'
                        }
                    ],
                    type: 'job'
                }
            } as IJsonApi
        });

        let success: boolean = false;

        try {
            await request('/job', postOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(400);
            Expect(e.error).toEqual({
                errors: [
                    {
                        code: ValidationExceptionCode.RELATIONSHIP_NOT_FOUND,
                        source: {
                            pointer: '/data/relationships/0'
                        }
                    }
                ]
            });
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/job', baseOptions);

        Expect(getResponse.body).toEqual([]);
    }

    @AsyncTest('When adding a relationship that has not been specified')
    public async addNonSpecifiedRelationship(): Promise<void> {
        const jobLocation: string = await this.createJob();

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
                        name: 'Apollo'
                    },
                    relationships: [
                        {
                            href: jobLocation
                        },
                        {
                            href: jobLocation
                        }
                    ],
                    type: 'team'
                }
            } as IJsonApi
        });

        let success: boolean = false;

        try {
            await request('/team', postOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(400);
            Expect(e.error).toEqual({
                errors: [
                    {
                        code: ValidationExceptionCode.RELATIONSHIP_TYPE_NOT_ALLOWED,
                        source: {
                            pointer: '/data/relationships/0'
                        }
                    },
                    {
                        code: ValidationExceptionCode.RELATIONSHIP_TYPE_NOT_ALLOWED,
                        source: {
                            pointer: '/data/relationships/1'
                        }
                    }
                ]
            });
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/team', baseOptions);

        Expect(getResponse.body).toEqual([]);
    }

    @AsyncTest('When adding a relationships above limit')
    public async addTooManyRelationship(): Promise<void> {
        const baseOptions: RequestPromiseOptions = {
            baseUrl: 'http://localhost:1338',
            json: true,
            resolveWithFullResponse: true
        };

        await this.create();
        const secondPersonLocation: string = await this.createSecondPerson();

        const postOptions: RequestPromiseOptions = Object.assign({}, baseOptions, {
            method: 'POST',
            body: {
                data: {
                    attributes: {
                        name: 'Web developer'
                    },
                    relationships: [
                        {
                            href: this.location
                        },
                        {
                            href: secondPersonLocation
                        }
                    ],
                    type: 'job'
                }
            } as IJsonApi
        });

        let success: boolean = false;

        try {
            await request('/job', postOptions);

            success = true;
        } catch (e) {
            Expect(e.statusCode).toEqual(400);
            Expect(e.error).toEqual({
                errors: [
                    {
                        code: ValidationExceptionCode.RELATIONSHIP_LIMIT_REACHED,
                        source: {
                            pointer: '/data/relationships/1'
                        }
                    }
                ]
            });
        }

        Expect(success).toBe(false);

        const getResponse: Response = await request('/job', baseOptions);

        Expect(getResponse.body).toEqual([]);
    }
}
