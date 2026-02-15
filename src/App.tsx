import { Film } from 'lucide-react';
import { motion } from 'motion/react';

function App() {
  return (
    <div className="min-h-screen bg-clay-base text-clay-text p-8 flex flex-col items-center justify-center gap-6">
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
          Foundation ready
        </p>
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
