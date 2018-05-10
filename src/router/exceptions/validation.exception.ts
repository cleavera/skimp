export class ValidationException extends Error {
    public code: string;

    constructor(message: string) {
        super(message);
    }
}
