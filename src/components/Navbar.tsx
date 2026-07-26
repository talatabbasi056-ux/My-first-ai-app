import React, { useState, useRef, useEffect } from 'react';
import { UserRole, User, Article, Author } from '../types';
import {
  PenTool,
  BookOpen,
  CheckSquare,
  Sparkles,
  Search,
  UserCheck,
  Feather,
  ChevronDown,
  User as UserIcon,
  Bookmark,
  LogIn,
  X,
  FileText,
  UserPlus,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: 'public' | 'writer' | 'editor';
  onTabChange: (tab: 'public' | 'writer' | 'editor') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pendingReviewCount: number;
  onCreateArticle: () => void;
  onOpenAuthModal: (tab?: 'login' | 'register') => void;
  onOpenProfileModal: () => void;
  articles?: Article[];
  authors?: Author[];
  onSelectArticle?: (article: Article) => void;
  onSelectAuthor?: (author: Author) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  pendingReviewCount,
  onCreateArticle,
  onOpenAuthModal,
  onOpenProfileModal,
  articles = [],
  authors = [],
  onSelectArticle,
  onSelectAuthor,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter top matches for live popover
  const trimmedQ = searchQuery.trim().toLowerCase();
  const matchingArticles = trimmedQ
    ? articles
        .filter((a) => a.status === 'published')
        .filter(
          (a) =>
            a.title.toLowerCase().includes(trimmedQ) ||
            a.author.name.toLowerCase().includes(trimmedQ) ||
            a.excerpt.toLowerCase().includes(trimmedQ) ||
            a.tags.some((t) => t.toLowerCase().includes(trimmedQ)) ||
            a.category.toLowerCase().includes(trimmedQ)
        )
        .slice(0, 4)
    : [];

  const matchingAuthors = trimmedQ
    ? authors
        .filter(
          (aut) =>
            aut.name.toLowerCase().includes(trimmedQ) ||
            aut.locality.toLowerCase().includes(trimmedQ) ||
            aut.badge.toLowerCase().includes(trimmedQ)
        )
        .slice(0, 2)
    : [];

  const totalMatchesCount = trimmedQ
    ? articles.filter(
        (a) =>
          a.status === 'published' &&
          (a.title.toLowerCase().includes(trimmedQ) ||
            a.author.name.toLowerCase().includes(trimmedQ) ||
            a.excerpt.toLowerCase().includes(trimmedQ) ||
            a.tags.some((t) => t.toLowerCase().includes(trimmedQ)) ||
            a.category.toLowerCase().includes(trimmedQ))
      ).length
    : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium tracking-wide">
            The Oakridge Chronicle & Local Gazette • Community Voice Platform
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <span className="hidden sm:inline text-stone-400">Viewing Mode:</span>
          <div className="flex items-center space-x-1 bg-stone-800 rounded-md p-0.5 border border-stone-700">
            <button
              onClick={() => {
                onRoleChange('reader');
                onTabChange('public');
              }}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                currentRole === 'reader'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Reader
            </button>
            <button
              onClick={() => {
                onRoleChange('writer');
                onTabChange('writer');
              }}
              className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                currentRole === 'writer'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Writer
            </button>
            <button
              onClick={() => {
                onRoleChange('editor');
                onTabChange('editor');
              }}
              className={`px-2 py-0.5 rounded text-xs transition-colors relative cursor-pointer ${
                currentRole === 'editor'
                  ? 'bg-amber-600 text-white font-medium'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Editor
              {pendingReviewCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white text-[10px] rounded-full font-bold">
                  {pendingReviewCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('public')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-800 to-stone-900 flex items-center justify-center text-amber-100 shadow-sm border border-amber-900/20">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
              Oakridge Local
              <span className="text-xs font-sans font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300/60 uppercase tracking-wider">
                Writers Guild
              </span>
            </h1>
            <p className="text-xs text-stone-500 hidden sm:block">
              Community Journalism • Local Voices • Editorial Excellence
            </p>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => onTabChange('public')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'public'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Public Gazette</span>
          </button>

          <button
            onClick={() => onTabChange('writer')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'writer'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Writer's Studio</span>
          </button>

          <button
            onClick={() => onTabChange('editor')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Editorial Review</span>
            {pendingReviewCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-700 text-amber-50 text-[10px] rounded-full font-bold">
                {pendingReviewCount}
              </span>
            )}
          </button>
        </nav>

        {/* Action Buttons & Search */}
        <div className="flex items-center space-x-2.5">
          {activeTab === 'public' && (
            <div className="relative hidden lg:block w-48 xl:w-64" ref={searchContainerRef}>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  placeholder="Search titles, authors, keywords..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 placeholder-stone-400 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      onSearchChange('');
                      setIsSearchFocused(false);
                    }}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Live Search Instant Autocomplete Popover */}
              {isSearchFocused && trimmedQ.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-stone-200 z-50 overflow-hidden text-xs">
                  <div className="p-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                    <span>
                      {totalMatchesCount} {totalMatchesCount === 1 ? 'match' : 'matches'} found
                    </span>
                    <span className="text-amber-800 font-bold">Live Search</span>
                  </div>

                  {/* Matching Authors Section */}
                  {matchingAuthors.length > 0 && (
                    <div className="p-2 border-b border-stone-100 bg-amber-50/50">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-amber-900 mb-1.5 px-1">
                        Matched Writers
                      </div>
                      <div className="space-y-1">
                        {matchingAuthors.map((aut) => (
                          <div
                            key={aut.id}
                            onClick={() => {
                              if (onSelectAuthor) onSelectAuthor(aut);
                              setIsSearchFocused(false);
                            }}
                            className="flex items-center space-x-2 p-1.5 hover:bg-amber-100/70 rounded-lg cursor-pointer transition-colors"
                          >
                            <img
                              src={aut.avatar}
                              alt={aut.name}
                              className="w-6 h-6 rounded-full object-cover border border-amber-300"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-stone-900 block truncate leading-tight">
                                {aut.name}
                              </span>
                              <span className="text-[10px] text-stone-500 block truncate">
                                {aut.badge} • {aut.locality}
                              </span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-amber-700" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Articles List */}
                  {matchingArticles.length > 0 ? (
                    <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mb-1 px-1">
                        Matching Articles
                      </div>
                      {matchingArticles.map((art) => (
                        <div
                          key={art.id}
                          onClick={() => {
                            if (onSelectArticle) onSelectArticle(art);
                            setIsSearchFocused(false);
                          }}
                          className="flex items-center space-x-2 p-1.5 hover:bg-stone-100 rounded-lg cursor-pointer transition-colors group"
                        >
                          <img
                            src={art.coverImage}
                            alt=""
                            className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-stone-800 group-hover:text-amber-800 truncate leading-tight">
                              {art.title}
                            </h5>
                            <p className="text-[10px] text-stone-500 truncate">
                              By {art.author.name} in <span className="font-medium text-stone-700">{art.category}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    matchingAuthors.length === 0 && (
                      <div className="p-4 text-center text-stone-500 text-xs">
                        No articles or authors matched <span className="font-bold text-stone-800">"{searchQuery}"</span>
                      </div>
                    )
                  )}

                  {/* Footer link to main view */}
                  <div className="p-2 bg-stone-50 border-t border-stone-100 text-center">
                    <button
                      onClick={() => {
                        onTabChange('public');
                        setIsSearchFocused(false);
                      }}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-900 cursor-pointer flex items-center justify-center space-x-1 w-full"
                    >
                      <span>See all {totalMatchesCount} results on Gazette feed</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Search Toggle Button */}
          {activeTab === 'public' && (
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="lg:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              title="Search stories"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onCreateArticle}
            className="hidden sm:flex items-center space-x-1.5 bg-amber-800 hover:bg-amber-900 text-white px-3 py-2 rounded-xl text-xs font-medium shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Submit Story</span>
          </button>

          {/* User Profile Pill or Login Button */}
          {currentUser ? (
            <button
              onClick={onOpenProfileModal}
              className="flex items-center space-x-2 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 pl-1.5 pr-3 py-1 rounded-full transition-all cursor-pointer shadow-2xs group"
              title="View profile & saved stories"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-amber-600"
              />
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-stone-900 block leading-tight truncate max-w-[100px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-semibold text-amber-800 uppercase block leading-none">
                  {currentUser.role}
                </span>
              </div>
              {currentUser.savedArticleIds.length > 0 && (
                <span className="bg-amber-800 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full flex items-center space-x-0.5">
                  <Bookmark className="w-2.5 h-2.5 fill-white" />
                  <span>{currentUser.savedArticleIds.length}</span>
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => onOpenAuthModal('login')}
              className="flex items-center space-x-1.5 bg-stone-900 hover:bg-stone-800 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {showMobileSearch && activeTab === 'public' && (
        <div className="lg:hidden p-3 bg-stone-100 border-t border-stone-200">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by keyword, title, or writer..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-stone-800"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Nav sub-bar */}
      <div className="md:hidden flex border-t border-stone-200 bg-stone-50 px-4 py-2 justify-around">
        <button
          onClick={() => onTabChange('public')}
          className={`flex items-center space-x-1 text-xs py-1 px-2 rounded-md ${
            activeTab === 'public' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Blog</span>
        </button>
        <button
          onClick={() => onTabChange('writer')}
          className={`flex items-center space-x-1 text-xs py-1 px-2 rounded-md ${
            activeTab === 'writer' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Writer Studio</span>
        </button>
        <button
          onClick={() => onTabChange('editor')}
          className={`flex items-center space-x-1 text-xs py-1 px-2 rounded-md relative ${
            activeTab === 'editor' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Editor ({pendingReviewCount})</span>
        </button>
      </div>
    </header>
  );
};

