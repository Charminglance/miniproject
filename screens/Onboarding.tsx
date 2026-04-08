
import React, { useState } from 'react';
import { useApp } from '../App';
import { AppScreen } from '../types';
import { ONBOARDING_SLIDES } from '../constants';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const { setScreen } = useApp();

  const nextStep = () => {
    if (step < ONBOARDING_SLIDES.length - 1) {
      setStep(step + 1);
    } else {
      setScreen(AppScreen.AUTH);
    }
  };

  const slide = ONBOARDING_SLIDES[step];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 relative overflow-hidden rounded-b-[4rem]">
        <img 
          src={slide.image} 
          className="w-full h-full object-cover transition-all duration-500" 
          alt="onboarding" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
      </div>
      <div className="px-8 py-10 text-center flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 leading-tight">{slide.title}</h1>
        <p className="text-gray-500 mb-8 text-sm">
          {slide.description}
        </p>
        
        <div className="flex gap-2 mb-10">
          {ONBOARDING_SLIDES.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-green-500' : 'w-1.5 bg-gray-200'}`} 
            />
          ))}
        </div>

        <button 
          onClick={nextStep}
          className="w-full bg-green-500 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-green-200 hover:bg-green-600 active:scale-95 transition-all"
        >
          {step === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
        </button>
        
        <button 
          onClick={() => setScreen(AppScreen.AUTH)}
          className="mt-4 text-gray-400 font-medium text-sm"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
