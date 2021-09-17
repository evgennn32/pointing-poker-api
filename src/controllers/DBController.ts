import { GameRoomEntity } from "../models/GameRoomEntity";
import { User } from "../models/User";
import { Issue } from "../models/Issue";

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
  deleteIssue: (issueId: string, roomId): Issue[] => {
    global.DB.games[roomId].issues = global.DB.games[roomId].issues.filter((issue) => issue.id !== issueId);
    return global.DB.games[roomId].issues;
  },
}
