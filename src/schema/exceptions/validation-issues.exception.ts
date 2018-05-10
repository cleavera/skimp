import { ValidationException } from './validation.exception';

export class ValidationIssuesException extends Array<ValidationException> {}
