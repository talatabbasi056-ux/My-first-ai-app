import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BlogHome } from './components/BlogHome';
import { WriterDashboard } from './components/WriterDashboard';
import { EditorialPortal } from './components/EditorialPortal';
import { ArticleDetailModal } from './components/ArticleDetailModal';
import { AuthorProfileModal } from './components/AuthorProfileModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Article, ArticleStatus, Category, Author, Comment, UserRole, User } from './types';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, CURRENT_WRITER, MOCK_COMMENTS, MOCK_USERS, MOCK_AUTHORS } from './data/mockData';

const STORAGE_KEY_ARTICLES = 'oakridge_blog_articles_v1';
const STORAGE_KEY_COMMENTS = 'oakridge_blog_comments_v1';
const STORAGE_KEY_USERS = 'oakridge_blog_users_v1';
const STORAGE_KEY_CURRENT_USER = 'oakridge_blog_current_user_v1';

export default function App() {
  // Load state from local storage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return MOCK_USERS[0]; // Default to Alex Rivera (Reader)
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ARTICLES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ARTICLES;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return MOCK_COMMENTS;
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  // App Navigation & Role State
  const [currentRole, setCurrentRole] = useState<UserRole>(currentUser?.role || 'reader');
  const [activeTab, setActiveTab] = useState<'public' | 'writer' | 'editor'>('public');

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [editingArticleForWriter, setEditingArticleForWriter] = useState<Article | null>(null);

  // Auth & Profile Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
        setCurrentRole(currentUser.role);
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles));
    } catch (e) {
      console.error(e);
    }
  }, [articles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(comments));
    } catch (e) {
      console.error(e);
    }
  }, [comments]);

  // Derive author objects from MOCK_AUTHORS + registered writers
  const allAuthors: Author[] = React.useMemo(() => {
    const list: Author[] = [...MOCK_AUTHORS];
    users.forEach((u) => {
      if (u.role === 'writer' && !list.some((a) => a.id === u.id || a.name === u.name)) {
        list.push({
          id: u.id,
          name: u.name,
          avatar: u.avatar,
          bio: u.bio || 'Oakridge community writer.',
          badge: u.badge || 'Local Resident',
          locality: u.locality || 'Oakridge',
          articlesCount: articles.filter((a) => a.author.name === u.name).length,
          email: u.email,
        });
      }
    });
    return list;
  }, [users, articles]);

  // Derive current writer object for WriterDashboard
  const activeWriterAuthor: Author = React.useMemo(() => {
    if (currentUser && currentUser.role === 'writer') {
      return {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        bio: currentUser.bio || 'Oakridge community writer.',
        badge: currentUser.badge || 'Local Resident',
        locality: currentUser.locality || 'Oakridge West',
        articlesCount: articles.filter((a) => a.author.name === currentUser.name).length,
        email: currentUser.email,
      };
    }
    return CURRENT_WRITER;
  }, [currentUser, articles]);

  // Pending reviews count
  const pendingReviewCount = articles.filter((a) => a.status === 'submitted').length;

  // Open Auth Modal helper
  const handleOpenAuthModal = (tab: 'login' | 'register' = 'login', prompt?: string) => {
    setAuthModalTab(tab);
    setAuthPromptMessage(prompt || null);
    setIsAuthModalOpen(true);
  };

  // Auth Actions
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
  };

  const handleRegister = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setCurrentRole(newUser.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('reader');
    setActiveTab('public');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

    // Also update articles authored by this user
    setArticles((prev) =>
      prev.map((a) => {
        if (a.author.id === updatedUser.id || a.author.email === updatedUser.email) {
          return {
            ...a,
            author: {
              ...a.author,
              name: updatedUser.name,
              avatar: updatedUser.avatar,
              bio: updatedUser.bio || a.author.bio,
              badge: updatedUser.badge || a.author.badge,
              locality: updatedUser.locality || a.author.locality,
            },
          };
        }
        return a;
      })
    );
  };

  const handleToggleSaveArticle = (articleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      handleOpenAuthModal('login', 'Sign in or create an account to save favorite stories.');
      return;
    }

    const isSaved = currentUser.savedArticleIds.includes(articleId);
    const updatedSaved = isSaved
      ? currentUser.savedArticleIds.filter((id) => id !== articleId)
      : [...currentUser.savedArticleIds, articleId];

    const updatedUser: User = {
      ...currentUser,
      savedArticleIds: updatedSaved,
    };

    handleUpdateUser(updatedUser);
  };

  const handleToggleFollowAuthor = (authorId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      handleOpenAuthModal('login', 'Sign in to follow specific local writers.');
      return;
    }

    const isFollowing = currentUser.followedAuthorIds.includes(authorId);
    const updatedFollowed = isFollowing
      ? currentUser.followedAuthorIds.filter((id) => id !== authorId)
      : [...currentUser.followedAuthorIds, authorId];

    const updatedUser: User = {
      ...currentUser,
      followedAuthorIds: updatedFollowed,
    };

    handleUpdateUser(updatedUser);
  };

  // Article Engagement Handlers
  const handleLikeArticle = (articleId: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, likes: a.likes + 1 } : a))
    );
    if (selectedArticle && selectedArticle.id === articleId) {
      setSelectedArticle((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
    }
  };

  const handleAddComment = (articleId: string, text: string, isVerifiedResident: boolean) => {
    const commenterName = currentUser ? currentUser.name : 'Community Resident';
    const commenterAvatar = currentUser
      ? currentUser.avatar
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';

    const newComm: Comment = {
      id: `comm-${Date.now()}`,
      articleId,
      authorName: commenterName,
      authorAvatar: commenterAvatar,
      content: text,
      createdAt: new Date().toISOString(),
      likes: 1,
      isVerifiedResident,
    };

    setComments((prev) => [newComm, ...prev]);

    // Update article comment count
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, commentsCount: a.commentsCount + 1 } : a))
    );
  };

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  // Writer Save / Submit Article
  const handleSaveArticleFromWriter = (
    articleData: Partial<Article>,
    submitForReview: boolean
  ) => {
    const newStatus: ArticleStatus = submitForReview ? 'submitted' : 'draft';

    setArticles((prev) => {
      const exists = prev.find((a) => a.id === articleData.id);
      if (exists) {
        return prev.map((a) =>
          a.id === articleData.id
            ? ({
                ...a,
                ...articleData,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              } as Article)
            : a
        );
      } else {
        const newArt: Article = {
          id: articleData.id || `art-${Date.now()}`,
          title: articleData.title || 'Untitled',
          slug: (articleData.title || 'untitled').toLowerCase().replace(/\s+/g, '-'),
          content: articleData.content || '',
          excerpt: articleData.excerpt || '',
          coverImage:
            articleData.coverImage ||
            'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1200',
          author: activeWriterAuthor,
          category: articleData.category || 'Local News',
          tags: articleData.tags || ['Oakridge'],
          locality: articleData.locality || activeWriterAuthor.locality,
          status: newStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          readTimeMinutes: articleData.readTimeMinutes || 3,
          views: 1,
          likes: 0,
          commentsCount: 0,
        };
        return [newArt, ...prev];
      }
    });

    setEditingArticleForWriter(null);
  };

  // Delete Article
  const handleDeleteArticle = (articleId: string) => {
    if (confirm('Are you sure you want to delete this draft submission?')) {
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    }
  };

  // Editorial Decision
  const handleReviewArticle = (
    articleId: string,
    newStatus: ArticleStatus,
    feedbackText: string,
    rating?: number,
    localRelevanceScore?: number,
    strengths?: string[],
    areasToImprove?: string[]
  ) => {
    setArticles((prev) =>
      prev.map((a) => {
        if (a.id === articleId) {
          return {
            ...a,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            publishedAt: newStatus === 'published' ? new Date().toISOString() : a.publishedAt,
            editorialReview: {
              reviewedBy: currentUser?.name || 'Editorial Board',
              reviewedAt: new Date().toISOString(),
              rating,
              localRelevanceScore,
              strengths,
              areasToImprove,
              recommendation:
                newStatus === 'published'
                  ? 'Approve as is'
                  : newStatus === 'changes_requested'
                  ? 'Minor revisions needed'
                  : 'Not suitable',
              feedbackText,
            },
          };
        }
        return a;
      })
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased selection:bg-amber-200 selection:text-stone-900">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (currentUser) {
            setCurrentUser({ ...currentUser, role });
          }
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pendingReviewCount={pendingReviewCount}
        onCreateArticle={() => {
          if (!currentUser) {
            handleOpenAuthModal('register', 'Create a writer account to submit your story to the Oakridge Gazette.');
            return;
          }
          if (currentUser.role !== 'writer') {
            const upgraded: User = { ...currentUser, role: 'writer' };
            handleUpdateUser(upgraded);
          }
          setCurrentRole('writer');
          setActiveTab('writer');
        }}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        articles={articles}
        authors={allAuthors}
        onSelectArticle={(art) => setSelectedArticle(art)}
        onSelectAuthor={(aut) => setSelectedAuthor(aut)}
      />

      {/* Main View Router */}
      {activeTab === 'public' && (
        <BlogHome
          currentUser={currentUser}
          articles={articles}
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onSelectArticle={(art) => {
            setArticles((prev) =>
              prev.map((a) => (a.id === art.id ? { ...a, views: a.views + 1 } : a))
            );
            setSelectedArticle({ ...art, views: art.views + 1 });
          }}
          onLikeArticle={(id) => handleLikeArticle(id)}
          onSelectAuthor={(author) => setSelectedAuthor(author)}
          onCreateArticle={() => {
            if (!currentUser) {
              handleOpenAuthModal('register', 'Register a writer account to publish stories.');
              return;
            }
            if (currentUser.role !== 'writer') {
              handleUpdateUser({ ...currentUser, role: 'writer' });
            }
            setCurrentRole('writer');
            setActiveTab('writer');
          }}
          onToggleSaveArticle={handleToggleSaveArticle}
          onToggleFollowAuthor={handleToggleFollowAuthor}
          onOpenAuthModal={handleOpenAuthModal}
        />
      )}

      {activeTab === 'writer' && (
        <WriterDashboard
          articles={articles}
          categories={categories}
          currentWriter={activeWriterAuthor}
          onSaveArticle={handleSaveArticleFromWriter}
          onDeleteArticle={handleDeleteArticle}
          onSelectArticlePreview={(art) => setSelectedArticle(art)}
          initialEditingArticle={editingArticleForWriter}
        />
      )}

      {activeTab === 'editor' && (
        <EditorialPortal
          articles={articles}
          onReviewArticle={handleReviewArticle}
          onSelectArticlePreview={(art) => setSelectedArticle(art)}
        />
      )}

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <ArticleDetailModal
          currentUser={currentUser}
          article={selectedArticle}
          comments={comments}
          currentRole={currentRole}
          allArticles={articles}
          onClose={() => setSelectedArticle(null)}
          onLikeArticle={handleLikeArticle}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onSelectAuthor={(author) => {
            setSelectedArticle(null);
            setSelectedAuthor(author);
          }}
          onSelectArticle={(art) => setSelectedArticle(art)}
          onToggleSaveArticle={handleToggleSaveArticle}
          onToggleFollowAuthor={handleToggleFollowAuthor}
          onOpenAuthModal={handleOpenAuthModal}
        />
      )}

      {/* Author Profile Modal */}
      {selectedAuthor && (
        <AuthorProfileModal
          currentUser={currentUser}
          author={selectedAuthor}
          articles={articles}
          onClose={() => setSelectedAuthor(null)}
          onSelectArticle={(art) => setSelectedArticle(art)}
          onToggleFollowAuthor={handleToggleFollowAuthor}
          onOpenAuthModal={handleOpenAuthModal}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthPromptMessage(null);
        }}
        onLogin={handleLogin}
        onRegister={handleRegister}
        allUsers={users}
        initialTab={authModalTab}
        promptMessage={authPromptMessage}
      />

      {/* User Profile & Saved Favorites Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          articles={articles}
          authors={allAuthors}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onSelectArticle={(art) => setSelectedArticle(art)}
          onSelectAuthor={(aut) => setSelectedAuthor(aut)}
          onToggleSaveArticle={handleToggleSaveArticle}
          onToggleFollowAuthor={handleToggleFollowAuthor}
        />
      )}
    </div>
  );
}

