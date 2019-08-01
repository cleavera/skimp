import { $isNull, Maybe } from '@cleavera/utils';

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

    public isResource(): boolean {
        return !$isNull(this.resourceName) && $isNull(this.resourceId);
    }

    public isEntity(): boolean {
        return !$isNull(this.resourceName) && !$isNull(this.resourceId);
    }

    public static FromString(str: string): ResourceLocation {
        const parts: Array<string> = str.split('/');

        if (parts.length === 0 || parts.length > 2) {
            throw new InvalidLocationException(str);
        }

        return new ResourceLocation(parts[0], parts[1]);
    }
}
