import { Issue } from "./Issue";
import { User } from "./User";
import { Card } from "./Card";
import GameSettings from "./GameSettings";
import GameResult from "./GameResult";
import Round from "./Round";

export interface GameRoomEntity {
  roomName: string;
  roomID: string;
  scrumMaster: User,
  gameSettings: GameSettings;
  users: User[];
  issues: Issue[];
  cards: Card[];
  gameResults: GameResult[];
  rounds: Round[];
}



