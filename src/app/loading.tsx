export default function RootLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-cream">
      <div className="flex flex-col items-center gap-4">
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-2xl bg-navy flex items-center justify-center">
          <span className="text-3xl font-extrabold text-cream">F</span>
        </div>
        {/* Subtle pulse */}
        <div className="flex gap-1.5 mt-2">
          <span className="w-2 h-2 rounded-full bg-coral/40 typing-dot" />
          <span className="w-2 h-2 rounded-full bg-coral/40 typing-dot" />
          <span className="w-2 h-2 rounded-full bg-coral/40 typing-dot" />
        </div>
      </div>
    </div>
  );
}
