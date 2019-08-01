import { Maybe } from '@cleavera/utils';
import { $isNull } from '@cleavera/utils/dist';
import { ResourceLocation } from '@skimp/core';

export class LocationFactory {
    public static FromUrl(url: string): Maybe<ResourceLocation> {
        const parts: Array<string> = url.substring(1).split('/');

        const resourceName: Maybe<string> = parts[0] || null;
        const resourceId: Maybe<string> = parts[1] || null;

        if ($isNull(resourceName)) {
            return null;
        }

        return new ResourceLocation(resourceName, resourceId);
    }
}
