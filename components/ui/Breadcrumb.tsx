import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  name: string;
  path?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ crumbs, className = '' }) => {
  return (
    <nav aria-label="breadcrumb" className={className}>
      <ol className="flex items-center space-x-2 text-sm">
        {crumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {crumb.path ? (
              <Link to={crumb.path} className="text-gray-400 hover:text-white transition-colors">
                {crumb.name}
              </Link>
            ) : (
              <span className="font-semibold text-white">{crumb.name}</span>
            )}
            {index < crumbs.length - 1 && (
                <ChevronRight size={16} className="ml-2 text-gray-500" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;