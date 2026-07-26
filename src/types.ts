export type ArticleStatus =
  | 'draft'
  | 'submitted'
  | 'changes_requested'
  | 'approved'
  | 'published'
  | 'rejected';

export type UserRole = 'reader' | 'writer' | 'editor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  badge?: 'Local Resident' | 'Verified Journalist' | 'Community Leader' | 'Columnist' | 'Guest Writer';
  locality?: string;
  savedArticleIds: string[];
  followedAuthorIds: string[];
  createdAt: string;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  badge: 'Local Resident' | 'Verified Journalist' | 'Community Leader' | 'Columnist' | 'Guest Writer';
  locality: string;
  articlesCount: number;
  email?: string;
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  parentId?: string;
  isVerifiedResident?: boolean;
}

export interface EditorialReview {
  reviewedBy: string;
  reviewedAt: string;
  rating?: number;
  localRelevanceScore?: number;
  strengths?: string[];
  areasToImprove?: string[];
  recommendation?: 'Approve as is' | 'Minor revisions needed' | 'Major revisions needed' | 'Not suitable';
  feedbackText: string;
  suggestedHeadline?: string;
  suggestedExcerpt?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: Author;
  category: string;
  tags: string[];
  locality: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  readTimeMinutes: number;
  views: number;
  likes: number;
  commentsCount: number;
  isFeatured?: boolean;
  isEditorPick?: boolean;
  editorialReview?: EditorialReview;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface AIReviewResult {
  rating: number;
  localRelevanceScore: number;
  strengths: string[];
  areasToImprove: string[];
  editorialRecommendation: 'Approve as is' | 'Minor revisions needed' | 'Major revisions needed' | 'Not suitable';
  suggestedHeadline: string;
  suggestedExcerpt: string;
  complianceCheck: {
    respectfulTone: boolean;
    noHarmfulContent: boolean;
    localFocus: boolean;
  };
  detailedFeedback: string;
}

export interface AIHeadlineIdeasResult {
  headlines: string[];
  excerpt: string;
  tags: string[];
}

export interface AIProofreadResult {
  polishedText: string;
  changesSummary: string[];
  readabilityScore: string;
}
