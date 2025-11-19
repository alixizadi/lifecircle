
import React from 'react';
import { SimulationConfig, SimulationStats } from '../types';
import { Play, Pause, RotateCcw, Settings2 } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  config: SimulationConfig;
  onConfigChange: (key: keyof SimulationConfig, value: number) => void;
  stats: SimulationStats;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  onTogglePlay,
  onReset,
  config,
  onConfigChange,
  stats,
}) => {
  return (
    <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-2xl w-80 text-slate-200 z-10 max-h-[90vh] overflow-y-auto transition-all duration-300 hover:border-slate-600">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-red-400">
          Life Cycle
        </h1>
        <Settings2 className="w-5 h-5 text-slate-400" />
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-2 mb-6 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
        <div className="text-center">
          <div className="text-xs text-slate-400 uppercase tracking-wider">Pop</div>
          <div className="text-lg font-bold text-white">{stats.population}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-blue-400 uppercase tracking-wider">Blue</div>
          <div className="text-lg font-bold text-blue-400">{stats.males}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-red-400 uppercase tracking-wider">Red</div>
          <div className="text-lg font-bold text-red-400">{stats.females}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={onTogglePlay}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            isRunning
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/50 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/20'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Start
            </>
          )}
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-300">Reproduction Chance</label>
            <span className="text-xs text-slate-400">{(config.breedChance * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.breedChance}
            onChange={(e) => onConfigChange('breedChance', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-300">Initial Population</label>
            <span className="text-xs text-slate-400">{config.initialPopulation}</span>
          </div>
          <input
            type="range"
            min="2"
            max="100"
            step="1"
            value={config.initialPopulation}
            onChange={(e) => onConfigChange('initialPopulation', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-300">Max Capacity</label>
            <span className="text-xs text-slate-400">{config.maxPopulation}</span>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            step="10"
            value={config.maxPopulation}
            onChange={(e) => onConfigChange('maxPopulation', parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>
        
         <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-300">Simulation Speed</label>
            <span className="text-xs text-slate-400">{config.ballSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={config.ballSpeed}
            onChange={(e) => onConfigChange('ballSpeed', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>
      
      <div className="mt-6 text-[10px] text-slate-500 text-center leading-relaxed">
        Blue (Male) & Red (Female). <br/>
        Balls die after 1 min. Same colors fight. <br/>
        10% chance for twins!
      </div>
    </div>
  );
};
