import type { UUID } from '../../api/types';

type Comment = {
    id: UUID;
    content: string;
    authorId: UUID;
    createdAt: string;
};

export function CommentSection({ comments }: { articleId: UUID; comments: Comment[] }) {
    return (
        <div className="space-y-4">
            {comments.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">Aucun commentaire pour le moment.</p>
            ) : (
                comments.map((c) => (
                    <div key={c.id} className="p-4 rounded border border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
                        <div className="text-gray-900 dark:text-gray-100">{c.content}</div>
                    </div>
                ))
            )}
        </div>
    );
}
