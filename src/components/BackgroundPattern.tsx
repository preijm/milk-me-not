
import React from "react";

interface BackgroundPatternProps {
  children: React.ReactNode;
}

const BackgroundPattern = ({ children }: BackgroundPatternProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/5 to-white relative overflow-hidden">
      {/* Primary curved line */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwMCIgaGVpZ2h0PSIyMDAwIiB2aWV3Qm94PSIwIDAgMzAwMCAyMDAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0tNTAwIC0yMDBDMCAtMTAwIDUwMCAyMDAgMTAwMCA1MDBDMTUwMCA4MDAgMjAwMCAxMDAwIDI1MDAgMTIwMEMzMDAwIDE0MDAgMzUwMCAxNjAwIDQwMDAgMTgwMCIgc3Ryb2tlPSJ1cmwoI2dyYWRpZW50KSIgc3Ryb2tlLXdpZHRoPSIyIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzVFRjBFNiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBFQjVCNSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg==')] opacity-20" />
      
      {/* Secondary curved line */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwMCIgaGVpZ2h0PSIyMDAwIiB2aWV3Qm94PSIwIDAgMzAwMCAyMDAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0tMjAwIC0xMDBDMzAwIDAgODAwIDMwMCAxMzAwIDYwMEMxODAwIDkwMCAyMzAwIDExMDAgMjgwMCAxMzAwQzMzMDAgMTUwMCAzODAwIDE3MDAgNDMwMCAxOTAwIiBzdHJva2U9InVybCgjZ3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjIiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNUVGMEU2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMEVCNUI1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+')] opacity-15" />
      
      {/* Third curved line */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwMCIgaGVpZ2h0PSIyMDAwIiB2aWV3Qm94PSIwIDAgMzAwMCAyMDAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0tODAwIDEwMEMtMzAwIDIwMCAyMDAgNTAwIDcwMCA4MDBDMTI1MCAxMTAwIDE3MDAgMTMwMCAyMjAwIDE1MDBDM3MDAgMTcwMCAzMjAwIDE5MDAgMzcwMCAyMTAwIiBzdHJva2U9InVybCgjZ3JhZGllbnQpIiBzdHJva2Utd2lkdGg9IjIiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNUVGMEU2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMEVCNUI1Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PC9zdmc+')] opacity-10" />
      
      {/* Content */}
      {children}
    </div>
  );
};

export default BackgroundPattern;

