import React from 'react';
import { AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  deleteTarget: { type: string; id: number; name: string } | null;
  apiError: string | null;
  apiLoading: boolean;
  closeModal: () => void;
  handleDelete: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  deleteTarget, apiError, apiLoading, closeModal, handleDelete
}) => {
  return (
    <>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Potwierdzenie usuniecia</h2>
        <p className="text-slate-600 mb-4">
          Czy na pewno chcesz usunac <strong>{deleteTarget?.name}</strong>? Tej operacji nie mozna cofnac.
        </p>

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-left">
            <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-700">{apiError}</p>
          </div>
        )}

        {/* API Info */}
        {deleteTarget?.type === 'project' && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-left">
            <p className="text-xs text-slate-500">
              <span className="font-medium">Endpoint:</span> DELETE /api/projects/{deleteTarget?.id}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Uwaga: Nie mozna usunac projektu z przypisanymi zadaniami (HTTP 409)
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3">
        <button 
          onClick={closeModal}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          disabled={apiLoading}
        >
          Anuluj
        </button>
        <button 
          onClick={handleDelete}
          disabled={apiLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {apiLoading && <Loader2 size={16} className="animate-spin" />}
          Usun
        </button>
      </div>
    </>
  );
};
