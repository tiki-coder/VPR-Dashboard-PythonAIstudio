import { MarksRow, ScoresRow, BiasRow, FilterState, AggregatedStats, AggregatedScore } from '../types';
import { mockMarks, mockScores, mockBias } from './mockData';

export const getUniqueValues = (key: keyof MarksRow) => {
  return Array.from(new Set(mockMarks.map(row => row[key]))).sort();
};

export const getAvailableOOs = (year: number, municipality: string) => {
  let filtered = mockMarks.filter(r => r.year === year);
  if (municipality !== 'Все') {
    filtered = filtered.filter(r => r.municipality === municipality);
  }
  // Unique OOs by login
  const map = new Map();
  filtered.forEach(r => map.set(r.login, r.ooName));
  return Array.from(map.entries()).map(([login, name]) => ({ login, name }));
};

export const getFilteredMarks = (filter: FilterState): MarksRow[] => {
  return mockMarks.filter(r => 
    r.year === filter.year &&
    r.grade === filter.grade &&
    r.subject === filter.subject &&
    (filter.municipality === 'Все' || r.municipality === filter.municipality) &&
    (filter.oo === 'Все' || r.login === filter.oo)
  );
};

export const calculateStats = (rows: MarksRow[]): AggregatedStats => {
  if (rows.length === 0) {
    return { participants: 0, passRate: 0, qualityRate: 0, avgMark2: 0, avgMark3: 0, avgMark4: 0, avgMark5: 0 };
  }

  let totalParticipants = 0;
  let weighted2 = 0;
  let weighted3 = 0;
  let weighted4 = 0;
  let weighted5 = 0;

  rows.forEach(r => {
    totalParticipants += r.participants;
    weighted2 += r.mark2 * r.participants;
    weighted3 += r.mark3 * r.participants;
    weighted4 += r.mark4 * r.participants;
    weighted5 += r.mark5 * r.participants;
  });

  const avg2 = weighted2 / totalParticipants;
  const avg3 = weighted3 / totalParticipants;
  const avg4 = weighted4 / totalParticipants;
  const avg5 = weighted5 / totalParticipants;

  return {
    participants: totalParticipants,
    passRate: parseFloat((avg3 + avg4 + avg5).toFixed(2)),
    qualityRate: parseFloat((avg4 + avg5).toFixed(2)),
    avgMark2: parseFloat(avg2.toFixed(2)),
    avgMark3: parseFloat(avg3.toFixed(2)),
    avgMark4: parseFloat(avg4.toFixed(2)),
    avgMark5: parseFloat(avg5.toFixed(2)),
  };
};

export const getFilteredScores = (filter: FilterState): AggregatedScore[] => {
  const rows = mockScores.filter(r => 
    r.year === filter.year &&
    r.grade === filter.grade &&
    r.subject === filter.subject &&
    (filter.municipality === 'Все' || r.municipality === filter.municipality) &&
    (filter.oo === 'Все' || r.login === filter.oo)
  );

  if (rows.length === 0) return [];

  let totalParticipants = 0;
  const aggregatedDist: Record<number, number> = {};

  rows.forEach(r => {
    totalParticipants += r.participants;
    for (let i = 0; i <= 38; i++) {
        const val = r.scoreDistribution[i] || 0;
        aggregatedDist[i] = (aggregatedDist[i] || 0) + (val * r.participants);
    }
  });

  const result: AggregatedScore[] = [];
  // Determine max score dynamically (assuming 38 is absolute max, but we check specific subject logic if needed)
  // For this generic code, we go up to 38.
  for (let i = 0; i <= 38; i++) {
      result.push({
          score: i,
          percentage: totalParticipants > 0 ? parseFloat((aggregatedDist[i] / totalParticipants).toFixed(2)) : 0
      });
  }
  return result;
};

export const getBiasData = (filter: FilterState) => {
    // Current year bias for filtered scope
    const currentBias = mockBias.filter(r => 
        r.year === filter.year &&
        (filter.municipality === 'Все' || r.municipality === filter.municipality)
    );

    // Selected School Bias Specifics
    let selectedSchoolBias: BiasRow | undefined;
    if (filter.oo !== 'Все') {
        selectedSchoolBias = currentBias.find(r => r.login === filter.oo);
    }

    // Historical Check for Selected School (Last 3 years)
    let history: number[] = [];
    if (filter.oo !== 'Все') {
        const yearsToCheck = [filter.year - 1, filter.year - 2];
        yearsToCheck.forEach(y => {
            const b = mockBias.find(r => r.year === y && r.login === filter.oo);
            if (b) history.push(y);
        });
    }

    // List of schools with markers in current scope
    const schoolsWithMarkers = currentBias.filter(r => r.totalMarkers > 0).map(r => ({
        name: r.ooName,
        markers: r.totalMarkers,
        disciplines: {
            '4 РУ': r.markers_4_RU,
            '4 МА': r.markers_4_MA,
            '5 РУ': r.markers_5_RU,
            '5 МА': r.markers_5_MA,
        }
    }));

    // Calculate Percentages for Muni Bar Chart (Current + 2 prev years)
    const biasTrend = [];
    const years = [filter.year - 2, filter.year - 1, filter.year];
    
    for (const y of years) {
        // Total schools in this muni/scope for this year (approximate using marks data for 4th grade RU as denominator)
        const allSchoolsInYear = new Set(mockMarks
            .filter(m => m.year === y && m.grade === 4 && m.subject === 'Русский язык' && (filter.municipality === 'Все' || m.municipality === filter.municipality))
            .map(m => m.login)
        ).size;
        
        const biasedSchoolsInYear = new Set(mockBias
            .filter(b => b.year === y && (filter.municipality === 'Все' || b.municipality === filter.municipality))
            .map(b => b.login)
        ).size;

        biasTrend.push({
            year: y,
            percentage: allSchoolsInYear > 0 ? ((biasedSchoolsInYear / allSchoolsInYear) * 100).toFixed(1) : 0
        });
    }

    return {
        selectedSchoolBias,
        history,
        schoolsWithMarkers,
        biasTrend
    };
};
