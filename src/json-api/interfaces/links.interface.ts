import { ILink } from './link.interface';

export interface ILinks {
    self: ILink;
    [key: string]: ILink;
}
