import { Issue } from "./Issue";
import VoteResult from "./VoteResult";

export default interface GameResult {
  issue: Issue;
  voteResults: VoteResult[];
  type: string;
  shortType: string;
  selected: boolean;
  editable: boolean;
}
