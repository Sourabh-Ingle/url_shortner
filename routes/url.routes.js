import express from "express";
import { shortenRequestBodySchema } from "../validations/request.validation.js";
import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { nanoid } from "nanoid";
import { usersTable } from "../models/user.model.js";


const router = express.Router();


router.post('/shorten', async(req, res)=> {
    const userID = req.user.id;
    if (!userID) {
        return res.status(401).json({ error: `You are not logged in, Please logged in first !!!` });
    }

    const validationResult = await shortenRequestBodySchema.parseAsync(req.body);

    if (!validationResult.error) {
        return res.status(400).json({ error: validationResult.error.message });
    }

    const { url,code } = validationResult.data;
    const shortCode = code ?? nanoid(6)
    const [result] = await db.insert(urlsTable).values({
        shortCode,
        targetURL: url,
        userId: userID,
    }).returning({ id: urlsTable.id, targetURL: urlsTable.url, shortCode:urlsTable.shortCode})

    return res.status(201).json({ id: result.id, targetURL: result.targetURL, shortCode: result.shortCode })
})




export default router;