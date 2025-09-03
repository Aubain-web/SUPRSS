import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthLoginDto, AuthRegisterDto } from '../api/types';
import { AuthApi } from '../api/auth';

export function useMe() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    return useQuery({
        queryKey: ['me'],
        queryFn: AuthApi.me,
        enabled: !!token,
        retry: false,
    });
}

export function useLogin() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: AuthLoginDto) => AuthApi.login(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['me'] });
        },
    });
}

export function useRegister() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: AuthRegisterDto) => AuthApi.register(dto),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['me'] });
        },
    });
}
