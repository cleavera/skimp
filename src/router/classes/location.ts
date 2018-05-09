import { Url } from '../../server';
import { Nullable } from '../../shared';
import { InvalidLocationException } from '../exceptions/invalid-location.exception';

export class Location {
    public readonly resourceName: string;
    public readonly resourceId: Nullable<string>;

    constructor(resourceName: string, resourceId?: string) {
        this.resourceName = resourceName;
        this.resourceId = resourceId;
    }

    public toString(): string {
        if (!this.resourceId) {
            return `/${this.resourceName}`;
        }

        return `/${this.resourceName}/${this.resourceId}`;
    }

    public toUrl(): Url {
        return new Url(this.toString());
    }

    public static fromUrl(url: Url): Location {
        if (url.parts.length === 0 || url.parts.length > 2) {
            throw new InvalidLocationException(url);
        }

        return new Location(url.parts[0], url.parts[1]);
    }
}
