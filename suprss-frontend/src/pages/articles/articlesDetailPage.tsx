import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    ExternalLink,
    Star,
    Clock,
    User,
    Tag,
    MessageCircle,
    Share2,
    Bookmark,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';


import {CommentSection} from "../../composants/comment/commentSection.tsx";
import type {Article} from "../../api/types.ts";
import type {UUID} from "node:crypto";
import {ArticlesApi} from "../../api/article.ts";
import {FeedsApi} from "../../api/feeds.ts";

type ArticleWithFlags = Article & {
    isRead?: boolean;
    isFavorite?: boolean;
    comments?: Array<{
        id: UUID;
        content: string;
        authorId: UUID;
        createdAt: string;
    }>;
};

export function ArticleDetailPage() {
    const { id } = useParams<{ id: UUID }>();
    const qc = useQueryClient();
    const [showComments, setShowComments] = useState(false);

    const {
        data: article,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['article', id],
        queryFn: async () => {
            if (!id) throw new Error('missing id');
            // Doit retourner l’article + relations (feedId, comments...)
            const a = await ArticlesApi.getOne(id);
            return a as ArticleWithFlags;
        },
        enabled: Boolean(id),
    });

    const { data: feed } = useQuery({
        queryKey: ['feed', article?.feedId],
        queryFn: async () => {
            if (!article?.feedId) throw new Error('missing feedId');
            return FeedsApi.getOne(article.feedId);
        },
        enabled: Boolean(article?.feedId),
    });

    const markRead = useMutation({
        mutationFn: (articleId: UUID) => ArticlesApi.markRead(articleId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['article', id] });
            qc.invalidateQueries({ queryKey: ['articles'] });
            qc.invalidateQueries({ queryKey: ['articles', 'unread-count'] });
        },
    });

    const toggleFavorite = useMutation({
        mutationFn: (articleId: UUID) => ArticlesApi.toggleFavorite(articleId),
        onSuccess: () => {
            // Invalide la liste + le détail
            qc.invalidateQueries({ queryKey: ['article', id] });
            qc.invalidateQueries({ queryKey: ['articles'] });
            qc.invalidateQueries({ queryKey: ['articles', 'favorites'] });
        },
    });

    // Marquer comme lu à l’ouverture si pas encore lu
    useEffect(() => {
        if (article && !article.isRead) {
            void markRead.mutate(article.id);
        }
    }, [article, markRead]);

    const publishedAtLabel = useMemo(() => {
        if (!article) return '';
        return format(new Date(article.publishedAt), 'dd MMMM yyyy à HH:mm', { locale: fr });
    }, [article]);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-12 text-gray-600 dark:text-gray-300">
                Chargement de l’article…
            </div>
        );
    }

    if (isError || !article) {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Article introuvable
                </h1>
                <Link
                    to="/articles"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour aux articles
                </Link>
            </div>
        );
    }

    const handleToggleFavorite = () => toggleFavorite.mutate(article.id);

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: article.title,
                    text: article.description,
                    url: article.link,
                });
            } else {
                await navigator.clipboard.writeText(article.link);
            }
        } catch {
            // pas de toast ici pour rester simple
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link
                    to="/articles"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour aux articles
                </Link>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleToggleFavorite}
                        className={`p-2 rounded-lg transition-colors ${
                            article.isFavorite
                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-400'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                        aria-label={article.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                        <Star className={`w-5 h-5 ${article.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 transition-colors"
                        aria-label="Partager"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                    <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir l&apos;original
                    </a>
                </div>
            </div>

            {/* Article Content */}
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                {/* Article Header */}
                <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            {feed && (
                                <Link
                                    to={`/feeds/${feed.id}`}
                                    className="inline-flex items-center hover:text-blue-600"
                                >
                                    <Bookmark className="w-4 h-4 mr-1" />
                                    {feed.title}
                                </Link>
                            )}

                            {article.author && (
                                <span className="inline-flex items-center">
                  <User className="w-4 h-4 mr-1" />
                                    {article.author}
                </span>
                            )}

                            <span className="inline-flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                                {publishedAtLabel}
              </span>
                        </div>

                        {!!(article.categories?.length) && (
                            <div className="flex flex-wrap gap-2">
                                {article.categories!.map((category) => (
                                    <span
                                        key={category}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    >
                    <Tag className="w-3 h-3 mr-1" />
                                        {category}
                  </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Article Body */}
                <div className="p-8">
                    <div className="prose dark:prose-invert max-w-none">
                        {article.content ? (
                            <div dangerouslySetInnerHTML={{ __html: article.content }} />
                        ) : (
                            <div>
                                {article.description && (
                                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                                        {article.description}
                                    </p>
                                )}
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Cet article n&apos;affiche qu&apos;un extrait. Pour lire la version complète :
                                    </p>
                                    <a
                                        href={article.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Lire l&apos;article complet
                                        <ExternalLink className="w-4 h-4 ml-1" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Comments Section */}
                {feed?.collectionId && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setShowComments((s) => !s)}
                            className="w-full flex items-center justify-center px-8 py-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            {showComments
                                ? 'Masquer les commentaires'
                                : `Voir les commentaires (${article.comments?.length ?? 0})`}
                        </button>

                        {showComments && (
                            <div className="p-8 pt-0">
                                {/* Tu as déjà ce composant : */}
                                <CommentSection articleId={article.id} comments={article.comments ?? []} />
                            </div>
                        )}
                    </div>
                )}
            </article>
        </div>
    );
}
