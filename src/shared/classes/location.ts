import { Uri } from '../../http';

import { InvalidLocationException } from '../exceptions/invalid-location.exception';
import { Maybe } from '../interfaces/maybe.interface';

export class Location {
    public readonly resourceName: string;
    public readonly resourceId: Maybe<string>;

    constructor(resourceName: string, resourceId: Maybe<string> = null) {
        this.resourceName = resourceName;
        this.resourceId = resourceId;
    }

    public toString(): string {
        if (!this.resourceId) {
            return `/${this.resourceName}`;
        }

        return `/${this.resourceName}/${this.resourceId}`;
    }

    public toUrl(): Uri {
        return new Uri(this.toString());
    }

    public isResource(): boolean {
        return !!this.resourceName && !this.resourceId;
    }

    public isEntity(): boolean {
        return !!this.resourceName && !!this.resourceId;
    }

    public static fromUrl(url: Uri): Location {
        if (url.parts.length === 0 || url.parts.length > 2) {
            throw new InvalidLocationException(url);
        }

        return new Location(url.parts[0], url.parts[1]);
    }
}
