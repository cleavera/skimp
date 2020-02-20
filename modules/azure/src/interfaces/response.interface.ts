interface IJSONResponse extends IBaseResponse {
    body: {
        [prop: string]: unknown;
    };
    isRaw: false;
}

interface IRawResponse extends IBaseResponse {
    body: string;
    isRaw: true;
}

interface IBaseResponse {
    headers: {
        [headerKey: string]: unknown;
    };
    status: number;
}

export type IResponse = IJSONResponse | IRawResponse;
