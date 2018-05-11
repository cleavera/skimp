import {
    AsyncSetupFixture,
    AsyncTeardown,
    AsyncTeardownFixture,
    AsyncTest,
    Expect, TestCase,
    TestFixture
} from 'alsatian';
import { Response } from 'request';
import { RequestPromiseOptions } from 'request-promise-native';
import * as request from 'request-promise-native';
import { init, Server } from '../src';
import { LOGGER, LogLevel } from '../src/debug';
import { Entity } from '../src/file-system';
import { IJsonApi } from '../src/json-api/interfaces/json-api.interface';
import { ValidationExceptionCode } from '../src/router';
import * as DATA_PATH from './data/path';
import { PersonSchema } from './schemas/person';

@TestFixture('Post')
export class PostSpec {
    public location: string;
    private _server: Server;

    @AsyncSetupFixture
    public async setup(): Promise<void> {
        this._server = await init(1338, DATA_PATH, [PersonSchema]);
        LOGGER.setLogLevel(LogLevel.ERROR);
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
                        fullName: 'Anthony Cleaver',
                        dateOfBirth: '1990-05-04',
                        height: 180,
                        weight: 78
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
                    weight: 78
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
                    weight: 78
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
                    weight: 78
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

    @AsyncTest('When sending an invalid string value')
    public async invalidString(): Promise<void> {
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
                        fullName: 3
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

    @AsyncTest('When sending an invalid number value')
    public async invalidNumber(): Promise<void> {
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
                        height: '123'
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

    @AsyncTest('When sending an invalid integer value')
    public async invalidInteger(): Promise<void> {
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
                        weight: 12.5
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
                    weight: 78
                },
                id: this.location,
                type: 'person'
            }
        } as IJsonApi]);
    }
}
