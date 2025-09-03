import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Github, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLogin } from '../../hook/useAuth';
import { setAccessToken } from '../../api/http';
import { AuthApi } from '../../api/auth';

interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const loginMutation = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        try {
            const res = await loginMutation.mutateAsync({
                email: data.email,
                password: data.password,
            });

            // Gestion du token : session vs local
            if (data.rememberMe) {
                localStorage.setItem('token', res.token);
                sessionStorage.removeItem('token');
            } else {
                sessionStorage.setItem('token', res.token);
                localStorage.removeItem('token');
            }
            setAccessToken(res.token);

            toast.success('Connexion réussie !');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error?.message || 'Erreur lors de la connexion');
        }
    };

    const handleOAuthLogin = (provider: 'google' | 'github') => {
        const url = provider === 'google' ? AuthApi.getGoogleUrl() : AuthApi.getGithubUrl();
        // état aléatoire si tu veux, mais simple :
        window.location.href = url;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        SUPRSS
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Connectez-vous à votre compte
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Adresse email
                            </label>
                            <input
                                {...register('email', {
                                    required: 'L\'adresse email est requise',
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Adresse email invalide' },
                                })}
                                type="email"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="votre@email.com"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Mot de passe
                            </label>
                            <div className="relative mt-1">
                                <input
                                    {...register('password', { required: 'Le mot de passe est requis' })}
                                    type={showPassword ? 'text' : 'password'}
                                    className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="••••••••"
                                />
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword((v) => !v)}>
                                    {showPassword ? <Eye className="h-5 w-5 text-gray-400" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input {...register('rememberMe')} type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Se souvenir de moi</label>
                            </div>

                            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                                Mot de passe oublié ?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Se connecter
                        </button>
                    </div>

                    <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Pas encore de compte ? <Link to="/register" className="text-blue-600 hover:text-blue-500">S'inscrire</Link>
            </span>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">Ou continuez avec</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleOAuthLogin('google')}
                            disabled={loginMutation.isPending}
                            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Chrome className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => handleOAuthLogin('github')}
                            disabled={loginMutation.isPending}
                            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Github className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
