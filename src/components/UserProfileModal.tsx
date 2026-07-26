import React, { useState } from 'react';
import { User, Article, Author } from '../types';
import {
  X,
  Bookmark,
  Users,
  UserCheck,
  Edit3,
  LogOut,
  MapPin,
  Clock,
  Heart,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  Trash2,
  Save,
  Feather,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  articles: Article[];
  authors: Author[];
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  onSelectArticle: (article: Article) => void;
  onSelectAuthor: (author: Author) => void;
  onToggleSaveArticle: (articleId: string) => void;
  onToggleFollowAuthor: (authorId: string) => void;
}

const LOCALITIES = [
  'Oakridge West',
  'Downtown Core',
  'River Valley District',
  'Highland Heights',
  'Old Town',
  'Westside',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  articles,
  authors,
  onUpdateUser,
  onLogout,
  onSelectArticle,
  onSelectAuthor,
  onToggleSaveArticle,
  onToggleFollowAuthor,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'following' | 'edit'>('saved');

  // Edit form state
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [locality, setLocality] = useState(currentUser.locality || LOCALITIES[0]);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [badge, setBadge] = useState<User['badge']>(currentUser.badge || 'Local Resident');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Saved articles
  const savedArticles = articles.filter((a) => currentUser.savedArticleIds.includes(a.id));

  // Followed authors
  const followedAuthors = authors.filter((a) => currentUser.followedAuthorIds.includes(a.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      bio: bio.trim(),
      locality,
      avatar,
      badge: currentUser.role === 'writer' ? badge : currentUser.badge,
    };
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] relative"
      >
        {/* Profile Header */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white relative">
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
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-amber-500/40 shadow-md"
            />

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="font-serif text-2xl font-bold">{currentUser.name}</h2>
                <span className="bg-amber-800 text-amber-100 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-700 uppercase">
                  {currentUser.role}
                </span>
                {currentUser.badge && (
                  <span className="bg-stone-800 text-stone-200 text-xs px-2 py-0.5 rounded-full border border-stone-700">
                    {currentUser.badge}
                  </span>
                )}
              </div>

              <p className="text-stone-300 text-xs max-w-md mb-2">{currentUser.bio || 'Oakridge community reader.'}</p>

              <div className="flex items-center justify-center sm:justify-start space-x-3 text-xs text-amber-300">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentUser.locality || 'Oakridge'}</span>
                </span>
                <span>•</span>
                <span>Member since {new Date(currentUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-1">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'saved'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-800" />
            <span>Saved Stories ({savedArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'following'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-800" />
            <span>Following Writers ({followedAuthors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'edit'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-800" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: SAVED STORIES */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Your Saved Favorite Articles
                </h3>
                <span className="text-xs text-stone-500">
                  Bookmarked for offline reading or quick reference
                </span>
              </div>

              {savedArticles.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
                  <Bookmark className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="font-serif text-sm font-bold text-stone-800 mb-1">
                    No saved articles yet
                  </p>
                  <p className="text-stone-500 text-xs">
                    Click the bookmark icon on any story to save it to your personal library!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedArticles.map((art) => (
                    <div
                      key={art.id}
                      className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-4"
                    >
                      <div
                        onClick={() => {
                          onClose();
                          onSelectArticle(art);
                        }}
                        className="flex items-center space-x-3 cursor-pointer flex-1"
                      >
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-14 h-14 rounded-lg object-cover border border-stone-200 flex-shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 uppercase">
                            {art.category} • {art.locality}
                          </span>
                          <h4 className="font-serif text-sm font-bold text-stone-900 hover:text-amber-800 transition-colors line-clamp-1">
                            {art.title}
                          </h4>
                          <p className="text-stone-500 text-xs line-clamp-1">{art.excerpt}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleSaveArticle(art.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs cursor-pointer transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FOLLOWING WRITERS */}
          {activeTab === 'following' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Writers You Follow
                </h3>
                <span className="text-xs text-stone-500">
                  Get updates when your favorite local authors publish
                </span>
              </div>

              {followedAuthors.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
                  <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="font-serif text-sm font-bold text-stone-800 mb-1">
                    You aren't following any writers yet
                  </p>
                  <p className="text-stone-500 text-xs">
                    Follow local columnists and residents on the public gazette to customize your feed!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followedAuthors.map((author) => (
                    <div
                      key={author.id}
                      className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between gap-4"
                    >
                      <div
                        onClick={() => {
                          onClose();
                          onSelectAuthor(author);
                        }}
                        className="flex items-center space-x-3 cursor-pointer flex-1"
                      >
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-100"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-xs text-stone-900 hover:text-amber-800">
                              {author.name}
                            </h4>
                            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.2 rounded-full font-medium">
                              {author.badge}
                            </span>
                          </div>
                          <p className="text-stone-500 text-[11px] line-clamp-1">{author.bio}</p>
                          <span className="text-[10px] text-stone-400">
                            {author.locality}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleFollowAuthor(author.id)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Unfollow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EDIT PROFILE */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {savedSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Profile details updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Oakridge Locality / Neighborhood
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                >
                  {LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Avatar Photo URL
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                />
              </div>

              {currentUser.role === 'writer' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Writer Guild Badge
                  </label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                  >
                    <option value="Local Resident">Local Resident</option>
                    <option value="Verified Journalist">Verified Journalist</option>
                    <option value="Community Leader">Community Leader</option>
                    <option value="Columnist">Columnist</option>
                    <option value="Guest Writer">Guest Writer</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Bio Summary
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800"
                />
              </div>

              <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
