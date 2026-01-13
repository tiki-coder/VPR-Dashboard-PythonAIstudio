import React, { useState, useMemo } from 'react';
import { FilterState } from './types';
import { getUniqueValues, getAvailableOOs, getFilteredMarks, calculateStats, getFilteredScores, getBiasData } from './services/dataProcessor';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList } from 'recharts';
import { Filter, Building2, Users, CheckCircle2, TrendingUp, AlertTriangle, ThumbsUp, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Initial Filter State
  const [filters, setFilters] = useState<FilterState>({
    year: 2023,
    grade: 4,
    subject: 'Русский язык',
    municipality: 'Все',
    oo: 'Все'
  });

  // Derived Data
  const filteredMarks = useMemo(() => getFilteredMarks(filters), [filters]);
  const stats = useMemo(() => calculateStats(filteredMarks), [filteredMarks]);
  const scoresData = useMemo(() => getFilteredScores(filters), [filters]);
  const biasData = useMemo(() => getBiasData(filters), [filters]);

  // Options for Dropdowns
  const years = [2021, 2022, 2023];
  const grades = [4, 5, 6, 7];
  const subjects = ['Русский язык', 'Математика', 'Окружающий мир'];
  const municipalities = ['Все', ...getUniqueValues('municipality') as string[]];
  const oos = useMemo(() => getAvailableOOs(filters.year, filters.municipality), [filters.year, filters.municipality]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handler for inputs
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => {
        const next = { ...prev, [key]: value };
        // Reset OO if municipality changes
        if (key === 'municipality') next.oo = 'Все';
        return next;
    });
  };

  const marksChartData = [
    { name: '2', value: stats.avgMark2, fill: '#ef4444' }, // Red
    { name: '3', value: stats.avgMark3, fill: '#eab308' }, // Yellow
    { name: '4', value: stats.avgMark4, fill: '#22c55e' }, // Green
    { name: '5', value: stats.avgMark5, fill: '#3b82f6' }, // Blue
  ];

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20`}>
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 shadow-sm p-4">
        <div className="max-w-[1920px] mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="text-blue-500 w-6 h-6" />
                    <h1 className="text-xl font-bold uppercase tracking-wider">Анализ Результатов ВПР</h1>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full lg:w-auto">
                    {/* Year */}
                    <select 
                        className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', Number(e.target.value))}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {/* Grade */}
                    <select 
                        className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.grade}
                        onChange={(e) => handleFilterChange('grade', Number(e.target.value))}
                    >
                         {grades.map(g => <option key={g} value={g}>{g} класс</option>)}
                    </select>
                    {/* Subject */}
                    <select 
                        className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.subject}
                        onChange={(e) => handleFilterChange('subject', e.target.value)}
                    >
                         {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {/* Municipality */}
                    <select 
                        className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.municipality}
                        onChange={(e) => handleFilterChange('municipality', e.target.value)}
                    >
                         {municipalities.map(m => <option key={m} value={String(m)}>{m}</option>)}
                    </select>
                    {/* OO */}
                    <select 
                        className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500 truncate"
                        value={filters.oo}
                        onChange={(e) => handleFilterChange('oo', e.target.value)}
                    >
                         <option value="Все">Все ОО</option>
                         {oos.map(o => <option key={o.login} value={o.login}>{o.name}</option>)}
                    </select>
                </div>

                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                    {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-lg">
                    <Building2 className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Выбранная ОО</p>
                    <p className="text-lg font-bold truncate max-w-[200px]" title={filters.oo === 'Все' ? 'Все' : oos.find(o => o.login === filters.oo)?.name}>
                        {filters.oo === 'Все' ? 'Весь регион' : oos.find(o => o.login === filters.oo)?.name}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Участников</p>
                    <p className="text-2xl font-bold">{stats.participants.toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Успеваемость</p>
                    <p className="text-2xl font-bold">{stats.passRate}%</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 flex items-center gap-4">
                <div className="p-3 bg-blue-600/10 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Качество (4+5)</p>
                    <p className="text-2xl font-bold">{stats.qualityRate}%</p>
                </div>
            </div>
        </div>

        {/* First Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Marks Distribution */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                <div className="mb-6 border-l-4 border-blue-500 pl-3">
                    <h2 className="text-lg font-bold">Распределение отметок (%)</h2>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={marksChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                            <XAxis dataKey="name" stroke={isDarkMode ? "#94a3b8" : "#475569"} />
                            <YAxis stroke={isDarkMode ? "#94a3b8" : "#475569"} />
                            <Tooltip 
                                cursor={{fill: isDarkMode ? '#1e293b' : '#f1f5f9'}}
                                contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', borderColor: isDarkMode ? '#334155' : '#e2e8f0', color: isDarkMode ? '#fff' : '#000' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {marksChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                                <LabelList 
                                    dataKey="value" 
                                    position="top" 
                                    formatter={(val: number) => `${val}%`}
                                    fill={isDarkMode ? "#cbd5e1" : "#334155"}
                                    fontSize={12}
                                    fontWeight="bold"
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

             {/* Scores Distribution */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                <div className="mb-6 border-l-4 border-blue-500 pl-3">
                    <h2 className="text-lg font-bold">Распределение первичных баллов (%)</h2>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoresData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                            <XAxis 
                                dataKey="score" 
                                interval="preserveEnd"
                                stroke={isDarkMode ? "#94a3b8" : "#475569"} 
                                fontSize={10}
                            />
                            <YAxis stroke={isDarkMode ? "#94a3b8" : "#475569"} />
                            <Tooltip 
                                cursor={{fill: isDarkMode ? '#1e293b' : '#f1f5f9'}}
                                contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', borderColor: isDarkMode ? '#334155' : '#e2e8f0', color: isDarkMode ? '#fff' : '#000' }}
                            />
                            <Bar dataKey="percentage" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="border-l-4 border-orange-500 pl-3 mt-8">
             <h2 className="text-xl font-bold uppercase tracking-wider">Признаки необъективности</h2>
        </div>

        {/* Bias Section Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Selected School Bias Analysis */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 flex flex-col justify-between">
                <div>
                     <h3 className="text-center text-sm uppercase text-gray-500 mb-6">Анализ выбранной школы ({filters.year})</h3>
                     
                     {filters.oo === 'Все' ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                            <Building2 className="w-12 h-12 mb-2 opacity-50" />
                            <p>Выберите конкретную школу для детального анализа</p>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center">
                            <span className="text-6xl font-black text-orange-500 mb-2">
                                {biasData.selectedSchoolBias ? biasData.selectedSchoolBias.totalMarkers : 0}
                            </span>
                            <span className="text-gray-400 uppercase text-xs font-bold tracking-widest mb-6">Количество маркеров</span>
                            
                            {biasData.selectedSchoolBias && (
                                <div className="flex gap-3 mb-6">
                                    {biasData.selectedSchoolBias.markers_4_RU > 0 && <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-slate-200">4 РУ: {biasData.selectedSchoolBias.markers_4_RU}</span>}
                                    {biasData.selectedSchoolBias.markers_4_MA > 0 && <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-slate-200">4 МА: {biasData.selectedSchoolBias.markers_4_MA}</span>}
                                    {biasData.selectedSchoolBias.markers_5_RU > 0 && <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-slate-200">5 РУ: {biasData.selectedSchoolBias.markers_5_RU}</span>}
                                    {biasData.selectedSchoolBias.markers_5_MA > 0 && <span className="px-3 py-1 bg-slate-700 rounded-full text-xs font-bold text-slate-200">5 МА: {biasData.selectedSchoolBias.markers_5_MA}</span>}
                                </div>
                            )}
                        </div>
                     )}
                </div>

                {filters.oo !== 'Все' && biasData.history.length > 0 && (
                    <div className="mt-6 bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="text-orange-500 w-5 h-5 flex-shrink-0" />
                        <p className="text-sm text-orange-200">
                            В прошлые годы ({biasData.history.join(', ')}) школа имела признаки необъективности.
                        </p>
                    </div>
                )}
                 {filters.oo !== 'Все' && biasData.history.length === 0 && (
                    <div className="mt-6 bg-green-900/20 border border-green-500/30 p-4 rounded-lg flex items-center gap-3">
                        <ThumbsUp className="text-green-500 w-5 h-5 flex-shrink-0" />
                        <p className="text-sm text-green-200">
                            В последние 2 года признаки необъективности не выявлены.
                        </p>
                    </div>
                )}
            </div>

            {/* Municipality Bias Trend */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
                <h3 className="text-center text-sm uppercase text-gray-500 mb-6">Доля ОО с признаками необъективности (%) по муниципалитету</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={biasData.biasTrend} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barSize={50}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                             <XAxis dataKey="year" stroke={isDarkMode ? "#94a3b8" : "#475569"} />
                             <YAxis stroke={isDarkMode ? "#94a3b8" : "#475569"} />
                             <Tooltip 
                                cursor={{fill: isDarkMode ? '#1e293b' : '#f1f5f9'}}
                                contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#fff', borderColor: isDarkMode ? '#334155' : '#e2e8f0', color: isDarkMode ? '#fff' : '#000' }}
                             />
                             <Bar dataKey="percentage" fill="#f97316" radius={[4, 4, 0, 0]}>
                                {biasData.biasTrend.map((entry, index) => (
                                    <Cell key={`cell-bias-${index}`} fill="#f97316" />
                                ))}
                                <LabelList 
                                    dataKey="percentage" 
                                    position="top" 
                                    formatter={(val: any) => `${val}%`}
                                    fill={isDarkMode ? "#cbd5e1" : "#334155"}
                                    fontSize={12}
                                    fontWeight="bold"
                                />
                             </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* List of Schools with Markers */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2 border-l-4 border-red-500 pl-3">
                    <h2 className="text-sm font-bold uppercase">Список ОО муниципалитета с маркерами ({filters.year})</h2>
                </div>
                {biasData.schoolsWithMarkers.length > 0 && (
                    <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded">
                        Найдено школ: {biasData.schoolsWithMarkers.length}
                    </span>
                )}
            </div>
            
            <div className="p-0">
                {biasData.schoolsWithMarkers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-3">Наименование Организации</th>
                                    <th className="px-6 py-3 text-center">Всего Маркеров</th>
                                    <th className="px-6 py-3">Дисциплины</th>
                                </tr>
                            </thead>
                            <tbody>
                                {biasData.schoolsWithMarkers.map((school, idx) => (
                                    <tr key={idx} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {school.name}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2.5 py-0.5 rounded-full font-bold">
                                                {school.markers}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {Object.entries(school.disciplines).map(([key, val]) => (
                                                    val > 0 ? (
                                                        <span key={key} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                                                            {key}
                                                        </span>
                                                    ) : null
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-10 text-center">
                        <ThumbsUp className="w-16 h-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Отличный результат!</h3>
                        <p className="text-gray-500 dark:text-gray-400">В этом году в выбранном районе школы с признаками необъективности отсутствуют.</p>
                    </div>
                )}
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;