import React, { useState } from 'react';
import { Article, ArticleStatus, AIReviewResult } from '../types';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Sparkles,
  RefreshCw,
  Send,
  Star,
  FileText,
  MapPin,
  Tag,
  User,
  ThumbsUp,
  Sliders,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface EditorialPortalProps {
  articles: Article[];
  onReviewArticle: (
    articleId: string,
    newStatus: ArticleStatus,
    feedbackText: string,
    rating?: number,
    localRelevanceScore?: number,
    strengths?: string[],
    areasToImprove?: string[]
  ) => void;
  onSelectArticlePreview: (article: Article) => void;
}

export const EditorialPortal: React.FC<EditorialPortalProps> = ({
  articles,
  onReviewArticle,
  onSelectArticlePreview,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('submitted');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Review Form state
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState<number>(4);
  const [localRelevanceScore, setLocalRelevanceScore] = useState<number>(85);
  const [strengthsText, setStrengthsText] = useState('');
  const [improvementsText, setImprovementsText] = useState('');

  // AI Review state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIReviewResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Filtered queue
  const pendingQueue = articles.filter((a) => a.status === 'submitted');
  const changesRequestedQueue = articles.filter((a) => a.status === 'changes_requested');
  const publishedQueue = articles.filter((a) => a.status === 'published');
  const rejectedQueue = articles.filter((a) => a.status === 'rejected');

  const filteredArticles = articles.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const openReviewModal = (article: Article) => {
    setSelectedArticle(article);
    setFeedbackText(article.editorialReview?.feedbackText || '');
    setRating(article.editorialReview?.rating || 4);
    setLocalRelevanceScore(article.editorialReview?.localRelevanceScore || 85);
    setStrengthsText(article.editorialReview?.strengths?.join('\n') || '');
    setImprovementsText(article.editorialReview?.areasToImprove?.join('\n') || '');
    setAiResult(null);
    setAiError(null);
  };

  const handleRunAiEditorialScan = async () => {
    if (!selectedArticle) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/editorial-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedArticle.title,
          content: selectedArticle.content,
          category: selectedArticle.category,
          locality: selectedArticle.locality,
        }),
      });
      const data: AIReviewResult = await res.json();
      if (data.rating) {
        setAiResult(data);
        setRating(data.rating);
        setLocalRelevanceScore(data.localRelevanceScore);
        if (data.strengths) setStrengthsText(data.strengths.join('\n'));
        if (data.areasToImprove) setImprovementsText(data.areasToImprove.join('\n'));
        if (data.detailedFeedback) setFeedbackText(data.detailedFeedback);
      }
    } catch (err) {
      console.error(err);
      setAiError('Failed to execute AI editorial scan. Verify server Gemini API key.');
    } finally {
      setAiLoading(false);
    }
  };

  const submitDecision = (decision: ArticleStatus) => {
    if (!selectedArticle) return;

    const strengths = strengthsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const areasToImprove = improvementsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    onReviewArticle(
      selectedArticle.id,
      decision,
      feedbackText || 'Reviewed by Editorial Board.',
      rating,
      localRelevanceScore,
      strengths,
      areasToImprove
    );

    setSelectedArticle(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Bar */}
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 shadow-sm border border-stone-800 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Editorial Quality & Desk Board</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white">Community Editorial Review System</h2>
            <p className="text-stone-300 text-xs mt-1">
              Review submitted manuscripts, ensure local journalistic standards, provide writer feedback, and publish stories.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="bg-amber-800 text-amber-50 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-700">
              {pendingQueue.length} Awaiting Desk Review
            </span>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => setStatusFilter('submitted')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'submitted'
                ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                : 'bg-white text-stone-900 border-stone-200 hover:border-amber-400'
            }`}
          >
            <span className="text-xs font-medium opacity-80 block">Awaiting Review</span>
            <span className="text-2xl font-bold mt-1 block">{pendingQueue.length}</span>
          </div>

          <div
            onClick={() => setStatusFilter('changes_requested')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'changes_requested'
                ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                : 'bg-white text-stone-900 border-stone-200 hover:border-amber-400'
            }`}
          >
            <span className="text-xs font-medium opacity-80 block">Changes Requested</span>
            <span className="text-2xl font-bold mt-1 block">{changesRequestedQueue.length}</span>
          </div>

          <div
            onClick={() => setStatusFilter('published')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'published'
                ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                : 'bg-white text-stone-900 border-stone-200 hover:border-amber-400'
            }`}
          >
            <span className="text-xs font-medium opacity-80 block">Published Stories</span>
            <span className="text-2xl font-bold mt-1 block">{publishedQueue.length}</span>
          </div>

          <div
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === 'all'
                ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                : 'bg-white text-stone-900 border-stone-200 hover:border-amber-400'
            }`}
          >
            <span className="text-xs font-medium opacity-80 block">Total Submissions</span>
            <span className="text-2xl font-bold mt-1 block">{articles.length}</span>
          </div>
        </div>

        {/* Editorial Submissions Table */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Submission Desk Queue</h3>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl text-xs border border-stone-200 overflow-x-auto">
              <button
                onClick={() => setStatusFilter('submitted')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'submitted' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'
                }`}
              >
                Pending ({pendingQueue.length})
              </button>
              <button
                onClick={() => setStatusFilter('changes_requested')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'changes_requested' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'
                }`}
              >
                Revisions ({changesRequestedQueue.length})
              </button>
              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'published' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'
                }`}
              >
                Published ({publishedQueue.length})
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'
                }`}
              >
                All ({articles.length})
              </button>
            </div>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <CheckSquare className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="font-serif text-base font-bold text-stone-800">No articles in this queue category</p>
              <p className="text-xs">Switch filters above to inspect other submissions.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
                >
                  <div className="flex items-start space-x-4 max-w-3xl">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                    />

                    <div>
                      <div className="flex items-center space-x-2 text-xs mb-1">
                        <span className="font-semibold text-amber-800">{article.category}</span>
                        <span>•</span>
                        <span className="text-stone-500">{article.locality}</span>
                        <span>•</span>
                        {/* Status pill */}
                        {article.status === 'submitted' && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Requires Review
                          </span>
                        )}
                        {article.status === 'published' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Published
                          </span>
                        )}
                        {article.status === 'changes_requested' && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Revisions Sent
                          </span>
                        )}
                        {article.status === 'draft' && (
                          <span className="bg-stone-100 text-stone-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            Author Draft
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif text-base font-bold text-stone-900 hover:text-amber-800 transition-colors cursor-pointer" onClick={() => onSelectArticlePreview(article)}>
                        {article.title}
                      </h4>

                      <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{article.excerpt}</p>

                      <div className="flex items-center space-x-3 text-[11px] text-stone-500 mt-2">
                        <span>Submitted by <strong className="text-stone-800">{article.author.name}</strong></span>
                        <span>•</span>
                        <span>Submitted: {new Date(article.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                    <button
                      onClick={() => onSelectArticlePreview(article)}
                      className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg text-xs cursor-pointer flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>

                    <button
                      onClick={() => openReviewModal(article)}
                      className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center space-x-1 shadow-2xs"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Review Submission</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editorial Review Modal Drawer */}
        {selectedArticle && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
              {/* Modal Top Bar */}
              <div className="px-6 py-4 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-400 font-semibold uppercase tracking-wide">
                    Editorial Review Workspace
                  </span>
                  <h3 className="font-serif text-lg font-bold">{selectedArticle.title}</h3>
                </div>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-stone-400 hover:text-white text-sm font-bold p-2"
                >
                  ✕
                </button>
              </div>

              {/* Modal Workspace Body (2 Columns: Article View on Left, Editorial Panel on Right) */}
              <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Article Manuscript */}
                <div className="lg:col-span-7 bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-200 pb-3">
                    <div>
                      <span className="font-bold text-stone-900">{selectedArticle.author.name}</span> ({selectedArticle.author.locality})
                    </div>
                    <span>Read Time: {selectedArticle.readTimeMinutes} min</span>
                  </div>

                  <img
                    src={selectedArticle.coverImage}
                    alt={selectedArticle.title}
                    className="w-full h-48 object-cover rounded-xl border border-stone-200"
                  />

                  <div className="p-3 bg-white rounded-xl border border-stone-200 italic text-stone-700 text-xs">
                    "{selectedArticle.excerpt}"
                  </div>

                  <div className="prose prose-stone text-xs leading-relaxed space-y-3">
                    {selectedArticle.content.split('\n\n').map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>

                {/* Right Column: Editorial Decision Controls */}
                <div className="lg:col-span-5 space-y-5">
                  {/* AI Pre-Review Assistant Card */}
                  <div className="bg-gradient-to-br from-amber-900 to-stone-900 text-amber-50 p-4 rounded-2xl border border-amber-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold uppercase">
                        <Sparkles className="w-4 h-4" />
                        <span>Gemini AI Editorial Assistant</span>
                      </div>
                      <button
                        onClick={handleRunAiEditorialScan}
                        disabled={aiLoading}
                        className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-1 rounded-lg text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Run AI Scan</span>}
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-300">
                      Scans clarity, local relevance score, and generates objective strengths & editorial feedback.
                    </p>

                    {aiError && <p className="text-xs text-rose-300 font-medium">{aiError}</p>}

                    {aiResult && (
                      <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-amber-300 font-bold">
                          <span>Local Relevance: {aiResult.localRelevanceScore}/100</span>
                          <span>Rating: {aiResult.rating}★</span>
                        </div>
                        <p className="text-stone-300 italic">{aiResult.detailedFeedback}</p>
                      </div>
                    )}
                  </div>

                  {/* Rating & Local Score Inputs */}
                  <div className="space-y-4 bg-white p-4 rounded-2xl border border-stone-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Quality Rating
                        </label>
                        <select
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs font-bold"
                        >
                          <option value={5}>5 Stars - Outstanding</option>
                          <option value={4}>4 Stars - Solid Story</option>
                          <option value={3}>3 Stars - Needs Work</option>
                          <option value={2}>2 Stars - Substandard</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                          Local Score (1-100)
                        </label>
                        <input
                          type="number"
                          value={localRelevanceScore}
                          onChange={(e) => setLocalRelevanceScore(Number(e.target.value))}
                          min={1}
                          max={100}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs font-bold"
                        />
                      </div>
                    </div>

                    {/* Editorial Feedback Text */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                        Editorial Notes / Feedback for Writer *
                      </label>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Provide clear notes to the author regarding strengths or requested revisions..."
                        rows={4}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>

                    {/* Decision Action Buttons */}
                    <div className="space-y-2 border-t border-stone-200 pt-3">
                      <button
                        onClick={() => submitDecision('published')}
                        className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Publish to Gazette</span>
                      </button>

                      <button
                        onClick={() => submitDecision('changes_requested')}
                        className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer transition-all"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Send Back with Revision Requests</span>
                      </button>

                      <button
                        onClick={() => submitDecision('rejected')}
                        className="w-full bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-800 font-semibold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline Article</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
