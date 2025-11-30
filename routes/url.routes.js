import express from "express";
import { shortenRequestBodySchema, idRequestBodySchema } from "../validations/request.validation.js";
import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { nanoid } from "nanoid";
import { envalidAuthenticationMiddleware } from "../middlewares/auth.middleware.js";
import { createNewShortCodeURL, updateTargetURLById, getTargetURLByShortCode, getAllURLsByUserId, getURLById } from "../services/url.service.js";
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


// edit twrget URL
router.patch('/shorten/:id', envalidAuthenticationMiddleware, async (req, res) => {
    // const userID = req.user?.id;
    const paramsID = req.params?.id;

    const validBodyResult = await shortenRequestBodySchema.safeParseAsync(req.body);
    const validParamIdResult = await idRequestBodySchema.safeParseAsync({ id: paramsID });
    
    if (validParamIdResult.error) {
        return res.status(400).json({ error: validParamIdResult.error.format() });
    }

    if (validBodyResult.error) {
        return res.status(400).json({ error: validBodyResult.error.format() });
    }

    const { url, code } = validBodyResult.data;
    const { id } = validParamIdResult.data;
  
    await updateTargetURLById(id, url, code);

    return res.status(201).json({message:'update successfully!!!'})

})

router.delete('/:id', envalidAuthenticationMiddleware, async(req, res)=> {
    const paramsID = req.params?.id;

    const validationResult = await idRequestBodySchema.safeParseAsync({id:paramsID});

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