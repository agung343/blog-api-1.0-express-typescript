export class CustomError extends Error {
    message: string;
    statusCode?: number;
    data?: any[]

    constructor(message: string, statusCode: number, data?: any[]) {
        super(message)
        this.message = message
        this.statusCode = statusCode
        this.data = data
    }
}