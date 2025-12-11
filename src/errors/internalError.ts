// this is a custom error class for internal server errors that might contain sensitive information
export class InternalError extends Error {
    isInternalError: boolean
    constructor(message: string) {
        super(message)
        this.isInternalError = true
    }
}

export const isInternalError = (error: Error): error is InternalError => {
    return error instanceof InternalError
}