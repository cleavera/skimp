export interface ILink {
    href: string;
    type?: string;
    meta?: {
        methods?: {
            GET: boolean;
            POST: boolean;
            PUT: boolean;
            DELETE: boolean;
        }
    };
}
