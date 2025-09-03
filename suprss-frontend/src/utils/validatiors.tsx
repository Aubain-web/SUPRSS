export const validators = {
    required: (value: any) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return 'Ce champ est requis';
        }
        return true;
    },

    email: (value: string) => {
        if (!value) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Adresse email invalide';
    },

    url: (value: string) => {
        if (!value) return true;
        try {
            new URL(value);
            return true;
        } catch {
            return 'URL invalide';
        }
    },

    minLength: (min: number) => (value: string) => {
        if (!value) return true;
        return value.length >= min || `Minimum ${min} caractères requis`;
    },

    maxLength: (max: number) => (value: string) => {
        if (!value) return true;
        return value.length <= max || `Maximum ${max} caractères autorisés`;
    },

    password: (value: string) => {
        if (!value) return true;
        if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
        if (!/(?=.*[a-z])/.test(value)) return 'Le mot de passe doit contenir au moins une minuscule';
        if (!/(?=.*[A-Z])/.test(value)) return 'Le mot de passe doit contenir au moins une majuscule';
        if (!/(?=.*\d)/.test(value)) return 'Le mot de passe doit contenir au moins un chiffre';
        return true;
    },

    confirmPassword: (password: string) => (value: string) => {
        return value === password || 'Les mots de passe ne correspondent pas';
    },
};