import session from "express-session";

const sess=session({
    cookie:{
        maxAge:5*60*60*1000,//5h
        secure:false
    },
    secret:"afsecawedsfv",
    resave:false,
    saveUninitialized:false,
});

export default sess;

declare module "express-session"{
    export interface SessionData{
        userId?: number
    }
}