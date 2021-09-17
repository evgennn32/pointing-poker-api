import { GameRoomEntity } from "../models/GameRoomEntity";
import { User } from "../models/User";
import GameSettings from "../models/GameSettings";

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
    console.log(userId);
    global.DB.games[roomID].users = global.DB.games[roomID].users.filter((user) => user.id !== userId);
    console.log(global.DB.games[roomID].users);
    return global.DB.games[roomID].users;
  }

}
