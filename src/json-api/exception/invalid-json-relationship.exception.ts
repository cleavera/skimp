export class InvalidJSONRelationship extends Error {
    constructor(json: any) {
        super(`The relationship could not be deserialised: ${JSON.stringify(json)}`);
    }
}
