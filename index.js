import "dotenv/config";
import express from "express";
import userRouter from "./routes/user.routes.js";
import { authenticationMiddleware } from "./middlewares/auth.middleware.js";
import urlRouter from "./routes/url.routes.js"

const PORT = process.env.PORT ?? 8000;

const app = express(); 


app.use(express.json());
app.use(authenticationMiddleware)

app.use(urlRouter)
app.use('/user', userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`)
})