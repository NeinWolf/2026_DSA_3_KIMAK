import React from 'react';
import { User, Project } from '../time-tracking-layout';

interface AssignEmployeeModalProps {
  formData: any;
  setFormData: (data: any) => void;
  projects: Project[];
  selectedProject: number | null;
  users: User[];
  closeModal: () => void;
  handleAssignEmployee: () => void;
}

export const AssignEmployeeModal: React.FC<AssignEmployeeModalProps> = ({
  formData, setFormData, projects, selectedProject, users,
  closeModal, handleAssignEmployee
}) => {
  const currentProjectData = projects.find(p => p.id === selectedProject);
  const availableUsers = users.filter(u => !currentProjectData?.teamMembers.includes(u.id));

  return (
    <>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Przypisz pracownika do projektu</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Wybierz pracownika</label>
          <select 
            value={formData.userId || ''}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Wybierz pracownika</option>
            {availableUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.team})</option>
            ))}
          </select>
        </div>

        {currentProjectData && currentProjectData.teamMembers.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Aktualnie przypisani:</label>
            <div className="flex flex-wrap gap-2">
              {currentProjectData.teamMembers.map(memberId => {
                const member = users.find(u => u.id === memberId);
                return member ? (
                  <span key={memberId} className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                      {member.initials}
                    </span>
                    {member.name}
                  </span>
                ) : null;
              })}
            </div>
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
          onClick={handleAssignEmployee}
          disabled={!formData.userId}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Przypisz
        </button>
      </div>
    </>
  );
};
