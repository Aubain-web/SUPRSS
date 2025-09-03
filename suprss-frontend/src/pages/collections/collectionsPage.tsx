import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Lock, Search, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMe } from '../../hook/useAuth';
import type { Collection } from '../../api/types';
import toast from 'react-hot-toast';
import {CollectionsApi} from "../../api/collection.ts";

type FilterKey = 'all' | 'owned' | 'shared';

export function CollectionsPage() {
    const qc = useQueryClient();
    const { data: user } = useMe();
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<FilterKey>('all');

    const { data: collections = [], isLoading } = useQuery({
        queryKey: ['collections'],
        queryFn: () => CollectionsApi.list(),
    });

    const createMutation = useMutation({
        mutationFn: () => CollectionsApi.create({ name, description: description || undefined }),
        onSuccess: async () => {
            toast.success('Collection créée');
            setShowCreate(false);
            setName('');
            setDescription('');
            await qc.invalidateQueries({ queryKey: ['collections'] });
        },
        onError: (e: any) => toast.error(e?.message || 'Création impossible'),
    });

    const owned = useMemo(() => collections.filter((c) => c.ownerId === user?.id), [collections, user?.id]);
    const shared = useMemo(() => collections.filter((c) => c.ownerId !== user?.id), [collections, user?.id]);

    const filtered = useMemo(() => {
        let list: Collection[] = collections;
        if (filter === 'owned') list = owned;
        if (filter === 'shared') list = shared;
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(
                (c) => c.name.toLowerCase().includes(q) || (c.description?.toLowerCase().includes(q) ?? false),
            );
        }
        return list;
    }, [collections, owned, shared, filter, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collections</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Organisez vos flux RSS</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> Nouvelle collection
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total" value={collections.length} icon={<Users className="w-6 h-6 text-blue-600" />} />
                <StatCard title="Personnelles" value={owned.length} icon={<Lock className="w-6 h-6 text-green-600" />} />
                <StatCard title="Partagées" value={shared.length} icon={<Users className="w-6 h-6 text-purple-600" />} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded border dark:border-gray-700 p-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher…"
                            className="w-full pl-9 pr-3 py-2 rounded border dark:bg-gray-700"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select value={filter} onChange={(e) => setFilter(e.target.value as FilterKey)} className="px-3 py-2 rounded border dark:bg-gray-700">
                            <option value="all">Toutes</option>
                            <option value="owned">Mes collections</option>
                            <option value="shared">Partagées</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="p-8 text-gray-600 dark:text-gray-300">Chargement…</div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((c) => (
                        <Link key={c.id} to={`/collections/${c.id}`} className="p-5 bg-white dark:bg-gray-800 rounded border dark:border-gray-700 hover:shadow">
                            <div className="font-semibold text-gray-900 dark:text-white">{c.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{c.description || '—'}</div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded border dark:border-gray-700 p-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune collection</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {searchTerm ? 'Essayez un autre terme.' : 'Créez votre première collection.'}
                    </p>
                    <button onClick={() => setShowCreate(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" /> Créer une collection
                    </button>
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded p-6 w-full max-w-md space-y-4">
                        <h3 className="text-lg font-semibold">Nouvelle collection</h3>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" className="w-full px-3 py-2 rounded border dark:bg-gray-700" />
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optionnel)" className="w-full px-3 py-2 rounded border dark:bg-gray-700" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowCreate(false)} className="px-3 py-2 rounded border">Annuler</button>
                            <button disabled={!name || createMutation.isPending} onClick={() => createMutation.mutate()} className="px-3 py-2 rounded bg-blue-600 text-white">
                                {createMutation.isPending ? 'Création…' : 'Créer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded border dark:border-gray-700 p-6 flex items-center">
            <div className="p-3 rounded bg-gray-100 dark:bg-gray-700">{icon}</div>
            <div className="ml-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
            </div>
        </div>
    );
}
