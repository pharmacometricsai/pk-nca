import { DataPoint } from '../types/pharmacometrics';

export function generateSampleData(): DataPoint[] {
  const sampleData: DataPoint[] = [
    // Patient 001 - Typical absorption profile
    { id: '1', patientId: '001', treatment: 'A', time: 0, concentration: 0 },
    { id: '2', patientId: '001', treatment: 'A', time: 0.5, concentration: 45.2 },
    { id: '3', patientId: '001', treatment: 'A', time: 1, concentration: 89.5 },
    { id: '4', patientId: '001', treatment: 'A', time: 2, concentration: 125.8 },
    { id: '5', patientId: '001', treatment: 'A', time: 4, concentration: 98.3 },
    { id: '6', patientId: '001', treatment: 'A', time: 6, concentration: 76.1 },
    { id: '7', patientId: '001', treatment: 'A', time: 8, concentration: 58.9 },
    { id: '8', patientId: '001', treatment: 'A', time: 12, concentration: 35.2 },
    { id: '9', patientId: '001', treatment: 'A', time: 24, concentration: 8.7 },

    // Patient 002 - Higher Cmax, faster absorption
    { id: '10', patientId: '002', treatment: 'A', time: 0, concentration: 0 },
    { id: '11', patientId: '002', treatment: 'A', time: 0.5, concentration: 62.1 },
    { id: '12', patientId: '002', treatment: 'A', time: 1, concentration: 142.3 },
    { id: '13', patientId: '002', treatment: 'A', time: 2, concentration: 156.7 },
    { id: '14', patientId: '002', treatment: 'A', time: 4, concentration: 118.9 },
    { id: '15', patientId: '002', treatment: 'A', time: 6, concentration: 89.4 },
    { id: '16', patientId: '002', treatment: 'A', time: 8, concentration: 67.2 },
    { id: '17', patientId: '002', treatment: 'A', time: 12, concentration: 38.5 },
    { id: '18', patientId: '002', treatment: 'A', time: 24, concentration: 9.8 },

    // Patient 003 - Slower absorption, lower Cmax
    { id: '19', patientId: '003', treatment: 'B', time: 0, concentration: 0 },
    { id: '20', patientId: '003', treatment: 'B', time: 0.5, concentration: 28.4 },
    { id: '21', patientId: '003', treatment: 'B', time: 1, concentration: 52.1 },
    { id: '22', patientId: '003', treatment: 'B', time: 2, concentration: 78.9 },
    { id: '23', patientId: '003', treatment: 'B', time: 4, concentration: 95.2 },
    { id: '24', patientId: '003', treatment: 'B', time: 6, concentration: 82.6 },
    { id: '25', patientId: '003', treatment: 'B', time: 8, concentration: 68.7 },
    { id: '26', patientId: '003', treatment: 'B', time: 12, concentration: 45.3 },
    { id: '27', patientId: '003', treatment: 'B', time: 24, concentration: 12.1 },

    // Patient 004 - Delayed Tmax
    { id: '28', patientId: '004', treatment: 'B', time: 0, concentration: 0 },
    { id: '29', patientId: '004', treatment: 'B', time: 0.5, concentration: 18.7 },
    { id: '30', patientId: '004', treatment: 'B', time: 1, concentration: 41.2 },
    { id: '31', patientId: '004', treatment: 'B', time: 2, concentration: 67.8 },
    { id: '32', patientId: '004', treatment: 'B', time: 4, concentration: 108.4 },
    { id: '33', patientId: '004', treatment: 'B', time: 6, concentration: 134.6 },
    { id: '34', patientId: '004', treatment: 'B', time: 8, concentration: 119.3 },
    { id: '35', patientId: '004', treatment: 'B', time: 12, concentration: 78.9 },
    { id: '36', patientId: '004', treatment: 'B', time: 24, concentration: 18.4 },

    // Patient 005 - Rapid elimination
    { id: '37', patientId: '005', treatment: 'A', time: 0, concentration: 0 },
    { id: '38', patientId: '005', treatment: 'A', time: 0.5, concentration: 55.8 },
    { id: '39', patientId: '005', treatment: 'A', time: 1, concentration: 118.7 },
    { id: '40', patientId: '005', treatment: 'A', time: 2, concentration: 132.4 },
    { id: '41', patientId: '005', treatment: 'A', time: 4, concentration: 87.6 },
    { id: '42', patientId: '005', treatment: 'A', time: 6, concentration: 58.2 },
    { id: '43', patientId: '005', treatment: 'A', time: 8, concentration: 38.7 },
    { id: '44', patientId: '005', treatment: 'A', time: 12, concentration: 17.3 },
    { id: '45', patientId: '005', treatment: 'A', time: 24, concentration: 2.1 },
  ];

  return sampleData;
}