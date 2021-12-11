export interface IResponse {
    statusCode: number;
    location: string;

    setAllow(post: boolean, put: boolean, remove: boolean): void;

    commit(): void;

    write(text: string, contentType?: string): void;

    noContent(): void;

    error(error: Error): void;
}
