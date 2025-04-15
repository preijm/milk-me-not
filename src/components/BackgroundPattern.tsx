
import React from "react";

interface BackgroundPatternProps {
  children: React.ReactNode;
}

const BackgroundPattern = ({ children }: BackgroundPatternProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-blue-50/80 to-emerald-50/80 relative overflow-hidden">
      {/* Primary wave pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwMCIgaGVpZ2h0PSI1MDAiIHZpZXdCb3g9IjAgMCAyMDAwIDUwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNLTUwMCAyNDEuNDM3QzAtMTAwIDUwMCAwIDEwMDAgMTAwQzE1MDAgMjAwIDIwMDAgMzAwIDI1MDAgMjAwIiBzdHJva2U9InVybCgjZ3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjIiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAwQkY2MyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzA2QjZENCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==')] opacity-40 animate-[wave_10s_ease-in-out_infinite] will-change-transform" />
      
      {/* Secondary wave pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwMCIgaGVpZ2h0PSI1MDAiIHZpZXdCb3g9IjAgMCAyMDAwIDUwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNLTUwMCAyNDEuNDM3QzAtMTAwIDUwMCAwIDEwMDAgMTAwQzE1MDAgMjAwIDIwMDAgMzAwIDI1MDAgMjAwIiBzdHJva2U9InVybCgjZ3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjIiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzM0RDM5OSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBFQjVCNSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==')] opacity-30 animate-[wave_15s_ease-in-out_infinite_reverse] will-change-transform scale-110" />
      
      {/* Overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/10 backdrop-blur-[1px] animate-pulse" />
      
      {/* Content */}
      {children}
    </div>
  );
};

export default BackgroundPattern;
