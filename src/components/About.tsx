import React from 'react';
import { X, Calculator, TrendingUp, Activity, BarChart3, FileText, Users, Clock, Zap } from 'lucide-react';

interface AboutProps {
  onClose: () => void;
}

const About: React.FC<AboutProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">About Compute Non-Compartmental Analysis</h2>
              <p className="text-sm text-slate-600">Non-Compartmental Analysis Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Overview */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Overview</span>
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Compute Non-Compartmental Analysis is a professional-grade web application for performing Non-Compartmental Analysis (NCA) 
              of pharmacokinetic data. It provides comprehensive analysis of concentration-time profiles, calculating key 
              pharmacokinetic parameters essential for drug development and regulatory submissions.
            </p>
          </section>

          {/* How to Use */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>How to Use</span>
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">1. Data Input</h4>
                <ul className="text-slate-700 space-y-1 text-sm">
                  <li>• Enter data manually using the table interface</li>
                  <li>• Upload CSV files with columns: ID, TIME, DV</li>
                  <li>• Configure units using the settings button (⚙️)</li>
                  <li>• Add or remove rows as needed</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">2. Analysis</h4>
                <ul className="text-slate-700 space-y-1 text-sm">
                  <li>• Click "Calculate NCA Parameters" to perform analysis</li>
                  <li>• View population summary statistics</li>
                  <li>• Review individual patient results</li>
                  <li>• Examine concentration-time plots</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">3. Export Results</h4>
                <ul className="text-slate-700 space-y-1 text-sm">
                  <li>• Download results as CSV, R code, or Python scripts</li>
                  <li>• Export plots as ZIP archive with multiple formats</li>
                  <li>• Generate comprehensive text reports</li>
                </ul>
              </div>
            </div>
          </section>

          {/* NCA Parameters */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>NCA Parameters Calculated</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Primary Parameters</span>
                </h4>
                <ul className="text-blue-700 space-y-2 text-sm">
                  <li><strong>Cmax:</strong> Maximum observed concentration</li>
                  <li><strong>Tmax:</strong> Time to reach maximum concentration</li>
                  <li><strong>AUC₀₋ₜ:</strong> Area under curve to last measurable concentration</li>
                  <li><strong>AUC₀₋∞:</strong> Area under curve extrapolated to infinity</li>
                </ul>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-2 flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Secondary Parameters</span>
                </h4>
                <ul className="text-emerald-700 space-y-2 text-sm">
                  <li><strong>t½:</strong> Terminal elimination half-life</li>
                  <li><strong>CL/F:</strong> Apparent total clearance</li>
                  <li><strong>Vd/F:</strong> Apparent volume of distribution</li>
                  <li><strong>λz:</strong> Terminal elimination rate constant</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Calculation Methods */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <span>Calculation Methods</span>
            </h3>
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">AUC Calculation (Trapezoidal Rule)</h4>
                <p className="text-orange-700 text-sm mb-2">
                  AUC₀₋ₜ = Σ [(Cᵢ + Cᵢ₊₁) × (tᵢ₊₁ - tᵢ)] / 2
                </p>
                <p className="text-orange-600 text-xs">
                  Linear trapezoidal rule applied between consecutive time points
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Terminal Half-Life</h4>
                <p className="text-purple-700 text-sm mb-2">
                  t½ = ln(2) / λz, where λz is determined by linear regression of log(concentration) vs time
                </p>
                <p className="text-purple-600 text-xs">
                  Uses last 3-4 data points in the terminal elimination phase
                </p>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-2">Clearance and Volume</h4>
                <p className="text-indigo-700 text-sm mb-2">
                  CL/F = Dose / AUC₀₋∞<br/>
                  Vd/F = CL/F / λz
                </p>
                <p className="text-indigo-600 text-xs">
                  Assumes 100mg dose for demonstration purposes
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-slate-600" />
              <span>Key Features</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-slate-700 space-y-2 text-sm">
                <li>• Interactive data input with validation</li>
                <li>• CSV file upload support</li>
                <li>• Configurable time and concentration units</li>
                <li>• Real-time calculation updates</li>
              </ul>
              <ul className="text-slate-700 space-y-2 text-sm">
                <li>• Population summary statistics</li>
                <li>• Individual patient results</li>
                <li>• Linear and semi-logarithmic plots</li>
                <li>• Multiple export formats (CSV, R, Python)</li>
              </ul>
            </div>
          </section>

          {/* Technical Notes */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Technical Notes</h3>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <ul className="text-yellow-800 space-y-1 text-sm">
                <li>• Calculations follow FDA and EMA guidelines for bioequivalence studies</li>
                <li>• Terminal elimination phase identified using last 3-4 data points</li>
                <li>• Population statistics include mean, standard deviation, and coefficient of variation</li>
                <li>• All calculations performed in real-time using validated algorithms</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Built with React, TypeScript, and Tailwind CSS
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;