import session from "express-session";
const sess = session({
    cookie: {
        maxAge: 5 * 60 * 60 * 1000,
        secure: false
    },
    secret: "afsecawedsfv",
    resave: false,
    saveUninitialized: false,
});
export default sess;
