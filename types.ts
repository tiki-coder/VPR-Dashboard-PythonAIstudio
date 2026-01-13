export interface MarksRow {
  year: number;
  grade: number;
  subject: string;
  municipality: string;
  login: string;
  ooName: string;
  participants: number;
  mark2: number;
  mark3: number;
  mark4: number;
  mark5: number;
}

export interface ScoresRow {
  year: number;
  grade: number;
  subject: string;
  municipality: string;
  login: string;
  ooName: string;
  participants: number;
  // Dynamic map for scores 0-38
  scoreDistribution: Record<number, number>; 
}

export interface BiasRow {
  year: number;
  login: string;
  municipality: string;
  ooName: string;
  markers_4_RU: number;
  markers_4_MA: number;
  markers_5_RU: number;
  markers_5_MA: number;
  totalMarkers: number;
}

export interface FilterState {
  year: number;
  grade: number;
  subject: string;
  municipality: string;
  oo: string; // "All" or specific login
}

export interface AggregatedStats {
  participants: number;
  passRate: number; // % (3+4+5)
  qualityRate: number; // % (4+5)
  avgMark2: number;
  avgMark3: number;
  avgMark4: number;
  avgMark5: number;
}

export interface AggregatedScore {
  score: number;
  percentage: number;
}
