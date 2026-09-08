import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className="w-full overflow-x-auto border border-zinc-200 rounded-lg bg-white shadow-2xs">
    <table className={`w-full text-left text-xs border-collapse ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '' }) => (
  <thead className={`border-b border-zinc-200 bg-zinc-50/75 ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-zinc-200 ${className}`}>{children}</tbody>
);

export const TableRow = ({ children, className = '', hover = true, onClick }) => (
  <tr
    onClick={onClick}
    className={`${hover ? 'hover:bg-zinc-50/75 transition-colors' : ''} ${
      onClick ? 'cursor-pointer' : ''
    } ${className}`}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th
    className={`py-3 px-4 text-2xs font-semibold text-zinc-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`py-3 px-4 text-zinc-800 ${className}`}>{children}</td>
);

export default Table;
