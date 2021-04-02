const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const request = require("request");

const passport = require("passport");

require("dotenv").config({ path: "./config/.env" });

//Server setup
const webSocketServer = require("websocket").server;
const http = require("http");
const PORT = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);

require("./config/passport")(passport);

//MongoDB
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

const session = require("express-session");

const MongoStore = require("connect-mongo")(session);

app.use(express.static("../roulette/build"));

app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/bet", require("./routes/bet"));

const { client } = require("websocket");

app.get("/", (req, res) => {
  res.render("index.html");
});

server.listen(PORT || 5000, () => {
  console.log("Server running..!");
});

const Game = require("./models/user.model.js");

const wsServer = new webSocketServer({
  httpServer: server,
});

const clients = [];

setInterval(() => {
  const random_number = Math.floor(Math.random() * 15);
  console.log(random_number);
  let options = {
    uri: "http://localhost:5000/bet/open/false",
    body: JSON.stringify({
      game: "roulette",
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
  request(options, (err, res) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(res);
  });
  if (clients.length !== 0) {
    clients.forEach((connection) => {
      connection.sendUTF(
        JSON.stringify({
          betsOpen: true,
          spinWheel: true,
          value: random_number,
        })
      );
    });
  }
  setTimeout(() => {
    let options = {
      uri: "http://localhost:5000/bet/open/true",
      body: JSON.stringify({
        game: "roulette",
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
    request(options, (err, res) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(res);
    });

    let result_options = {
      uri: `http://localhost:5000/bet/result`,
      body: JSON.stringify({
        game: "roulette",
        result: random_number,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
    request(result_options, (err, res) => {
      if (err) {
        console.log(err);
        return;
      }
    });
  }, 5000);
}, 20000);

wsServer.on("request", (req) => {
  //console.log("New client joined!");

  const conn = req.accept(null, req.origin);

  // clients.forEach((client) => {
  //   console.log("sent");
  //   client.sendUTF(
  //     JSON.stringify({ type: "onlineUsers", online: clients.length })
  //   );
  // });

  conn.on("message", (msg) => {
    if (msg.type === "utf8") {
      clients.forEach((client) => {
        client.sendUTF(msg.utf8Data);
      });
    }
  });

  // conn.on("close", (connection) => {
  //   clients.forEach((client) => {
  //     console.log(client.closeReasonCode);
  //     console.log(`${client.closeReasonCode} : ${connection}`);
  //     if (client.closeReasonCode === connection) {
  //       console.log(`Index: ${clients.indexOf(client)}`);
  //       delete clients[clients.indexOf(client)];
  //     }
  //   });
  //   console.log(clients.length);
  // });

  if (!clients.includes(conn)) {
    clients.push(conn);
  }
});
