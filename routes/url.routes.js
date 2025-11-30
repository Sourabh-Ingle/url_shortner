import express from "express";
import { shortenRequestBodySchema } from "../validations/request.validation.js";
import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { nanoid } from "nanoid";
import { envalidAuthenticationMiddleware } from "../middlewares/auth.middleware.js";
import { createURL } from "../services/url.service.js";


const router = express.Router();


router.post('/shorten', envalidAuthenticationMiddleware, async(req, res)=> {
    const userID = req.user?.id;    

    const validationResult = await shortenRequestBodySchema.safeParseAsync(req.body);
    
    if (validationResult.error) {
        return res.status(400).json({ error: validationResult.error.format() });
    }

    const { url, code } = validationResult.data;
    
    const shortCode = code ?? nanoid(6);

    const [result] = await createURL(url, shortCode, userID);

    return res.status(201).json({ id: result.id, targetURL: result.targetURL, shortCode: result.shortCode })
})


export default router;