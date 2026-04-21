import Joi from "joi"

export const RegisterValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required()
})

export const LoginValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

export const RefreshTokenValidator = Joi.object({
    token: Joi.string().required()
})
