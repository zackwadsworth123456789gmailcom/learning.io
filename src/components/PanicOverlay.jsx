import React, { useEffect } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

export const PanicOverlay = ({
  isActive,
  onDeactivate,
}) => {
  useEffect(() => {
    if (!isActive) return;

    // Change title and favicon temporarily for disguise
    const originalTitle = document.title;
    document.title = 'Google Docs - World History Notes';

    const handleKeyDown = (e) => {
      // Pressing grave ` or Esc exits stealth
      if (e.key === '`' || e.key === 'Escape') {
        onDeactivate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.title = originalTitle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onDeactivate]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-slate-900 font-sans">
      {/* Fake Google Docs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2 bg-[#f9fbfd]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-800">
              World History - Chapter 8 Study Guide & Notes
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>File</span>
              <span>Edit</span>
              <span>View</span>
              <span>Insert</span>
              <span>Format</span>
              <span>Tools</span>
            </div>
          </div>
        </div>

        <button
          onClick={onDeactivate}
          className="flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
          title="Return to Unblocked Games (or press Escape)"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit Stealth Mode (Esc)</span>
        </button>
      </div>

      {/* Document content */}
      <div className="flex-1 overflow-auto bg-[#f1f3f4] p-8 flex justify-center">
        <div className="w-full max-w-3xl min-h-[800px] bg-white shadow-md rounded-xs p-12 text-slate-800 text-sm leading-relaxed space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 border-b pb-2">
            Chapter 8: The Agricultural Revolution & Trade Routes
          </h1>
          <p className="font-semibold text-slate-700">Section 1: Early Settlements and Irrigation Systems</p>
          <p>
            The transition from foraging to sedentary farming marked one of the most substantial transformations in early human civil society.
            Fertile river valleys provided regular alluvial silt replenishment, encouraging cooperative water-management networks.
          </p>
          <h2 className="text-lg font-bold text-slate-900 pt-2">Key Vocabulary Terms:</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Alluvial Basin:</strong> Landform created by deposition of sediment over a long period.</li>
            <li><strong>Hydraulic Engineering:</strong> Construction of canals and dykes to redirect river flow.</li>
            <li><strong>Barter Network:</strong> Non-monetary exchange systems prior to standardized coinage.</li>
          </ul>
          <p className="text-slate-600 text-xs italic pt-4">
            (Press Esc or click top right button to return to Unblocked Games)
          </p>
        </div>
      </div>
    </div>
  );
};
