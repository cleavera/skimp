# Skimp

Skimp is a domain modelling framework. It can be used for defining and storing a domain. It works by creating a class and then decorating it with meta data to describe the model.

## Quick start

The easiest way to get set up is to install the quickstart module and the required dependencies. Then define your schemas and pass it to the init function. Quickstart will store the data as JSON files. The quickstart module accepts two media types on requests: 'application/json' and 'documentation/json'. 'application/json' outputs JSON api, 'documentation/json' outputs json swagger.

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

### Parameters

The init function takes the following parameters

```
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

```
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
const server: Server = new Server(port, new Router(version, cors));
```

## Todo

- Move filesystem configuration into DB
- Azure function app as server alternative
- Azure blob storage support
- ETag
- File upload
- Events
- Include relationships
