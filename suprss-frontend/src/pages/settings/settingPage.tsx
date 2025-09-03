import { useState } from 'react';
import {
    User as UserIcon,
    Shield,
    Monitor,
    Download,
    Upload,
    Trash2,
    Save,
    Eye,
    EyeOff,
    Github,
    Chrome,
    Briefcase,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useMe } from '../../hook/useAuth';
import {UsersApi} from "../../api/user.ts";

type ProfileFormData = {
    firstName: string;
    lastName: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
};

type PreferencesFormData = {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    language: string;
};

export function SettingsPage() {
    const { data: user } = useMe();
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'data'>('profile');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const profileForm = useForm<ProfileFormData>({
        values: {
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            email: user?.email ?? '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const preferencesForm = useForm<PreferencesFormData>({
        defaultValues: {
            // Ces prefs existent dans ton `User` actuel : fontSize, language
            // Le "thème" est géré côté front (localStorage + ThemeProvider)
            theme: (localStorage.getItem('theme') as 'light' | 'dark' | 'auto') ?? 'auto',
            fontSize: (user?.fontSize as 'small' | 'medium' | 'large') ?? 'medium',
            language: user?.language ?? 'fr',
        },
    });

    const tabs = [
        { key: 'profile', label: 'Profil', icon: UserIcon },
        { key: 'preferences', label: 'Préférences', icon: Monitor },
        { key: 'security', label: 'Sécurité', icon: Shield },
        { key: 'data', label: 'Données', icon: Download },
    ] as const;

    const handleProfileUpdate = async (data: ProfileFormData) => {
        setIsLoading(true);
        try {
            await UsersApi.updateMe({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
            });
            toast.success('Profil mis à jour avec succès');
        } catch (error: any) {
            toast.error(error?.message || 'Erreur lors de la mise à jour');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (data: ProfileFormData) => {
        if (!data.newPassword) {
            toast.error('Nouveau mot de passe requis');
            return;
        }
        if (data.newPassword !== data.confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }
        setIsLoading(true);
        try {
            await UsersApi.changePassword({
                currentPassword: data.currentPassword ?? '',
                newPassword: data.newPassword,
            });
            toast.success('Mot de passe mis à jour avec succès');
            profileForm.reset({
                ...profileForm.getValues(),
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            toast.error(error?.message || 'Erreur lors du changement de mot de passe');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreferencesUpdate = async (data: PreferencesFormData) => {
        setIsLoading(true);
        try {
            // 1) prefs front: thème (localStorage + ThemeProvider déjà en place)
            localStorage.setItem('theme', data.theme);
            // 2) prefs serveur: fontSize, language
            await UsersApi.updateMe({
                fontSize: data.fontSize,
                language: data.language,
            });
            toast.success('Préférences mises à jour avec succès');
        } catch (error: any) {
            toast.error(error?.message || 'Erreur lors de la mise à jour');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            const blob = await UsersApi.exportData();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `suprss-export-${new Date().toISOString().slice(0, 10)}.zip`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Export des données démarré');
        } catch (e: any) {
            toast.error(e?.message || 'Échec de l’export');
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Supprimer votre compte ? Action irréversible.')) return;
        try {
            await UsersApi.deleteAccount();
            // À toi de gérer la déconnexion/redirect si nécessaire
            toast.success('Compte supprimé');
        } catch (e: any) {
            toast.error(e?.message || 'Échec de la suppression');
        }
    };

    if (!user) {
        return <div className="p-8 text-gray-600 dark:text-gray-300">Chargement…</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez votre profil, vos préférences et vos données</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                        <ul className="space-y-2">
                            {tabs.map((tab) => (
                                <li key={tab.key}>
                                    <button
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                                            activeTab === tab.key
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <tab.icon className="w-5 h-5 mr-3" />
                                        {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Main */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        {/* Profile */}
                        {activeTab === 'profile' && (
                            <div className="p-6 space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations du profil</h2>
                                    <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                                                <input
                                                    {...profileForm.register('firstName', { required: 'Requis' })}
                                                    type="text"
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                                                <input
                                                    {...profileForm.register('lastName', { required: 'Requis' })}
                                                    type="text"
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                                <input
                                                    {...profileForm.register('email', { required: 'Requis' })}
                                                    type="email"
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {isLoading ? 'Mise à jour…' : 'Mettre à jour le profil'}
                                        </button>
                                    </form>
                                </div>

                                {/* Password */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Changer le mot de passe</h3>
                                    <form onSubmit={profileForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe actuel</label>
                                            <div className="relative">
                                                <input
                                                    {...profileForm.register('currentPassword')}
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    className="w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword((v) => !v)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
                                                <div className="relative">
                                                    <input
                                                        {...profileForm.register('newPassword')}
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        className="w-full px-3 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword((v) => !v)}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    >
                                                        {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer</label>
                                                <input
                                                    {...profileForm.register('confirmPassword')}
                                                    type="password"
                                                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                        >
                                            <Shield className="w-4 h-4 mr-2" />
                                            {isLoading ? 'Modification…' : 'Changer le mot de passe'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Preferences */}
                        {activeTab === 'preferences' && (
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Préférences d’affichage</h2>
                                <form onSubmit={preferencesForm.handleSubmit(handlePreferencesUpdate)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thème</label>
                                            <select
                                                {...preferencesForm.register('theme')}
                                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="light">Clair</option>
                                                <option value="dark">Sombre</option>
                                                <option value="auto">Automatique</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Taille de police</label>
                                            <select
                                                {...preferencesForm.register('fontSize')}
                                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="small">Petite</option>
                                                <option value="medium">Moyenne</option>
                                                <option value="large">Grande</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Langue</label>
                                            <select
                                                {...preferencesForm.register('language')}
                                                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="fr">Français</option>
                                                <option value="en">English</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {isLoading ? 'Sauvegarde…' : 'Sauvegarder les préférences'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Security */}
                        {activeTab === 'security' && (
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Sécurité et connexions</h2>
                                <div className="space-y-6">
                                    {/* Liens OAuth indicatifs */}
                                    <div>
                                        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Comptes connectés</h3>
                                        <div className="space-y-3">
                                            {[
                                                { name: 'Google', icon: Chrome, connected: false },
                                                { name: 'GitHub', icon: Github, connected: false },
                                                { name: 'Microsoft', icon: Briefcase, connected: false },
                                            ].map((p) => (
                                                <div key={p.name} className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                                                    <div className="flex items-center space-x-3">
                                                        <p.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">{p.connected ? 'Connecté' : 'Non connecté'}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                            p.connected
                                                                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300'
                                                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300'
                                                        }`}
                                                    >
                                                        {p.connected ? 'Déconnecter' : 'Connecter'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Authentification à deux facteurs</h3>
                                        <div className="flex items-center justify-between p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">2FA non configuré</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Ajoutez une couche de sécurité supplémentaire</p>
                                            </div>
                                            <button className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 rounded text-sm font-medium transition-colors">
                                                Activer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data */}
                        {activeTab === 'data' && (
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Gestion des données</h2>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Exporter vos données</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Téléchargez une copie de vos flux, articles et collections.
                                        </p>
                                        <button
                                            onClick={handleExportData}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Exporter mes données
                                        </button>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Importer des données</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">OPML, JSON ou CSV.</p>
                                        <div className="flex space-x-3">
                                            <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                                <Upload className="w-4 h-4 mr-2" />
                                                Importer un fichier
                                            </button>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h3 className="text-base font-medium text-red-600 dark:text-red-400 mb-4">Zone de danger</h3>
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Supprimer définitivement votre compte</h4>
                                                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                                                        Action irréversible. Toutes vos données seront supprimées.
                                                    </p>
                                                    <button
                                                        onClick={handleDeleteAccount}
                                                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Supprimer mon compte
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
