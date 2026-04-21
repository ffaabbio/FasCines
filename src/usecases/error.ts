export class NotFoundError extends Error {
    constructor(public message: string) {
        super(message)
    }
}

export class ResourceConflictError extends Error {
    constructor(public message: string) {
        super(message)
    }
}

export class InvalidCredentialsError extends Error {
    constructor(public message: string) {
        super(message)
    }
}

export class ForbiddenError extends Error {
    constructor(public message: string) {
        super(message)
    }
}

export class ValidationError extends Error {
    constructor(public message: string) {
        super(message)
    }
}
