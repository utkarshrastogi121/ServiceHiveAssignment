import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.routes";
import swapRoutes from "./routes/swap.routes";
import { apiRateLimiter } from "./middlewares/rateLimiter.middleware";
import errorHandler from "./middlewares/error.middleware";

const app = express();

app.use(
  cors({
    origin: "https://service-hive-assignment-opal.vercel.app/",
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json());
app.use(apiRateLimiter);
app.use(morgan("dev"));

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/swaps", swapRoutes);

app.get("/", (req, res) => res.json({ ok: true, service: "SlotSwapper API" }));

app.use(errorHandler);

export default app;
