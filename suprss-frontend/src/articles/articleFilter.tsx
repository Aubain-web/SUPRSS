import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type {Article} from "../api/types.ts";

export function ArticleList({ articles }: { articles: Article[] }) {
    return (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {articles.map((a) => (
                    <li key={a.id} className="py-4">
                <Link to={`/articles/${a.id}`} className="group block">
    <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:underline">
        {a.title}
        </h3>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
    <Clock className="w-4 h-4" />
        {format(new Date(a.publishedAt), 'dd MMM yyyy HH:mm', { locale: fr })}
    </div>
    {a.description && (
        <p className="mt-2 text-gray-700 dark:text-gray-300 line-clamp-2">{a.description}</p>
    )}
    </Link>
    </li>
))}
    </ul>
);
}
