import { isEmpty, isUndefined } from '@cleavera/utils';
import { ResourceLocation } from '@skimp/core';

export class LocationFactory {
    public static FromUrl(url: string): ResourceLocation | null {
        const [resourceName, resourceId]: Array<string> = url.substring(1).split('/'); // eslint-disable-line array-element-newline

        if (isUndefined(resourceName) || isEmpty(resourceName)) {
            return null;
        }

        return new ResourceLocation(resourceName, (resourceId as string | undefined) ?? null);
    }
}
