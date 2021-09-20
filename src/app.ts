import { User } from "./models/User";
import GameController from "./controllers/GameController";
import DBController from "./controllers/DBController";
import GameSettings from "./models/GameSettings";
import { Issue } from "./models/Issue";
import { Card } from "./models/Card";

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
    if(typeof cb === "function") {
      cb(settings);
    }
  });

  socket.on('game:join', (roomId: string, cb: ({}) => void) => {
    if (!DBController.gameIsset(roomId)) {
      if(typeof cb === "function") {
        cb({error: 'No such game or id is incorrect'});
      }
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
    if(typeof cb === "function") {
      cb(user);
    }
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
    if(typeof cb === "function") {
      cb(users);
    }
    // TODO send all users to all room clients
  });

  socket.on('game:issue-add', (newIssue: Issue, roomId: string, cb: ({}) => void) => {
    const {issue, error} = GameController.addIssue(newIssue, roomId)
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if(typeof cb === "function") {
      cb({issue});
    }
    // TODO send all issues to all room clients
  });

  socket.on('game:issue-update', (issueToUpdate: Issue, roomId: string, cb: ({}) => void) => {
    const {issues, error} = GameController.updateIssue(issueToUpdate, roomId)
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if(typeof cb === "function") {
      cb({issues});
    }
  });

  socket.on('game:issue-delete', (issueId: string, roomId: string, cb: ({}) => void) => {
    const {issues, error} = GameController.deleteIssue(issueId, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if(typeof cb === "function") {
      cb({issues});
    }
    // TODO send all users to all room clients
  });

  socket.on('game:card-add', (newCard: Card, roomId: string, cb: ({}) => void) => {
    const {card, error} = GameController.addCard(newCard, roomId)
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if(typeof cb === "function") {
      cb({card});
    }
  });

  socket.on('game:card-update', (cardToUpdate: Card, roomId: string, cb: ({}) => void) => {
    const {cards, error} = GameController.updateCard(cardToUpdate, roomId)
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if(typeof cb === "function") {
      cb({cards});
    }
  });

  socket.on('game:card-delete', (cardId: string, roomId: string, cb: ({}) => void) => {
    const {cards, error} = GameController.deleteCard(cardId, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if(typeof cb === "function") {
      cb({cards});
    }
  });

  socket.on('game:delete', (roomId: string, cb: ({}) => void) => {
    try {
      GameController.deleteGame(roomId);
    } catch (error) {
     return typeof cb === "function" ? cb({error: error.message}) : '';
    }
      io.emit({message: `Game with '${global.DB.games[roomId]}' id has been deleted`});
  });

  socket.on('game:start', (roomId: string, cb: ({}) => void) => {
    const {gameSettings, error} = GameController.startGame(roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    // TODO create round and send to all room clients
    if(typeof cb === "function") {
      cb({success: true});
    }

    socket.in(roomId).emit(
      'game:start',
      {gameSettings}
    );

  });

  socket.on('game:end', (roomId: string, cb: ({}) => void) => {
    const {gameResults, error} = GameController.endGame(roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if(typeof cb === "function") {
      cb({gameResults});
    }
    socket.in(roomId).emit(
      'game:end',
      {gameResults}
    );
    setTimeout(() => {
      GameController.deleteGame(roomId);
    },5000);
  });

  socket.on('round:create', (issueId: string, roomId: string, cb: ({}) => void) => {
    const {round, error} = GameController.roundCreate(issueId,roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if(typeof cb === "function") {
      cb({round});
    }
    socket.in(roomId).emit(
      'round:new',
      {round}
    );
  });

  socket.on('round:start', (roundId: string, roomId: string, cb: ({}) => void) => {
    const {round, error} = GameController.roundStart(roundId,roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if(typeof cb === "function") {
      cb({round});
    }
    socket.in(roomId).emit(
      'round:start',
      {round}
    );
  });

  socket.on('round:stop', (roundId: string, roomId: string, cb: ({}) => void) => {
    const {round, error} = GameController.roundStop(roundId,roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if(typeof cb === "function") {
      cb({round});
    }
    socket.in(roomId).emit(
      'round:stop',
      {round}
    );
  });

  socket.on('round:restart', (roundId: string, roomId: string, cb: ({}) => void) => {
    const {round, error} = GameController.roundRestart(roundId,roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if(typeof cb === "function") {
      cb({round});
    }
    socket.in(roomId).emit(
      'round:restart',
      {round}
    );
  });

  socket.on('DB:getAllData', ( cb: ({}) => void) => {
    if(typeof cb === "function") {
      cb(global.DB);
    }
  });
  console.log(socket.id)
});

http.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
