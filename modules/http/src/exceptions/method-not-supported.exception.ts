import { Maybe } from '@cleavera/utils';

export class MethodNotSupportedException extends Error {
    constructor(method: Maybe<string> = null) {
        super(`Unknown request method: "${method ?? ''}"`);
    }
}
