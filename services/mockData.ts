import { MarksRow, ScoresRow, BiasRow } from '../types';

// Generators for mock data
const MUNICIPALITIES = ['г. Махачкала', 'г. Каспийск', 'г. Дербент', 'Акушинский район', 'Агульский район'];
const SUBJECTS = ['Русский язык', 'Математика', 'Окружающий мир'];
const GRADES = [4, 5, 6, 7];
const YEARS = [2021, 2022, 2023];

const generateRandomStats = (total: number) => {
  const m2 = Math.random() * 10;
  const m3 = Math.random() * 30;
  const m4 = Math.random() * 40;
  const m5 = 100 - m2 - m3 - m4;
  return { m2, m3, m4, m5 };
};

const generateScoreDist = () => {
  const dist: Record<number, number> = {};
  for (let i = 0; i <= 38; i++) {
    // Generate a bell curve-ish distribution
    const val = Math.exp(-Math.pow(i - 20, 2) / 50) * 10; 
    dist[i] = Math.max(0, val + (Math.random() * 2 - 1));
  }
  return dist;
};

export const mockMarks: MarksRow[] = [];
export const mockScores: ScoresRow[] = [];
export const mockBias: BiasRow[] = [];

// Populate data
let idCounter = 1;

MUNICIPALITIES.forEach(muni => {
  for (let i = 1; i <= 10; i++) { // 10 schools per muni
    const login = `edu05${idCounter.toString().padStart(4, '0')}`;
    const ooName = `МБОУ СОШ №${idCounter} ${muni}`;
    idCounter++;

    YEARS.forEach(year => {
      GRADES.forEach(grade => {
        SUBJECTS.forEach(subj => {
          // Marks
          const parts = Math.floor(Math.random() * 200) + 20;
          const { m2, m3, m4, m5 } = generateRandomStats(100);
          
          mockMarks.push({
            year,
            grade,
            subject: subj,
            municipality: muni,
            login,
            ooName,
            participants: parts,
            mark2: parseFloat(m2.toFixed(2)),
            mark3: parseFloat(m3.toFixed(2)),
            mark4: parseFloat(m4.toFixed(2)),
            mark5: parseFloat(m5.toFixed(2)),
          });

          // Scores
          mockScores.push({
            year,
            grade,
            subject: subj,
            municipality: muni,
            login,
            ooName,
            participants: parts,
            scoreDistribution: generateScoreDist(),
          });
        });
      });

      // Bias (Randomly assign bias to some schools)
      if (Math.random() > 0.7) {
        const m4ru = Math.random() > 0.5 ? 1 : 0;
        const m4ma = Math.random() > 0.5 ? 1 : 0;
        const m5ru = Math.random() > 0.5 ? 1 : 0;
        const m5ma = Math.random() > 0.5 ? 1 : 0;
        const total = m4ru + m4ma + m5ru + m5ma;
        
        if (total > 0) {
            mockBias.push({
                year,
                login,
                municipality: muni,
                ooName,
                markers_4_RU: m4ru,
                markers_4_MA: m4ma,
                markers_5_RU: m5ru,
                markers_5_MA: m5ma,
                totalMarkers: total
            });
        }
      }
    });
  }
});
