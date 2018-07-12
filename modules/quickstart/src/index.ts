import { API_REGISTER, DB_REGISTER } from '../../core/src/index';
import { ConsoleLogger, ILogger, LOGGER } from '../../debug/src/index';
import { FILE_SYSTEM } from '../../file-system/src/index';
import { Api, Docs } from '../../json-api/src/index';
import { Db } from '../../json-file/src/index';
import { IAuthenticator, Router } from '../../router/src/index';
import { ISchema } from '../../schema/src/index';
import { Server } from '../../server/src/index';
import { Maybe } from '../../shared/src';

export async function init(port: number, dataPath: string, _schemas: Array<ISchema>, cors: boolean | string | Array<string> = false, version: string = 'UNVERSIONED', authenticator: Maybe<IAuthenticator> = null, loggerClass: ILogger = new ConsoleLogger()): Promise<Server> {
    LOGGER.setLogger(loggerClass);
    await FILE_SYSTEM.configure(dataPath);
    DB_REGISTER.configure(new Db());
    API_REGISTER.configure(new Api(), 'application/json');
    API_REGISTER.configure(new Docs(), 'documentation/json');
    const server: Server = new Server(port, new Router(version, cors, authenticator));

    LOGGER.debug(`Server started on port ${server.port}`);
    LOGGER.debug(`Loading data from  ${FILE_SYSTEM.path}`);

    return server;
}
