import React from 'react';
import { X, CheckCircle2, AlertTriangle, Database, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface ConnectionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthConnected: boolean | null;
  healthMessage: string;
  onRecheck: () => void;
  isChecking: boolean;
}

export const ConnectionInfoModal: React.FC<ConnectionInfoModalProps> = ({
  isOpen,
  onClose,
  healthConnected,
  healthMessage,
  onRecheck,
  isChecking,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Google Sheets 연동 상태
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Health Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              healthConnected === true
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : healthConnected === false
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            {healthConnected === true ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-bold text-sm">
                {healthConnected === true
                  ? '연결 상태 정상'
                  : healthConnected === false
                  ? '연결 실패'
                  : '연결 확인 중'}
              </div>
              <div className="mt-1 text-xs opacity-90 leading-relaxed">
                {healthMessage || (healthConnected === true ? 'Google Sheets와 정상적으로 연결되었습니다.' : '연결을 확인하지 못했습니다.')}
              </div>
            </div>
          </div>

          {/* Integration Specs */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">API 엔드포인트</span>
              <span className="font-mono text-slate-700 text-[11px]">Google Apps Script (Exec)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">통신 방식</span>
              <span className="font-medium text-slate-700">서버 프록시 (Google Redirect 302 처리)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">연동 시트</span>
              <span className="font-medium text-slate-700">BOOKS, BOOK_COPIES</span>
            </div>
          </div>

          {/* Sheet Fields Guide */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800 mb-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>BOOKS 시트 필수 열 구조</span>
            </div>
            <div className="text-[11px] text-slate-600 leading-relaxed font-mono bg-white p-2.5 rounded-lg border border-slate-200 overflow-x-auto">
              book_id | isbn | title | author | publisher | published_date | category_id | description | cover_url | total_copies | available_copies
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Google Sheets의 BOOKS 시트에 행(Row)을 추가하면 웹앱에서 '새로고침' 시 즉시 반영됩니다.
            </p>
          </div>
        </div>

        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onRecheck}
            disabled={isChecking}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>상태 다시 확인</span>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
