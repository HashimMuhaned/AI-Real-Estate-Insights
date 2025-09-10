// require("dotenv").config();

import express from "express";

import cors from "cors";
// const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
import routes from "./routes/routes.js";

const app = express();
const allowedOrigins = ["http://localhost:3000"];

const PORT = 8080;

app.use(
  cors({
    origin: (origin: any, callback: any) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.options("*", cors());

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.sendStatus(204); // Respond successfully
  } else {
    next();
  }
});

// middle ware
// app.use(cookieParser());
// app.use(bodyParser.json({ limit: "10mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api", routes);

// debuggin purposes
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.listen(PORT);

module.exports = app;
