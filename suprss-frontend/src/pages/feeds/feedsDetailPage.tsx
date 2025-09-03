import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArticlesApi } from '../../api/article';
import type { UUID, Article } from '../../api/types';
import toast from 'react-hot-toast';
import {FeedsApi} from "../../api/feeds.ts";

export function FeedDetailPage() {
    const { id } = useParams<{ id: UUID }>();
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [page] = useState(1);
    const [limit] = useState(30);

    const { data: feed, isLoading, isError } = useQuery({
        queryKey: ['feed', id],
        queryFn: () => {
            if (!id) throw new Error('missing id');
            return FeedsApi.getOne(id);
        },
        enabled: Boolean(id),
    });

    const { data: articlesData, isLoading: artsLoading } = useQuery({
        queryKey: ['articles', { feedIds: [id], page, limit }],
        queryFn: () => ArticlesApi.list({ feedIds: id ? [id] : [], page, limit }),
        enabled: Boolean(id),
        placeholderData: keepPreviousData,
    });

    const refreshMutation = useMutation({
        mutationFn: (fid: UUID) => FeedsApi.refresh(fid),
        onSuccess: async () => {
            toast.success('Flux actualisé');
            await qc.invalidateQueries({ queryKey: ['feed', id] });
            await qc.invalidateQueries({ queryKey: ['articles'] });
        },
        onError: (e: any) => toast.error(e?.message || 'Erreur lors de l’actualisation'),
    });

    const deleteMutation = useMutation({
        mutationFn: (fid: UUID) => FeedsApi.remove(fid),
        onSuccess: async () => {
            toast.success('Flux supprimé');
            await qc.invalidateQueries({ queryKey: ['feeds'] });
            navigate('/feeds');
        },
        onError: (e: any) => toast.error(e?.message || 'Suppression impossible'),
    });

    if (isLoading) return <div className="p-8 text-gray-600 dark:text-gray-300">Chargement…</div>;
    if (isError || !feed)
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Flux introuvable</h1>
                <Link to="/feeds" className="inline-flex items-center text-blue-600 hover:text-blue-700">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux flux
                </Link>
            </div>
        );

    const articles: Article[] = articlesData?.articles ?? [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/feeds" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{feed.title}</h1>
                        <div className="flex items-center space-x-4 mt-1">
                            <a href={feed.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                                {feed.url}
                                <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                {feed.isActive ? 'Actif' : 'Inactif'} • MAJ{' '}
                                {feed.lastFetchedAt ? format(new Date(feed.lastFetchedAt), 'dd MMM yyyy HH:mm', { locale: fr }) : '—'}
              </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => id && refreshMutation.mutate(id)}
                        disabled={refreshMutation.isPending}
                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                        Actualiser
                    </button>
                    <Link to={`/feeds/${feed.id}/edit`} className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Edit className="w-4 h-4 mr-2" /> Modifier
                    </Link>
                    <button
                        onClick={() => id && confirm('Supprimer ce flux ?') && deleteMutation.mutate(id)}
                        className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                    </button>
                </div>
            </div>

            {/* Infos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-4">Informations du flux</h2>
                    <div className="space-y-3 text-gray-700 dark:text-gray-300">
                        {feed.description && <p>{feed.description}</p>}
                        <div>Fréquence d’actualisation : {feed.updateFrequency ? `${feed.updateFrequency} min` : '—'}</div>
                        <div>Créé le : {format(new Date(feed.createdAt), 'dd/MM/yyyy', { locale: fr })}</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>Total articles</span><span className="font-semibold">{articles.length}</span></div>
                    </div>
                </div>
            </div>

            {/* Articles */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold">Articles ({articles.length})</h2>
                </div>
                <div className="p-6">
                    {artsLoading ? (
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
                </div>
            </div>
        </div>
    );
}
