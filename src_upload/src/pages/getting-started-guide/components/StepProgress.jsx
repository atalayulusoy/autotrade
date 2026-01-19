import React from 'react';
import Icon from '../../../components/AppIcon';

const StepProgress = ({ steps, currentStep, completedSteps, onStepClick }) => {
  const getStepStatus = (stepId) => {
    if (completedSteps?.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-slate-700/50">
      <div className="flex items-center justify-between">
        {steps?.map((step, index) => {
          const status = getStepStatus(step?.id);
          const isClickable = completedSteps?.includes(step?.id) || step?.id === currentStep;

          return (
            <React.Fragment key={step?.id}>
              <button
                onClick={() => isClickable && onStepClick(step?.id)}
                disabled={!isClickable}
                className={`flex flex-col items-center gap-2 flex-1 transition-all ${
                  isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'
                }`}
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 transition-all ${
                  status === 'completed' ? 'bg-green-600 border-green-500' :
                  status === 'current'? 'bg-blue-600 border-blue-500 ring-4 ring-blue-500/30' : 'bg-slate-700 border-slate-600'
                }`}>
                  {status === 'completed' ? (
                    <Icon name="CheckCircle" size={24} className="text-white" />
                  ) : (
                    <Icon name={step?.icon} size={24} className="text-white" />
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-xs md:text-sm font-semibold ${
                    status === 'completed' || status === 'current' ? 'text-white' : 'text-slate-500'
                  }`}>
                    {step?.title}
                  </p>
                  <p className="text-xs text-slate-400 hidden md:block">{step?.description}</p>
                </div>
              </button>
              {index < steps?.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 transition-all ${
                  completedSteps?.includes(step?.id) ? 'bg-green-500' : 'bg-slate-700'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Progress Percentage */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">İlerleme</span>
          <span className="text-sm font-semibold text-white">
            {Math.round((completedSteps?.length / steps?.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps?.length / steps?.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StepProgress;