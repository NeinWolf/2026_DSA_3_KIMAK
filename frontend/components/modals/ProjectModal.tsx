import React from 'react';
import { AlertCircle, X, Loader2 } from 'lucide-react';

interface ProjectModalProps {
  editingItem: any;
  apiError: string | null;
  setApiError: (error: string | null) => void;
  formData: any;
  setFormData: (data: any) => void;
  formErrors: any;
  apiLoading: boolean;
  closeModal: () => void;
  handleSaveProject: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  editingItem, apiError, setApiError, formData, setFormData,
  formErrors, apiLoading, closeModal, handleSaveProject
}) => {
  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        {editingItem ? 'Edytuj projekt' : 'Nowy projekt'}
      </h2>

      {/* API Error Alert */}
      {apiError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
          <p className="text-sm text-rose-700">{apiError}</p>
          <button onClick={() => setApiError(null)} className="ml-auto p-1 hover:bg-rose-100 rounded">
            <X size={14} className="text-rose-500" />
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa projektu *</label>
          <input 
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              formErrors.name ? 'border-rose-500' : 'border-slate-200'
            }`}
            placeholder="Nazwa projektu"
            disabled={apiLoading}
          />
          {formErrors.name && <p className="text-rose-500 text-xs mt-1">{formErrors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Opis / Klient</label>
          <input 
            type="text"
            value={formData.client || formData.description || ''}
            onChange={(e) => setFormData({ ...formData, client: e.target.value, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Opis lub nazwa klienta"
            disabled={apiLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data rozpoczecia</label>
            <input 
              type="date"
              value={formData.startDate || ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={apiLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data zakonczenia</label>
            <input 
              type="date"
              value={formData.endDate || ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                formData.startDate && formData.endDate && formData.endDate < formData.startDate 
                  ? 'border-rose-500' 
                  : 'border-slate-200'
              }`}
              disabled={apiLoading}
            />
            {formData.startDate && formData.endDate && formData.endDate < formData.startDate && (
              <p className="text-rose-500 text-xs mt-1">Data zakonczenia musi byc po dacie rozpoczecia</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kolor projektu</label>
          <div className="flex gap-2">
            {['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'].map(color => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-full ${color} ${formData.color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                disabled={apiLoading}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Planowane godziny</label>
          <input 
            type="number"
            value={formData.totalHours || 40}
            onChange={(e) => setFormData({ ...formData, totalHours: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="1"
            disabled={apiLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select 
            value={formData.status || 'active'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={apiLoading}
          >
            <option value="active">Aktywny (IN_PROGRESS)</option>
            <option value="on-hold">Wstrzymany (ON_HOLD)</option>
            <option value="completed">Ukonczony (COMPLETED)</option>
          </select>
        </div>
      </div>

      {/* API Info */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500">
          <span className="font-medium">Endpoint:</span> {editingItem ? `PUT /api/projects/${editingItem.id}` : 'POST /api/projects'}
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button 
          onClick={closeModal}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          disabled={apiLoading}
        >
          Anuluj
        </button>
        <button 
          onClick={handleSaveProject}
          disabled={apiLoading || (formData.startDate && formData.endDate && formData.endDate < formData.startDate)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {apiLoading && <Loader2 size={16} className="animate-spin" />}
          {editingItem ? 'Zapisz zmiany' : 'Utworz projekt'}
        </button>
      </div>
    </>
  );
};
