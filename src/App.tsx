import { Film, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from './hooks/useTheme';

function App() {
  const { mode, preset, toggleMode, setPreset } = useTheme();

  return (
    <div className="min-h-screen bg-clay-base text-clay-text p-8 flex flex-col items-center justify-center gap-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex flex-col items-center gap-6"
      >
        <Film className="w-16 h-16 text-accent" strokeWidth={1.5} />
        <h1 className="font-heading text-4xl text-center">
          Which Movie To Watch
        </h1>
        <p className="font-body text-lg text-clay-text-muted text-center">
          Theme System Active
        </p>

        {/* Theme test controls -- temporary, replaced by RotaryDial in Plan 05 */}
        <div className="bg-clay-surface rounded-clay p-6 shadow-lg max-w-md w-full flex flex-col gap-4">
          <p className="font-body text-xs text-clay-text-muted text-center uppercase tracking-wider">
            Theme Controls (dev)
          </p>

          <div className="flex justify-center">
            <button
              onClick={toggleMode}
              className="flex items-center gap-2 px-4 py-2 rounded-clay bg-clay-elevated text-clay-text font-body text-sm hover:bg-accent hover:text-clay-base transition-colors"
            >
              {mode === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {mode === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => setPreset('cinema-gold')}
              className={`px-3 py-1.5 rounded-clay font-body text-xs transition-colors ${
                preset === 'cinema-gold'
                  ? 'bg-accent text-clay-base'
                  : 'bg-clay-elevated text-clay-text hover:bg-clay-highlight'
              }`}
            >
              Cinema Gold
            </button>
            <button
              onClick={() => setPreset('ocean-blue')}
              className={`px-3 py-1.5 rounded-clay font-body text-xs transition-colors ${
                preset === 'ocean-blue'
                  ? 'bg-accent text-clay-base'
                  : 'bg-clay-elevated text-clay-text hover:bg-clay-highlight'
              }`}
            >
              Ocean Blue
            </button>
            <button
              onClick={() => setPreset('neon-purple')}
              className={`px-3 py-1.5 rounded-clay font-body text-xs transition-colors ${
                preset === 'neon-purple'
                  ? 'bg-accent text-clay-base'
                  : 'bg-clay-elevated text-clay-text hover:bg-clay-highlight'
              }`}
            >
              Neon Purple
            </button>
          </div>

          <p className="font-body text-xs text-clay-text-muted text-center">
            {preset} / {mode}
          </p>
        </div>

        <div className="bg-clay-surface rounded-clay p-6 shadow-lg max-w-md w-full text-center">
          <p className="font-body text-sm text-clay-text-muted">
            React 19 + Vite 6 + TypeScript + Tailwind CSS v4
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
