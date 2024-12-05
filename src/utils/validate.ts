import { ObjectSchema } from 'joi';

export const validate = (
  data: any,
  schema: ObjectSchema,
): { error?: string; value?: any } => {
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    return { error: error.details.map((detail) => detail.message).join(', ') };
  }

  return { value };
};
