import React, { useState, useRef, useEffect } from 'react';
import { Article, Comment, Author, UserRole, User } from '../types';
import {
  X,
  Heart,
  MessageSquare,
  Clock,
  MapPin,
  Share2,
  Bookmark,
  CheckCircle2,
  Award,
  Send,
  User as UserIcon,
  Sparkles,
  Calendar,
  AlertCircle,
  FileText,
  Download,
  Printer,
  Compass,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  UserCheck,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Headphones,
} from 'lucide-react';

interface ArticleDetailModalProps {
  currentUser: User | null;
  article: Article;
  comments: Comment[];
  currentRole: UserRole;
  allArticles?: Article[];
  onClose: () => void;
  onLikeArticle: (articleId: string) => void;
  onAddComment: (articleId: string, text: string, isVerifiedResident: boolean) => void;
  onLikeComment: (commentId: string) => void;
  onSelectAuthor: (author: Author) => void;
  onSelectArticle?: (article: Article) => void;
  onToggleSaveArticle: (articleId: string) => void;
  onToggleFollowAuthor: (authorId: string) => void;
  onOpenAuthModal: (tab?: 'login' | 'register', prompt?: string) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  currentUser,
  article,
  comments,
  currentRole,
  allArticles = [],
  onClose,
  onLikeArticle,
  onAddComment,
  onLikeComment,
  onSelectAuthor,
  onSelectArticle,
  onToggleSaveArticle,
  onToggleFollowAuthor,
  onOpenAuthModal,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // SpeechSynthesis State
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechVoices, setSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const scrollRef = useRef<HTMLDivElement>(null);

  const articleComments = comments.filter((c) => c.articleId === article.id);

  // Load available speech voices
  const getVoiceId = (v: SpeechSynthesisVoice, index: number) =>
    v.voiceURI ? `${v.voiceURI}-${index}` : `${v.name}-${v.lang}-${index}`;

