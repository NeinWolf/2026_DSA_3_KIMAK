import React from 'react';
import { Plus, FileText, BarChart3, Eye, Download, Trash2 } from 'lucide-react';
import { User, Report } from '../time-tracking-layout';

interface ReportsViewProps {
  currentUser: User;
  reports: Report[];
  openModal: (type: string, item?: any) => void;
  setEditingItem: (item: any) => void;
  setActiveModal: (type: any) => void;
  confirmDelete: (type: string, id: number, name: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentUser, reports, openModal, setEditingItem, setActiveModal, confirmDelete
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Raporty Systemowe</h1>
          <p className="text-slate-500 mt-1">Generuj i przegladaj raporty czasu pracy.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => openModal('generate-report')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Plus size={18} />
            Generuj raport
          </button>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText size={20} className="text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Raporty podsumowujace</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{reports.filter(r => r.type === 'summary').length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileText size={20} className="text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Raporty szczegolowe</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{reports.filter(r => r.type === 'detailed').length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <FileText size={20} className="text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Per projekt / zespol</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{reports.filter(r => r.type === 'by-project' || r.type === 'by-team').length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 size={20} className="text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Laczny czas</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">0h</div>
        </div>
      </div>

      {/* Reports list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Historia raportow</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {reports.map(report => (
            <div key={report.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  report.type === 'summary' ? 'bg-blue-100' : 
                  report.type === 'detailed' ? 'bg-emerald-100' : 'bg-amber-100'
                }`}>
                  <FileText size={20} className={
                    report.type === 'summary' ? 'text-blue-600' : 
                    report.type === 'detailed' ? 'text-emerald-600' : 'text-amber-600'
                  } />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">{report.name}</h4>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span>{report.dateRange}</span>
                    <span>|</span>
                    <span>Wygenerowano: {report.generatedAt}</span>
                    <span>|</span>
                    <span>Przez: {report.generatedBy}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setEditingItem(report); setActiveModal('view-report'); }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Eye size={16} />
                  Podglad
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Download size={16} />
                  Pobierz
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => confirmDelete('report', report.id, report.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
