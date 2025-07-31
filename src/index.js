const express = require('express');
const app = express();
const contestRouthe = require("./controllers/contestAuth")
require('dotenv').config();
const main = require("./config/db");
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const cors = require('cors');
const aiRouter = require('./routes/aiChatting');
const paymentRouter  = require('./controllers/payment');
const videoRouter = require('./routes/videoCreator');
const contestSubmitRouter = require('./routes/contestSubmit');
app.use(cors({
    origin: 'https://frontend-2nie.vercel.app',
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission",submitRouter);
app.use("/ai",aiRouter)
app.use("/contest",contestRouthe);
app.use("/api",paymentRouter);
app.use("/video",videoRouter)
app.use("/contest",contestSubmitRouter);



const IntializeConnection = async () => {
    try {
        await Promise.all([
            main(), 
            redisClient.connect()
        ]);
        console.log("DB connected");

        app.listen(3000, () => {
            console.log("Server is listening at port number 3000 ");
        });

    } catch (err) {
        console.log("Error: " + err);
    }
};

IntializeConnection();
