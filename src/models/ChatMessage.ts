import { User } from "./User";

export interface ChatMessage {
  message: string;
  user: User;
}