import session from "express-session";

const sess = session({
    cookie: {
        maxAge: 5 * 60 * 60 * 1000,
        secure: false
    },
    //secret: "fjqoi3/4nj;w89234u",
    secret: "123456",
    resave: false,
    saveUninitialized: false
});

export default sess

declare module "express-session" {
    export interface SessionData {
        userId?: number
    }
}