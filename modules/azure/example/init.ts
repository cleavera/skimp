import { Context } from '@azure/functions';
import { ContextLogger } from '@skimp/azure';
import { API_REGISTER, DB_REGISTER } from '@skimp/core';
import { ILogger, LOGGER } from '@skimp/debug';
import { FileSystem } from '@skimp/file-system';
import { HttpRouter } from '@skimp/http';
import { Api, Docs } from '@skimp/json-api';

export async function init(context: Context): Promise<HttpRouter> {
    const logger: ILogger = new ContextLogger(context);
    LOGGER.setLogger(logger);

    const fileSystem: FileSystem = FileSystem.create('./data');

    DB_REGISTER.configure(await fileSystem.createDb());
    API_REGISTER.configure(new Api(), '*/*');
    API_REGISTER.configure(new Api(), 'application/json');
    API_REGISTER.configure(new Docs(), 'documentation/json');

    return new HttpRouter('1.0', null, true);
}
