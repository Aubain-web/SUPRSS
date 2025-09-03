import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Rss, ArrowLeft, Settings, Plus } from 'lucide-react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ArticlesApi } from '../../api/article';
import type { UUID, Article, Feed } from '../../api/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {CollectionsApi} from "../../api/collection.ts";
import {FeedsApi} from "../../api/feeds.ts";

type Tab = 'articles' | 'feeds';

export function CollectionDetailPage() {
    const { id } = useParams<{ id: UUID }>();
    const [active, setActive] = useState<Tab>('articles');

    const { data: collection, isLoading: loadingCol } = useQuery({
        queryKey: ['collection', id],
        queryFn: () => {
            if (!id) throw new Error('missing id');
            return CollectionsApi.getOne(id);
        },
        enabled: Boolean(id),
    });

    const { data: feeds = [], isLoading: loadingFeeds } = useQuery({
        queryKey: ['feeds', { collectionId: id }],
        queryFn: () => FeedsApi.list(id),
        enabled: Boolean(id),
        placeholderData: keepPreviousData,
    });

    const feedIds = feeds.map((f) => f.id);
    const { data: articlesData, isLoading: loadingArts } = useQuery({
        queryKey: ['articles', { feedIds, page: 1, limit: 30 }],
        queryFn: () => ArticlesApi.list({ feedIds, page: 1, limit: 30 }),
        enabled: feedIds.length > 0,
        placeholderData: keepPreviousData,
    });

    if (loadingCol) return <div className="p-8 text-gray-600 dark:text-gray-300">Chargement…</div>;
    if (!collection)
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Collection introuvable</h1>
                <Link to="/collections" className="inline-flex items-center text-blue-600 hover:text-blue-700">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux collections
                </Link>
            </div>
        );

    const articles: Article[] = articlesData?.articles ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/collections" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{collection.name}</h1>
                        {collection.description && <p className="text-gray-600 dark:text-gray-400 mt-1">{collection.description}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link to={`/feeds/new?collectionId=${collection.id}`} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" /> Ajouter un flux
                    </Link>
                    <Link to={`/collections/${collection.id}/settings`} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Settings className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <div className="border-b dark:border-gray-700 px-6">
                    <nav className="flex gap-8">
                        {(['articles', 'feeds'] as const).map((k) => (
                            <button
                                key={k}
                                onClick={() => setActive(k)}
                                className={`py-4 border-b-2 text-sm font-medium ${
                                    active === k ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {k === 'articles' ? `Articles (${articles.length})` : `Flux (${feeds.length})`}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {active === 'articles' && (
                        <>
                            {loadingArts ? (
                                <div>Chargement…</div>
                            ) : articles.length === 0 ? (
                                <div className="text-gray-600 dark:text-gray-400">Aucun article</div>
                            ) : (
                                <ul className="divide-y dark:divide-gray-700">
                                    {articles.map((a) => (
                                        <li key={a.id} className="py-3">
                                            <a className="text-blue-600 hover:underline" href={a.link} target="_blank" rel="noreferrer">
                                                {a.title}
                                            </a>
                                            <div className="text-xs text-gray-500">
                                                {a.publishedAt ? format(new Date(a.publishedAt), 'dd MMM yyyy HH:mm', { locale: fr }) : '—'}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}

                    {active === 'feeds' && (
                        <>
                            {loadingFeeds ? (
                                <div>Chargement…</div>
                            ) : feeds.length === 0 ? (
                                <div className="text-center py-12">
                                    <Rss className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun flux RSS</h3>
                                    <p className="text-gray-600 dark:text-gray-400">Ajoutez des flux à cette collection.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {feeds.map((f: Feed) => (
                                        <div key={f.id} className="p-4 rounded border dark:border-gray-700">
                                            <div className="font-medium">{f.title}</div>
                                            <a className="text-sm text-blue-600" href={f.url} target="_blank" rel="noreferrer">
                                                {f.url}
                                            </a>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {f.lastFetchedAt ? `MAJ: ${format(new Date(f.lastFetchedAt), 'dd/MM/yyyy HH:mm', { locale: fr })}` : '—'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
