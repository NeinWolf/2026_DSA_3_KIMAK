import React from 'react';
import { Project, User } from '../time-tracking-layout';

interface GenerateReportModalProps {
  formData: any;
  setFormData: (data: any) => void;
  formErrors: any;
  visibleProjects: Project[];
  users: User[];
  closeModal: () => void;
  handleGenerateReport: () => void;
}

export const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  formData, setFormData, formErrors, visibleProjects, users,
  closeModal, handleGenerateReport
}) => {
  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Generuj raport</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Typ raportu</label>
          <select 
            value={formData.type || 'summary'}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="summary">Podsumowanie</option>
            <option value="detailed">Szczegolowy</option>
            <option value="by-project">Per Projekt</option>
            <option value="by-team">Per Zespol</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data od *</label>
            <input 
              type="date"
              value={formData.dateFrom || ''}
              onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                formErrors.dateFrom ? 'border-rose-500' : 'border-slate-200'
              }`}
            />
            {formErrors.dateFrom && <p className="text-rose-500 text-xs mt-1">{formErrors.dateFrom}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data do *</label>
            <input 
              type="date"
              value={formData.dateTo || ''}
              onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                formErrors.dateTo ? 'border-rose-500' : 'border-slate-200'
              }`}
            />
            {formErrors.dateTo && <p className="text-rose-500 text-xs mt-1">{formErrors.dateTo}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Projekty</label>
          <select 
            value={formData.includeProjects || 'all'}
            onChange={(e) => setFormData({ ...formData, includeProjects: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Wszystkie projekty</option>
            {visibleProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Uzytkownicy</label>
          <select 
            value={formData.includeUsers || 'all'}
            onChange={(e) => setFormData({ ...formData, includeUsers: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Wszyscy uzytkownicy</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button 
          onClick={closeModal}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Anuluj
        </button>
        <button 
          onClick={handleGenerateReport}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Generuj raport
        </button>
      </div>
    </>
  );
};
