
import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { PetriDish } from './components/PetriDish';
import { SimulationConfig, SimulationStats, Gender } from './types';
import { DEFAULT_CONFIG } from './constants';

const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [shouldReset, setShouldReset] = useState<boolean>(false);
  
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  
  const [stats, setStats] = useState<SimulationStats>({
    population: DEFAULT_CONFIG.initialPopulation,
    males: 0,
    females: 0,
    maxPopulationReached: DEFAULT_CONFIG.initialPopulation
  });

  const handleStatsUpdate = useCallback((newStats: SimulationStats) => {
    setStats(prev => ({
      ...newStats,
      maxPopulationReached: Math.max(prev.maxPopulationReached, newStats.population)
    }));
  }, []);

  const handleConfigChange = (key: keyof SimulationConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setIsRunning(false);
    setShouldReset(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
         <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-green-900/20 blur-[120px]" />
      </div>

      <ControlPanel
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(!isRunning)}
        onReset={handleReset}
        config={config}
        onConfigChange={handleConfigChange}
        stats={stats}
      />

      <div className="relative z-0 flex items-center justify-center p-4">
        <PetriDish
          isRunning={isRunning}
          config={config}
          shouldReset={shouldReset}
          onResetComplete={() => setShouldReset(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      </div>
      
      {/* Info Overlay for Mobile mainly, or general status */}
      <div className="absolute bottom-4 right-4 text-slate-600 text-xs font-mono pointer-events-none select-none">
        CANVAS: 800x800 | RENDER: 2D CONTEXT
      </div>
    </div>
  );
};

export default App;
