import { User } from "./models/User";
import { createGame } from "./controllers/GameController";
import DBController from "./controllers/DBController";
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http,{
  cors: {
    origin: '*',
  }
});
const port = process.env.PORT || 4000;
DBController.initDB();

app.get('/', (req, res) => {
  res.send('Welcome to pointing poker API');
});

io.on("connection", socket => {
  socket.on("create:game", ( user: User ) => {
    const newGame  = createGame(user);
    socket.emit("game:created", newGame);
  });
  console.log(socket.id)
});

http.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
