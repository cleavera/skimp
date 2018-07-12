export class RelationshipPointer {
    public readonly relationship: number;

    constructor(relationship: number) {
        this.relationship = relationship;
    }

    public toString(): string {
        return this.relationship.toString(10);
    }
}
