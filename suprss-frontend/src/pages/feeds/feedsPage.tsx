import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Rss,
    Search,
    Filter,
    Activity,
    AlertCircle,
    CheckCircle,
    Upload,
    Download
} from 'lucide-react';

export function FeedsPage() {
    const { user } = useAuthStore();
    const { feeds, getFeedsByCategory } = useFeedsStore();
    const [showAddFeed, setShowAddFeed] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'error'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Get all unique categories
    const allCategories = Array.from(
        new Set(feeds.flatMap(feed => feed.categories))
    ).sort();

    const getFilteredFeeds = () => {
        let filtered = feeds;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(feed => feed.status === statusFilter);
        }

        // Filter by category
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(feed => feed.categories.includes(categoryFilter));
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(feed =>
                feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                feed.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                feed.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    };

    const filteredFeeds = getFilteredFeeds();
    const activeFeeds = feeds.filter(f => f.status === 'active').length;
    const inactiveFeeds = feeds.filter(f => f.status === 'inactive').length;
    const errorFeeds = feeds.filter(f => f.status === 'error').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Flux RSS
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Gérez tous vos flux RSS et leurs paramètres
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Link
                        to="/feeds/import"
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Importer
                    </Link>
                    <Link
                        to="/feeds/export"
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Exporter
                    </Link>
                    <button
                        onClick={() => setShowAddFeed(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nouveau flux
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                            <Rss className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total
                            </p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {feeds.length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Actifs
                            </p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {activeFeeds}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                            <Activity className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Inactifs
                            </p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {inactiveFeeds}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="bg-red-100 dark:bg-red-900 rounded-lg p-3">
                            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Erreurs
                            </p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {errorFeeds}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher un flux..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="active">Actifs</option>
                                <option value="inactive">Inactifs</option>
                                <option value="error">Erreurs</option>
                            </select>
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">Toutes les catégories</option>
                            {allCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Feeds Grid */}
            {filteredFeeds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFeeds.map((feed) => (
                        <FeedCard key={feed.id} feed={feed} />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <Rss className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                            ? 'Aucun flux trouvé'
                            : 'Aucun flux RSS'
                        }
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                            ? 'Essayez de modifier vos filtres ou créez un nouveau flux.'
                            : 'Commencez par ajouter votre premier flux RSS.'
                        }
                    </p>
                    <button
                        onClick={() => setShowAddFeed(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un flux
                    </button>
                </div>
            )}

            {/* Add Feed Modal */}
            {showAddFeed && (
                <AddFeedForm onClose={() => setShowAddFeed(false)} />
            )}
        </div>
    );
}