const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { v4: uuidv4 } = require("uuid");

const webSocketServer = require("websocket").server;
const http = require("http");

require("dotenv").config();

const PORT = process.env.PORT;

const app = express();

const server = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/auth", require("./routes/auth"));

const uri = process.env.ATLAS_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const conn = mongoose.connection;

conn.once("open", () => {
  console.log("Connected to MongoDB database..");
});

server.listen(PORT || 5000, () => {
  console.log("Server running..!");
});

const wsServer = new webSocketServer({
  httpServer: server,
});

const clients = {};

setInterval(() => {
  const random_number = Math.floor(Math.random() * 15);
  for (var key in clients) {
    if (clients.hasOwnProperty(key)) {
      let connection = clients[key];
      connection.sendUTF(
        JSON.stringify({
          betsOpen: true,
          spinWheel: true,
          value: random_number,
        })
      );
      //console.log(`${key} | Connected: ${Object.keys(clients).length}`);
    }
  }
}, 5000);

wsServer.on("request", (req) => {
  console.log("Request received..!");

  const conn = req.accept(null, req.origin);

  clients[uuidv4()] = conn;
});

// app.listen(PORT || 5000, () => {
//   console.log("Server running .. !");
// });
