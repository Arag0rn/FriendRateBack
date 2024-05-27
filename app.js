import express from "express";
import logger from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/api/auth-router.js";
import swaggerRouter from "./swager/swager.js";
import userRouter from "./routes/api/user-ureg-router.js"; 

dotenv.config();

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(cors());

app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3002'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(logger(formatsLogger));

app.use(express.json());

app.use("/api/user", authRouter);
app.use("/api/unreg", userRouter)
app.use("/swager", swaggerRouter);

app.get("/", (req, res) => {
  res.send("Server active!");
});

app.get("/link", (req, res) => {
  // підключення лінка - видалити
  res.sendFile("link.html", { root: "./public" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

export default app;
