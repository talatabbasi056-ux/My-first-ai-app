import React, { useState } from 'react';
import { Article, Category, Author, User } from '../types';
import { CURRENT_WRITER } from '../data/mockData';
import {
  Search,
  Filter,
  Heart,
  MessageSquare,
  Clock,
  Eye,
  MapPin,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  BookOpen,
  UserCheck,
  Tag,
  Share2,
  Bookmark,
  Users,
  X,
  UserPlus,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

interface BlogHomeProps {
  currentUser: User | null;
  articles: Article[];
  categories: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onSelectCategory: (catSlug: string | null) => void;
  onSelectArticle: (article: Article) => void;
  onLikeArticle: (articleId: string, e: React.MouseEvent) => void;
  onSelectAuthor: (author: Author) => void;
  onCreateArticle: () => void;
  onToggleSaveArticle: (articleId: string, e?: React.MouseEvent) => void;
  onToggleFollowAuthor: (authorId: string, e?: React.MouseEvent) => void;
  onOpenAuthModal: (tab?: 'login' | 'register', prompt?: string) => void;
}

// Search text highlight helper
const HighlightText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight || !highlight.trim()) return <>{text}</>;
  const trimmed = highlight.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200 text-stone-900 rounded-xs px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export const BlogHome: React.FC<BlogHomeProps> = ({
  currentUser,
  articles,
  categories,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onSelectArticle,
  onLikeArticle,
  onSelectAuthor,
  onCreateArticle,
  onToggleSaveArticle,
  onToggleFollowAuthor,
  onOpenAuthModal,
}) => {
  const [selectedLocality, setSelectedLocality] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'editorPick'>('recent');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [customViewMode, setCustomViewMode] = useState<'all' | 'saved' | 'following'>('all');
  const [searchScope, setSearchScope] = useState<'all' | 'title' | 'author' | 'content' | 'tag'>('all');

  // Filter only published articles for public view
  const publishedArticles = articles.filter((a) => a.status === 'published');

  // Filter logic
  const filteredArticles = publishedArticles.filter((a) => {
    // Custom view mode filter
    if (customViewMode === 'saved') {
      if (!currentUser || !currentUser.savedArticleIds.includes(a.id)) return false;
    }
    if (customViewMode === 'following') {
      if (!currentUser || !currentUser.followedAuthorIds.includes(a.author.id)) return false;
    }

    // Category check
    if (selectedCategory && a.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      const catObj = categories.find((c) => c.slug === selectedCategory);
      if (catObj && a.category !== catObj.name) return false;
    }

    // Locality check
    if (selectedLocality !== 'all' && a.locality !== selectedLocality) {
      return false;
    }

    // Tag check
    if (selectedTag && !a.tags.includes(selectedTag)) {
      return false;
    }

    // Search query with scopes
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchExcerpt = a.excerpt.toLowerCase().includes(q);
      const matchAuthor = a.author.name.toLowerCase().includes(q);
      const matchTag = a.tags.some((t) => t.toLowerCase().includes(q));
      const matchLocality = a.locality.toLowerCase().includes(q);

      if (searchScope === 'title') return matchTitle;
      if (searchScope === 'author') return matchAuthor;
      if (searchScope === 'content') return matchExcerpt;
      if (searchScope === 'tag') return matchTag || matchLocality;

      return matchTitle || matchExcerpt || matchAuthor || matchTag || matchLocality;
    }

    return true;
  });

  // Calculate scope counts for search query tab badges
  const scopeCounts = React.useMemo(() => {
    if (!searchQuery.trim()) return { all: 0, title: 0, author: 0, content: 0, tag: 0 };
    const q = searchQuery.toLowerCase();

    let title = 0;
    let author = 0;
    let content = 0;
    let tag = 0;

    publishedArticles.forEach((a) => {
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchExcerpt = a.excerpt.toLowerCase().includes(q);
      const matchAuthor = a.author.name.toLowerCase().includes(q);
      const matchTag = a.tags.some((t) => t.toLowerCase().includes(q)) || a.locality.toLowerCase().includes(q);

      if (matchTitle) title++;
      if (matchAuthor) author++;
      if (matchExcerpt) content++;
      if (matchTag) tag++;
    });

    const all = publishedArticles.filter((a) => {
      return (
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.author.name.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.locality.toLowerCase().includes(q)
      );
    }).length;

    return { all, title, author, content, tag };
  }, [publishedArticles, searchQuery]);

  // Find unique writers that match search query
  const matchingAuthors = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const map = new Map<string, Author>();

    publishedArticles.forEach((a) => {
      if (
        a.author.name.toLowerCase().includes(q) ||
        a.author.locality.toLowerCase().includes(q) ||
        a.author.badge.toLowerCase().includes(q)
      ) {
        map.set(a.author.id, a.author);
      }
    });

    return Array.from(map.values());
  }, [publishedArticles, searchQuery]);

  // Sorting
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.likes + b.views - (a.likes + a.views);
    }
    if (sortBy === 'editorPick') {
      return (b.isEditorPick ? 1 : 0) - (a.isEditorPick ? 1 : 0);
    }
    return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
  });

  // Featured Hero article
  const featuredArticle = publishedArticles.find((a) => a.isFeatured) || publishedArticles[0];

  // Extract all unique localities & tags
  const allLocalities: string[] = Array.from(new Set(publishedArticles.map((a) => a.locality)));
  const allTags: string[] = Array.from(new Set(publishedArticles.flatMap((a) => a.tags)));

  const POPULAR_SEARCH_TAGS = ['UrbanRenewal', 'Transit', 'Park', 'Community', 'Elections', 'Heritage', 'Culture'];

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      {/* Newspaper Sub-Hero Banner */}
      <section className="bg-stone-900 text-stone-100 border-b border-stone-800 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Oakridge Neighborhood Independent Press</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Stories from our streets, written by our neighbors.
            </h2>
            <p className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
              An open digital publication where local writers, historians, and residents share authentic journalism, local issues, culture, and community developments.
            </p>

            {/* Quick Search Bar in Hero */}
            <div className="mt-6 max-w-lg">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search by keywords, article titles, or author names..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-stone-800/90 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 text-stone-400 hover:text-white cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Popular quick-search pill shortcuts */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px] text-stone-400">
                <span className="font-medium text-stone-500">Popular:</span>
                {POPULAR_SEARCH_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onSearchChange(tag)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                      searchQuery.toLowerCase() === tag.toLowerCase()
                        ? 'bg-amber-600 text-white'
                        : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-amber-300'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={onCreateArticle}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white font-medium px-5 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Write a Local Article</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Active Search Results Header Banner */}
        {searchQuery.trim() && (
          <div className="bg-white rounded-2xl border border-amber-200/90 p-5 shadow-sm mb-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Search Active
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs text-stone-500">
                      {sortedArticles.length} {sortedArticles.length === 1 ? 'article match' : 'articles matched'}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    Results for <span className="text-amber-800 italic font-medium">"{searchQuery}"</span>
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  onSearchChange('');
                  setSearchScope('all');
                }}
                className="self-start md:self-auto px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-stone-500" />
                <span>Clear Search</span>
              </button>
            </div>

            {/* Scope Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-3 text-xs">
              <span className="text-stone-500 font-medium flex items-center space-x-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
                <span>Filter Scope:</span>
              </span>

              <button
                onClick={() => setSearchScope('all')}
                className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                  searchScope === 'all'
                    ? 'bg-amber-800 text-white font-bold shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Fields ({scopeCounts.all})
              </button>

              <button
                onClick={() => setSearchScope('title')}
                className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                  searchScope === 'title'
                    ? 'bg-amber-800 text-white font-bold shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Article Titles ({scopeCounts.title})
              </button>

              <button
                onClick={() => setSearchScope('author')}
                className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                  searchScope === 'author'
                    ? 'bg-amber-800 text-white font-bold shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Author Names ({scopeCounts.author})
              </button>

              <button
                onClick={() => setSearchScope('content')}
                className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                  searchScope === 'content'
                    ? 'bg-amber-800 text-white font-bold shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Article Content ({scopeCounts.content})
              </button>

              <button
                onClick={() => setSearchScope('tag')}
                className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                  searchScope === 'tag'
                    ? 'bg-amber-800 text-white font-bold shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Tags & Locality ({scopeCounts.tag})
              </button>
            </div>
          </div>
        )}

        {/* Matched Authors Spotlight Section */}
        {searchQuery.trim() && matchingAuthors.length > 0 && (
          <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-5 shadow-2xs mb-8">
            <div className="flex items-center space-x-2 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
              <Users className="w-4 h-4 text-amber-800" />
              <span>Matched Local Writers ({matchingAuthors.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchingAuthors.map((aut) => (
                <div
                  key={aut.id}
                  className="bg-white rounded-xl border border-amber-200/90 p-3.5 flex items-start space-x-3 shadow-2xs hover:shadow-xs transition-all"
                >
                  <img
                    src={aut.avatar}
                    alt={aut.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-amber-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 text-xs truncate">
                      <HighlightText text={aut.name} highlight={searchQuery} />
                    </h4>
                    <div className="flex items-center space-x-1 text-[10px] text-stone-500 mb-1">
                      <span className="font-medium text-amber-800">{aut.badge}</span>
                      <span>•</span>
                      <span>{aut.locality}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 line-clamp-2 mb-2">
                      <HighlightText text={aut.bio} highlight={searchQuery} />
                    </p>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSelectAuthor(aut)}
                        className="text-[11px] font-bold text-amber-800 hover:text-amber-900 cursor-pointer flex items-center space-x-0.5"
                      >
                        <span>View Articles</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      {onToggleFollowAuthor && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!currentUser) {
                              onOpenAuthModal('login', `Sign in to follow ${aut.name}.`);
                              return;
                            }
                            onToggleFollowAuthor(aut.id, e);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                            currentUser?.followedAuthorIds.includes(aut.id)
                              ? 'bg-stone-200 text-stone-800'
                              : 'bg-amber-800 text-white hover:bg-amber-900'
                          }`}
                        >
                          {currentUser?.followedAuthorIds.includes(aut.id) ? 'Following' : '+ Follow'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Story Hero (if no tight filter applied) */}
        {!selectedCategory && !searchQuery && !selectedTag && selectedLocality === 'all' && featuredArticle && (
          <div className="mb-12 bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 relative min-h-[280px] sm:min-h-[360px]">
                <img
                  src={featuredArticle.coverImage}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="bg-amber-800 text-amber-50 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm">
                    Featured Lead Story
                  </span>
                  <span className="bg-stone-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>{featuredArticle.locality}</span>
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-stone-500 mb-3">
                    <span className="font-semibold text-amber-800 uppercase tracking-wider">
                      {featuredArticle.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{featuredArticle.readTimeMinutes} min read</span>
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectArticle(featuredArticle)}
                    className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 hover:text-amber-800 cursor-pointer transition-colors leading-snug mb-3"
                  >
                    {featuredArticle.title}
                  </h3>

                  <p className="text-stone-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-6">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between border-t border-stone-100 pt-4 mb-4">
                    <div
                      onClick={() => onSelectAuthor(featuredArticle.author)}
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                      <img
                        src={featuredArticle.author.avatar}
                        alt={featuredArticle.author.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-amber-100 group-hover:border-amber-500 transition-colors"
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-stone-900 group-hover:text-amber-800 transition-colors">
                          {featuredArticle.author.name}
                        </h4>
                        <span className="text-[11px] text-stone-500">
                          {featuredArticle.author.badge}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-stone-500">
                      <button
                        onClick={(e) => onLikeArticle(featuredArticle.id, e)}
                        className="flex items-center space-x-1 text-stone-600 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-rose-100 text-rose-500" />
                        <span>{featuredArticle.likes}</span>
                      </button>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4 text-stone-400" />
                        <span>{featuredArticle.commentsCount}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectArticle(featuredArticle)}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all"
                  >
                    <span>Read Full Story</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Navigation Bar */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs mb-8">
          {/* Category & Personal Feed Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-3 border-b border-stone-100 scrollbar-none">
            <button
              onClick={() => {
                setCustomViewMode('all');
                onSelectCategory(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                customViewMode === 'all' && selectedCategory === null
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Topics ({publishedArticles.length})
            </button>

            {/* Personalized Reader Tabs */}
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuthModal('login', 'Sign in to view your saved favorite articles.');
                  return;
                }
                setCustomViewMode('saved');
                onSelectCategory(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                customViewMode === 'saved'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${currentUser?.savedArticleIds.length ? 'fill-amber-700 text-amber-700' : 'text-amber-700'}`} />
              <span>Saved Favorites ({currentUser ? currentUser.savedArticleIds.length : 0})</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuthModal('login', 'Sign in to follow specific writers and view their articles.');
                  return;
                }
                setCustomViewMode('following');
                onSelectCategory(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                customViewMode === 'following'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-700" />
              <span>Following Writers ({currentUser ? currentUser.followedAuthorIds.length : 0})</span>
            </button>

            <span className="text-stone-300 font-light px-1">|</span>

            {categories.map((cat) => {
              const count = publishedArticles.filter((a) => a.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCustomViewMode('all');
                    onSelectCategory(cat.slug);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    customViewMode === 'all' && selectedCategory === cat.slug
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Sub-Filters: Locality, Sort, Active Tags */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>Locality:</span>
              </span>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Neighborhoods</option>
                {allLocalities.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {selectedTag && (
                <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg text-xs">
                  <Tag className="w-3 h-3" />
                  <span>#{selectedTag}</span>
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="ml-1 hover:text-red-600 font-bold"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center space-x-2 text-xs w-full sm:w-auto justify-end">
              <span className="text-stone-500">Sort by:</span>
              <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                    sortBy === 'recent' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Most Recent
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                    sortBy === 'popular' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Most Liked
                </button>
                <button
                  onClick={() => setSortBy('editorPick')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                    sortBy === 'editorPick' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                  }`}
                >
                  Editor Picks
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Article Grid + Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Stream */}
          <div className="lg:col-span-8">
            {sortedArticles.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                <Search className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold text-stone-800 mb-1">
                  {searchQuery.trim()
                    ? `No stories found matching "${searchQuery}"`
                    : 'No articles found matching active filters'}
                </h3>
                <p className="text-stone-500 text-xs max-w-md mx-auto mb-6 leading-relaxed">
                  {searchQuery.trim()
                    ? 'Try searching with different keywords, searching for writer names, or selecting from popular neighborhood tags below.'
                    : 'Try clearing your neighborhood selection or topic filter to browse all published articles.'}
                </p>

                {searchQuery.trim() && (
                  <div className="mb-6">
                    <span className="text-xs font-bold text-stone-600 block mb-2">
                      Popular Neighborhood Search Terms:
                    </span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {POPULAR_SEARCH_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => onSearchChange(tag)}
                          className="text-xs bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    onSelectCategory(null);
                    setSelectedLocality('all');
                    setSelectedTag(null);
                    onSearchChange('');
                    setSearchScope('all');
                  }}
                  className="bg-amber-800 hover:bg-amber-900 text-white text-xs px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-all shadow-xs"
                >
                  Reset All Filters & Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedArticles.map((article) => (
                  <article
                    key={article.id}
                    className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group cursor-pointer"
                    onClick={() => onSelectArticle(article)}
                  >
                    {/* Cover image thumbnail */}
                    <div className="relative h-48 overflow-hidden bg-stone-100">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="bg-stone-900/80 backdrop-blur-md text-stone-100 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                          {article.category}
                        </span>
                        {article.isEditorPick && (
                          <span className="bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center space-x-1 shadow-xs">
                            <Award className="w-3 h-3" />
                            <span>Editor Pick</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-2 text-[11px] text-stone-500 mb-2">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span>
                              <HighlightText text={article.locality} highlight={searchQuery} />
                            </span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>{article.readTimeMinutes} min read</span>
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors leading-snug mb-2 line-clamp-2">
                          <HighlightText text={article.title} highlight={searchQuery} />
                        </h3>

                        <p className="text-stone-600 text-xs leading-relaxed line-clamp-3 mb-4">
                          <HighlightText text={article.excerpt} highlight={searchQuery} />
                        </p>
                      </div>

                      <div>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {article.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(t);
                              }}
                              className="text-[10px] text-stone-500 bg-stone-100 hover:bg-amber-50 hover:text-amber-800 px-2 py-0.5 rounded-md transition-colors"
                            >
                              #<HighlightText text={t} highlight={searchQuery} />
                            </span>
                          ))}
                        </div>

                        {/* Author & Engagement Footer */}
                        <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAuthor(article.author);
                            }}
                            className="flex items-center space-x-2 group/author"
                          >
                            <img
                              src={article.author.avatar}
                              alt={article.author.name}
                              className="w-7 h-7 rounded-full object-cover border border-stone-200 group-hover/author:border-amber-600"
                            />
                            <span className="text-xs font-medium text-stone-800 group-hover/author:text-amber-800">
                              <HighlightText text={article.author.name} highlight={searchQuery} />
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-stone-500">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!currentUser) {
                                  onOpenAuthModal('login', 'Sign in to save articles to your personal library.');
                                  return;
                                }
                                onToggleSaveArticle(article.id, e);
                              }}
                              className={`p-1 rounded-md transition-colors cursor-pointer ${
                                currentUser?.savedArticleIds.includes(article.id)
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'text-stone-400 hover:text-amber-800 hover:bg-stone-100'
                              }`}
                              title={currentUser?.savedArticleIds.includes(article.id) ? 'Saved' : 'Save article'}
                            >
                              <Bookmark
                                className={`w-3.5 h-3.5 ${
                                  currentUser?.savedArticleIds.includes(article.id)
                                    ? 'fill-amber-800 text-amber-800'
                                    : ''
                                }`}
                              />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onLikeArticle(article.id, e);
                              }}
                              className="flex items-center space-x-1 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Heart className="w-3.5 h-3.5 text-rose-500" />
                              <span>{article.likes}</span>
                            </button>
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                              <span>{article.commentsCount}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Right Column Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Writer Callout Box */}
            <div className="bg-gradient-to-br from-amber-900 to-stone-900 text-amber-50 rounded-2xl p-6 shadow-sm border border-amber-800/40">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Join Our Writer Guild</span>
              </div>
              <h4 className="font-serif text-xl font-bold mb-2">Have a local story to tell?</h4>
              <p className="text-stone-300 text-xs leading-relaxed mb-4">
                We invite local residents, student journalists, and neighborhood experts to publish articles. Our editorial team provides helpful feedback and support.
              </p>
              <button
                onClick={onCreateArticle}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open Writer Dashboard</span>
              </button>
            </div>

            {/* Popular Local Tags Cloud */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
              <h4 className="font-serif text-sm font-bold text-stone-900 mb-3 flex items-center space-x-2">
                <Tag className="w-4 h-4 text-amber-800" />
                <span>Trending Community Topics</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (selectedTag === tag) {
                        setSelectedTag(null);
                      } else {
                        setSelectedTag(tag);
                        onSearchChange(tag);
                      }
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      selectedTag === tag || searchQuery.toLowerCase() === String(tag).toLowerCase()
                        ? 'bg-amber-800 text-white border-amber-800 font-semibold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Local Columnist Spotlight */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
              <h4 className="font-serif text-sm font-bold text-stone-900 mb-3 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-amber-800" />
                <span>Local Author Spotlight</span>
              </h4>

              <div
                onClick={() => onSelectAuthor(publishedArticles[0]?.author || CURRENT_WRITER)}
                className="p-3 bg-stone-50 rounded-xl border border-stone-200 hover:border-amber-300 transition-colors cursor-pointer flex items-start space-x-3"
              >
                <img
                  src={publishedArticles[0]?.author.avatar || CURRENT_WRITER.avatar}
                  alt="Spotlight Author"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <h5 className="text-xs font-bold text-stone-900">
                    {publishedArticles[0]?.author.name || CURRENT_WRITER.name}
                  </h5>
                  <span className="inline-block text-[10px] font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full mb-1">
                    {publishedArticles[0]?.author.badge || CURRENT_WRITER.badge}
                  </span>
                  <p className="text-[11px] text-stone-600 line-clamp-2">
                    {publishedArticles[0]?.author.bio || CURRENT_WRITER.bio}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

