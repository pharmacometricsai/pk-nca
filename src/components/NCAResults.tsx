import React, { useState } from 'react';
import { TrendingUp, Users, Activity, Download, FileText, Code, Database } from 'lucide-react';
import { CalculationResults, Units } from '../types/pharmacometrics';

interface NCAResultsProps {
  results: CalculationResults;
  units: Units;
}

const NCAResults: React.FC<NCAResultsProps> = ({ results, units }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'individual' | 'treatment'>('summary');
  
  // Check if treatment data is available
  const hasTreatmentData = results.treatmentSummary && Object.keys(results.treatmentSummary).length > 0;

  const handleExportCSV = () => {
    let csv = `ID,Cmax_${units.concentration.replace('/', '_')},Tmax_${units.time},AUC_last_${units.time}_${units.concentration.replace('/', '_')},AUC_inf_${units.time}_${units.concentration.replace('/', '_')},Half_life_${units.time},Clearance_L_per_${units.time},Volume_Distribution_L\n`;
    
    results.individualResults.forEach(result => {
      csv += `${result.patientId},${result.cmax.toFixed(3)},${result.tmax.toFixed(3)},${result.aucLast.toFixed(3)},${result.aucInf?.toFixed(3) || 'NA'},${result.halfLife?.toFixed(3) || 'NA'},${result.clearance?.toFixed(3) || 'NA'},${result.volumeDistribution?.toFixed(3) || 'NA'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nca_results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Create a formatted text version for PDF-like output
    let content = 'PHARMACOKINETIC NON-COMPARTMENTAL ANALYSIS REPORT\n';
    content += '=' .repeat(60) + '\n\n';
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `Number of Patients: ${results.populationSummary.nPatients}\n\n`;
    
    content += 'POPULATION SUMMARY\n';
    content += '-' .repeat(30) + '\n';
    content += `Mean Cmax: ${results.populationSummary.meanCmax.toFixed(3)} ng/mL (CV: ${results.populationSummary.cvCmax.toFixed(1)}%)\n`;
    content += `Mean Tmax: ${results.populationSummary.meanTmax.toFixed(3)} ${units.time} (CV: ${results.populationSummary.cvTmax.toFixed(1)}%)\n`;
    content += `Mean AUC: ${results.populationSummary.meanAUC.toFixed(3)} ${units.time}*${units.concentration} (CV: ${results.populationSummary.cvAUC.toFixed(1)}%)\n`;
    content += `Mean Clearance: ${results.populationSummary.meanClearance.toFixed(3)} L/${units.time} (CV: ${results.populationSummary.cvClearance.toFixed(1)}%)\n`;
    content += `Mean Volume: ${results.populationSummary.meanVolumeDistribution.toFixed(3)} L (CV: ${results.populationSummary.cvVolumeDistribution.toFixed(1)}%)\n\n`;
    
    content += 'INDIVIDUAL PATIENT RESULTS\n';
    content += '-' .repeat(30) + '\n';
    content += 'ID\tCmax\tTmax\tAUC_last\tAUC_inf\tHalf-life\tClearance\tVd\n';
    content += `\t(${units.concentration})\t(${units.time})\t(${units.concentration}*${units.time})\t(${units.concentration}*${units.time})\t(${units.time})\t(L/${units.time})\t(L)\n`;
    
    results.individualResults.forEach(result => {
      content += `${result.patientId}\t${result.cmax.toFixed(3)}\t${result.tmax.toFixed(3)}\t${result.aucLast.toFixed(3)}\t${result.aucInf?.toFixed(3) || 'NA'}\t${result.halfLife?.toFixed(3) || 'NA'}\t${result.clearance?.toFixed(3) || 'NA'}\t${result.volumeDistribution?.toFixed(3) || 'NA'}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nca_report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportR = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    let rCode = '################################################################################\n';
    rCode += '# File: nca_results_' + currentDate + '.R\n';
    rCode += '# Author: NCA Analyst\n';
    rCode += '# Date: ' + new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + '\n';
    rCode += '# Software: Compute Non-Compartmental Analysis v1.0\n';
    rCode += '# Purpose: Non-Compartmental Analysis Results Export\n';
    rCode += '#\n';
    rCode += '# Description:\n';
    rCode += '# This script contains NCA results calculated from concentration-time data.\n';
    rCode += '# Includes individual patient parameters and population summary statistics.\n';
    rCode += '# Generated using trapezoidal rule for AUC and linear regression for\n';
    rCode += '# terminal elimination phase analysis.\n';
    rCode += '################################################################################\n\n';
    rCode += 'library(data.table)\n\n';
    rCode += 'nca_results <- data.table(\n';
    rCode += '  ID = c(' + results.individualResults.map(r => `"${r.patientId}"`).join(', ') + '),\n';
    rCode += '  Cmax_ng_mL = c(' + results.individualResults.map(r => r.cmax.toFixed(3)).join(', ') + '),\n';
    rCode += '  Tmax_h = c(' + results.individualResults.map(r => r.tmax.toFixed(3)).join(', ') + '),\n';
    rCode += '  AUC_last_' + units.time + '_' + units.concentration.replace('/', '_') + ' = c(' + results.individualResults.map(r => r.aucLast.toFixed(3)).join(', ') + '),\n';
    rCode += '  AUC_inf_' + units.time + '_' + units.concentration.replace('/', '_') + ' = c(' + results.individualResults.map(r => r.aucInf?.toFixed(3) || 'NA').join(', ') + '),\n';
    rCode += '  Half_life_h = c(' + results.individualResults.map(r => r.halfLife?.toFixed(3) || 'NA').join(', ') + '),\n';
    rCode += '  Clearance_L_h = c(' + results.individualResults.map(r => r.clearance?.toFixed(3) || 'NA').join(', ') + '),\n';
    rCode += '  Volume_Distribution_L = c(' + results.individualResults.map(r => r.volumeDistribution?.toFixed(3) || 'NA').join(', ') + ')\n';
    rCode += ')\n\n';
    rCode += '# Population Summary Statistics\n';
    rCode += `mean_cmax <- ${results.populationSummary.meanCmax.toFixed(3)}\n`;
    rCode += `mean_tmax <- ${results.populationSummary.meanTmax.toFixed(3)}\n`;
    rCode += `mean_auc <- ${results.populationSummary.meanAUC.toFixed(3)}\n`;
    rCode += `cv_cmax <- ${results.populationSummary.cvCmax.toFixed(1)}\n`;
    rCode += `cv_tmax <- ${results.populationSummary.cvTmax.toFixed(1)}\n`;
    rCode += `cv_auc <- ${results.populationSummary.cvAUC.toFixed(1)}\n\n`;
    rCode += '# View the data\n';
    rCode += 'print(nca_results)\n';

    const blob = new Blob([rCode], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nca_results_${new Date().toISOString().split('T')[0]}.R`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPython = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    let pythonCode = '################################################################################\n';
    pythonCode += '# File: nca_results_' + currentDate + '.py\n';
    pythonCode += '# Author: NCA Analyst\n';
    pythonCode += '# Date: ' + new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + '\n';
    pythonCode += '# Software: Compute Non-Compartmental Analysis v1.0\n';
    pythonCode += '# Purpose: Non-Compartmental Analysis Results Export\n';
    pythonCode += '#\n';
    pythonCode += '# Description:\n';
    pythonCode += '# This script contains NCA results calculated from concentration-time data.\n';
    pythonCode += '# Includes individual patient parameters and population summary statistics.\n';
    pythonCode += '# Generated using trapezoidal rule for AUC and linear regression for\n';
    pythonCode += '# terminal elimination phase analysis.\n';
    pythonCode += '################################################################################\n\n';
    pythonCode += 'import pandas as pd\nimport numpy as np\n\n';
    pythonCode += 'nca_results = pd.DataFrame({\n';
    pythonCode += '    "ID": [' + results.individualResults.map(r => `"${r.patientId}"`).join(', ') + '],\n';
    pythonCode += '    "Cmax_ng_mL": [' + results.individualResults.map(r => r.cmax.toFixed(3)).join(', ') + '],\n';
    pythonCode += '    "Tmax_h": [' + results.individualResults.map(r => r.tmax.toFixed(3)).join(', ') + '],\n';
    pythonCode += '    "AUC_last_' + units.time + '_' + units.concentration.replace('/', '_') + '": [' + results.individualResults.map(r => r.aucLast.toFixed(3)).join(', ') + '],\n';
    pythonCode += '    "AUC_inf_' + units.time + '_' + units.concentration.replace('/', '_') + '": [' + results.individualResults.map(r => r.aucInf?.toFixed(3) || 'np.nan').join(', ') + '],\n';
    pythonCode += '    "Half_life_h": [' + results.individualResults.map(r => r.halfLife?.toFixed(3) || 'np.nan').join(', ') + '],\n';
    pythonCode += '    "Clearance_L_h": [' + results.individualResults.map(r => r.clearance?.toFixed(3) || 'np.nan').join(', ') + '],\n';
    pythonCode += '    "Volume_Distribution_L": [' + results.individualResults.map(r => r.volumeDistribution?.toFixed(3) || 'np.nan').join(', ') + ']\n';
    pythonCode += '})\n\n';
    pythonCode += '# Population Summary Statistics\n';
    pythonCode += `mean_cmax = ${results.populationSummary.meanCmax.toFixed(3)}\n`;
    pythonCode += `mean_tmax = ${results.populationSummary.meanTmax.toFixed(3)}\n`;
    pythonCode += `mean_auc = ${results.populationSummary.meanAUC.toFixed(3)}\n`;
    pythonCode += `cv_cmax = ${results.populationSummary.cvCmax.toFixed(1)}\n`;
    pythonCode += `cv_tmax = ${results.populationSummary.cvTmax.toFixed(1)}\n`;
    pythonCode += `cv_auc = ${results.populationSummary.cvAUC.toFixed(1)}\n\n`;
    pythonCode += '# Display the data\n';
    pythonCode += 'print(nca_results)\n';
    pythonCode += 'print(f"\\nPopulation Summary:")\n';
    pythonCode += 'print(f"Mean Cmax: {mean_cmax:.3f} ng/mL (CV: {cv_cmax:.1f}%)")\n';
    pythonCode += 'print(f"Mean Tmax: {mean_tmax:.3f} h (CV: {cv_tmax:.1f}%)")\n';
    pythonCode += 'print(f"Mean AUC: {mean_auc:.3f} ng*h/mL (CV: {cv_auc:.1f}%)")\n';

    const blob = new Blob([pythonCode], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nca_results_${new Date().toISOString().split('T')[0]}.py`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const StatCard = ({ title, value, unit, icon: Icon, color }: {
    title: string;
    value: number;
    unit: string;
    icon: React.ComponentType<any>;
    color: string;
  }) => (
    <div className="bg-white border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value.toFixed(2)}</p>
          <p className="text-xs text-slate-500">{unit}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow-sm border border-slate-200 h-full">
      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === 'summary'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Population Summary</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === 'individual'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Individual Results</span>
            </div>
          </button>
          {hasTreatmentData && (
            <button
              onClick={() => setActiveTab('treatment')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'treatment'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>By Treatment</span>
              </div>
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6 overflow-y-auto">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Export Buttons */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Population Analysis</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5">
                  n = {results.populationSummary.nPatients}
                </span>
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5"
                >
                  <FileText className="h-4 w-4" />
                  <span>Report</span>
                </button>
                <button
                  onClick={handleExportR}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5"
                >
                  <Code className="h-4 w-4" />
                  <span>R</span>
                </button>
                <button
                  onClick={handleExportPython}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5"
                >
                  <Database className="h-4 w-4" />
                  <span>Python</span>
                </button>
              </div>
            </div>

            {/* Summary Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Mean Cmax"
                value={results.populationSummary.meanCmax}
                unit={units.concentration}
                icon={TrendingUp}
                color="bg-blue-500"
              />
              <StatCard
                title="Mean Tmax"
                value={results.populationSummary.meanTmax}
                unit={units.time}
                icon={Activity}
                color="bg-emerald-500"
              />
              <StatCard
                title="Mean AUC"
                value={results.populationSummary.meanAUC}
                unit={`${units.time}*${units.concentration}`}
                icon={TrendingUp}
                color="bg-purple-500"
              />
              <StatCard
                title="Mean CL/F"
                value={results.populationSummary.meanClearance}
                unit={`L/${units.time}`}
                icon={Activity}
                color="bg-orange-500"
              />
              <StatCard
                title="Mean Vd/F"
                value={results.populationSummary.meanVolumeDistribution}
                unit="L"
                icon={TrendingUp}
                color="bg-indigo-500"
              />
            </div>

            {/* Detailed Statistics */}
            <div className="bg-slate-50 p-4">
              <h4 className="font-semibold text-slate-700 mb-3">Variability Metrics</h4>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">CV% Cmax</p>
                  <p className="font-semibold text-slate-900">{results.populationSummary.cvCmax.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-slate-600">CV% Tmax</p>
                  <p className="font-semibold text-slate-900">{results.populationSummary.cvTmax.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-slate-600">CV% AUC</p>
                  <p className="font-semibold text-slate-900">{results.populationSummary.cvAUC.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-slate-600">CV% CL/F</p>
                  <p className="font-semibold text-slate-900">{results.populationSummary.cvClearance.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-slate-600">CV% Vd/F</p>
                  <p className="font-semibold text-slate-900">{results.populationSummary.cvVolumeDistribution.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'individual' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                <span>Individual Patient Results</span>
              </h3>
            </div>
            
            <div className="overflow-x-auto border border-slate-300">
              <table className="w-full border-collapse">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 border-r border-slate-300 bg-slate-50">ID</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 border-r border-slate-300 bg-slate-50">Cmax<br/><span className="font-normal text-xs text-slate-500">({units.concentration})</span></th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 border-r border-slate-300 bg-slate-50">Tmax<br/><span className="font-normal text-xs text-slate-500">({units.time})</span></th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 border-r border-slate-300 bg-slate-50">AUC_last<br/><span className="font-normal text-xs text-slate-500">({units.concentration}·{units.time}/mL)</span></th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 border-r border-slate-300 bg-slate-50">AUC_inf<br/><span className="font-normal text-xs text-slate-500">({units.time}*{units.concentration})</span></th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 border-r border-slate-300 bg-slate-50">t½<br/><span className="font-normal text-xs text-slate-500">({units.time})</span></th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 border-r border-slate-300 bg-slate-50">CL/F<br/><span className="font-normal text-xs text-slate-500">(L/{units.time})</span></th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 bg-slate-50">Vd/F<br/><span className="font-normal text-xs text-slate-500">(L)</span></th>
                  </tr>
                </thead>
                <tbody>
                  {results.individualResults.map((result, index) => (
                    <tr key={result.patientId} className={`border-b border-slate-200 hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      <td className="py-2.5 px-4 font-medium text-slate-900 border-r border-slate-200">{result.patientId}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 border-r border-slate-200">{result.cmax.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 border-r border-slate-200">{result.tmax.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 border-r border-slate-200">{result.aucLast.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 border-r border-slate-200">{result.aucInf?.toFixed(2) || 'N/A'}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 border-r border-slate-200">{result.halfLife?.toFixed(2) || 'N/A'}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 border-r border-slate-200">{result.clearance?.toFixed(2) || 'N/A'}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700">{result.volumeDistribution?.toFixed(2) || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'treatment' && hasTreatmentData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>Treatment Analysis</span>
              </h3>
            </div>
            
            {Object.entries(results.treatmentSummary!).map(([treatment, summary]) => (
              <div key={treatment} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h4 className="text-md font-semibold text-slate-900 flex items-center space-x-2">
                    <span>Treatment {treatment}</span>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      n = {summary.nPatients}
                    </span>
                  </h4>
                </div>
                
                <div className="p-4">
                  {/* Summary Statistics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <StatCard
                      title="Mean Cmax"
                      value={summary.meanCmax}
                      unit={units.concentration}
                      icon={TrendingUp}
                      color="bg-blue-500"
                    />
                    <StatCard
                      title="Mean Tmax"
                      value={summary.meanTmax}
                      unit={units.time}
                      icon={Activity}
                      color="bg-emerald-500"
                    />
                    <StatCard
                      title="Mean AUC"
                      value={summary.meanAUC}
                      unit={`${units.time}*${units.concentration}`}
                      icon={TrendingUp}
                      color="bg-purple-500"
                    />
                    <StatCard
                      title="Mean CL/F"
                      value={summary.meanClearance}
                      unit={`L/${units.time}`}
                      icon={Activity}
                      color="bg-orange-500"
                    />
                    <StatCard
                      title="Mean Vd/F"
                      value={summary.meanVolumeDistribution}
                      unit="L"
                      icon={TrendingUp}
                      color="bg-indigo-500"
                    />
                  </div>
                  
                  {/* Variability Metrics */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-slate-700 mb-3">Variability Metrics</h5>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">CV% Cmax</p>
                        <p className="font-semibold text-slate-900">{summary.cvCmax.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-600">CV% Tmax</p>
                        <p className="font-semibold text-slate-900">{summary.cvTmax.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-600">CV% AUC</p>
                        <p className="font-semibold text-slate-900">{summary.cvAUC.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-600">CV% CL/F</p>
                        <p className="font-semibold text-slate-900">{summary.cvClearance.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-600">CV% Vd/F</p>
                        <p className="font-semibold text-slate-900">{summary.cvVolumeDistribution.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NCAResults;