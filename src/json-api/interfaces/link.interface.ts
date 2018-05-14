export interface ILink {
    href: string;
    type?: string;
    methods?: {
        GET: boolean;
        POST: boolean;
        PUT: boolean;
        DELETE: boolean;
    };
}
