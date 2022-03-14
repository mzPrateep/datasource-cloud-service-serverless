export default class Error {

    statusCode: number;
    message: string;
    errorType: string;
    success: boolean;

    constructor(code: number, message: string, errorType?: string) {
        this.statusCode = code;
        this.message = message;
        this.errorType = errorType || '';
        this.success = false;
    }
}