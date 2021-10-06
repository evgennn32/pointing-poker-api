import { User } from "./models/User";
import GameController from "./controllers/GameController";
import DBController from "./controllers/DBController";
import GameSettings from "./models/GameSettings";
import { Issue } from "./models/Issue";
import { Card } from "./models/Card";
import Round from "./models/Round";
import { ChatMessage } from "./models/ChatMessage";
import cors from "cors";

const app = require('express')();
const http = require('http').Server(app);
http.use(cors);
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
  socket.on("create:game", (user: User, cb: ({}) => void) => {
    const newGame = GameController.createGame(user);
    socket.join(newGame.roomID);
    cb({game: newGame});
    socket.emit("game:created", newGame);
    console.log(socket.rooms);
  });
  var onevent = socket.onevent;
  socket.onevent = function (packet) {
    var args = packet.data || [];
    onevent.call (this, packet);    // original call
    packet.data = ["*"].concat(args);
    onevent.call(this, packet);      // additional call to catch-all
  };
  socket.on("*",function(event,data) {
    console.log(event);
    // console.log(data);
  });

  socket.on('chat:send-message', (newMessage: ChatMessage, roomId: string, cb: ({}) => void) => {
    const {message, error} = GameController.chatSendMessage(newMessage, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({message});
    }
    socket.in(roomId).emit(
      'chat:new-message',
      {message}
    );
  });
  socket.on('game:update-settings', (gameSettings: GameSettings, roomId: string, cb: ({}) => void) => {
    const {settings, error} = GameController.updateGameSettings(gameSettings, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({settings});
    }
  });

  socket.on('game:join', (roomId: string, cb: ({}) => void) => {
    if (!DBController.gameIsset(roomId)) {
      return cb({error: 'No such game or URL is incorrect'});
    }
    const {game, error} = GameController.getGame(roomId);
    if (error) {
      return typeof cb === "function" ? cb(error) : null;
    }
    if (typeof cb === "function") {
      cb({game});
    }
    socket.join(roomId);
  });

  socket.on('game:update-state', (roomId: string, cb: ({}) => void) => {
    if (!DBController.gameIsset(roomId)) {
      return cb({error: 'No such game or URL is incorrect'});
    }
    const {game, error} = GameController.getGame(roomId);
    if (error) {
      return typeof cb === "function" ? cb(error) : null;
    }
    if (typeof cb === "function") {
      cb({game});
    }
    socket.in(roomId).emit(
      'game:update',
      {game}
    );
  });

  socket.on('user:create', (newUser: User, roomId: string, cb: ({}) => void) => {
    if (!DBController.gameIsset(roomId)) {
      return cb({error: 'This game no longer exists'});
    }
    const {user, error} = GameController.addUser(newUser, roomId)
    if (error) {
      return typeof cb === "function" ? cb(error) : null;
    }
    if (typeof cb === "function") {
      cb({user});
    }
    const userName = `${user.firstName}${user.lastName ? ' ' : ''}${user.lastName}`;
    socket.in(roomId).emit(
      'notification',
      {message: `${userName} just joined the game`}
    );
    const usersResult = GameController.getUsers(roomId);
    if(usersResult.users) {
      socket.in(roomId).emit(
        'game:users-update',
        {users: usersResult.users}
      );
    }
  });

  socket.on('user:delete', (userId: string, roomId: string, cb: ({}) => void) => {
    const {users, error} = GameController.deleteUser(userId, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb(users);
    }
    socket.in(roomId).emit(
      'game:users-update',
      {users}
    );
  });

  socket.on('round:add-vote',
    (data: {
      roomId: string;
      roundId: string;
      userId: string;
      score: string;
    }, cb: ({}) => void) => {
    const {user, error} = GameController.getUser(data.roomId, data.userId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }

    const result = GameController.userVote(data.roomId, data.roundId, {...user, score: data.score});
    if (result.error) {
      return typeof cb === "function" ? cb({error: result.error}) : null;
    }
    if (typeof cb === "function") {
      cb(result);
    }


    socket.in(data.roomId).emit(
      'round:update',
      {round: result.round}
    );
  });

  socket.on('game:issue-add', (newIssue: Issue, roomId: string, cb: ({}) => void) => {
    const {issue, error} = GameController.addIssue(newIssue, roomId)
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({issue});
    }
    const result = GameController.getIssues(roomId);
    if (result && !result.error) {
      socket.in(roomId).emit('game:issues-update', result);
    }
  });

  socket.on('game:issue-update', (issueToUpdate: Issue, roomId: string, cb: ({}) => void) => {
    const {issues, error} = GameController.updateIssue(issueToUpdate, roomId)
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({issues});
    }
    socket.in(roomId).emit('game:issues-update', {issues});
  });

  socket.on('game:issue-delete', (issueId: string, roomId: string, cb: ({}) => void) => {
    const {issues, error} = GameController.deleteIssue(issueId, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({issues});
    }
    socket.in(roomId).emit(
      'game:issues-update',
      {issues}
    );
  });

  socket.on('game:card-add', (newCard: Card, roomId: string, cb: ({}) => void) => {
    const {card, error} = GameController.addCard(newCard, roomId)
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({card});
    }
  });

  socket.on('game:card-update', (cardToUpdate: Card, roomId: string, cb: ({}) => void) => {
    const {cards, error} = GameController.updateCard(cardToUpdate, roomId)
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({cards});
    }
  });

  socket.on('game:card-delete', (cardId: string, roomId: string, cb: ({}) => void) => {
    const {cards, error} = GameController.deleteCard(cardId, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({cards});
    }
  });

  socket.on('game:delete', (roomId: string, cb: ({}) => void) => {
    try {
      const {error, success } = GameController.deleteGame(roomId);
      if (error) {
        return typeof cb === "function" ? cb({ error }) : '';
      }
      if (typeof cb === "function") {
        cb({ success });
      }
    } catch (error) {
      return typeof cb === "function" ? cb({ error: error.message }) : '';
    }
    socket.in(roomId).emit(
      'game:delete',
      { success: true }
    );
  });

  socket.on('game:start', (roomId: string, cb: ({}) => void) => {
    const issuesResult = GameController.getIssues(roomId);
    if (issuesResult.error) {
      return typeof cb === "function" ? cb({error: issuesResult.error}) : null;
    }
    if(!issuesResult.issues.length) {
      return typeof cb === "function" ? cb({error: "There is no 'issues', create an 'issue' and try again"}) : null;
    }
    const firsIssue = issuesResult.issues[0];
    const roundResult = GameController.roundCreate(firsIssue.id, roomId);
    if (roundResult.error) {
      return typeof cb === "function" ? cb({error: roundResult.error}) : null;
    }
    const {gameSettings, error} = GameController.startGame(roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({success: true, gameSettings, round: roundResult.round});
    }

    socket.in(roomId).emit(
      'game:start',
      {gameSettings, round: roundResult.round}
    );
  });

  socket.on('game:end', (roomId: string, cb: ({}) => void) => {
    const {game, error} = GameController.endGame(roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({game});
    }
    socket.in(roomId).emit(
      'game:update',
      {game}
    );

    setTimeout(() => {
      GameController.deleteGame(roomId);
    }, 5000);
  });

  socket.on('round:create', (issueId: string, roomId: string, cb: ({}) => void) => {
    const {round, error} = GameController.roundCreate(issueId, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({round});
    }
    socket.in(roomId).emit(
      'round:update',
      {round}
    );
  });

  socket.on('round:start', (roundId: string, roomId: string, cb: ({}) => void) => {
    const {round, error} = GameController.roundStart(roundId, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({round});
    }
    socket.in(roomId).emit(
      'round:update',
      {round}
    );
  });

  socket.on('round:stop', (roundId: string, roomId: string, cb: ({}) => void) => {
    const {round, error} = GameController.roundStop(roundId, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({round});
    }
    socket.in(roomId).emit(
      'round:update',
      {round}
    );
  });

  socket.on('round:restart', (roundId: string, roomId: string, cb: ({}) => void) => {
    const {round, error} = GameController.roundRestart(roundId, roomId);
    if (error) {
      return typeof cb === "function" ? cb({error}) : null;
    }
    if (typeof cb === "function") {
      cb({round});
    }
    socket.in(roomId).emit(
      'round:update',
      {round}
    );
  });

  socket.on('round:update', (roundToUpdate: Round, roomId: string, cb: ({}) => void) => {
    const {error, round} = GameController.updateRound(roundToUpdate, roomId);
    if (error) {
      return typeof cb === "function" ? cb(error) : null;
    }
    if(typeof cb === "function") {
      cb(round);
    }
    socket.in(roomId).emit(
      'round:update',
      {round}
    );
  });

  socket.on('DB:getAllData', (roomId, cb: ({}) => void) => {
    if (typeof cb === "function") {
      const {game} = GameController.getGame(roomId);
      cb(game);
    }
  });
  console.log(socket.id)
});

http.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/`);
});
