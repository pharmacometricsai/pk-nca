import React, { useState } from 'react';
import { Plus, Upload, X, User, Trash2, Settings, ChevronDown } from 'lucide-react';
import { DataPoint, Units, TimeRange } from '../types/pharmacometrics';

interface DataInputProps {
  data: DataPoint[];
  onDataChange: (data: DataPoint[]) => void;
  units: Units;
  onUnitsChange: (units: Units) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
}

const DataInput: React.FC<DataInputProps> = ({ 
  data, 
  onDataChange, 
  units, 
  onUnitsChange, 
  timeRange, 
  onTimeRangeChange 
}) => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tempUnits, setTempUnits] = useState(units);
  const [tempTimeRange, setTempTimeRange] = useState(timeRange);

  // Calculate min and max time from data
  const dataTimeRange = React.useMemo(() => {
    if (data.length === 0) return { min: 0, max: 24 };
    const times = data.map(d => d.time);
    return {
      min: Math.min(...times),
      max: Math.max(...times)
    };
  }, [data]);

  const addRow = () => {
    const newRow: DataPoint = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: '',
      treatment: '',
      time: 0,
      concentration: 0
    };
    onDataChange([...data, newRow]);
  };

  const removeRow = (id: string) => {
    onDataChange(data.filter(row => row.id !== id));
  };

  const clearAllData = () => {
    onDataChange([]);
  };

  const updateRow = (id: string, field: keyof Omit<DataPoint, 'id'>, value: string | number) => {
    onDataChange(data.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').filter(row => row.trim());
      const headers = rows[0].toLowerCase().split(',').map(h => h.trim());
      
      const patientIdIndex = headers.findIndex(h => 
        h === 'id' || h === 'ID' || h.includes('patient') || h.includes('subject')
      );
      const treatmentIndex = headers.findIndex(h => 
        h === 'trt' || h === 'TRT' || h.includes('treatment') || h.includes('arm')
      );
      const timeIndex = headers.findIndex(h => h === 'time' || h === 'TIME' || h.includes('hour'));
      const concentrationIndex = headers.findIndex(h => h === 'dv' || h === 'DV' || h.includes('concentration') || h.includes('conc'));

      if (patientIdIndex === -1 || timeIndex === -1 || concentrationIndex === -1) {
        alert('CSV must contain columns for ID, TIME, and DV');
        return;
      }

      const newData: DataPoint[] = [];
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',').map(c => c.trim());
        if (cols.length >= 3) {
          const dataPoint: DataPoint = {
            id: Math.random().toString(36).substr(2, 9),
            patientId: cols[patientIdIndex],
            time: parseFloat(cols[timeIndex]) || 0,
            concentration: parseFloat(cols[concentrationIndex]) || 0
          };
          
          // Add treatment if available
          if (treatmentIndex !== -1 && cols[treatmentIndex]) {
            dataPoint.treatment = cols[treatmentIndex];
          }
          
          newData.push(dataPoint);
        }
      }
      onDataChange(newData);
    };
    reader.readAsText(file);
  };

  const applyUnitsSettings = () => {
    onUnitsChange(tempUnits);
    onTimeRangeChange(tempTimeRange);
    setShowSettings(false);
  };

  const cancelUnitsSettings = () => {
    setTempUnits(units);
    setTempTimeRange(timeRange);
    setShowSettings(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col transition-colors duration-300">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Data Input</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white p-2 transition-colors duration-200 flex items-center space-x-1"
              >
                <Settings className="h-4 w-4" />
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showSettings ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Settings Dropdown */}
              {showSettings && (
                <div className="absolute top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-lg z-50">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Unit Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">TIME Unit</label>
                        <select
                          value={tempUnits.time}
                          onChange={(e) => setTempUnits({ ...tempUnits, time: e.target.value })}
                          className="w-full border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                          <option value="h">hours (h)</option>
                          <option value="min">minutes (min)</option>
                          <option value="day">days (day)</option>
                          <option value="week">weeks (week)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">DV Unit</label>
                        <select
                          value={tempUnits.concentration}
                          onChange={(e) => setTempUnits({ ...tempUnits, concentration: e.target.value })}
                          className="w-full border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                          <option value="ng/mL">ng/mL</option>
                          <option value="μg/mL">μg/mL</option>
                          <option value="mg/L">mg/L</option>
                          <option value="μM">μM</option>
                          <option value="nM">nM</option>
                          <option value="pM">pM</option>
                        </select>
                      </div>
                      
                      {/* Time Range Filter */}
                      <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                        <label className="block text-xs font-medium text-slate-700 mb-2">
                          Time Range for NCA Analysis ({tempUnits.time})
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Min Time</label>
                              <input
                                type="number"
                                value={tempTimeRange.min}
                                onChange={(e) => setTempTimeRange({ 
                                  ...tempTimeRange, 
                                  min: Math.max(0, parseFloat(e.target.value) || 0)
                                })}
                                min={dataTimeRange.min}
                                max={tempTimeRange.max}
                                step="0.1"
                                className="w-full border border-slate-300 dark:border-slate-600 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Max Time</label>
                              <input
                                type="number"
                                value={tempTimeRange.max}
                                onChange={(e) => setTempTimeRange({ 
                                  ...tempTimeRange, 
                                  max: parseFloat(e.target.value) || dataTimeRange.max
                                })}
                                min={tempTimeRange.min}
                                max={dataTimeRange.max}
                                step="0.1"
                                className="w-full border border-slate-300 dark:border-slate-600 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                          
                          {/* Range Slider */}
                          <div className="relative">
                            <input
                              type="range"
                              min={dataTimeRange.min}
                              max={dataTimeRange.max}
                              value={tempTimeRange.min}
                              onChange={(e) => setTempTimeRange({ 
                                ...tempTimeRange, 
                                min: parseFloat(e.target.value)
                              })}
                              step="0.1"
                              className="absolute w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
                              style={{ zIndex: 2 }}
                            />
                            <input
                              type="range"
                              min={dataTimeRange.min}
                              max={dataTimeRange.max}
                              value={tempTimeRange.max}
                              onChange={(e) => setTempTimeRange({ 
                                ...tempTimeRange, 
                                max: parseFloat(e.target.value)
                              })}
                              step="0.1"
                              className="absolute w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider-thumb-green"
                              style={{ zIndex: 1 }}
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-3">
                              <span>{dataTimeRange.min}</span>
                              <span>{dataTimeRange.max}</span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-slate-600 dark:text-slate-300 bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                            <p>
                              <strong>Selected range:</strong> {tempTimeRange.min} - {tempTimeRange.max} {tempUnits.time}
                            </p>
                            <p className="mt-1">
                              Data points outside this range will be excluded from NCA calculations.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                      <button
                        onClick={cancelUnitsSettings}
                        className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={applyUnitsSettings}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm transition-colors duration-200"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={addRow}
              className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-3 py-2 transition-colors duration-200 flex items-center space-x-1.5 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Row</span>
            </button>
            <button
              onClick={clearAllData}
              className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-3 py-2 transition-colors duration-200 flex items-center space-x-1.5 text-sm font-medium"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear</span>
            </button>
            <label className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 transition-colors duration-200 flex items-center space-x-2 cursor-pointer text-sm font-medium">
              <Upload className="h-4 w-4" />
              <span>CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
        {csvFile && (
          <div className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-2">
            Uploaded: {csvFile.name}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {data.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <User className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <p className="text-lg font-medium mb-2 dark:text-slate-300">No data entered</p>
            <p>Add rows manually or upload a CSV file to begin analysis</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="text-center py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-200 border-r border-b-2 border-r-slate-300 dark:border-r-slate-600 border-b-slate-400 dark:border-b-slate-500 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-750 text-xs uppercase tracking-wide">ID</th>
                  <th className="text-center py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-200 border-r border-b-2 border-r-slate-300 dark:border-r-slate-600 border-b-slate-400 dark:border-b-slate-500 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-750 text-xs uppercase tracking-wide">
                    TIME<br/>
                    <span className="font-normal text-xs text-slate-500 dark:text-slate-400 normal-case">({units.time})</span>
                  </th>
                  <th className="text-center py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-200 border-r border-b-2 border-r-slate-300 dark:border-r-slate-600 border-b-slate-400 dark:border-b-slate-500 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-750 text-xs uppercase tracking-wide">
                    DV<br/>
                    <span className="font-normal text-xs text-slate-500 dark:text-slate-400 normal-case">({units.concentration})</span>
                  </th>
                  <th className="text-center py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-200 border-r border-b-2 border-r-slate-300 dark:border-r-slate-600 border-b-slate-400 dark:border-b-slate-500 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-750 text-xs uppercase tracking-wide">
                    TRT<br/>
                    <span className="font-normal text-xs text-slate-500 dark:text-slate-400 normal-case">(optional)</span>
                  </th>
                  <th className="text-center py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200 border-b-2 border-b-slate-400 dark:border-b-slate-500 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-750 w-16 text-xs uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={row.id} className={`border-b border-slate-300 dark:border-slate-600 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors duration-100 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/40'}`}>
                    <td className="border-r border-slate-300 dark:border-slate-600 p-0">
                      <input
                        type="text"
                        value={row.patientId}
                        onChange={(e) => updateRow(row.id, 'patientId', e.target.value)}
                        className="w-full py-2 px-3 border-0 focus:ring-2 focus:ring-blue-400 focus:ring-inset focus:outline-none transition-all duration-150 text-sm bg-transparent text-slate-900 dark:text-white font-medium"
                        placeholder="Enter ID"
                      />
                    </td>
                    <td className="border-r border-slate-300 dark:border-slate-600 p-0">
                      <input
                        type="number"
                        value={row.time}
                        onChange={(e) => updateRow(row.id, 'time', parseFloat(e.target.value) || 0)}
                        className="w-full py-2 px-3 border-0 focus:ring-2 focus:ring-blue-400 focus:ring-inset focus:outline-none transition-all duration-150 text-sm text-right tabular-nums bg-transparent text-slate-900 dark:text-white"
                        placeholder="0.0"
                        step="0.1"
                        min="0"
                      />
                    </td>
                    <td className="border-r border-slate-300 dark:border-slate-600 p-0">
                      <input
                        type="number"
                        value={row.concentration}
                        onChange={(e) => updateRow(row.id, 'concentration', parseFloat(e.target.value) || 0)}
                        className="w-full py-2 px-3 border-0 focus:ring-2 focus:ring-blue-400 focus:ring-inset focus:outline-none transition-all duration-150 text-sm text-right tabular-nums bg-transparent text-slate-900 dark:text-white"
                        placeholder="0.0"
                        step="0.01"
                        min="0"
                      />
                    </td>
                    <td className="border-r border-slate-300 dark:border-slate-600 p-0">
                      <input
                        type="text"
                        value={row.treatment || ''}
                        onChange={(e) => updateRow(row.id, 'treatment', e.target.value)}
                        className="w-full py-2 px-3 border-0 focus:ring-2 focus:ring-blue-400 focus:ring-inset focus:outline-none transition-all duration-150 text-sm bg-transparent text-slate-900 dark:text-white"
                        placeholder="Enter TRT"
                      />
                    </td>
                    <td className="text-center p-0">
                      <button
                        onClick={() => removeRow(row.id)}
                        className="w-full h-full py-2 px-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-150"
                        title="Delete row"
                      >
                        <X className="h-4 w-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataInput;