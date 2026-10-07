import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useDhikrProgress } from '../context/DhikrProgressContext';

export const DhikrTracker: React.FC = () => {
  const { dhikrItems, incrementDhikr, resetDhikr } = useDhikrProgress();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-50">Daily Dhikr Tracker</h2>
      <div className="grid gap-4">
        {dhikrItems.map((item) => (
          <div key={item.id} className="p-4 rounded-2xl bg-[#fcfaf6] dark:bg-[#0c1412] border border-emerald-900/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-50">{item.name}</p>
              <p className="text-sm text-stone-500">{item.count} / {item.target}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => resetDhikr(item.id)} className="p-2 text-stone-400 hover:text-red-500"><RefreshCw className="w-5 h-5" /></button>
              <button 
                onClick={() => incrementDhikr(item.id)}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${item.count >= item.target ? 'bg-emerald-500 text-white' : 'bg-emerald-800 text-amber-200'}`}
              >
                {item.count >= item.target ? 'Done' : 'Tap'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
