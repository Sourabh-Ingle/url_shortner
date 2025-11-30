import express from 'express';
import { usersTable } from '../models/user.model.js';
import { eq } from 'drizzle-orm';
import db  from '../db/index.js';
import { signupPostRequestBodySchema, loginPostRequestBodySchema } from '../validations/request.validation.js'
import { hashPasswordWithSalt } from '../utils/hash.js';
import { getUserByEmail, createNewUser } from '../services/user.service.js';
import jwt from "jsonwebtoken";
import { createUserToken } from '../utils/token.js'

const router = express.Router();

router.post('/signup', async(req, res) => {
    const validationResult = await signupPostRequestBodySchema.safeParseAsync(req.body)
    
    if (validationResult.error) {
        return res.status(400).json({ error:validationResult.error.format() })
    } 

    const {firstname,lastname,email,password} = validationResult.data
        
        
    // const [existingUser] = await db.select({
    //     id: usersTable.id,
    //     email: usersTable.email
    // })
    //     .from(usersTable)
    //     .where(eq(usersTable.email, email));
    
    const existingUser = await getUserByEmail(email);
    
    if (existingUser) return res.status(400).json({ error: `User with email :: ${email} already exists!!!` });

    const { salt, hashPassword } = hashPasswordWithSalt(password);
   
    // const [user] = await db.insert(usersTable).values({
    //     firstname,
    //     lastname,
    //     email,
    //     password: hashPassword,
    //     salt
    // }).returning({ id: usersTable.id });

    const user = await createNewUser(firstname, lastname, email, salt,hashPassword)

    return res.status(200).json({message:'successfully created!!',data:{id:user.id}})

});


router.post('/login', async(req, res) => {
    const validationResult = await loginPostRequestBodySchema.safeParseAsync(req.body)

    if (validationResult.error) {
        return res.status(400).json({ error: validationResult.error.format() })
    }
    const { email, password } = validationResult.data;
     
    const existingUser = await getUserByEmail(email);

    if (!existingUser) return res.status(400).json({ error: `Proper crediationals are required!!!` });
    
    const { hashPassword } = hashPasswordWithSalt(password, existingUser.salt);
    
    if (existingUser.password !== hashPassword) {
        return res.status(400).json({error:`incorrect password or email id !!!`})
    }

    const payload = {
        id: existingUser.id,
        email: existingUser.email
    }

    const token = await createUserToken(payload);
    
    return res.status(200).json({ token })
})



export default router;