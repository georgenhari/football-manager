export interface User {
    id: string;
    email: string;
    team?: Team;
  }
  
  export interface Team {
    id: string;
    name: string;
    budget: number;
    players: Player[];
  }
  
  export interface Player {
    id: string;
    name: string;
    position: 'GK' | 'DEF' | 'MID' | 'ATT';
    price: number;
    teamId: string;
    isListed: boolean;
    askingPrice?: number;
  }