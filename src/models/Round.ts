import VoteResult from "./VoteResult";
import UserVoteResult from "./UserVoteResult";

export  default interface Round {
  roundId: string;
  issueId: string;
  roundInProgress: boolean;
  usersVoteResults: UserVoteResult[];
  statistics: VoteResult[] | null;
  roundEnded: boolean;
}
