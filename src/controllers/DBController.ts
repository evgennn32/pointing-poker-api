import { GameRoomEntity } from "../models/GameRoomEntity";

export default {
  initDB: () => {
    const DB: { games: { [key: string]: GameRoomEntity } } = {games: {}};
    global.DB = DB;
  },
  addGame: (game: GameRoomEntity) => {
    global.DB.games[game.roomID] = game;
    return game.roomID
  },

  gameIsset: (gameId:string) => {
    return gameId in global.DB.games
  }
}
