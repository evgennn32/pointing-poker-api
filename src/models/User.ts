export interface User {
  id: string;
  image: string | null;
  firstName: string;
  lastName: string;
  position: string;
  ableToDelete: boolean;
  score: string;
  scramMaster: boolean;
}