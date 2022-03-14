export default class Success {

    statusCode: number;
    message: string;
    data: any;
    success: boolean;

    constructor(data: any, message?: string) {
        this.statusCode = 200;
        this.message = message;
        this.data = data;
        this.success = true;
    }
}