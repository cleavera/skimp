import { AzureFunction, Context, HttpRequest as AzureHttpRequest } from '@azure/functions';
import { RequestFactory, Response } from '@skimp/azure';
import { ResourceLocation } from '@skimp/core';
import { HttpRouter } from '@skimp/http';
import { init } from '../init';

import '../schemas';

const httpTrigger: AzureFunction = async(context: Context, req: AzureHttpRequest): Promise<void> => {
    const router: HttpRouter = await init(context);
    const location: ResourceLocation = new ResourceLocation(req.params.resource);

    await router.route(await RequestFactory.FromRequest(location, req), Response.FromContext(context));
};

export default httpTrigger;
