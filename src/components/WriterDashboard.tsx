import React, { useState } from 'react';
import { Article, ArticleStatus, Category, Author, AIHeadlineIdeasResult, AIProofreadResult } from '../types';
import {
  PenTool,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Heart,
  Sparkles,
  Send,
  Save,
  Trash2,
  Edit3,
  Tag,
  MapPin,
  Image as ImageIcon,
  Wand2,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface WriterDashboardProps {
  articles: Article[];
  categories: Category[];
  currentWriter: Author;
  onSaveArticle: (articleData: Partial<Article>, submitForReview: boolean) => void;
  onDeleteArticle: (articleId: string) => void;
  onSelectArticlePreview: (article: Article) => void;
  initialEditingArticle?: Article | null;
}

const PRESET_COVER_IMAGES = [
  { label: 'Market & Vendors', url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Local Cafe & Coffee', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Park & Wetlands', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Robotics & STEM', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200' },
  { label: 'City Street & Architecture', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Harvest & Agriculture', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1200' },
];

export const WriterDashboard: React.FC<WriterDashboardProps> = ({
  articles,
  categories,
  currentWriter,
  onSaveArticle,
  onDeleteArticle,
  onSelectArticlePreview,
  initialEditingArticle,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'aiTools'>('list');
  const [editingId, setEditingId] = useState<string | null>(initialEditingArticle?.id || null);

  // Form State
  const [title, setTitle] = useState(initialEditingArticle?.title || '');
  const [category, setCategory] = useState(initialEditingArticle?.category || categories[0]?.name || 'Local News');
  const [locality, setLocality] = useState(initialEditingArticle?.locality || currentWriter.locality);
  const [excerpt, setExcerpt] = useState(initialEditingArticle?.excerpt || '');
  const [content, setContent] = useState(initialEditingArticle?.content || '');
  const [coverImage, setCoverImage] = useState(
    initialEditingArticle?.coverImage || PRESET_COVER_IMAGES[0].url
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(
    initialEditingArticle?.tags || ['OakridgeNews', 'Community']
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHeadlines, setAiHeadlines] = useState<string[]>([]);
  const [aiProofread, setAiProofread] = useState<AIProofreadResult | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Filter writer's articles
  const writerArticles = articles.filter((a) => a.author.id === currentWriter.id);

  // Stats
  const publishedCount = writerArticles.filter((a) => a.status === 'published').length;
  const submittedCount = writerArticles.filter((a) => a.status === 'submitted').length;
  const changesRequestedCount = writerArticles.filter((a) => a.status === 'changes_requested').length;
  const draftCount = writerArticles.filter((a) => a.status === 'draft').length;
  const totalViews = writerArticles.reduce((acc, a) => acc + a.views, 0);
  const totalLikes = writerArticles.reduce((acc, a) => acc + a.likes, 0);

  const startNewArticle = () => {
    setEditingId(null);
    setTitle('');
    setCategory(categories[0]?.name || 'Local News');
    setLocality(currentWriter.locality);
    setExcerpt('');
    setContent('');
    setCoverImage(PRESET_COVER_IMAGES[0].url);
    setTags(['OakridgeNews', 'Community']);
    setActiveTab('editor');
  };

  const loadArticleForEditing = (art: Article) => {
    setEditingId(art.id);
    setTitle(art.title);
    setCategory(art.category);
    setLocality(art.locality);
    setExcerpt(art.excerpt);
    setContent(art.content);
    setCoverImage(art.coverImage);
    setTags(art.tags);
    setActiveTab('editor');
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.replace(/#/g, '').trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFormSubmit = (submitForReview: boolean) => {
    if (!title.trim() || !content.trim()) {
      alert('Please provide a title and main content before saving.');
      return;
    }

    // Auto calculate read time
    const words = content.trim().split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));

    const articleData: Partial<Article> = {
      id: editingId || `art-${Date.now()}`,
      title,
      content,
      excerpt: excerpt.trim() || content.slice(0, 150) + '...',
      category,
      locality,
      coverImage,
      tags,
      readTimeMinutes,
    };

    onSaveArticle(articleData, submitForReview);
    setActiveTab('list');
  };

  // AI Endpoint Calls
  const handleGenerateAIHeadlines = async () => {
    if (!content.trim()) {
      alert('Please enter some article draft content first.');
      return;
    }
    setAiLoading(true);
    setAiMessage(null);
    try {
      const res = await fetch('/api/ai/headline-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category, locality }),
      });
      const data: AIHeadlineIdeasResult = await res.json();
      if (data.headlines) {
        setAiHeadlines(data.headlines);
        if (data.excerpt && !excerpt) setExcerpt(data.excerpt);
        if (data.tags && data.tags.length > 0) {
          const merged = Array.from(new Set([...tags, ...data.tags.map((t) => t.replace('#', ''))]));
          setTags(merged);
        }
        setAiMessage('AI generated headlines and auto-filled tags & excerpt!');
      }
    } catch (err) {
      console.error(err);
      setAiMessage('Failed to connect to AI server. Please verify GEMINI_API_KEY.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIProofread = async () => {
    if (!content.trim()) {
      alert('Please write article content before running AI proofread.');
      return;
    }
    setAiLoading(true);
    setAiMessage(null);
    try {
      const res = await fetch('/api/ai/proofread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data: AIProofreadResult = await res.json();
      if (data.polishedText) {
        setAiProofread(data);
        setAiMessage('AI proofread complete! You can review suggestions below.');
      }
    } catch (err) {
      console.error(err);
      setAiMessage('Failed to run AI proofread.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Profile Section */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={currentWriter.avatar}
              alt={currentWriter.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-600 shadow-xs"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-2xl font-bold text-stone-900">{currentWriter.name}</h2>
                <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                  {currentWriter.badge}
                </span>
              </div>
              <p className="text-stone-500 text-xs mt-0.5 max-w-xl">{currentWriter.bio}</p>
              <div className="flex items-center space-x-3 text-xs text-stone-600 mt-2">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  <span>{currentWriter.locality}</span>
                </span>
                <span>•</span>
                <span>{writerArticles.length} Total Submissions</span>
              </div>
            </div>
          </div>

          <button
            onClick={startNewArticle}
            className="w-full md:w-auto bg-amber-800 hover:bg-amber-900 text-white font-medium px-5 py-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>Create New Article</span>
          </button>
        </div>

        {/* Writer Stats Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-medium block">Published</span>
            <span className="text-xl font-bold text-emerald-700 mt-1 block">{publishedCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-medium block">In Editorial Review</span>
            <span className="text-xl font-bold text-amber-700 mt-1 block">{submittedCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-medium block">Changes Requested</span>
            <span className="text-xl font-bold text-rose-700 mt-1 block">{changesRequestedCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-medium block">Saved Drafts</span>
            <span className="text-xl font-bold text-stone-700 mt-1 block">{draftCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-medium block">Total Views</span>
            <span className="text-xl font-bold text-stone-900 mt-1 block">{totalViews}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-xs text-stone-500 font-medium block">Total Applauds</span>
            <span className="text-xl font-bold text-rose-600 mt-1 block">{totalLikes}</span>
          </div>
        </div>

        {/* Dashboard Section Switcher */}
        <div className="flex border-b border-stone-200 mb-6 bg-white rounded-xl p-1 shadow-2xs max-w-md">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'list'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            My Articles ({writerArticles.length})
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'editor'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {editingId ? 'Edit Draft' : 'New Article'}
          </button>
          <button
            onClick={() => setActiveTab('aiTools')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'aiTools'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Coach</span>
          </button>
        </div>

        {/* TAB 1: ARTICLES LIST */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900">Your Articles & Submissions</h3>
              <span className="text-xs text-stone-500">
                Track status, review editor feedback, or update drafts.
              </span>
            </div>

            {writerArticles.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h4 className="font-serif text-base font-bold text-stone-800 mb-1">
                  You haven't written any articles yet
                </h4>
                <p className="text-stone-500 text-xs mb-4">
                  Share a local story, interview a business owner, or report on a neighborhood event.
                </p>
                <button
                  onClick={startNewArticle}
                  className="bg-amber-800 text-white text-xs px-4 py-2 rounded-xl font-medium"
                >
                  Write Your First Article
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {writerArticles.map((art) => (
                  <div key={art.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors">
                    <div className="flex items-start space-x-4 max-w-2xl">
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-stone-200"
                      />
                      <div>
                        <div className="flex items-center space-x-2 text-xs mb-1">
                          <span className="font-semibold text-amber-800">{art.category}</span>
                          <span>•</span>
                          <span className="text-stone-500">{art.locality}</span>
                          <span>•</span>
                          {/* Status Badge */}
                          {art.status === 'published' && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                              Published
                            </span>
                          )}
                          {art.status === 'submitted' && (
                            <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-200">
                              Pending Review
                            </span>
                          )}
                          {art.status === 'changes_requested' && (
                            <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-rose-200">
                              Action Required
                            </span>
                          )}
                          {art.status === 'draft' && (
                            <span className="bg-stone-100 text-stone-700 text-[10px] px-2 py-0.5 rounded-full font-medium border border-stone-200">
                              Draft
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif text-base font-bold text-stone-900 hover:text-amber-800 transition-colors cursor-pointer" onClick={() => onSelectArticlePreview(art)}>
                          {art.title}
                        </h4>

                        <p className="text-stone-500 text-xs line-clamp-1 mt-0.5">{art.excerpt}</p>

                        {/* Editor Feedback Banner if changes requested */}
                        {art.editorialReview && art.status === 'changes_requested' && (
                          <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
                            <span className="font-bold block mb-0.5">Editor Notes:</span>
                            <p>{art.editorialReview.feedbackText}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                      <button
                        onClick={() => onSelectArticlePreview(art)}
                        className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg text-xs cursor-pointer flex items-center space-x-1"
                        title="Preview Article"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>

                      <button
                        onClick={() => loadArticleForEditing(art)}
                        className="p-2 bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 rounded-lg text-xs font-medium cursor-pointer flex items-center space-x-1 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => onDeleteArticle(art.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ARTICLE EDITOR FORM */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Main Form */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    {editingId ? 'Edit Article Draft' : 'Write New Community Article'}
                  </h3>
                  <p className="text-stone-500 text-xs">
                    Craft your local report, personal essay, or neighborhood news.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isPreviewMode
                        ? 'bg-amber-800 text-white border-amber-800'
                        : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {isPreviewMode ? 'Back to Editor' : 'Live Preview'}
                  </button>
                </div>
              </div>

              {!isPreviewMode ? (
                <div className="space-y-5">
                  {/* Article Title */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Restoring the Historic Elm Street Farmers Market"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-serif font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder-stone-400"
                    />
                  </div>

                  {/* Category & Locality */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Neighborhood / Locality
                      </label>
                      <input
                        type="text"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        placeholder="e.g., Downtown Core, Oakridge West"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  {/* Short Excerpt */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Short Excerpt (Summary for Cards)
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="A 2-sentence summary that grabs the reader's attention on the home page..."
                      rows={2}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Cover Image Selector */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Cover Photo
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                      {PRESET_COVER_IMAGES.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setCoverImage(img.url)}
                          className={`relative h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                            coverImage === img.url ? 'border-amber-700 ring-2 ring-amber-500/30' : 'border-stone-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="Or paste custom image URL..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-600"
                    />
                  </div>

                  {/* Body Text Content */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Main Story Content (Markdown supported: ### Headers, &gt; Quotes, - Lists) *
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your article here..."
                      rows={12}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm font-sans leading-relaxed text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Tags
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="Add tag (e.g. ElmStreet, FarmersMarket)..."
                        className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="bg-stone-800 text-white text-xs px-3 py-1.5 rounded-xl font-medium"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-lg flex items-center space-x-1 font-medium"
                        >
                          <span>#{t}</span>
                          <button
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-red-700 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-stone-200 pt-5">
                    <button
                      type="button"
                      onClick={() => handleFormSubmit(false)}
                      className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save as Draft</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFormSubmit(true)}
                      className="w-full sm:w-auto bg-amber-800 hover:bg-amber-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit to Editorial Board</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Live Preview Mode */
                <div className="space-y-6">
                  <div className="p-3 bg-amber-50 text-amber-900 text-xs font-semibold rounded-xl border border-amber-200">
                    Showing Live Reader Preview
                  </div>
                  <h1 className="font-serif text-3xl font-bold text-stone-900">{title || 'Untitled Article'}</h1>
                  <div className="text-xs text-stone-500">
                    Category: {category} • Locality: {locality}
                  </div>
                  {coverImage && (
                    <img src={coverImage} alt="Preview" className="w-full h-64 object-cover rounded-xl border border-stone-200" />
                  )}
                  <p className="italic text-stone-700 bg-stone-50 p-3 rounded-lg border-l-4 border-amber-800">
                    "{excerpt || 'No excerpt provided.'}"
                  </p>
                  <div className="prose prose-stone max-w-none text-sm space-y-3">
                    {content ? (
                      content.split('\n\n').map((p, i) => <p key={i}>{p}</p>)
                    ) : (
                      <p className="text-stone-400 italic">No content written yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Gemini AI Writing Coach Assistant */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 shadow-sm border border-stone-800 space-y-4">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini AI Local Writing Assistant</span>
                </div>

                <p className="text-stone-300 text-xs leading-relaxed">
                  Get instant AI suggestions on catchy local headlines, auto-generated excerpts, community tags, and tone proofreading.
                </p>

                {aiMessage && (
                  <div className="p-3 bg-amber-950/80 text-amber-200 text-xs rounded-xl border border-amber-800">
                    {aiMessage}
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleGenerateAIHeadlines}
                    disabled={aiLoading}
                    className="w-full bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-amber-100 font-medium py-2.5 px-3 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer border border-stone-700"
                  >
                    <span className="flex items-center space-x-2">
                      <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Suggest Local Headlines & Tags</span>
                    </span>
                    {aiLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleAIProofread}
                    disabled={aiLoading}
                    className="w-full bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-amber-100 font-medium py-2.5 px-3 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer border border-stone-700"
                  >
                    <span className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Proofread & Polish Tone</span>
                    </span>
                    {aiLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                  </button>
                </div>

                {/* AI Headline Recommendations Output */}
                {aiHeadlines.length > 0 && (
                  <div className="bg-stone-950/90 rounded-xl p-3 border border-stone-800 space-y-2">
                    <span className="text-xs font-bold text-amber-400 block">Click a Headline to Apply:</span>
                    <ul className="space-y-1.5">
                      {aiHeadlines.map((h, i) => (
                        <li
                          key={i}
                          onClick={() => setTitle(h)}
                          className="text-xs text-stone-200 hover:text-amber-300 p-2 rounded bg-stone-900 hover:bg-amber-950 cursor-pointer transition-colors border border-stone-800"
                        >
                          "{h}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Proofread Output */}
                {aiProofread && (
                  <div className="bg-stone-950/90 rounded-xl p-3 border border-stone-800 space-y-2 text-xs">
                    <span className="font-bold text-emerald-400 block">AI Polished Version:</span>
                    <p className="text-stone-300 italic max-h-40 overflow-y-auto bg-stone-900 p-2 rounded">
                      "{aiProofread.polishedText}"
                    </p>
                    <button
                      onClick={() => setContent(aiProofread.polishedText)}
                      className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-medium py-1.5 rounded-lg text-[11px]"
                    >
                      Apply Polished Text to Article
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI COACH ONLY */}
        {activeTab === 'aiTools' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-2xs max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-3 text-amber-800 mb-2">
              <Sparkles className="w-6 h-6" />
              <h3 className="font-serif text-xl font-bold">Local Journalism AI Assistant</h3>
            </div>

            <p className="text-stone-600 text-xs leading-relaxed">
              Our embedded Gemini AI model helps community writers draft balanced stories, verify local focus, and format excerpts.
            </p>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-xs text-amber-900">
              <span className="font-bold block">Editorial Quality Checklist:</span>
              <ul className="list-disc pl-5 space-y-1">
                <li>Local Relevance: Ensures stories highlight Oakridge neighborhoods or civic issues.</li>
                <li>Balanced Perspectives: Encourages including voices from local merchants and residents.</li>
                <li>Community Tone: Keeps writing respectful, clear, and engaging.</li>
              </ul>
            </div>

            <button
              onClick={() => setActiveTab('editor')}
              className="bg-amber-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold"
            >
              Open Story Editor & Try AI Tools
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
