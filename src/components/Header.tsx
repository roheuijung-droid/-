import React from 'react';
import { BookOpen, RefreshCw, CheckCircle2, AlertTriangle, Database } from 'lucide-react';

interface HeaderProps {
  isLoading: boolean;
  healthConnected: boolean | null;
  healthMessage: string;
  onRefresh: () => void;
  onOpenConnectionInfo: () => void;
  onOpenAppsScriptCode: () => void;
  lastUpdated: Date | null;
}

export const Header: React.FC<HeaderProps> = ({
  isLoading,
  healthConnected,
  healthMessage,
  onRefresh,
  onOpenConnectionInfo,
  onOpenAppsScriptCode,
  lastUpdated,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  열린도서관
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Google Sheets 연동
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                실시간 소장 도서 검색 및 대출·예약 현황
              </p>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Apps Script Backend Code Modal Button */}
            <button
              onClick={onOpenAppsScriptCode}
              type="button"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-colors cursor-pointer"
              title="새 Apps Script 백엔드 코드 보기"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Apps Script 백엔드 코드</span>
              <span className="md:hidden">백엔드 코드</span>
            </button>

            {/* Health Status Indicator */}
            <button
              onClick={onOpenConnectionInfo}
              type="button"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
              title="연동 상태 확인"
            >
              {healthConnected === true ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="hidden lg:inline text-slate-600">시트 연결됨</span>
                </>
              ) : healthConnected === false ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="hidden lg:inline text-rose-600">연결 오류</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span className="hidden lg:inline text-slate-500">연결 확인 중</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              type="button"
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 shadow-xs shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>새로고침</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
