export interface Result<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: string;
        details?: any;
    };
}

export class ResultFactory {
    static success<T>(data: T): Result<T> {
        return {
            success: true,
            data
        };
    }

    static failure<T>(message: string, code: string, details?: any): Result<T> {
        return {
            success: false,
            error: { message, code, details }
        };
    }
}