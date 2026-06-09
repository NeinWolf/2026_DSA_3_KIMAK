import React from 'react';
import { Download } from 'lucide-react';
import { Project } from '../time-tracking-layout';

interface ViewReportModalProps {
  editingItem: any;
  visibleProjects: Project[];
  closeModal: () => void;
}

export const ViewReportModal: React.FC<ViewReportModalProps> = ({
  editingItem, visibleProjects, closeModal
}) => {
  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-6">{editingItem?.name}</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Zakres dat</p>
            <p className="font-medium text-slate-900">{editingItem?.dateRange}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Wygenerowano</p>
            <p className="font-medium text-slate-900">{editingItem?.generatedAt}</p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[50vh] overflow-y-auto relative">
          {editingItem?.type === 'summary' && (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Pracownik</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Laczny czas (h)</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Ilosc wpisow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editingItem?.data?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">{row.username}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">{row.totalHours}h</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{row.totalEntries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {editingItem?.type === 'detailed' && (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Data</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Pracownik</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Projekt</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Zadanie</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Czas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editingItem?.data?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{row.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{row.username}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.projectName}</td>
                    <td className="px-4 py-3 min-w-[200px]">{row.taskName}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {editingItem?.type === 'by-project' && (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Projekt</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Laczny czas (h)</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Ilosc pracownikow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editingItem?.data?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{row.projectName}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">{row.totalHours}h</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{row.employeeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {editingItem?.type === 'by-team' && (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Zespol</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Laczny czas (h)</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Czlonkowie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editingItem?.data?.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-medium">{row.teamName}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">{row.totalHours}h</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{row.memberCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {(!editingItem?.data || editingItem?.data.length === 0) && (
            <div className="p-8 text-center text-slate-400">Brak danych dla wybranego raportu</div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button 
          onClick={closeModal}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Zamknij
        </button>
        <button 
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <Download size={16} />
          Pobierz PDF
        </button>
      </div>
    </>
  );
};
