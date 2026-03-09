'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { GlobalTrend } from '@/lib/types';
import { Button } from '@/components/ui/Button';

export default function TrendsPage() {
  const [trends, setTrends] = useState<GlobalTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Technology');

  const categories = [
    'Technology',
    'Economics',
    'Politics',
    'Science',
    'Health',
    'Entertainment',
    'Sports'
  ];

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
        const apiHost = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

        if (!apiKey || !apiHost) {
          throw new Error('API Configuration missing');
        }

        const response = await fetch(
          `https://${apiHost}/search?query=${selectedCategory}&limit=20&time_published=anytime&country=US&lang=en`,
          {
            method: 'GET',
            headers: {
              'x-rapidapi-key': apiKey,
              'x-rapidapi-host': apiHost,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch trends');
        }

        const result = await response.json();
        
        // Map the RapidAPI News structure to our UI needs
        const mappedData = (result.data || []).map((item: any, index: number) => ({
          id: index,
          title: item.title,
          description: item.snippet || `Latest updates from the ${selectedCategory.toLowerCase()} world.`,
          url: item.link,
          published_at: item.published_datetime_utc,
          user: {
            name: item.source_name || 'News Source',
            username: item.source_name?.toLowerCase().replace(/\s+/g, '') || 'news',
          },
          tag_list: [selectedCategory, 'News', item.source_name].filter(Boolean),
          reading_time_minutes: Math.floor(Math.random() * 5) + 3
        }));

        setTrends(mappedData);
      } catch (err) {
        setError(`Unable to load ${selectedCategory.toLowerCase()} trends at this time`);
        console.error('Error fetching trends:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [selectedCategory]);

  if (error && !trends.length) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Global Trends</h1>
        <Card className="border-rose-100 bg-rose-50/30">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6">!</div>
            <p className="text-rose-700 font-bold">{error}</p>
            <Button variant="outline" className="mt-6 border-rose-200 text-rose-700 hover:bg-rose-100" onClick={() => window.location.reload()}>
              Try Reconnecting
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-none">
            Global Trends
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Real-time feed of the most critical shifts and breakthroughs worldwide.
          </p>
        </div>
        
        {/* Category Navigation */}
        <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Curating {selectedCategory} trends...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {trends.map((trend) => (
            <Card key={trend.id} hover className="border-none shadow-indigo-100 group">
              <div className="p-2">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{trend.user.name}</span>
                        <span>•</span>
                        <span>{trend.reading_time_minutes} MIN READ</span>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                      {trend.title}
                    </h3>
                    
                    <p className="text-slate-500 font-medium leading-relaxed max-w-4xl line-clamp-2">
                      {trend.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      {trend.tag_list && trend.tag_list.slice(0, 4).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest ml-auto">
                        {trend.published_at ? `Published ${new Date(trend.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'Recent'}
                      </span>
                    </div>
                  </div>
                  
                  <a
                    href={trend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto"
                  >
                    <Button variant="outline" className="w-full md:w-auto rounded-xl border-slate-200 group-hover:border-indigo-600 group-hover:text-indigo-600 font-bold uppercase tracking-widest text-[10px] py-4 px-8">
                      View News
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
          
          {trends.length === 0 && !loading && (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No recent {selectedCategory} news found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
