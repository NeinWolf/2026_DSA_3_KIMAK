import React from 'react';
import { AlertCircle, X, Loader2 } from 'lucide-react';

interface UserModalProps {
  editingItem: any;
  apiError: string | null;
  setApiError: (error: string | null) => void;
  formData: any;
  setFormData: (data: any) => void;
  formErrors: any;
  apiLoading: boolean;
  teams: any[];
  closeModal: () => void;
  handleSaveUser: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  editingItem, apiError, setApiError, formData, setFormData,
  formErrors, apiLoading, teams, closeModal, handleSaveUser
}) => {
  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        {editingItem ? 'Edytuj uzytkownika' : 'Nowy uzytkownik'}
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Nazwa uzytkownika *</label>
          <input 
            type="text"
            value={formData.username || ''}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              formErrors.username ? 'border-rose-500' : 'border-slate-200'
            }`}
            placeholder="jan_kowalski"
            disabled={apiLoading}
          />
          {formErrors.username && <p className="text-rose-500 text-xs mt-1">{formErrors.username}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Haslo {editingItem ? '(pozostaw puste aby nie zmieniac)' : '*'}
          </label>
          <input 
            type="password"
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              formErrors.password ? 'border-rose-500' : 'border-slate-200'
            }`}
            placeholder="********"
            disabled={apiLoading}
          />
          {formErrors.password && <p className="text-rose-500 text-xs mt-1">{formErrors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rola</label>
          <select 
            value={formData.role || 'employee'}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={apiLoading}
          >
            <option value="employee">Pracownik (EMPLOYEE)</option>
            <option value="admin">Administrator (ADMIN)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Zespól</label>
          <select 
            value={formData.teamId || ''}
            onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={apiLoading}
          >
            <option value="">Brak zespolu</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* API Info */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-500">
          <span className="font-medium">Endpoint:</span> {editingItem ? `PUT /api/users/${editingItem.id}` : 'POST /api/users'}
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
          onClick={handleSaveUser}
          disabled={apiLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {apiLoading && <Loader2 size={16} className="animate-spin" />}
          {editingItem ? 'Zapisz zmiany' : 'Dodaj uzytkownika'}
        </button>
      </div>
    </>
  );
};
