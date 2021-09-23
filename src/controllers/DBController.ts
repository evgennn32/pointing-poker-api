import { GameRoomEntity } from "../models/GameRoomEntity";
import { User } from "../models/User";
import GameSettings from "../models/GameSettings";
import { Issue } from "../models/Issue";
import { Card } from "../models/Card";
import GameResult from "../models/GameResult";
import UserVoteResult from "../models/UserVoteResult";
import Round from "../models/Round";

const DBConroller = {
  initDB: () => {
    const DB: { games: { [key: string]: GameRoomEntity } } = {games: {}};
    global.DB = DB;
  },
  addGame: (game: GameRoomEntity) => {
    global.DB.games[game.roomID] = game;
    return game.roomID
  },
  deleteGame: (roomId: string) => {
    if(global.DB.games[roomId] !== undefined){
      delete global.DB.games[roomId];
    }
    else {
      throw new Error(`The game doesn't exist`);
    }
  },
  startGame: (roomId: string) => {
    global.DB.games[roomId].gameSettings.gameInProgress = true;
  },
  getGameSettings: (roomId: string): GameSettings => {
   return  global.DB.games[roomId].gameSettings;
  },
  getGameResults: (roomId: string): GameResult[] => {
    return  global.DB.games[roomId].gameResults;
  },
  gameIsset: (gameId:string) => {
    return gameId in global.DB.games;
  },
  updateGameSettings: (settings: GameSettings, roomId) => {
    global.DB.games[roomId].gameSettings = settings;
    return {settings: global.DB.games[roomId].gameSettings};
  },
  addUser: (user: User, roomID): {error?: string; user?: User} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].users.push(user);
    return {user};
  },
  deleteUser: (userId: string, roomID: string):  User[] => {
    global.DB.games[roomID].users = global.DB.games[roomID].users.filter((user) => user.id !== userId);
    return global.DB.games[roomID].users;
  },
  getUsers: (roomID: string):  User[] => {
    return global.DB.games[roomID].users;
  },
  getUser: (roomID: string, userId: string):  User => {
    return global.DB.games[roomID].users.filter(
      (user) => (user.id !== userId)
    ).shift();
  },
  addIssue: (issue: Issue, roomID: string): {error?: string; issue?: Issue} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].issues.push(issue);
    return {issue};
  },
  getIssues: (roomID: string) => {
    return global.DB.games[roomID].issues
  },
  updateIssue: (updatedIssue: Issue, roomID: string): {error?: string; issues?: Issue[]} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].issues = global.DB.games[roomID].issues.map(
      (issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)
    );
    return {issues: global.DB.games[roomID].issues};
  },
  deleteIssue: (issueId: string, roomId: string): Issue[] => {
    global.DB.games[roomId].issues = global.DB.games[roomId].issues.filter((issue) => issue.id !== issueId);
    return global.DB.games[roomId].issues;
  },
  addCard: (card: Card, roomID: string): {error?: string; card?: Card} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].cards.push(card);
    return {card};
  },
  updateCard: (updatedCard: Card, roomID: string): {error?: string; cards?: Card[]} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].cards = global.DB.games[roomID].cards.map(
      (card) => (card.id === updatedCard.id ? updatedCard : card)
    );
    return {cards: global.DB.games[roomID].cards};
  },
  deleteCard: (cardId: string, roomId: string): Card[] => {
    global.DB.games[roomId].cards = global.DB.games[roomId].cards.filter((card) => card.id !== cardId);
    return global.DB.games[roomId].cards;
  },
  getCardByValue: (roomId: string, cardValue: string): Card | null => {
    const filteredCards = global.DB.games[roomId].cards.filter((card) => card.value === cardValue);
    if(filteredCards.length){
      return filteredCards[0];
    }
    return;
  },
  roundCreate: (roomId: string, roundData: Round): {round?: Round; error?: string;} => {
    try {
      global.DB.games[roomId].rounds.push(roundData);
      return {round: roundData}
    } catch (e) {
      return {error: e.message}
    }
  },
  roundUpdate: (roomId: string, updatedRound: Round) => {
    global.DB.games[roomId].rounds = global.DB.games[roomId].rounds.map(
      (round) => (round.roundId === updatedRound.roundId ? updatedRound : round)
    );
    return DBConroller.getRound(roomId, updatedRound.roundId);
  },
  roundStart: (roomId: string, roundId: string): Round => {
    global.DB.games[roomId].rounds = global.DB.games[roomId].rounds.map(
      (round) => (
        round.id === roundId ? {...round, roundInProgress: true} : round
      )
    );
    return DBConroller.getRound(roomId, roundId);
  },
  roundStop: (roomId: string, roundId: string): Round => {
    global.DB.games[roomId].rounds = global.DB.games[roomId].rounds.map(
      (round) => (
        round.id === roundId ? {...round, roundInProgress: false} : round
      )
    );
    return DBConroller.getRound(roomId, roundId);
  },
  getRound: (roomId: string, roundId: string): Round | null => {
    const round = global.DB.games[roomId].rounds.filter(round => (round.roundId === roundId));
    if(round.length){
      return round[0];
    }
    return;
  },
  roundExists: (roomId: string, roundId: string): boolean => {
    return global.DB.games[roomId].rounds.filter(round => (
      round.roundId === roundId
      )
    ).length > 0;
  },
  addUserVote:
    (
      roomId: string, roundId: string, userVoteResult: UserVoteResult
    ): {round?: Round; error?: string;} => {
    try {
      global.DB.games[roomId].rounds = global.DB.games[roomId].rounds.map(
        (round) => (round.roundId === roundId ? round.voteResults.push(userVoteResult) : round)
      );
      const round = DBConroller.getRound(roomId, roundId);
      return round ? {round} : {error: 'No round'};
    } catch (e) {
      return {error: e.message};
    }
  },

}

export default DBConroller
