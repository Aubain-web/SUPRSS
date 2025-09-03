import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRegister } from '../../hook/useAuth';
import { setAccessToken } from '../../api/http';

interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

export function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const registerMutation = useRegister();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>();

    const password = watch('password');

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const res = await registerMutation.mutateAsync({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
            });
            // Persistance par défaut (inscription) :
            localStorage.setItem('token', res.token);
            setAccessToken(res.token);

            toast.success('Compte créé avec succès !');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error?.message || 'Erreur lors de la création du compte');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        SUPRSS
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Créer votre compte
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Prénom
                                </label>
                                <input
                                    {...register('firstName', {
                                        required: 'Le prénom est requis',
                                        minLength: { value: 2, message: 'Minimum 2 caractères' },
                                    })}
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Jean"
                                />
                                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nom
                                </label>
                                <input
                                    {...register('lastName', {
                                        required: 'Le nom est requis',
                                        minLength: { value: 2, message: 'Minimum 2 caractères' },
                                    })}
                                    type="text"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Dupont"
                                />
                                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Adresse email
                            </label>
                            <input
                                {...register('email', {
                                    required: 'L\'adresse email est requise',
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Adresse email invalide',
                                    },
                                })}
                                type="email"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="vous@email.com"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Mot de passe
                            </label>
                            <div className="relative mt-1">
                                <input
                                    {...register('password', {
                                        required: 'Le mot de passe est requis',
                                        minLength: { value: 8, message: 'Au moins 8 caractères' },
                                    })}
                                    type={showPassword ? 'text' : 'password'}
                                    className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="••••••••"
                                />
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword((v) => !v)}>
                                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative mt-1">
                                <input
                                    {...register('confirmPassword', {
                                        required: 'Veuillez confirmer votre mot de passe',
                                        validate: (v) => v === password || 'Les mots de passe ne correspondent pas',
                                    })}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="••••••••"
                                />
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowConfirmPassword((v) => !v)}>
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                        </div>

                        <div className="flex items-center">
                            <input
                                {...register('acceptTerms', { required: 'Vous devez accepter les conditions d\'utilisation' })}
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                J'accepte les <Link to="/terms" className="text-blue-600 hover:text-blue-500">conditions d'utilisation</Link>
                            </label>
                        </div>
                        {errors.acceptTerms && <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Créer mon compte
                        </button>
                    </div>

                    <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Déjà un compte ? <Link to="/login" className="text-blue-600 hover:text-blue-500">Se connecter</Link>
            </span>
                    </div>
                </form>
            </div>
        </div>
    );
}
