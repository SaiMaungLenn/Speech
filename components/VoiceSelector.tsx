import React from 'react';
import { VoiceOption, VOICE_OPTIONS, VoiceName } from '../types';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelect: (voice: VoiceName) => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onSelect, disabled }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {VOICE_OPTIONS.map((option) => {
        const isSelected = selectedVoice === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className={`
              relative flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left
              ${isSelected 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center justify-between w-full mb-2">
                <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                    {option.label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                    option.gender === 'Female' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                    {option.gender}
                </span>
            </div>
            <p className={`text-xs ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};
