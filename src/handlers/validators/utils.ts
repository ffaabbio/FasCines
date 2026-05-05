import Joi from "joi"

export const generateValidationErrorMessage = (errorDetails: Joi.ValidationErrorItem[]): Record<string, string> => {
    const errors: Record<string, string> = {}
    errorDetails.forEach((detail) => {
        const key = detail.path.join(".")
        errors[key] = detail.message
    })
    return errors
}