  useEffect(() => {
    if (!isSpeechSupported) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setSpeechVoices(available);
      if (available.length > 0 && !selectedVoiceURI) {
        const englishIndex = available.findIndex((v) => v.lang.startsWith('en'));
        const targetIdx = englishIndex !== -1 ? englishIndex : 0;
        setSelectedVoiceURI(getVoiceId(available[targetIdx], targetIdx));
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [isSpeechSupported, selectedVoiceURI]);

  // Find voice by unique VoiceId
  const getSelectedVoice = () => {
    if (!selectedVoiceURI) return undefined;
    return speechVoices.find((v, idx) => getVoiceId(v, idx) === selectedVoiceURI);
  };

  // Stop speech on article change or modal unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article.id]);

  // Reset speech states when article changes
  useEffect(() => {
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
  }, [article.id]);

  // Clean markdown syntax for smooth speech output
  const getCleanTextToSpeak = (art: Article) => {
    const cleanBody = art.content
      .replace(/###\s+/g, '')
      .replace(/>\s+/g, '')
      .replace(/-\s+/g, '')
      .replace(/[*_~`]/g, '');
    return `${art.title}. Written by ${art.author.name}. ${art.excerpt}. ${cleanBody}`;
  };

  const handleTogglePlaySpeech = () => {
    if (!isSpeechSupported) return;

    if (isPlayingSpeech) {
      if (isPausedSpeech) {
        window.speechSynthesis.resume();
        setIsPausedSpeech(false);
      } else {
        window.speechSynthesis.pause();
        setIsPausedSpeech(true);
      }
    } else {
      window.speechSynthesis.cancel();
      const text = getCleanTextToSpeak(article);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;

      const v = getSelectedVoice();
      if (v) utterance.voice = v;

      utterance.onend = () => {
        setIsPlayingSpeech(false);
        setIsPausedSpeech(false);
      };

      utterance.onerror = () => {
        setIsPlayingSpeech(false);
        setIsPausedSpeech(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlayingSpeech(true);
      setIsPausedSpeech(false);
    }
  };

  const handleStopSpeech = () => {
    if (!isSpeechSupported) return;
    window.speechSynthesis.cancel();
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
  };

  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      const text = getCleanTextToSpeak(article);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = newRate;
      const v = getSelectedVoice();
      if (v) utterance.voice = v;
      utterance.onend = () => {
        setIsPlayingSpeech(false);
        setIsPausedSpeech(false);
      };
      utterance.onerror = () => {
        setIsPlayingSpeech(false);
        setIsPausedSpeech(false);
      };
      window.speechSynthesis.speak(utterance);
      setIsPlayingSpeech(true);
      setIsPausedSpeech(false);
    }
  };

  // Reset scroll and progress when switching articles
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    setReadingProgress(0);
  }, [article.id]);

  // Handle Escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Compute recommended articles sharing category or tags
  const recommendedArticles = allArticles
    .filter((a) => a.id !== article.id && a.status === 'published')
    .map((a) => {
      let score = 0;
      if (a.category === article.category) score += 3;
      const commonTags = a.tags.filter((tag) => article.tags.includes(tag));
      score += commonTags.length * 2;
      if (a.locality === article.locality) score += 1;
      return { article: a, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.article.publishedAt || b.article.createdAt).getTime() -
          new Date(a.article.publishedAt || a.article.createdAt).getTime()
    )
    .slice(0, 3)
    .map((item) => item.article);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const totalScroll = scrollHeight - clientHeight;
      if (totalScroll > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / totalScroll) * 100));
        setReadingProgress(progress);
      } else {
        setReadingProgress(100);
      }
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(article.id, commentText.trim(), isVerified);
    setCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const publishedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString(
      undefined,
      { month: 'long', day: 'numeric', year: 'numeric' }
    );

    const formattedContent = article.content
      .split('\n\n')
      .map((paragraph) => {
        const trimmed = paragraph.trim();
        if (trimmed.startsWith('### ')) {
          return `<h3>${trimmed.replace('### ', '')}</h3>`;
        }
        if (trimmed.startsWith('> ')) {
          return `<blockquote>${trimmed.replace('> ', '')}</blockquote>`;
        }
        if (trimmed.startsWith('- ')) {
          const items = trimmed
            .split('\n')
            .map((item) => `<li>${item.replace('- ', '')}</li>`)
            .join('');
          return `<ul>${items}</ul>`;
        }
        return `<p>${trimmed}</p>`;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${article.title.replace(/"/g, '&quot;')} - The Oakridge Gazette</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,700;1,6..72,400&display=swap');
            body {
              font-family: 'Newsreader', Georgia, serif;
              color: #1c1917;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.65;
              background-color: #ffffff;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #78350f;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .masthead {
              font-family: 'Cinzel', serif;
              font-size: 26px;
              font-weight: 700;
              color: #78350f;
              letter-spacing: 2px;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .subhead {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #78716c;
            }
            .meta-bar {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #57534e;
              border-top: 1px solid #e7e5e4;
              border-bottom: 1px solid #e7e5e4;
              padding: 8px 0;
              margin-bottom: 20px;
            }
            h1 {
              font-size: 28px;
              line-height: 1.25;
              margin-bottom: 14px;
              color: #0c0a09;
            }
            .cover-img {
              width: 100%;
              max-height: 320px;
              object-fit: cover;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .excerpt {
              font-style: italic;
              font-size: 15px;
              background: #fafaf9;
              padding: 12px 18px;
              border-left: 4px solid #78350f;
              margin-bottom: 24px;
              color: #44403c;
            }
            .content {
              font-size: 15px;
              color: #292524;
            }
            .content p {
              margin-bottom: 16px;
              text-align: justify;
            }
            .content h3 {
              font-size: 18px;
              color: #1c1917;
              margin-top: 24px;
              margin-bottom: 8px;
            }
            blockquote {
              border-left: 3px solid #d97706;
              padding-left: 14px;
              margin: 16px 0;
              font-style: italic;
              color: #57534e;
            }
            ul {
              padding-left: 20px;
              margin-bottom: 16px;
            }
            li {
              margin-bottom: 4px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 16px;
              border-top: 1px solid #e7e5e4;
              text-align: center;
              font-size: 11px;
              color: #a8a29e;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="masthead">The Oakridge Gazette</div>
            <div class="subhead">Community Journalism & Local Resident Desk</div>
          </div>
          <h1>${article.title}</h1>
          <div class="meta-bar">
            <div><strong>By:</strong> ${article.author.name} (${article.author.locality})</div>
            <div><strong>Category:</strong> ${article.category} | <strong>Published:</strong> ${publishedDate}</div>
          </div>
          ${article.coverImage ? `<img src="${article.coverImage}" class="cover-img" alt="${article.title.replace(/"/g, '&quot;')}" />` : ''}
          <div class="excerpt">"${article.excerpt}"</div>
          <div class="content">
            ${formattedContent}
          </div>
          <div class="footer">
            Printed from The Oakridge Gazette • Verified Local Journalism • ${new Date().toLocaleDateString()}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in duration-200 relative"
      >
        {/* Sticky Modal Top Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-stone-200 bg-stone-50/95 flex flex-wrap items-center justify-between gap-2 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center space-x-2 text-xs text-stone-500">
            <button
              onClick={onClose}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold text-xs transition-all cursor-pointer mr-1"
              title="Return to blog list"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-800" />
              <span>Back</span>
            </button>

            <span className="font-semibold text-amber-800 uppercase tracking-wider hidden xs:inline">
              {article.category}
            </span>
            <span className="hidden xs:inline">•</span>
            <span className="hidden sm:flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{article.locality}</span>
            </span>
            <span className="bg-amber-100/70 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-200">
              {Math.round(readingProgress)}% Read
            </span>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 ml-auto">
            <button
              onClick={handleTogglePlaySpeech}
              disabled={!isSpeechSupported}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 ${
                isPlayingSpeech
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
              }`}
              title={isPlayingSpeech ? (isPausedSpeech ? 'Resume listening' : 'Pause narration') : 'Listen to this article'}
            >
              <Headphones className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden sm:inline">
                {isPlayingSpeech ? (isPausedSpeech ? 'Resume' : 'Pause') : 'Listen'}
              </span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Export clean PDF document for printing/saving"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export PDF</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuthModal('login', 'Sign in to save favorite articles to your library.');
                  return;
                }
                onToggleSaveArticle(article.id);
              }}
              className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                currentUser?.savedArticleIds.includes(article.id)
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-stone-500 hover:bg-stone-200/60'
              }`}
              title={currentUser?.savedArticleIds.includes(article.id) ? 'Remove from saved' : 'Bookmark story'}
            >
              <Bookmark
                className={`w-4 h-4 ${
                  currentUser?.savedArticleIds.includes(article.id) ? 'fill-amber-800 text-amber-800' : ''
                }`}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 text-stone-500 hover:bg-stone-200/60 rounded-xl text-xs transition-colors cursor-pointer relative"
              title="Share article link"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 bg-stone-900 text-white text-[10px] px-2 py-1 rounded shadow-xs whitespace-nowrap z-30">
                  Link copied!
                </span>
              )}
            </button>

            {/* High-visibility Exit Cross Button */}
            <button
              onClick={onClose}
              className="flex items-center space-x-1.5 bg-stone-900 hover:bg-amber-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 border border-stone-700"
              title="Exit article / Return to blogs (Esc)"
              aria-label="Exit article"
            >
              <X className="w-4 h-4 text-amber-400 stroke-[2.5]" />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Dynamic Reading Progress Bar */}
        <div className="w-full bg-stone-200/60 h-1.5 relative overflow-hidden flex-shrink-0">
          <div
            className="bg-amber-800 h-full transition-all duration-100 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Scrollable Content Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto p-6 sm:p-8 space-y-6"
        >
          {/* Status Alert Banner if not published */}
          {article.status !== 'published' && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wide block mb-0.5">
                  Submission Status: {article.status.replace('_', ' ')}
                </span>
                <p>
                  This story is currently in the writer/editor workflow. Only authorized writers and editors can view this preview.
                </p>
              </div>
            </div>
          )}

          {/* Title & Metadata */}
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 leading-tight mb-4">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-stone-100 text-xs text-stone-600">
              {/* Author Card & Follow Button */}
              <div className="flex items-center space-x-3">
                <div
                  onClick={() => onSelectAuthor(article.author)}
                  className="flex items-center space-x-3 cursor-pointer group"
                >
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-100 group-hover:border-amber-600 transition-colors"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-stone-900 group-hover:text-amber-800">
                        {article.author.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 bg-amber-100 text-amber-900 rounded-full font-medium">
                        {article.author.badge}
                      </span>
                    </div>
                    <span className="text-stone-500 text-[11px]">
                      Resident of {article.author.locality}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!currentUser) {
                      onOpenAuthModal('login', `Sign in to follow ${article.author.name}.`);
                      return;
                    }
                    onToggleFollowAuthor(article.author.id);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    currentUser?.followedAuthorIds.includes(article.author.id)
                      ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                      : 'bg-amber-800 hover:bg-amber-900 text-white shadow-2xs'
                  }`}
                >
                  {currentUser?.followedAuthorIds.includes(article.author.id) ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow Writer</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-4 text-stone-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString(
                      undefined,
                      { month: 'short', day: 'numeric', year: 'numeric' }
                    )}
                  </span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.readTimeMinutes} min read</span>
                </span>
              </div>
            </div>
          </div>

          {/* Audio Reader / Text-to-Speech Player Card */}
          <div className="bg-gradient-to-r from-amber-900/5 via-stone-50 to-amber-900/5 p-4 rounded-2xl border border-amber-800/20 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2.5 rounded-xl transition-all ${
                    isPlayingSpeech && !isPausedSpeech
                      ? 'bg-amber-800 text-white animate-pulse shadow-md'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-serif text-sm font-bold text-stone-900">Audio Edition</h4>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-semibold border border-amber-300/50">
                      Text-to-Speech
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {!isSpeechSupported
                      ? 'Text-to-speech is not supported in this browser.'
                      : isPlayingSpeech
                      ? isPausedSpeech
                        ? 'Narration paused. Click resume to continue.'
                        : 'Narrating article content...'
                      : 'Listen to an audio version of this story'}
                  </p>
                </div>
              </div>

              {/* Speech Playback Controls */}
              <div className="flex items-center space-x-2 self-start sm:self-center">
                <button
                  onClick={handleTogglePlaySpeech}
                  disabled={!isSpeechSupported}
                  className="flex items-center space-x-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  {isPlayingSpeech && !isPausedSpeech ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      <span>Pause Narration</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>{isPausedSpeech ? 'Resume Narration' : 'Listen to this article'}</span>
                    </>
                  )}
                </button>

                {isPlayingSpeech && (
                  <button
                    onClick={handleStopSpeech}
                    className="p-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs transition-all cursor-pointer"
                    title="Stop narration"
                  >
                    <Square className="w-4 h-4 fill-stone-700" />
                  </button>
                )}
              </div>
            </div>

            {/* Extra Speech Controls: Speed & Voice Selector */}
            {isSpeechSupported && (
              <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-amber-800/10 text-xs text-stone-600 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-medium text-stone-500">Speed:</span>
                  {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleRateChange(rate)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        speechRate === rate
                          ? 'bg-amber-800 text-white'
                          : 'bg-stone-200/80 hover:bg-stone-300/80 text-stone-700'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {speechVoices.length > 1 && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-medium text-stone-500 hidden sm:inline">
                      Voice:
                    </span>
                    <select
                      value={selectedVoiceURI}
                      onChange={(e) => {
                        setSelectedVoiceURI(e.target.value);
                        if (isPlayingSpeech) {
                          window.speechSynthesis.cancel();
                          setIsPlayingSpeech(false);
                          setIsPausedSpeech(false);
                        }
                      }}
                      className="bg-white border border-stone-200 rounded-lg text-[11px] px-2 py-1 text-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500 max-w-[200px] truncate"
                    >
                      {speechVoices.map((voice, idx) => {
                        const voiceId = getVoiceId(voice, idx);
                        return (
                          <option key={voiceId} value={voiceId}>
                            {voice.name} ({voice.lang})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cover Image */}
          <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 max-h-[420px]">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Excerpt Box */}
          <div className="p-4 bg-stone-50 border-l-4 border-amber-800 rounded-r-xl italic text-stone-700 text-sm leading-relaxed">
            "{article.excerpt}"
          </div>

          {/* Main Article Body (Formatted) */}
          <div className="prose prose-stone max-w-none text-stone-800 text-sm sm:text-base leading-relaxed space-y-4">
            {article.content.split('\n\n').map((paragraph, idx) => {
              const trimmed = paragraph.trim();
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={idx} className="font-serif text-xl font-bold text-stone-900 pt-3 mb-1">
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={idx} className="border-l-2 border-amber-600 pl-4 py-1 italic text-stone-700 bg-amber-50/50 rounded-r-lg my-2">
                    {trimmed.replace('> ', '')}
                  </blockquote>
                );
              }
              if (trimmed.startsWith('- ')) {
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1 text-stone-700 my-2">
                    {trimmed.split('\n').map((item, i) => (
                      <li key={i}>{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={idx}>{trimmed}</p>;
            })}
          </div>

          {/* Editorial Notes Box if available */}
          {article.editorialReview && (currentRole === 'editor' || currentRole === 'writer') && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-900 border-b border-amber-200 pb-2">
                <span className="flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-amber-800" />
                  <span>Editorial Review Notes ({article.editorialReview.reviewedBy})</span>
                </span>
                <span className="bg-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                  {article.editorialReview.recommendation}
                </span>
              </div>
              <p className="italic">{article.editorialReview.feedbackText}</p>
              {article.editorialReview.strengths && (
                <div className="pt-1">
                  <span className="font-bold text-emerald-800">Strengths:</span>
                  <ul className="list-disc pl-4 text-emerald-900">
                    {article.editorialReview.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Article Engagement Bar */}
          <div className="flex items-center justify-between border-y border-stone-200 py-4 my-6">
            <button
              onClick={() => onLikeArticle(article.id)}
              className="flex items-center space-x-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95"
            >
              <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
              <span>Applaud Story ({article.likes})</span>
            </button>

            <div className="flex items-center space-x-2 text-xs text-stone-500">
              <MessageSquare className="w-4 h-4 text-stone-400" />
              <span>{articleComments.length} Resident Comments</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-6 pt-2">
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-amber-800" />
              <span>Community Discussion</span>
            </h3>

            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts or local perspective on this article..."
                rows={3}
                className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder-stone-400"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="rounded text-amber-800 focus:ring-amber-500"
                  />
                  <span>Mark as Verified Local Resident comment</span>
                </label>

                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Comment</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {articleComments.length === 0 ? (
                <p className="text-xs text-stone-400 italic text-center py-4">
                  No comments yet. Be the first neighbor to respond!
                </p>
              ) : (
                articleComments.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={c.authorAvatar}
                          alt={c.authorName}
                          className="w-7 h-7 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <span className="text-xs font-bold text-stone-900">{c.authorName}</span>
                          {c.isVerifiedResident && (
                            <span className="ml-1.5 text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200 font-medium">
                              Verified Resident
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] text-stone-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed pl-9">{c.content}</p>

                    <div className="pl-9 flex items-center space-x-3 text-[11px] text-stone-500 pt-1">
                      <button
                        onClick={() => onLikeComment(c.id)}
                        className="flex items-center space-x-1 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Heart className="w-3 h-3 text-rose-500" />
                        <span>{c.likes}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommended for You Section */}
          {recommendedArticles.length > 0 && (
            <div className="border-t border-stone-200 pt-8 mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>More Local Stories</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Recommended for You</h3>
                </div>
                <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                  Based on {article.category} & community tags
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommendedArticles.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      if (onSelectArticle) {
                        onSelectArticle(rec);
                      }
                    }}
                    className="group bg-stone-50 hover:bg-stone-100 rounded-2xl border border-stone-200/90 overflow-hidden cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-28 overflow-hidden bg-stone-200">
                        <img
                          src={rec.coverImage}
                          alt={rec.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-stone-700">
                          {rec.category}
                        </span>
                      </div>

                      <div className="p-3.5 space-y-1.5">
                        <h4 className="font-serif text-xs font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                          {rec.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-tight">
                          {rec.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-3.5 pb-3 pt-1 flex items-center justify-between text-[10px] text-stone-400 border-t border-stone-200/50">
                      <span className="font-medium text-stone-700 truncate max-w-[100px]">
                        {rec.author.name}
                      </span>
                      <span>{rec.readTimeMinutes} min read</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Exit Action Bar */}
          <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500">
              Finished reading <span className="font-semibold text-stone-800">{article.title}</span>?
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-stone-900 hover:bg-amber-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4 text-amber-400 stroke-[2.5]" />
              <span>Exit Article & Return to All Stories</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
