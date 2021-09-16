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

  socket.on('game:join', (roomId: string, cb: ({}) => void) => {
    if (!DBController.gameIsset(roomId)) {

      typeof cb === "function" ? cb({error: 'No such game or id is incorrect'}) : null;
    }
    socket.join(roomId);
  });

  socket.on('user:create', (newUser: User, roomId: string, cb: ({}) => void) => {
    if (!DBController.gameIsset(roomId)) {
      return cb({error: 'This game no longer exists'});
    }
    const {user, error} = GameController.addUser(newUser, roomId)
    if (error) {
      return typeof cb === "function" ? cb(error) : null;
    }
    typeof cb === "function" ? cb(user) : '';
    socket.in(roomId).emit(
      'notification',
      {message: `${user.firstName} ${user.lastName} just joined the game`}
    )
  });
  socket.on('game:delete', (roomId: string, cb: ({}) => void) => {
    try {
      GameController.deleteGame(roomId);
    } catch (error) {
      if(typeof cb === 'function'){
        cb({error: error.message})
      }
    } 
    socket.in(roomId).emit(
      'notification',
      {message: `Game with '${global.DB.games[roomId]}' id has been deleted`}
    )
  });
  console.log(socket.id)
});

http.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
