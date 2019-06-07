export interface IEntity {
    exists(): boolean;
    readContent(): Promise<string>;
    createdDate(): Date;
    listChildren(): Promise<Array<string>>;
    delete(): Promise<void>;
    write(content: string): Promise<void>;
}
