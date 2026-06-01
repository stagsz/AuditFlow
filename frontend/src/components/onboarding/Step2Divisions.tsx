'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { X } from 'lucide-react';

export default function Step2Divisions() {
  const { divisions, addDivision, removeDivision, setStep } = useOnboardingStore();
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const name = inputValue.trim();
    if (!name) return;
    addDivision(name);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Add the divisions (business units) in your company. You can skip this step.
      </p>

      <div className="flex gap-2">
        <Input
          id="division-input"
          placeholder="Division name"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" variant="outline" onClick={handleAdd}>
          Add
        </Button>
      </div>

      {divisions.length > 0 && (
        <ul className="space-y-2">
          {divisions.map((d) => (
            <li key={d.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-800">{d.name}</span>
              <button
                type="button"
                onClick={() => removeDivision(d.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label={`Remove ${d.name}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(3)}>
          Skip
        </Button>
        <Button type="button" className="flex-1" onClick={() => setStep(3)}>
          Continue
        </Button>
      </div>
    </div>
  );
}
