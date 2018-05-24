export interface IValidation {
    (model: any): Promise<void>;
}
