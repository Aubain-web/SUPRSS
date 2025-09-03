import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {CreateFeedDto, Feed, UUID} from "../api/types.ts";
import {FeedsApi} from "../api/feeds.ts";

export function useFeeds(collectionId?: UUID) {
    return useQuery<Feed[]>({
        queryKey: ['feeds', collectionId ?? 'all'],
        queryFn: () => FeedsApi.list(collectionId),
    });
}

export function useCreateFeed() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateFeedDto) => FeedsApi.create(dto),
        onSuccess: (_, dto) => {
            qc.invalidateQueries({ queryKey: ['feeds', dto.collectionId ?? 'all'] });
        },
    });
}
