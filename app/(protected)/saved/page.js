'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookmarkIcon,
  BookOpenIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { toast } from 'react-hot-toast';

const tabs = [
  { id: 'all', name: 'All', icon: BookmarkIcon },
  { id: 'courses', name: 'Courses', icon: BookOpenIcon },
  { id: 'careers', name: 'Careers', icon: BriefcaseIcon },
  { id: 'programs', name: 'Programs', icon: AcademicCapIcon },
  { id: 'colleges', name: 'Colleges', icon: BuildingLibraryIcon },
  { id: 'scholarships', name: 'Scholarships', icon: BanknotesIcon },
];

export default function SavedItemsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [savedItems, setSavedItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/saved-items');
      if (!res.ok) throw new Error('Failed to fetch saved items');
      
      const data = await res.json();
      setSavedItems(data);
    } catch (err) {
      console.error('Error fetching saved items:', err);
      toast.error('Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId, itemType) => {
    setDeletingId(itemId);
    try {
      const endpoints = {
        Course: '/api/user/saved-courses',
        Career: '/api/user/saved-careers',
        Program: '/api/user/saved-programs',
        College: '/api/user/saved-colleges',
        Scholarship: '/api/user/saved-scholarships',
      };

      const res = await fetch(endpoints[itemType], {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          courseId: itemType === 'Course' ? itemId : undefined,
          careerId: itemType === 'Career' ? itemId : undefined,
          programId: itemType === 'Program' ? itemId : undefined,
          collegeId: itemType === 'College' ? itemId : undefined,
          scholarshipId: itemType === 'Scholarship' ? itemId : undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to delete item');

      toast.success('Item removed from saved');
      fetchSavedItems(); // Refresh the list
    } catch (err) {
      console.error('Error deleting item:', err);
      toast.error('Failed to remove item');
    } finally {
      setDeletingId(null);
    }
  };

  const getItemsForTab = () => {
    if (!savedItems) return [];
    
    if (activeTab === 'all') {
      return [
        ...savedItems.courses.map(item => ({ ...item, type: 'Course', link: `/courses/${item.code}` })),
        ...savedItems.careers.map(item => ({ ...item, type: 'Career', link: `/careers/${item.slug}` })),
        ...savedItems.programs.map(item => ({ ...item, type: 'Program', link: `/programs/${item._id}` })),
        ...savedItems.colleges.map(item => ({ ...item, type: 'College', link: `/colleges/${item._id}` })),
        ...savedItems.scholarships.map(item => ({ ...item, type: 'Scholarship', link: `/scholarships/${item._id}` })),
      ].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    }
    
    return savedItems[activeTab].map(item => ({
      ...item,
      type: activeTab.charAt(0).toUpperCase() + activeTab.slice(0, -1),
      link: activeTab === 'courses' ? `/courses/${item.code}` :
            activeTab === 'careers' ? `/careers/${item.slug}` :
            `/${activeTab}/${item._id}`,
    }));
  };

  const items = getItemsForTab();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
              <BookmarkIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Saved Items</h1>
              <p className="text-gray-600 mt-1">Manage your bookmarked content</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {savedItems && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card variant="elevated" padding="md">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{savedItems.stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{savedItems.stats.courses}</div>
                  <div className="text-sm text-gray-600">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{savedItems.stats.careers}</div>
                  <div className="text-sm text-gray-600">Careers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{savedItems.stats.programs}</div>
                  <div className="text-sm text-gray-600">Programs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{savedItems.stats.colleges}</div>
                  <div className="text-sm text-gray-600">Colleges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{savedItems.stats.scholarships}</div>
                  <div className="text-sm text-gray-600">Scholarships</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card variant="elevated" padding="sm">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                    {savedItems && tab.id !== 'all' && (
                      <Badge variant={isActive ? 'solid-white' : 'default'} size="sm">
                        {savedItems.stats[tab.id]}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card variant="elevated" padding="lg" className="text-center">
              <BookmarkIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Items</h3>
              <p className="text-gray-600 mb-6">
                Start exploring and save items you're interested in
              </p>
              <Button onClick={() => router.push('/courses')}>
                Explore Courses
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Items Grid */}
        {!loading && items.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.type}-${item._id}`}
                  variants={fadeInUp}
                  layout
                >
                  <Card
                    variant="elevated"
                    padding="md"
                    hover
                    hoverEffect="lift"
                    className="h-full"
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline-primary" size="sm">
                          {item.type}
                        </Badge>
                        <button
                          onClick={() => handleDelete(item._id, item.type)}
                          disabled={deletingId === item._id}
                          className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex-1 cursor-pointer" onClick={() => router.push(item.link)}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                          {item.name || item.title}
                        </h3>
                        
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {item.description}
                          </p>
                        )}

                        {item.type === 'Program' && item.collegeId && (
                          <p className="text-sm text-gray-600 mb-2">
                            <BuildingLibraryIcon className="h-4 w-4 inline mr-1" />
                            {item.collegeId.name}
                          </p>
                        )}

                        {item.savedAt && (
                          <p className="text-xs text-gray-500">
                            Saved {new Date(item.savedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => router.push(item.link)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
