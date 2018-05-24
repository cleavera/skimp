export class DbNotConfiguredException extends Error {
    constructor() {
        super('No db has been configured');
    }
}
