import React, { useMemo } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, Users, Download, Image, Archive } from 'lucide-react';
import { DataPoint, Units } from '../types/pharmacometrics';

interface DataVisualizationProps {
  data: DataPoint[];
  units: Units;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ data, units }) => {
  const [plotType, setPlotType] = React.useState<'linear' | 'semilog'>('linear');
  const [viewMode, setViewMode] = React.useState<'all' | 'individual'>('all');
  const [currentPatientIndex, setCurrentPatientIndex] = React.useState(0);
  const [colorBy, setColorBy] = React.useState<'patient' | 'treatment'>('patient');
  const svgRef = React.useRef<SVGSVGElement>(null);

  // Function to create and download a ZIP file with all plots
  const downloadPlotsAsZip = async () => {
    const JSZip = (await import('https://cdn.skypack.dev/jszip')).default;
    const zip = new JSZip();
    
    const patientIds = Object.keys(chartData);
    
    // Helper function to generate SVG for specific configuration
    const generateSVG = (plotType: 'linear' | 'semilog', viewMode: 'all' | 'individual', patientId?: string) => {
      const displayData = viewMode === 'all' ? chartData : (patientId ? { [patientId]: chartData[patientId] } : {});
      
      let svgContent = `<svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="50" height="30" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="500" height="300" fill="white"/>
        <rect width="500" height="300" fill="url(#grid)"/>
        
        <!-- Axes -->
        <line x1="60" y1="250" x2="460" y2="250" stroke="#1e293b" stroke-width="2"/>
        <line x1="60" y1="40" x2="60" y2="250" stroke="#1e293b" stroke-width="2"/>
        
        <!-- Axis labels -->
        <text x="250" y="280" text-anchor="middle" font-size="12" fill="#64748b">TIME (${units.time})</text>
        <text x="25" y="145" text-anchor="middle" font-size="12" fill="#475569" font-weight="600" transform="rotate(-90, 25, 145)">
          DV (${units.concentration}) ${plotType === 'semilog' ? '(log scale)' : ''}
        </text>`;

      // Add tick marks and labels
      for (let i = 0; i <= 5; i++) {
        const x = 60 + (i / 5) * 400;
        const timeValue = (i / 5) * maxTime;
        svgContent += `
          <line x1="${x}" y1="250" x2="${x}" y2="255" stroke="#64748b" stroke-width="1"/>
          <text x="${x}" y="270" text-anchor="middle" font-size="10" fill="#475569" font-weight="600">
            ${timeValue.toFixed(1)}
          </text>`;
      }

      const yLabels = plotType === 'semilog' 
        ? Array.from({ length: 6 }, (_, i) => Math.pow(10, (i / 5) * Math.log10(maxConcentration)))
        : Array.from({ length: 6 }, (_, i) => (i / 5) * maxConcentration);

      yLabels.forEach((concValue, i) => {
        const y = plotType === 'semilog' 
          ? 250 - (i / 5) * 200
          : 250 - (concValue / maxConcentration) * 200;
        
        svgContent += `
          <line x1="55" y1="${y}" x2="60" y2="${y}" stroke="#64748b" stroke-width="1"/>
          <text x="50" y="${y + 4}" text-anchor="end" font-size="10" fill="#475569" font-weight="600">
            ${plotType === 'semilog' ? concValue.toFixed(1) : concValue.toFixed(0)}
          </text>`;
      });

      // Add data lines and points
      Object.entries(displayData).forEach(([id, points], index) => {
        const color = colors[index % colors.length];
        
        const svgPoints = points.map(point => ({
          x: 60 + (point.time / maxTime) * 400,
          y: plotType === 'semilog' 
            ? (point.concentration <= 0 ? 250 : 250 - (Math.log10(point.concentration) / Math.log10(maxConcentration)) * 200)
            : 250 - (point.concentration / maxConcentration) * 200
        })).filter(p => p.y >= 40 && p.y <= 250);

        if (svgPoints.length > 0) {
          svgContent += `
            <polyline points="${svgPoints.map(p => `${p.x},${p.y}`).join(' ')}" 
                     fill="none" stroke="${color}" stroke-width="2.5" opacity="0.9"/>`;
          
          svgPoints.forEach(point => {
            svgContent += `
              <circle cx="${point.x}" cy="${point.y}" r="4.5" fill="${color}" 
                     stroke="white" stroke-width="2.5"/>`;
          });
        }
      });

      svgContent += '</svg>';
      return svgContent;
    };

    // Generate all plot combinations
    const plotTypes: ('linear' | 'semilog')[] = ['linear', 'semilog'];
    
    // All patients plots
    for (const plotType of plotTypes) {
      const svgContent = generateSVG(plotType, 'all');
      zip.file(`all_patients_${plotType}_scale.svg`, svgContent);
    }
    
    // Individual patient plots
    for (const patientId of patientIds) {
      for (const plotType of plotTypes) {
        const svgContent = generateSVG(plotType, 'individual', patientId);
        zip.file(`patient_${patientId}_${plotType}_scale.svg`, svgContent);
      }
    }
    
    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = window.URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `concentration_time_plots_${new Date().toISOString().split('T')[0]}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const { chartData, maxConcentration, maxTime } = useMemo(() => {
    // Group data by patient
    const patientData = data.reduce((acc, point) => {
      if (!acc[point.patientId]) {
        acc[point.patientId] = [];
      }
      acc[point.patientId].push(point);
      return acc;
    }, {} as Record<string, DataPoint[]>);

    // Sort each patient's data by time
    Object.keys(patientData).forEach(patientId => {
      patientData[patientId].sort((a, b) => a.time - b.time);
    });

    const maxConc = Math.max(...data.map(d => d.concentration));
    const maxT = Math.max(...data.map(d => d.time));

    return {
      chartData: patientData,
      maxConcentration: maxConc,
      maxTime: maxT
    };
  }, [data]);

  // Check if treatment data is available
  const hasTreatmentData = data.some(point => point.treatment);
  
  // Get unique treatments
  const treatments = useMemo(() => {
    const treatmentSet = new Set(data.map(d => d.treatment).filter(Boolean));
    return Array.from(treatmentSet);
  }, [data]);
  const patientIds = Object.keys(chartData);
  const currentPatientId = patientIds[currentPatientIndex];

  const nextPatient = () => {
    setCurrentPatientIndex((prev) => (prev + 1) % patientIds.length);
  };

  const prevPatient = () => {
    setCurrentPatientIndex((prev) => (prev - 1 + patientIds.length) % patientIds.length);
  };

  const downloadPlotAsPNG = (filename: string) => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 800;
    canvas.height = 480;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            window.URL.revokeObjectURL(url);
          }
        });
      }
    };

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = window.URL.createObjectURL(svgBlob);
    img.src = url;
  };

  const handleDownloadCurrent = () => {
    const filename = viewMode === 'all' 
      ? `concentration_time_all_patients_${plotType}_${new Date().toISOString().split('T')[0]}.png`
      : `concentration_time_patient_${currentPatientId}_${plotType}_${new Date().toISOString().split('T')[0]}.png`;
    downloadPlotAsPNG(filename);
  };

  const getYPosition = (concentration: number) => {
    if (plotType === 'semilog') {
      if (concentration <= 0) return 250;
      const logConc = Math.log10(concentration);
      const logMax = Math.log10(maxConcentration);
      return 250 - (logConc / logMax) * 200;
    } else {
      return 250 - (concentration / maxConcentration) * 200;
    }
  };

  const getYAxisLabels = () => {
    if (plotType === 'semilog') {
      const logMax = Math.log10(maxConcentration);
      return Array.from({ length: 6 }, (_, i) => {
        const logValue = (i / 5) * logMax;
        return Math.pow(10, logValue);
      });
    } else {
      return Array.from({ length: 6 }, (_, i) => (i / 5) * maxConcentration);
    }
  };

  const colors = [
    '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4',
    '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  const getPatientColor = (patientId: string, index: number, points: DataPoint[]) => {
    if (colorBy === 'treatment' && hasTreatmentData) {
      const treatment = points[0]?.treatment;
      const treatmentIndex = treatments.indexOf(treatment || '');
      return colors[treatmentIndex % colors.length];
    }
    return colors[index % colors.length];
  };

  const displayData = viewMode === 'all' ? chartData : { [currentPatientId]: chartData[currentPatientId] };

  return (
    <div className="bg-white shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h3 className="text-md font-semibold text-slate-900">Conc vs. Time</h3>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={downloadPlotsAsZip}
              className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 relative group"
              title="Download all plots as ZIP"
            >
              <Archive className="h-4 w-4" />
              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Download all plots as ZIP
              </span>
            </button>
            
            {/* Color By Selector */}
            {hasTreatmentData && (
              <div className="flex bg-slate-100 p-1">
                <button
                  onClick={() => setColorBy('patient')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    colorBy === 'patient' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By Patient
                </button>
                <button
                  onClick={() => setColorBy('treatment')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    colorBy === 'treatment' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By Treatment
                </button>
              </div>
            )}
            
            {/* Plot Type Selector */}
            <div className="flex bg-slate-100 p-1">
              <button
                onClick={() => setPlotType('linear')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  plotType === 'linear' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => setPlotType('semilog')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  plotType === 'semilog' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semi-log
              </button>
            </div>

            {/* View Mode Selector */}
            <div className="flex bg-slate-100 p-1">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 ${
                  viewMode === 'all' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>All</span>
              </button>
              <button
                onClick={() => setViewMode('individual')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'individual' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Individual
              </button>
            </div>
          </div>
        </div>

        {/* Individual Patient Navigation */}
        {viewMode === 'individual' && patientIds.length > 1 && (
          <div className="flex items-center justify-between bg-slate-50 p-3 border-b border-slate-200">
            <button
              onClick={prevPatient}
              className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Previous</span>
            </button>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">{currentPatientId}</p>
              <p className="text-xs text-slate-500">{currentPatientIndex + 1} of {patientIds.length}</p>
            </div>
            <button
              onClick={nextPatient}
              className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              <span className="text-sm">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="relative w-full h-96 bg-slate-50 overflow-hidden border border-slate-200">
          <svg ref={svgRef} viewBox="0 0 500 300" className="w-full h-full">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="50" height="30" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="500" height="300" fill="url(#grid)" />

            {/* Axes */}
            <line x1="60" y1="250" x2="460" y2="250" stroke="#1e293b" strokeWidth="2" />
            <line x1="60" y1="40" x2="60" y2="250" stroke="#1e293b" strokeWidth="2" />

            {/* Axis labels */}
            <text x="250" y="280" textAnchor="middle" className="text-xs fill-slate-600">TIME ({units.time})</text>
            <text x="25" y="145" textAnchor="middle" className="text-xs fill-slate-700 font-medium" transform="rotate(-90, 25, 145)">
              DV ({units.concentration}) {plotType === 'semilog' ? '(log scale)' : ''}
            </text>

            {/* Plot data for each patient */}
            {Object.entries(displayData).map(([patientId, points], patientIndex) => {
              const color = getPatientColor(patientId, patientIndex, points);
              
              // Convert data points to SVG coordinates
              const svgPoints = points.map(point => ({
                x: 60 + (point.time / maxTime) * 400,
                y: getYPosition(point.concentration)
              })).filter(p => p.y >= 40 && p.y <= 250);

              return (
                <g key={patientId}>
                  {/* Line connecting points */}
                  <polyline
                    points={svgPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    opacity="0.9"
                  />
                  <span className="text-sm font-medium text-slate-700">ID {patientId}</span>
                  {/* Data points */}
                  {svgPoints.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="4.5"
                      fill={color}
                      stroke="white"
                      strokeWidth="2.5"
                      className="drop-shadow-sm"
                    />
                  ))}
                </g>
              );
            })}

            {/* X-axis tick marks and labels */}
            {Array.from({ length: 6 }, (_, i) => {
              const x = 60 + (i / 5) * 400;
              const timeValue = (i / 5) * maxTime;
              return (
                <g key={i}>
                  <line x1={x} y1="250" x2={x} y2="255" stroke="#64748b" strokeWidth="1" />
                  <text x={x} y="270" textAnchor="middle" className="text-xs fill-slate-700 font-medium">
                    {timeValue.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Y-axis tick marks and labels */}
            {getYAxisLabels().map((concValue, i) => {
              const y = plotType === 'semilog' 
                ? 250 - (i / 5) * 200
                : 250 - (concValue / maxConcentration) * 200;
              
              return (
                <g key={i}>
                  <line x1="55" y1={y} x2="60" y2={y} stroke="#64748b" strokeWidth="1" />
                  <text x="50" y={y + 4} textAnchor="end" className="text-xs fill-slate-700 font-medium">
                    {plotType === 'semilog' ? concValue.toFixed(1) : concValue.toFixed(0)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-3">
          {colorBy === 'treatment' && hasTreatmentData ? (
            treatments.map((treatment, index) => (
              <div key={treatment} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm font-medium text-slate-700">Treatment {treatment}</span>
              </div>
            ))
          ) : (
            Object.entries(displayData).map(([patientId, points], index) => (
              <div key={patientId} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3"
                  style={{ backgroundColor: getPatientColor(patientId, index, points) }}
                />
                <span className="text-sm font-medium text-slate-700">{patientId}</span>
              </div>
            ))
          )}
        </div>

        {/* Plot Information */}
        <div className="mt-4 bg-slate-50 p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600 font-medium">Plot Type</p>
              <p className="text-slate-900">{plotType === 'linear' ? 'Linear Scale' : 'Semi-logarithmic Scale'}</p>
            </div>
            <div>
              <p className="text-slate-600 font-medium">Patients Displayed</p>
              <p className="text-slate-900">
                {viewMode === 'all' ? `All ${patientIds.length} patients` : `Patient ${currentPatientId}`}
              </p>
            </div>
            {hasTreatmentData && (
              <div>
                <p className="text-slate-600 font-medium">Color Coding</p>
                <p className="text-slate-900">
                  {colorBy === 'treatment' ? 'By Treatment' : 'By Patient'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;