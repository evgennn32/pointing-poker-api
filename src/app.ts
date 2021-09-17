import { User } from "./models/User";
import GameController from "./controllers/GameController";
import DBController from "./controllers/DBController";
import GameSettings from "./models/GameSettings";
import { Issue } from "./models/Issue";

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

  socket.on('game:update-settings', (gameSettings: GameSettings, roomId: string, cb: ({}) => void) => {
    const {settings, error} = GameController.updateGameSettings(gameSettings, roomId);
    if (error) {
      return typeof cb === "function" ? cb(error) : null;
    }
    typeof cb === "function" ? cb(settings) : '';
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
    const userName = `${user.firstName}${user.lastName ? ' ': ''}${user.lastName}`;
    socket.in(roomId).emit(
      'notification',
      {message: `${userName} just joined the game`}
    )
  });

  socket.on('user:delete', (userId: string, roomId: string, cb: ({}) => void) => {
    const {users, error} = GameController.deleteUser(userId, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    typeof cb === "function" ? cb(users) : '';
    // TODO send all users to all room clients
  });

  socket.on('game:issue-add', (newIssue: Issue, roomId: string, cb: ({}) => void) => {
    const {issue, error} = GameController.addIssue(newIssue, roomId)
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    typeof cb === "function" ? cb({issue}) : '';
    // TODO send all issues to all room clients
  });

  socket.on('game:issue-delete', (issueId: string, roomId: string, cb: ({}) => void) => {
    const {issues, error} = GameController.deleteIssue(issueId, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    typeof cb === "function" ? cb(issues) : '';
    // TODO send all users to all room clients
  });

  socket.on('game:delete', (roomId: string, cb: ({}) => void) => {
    try {
      GameController.deleteGame(roomId);
    } catch (error) {
     return typeof cb === "function" ? cb({error: error.message}) : '';
    } 
      io.emit({message: `Game with '${global.DB.games[roomId]}' id has been deleted`});
  });

  socket.on('DB:getAllData', ( cb: ({}) => void) => {
    typeof cb === "function" ? cb(global.DB) : null;
  });

  console.log(socket.id)
});

http.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
