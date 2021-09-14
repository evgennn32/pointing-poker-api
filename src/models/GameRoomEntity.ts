import { Issue } from "./issue";
import { User } from "./user";
import { Card } from "./card";

export interface GameRoomEntity {
  roomID: string;
  scramMuster: User,
  gameSettings: {
    scrumMasterAsPlayer: boolean;
    changingCardInRoundEnd: boolean;
    isTimerNeeded: boolean;
    scoreType: string;
    scoreTypeShort: string;
    roundTime: string;
    timeOut: boolean;
    gameInProgress: boolean;
  };
  users: User[];
  issues: Issue[];
  cards: Card[];
}