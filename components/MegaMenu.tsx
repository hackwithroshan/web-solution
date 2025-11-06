import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface MegaMenuLink {
    name: string;
    path: string;
}

interface MegaMenuColumn {
    title: string;
    icon: React.ReactNode;
    links: MegaMenuLink[];
}

interface MegaMenuTagline {
    title: string;
    description: string;
    path: string;
}

interface MegaMenuProps {
    menuData: MegaMenuColumn[];
    taglineData: MegaMenuTagline;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

const MegaMenu: React.FC<MegaMenuProps> = ({ menuData, taglineData, onMouseEnter, onMouseLeave }) => {
  return (
    <div 
      onMouseEnter={onMouseEnter} 
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-[10%] mt-2 w-[95vw] max-w-6xl animate-slide-in-down-fast"
    >
      <div className="megamenu-animated-border">
        <div className="bg-[#1A1A2A]/95 backdrop-blur-xl rounded-[calc(1rem-2px)] shadow-2xl p-10">
          <div className="grid grid-cols-5 gap-x-8">
            {/* Service Links Section */}
            <div className="col-span-3">
                <div className="grid grid-cols-3 gap-x-8">
                    {menuData.map((column) => (
                      <div key={column.title} className="space-y-4">
                        <h3 className="font-bold text-white text-base flex items-center gap-2">
                          {column.icon}
                          {column.title}
                        </h3>
                        <ul className="space-y-3">
                          {column.links.map(link => (
                            <li key={link.name}>
                              <Link to={link.path} className="text-gray-400 hover:text-white transition-colors text-sm flex items-center group">
                                 {link.name}
                                 <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
            </div>

            {/* Tagline section */}
            <div className="col-span-2 bg-white/5 p-8 rounded-lg flex flex-col justify-center border border-white/10">
              <h4 className="font-bold text-lg text-white">{taglineData.title}</h4>
              <p className="text-sm text-gray-300 mt-2 mb-6">{taglineData.description}</p>
              <Link to={taglineData.path} className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center group bg-white/10 px-4 py-2 rounded-full self-start transition-colors hover:bg-white/20">
                Explore Case Studies <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MegaMenu;