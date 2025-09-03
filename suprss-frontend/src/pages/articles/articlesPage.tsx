import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Search,
    Filter,
    BookOpen,
    Star,
    Clock,
    RefreshCw,
    SlidersHorizontal,
    Plus,
} from 'lucide-react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {FeedsApi} from "../../api/feeds.ts";
import type {ArticleListResponse} from "../../api/types.ts";
import {ArticlesApi} from "../../api/article.ts";
import type {UUID} from "node:crypto";


type ArticleQuery = {
    feedIds?: UUID[];
    categories?: string[];
    isRead?: boolean;
    isFavorite?: boolean;
    search?: string;
    startDate?: string; // ISO
    endDate?: string;   // ISO
    page?: number;
    limit?: number;
};

export function ArticlesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const qc = useQueryClient();

    // --- Filtres contrôlés par l’UI
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // --- Filtres dérivés de l’URL
    const qFromUrl: ArticleQuery = useMemo(() => {
        const q: ArticleQuery = {};
        const filter = searchParams.get('filter');
        if (filter === 'unread') q.isRead = false;
        if (filter === 'favorites') q.isFavorite = true;

        const s = searchParams.get('search');
        if (s) q.search = s;

        const feedId = searchParams.get('feedId');
        if (feedId) q.feedIds = [feedId as UUID];

        const cats = searchParams.get('categories');
        if (cats) q.categories = cats.split(',').map((c) => c.trim()).filter(Boolean);

        const startDate = searchParams.get('startDate');
        if (startDate) q.startDate = startDate;

        const endDate = searchParams.get('endDate');
        if (endDate) q.endDate = endDate;

        const page = searchParams.get('page');
        if (page) q.page = Number(page);

        const limit = searchParams.get('limit');
        if (limit) q.limit = Number(limit);

        return q;
    }, [searchParams]);

    // garde l’UI search alignée
    useEffect(() => {
        setSearchTerm(qFromUrl.search ?? '');
    }, [qFromUrl.search]);

    // --- Données
    const { data: feeds } = useQuery({
        queryKey: ['feeds', 'all'],
        queryFn: () => FeedsApi.list(), // suppose GET /feeds (protégé JWT)
        placeholderData: keepPreviousData,
    });

    const {
        data: pageData,
        isFetching,
    } = useQuery<ArticleListResponse>({
        queryKey: ['articles', qFromUrl],
        queryFn: () => ArticlesApi.list(qFromUrl),
        placeholderData: keepPreviousData,
    });

    // Compteurs
    const { data: unreadMap } = useQuery({
        queryKey: ['articles', 'unread-count'],
        queryFn: () => ArticlesApi.getUnreadCount(),
    });

    const { data: favoritesList } = useQuery({
        queryKey: ['articles', 'favorites'],
        queryFn: () => ArticlesApi.getFavorites(),
    });

    const unreadCount = useMemo(() => {
        if (!unreadMap) return 0;
        // somme par feed
        return Object.values(unreadMap).reduce((acc, n) => acc + Number(n || 0), 0);
    }, [unreadMap]);

    const favoriteCount = favoritesList?.length ?? 0;

    const articles = pageData?.articles ?? [];

    // --- Actions
    const setFilters = (partial: Partial<ArticleQuery>) => {
        const next = { ...qFromUrl, ...partial };
        const params = new URLSearchParams();

        if (next.isRead === false) params.set('filter', 'unread');
        else if (next.isFavorite === true) params.set('filter', 'favorites');

        if (next.search) params.set('search', next.search);
        if (next.feedIds?.length) params.set('feedId', next.feedIds[0]);
        if (next.categories?.length) params.set('categories', next.categories.join(','));
        if (next.startDate) params.set('startDate', next.startDate);
        if (next.endDate) params.set('endDate', next.endDate);
        if (next.page) params.set('page', String(next.page));
        if (next.limit) params.set('limit', String(next.limit));

        setSearchParams(params);
    };

    const clearFilters = () => setSearchParams(new URLSearchParams());

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setFilters({ search: term || undefined, page: 1 });
    };

    const quickFilters = [
        {
            key: 'all',
            label: 'Tous les articles',
            icon: BookOpen,
            count: pageData?.total ?? 0,
            active: !qFromUrl.isRead && !qFromUrl.isFavorite,
            onClick: () => clearFilters(),
        },
        {
            key: 'unread',
            label: 'Non lus',
            icon: Clock,
            count: unreadCount,
            active: qFromUrl.isRead === false,
            onClick: () => setFilters({ isRead: false, isFavorite: undefined, page: 1 }),
        },
        {
            key: 'favorites',
            label: 'Favoris',
            icon: Star,
            count: favoriteCount,
            active: qFromUrl.isFavorite === true,
            onClick: () => setFilters({ isFavorite: true, isRead: undefined, page: 1 }),
        },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Articles</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Parcourez et gérez tous vos articles RSS
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowFilters((s) => !s)}
                        className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                            showFilters
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filtres avancés
                    </button>
                    <button
                        onClick={() => {
                            qc.invalidateQueries({ queryKey: ['articles'] });
                            qc.invalidateQueries({ queryKey: ['articles', 'unread-count'] });
                            qc.invalidateQueries({ queryKey: ['articles', 'favorites'] });
                        }}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        disabled={isFetching}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                        Actualiser tout
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickFilters.map((f) => (
                    <button
                        key={f.key}
                        onClick={f.onClick}
                        className={`text-left p-6 rounded-lg shadow-sm border transition-all ${
                            f.active
                                ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 dark:bg-blue-900/20 dark:border-blue-800'
                                : 'bg-white border-gray-200 hover:shadow-md dark:bg-gray-800 dark:border-gray-700'
                        }`}
                    >
                        <div className="flex items-center">
                            <div
                                className={`rounded-lg p-3 ${
                                    f.active ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
                                }`}
                            >
                                <f.icon
                                    className={`w-6 h-6 ${
                                        f.active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{f.label}</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{f.count}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher dans les articles..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
                    />
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <ArticleFilters
                    filters={{
                        // Props vers ton composant de filtres
                        feedId: qFromUrl.feedIds?.[0],
                        categories: qFromUrl.categories ?? [],
                        dateFrom: qFromUrl.startDate,
                        dateTo: qFromUrl.endDate,
                        isRead: qFromUrl.isRead,
                        isFavorite: qFromUrl.isFavorite,
                        search: qFromUrl.search,
                    }}
                    onFiltersChange={(f) =>
                        setFilters({
                            feedIds: f.feedId ? [f.feedId] : undefined,
                            categories: f.categories,
                            startDate: f.dateFrom,
                            endDate: f.dateTo,
                            isRead: f.isRead,
                            isFavorite: f.isFavorite,
                            search: f.search,
                            page: 1,
                        })
                    }
                    onClose={() => setShowFilters(false)}
                    feeds={feeds ?? []}
                />
            )}

            {/* Active Filters Display */}
            {(qFromUrl.feedIds?.length ||
                qFromUrl.categories?.length ||
                qFromUrl.startDate ||
                qFromUrl.endDate) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Filtres actifs:
              </span>
                            <div className="flex flex-wrap gap-2">
                                {qFromUrl.feedIds?.[0] && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    Flux: {feeds?.find((f) => f.id === qFromUrl.feedIds![0])?.title ?? '—'}
                  </span>
                                )}
                                {qFromUrl.categories?.map((cat) => (
                                    <span
                                        key={cat}
                                        className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                                    >
                    {cat}
                  </span>
                                ))}
                                {qFromUrl.startDate && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    À partir du {new Date(qFromUrl.startDate).toLocaleDateString()}
                  </span>
                                )}
                                {qFromUrl.endDate && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    Jusqu’au {new Date(qFromUrl.endDate).toLocaleDateString()}
                  </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            Effacer les filtres
                        </button>
                    </div>
                </div>
            )}

            {/* Articles List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Articles ({pageData?.total ?? 0})
                        </h2>
                        {articles.length > 0 && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <span>Trier par:</span>
                                {/* branche le tri dans qFromUrl si tu ajoutes un backend sortKey */}
                                <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                    <option value="date-desc">Plus récent</option>
                                    <option value="date-asc">Plus ancien</option>
                                    <option value="title">Titre A-Z</option>
                                    <option value="feed">Par flux</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {articles.length > 0 ? (
                        <ArticleList articles={articles} />
                    ) : (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Aucun article trouvé
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {qFromUrl.search || qFromUrl.feedIds?.length || qFromUrl.categories?.length
                                    ? 'Essayez de modifier vos critères de recherche ou vos filtres.'
                                    : 'Ajoutez des flux RSS pour voir des articles ici.'}
                            </p>
                            {!qFromUrl.search && !qFromUrl.feedIds?.length && !qFromUrl.categories?.length && (
                                <Link
                                    to="/feeds"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ajouter des flux
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination basique */}
                {pageData && pageData.totalPages > 1 && (
                    <div className="px-6 pb-6 flex items-center justify-end gap-2">
                        <button
                            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                            disabled={(qFromUrl.page ?? 1) <= 1}
                            onClick={() => setFilters({ page: Math.max(1, (qFromUrl.page ?? 1) - 1) })}
                        >
                            Précédent
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {qFromUrl.page ?? 1} / {pageData.totalPages}
            </span>
                        <button
                            className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                            disabled={(qFromUrl.page ?? 1) >= pageData.totalPages}
                            onClick={() =>
                                setFilters({ page: Math.min(pageData.totalPages, (qFromUrl.page ?? 1) + 1) })
                            }
                        >
                            Suivant
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
