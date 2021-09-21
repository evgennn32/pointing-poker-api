import { User } from "../models/User";
import { InitialCards } from "../models/InitialCards";
import { createId } from "../shared/helpers";
import DBController from "./DBController";
import { Issue } from "../models/Issue";
import GameSettings from "../models/GameSettings";
import { Card } from "../models/Card";
import Round from "../models/Round";
import UserVoteResult from "../models/UserVoteResult";

const GameController =  {
  createGame: (user: User) => {
    user.id = createId();
    const gameId = createId();
    const newGame = {
      roomName: `Spring ${Object.getOwnPropertyNames(global.DB.games).length + 1}`,
      roomID: gameId,
      scramMuster: user,
      gameSettings: {
        scrumMasterAsPlayer: true,
        changingCardInRoundEnd: false,
        isTimerNeeded: false,
        scoreType: 'Story Point',
        scoreTypeShort: 'SP',
        roundTime: 120,
        timeOut: true,
        gameInProgress: false,
      },
      gameResults: [],
      users: [user],
      issues: [],
      cards: InitialCards.map( card => ({...card, id: createId()})),
      rounds: [],
    };

    DBController.addGame(newGame);

    return newGame;
  },
  deleteGame: (roomId: string) => {
    DBController.deleteGame(roomId);
  },
  startGame: (roomId: string) => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete user"};
    }
    if(!GameController.gameHasIssues(roomId)) {
      return {error: "There are no issues to vote in the current game"};
    }
    try {
      DBController.startGame(roomId);
    } catch (e) {
      return {error: e.message};
    }
    try {
      return {gameSettings: DBController.getGameSettings(roomId)};
    } catch (e) {
      return {error: e.message};
    }
  },
  endGame: (roomId: string) => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't end game"};
    }
    return {gameResults: DBController.getGameResults(roomId)};
  },
  gameHasIssues: (roomId: string) => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete user"};
    }
   return DBController.getIssues(roomId).length;
  },
  updateGameSettings: (settings: GameSettings, roomId): {error?: string; settings?: GameSettings} => {
    if (!settings) {
      return {error: "Settings are required"};
    }
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't update settings"};
    }
    return DBController.updateGameSettings(settings, roomId);
  },
  addUser: (newUser: User, roomId): { user?: User, error?: string } => {
    if (!newUser.firstName) {
      return {error: "Username and room are required"};
    }
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    newUser.id = createId();

    return DBController.addUser(newUser, roomId);
  },
  deleteUser: (userId: string, roomId: string): { users?: User[], error?: string } => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!userId) {
      return {error: "userId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete user"};
    }

    return {users: DBController.deleteUser(userId, roomId)};

  },
  addIssue: (issue: Issue, roomId): { issue?: Issue, error?: string } => {
    if (!issue.issueName) {
      return {error: "issue name is required"};
    }
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    issue.id = createId();

    return DBController.addIssue(issue, roomId);
  },
  updateIssue: (issue: Issue, roomId): { issues?: Issue[], error?: string } => {
    if (!issue.issueName) {
      return {error: "issue name is required"};
    }
    if (!issue.id) {
      return {error: "issue id is required"};
    }
    if (!roomId) {
      return {error: "RoomId is required"};
    }

    return DBController.updateIssue(issue, roomId);
  },

  deleteIssue:(issueId: string, roomId: string): { issues?: Issue[], error?: string } => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!issueId) {
      return {error: "IssueId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete issue"};
    }
    const issues = DBController.deleteIssue(issueId, roomId);

    return { issues };
  },
  addCard: (card: Card, roomId): { card?: Card, error?: string } => {
    if (!card.value) {
      return {error: "card value is required"};
    }
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    card.id = createId();

    return DBController.addCard(card, roomId);
  },
  updateCard: (card: Card, roomId): { cards?: Card[], error?: string } => {
    if (!card.value) {
      return {error: "card value is required"};
    }
    if (!card.id) {
      return {error: "card id is required"};
    }
    if (!roomId) {
      return {error: "RoomId is required"};
    }

    return DBController.updateCard(card, roomId);
  },
  deleteCard:(cardId: string, roomId: string): { cards?: Card[], error?: string } => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!cardId) {
      return {error: "CardId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't delete card"};
    }
    const cards = DBController.deleteCard(cardId, roomId);

    return { cards };
  },
  createInitialVoteResults: (roomId: string): UserVoteResult[] => {
    const users = DBController.getUsers(roomId);
    return users.map(user => ({...user, score: null}));
  },
  createRoundInitialData: (issueId: string, roomId: string): Round => {
    return {
      roundId: createId(),
      issueId,
      roundInProgress: false,
      usersVoteResults: GameController.createInitialVoteResults(roomId),
      statistics: null,
    }
  },
  roundCreate: (issueId: string, roomId: string): { round?: Round, error?: string } => {
    if (!roomId) {
      return {error: "RoomId is required"};
    }
    if (!issueId) {
      return {error: "issueId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't create round"};
    }
    const roundInitialData = GameController.createRoundInitialData(issueId, roomId);
    return DBController.roundCreate( roomId, roundInitialData);
  },
  roundStart: (roundId: string, roomId: string): { round?: Round, error?: string } => {
    if (!roomId) {
      return {error: "roomId is required"};
    }
    if (!roundId) {
      return {error: "roundId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't start round"};
    }
    if(!DBController.roundExists(roundId, roomId)) {
      return {error: "No round with such id"};
    }
    const round = DBController.roundStart(roundId, roomId);

    return { round };
  },
  roundStop: (roundId: string, roomId: string): { round?: Round, error?: string } => {
    if (!roomId) {
      return {error: "roomId is required"};
    }
    if (!roundId) {
      return {error: "roundId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't stop round"};
    }
    if(!DBController.roundExists(roundId, roomId)) {
      return {error: "No round with such id"};
    }
    const round = DBController.roundStop(roundId, roomId);

    // TODO create round statistics

    return { round };
  },
  roundRestart: (roundId: string, roomId: string): { round?: Round, error?: string } => {
    if (!roomId) {
      return {error: "roomId is required"};
    }
    if (!roundId) {
      return {error: "roundId is required"};
    }
    if (!DBController.gameIsset(roomId)) {
      return {error: "This game no longer exists, can't restart round"};
    }
    const roundToReset = DBController.getRound(roundId, roomId);
    const round = GameController.createRoundInitialData(roundToReset.issueId, roundId);
    round.roundId = roundToReset.roundId;
    round.roundInProgress = true;

    return { round };
  },
  updateRound: (round: Round, roomId): { rounds?: Round[], error?: string } => {
    if (!round.roundId) {
      return {error: "Round id is required"};
    }
    if (!round.issueId) {
      return {error: "Issue id is required"};
    }
    return DBController.roundUpdate(round, roomId);
  },

}

export default GameController;
