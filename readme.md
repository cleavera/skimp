# Skimp

Skimp is a domain modelling framework. It can be used for defining and storing a domain. It works by creating a class and then decorating it with meta data to describe the model.

## Quick start

The easiest way to get set up is to install the quickstart module and the required dependencies. Then define your schemas and pass it to the init function. Quickstart will store the data as JSON files. The quickstart module accepts two media types on requests: 'application/json' and 'documentation/json'. 'application/json' outputs hypermedia compliant JSON api, 'documentation/json' outputs json swagger.

### Example

A full working example can be found in the example module, the test module also contains integration tests which describe all the behaviour currently available.

```typescript
import { init } from '@skimp/quickstart';
import { Field, Schema } from '@skimp/schema';
import { Boolean, Date, Integer, Number, Options, Required, String } from '@skimp/validation';
import { GENDER_OPTIONS } from '../constants/gender-options.constant';

import { resolve } from 'path';

@Schema('person')
class PersonSchema {
    @Required
    @String
    @Field('fullName')
    public name: string;

    @Date
    @Field()
    public dateOfBirth: Date;

    @Number
    @Field()
    public height: number;

    @Integer
    @Field()
    public weight: number;

    @Boolean
    @Field()
    public employed: boolean;

    @String
    @Options(GENDER_OPTIONS)
    @Field()
    public gender: string;
}

const portNumber: number = 1337;
const dataBasePath: string = resolve('../data');

await init(portNumber, dataBasePath, [PersonSchema]);
```

Making a request to `http://localhost:1337/person` with an accept header of `documentation/json` returns the following:

```json
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "required": [
        "data"
    ],
    "properties": {
        "data": {
            "type": "object",
            "required": [
                "type",
                "id",
                "attributes"
            ],
            "properties": {
                "type": {
                    "type": "string",
                    "const": "person"
                },
                "id": {
                    "type": "string"
                },
                "attributes": {
                    "type": "object",
                    "required": [
                        "fullName"
                    ],
                    "properties": {
                        "fullName": {
                            "type": "string"
                        },
                        "dateOfBirth": {
                            "type": [
                                "string",
                                "null"
                            ]
                        },
                        "height": {
                            "type": [
                                "number",
                                "null"
                            ]
                        },
                        "weight": {
                            "type": [
                                "number",
                                "null"
                            ]
                        },
                        "employed": {
                            "type": [
                                "boolean",
                                "null"
                            ]
                        },
                        "gender": {
                            "type": [
                                "string",
                                "null"
                            ],
                            "enum": [
                                "Gender.FEMALE",
                                "Gender.MALE"
                            ]
                        }
                    }
                }
            }
        }
    }
}
```

Using this we can construct our model to send to the API. So we can post the following with an accept header of `application/json`:

```json
{
  "data": {
    "attributes": {
      "fullName": "Anthony Cleaver",
      "dateOfBirth": "1990-05-03",
      "height": 180,
      "weight": 78,
      "employed": true,
      "gender": "Gender.MALE"
    },
    "type": "person"
  }
}
```

Doing a get on `/person` with an accept header of `application/json` now returns the following:

```json
[
   {
      "data":{
         "type":"person",
         "id":"/person/23826d5d-0cb5-4db8-9fc0-f5ff944e941f",
         "attributes":{
            "fullName":"Anthony Cleaver",
            "dateOfBirth":"1990-05-03",
            "height":180,
            "weight":78,
            "employed":true,
            "gender":"Gender.MALE"
         }
      }
   }
]
```

### Parameters

The init function takes the following parameters

```typescript
init(
    port: number,
    dataPath: string,
    _schemas: Array<ISchema>,
    cors: boolean | string | Array<string> = false,
    version: string = 'UNVERSIONED',
    authenticator: Maybe<IAuthenticator> = null,
    loggerClass: ILogger = new ConsoleLogger()
): Promise<Server>
```

<dl>
<dt>port</dt>
<dd>The port number for the server to listen for requests on.</dd>
<dt>dataPath</dt>
<dd>The base path for the database to initialise to.</dd>
<dt>_schemas</dt>
<dd>An array of the schemas</dd>
<dt>cors</dt>
<dd>If false is passed cors will be disabled, true will enable cors for all domains, a string or an array of strings to enable cors for</dd>
<dt>version</dt>
<dd>The version number to report at the root entity</dd>
<dt>authenticator</dt>
<dd>An optional authenticator class to be called for all requests, it gets passed the request object and if it throws errors the router will return a 401</dd>
<dt>loggerClass</dt>
<dd>A logger class to use, by default will log to the console.</dd>
</dl>

## Advanced usage

If not using the quickstart as a minimum you will need to include the schemas you wish to use (the schema decorator handles registering them with the app so they merely need to be loaded), register a data storage mechanism, register an api serialiser with a media type, and create a router and pipe a server's requests to it.

```javascript
import { API_REGISTER, DB_REGISTER } from '@skimp/core';
import { ConsoleLogger, LOGGER } from '@skimp/debug';
import { Api } from '@skimp/json-api';
import { Db } from '@skimp/json-file';
import { IAuthenticator, Router } from '@skimp/router';
import { Server } from '@skimp/server';

import * as SCHEMAS from './schemas';

LOGGER.setLogger(new ConsoleLogger());
DB_REGISTER.configure(new Db());
API_REGISTER.configure(new Api(), 'application/json');
const server = new Server(port, new Router(version, cors));
```

## Todo

- Move filesystem configuration into DB
- Azure function app as server alternative
- Azure blob storage support
- ETag
- File upload
- Events
- Include relationships
