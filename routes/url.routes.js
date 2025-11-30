import express from "express";
import { shortenRequestBodySchema,deleteIdRequestBodySchema } from "../validations/request.validation.js";
import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { nanoid } from "nanoid";
import { envalidAuthenticationMiddleware } from "../middlewares/auth.middleware.js";
import { createNewShortCodeURL, getTargetURLByShortCode, getAllURLsByUserId, getURLById } from "../services/url.service.js";
import { eq,and } from 'drizzle-orm';

const router = express.Router();


router.post('/shorten', envalidAuthenticationMiddleware, async (req, res) => {
    const userID = req.user?.id;

    const validationResult = await shortenRequestBodySchema.safeParseAsync(req.body);
    
    if (validationResult.error) {
        return res.status(400).json({ error: validationResult.error.format() });
    }

    const { url, code } = validationResult.data;
    
    const shortCode = code ?? nanoid(6);

    const [result] = await createNewShortCodeURL(url, shortCode, userID);

    return res.status(201).json({ id: result.id, targetURL: result.targetURL, shortCode: result.shortCode })
});

router.get('/codes', envalidAuthenticationMiddleware, async (req, res) => {
    const codes = await getAllURLsByUserId(req.user.id);

    return res.status(200).json({ codes })
});

router.delete('/:id', envalidAuthenticationMiddleware, async(req, res)=> {
    const paramsID = req.params?.id;

    const validationResult = await deleteIdRequestBodySchema.safeParseAsync({id:paramsID});

    if (validationResult.error) {
        return res.status(404).json({error:validationResult.error.format()})
    }

    const {id} = validationResult.data;
    
    const urlID = await getURLById(id);
    
    if (!urlID) {
        return res.status(404).json({ error:`Invalid Url ID !!!`})
    };

    // DELETE RECORD QUERY
    await db.delete(urlsTable)
        .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)))
        

    return res.status(200).json({deleted:true})
})


router.get('/:shortCode', async (req, res) => {
    const code = req.params.shortCode;
   
    const result = await getTargetURLByShortCode(code);
  
    if (!result) {
        return res.status(404).json({ error: `Invalid URL !!!` })
    }

    return res.redirect(result.targetURL);
})


export default router;