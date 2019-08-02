export interface IValidation {
    (model: object): Promise<void>;
}
