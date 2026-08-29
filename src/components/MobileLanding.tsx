import React from 'react';
import { Monitor, Calculator, BarChart3, FileText, Download, Smartphone, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const MobileLanding: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const currentUrl = window.location.href;

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
            <div className="flex justify-end mb-2">
              <button
                onClick={toggleTheme}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-200"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex justify-end mb-2">
              <button
                onClick={toggleTheme}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors duration-200"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Calculator className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Compute Non-Compartmental Analysis</h1>
            <p className="text-blue-100 text-sm">Non-Compartmental Analysis Platform</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Desktop Required Message */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
                  <Monitor className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Desktop Required</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                This professional pharmacokinetic analysis tool requires a desktop or laptop computer 
                for optimal functionality and data visualization.
              </p>
            </div>

            {/* Features Preview */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Available on Desktop:</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300">
                  <BarChart3 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Interactive concentration-time plots</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300">
                  <FileText className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Comprehensive NCA parameter calculations</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300">
                  <Download className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span>CSV import/export and report generation</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-slate-300">
                  <Calculator className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <span>Population summary statistics</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">How to Access:</h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>Open this URL on a desktop or laptop computer</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>Use a screen width of at least 1024px for best experience</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>Begin your pharmacokinetic analysis</span>
                </div>
              </div>
            </div>

            {/* URL Display */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Current URL:</h3>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <code className="text-xs text-slate-700 dark:text-slate-300 break-all flex-1 mr-2">{currentUrl}</code>
                  <button
                    onClick={copyUrl}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-medium rounded transition-colors duration-200 flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center pt-2">
              <div className="inline-flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                <Smartphone className="h-4 w-4" />
                <ArrowRight className="h-4 w-4" />
                <Monitor className="h-4 w-4" />
                <span>Switch to Desktop</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Built with React, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLanding;