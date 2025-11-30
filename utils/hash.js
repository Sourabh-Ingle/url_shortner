import { createHmac, randomBytes } from 'node:crypto';


export const hashPasswordWithSalt = (password, userSalt=undefined)=>{
    
    const salt = userSalt ?? randomBytes(256).toString('hex');
    const hashPassword = createHmac('sha256', salt).update(password).digest('hex');

    return { salt, hashPassword };
}