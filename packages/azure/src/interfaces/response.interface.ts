interface IBaseResponse {
    headers: {
        [headerKey: string]: unknown;
    };
    status: number;
}

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

export type IResponse = IJSONResponse | IRawResponse;
