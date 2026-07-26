import React, { useState } from 'react';
import { Author, Article, User } from '../types';
import { X, MapPin, BookOpen, Send, CheckCircle2, Feather, UserCheck, UserPlus } from 'lucide-react';

interface AuthorProfileModalProps {
  currentUser: User | null;
  author: Author;
  articles: Article[];
  onClose: () => void;
  onSelectArticle: (article: Article) => void;
  onToggleFollowAuthor?: (authorId: string) => void;
  onOpenAuthModal?: (tab?: 'login' | 'register', prompt?: string) => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({
  currentUser,
  author,
  articles,
  onClose,
  onSelectArticle,
  onToggleFollowAuthor,
  onOpenAuthModal,
}) => {
  const [messageText, setMessageText] = useState('');
  const [sentMessage, setSentMessage] = useState(false);

  const authorArticles = articles.filter(
    (a) => a.author.id === author.id && a.status === 'published'
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSentMessage(true);
    setTimeout(() => {
      setMessageText('');
      setSentMessage(false);
    }, 3000);
  };

  // Handle Escape key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] relative"
      >
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-stone-900 to-amber-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-stone-800/90 hover:bg-amber-900 text-stone-200 hover:text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 border border-stone-700 shadow-md cursor-pointer transition-all active:scale-95 z-10"
            title="Exit profile (Esc)"
          >
            <X className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            <span>Exit</span>
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-amber-500/40 shadow-md"
            />

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="font-serif text-2xl font-bold">{author.name}</h3>
                <span className="bg-amber-800 text-amber-100 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-700">
                  {author.badge}
                </span>
              </div>

              <p className="text-stone-300 text-xs max-w-md mb-2">{author.bio}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                <div className="flex items-center space-x-3 text-xs text-amber-300">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{author.locality}</span>
                  </span>
                  <span>•</span>
                  <span>{authorArticles.length} Published Gazette Articles</span>
                </div>

                {onToggleFollowAuthor && (
                  <button
                    onClick={() => {
                      if (!currentUser && onOpenAuthModal) {
                        onOpenAuthModal('login', `Sign in to follow ${author.name}.`);
                        return;
                      }
                      onToggleFollowAuthor(author.id);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                      currentUser?.followedAuthorIds.includes(author.id)
                        ? 'bg-amber-100 text-stone-900 hover:bg-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs'
                    }`}
                  >
                    {currentUser?.followedAuthorIds.includes(author.id) ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Following Author</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow Writer</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Author's Published Articles */}
          <div>
            <h4 className="font-serif text-base font-bold text-stone-900 mb-3 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-amber-800" />
              <span>Articles by {author.name}</span>
            </h4>

            {authorArticles.length === 0 ? (
              <p className="text-xs text-stone-500 italic">No published articles yet.</p>
            ) : (
              <div className="space-y-3">
                {authorArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => {
                      onClose();
                      onSelectArticle(art);
                    }}
                    className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 hover:border-amber-400 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-amber-800 uppercase">
                        {art.category}
                      </span>
                      <h5 className="font-serif text-sm font-bold text-stone-900 hover:text-amber-800">
                        {art.title}
                      </h5>
                      <p className="text-stone-500 text-xs line-clamp-1">{art.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Author Section */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <h4 className="font-serif text-xs font-bold text-stone-800 uppercase tracking-wide mb-2 flex items-center space-x-1.5">
              <Feather className="w-3.5 h-3.5 text-amber-800" />
              <span>Send Reader Note or Tip to Author</span>
            </h4>

            {sentMessage ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Your message has been sent to {author.name}!</span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-2">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Write a friendly note, question, or news tip to ${author.name}...`}
                  rows={3}
                  className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Direct Note</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
