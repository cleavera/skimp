export class Uuid extends String {
    public v4(): Uuid {
        const cryptoObj: Crypto = crypto || (window as any).msCrypto as Crypto, //tslint:disable-line no-any
            uuidFormat: string = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
            nums: Uint8Array = cryptoObj.getRandomValues(new Uint8Array(uuidFormat.split(/[xy]/).length - 1)) as Uint8Array;

        let pointer: number = 0;

        return new Uuid(uuidFormat.replace(/[xy]/g, (char: string) => {
            let num: number = nums[pointer++] % 16;

            if (char === 'y') {
                num %= 4;
                num += 8;
            }

            return num.toString(16);
        }));
    }
}
