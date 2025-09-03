import {useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Rss, BookOpen, Users, Plus, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useMe } from '../../hook/useAuth';
import { ArticlesApi } from '../../api/article';
import type { Article } from '../../api/types';
import {FeedsApi} from "../../api/feeds.ts";
import {CollectionsApi} from "../../api/collection.ts";

export function DashboardPage() {
    const { data: user } = useMe();

    const { data: articlesData } = useQuery({
        queryKey: ['articles', { page: 1, limit: 50 }],
        queryFn: () => ArticlesApi.list({ page: 1, limit: 50 }),
    });

    const { data: feeds = [] } = useQuery({ queryKey: ['feeds'], queryFn: () => FeedsApi.list() });
    const { data: collections = [] } = useQuery({ queryKey: ['collections'], queryFn: () => CollectionsApi.list() });

    const articles = articlesData?.articles ?? [];
    const recent = useMemo(
        () =>
            [...articles]
                .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                .slice(0, 5),
        [articles],
    );

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bonjour, {user?.firstName ?? '👋'}</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Aperçu rapide</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/feeds/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" /> Nouveau flux
                        </Link>
                        <Link to="/collections" className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                            <Users className="w-4 h-4 mr-2" /> Nouvelle collection
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <Stat tile="Articles (derniers 50)" value={articles.length} icon={<BookOpen className="w-6 h-6 text-blue-600" />} to="/articles" />
                <Stat tile="Flux RSS" value={feeds.length} icon={<Rss className="w-6 h-6 text-green-600" />} to="/feeds" />
                <Stat tile="Collections" value={collections.length} icon={<Users className="w-6 h-6 text-purple-600" />} to="/collections" />
                <Stat tile="Actifs" value={feeds.filter((f) => f.isActive).length} icon={<Clock className="w-6 h-6 text-orange-600" />} to="/feeds" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-700">
                    <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Articles récents</h2>
                        <Link to="/articles" className="text-blue-600 hover:underline text-sm">Voir tout</Link>
                    </div>
                    <div className="p-6">
                        {recent.length === 0 ? (
                            <div className="text-gray-600 dark:text-gray-400">Aucun article</div>
                        ) : (
                            <ul className="divide-y dark:divide-gray-700">
                                {recent.map((a: Article) => (
                                    <li key={a.id} className="py-3">
                                        <a className="text-blue-600 hover:underline" href={a.link} target="_blank" rel="noreferrer">
                                            {a.title}
                                        </a>
                                        <div className="text-xs text-gray-500">{new Date(a.publishedAt).toLocaleString()}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded border dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold mb-4">Collections</h3>
                    {collections.slice(0, 3).map((c) => (
                        <Link key={c.id} to={`/collections/${c.id}`} className="flex items-center justify-between p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div className="font-medium">{c.name}</div>
                            <Users className="w-4 h-4 text-gray-400" />
                        </Link>
                    ))}
                    {collections.length === 0 && <div className="text-gray-600 dark:text-gray-400">Aucune collection</div>}
                </div>
            </div>
        </div>
    );
}

function Stat({ tile, value, icon, to }: { tile: string; value: number; icon: React.ReactNode; to: string }) {
    return (
        <Link to={to} className="bg-white dark:bg-gray-800 rounded border dark:border-gray-700 p-6 hover:shadow transition">
            <div className="flex items-center">
                <div className="p-3 rounded bg-gray-100 dark:bg-gray-700">{icon}</div>
                <div className="ml-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{tile}</div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
                </div>
            </div>
        </Link>
    );
}
