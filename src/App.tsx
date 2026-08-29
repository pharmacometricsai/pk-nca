import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Import useEffect, useMemo, useCallback
import { Calculator, User, Download, Upload, BarChart3, FileText, Info, Sun, Moon } from 'lucide-react';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useTheme } from './hooks/useTheme';
import MobileLanding from './components/MobileLanding';
import DataInput from './components/DataInput';
import NCAResults from './components/NCAResults';
import DataVisualization from './components/DataVisualization';
import About from './components/About';
import { DataPoint, NCAParameters, CalculationResults, Units, TimeRange } from './types/pharmacometrics';
import { calculateNCA } from './utils/ncaCalculations';
import { generateSampleData } from './utils/sampleData';
import './index.css';

function App() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState<DataPoint[]>(generateSampleData());
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [units, setUnits] = useState<Units>({ time: 'h', concentration: 'ng/mL' });
  const [timeRange, setTimeRange] = useState<TimeRange>({ min: 0, max: 24 });
  const [showAbout, setShowAbout] = useState(false);

  // Filter data based on time range - useMemo is good here
  const filteredData = useMemo(() => {
    return data.filter(point =>
      point.time >= timeRange.min && point.time <= timeRange.max
    );
  }, [data, timeRange]);

  // Use useCallback to memoize handleCalculate to avoid unnecessary re-renders in useEffect
  const handleCalculate = useCallback(async () => {
    if (filteredData.length === 0) {
      setResults(null);
      return;
    }

    setIsCalculating(true);
    try {
      // Simulate calculation time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Always recalculate with the latest filtered data
      const calculationResults = calculateNCA(filteredData);
      setResults(calculationResults);
    } catch (error) {
      console.error('Calculation error:', error);
      setResults(null);
    } finally {
      setIsCalculating(false);
    }
  }, [filteredData]); // Recalculate only if filteredData changes

  // Initialize time range based on data
  // ADDED 'data' to dependency array
  useEffect(() => {
    if (data.length > 0) {
      const times = data.map(d => d.time);
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      setTimeRange({ min: minTime, max: maxTime });
    }
  }, [data]); // <-- Corrected: added 'data'

  // Calculate initial results with sample data or when data/filteredData changes and no results exist
  // This useEffect will now trigger if data changes and results are null.
  // It relies on `handleCalculate` which is memoized with `filteredData`.
  useEffect(() => {
    if (data.length > 0 && !results && !isCalculating) {
      handleCalculate();
    }
  }, [data, results, isCalculating, handleCalculate]); // <-- Added 'data', 'results', 'isCalculating', 'handleCalculate'

  // Show mobile landing page on smaller screens
  if (!isDesktop) {
    return <MobileLanding />;
  }

  const handleDataChange = (newData: DataPoint[]) => {
    setData(newData);
    // Update time range when data changes
    if (newData.length > 0) {
      const times = newData.map(d => d.time);
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      setTimeRange({ min: minTime, max: maxTime });
    } else {
      setTimeRange({ min: 0, max: 0 }); // Reset if no data
    }
    setResults(null); // Clear results when data changes
  };

  const handleUnitsChange = (newUnits: Units) => {
    setUnits(newUnits);
    setResults(null); // Clear results when units change
  };

  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
    setResults(null); // Clear results when time range changes
  };

  const handleExportResults = () => {
    if (!results) return;

    const csvContent = generateCSVExport(results);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nca_results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVExport = (results: CalculationResults): string => {
    let csv = 'Patient ID,Cmax (ng/mL),Tmax (h),AUC_last (ng*h/mL),AUC_inf (ng*h/mL),Half-life (h),Clearance (L/h),Vd (L)\n';

    results.individualResults.forEach(result => {
      csv += `${result.patientId},${result.cmax.toFixed(2)},${result.tmax.toFixed(2)},${result.aucLast.toFixed(2)},${result.aucInf?.toFixed(2) || 'N/A'},${result.halfLife?.toFixed(2) || 'N/A'},${result.clearance?.toFixed(2) || 'N/A'},${result.volumeDistribution?.toFixed(2) || 'N/A'}\n`;
    });

    csv += '\nPopulation Summary\n';
    csv += `Mean Cmax,${results.populationSummary.meanCmax.toFixed(2)}\n`;
    csv += `Mean Tmax,${results.populationSummary.meanTmax.toFixed(2)}\n`;
    csv += `Mean AUC,${results.populationSummary.meanAUC.toFixed(2)}\n`;

    return csv;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Compute Non-Compartmental Analysis</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">Experimental Non-Compartmental Analysis Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white p-2 transition-colors duration-200 flex items-center rounded-lg"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => setShowAbout(true)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-black dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Info className="h-4 w-4" />
                <span>About</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-3 h-[calc(100vh-120px)]">
          {/* Data Input Section */}
          <div className="w-2/5 flex flex-col space-y-6">
            <div className="flex-1 overflow-y-auto">
              <DataInput
                data={data}
                onDataChange={handleDataChange}
                units={units}
                onUnitsChange={handleUnitsChange}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
              />
            </div>

            {/* Calculate Button */}
            <div className="flex-shrink-0">
              <div className="flex flex-col space-y-4">
                {/* Time Range Info */}
                {filteredData.length !== data.length && (
                  <div className="bg-blue-50 border border-blue-200 p-3 text-sm">
                    <p className="text-blue-800 font-medium">
                      Time Range Filter Active: {timeRange.min} - {timeRange.max} {units.time}
                    </p>
                    <p className="text-blue-600">
                      Using {filteredData.length} of {data.length} data points for analysis
                    </p>
                  </div>
                )}
                <button
                  onClick={handleCalculate}
                  disabled={filteredData.length === 0 || isCalculating}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 px-6 transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>{isCalculating ? 'Calculating...' : 'Calculate NCA Parameters'}</span>
                </button>

                {/* Column Legend */}
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Column Definitions</h4>
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex">
                      <span className="font-semibold w-16 text-slate-800 dark:text-slate-100">ID:</span>
                      <span>Patient or subject identifier</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-16 text-slate-800 dark:text-slate-100">TIME:</span>
                      <span>Time of sample collection after dose administration</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-16 text-slate-800 dark:text-slate-100">DV:</span>
                      <span>Dependent variable (observed drug concentration)</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-16 text-slate-800 dark:text-slate-100">TRT:</span>
                      <span>Treatment group or dose level (optional)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="w-3/5 flex flex-col space-y-6">
            {results ? (
              <div className="flex-1 flex flex-col space-y-6">
                <NCAResults results={results} units={units} />
                {filteredData.length > 0 && (
                  <DataVisualization data={filteredData} units={units} />
                )}
              </div>
            ) : (
              <div className="bg-white shadow-sm border border-slate-200 p-8 text-center flex-1 flex flex-col justify-center">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">NCA Results</h3>
                <p className="text-slate-500">Enter concentration-time data and click "Calculate NCA Parameters" to view results.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* About Modal */}
      {showAbout && <About onClose={() => setShowAbout(false)} />}
    </div>
  );
}

export default App;