import jwt from 'jsonwebtoken';
import { userTokenSchema } from '../validations/token.validation.js'

const JWT_SECRET = process.env.JWT_SECRET;

export async function createUserToken (payload) {
    const payloadValidationResult = await userTokenSchema.safeParseAsync(payload);
    if (payloadValidationResult.error) {
       throw new Error(payloadValidationResult.error.message)
    }
    const validatePayload = payloadValidationResult.data;
    const token = jwt.sign(validatePayload, JWT_SECRET);
    return token;
} 