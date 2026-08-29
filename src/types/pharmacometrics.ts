export interface DataPoint {
  id: string;
  patientId: string;
  treatment?: string;
  time: number; // Internal field for TIME
  concentration: number; // Internal field for DV
}

export interface NCAParameters {
  patientId: string;
  cmax: number;
  tmax: number;
  aucLast: number;
  aucInf?: number;
  halfLife?: number;
  clearance?: number;
  volumeDistribution?: number;
  meanResidenceTime?: number;
}

export interface PopulationSummary {
  meanCmax: number;
  meanTmax: number;
  meanAUC: number;
  meanClearance: number;
  meanVolumeDistribution: number;
  stdCmax: number;
  stdTmax: number;
  stdAUC: number;
  stdClearance: number;
  stdVolumeDistribution: number;
  cvCmax: number;
  cvTmax: number;
  cvAUC: number;
  cvClearance: number;
  cvVolumeDistribution: number;
  nPatients: number;
}

export interface CalculationResults {
  individualResults: NCAParameters[];
  populationSummary: PopulationSummary;
  treatmentSummary?: Record<string, PopulationSummary>;
}

export interface Units {
  time: string;
  concentration: string;
}

export interface TimeRange {
  min: number;
  max: number;
}