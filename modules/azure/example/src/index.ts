import { AzureFunction, Context, HttpRequest as AzureHttpRequest } from '@azure/functions';
import { Maybe } from '@cleavera/utils';
import { ContextLogger, RequestFactory, Response } from '@skimp/azure';
import { API_REGISTER, DB_REGISTER, ResourceLocation } from '@skimp/core';
import { ILogger, LOGGER } from '@skimp/debug';
import { FileSystem } from '@skimp/file-system';
import { HttpRouter } from '@skimp/http';
import { Api, Docs } from '@skimp/json-api';

import './schemas';

const httpTrigger: AzureFunction = async(context: Context, req: AzureHttpRequest): Promise<void> => {
    const logger: ILogger = new ContextLogger(context);
    LOGGER.setLogger(logger);

    const fileSystem: FileSystem = FileSystem.create('./data');

    DB_REGISTER.configure(await fileSystem.createDb());
    API_REGISTER.configure(new Api(), '*/*');
    API_REGISTER.configure(new Api(), 'application/json');
    API_REGISTER.configure(new Docs(), 'documentation/json');

    const router: HttpRouter = new HttpRouter('1.0', null, true);
    let location: Maybe<ResourceLocation>;

    if (req.params.resource) {
        location = new ResourceLocation(req.params.resource, req.params.id);
    } else {
        location = null;
    }

    await router.route(await RequestFactory.FromRequest(location, req), Response.FromContext(context));
};

export default httpTrigger;
