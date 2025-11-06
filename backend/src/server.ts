import http from "http";
import mongoose from "mongoose";
import app from "./app";
import dotenv from "dotenv";
import logger from "./utils/logger";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const PORT = Number(process.env.PORT || 4000);
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/slotswapper";

const server = http.createServer(app);

export const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  logger.info("Socket connected: " + socket.id);

  socket.on("auth:join", (payload: { userId: string }) => {
    if (payload?.userId) {
      socket.join(String(payload.userId));
      logger.info(`Socket ${socket.id} joined room ${payload.userId}`);
    }
  });

  socket.on("disconnect", () => {
    logger.info("Socket disconnected: " + socket.id);
  });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("Connected to MongoDB");

    server.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error(err, "Failed to start");
    process.exit(1);
  }
}

start();
