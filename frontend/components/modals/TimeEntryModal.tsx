import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Project, Task } from '../time-tracking-layout';

interface TimeEntryModalProps {
  editingItem: any;
  formErrors: any;
  formData: any;
  setFormData: (data: any) => void;
  visibleProjects: Project[];
  userTasksForSelectedProject: any[];
  calculateDuration: (start: string, end: string) => string;
  closeModal: () => void;
  handleSaveTimeEntry: () => void;
}

export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
  editingItem, formErrors, formData, setFormData, visibleProjects,
  userTasksForSelectedProject, calculateDuration, closeModal, handleSaveTimeEntry
}) => {
  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-6">
        {editingItem ? 'Edytuj wpis czasu' : 'Dodaj wpis czasu'}
      </h2>
      
      {formErrors.overlap && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-sm">
          <AlertTriangle size={18} />
          {formErrors.overlap}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Projekt *</label>
          <select 
            value={formData.project || formData.projectId || ''}
            onChange={(e) => {
              setFormData({ 
                ...formData, 
                project: e.target.value,
                task: '' // Clear task if project changes
              });
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              formErrors.project ? 'border-rose-500' : 'border-slate-200'
            }`}
          >
            <option value="">Wybierz projekt</option>
            {visibleProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {formErrors.project && <p className="text-rose-500 text-xs mt-1">{formErrors.project}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Zadanie *</label>
          {userTasksForSelectedProject.length > 0 ? (
            <select
              value={formData.task || ''}
              onChange={(e) => {
                const selectedTask = userTasksForSelectedProject.find(t => t.name === e.target.value);
                setFormData({ 
                  ...formData, 
                  task: e.target.value,
                  taskId: selectedTask?.id || 0
                });
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                formErrors.task ? 'border-rose-500' : 'border-slate-200'
              }`}
            >
              <option value="">Wybierz zadanie</option>
              {userTasksForSelectedProject.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          ) : (
            <input 
              type="text"
              value={formData.task || ''}
              onChange={(e) => setFormData({ ...formData, task: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                formErrors.task ? 'border-rose-500' : 'border-slate-200'
              }`}
              placeholder={formData.project ? "Brak przypisanych zadań - wpisz ręcznie" : "Najpierw wybierz projekt"}
              disabled={!formData.project}
            />
          )}
          {formErrors.task && <p className="text-rose-500 text-xs mt-1">{formErrors.task}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data *</label>
          <input 
            type="date"
            value={formData.date || ''}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              formErrors.date ? 'border-rose-500' : 'border-slate-200'
            }`}
          />
          {formErrors.date && <p className="text-rose-500 text-xs mt-1">{formErrors.date}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Czas rozpoczecia *</label>
            <input 
              type="time"
              value={formData.startTime || ''}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                formErrors.startTime ? 'border-rose-500' : 'border-slate-200'
              }`}
            />
            {formErrors.startTime && <p className="text-rose-500 text-xs mt-1">{formErrors.startTime}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Czas zakonczenia *</label>
            <input 
              type="time"
              value={formData.endTime || ''}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                formErrors.endTime ? 'border-rose-500' : 'border-slate-200'
              }`}
            />
            {formErrors.endTime && <p className="text-rose-500 text-xs mt-1">{formErrors.endTime}</p>}
          </div>
        </div>

        {formData.startTime && formData.endTime && formData.startTime < formData.endTime && (
          <div className="p-3 bg-indigo-50 rounded-lg">
            <span className="text-sm text-indigo-700 font-medium">
              Czas trwania: {calculateDuration(formData.startTime, formData.endTime)}
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button 
          onClick={closeModal}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Anuluj
        </button>
        <button 
          onClick={handleSaveTimeEntry}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          {editingItem ? 'Zapisz zmiany' : 'Dodaj wpis'}
        </button>
      </div>
    </>
  );
};
