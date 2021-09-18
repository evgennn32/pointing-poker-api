import { GameRoomEntity } from "../models/GameRoomEntity";
import { User } from "../models/User";
import GameSettings from "../models/GameSettings";
import { Issue } from "../models/Issue";
import { Card } from "../models/Card";

export default {
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
  addIssue: (issue: Issue, roomID): {error?: string; issue?: Issue} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].issues.push(issue);
    return {issue};
  },
  updateIssue: (updatedIssue: Issue, roomID): {error?: string; issues?: Issue[]} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].issues = global.DB.games[roomID].issues.map(
      (issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)
    );
    return {issues: global.DB.games[roomID].issues};
  },
  deleteIssue: (issueId: string, roomId): Issue[] => {
    global.DB.games[roomId].issues = global.DB.games[roomId].issues.filter((issue) => issue.id !== issueId);
    return global.DB.games[roomId].issues;
  },
  addCard: (card: Card, roomID): {error?: string; card?: Card} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].cards.push(card);
    return {card};
  },
  updateCard: (updatedCard: Card, roomID): {error?: string; cards?: Card[]} => {
    if(!global.DB.games[roomID]) {
      return {error: 'No such game'};
    }
    global.DB.games[roomID].cards = global.DB.games[roomID].cards.map(
      (card) => (card.id === updatedCard.id ? updatedCard : card)
    );
    return {cards: global.DB.games[roomID].cards};
  },
  deleteCard: (cardId: string, roomId): Card[] => {
    global.DB.games[roomId].cards = global.DB.games[roomId].cards.filter((card) => card.id !== cardId);
    return global.DB.games[roomId].cards;
  },
}
