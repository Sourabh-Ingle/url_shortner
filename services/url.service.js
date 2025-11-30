import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";


export async function createURL(url, shortCode, userID) {
    const result = await db.insert(urlsTable).values({
        shortCode,
        targetURL: url,
        userId: userID,
    }).returning({ id: urlsTable.id, targetURL: urlsTable.targetURL, shortCode: urlsTable.shortCode });

    return result;
} 