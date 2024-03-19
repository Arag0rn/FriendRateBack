import Joi from "joi";


export const contactAddSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.base': `"name" should be a type of 'text'`,
        'string.empty': `"name" cannot be an empty field`,
        'any.required': `"name" is a required field`
      }),
    email: Joi.string().required().messages({
        'string.base': `"email" should be a type of 'text'`,
        'string.empty': `"email" cannot be an empty field`,
        'any.required': `"email" is a required field`
      }),
    phone: Joi.string().required().messages({
        'string.base': `"phone" should be a type of 'text'`,
        'string.empty': `"phone" cannot be an empty field`,
        'any.required': `"phone" is a required field`
      }),
      avatar: Joi.string().optional(),
})

export const contactUpdateSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    favorite: Joi.boolean()
})

export const ContactFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
})
