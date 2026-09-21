import React, { useEffect, useState } from 'react';
import { Layers, Plus, Search, Tag, Globe, Trophy, CheckCircle2 } from 'lucide-react';
import { categoryService, productService } from '../../services/api';
import { useAppDispatch } from '../../store';
import { addToast } from '../../store/uiSlice';
import { SEO } from '../../components/seo/SEO';

export const AdminCategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'teams' | 'leagues' | 'categories'>('teams');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await categoryService.getMetadata();
      setCategories(res.data.categories || []);
      setTeams(res.data.teams || []);
      setLeagues(res.data.leagues || []);
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: 'Failed to load taxonomies.' }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeList = activeTab === 'teams' ? teams : activeTab === 'leagues' ? leagues : categories;
  const filteredList = activeList.filter((item) =>
    (item.name || item.team || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SEO title="Admin Category & Team Taxonomies" noIndex={true} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal font-display uppercase tracking-tight text-black">
            CATEGORIES, TEAMS & LEAGUES
          </h1>
          <p className="text-xs text-neutral-500 font-sans mt-0.5">
            Manage club taxonomies, league collections, and navigation categories.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'teams'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Teams & Clubs ({teams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leagues')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'leagues'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Leagues & Tournaments ({leagues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'border-black text-black'
              : 'border-transparent text-neutral-500 hover:text-black'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>General Categories ({categories.length})</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-black focus:outline-none"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Grid of Items */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-neutral-400">Loading taxonomies...</div>
      ) : filteredList.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-neutral-200 text-center space-y-2">
          <Tag className="w-8 h-8 text-neutral-300 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-700">No Taxonomies Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredList.map((item, idx) => {
            const name = item.name || item.team || item.league;
            const sub = item.country || item.league || item.slug || 'Active';
            return (
              <div
                key={item._id || idx}
                className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-2 hover:border-black transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    {sub}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="text-sm font-bold text-black group-hover:text-[#FF5722] transition-colors">
                  {name}
                </h4>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

