import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { eq } from 'drizzle-orm';


export async function createNewShortCodeURL(url, shortCode, userID) {

    const result = await db.insert(urlsTable).values({
        shortCode,
        targetURL: url,
        userId: userID,
    }).returning({ id: urlsTable.id, targetURL: urlsTable.targetURL, shortCode: urlsTable.shortCode });

    return result;
} 

export async function getTargetURLByShortCode(code) {
    const [result] = await db.select().from(urlsTable).where(eq(urlsTable.shortCode, code))
    
    return result;
}

export async function getURLById(urlId) {
    const [result] = await db.select({
        id: urlsTable.id
    })
        .from(urlsTable)
        .where(eq(urlsTable.id, urlId));
    
    return result;
}

export async function getAllURLsByUserId(userID) {
    const allUrls = await db.select().from(urlsTable).where(eq(urlsTable.userId, userID));
    return allUrls;
    
}

export async function updateTargetURLById(id,targetURL,shortCode) {
    await db.update(urlsTable)
        .set({
            targetURL,
            shortCode
        }).where(eq(urlsTable.id, id)).returning({id:urlsTable.id})
    
    return;
}