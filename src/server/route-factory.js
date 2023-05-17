const DEFAULT_HEADERS = {
    "Content-Type": "application/json"
};

export function generateRoute(handler) {
    return async (event, context) => {
        try {
            const result = await handler(event, context);
            return {
                statusCode: 200,
                headers: DEFAULT_HEADERS,
                body: JSON.stringify({
                    data: result,
                    success: true
                }),
            };
        } catch (error) {
            if (error instanceof PublicError) {
                return {
                    statusCode: error.statusCode,
                    headers: DEFAULT_HEADERS,
                    body: JSON.stringify({
                        message: error.message,
                        success: false
                    }),
                }
            }
            throw error;
        }
    }
}

export class PublicError {
    constructor(statusCode, message) {
        this.statusCode = statusCode;
        this.message = message;
    }
}

export class ValidationError extends PublicError {
    constructor(message) {
        super(400, message);
    }
}
