import React, { useState } from 'react';
import { RefreshCw, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { User } from '../time-tracking-layout';

interface TeamViewProps {
  currentUser: User;
  users: User[];
  usersLoading: boolean;
  refreshUsers: () => void;
  openModal: (type: string, item?: any) => void;
  confirmDelete: (type: string, id: number, name: string) => void;
  teams: any[];
  teamsLoading: boolean;
  refreshTeams: () => void;
  createTeam: (team: { name: string }) => Promise<any>;
  deleteTeam: (id: number) => Promise<any>;
}

export const TeamView: React.FC<TeamViewProps> = ({
  currentUser, 
  users, 
  usersLoading, 
  refreshUsers, 
  openModal, 
  confirmDelete,
  teams,
  teamsLoading,
  refreshTeams,
  createTeam,
  deleteTeam
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [newTeamName, setNewTeamName] = useState('');
  const [addingTeam, setAddingTeam] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null);

  const filteredUsers = selectedTeamFilter === 'all'
    ? users
    : users.filter(u => u.team === selectedTeamFilter);

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setAddingTeam(true);
    const res = await createTeam({ name: newTeamName });
    setAddingTeam(false);
    if (res.success) {
      setNewTeamName('');
      refreshTeams();
    } else {
      alert(res.error?.message || 'Nie udalo sie dodac zespolu');
    }
  };

  const handleDeleteTeamClick = async (id: number, name: string) => {
    if (confirm(`Czy na pewno chcesz usunac zespol "${name}"?`)) {
      setDeletingTeamId(id);
      const res = await deleteTeam(id);
      setDeletingTeamId(null);
      if (res.success) {
        refreshTeams();
        refreshUsers();
      } else {
        alert(res.error?.message || 'Nie udalo sie usunac zespolu');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Zarzadzanie Zespolem</h1>
          <p className="text-slate-500 mt-1">Zarzadzaj uzytkownikami, rolami i zespolami.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              refreshUsers();
              refreshTeams();
            }}
            disabled={usersLoading || teamsLoading}
            className="flex items-center gap-2 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="Odswiez dane z API"
          >
            <RefreshCw size={16} className={usersLoading || teamsLoading ? 'animate-spin' : ''} />
            Odswiez
          </button>
          {isAdmin && (
            <button 
              onClick={() => openModal('add-user')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <UserPlus size={18} />
              Dodaj uzytkownika
            </button>
          )}
        </div>
      </div>

      {/* Team stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Wszyscy uzytkownicy</h3>
          <div className="text-2xl font-bold text-slate-900">{users.length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Administratorzy</h3>
          <div className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === 'admin').length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Pracownicy</h3>
          <div className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === 'employee').length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Zespoly</h3>
          <div className="text-2xl font-bold text-slate-900">{teams.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side: Users list (spanning 2 columns) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Lista uzytkownikow</h2>
              <div className="flex items-center gap-2">
                <select 
                  value={selectedTeamFilter}
                  onChange={(e) => setSelectedTeamFilter(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Wszystkie zespoly</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.name}>{team.name}</option>
                  ))}
                  <option value="Brak zespołu">Brak zespolu</option>
                </select>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Uzytkownik</th>
                  <th className="px-6 py-3">Zespol</th>
                  <th className="px-6 py-3">Rola</th>
                  <th className="px-6 py-3 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {user.initials}
                          </div>
                          {user.activeTimer && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <span className="font-medium text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                        user.team === 'Brak zespołu' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {user.team}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : 'Pracownik'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isAdmin && user.id !== currentUser.id && (
                        <>
                          <button 
                            onClick={() => openModal('add-user', user)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => confirmDelete('user', user.id, user.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors ml-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: Teams list & management */}
        {isAdmin && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Zespoly w systemie</h2>
              
              {/* Form to add team */}
              <form onSubmit={handleCreateTeamSubmit} className="mb-4 flex gap-2">
                <input 
                  type="text" 
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Nazwa nowego zespolu"
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={addingTeam}
                />
                <button 
                  type="submit"
                  disabled={addingTeam}
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  Dodaj
                </button>
              </form>

              {/* Teams list */}
              {teamsLoading ? (
                <p className="text-slate-500 text-sm">Wczytywanie...</p>
              ) : teams.length === 0 ? (
                <p className="text-slate-500 text-sm font-medium">Brak zespolow w bazie danych.</p>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                  {teams.map(team => (
                    <div key={team.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{team.name}</p>
                        <p className="text-xs text-slate-400">Czlonkowie: {team.members?.length || 0}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteTeamClick(team.id, team.name)}
                        disabled={deletingTeamId === team.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                        title="Usun zespol"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
