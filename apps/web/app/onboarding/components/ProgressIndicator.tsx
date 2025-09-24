import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  stepLabels = [] 
}: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Progress circles and lines */}
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          
          return (
            <React.Fragment key={stepNumber}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                isCompleted
                  ? 'bg-primary text-primary-foreground'
                  : isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {stepNumber}
              </div>
              
              {stepNumber < totalSteps && (
                <div className={`flex-1 h-1 mx-4 transition-all ${
                  stepNumber < currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Step labels */}
      {stepLabels.length === totalSteps && (
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          {stepLabels.map((label, index) => (
            <span key={index} className={currentStep === index + 1 ? 'text-foreground font-medium' : ''}>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
