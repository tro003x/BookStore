'use client';

import { useEffect, useMemo, useState } from 'react';
import BookCard from '@/components/BookCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Book {
  id: string;
  title: string;
  authorName: string;
  price: number;
  coverImageUrl: string | null;
  category: { name: string };
  averageRating?: number;
  reviewCount?: number;
}

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('none');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, categoriesRes] = await Promise.all([
          fetch('/api/books'),
          fetch('/api/categories'),
        ]);
        const booksData = await booksRes.json();
        const categoriesData = await categoriesRes.json();
        setBooks(Array.isArray(booksData) ? booksData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Unique authors from books
  const authors = useMemo(() => {
    const set = new Set(books.map((b) => b.authorName).filter(Boolean));
    return Array.from(set).sort();
  }, [books]);

  const hasActiveFilters =
    authorFilter !== 'all' || categoryFilter !== 'all' || sortBy !== 'none';

  const clearFilters = () => {
    setAuthorFilter('all');
    setCategoryFilter('all');
    setSortBy('none');
  };

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...books];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.authorName.toLowerCase().includes(q) ||
          b.category.name.toLowerCase().includes(q)
      );
    }

    if (authorFilter !== 'all') {
      list = list.filter((b) => b.authorName === authorFilter);
    }

    if (categoryFilter !== 'all') {
      list = list.filter((b) => b.category.name === categoryFilter);
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [books, search, authorFilter, categoryFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#F5F2EC] px-4 py-10">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-['Fraunces'] text-4xl font-semibold text-[#1A1D1E] mb-2">
            Catalog
          </h1>
          <h2 className="text-base text-[#6B7280] font-normal">
            Browse all available PDF books
          </h2>
        </div>

        {/* Search + Filter */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-[#6B7280] pointer-events-none" />
            <Input
              placeholder="Search by title, author, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-14 h-12 bg-white border-[#E5E7EB] rounded-lg text-sm"
            />

            {/* Filter button inside search field right side */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger
                className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md flex items-center justify-center transition-colors ${hasActiveFilters
                  ? 'bg-[#14B8A6] text-white'
                  : 'hover:bg-[#F5F2EC] text-[#6B7280]'
                  }`}
                aria-label="Open filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </PopoverTrigger>

              <PopoverContent align="end" className="w-72 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-[#1A1D1E]">
                    Filters
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-[#14B8A6] hover:underline flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Clear
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Author */}
                  <div>
                    <Label className="text-xs mb-1.5 block text-[#6B7280]">
                      Author
                    </Label>
                    <Select
                      value={authorFilter}
                      onValueChange={(val) => {
                        if (val !== null) setAuthorFilter(val);
                      }}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="All authors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All authors</SelectItem>
                        {authors.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div>
                    <Label className="text-xs mb-1.5 block text-[#6B7280]">
                      Category
                    </Label>
                    <Select
                      value={categoryFilter}
                      onValueChange={(val) => {
                        if (val !== null) setCategoryFilter(val);
                      }}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div>
                    <Label className="text-xs mb-1.5 block text-[#6B7280]">
                      Sort by
                    </Label>
                    <Select
                      value={sortBy}
                      onValueChange={(val) => {
                        if (val !== null) setSortBy(val);
                      }}
                    >
                      <SelectTrigger className="w-full h-9 text-sm">
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Default</SelectItem>
                        <SelectItem value="price-asc">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-desc">
                          Price: High to Low
                        </SelectItem>
                        <SelectItem value="title">Title (A–Z)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => setFilterOpen(false)}
                    className="w-full bg-[#4B5D45] hover:bg-[#3E4C39] text-white h-9 text-sm"
                  >
                    Apply Filters
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {authorFilter !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#14B8A6]/10 text-[#0D9488] text-xs">
                  Author: {authorFilter}
                  <button onClick={() => setAuthorFilter('all')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#14B8A6]/10 text-[#0D9488] text-xs">
                  {categoryFilter}
                  <button onClick={() => setCategoryFilter('all')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {sortBy !== 'none' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#14B8A6]/10 text-[#0D9488] text-xs">
                  {sortBy === 'price-asc'
                    ? 'Price ↑'
                    : sortBy === 'price-desc'
                      ? 'Price ↓'
                      : 'A–Z'}
                  <button onClick={() => setSortBy('none')}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-[#6B7280] mb-4 text-center">
            {filtered.length} {filtered.length === 1 ? 'book' : 'books'} found
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <p className="text-sm text-[#6B7280] text-center py-10">
            Loading...
          </p>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E5E7EB] py-16 text-center">
            <p className="text-sm text-[#6B7280] mb-4">
              No books match your filters.
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="text-sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}