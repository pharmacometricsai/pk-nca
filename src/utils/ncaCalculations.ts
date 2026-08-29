import { DataPoint, NCAParameters, CalculationResults, PopulationSummary } from '../types/pharmacometrics';

export function calculateNCA(data: DataPoint[]): CalculationResults {
  // Group data by patient
  const patientData = data.reduce((acc, point) => {
    if (!acc[point.patientId]) {
      acc[point.patientId] = [];
    }
    acc[point.patientId].push(point);
    return acc;
  }, {} as Record<string, DataPoint[]>);

  // Calculate NCA parameters for each patient
  const individualResults: NCAParameters[] = [];

  Object.entries(patientData).forEach(([patientId, points]) => {
    // Sort by time
    const sortedPoints = points.sort((a, b) => a.time - b.time);
    
    if (sortedPoints.length < 2) return;

    const ncaParams = calculateIndividualNCA(sortedPoints);
    individualResults.push({
      patientId,
      ...ncaParams
    });
  });

  // Calculate population summary
  const populationSummary = calculatePopulationSummary(individualResults);

  // Calculate treatment-based summary if treatment data exists
  let treatmentSummary: Record<string, PopulationSummary> | undefined;
  const hastreatments = data.some(point => point.treatment);
  
  if (hastreatments) {
    // Group individual results by treatment
    const treatmentGroups: Record<string, NCAParameters[]> = {};
    
    individualResults.forEach(result => {
      // Find treatment for this patient
      const patientPoints = data.filter(d => d.patientId === result.patientId);
      const treatment = patientPoints[0]?.treatment || 'Unknown';
      
      if (!treatmentGroups[treatment]) {
        treatmentGroups[treatment] = [];
      }
      treatmentGroups[treatment].push(result);
    });
    
    // Calculate summary for each treatment
    treatmentSummary = {};
    Object.entries(treatmentGroups).forEach(([treatment, results]) => {
      treatmentSummary![treatment] = calculatePopulationSummary(results);
    });
  }
  return {
    individualResults,
    populationSummary,
    treatmentSummary
  };
}

function calculateIndividualNCA(points: DataPoint[]) {
  // Find Cmax and Tmax
  const cmax = Math.max(...points.map(p => p.concentration));
  const cmaxPoint = points.find(p => p.concentration === cmax);
  const tmax = cmaxPoint?.time || 0;

  // Calculate AUC using trapezoidal rule
  let aucLast = 0;
  for (let i = 1; i < points.length; i++) {
    const t1 = points[i - 1].time;
    const t2 = points[i].time;
    const c1 = points[i - 1].concentration;
    const c2 = points[i].concentration;
    
    // Trapezoidal rule
    aucLast += (t2 - t1) * (c1 + c2) / 2;
  }

  // Calculate half-life using last 3-4 points (terminal phase)
  let halfLife: number | undefined;
  let aucInf: number | undefined;
  let clearance: number | undefined;
  let volumeDistribution: number | undefined;

  if (points.length >= 4) {
    const terminalPoints = points.slice(-4).filter(p => p.concentration > 0);
    if (terminalPoints.length >= 3) {
      const lambda_z = calculateTerminalSlope(terminalPoints);
      if (lambda_z > 0) {
        halfLife = Math.log(2) / lambda_z;
        
        // Extrapolate AUC to infinity
        const lastPoint = points[points.length - 1];
        const aucExtrap = lastPoint.concentration / lambda_z;
        aucInf = aucLast + aucExtrap;

        // Assume dose of 100mg for demonstration (in real app, this would be input)
        const dose = 100;
        clearance = dose / aucInf;
        volumeDistribution = clearance / lambda_z;
      }
    }
  }

  return {
    cmax,
    tmax,
    aucLast,
    aucInf,
    halfLife,
    clearance,
    volumeDistribution
  };
}

