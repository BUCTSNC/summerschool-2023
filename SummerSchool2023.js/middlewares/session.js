import Session from "express-session";

export const session = Session({
  cookie: {
    maxAge: 5 * 60 * 60 * 1000,
    secure: process.env["NODE_ENV"] === "production",
  },
  resave: false,
  saveUninitialized: false,
  secret: 'qujn32*(&">JFD',
});

export const requireLogin = (req, res, next) => {
  if (req.session.username === undefined) {
    res.status(403).send("Must login before using this API");
  } else {
    next();
  }
};
