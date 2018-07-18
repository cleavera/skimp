import { Uri } from '@skimp/http';
import { $isNull, Maybe } from '@skimp/shared';

import { InvalidLocationException } from '../exceptions/invalid-location.exception';

export class ResourceLocation {
    public readonly resourceName: string;
    public readonly resourceId: Maybe<string>;

    constructor(resourceName: string, resourceId: Maybe<string> = null) {
        this.resourceName = resourceName;
        this.resourceId = resourceId;
    }

    public toString(): string {
        if ($isNull(this.resourceId)) {
            return `/${this.resourceName}`;
        }

        return `/${this.resourceName}/${this.resourceId}`;
    }

    public toUrl(): Uri {
        return new Uri(this.toString());
    }

    public isResource(): boolean {
        return !$isNull(this.resourceName) && $isNull(this.resourceId);
    }

    public isEntity(): boolean {
        return !$isNull(this.resourceName) && !$isNull(this.resourceId);
    }

    public static fromUrl(url: Uri): ResourceLocation {
        if (url.parts.length === 0 || url.parts.length > 2) {
            throw new InvalidLocationException(url);
        }

        return new ResourceLocation(url.parts[0], url.parts[1]);
    }
}
