import React from 'react';
import { Search, X, CheckCircle, ArrowDownAZ } from 'lucide-react';
import { DEFAULT_CATEGORY_MAP } from '../constants/categories';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onlyAvailable: boolean;
  onToggleOnlyAvailable: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalFilteredCount: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategorySelect,
  onlyAvailable,
  onToggleOnlyAvailable,
  sortBy,
  onSortChange,
  totalFilteredCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Top row: Search input & Available toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="도서명, 저자, ISBN 검색..."
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="검색어 지우기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick filter & Sort Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Only Available Toggle */}
          <button
            type="button"
            onClick={onToggleOnlyAvailable}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer shrink-0 ${
              onlyAvailable
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${onlyAvailable ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>대출 가능만</span>
          </button>

          {/* Sort Selector */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-xs sm:text-sm text-slate-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            >
              <option value="default">기본순</option>
              <option value="title">도서명 가나다순</option>
              <option value="latest">최신 출간순</option>
              <option value="copies">소장 권수 많은순</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
              <ArrowDownAZ className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories chips (if categories exist) */}
      {categories.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
          <span className="text-xs text-slate-400 shrink-0 mr-1">분류:</span>
          {categories.map((cat) => {
            const label = cat === '전체' ? '전체' : DEFAULT_CATEGORY_MAP[cat] ? `${DEFAULT_CATEGORY_MAP[cat]}` : cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategorySelect(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
