import React, { useState } from 'react';
import { X, Copy, Check, Code, Sparkles, BookCheck, ShieldAlert } from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_BACKEND_CODE } from '../constants/appsScriptCode';

interface AppsScriptCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppsScriptCodeModal: React.FC<AppsScriptCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_BACKEND_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                '대출 불가' 해결 및 새 Apps Script 백엔드 코드
              </h3>
              <p className="text-xs text-slate-500">
                Google 스프레드시트의 Apps Script 편집기에 붙여넣어 배포하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Explanation Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>왜 모든 책이 '대출불가 (소장본 0권)'로 나왔을까요?</span>
            </div>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              Google Sheets의 <strong>BOOKS</strong> 시트에는 40권의 도서 목록이 등록되었지만,
              실제 바코드나 실물 권수를 관리하는 <strong>BOOK_COPIES</strong> 시트에 해당 도서 데이터가 아직 입력되지 않았거나,
              기존 스크립트가 <code>total_copies</code>를 0으로 반환하도록 되어 있었기 때문입니다.
            </p>
            <div className="bg-white/80 p-3 rounded-lg border border-amber-200/60 text-xs space-y-1">
              <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                새 Apps Script 백엔드 코드의 스마트 해결 기능:
              </div>
              <ul className="list-disc list-inside text-slate-700 space-y-0.5 text-[11px]">
                <li><strong>BOOK_COPIES 시트에 실물 바코드가 있으면</strong> &rarr; 실시간 소장 권수 및 미반납(LOANS) 대출 여부를 자동 차감 계산</li>
                <li><strong>BOOK_COPIES 시트가 아직 비어있더라도</strong> &rarr; 등록된 도서를 <strong>기본 1권 소장 및 대출 가능</strong>으로 자동 활성화</li>
                <li><strong>CATEGORIES 시트 연동</strong> &rarr; CAT001 대신 한글 분류명('인문/역사', '문학' 등)으로 자동 변환</li>
              </ul>
            </div>
          </div>

          {/* How to Apply Steps */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 mb-2 flex items-center gap-1.5">
              <BookCheck className="w-4 h-4 text-emerald-600" />
              적용 방법 (3분 소요)
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 leading-relaxed">
              <li>연동된 <strong>Google Sheets</strong>를 열고 상단 메뉴의 <strong>[확장 프로그램] &gt; [Apps Script]</strong>를 클릭합니다.</li>
              <li>편집기에 있는 기존 코드를 모두 지우고, 아래의 <strong>[코드 전체 복사]</strong> 버튼을 눌러 붙여넣은 뒤 저장(Ctrl+S)합니다.</li>
              <li>우측 상단의 <strong>[배포] &gt; [새 배포]</strong>(또는 [배포 관리]에서 새 버전 생성)를 클릭합니다.</li>
              <li>
                유형을 <strong>'웹 앱(Web app)'</strong>으로 설정하고, <strong>액세스 권한: 모든 사용자(Anyone)</strong>로 설정한 뒤 <strong>[배포]</strong>를 누릅니다.
              </li>
              <li>웹앱으로 돌아와 <strong>[새로고침]</strong>을 누르면 즉시 모든 도서가 <strong>'대출 가능'</strong>으로 전환됩니다!</li>
            </ol>
          </div>

          {/* Code Viewer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 text-xs">
                Google Apps Script 백엔드 소스코드 (Code.gs)
              </span>
              <button
                onClick={handleCopy}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>코드 전체 복사</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed border border-slate-800 select-all">
              {GOOGLE_APPS_SCRIPT_BACKEND_CODE}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500">
            * 코드 적용 후 웹 앱 배포 시 새 버전으로 배포해야 변경사항이 반영됩니다.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              {copied ? '복사됨' : '코드 복사'}
            </button>
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
