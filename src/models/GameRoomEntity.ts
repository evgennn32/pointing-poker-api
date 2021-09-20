import { Issue } from "./issue";
import { User } from "./user";
import { Card } from "./card";
import GameSettings from "./GameSettings";
import GameResult from "./GameResult";

export interface GameRoomEntity {
  roomName: string;
  roomID: string;
  scramMuster: User,
  gameSettings: GameSettings;
  users: User[];
  issues: Issue[];
  cards: Card[];
  gameResults: GameResult[];
}