function calculateTerminalSlope(points: DataPoint[]): number {
  // Linear regression on log-transformed concentrations
  const logPoints = points
    .filter(p => p.concentration > 0)
    .map(p => ({ x: p.time, y: Math.log(p.concentration) }));

  if (logPoints.length < 2) return 0;

  const n = logPoints.length;
  const sumX = logPoints.reduce((sum, p) => sum + p.x, 0);
  const sumY = logPoints.reduce((sum, p) => sum + p.y, 0);
  const sumXY = logPoints.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = logPoints.reduce((sum, p) => sum + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  
  // Return absolute value of slope (lambda_z)
  return Math.abs(slope);
}

function calculatePopulationSummary(individualResults: NCAParameters[]): PopulationSummary {
  if (individualResults.length === 0) {
    return {
      meanCmax: 0,
      meanTmax: 0,
      meanAUC: 0,
      meanClearance: 0,
      meanVolumeDistribution: 0,
      stdCmax: 0,
      stdTmax: 0,
      stdAUC: 0,
      stdClearance: 0,
      stdVolumeDistribution: 0,
      cvCmax: 0,
      cvTmax: 0,
      cvAUC: 0,
      cvClearance: 0,
      cvVolumeDistribution: 0,
      nPatients: 0
    };
  }

  const n = individualResults.length;
  
  // Filter results that have clearance and volume data
  const resultsWithClearance = individualResults.filter(r => r.clearance !== undefined);
  const resultsWithVolume = individualResults.filter(r => r.volumeDistribution !== undefined);
  
  // Calculate means
  const meanCmax = individualResults.reduce((sum, r) => sum + r.cmax, 0) / n;
  const meanTmax = individualResults.reduce((sum, r) => sum + r.tmax, 0) / n;
  const meanAUC = individualResults.reduce((sum, r) => sum + r.aucLast, 0) / n;
  const meanClearance = resultsWithClearance.length > 0 
    ? resultsWithClearance.reduce((sum, r) => sum + (r.clearance || 0), 0) / resultsWithClearance.length
    : 0;
  const meanVolumeDistribution = resultsWithVolume.length > 0
    ? resultsWithVolume.reduce((sum, r) => sum + (r.volumeDistribution || 0), 0) / resultsWithVolume.length
    : 0;

  // Calculate standard deviations
  const stdCmax = Math.sqrt(
    individualResults.reduce((sum, r) => sum + Math.pow(r.cmax - meanCmax, 2), 0) / (n - 1)
  );
  const stdTmax = Math.sqrt(
    individualResults.reduce((sum, r) => sum + Math.pow(r.tmax - meanTmax, 2), 0) / (n - 1)
  );
  const stdAUC = Math.sqrt(
    individualResults.reduce((sum, r) => sum + Math.pow(r.aucLast - meanAUC, 2), 0) / (n - 1)
  );
  const stdClearance = resultsWithClearance.length > 1
    ? Math.sqrt(
        resultsWithClearance.reduce((sum, r) => sum + Math.pow((r.clearance || 0) - meanClearance, 2), 0) / (resultsWithClearance.length - 1)
      )
    : 0;
  const stdVolumeDistribution = resultsWithVolume.length > 1
    ? Math.sqrt(
        resultsWithVolume.reduce((sum, r) => sum + Math.pow((r.volumeDistribution || 0) - meanVolumeDistribution, 2), 0) / (resultsWithVolume.length - 1)
      )
    : 0;

  // Calculate coefficients of variation (CV%)
  const cvCmax = (stdCmax / meanCmax) * 100;
  const cvTmax = (stdTmax / meanTmax) * 100;
  const cvAUC = (stdAUC / meanAUC) * 100;
  const cvClearance = meanClearance > 0 ? (stdClearance / meanClearance) * 100 : 0;
  const cvVolumeDistribution = meanVolumeDistribution > 0 ? (stdVolumeDistribution / meanVolumeDistribution) * 100 : 0;

  return {
    meanCmax,
    meanTmax,
    meanAUC,
    meanClearance,
    meanVolumeDistribution,
    stdCmax,
    stdTmax,
    stdAUC,
    stdClearance,
    stdVolumeDistribution,
    cvCmax,
    cvTmax,
    cvAUC,
    cvClearance,
    cvVolumeDistribution,
    nPatients: n
  };
}