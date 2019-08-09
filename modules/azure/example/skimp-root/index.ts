import { AzureFunction, Context, HttpRequest as AzureHttpRequest } from '@azure/functions';
import { RequestFactory, Response } from '@skimp/azure';
import { HttpRouter } from '@skimp/http';
import { init } from '../init';

import '../schemas';

const httpTrigger: AzureFunction = async(context: Context, req: AzureHttpRequest): Promise<void> => {
    const router: HttpRouter = await init(context);

    await router.route(await RequestFactory.FromRequest(null, req), Response.FromContext(context));
};

export default httpTrigger;
