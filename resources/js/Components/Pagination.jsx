import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <div className="flex flex-wrap mt-6 -mb-1">
            {links.map((link, key) => (
                <React.Fragment key={key}>
                    {link.url === null ? (
                        <div
                            className="mr-1 mb-1 px-4 py-2 text-sm border rounded text-gray-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <Link
                            className={`mr-1 mb-1 px-4 py-2 text-sm border rounded hover:bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring ring-indigo-200 ${
                                link.active ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'text-gray-700'
                            }`}
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
