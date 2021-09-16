import { User } from "./models/User";
import GameController from "./controllers/GameController";
import DBController from "./controllers/DBController";

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
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
  socket.on("create:game", (user: User) => {
    const newGame = GameController.createGame(user);
    socket.join(newGame.roomID);
    socket.emit("game:created", newGame);
    console.log(socket.rooms);
  });
  socket.on('game:join', (user: User, roomId: string, cb: ({}) => void) => {
    console.log('try to join');
    console.log('game isset', DBController.gameIsset(roomId))
    console.log(global.DB.games)
    if (DBController.gameIsset(roomId)) {
      socket.join(roomId);
      // TODO create User
      const newUser = {test: "test"}
      socket.emit("game:join", newUser);
    } else {
      cb({error:'No such game or id is incorrect'});
    }
  });
  console.log(socket.id)
});

http.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
