import React from 'react';
import { AlertCircle, X, Loader2 } from 'lucide-react';
import { User } from '../time-tracking-layout';

interface TaskModalProps {
  editingItem: any;
  apiError: string | null;
  setApiError: (error: string | null) => void;
  formData: any;
  setFormData: (data: any) => void;
  formErrors: any;
  apiLoading: boolean;
  users: User[];
  closeModal: () => void;
  handleSaveTask: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  editingItem, apiError, setApiError, formData, setFormData,
  formErrors, apiLoading, users, closeModal, handleSaveTask
}) => {
  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        {editingItem ? 'Edytuj zadanie' : 'Nowe zadanie'}
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa zadania *</label>
          <input 
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              formErrors.name ? 'border-rose-500' : 'border-slate-200'
            }`}
            placeholder="Nazwa zadania"
            disabled={apiLoading}
          />
          {formErrors.name && <p className="text-rose-500 text-xs mt-1">{formErrors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Opis</label>
          <textarea 
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="Opis zadania"
            disabled={apiLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Przypisz do</label>
          <select 
            value={formData.assigneeId || ''}
            onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={apiLoading}
          >
            <option value="">Wybierz pracownika</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select 
            value={formData.status || 'todo'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={apiLoading}
          >
            <option value="todo">Do zrobienia (TODO)</option>
            <option value="in-progress">W trakcie (IN_PROGRESS)</option>
            <option value="completed">Ukonczone (DONE)</option>
          </select>
        </div>
      </div>

      {/* API Info */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500">
          <span className="font-medium">Endpoint:</span> {editingItem ? `PUT /api/tasks/${editingItem.id}` : 'POST /api/tasks'}
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
          onClick={handleSaveTask}
          disabled={apiLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {apiLoading && <Loader2 size={16} className="animate-spin" />}
          {editingItem ? 'Zapisz zmiany' : 'Dodaj zadanie'}
        </button>
      </div>
    </>
  );
};
