/*
*
* @param {import('express').Request} req
* @param {import('express').Response} res
* @param {import('express').NextFunction} next
*/


import { validateUserToken } from '../utils/token.js';

export function authenticationMiddleware(req,res,next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) return next();

    if (!authHeader.startsWith('Bearer')) {
        return res.status(400).json({ error: `Auhterization header must start with Bearer` })
    }

    const token = authHeader.split(" ")[1];
    const payload = validateUserToken(token);
   
    req.user = payload;
    next();
}




export function envalidAuthenticationMiddleware(req, res, next) { 
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: `You are not logged in, Please logged in first !!!` });
    }
    next();
}
