import { supabase } from '../lib/supabase';
import type { ThemeDefinition, ThemeId } from '../types/data';
import 'react-native-url-polyfill/auto';

function capitalizeFirst(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function fetchCategories(): Promise<{ id: string; name: string }[]> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, order_index')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return (data || [])
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    .map(cat => ({
      id: cat.slug,
      name: capitalizeFirst(cat.name),
    }));
}


async function getCategoryId(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

function normalizeWallpaper(input: any): { url: string; preview?: string } {
  if (typeof input === 'string') return { url: input };
  const preview = (input?.preview || '').replace(',e_blur:300', '');
  return { url: input?.url, preview: preview || undefined };
}

async function fetchWallpapersByTheme(themeIds: string[]): Promise<Record<string, { url: string; preview?: string }[]>> {
  const result: Record<string, { url: string; preview?: string }[]> = {};
  if (!themeIds.length) return result;

  const { data, error } = await supabase
    .from('theme_wallpapers')
    .select('theme_id, sort_order, wallpapers(*)')
    .in('theme_id', themeIds);

  if (error || !data) return result;

  data
    .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
    .forEach((row: any) => {
      const wallpaper = Array.isArray(row.wallpapers) ? row.wallpapers[0] : row.wallpapers;
      if (!wallpaper?.url) return;
      if (!result[row.theme_id]) result[row.theme_id] = [];
      result[row.theme_id].push({
        url: wallpaper.url,
        preview: wallpaper.preview_url || undefined,
      });
    });

  return result;
}

export async function fetchHomeThemes(filters?: {
  colors?: string[];
  tags?: string[];
}) {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return { categories: [], themesMap: {} };
  }

  
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug, order_index')
    .order('order_index', { ascending: true });

  if (catError) {
    console.error('Error fetching categories:', catError);
    return { categories: [], themesMap: {} };
  }

  
  const sortedCategories = (categories || [])
    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    .map(cat => ({ ...cat, name: capitalizeFirst(cat.name) }));

  
  let query = supabase
    .from('themes')
    .select('*, categories(slug)')
    .eq('is_public', true);

  if (filters?.colors && filters.colors.length > 0) {
    query = query.overlaps('color_tags', filters.colors);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('theme_tags', filters.tags);
  }

  const { data: themes, error: themeError } = await query;
  if (themeError) {
    console.error('Error fetching themes:', themeError);
    return { categories: sortedCategories || [], themesMap: {} };
  }

  const wallpapersByTheme = await fetchWallpapersByTheme((themes || []).map((row: any) => row.id));

  const themesMap: Record<string, ThemeDefinition[]> = {};
  themes.forEach(row => {
    
    const categoryData = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    const categorySlug = categoryData?.slug;

    if (categorySlug) {
      if (!themesMap[categorySlug]) themesMap[categorySlug] = [];
      const config = row.config as any;
      themesMap[categorySlug].push({
        id: row.id,
        name: row.name,
        description: config.description || 'Community Theme',
        category: categorySlug,
        featuredApps: Array.from(new Set<string>(config.featuredApps || [])),
        icon: config.icon,
        background: config.background,
        isPremium: row.is_premium || false,
        previewUrl: row.preview_url,
        preview: config.preview || { featuredApps: [], subtitle: '' },
        wallpapers: wallpapersByTheme[row.id] || (config.wallpapers || []).map(normalizeWallpaper),
      });
    }
  });

  return { categories: sortedCategories, themesMap };
}

export async function fetchTheme(themeId: ThemeId): Promise<ThemeDefinition> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    throw new Error('Supabase client not found');
  }

  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(themeId);
  const searchColumn = isUuid ? 'id' : 'slug';

  
  const { data, error } = await supabase
    .from('themes')
    .select('*, categories(name)')
    .eq(searchColumn, themeId)
    .single();

  if (error || !data) {
    throw new Error(`Theme not found: ${themeId}`);
  }

  const wallpapersByTheme = await fetchWallpapersByTheme([data.id]);

  const config = data.config as any;
  const categoryName = data.categories?.name || config.category || 'popular';

  return {
    id: data.id,
    name: data.name,
    description: config.description || 'Community Theme',
    category: categoryName,
    featuredApps: Array.from(new Set<string>(config.featuredApps || [])),
    icon: config.icon,
    background: config.background,
    isPremium: data.is_premium || false,
    previewUrl: data.preview_url,
    preview: config.preview || {
      featuredApps: [],
      subtitle: '',
    },
    wallpapers: wallpapersByTheme[data.id] || (config.wallpapers || []).map(normalizeWallpaper),
  };
}

export async function fetchPublicThemes(
  page: number = 1,
  limit: number = 20,
  filters?: {
    colors?: string[];
    tags?: string[];
  }
): Promise<{ data: ThemeDefinition[]; hasMore: boolean }> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return { data: [], hasMore: false };
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('themes')
    .select('*, categories(name)')
    .eq('is_public', true);

  if (filters?.colors && filters.colors.length > 0) {
    query = query.overlaps('color_tags', filters.colors);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('theme_tags', filters.tags);
  }

  const { data, error } = await query.range(from, to);

  if (error || !data) return { data: [], hasMore: false };

  const wallpapersByTheme = await fetchWallpapersByTheme((data || []).map((row: any) => row.id));

  const themes = data.map(row => {
    const config = row.config as any;
    const categoryName = row.categories?.name || config.category || 'popular';
    return {
      id: row.id,
      name: row.name,
      description: config.description || 'Community Theme',
      category: categoryName,
      featuredApps: Array.from(new Set<string>(config.featuredApps || [])),
      icon: config.icon,
      background: config.background,
      isPremium: row.is_premium || false,
      color_tags: row.color_tags || [],
      theme_tags: row.theme_tags || [],
      previewUrl: row.preview_url,
      preview: config.preview || {
        featuredApps: [],
        subtitle: '',
      },
      wallpapers: wallpapersByTheme[row.id] || (config.wallpapers || []).map(normalizeWallpaper),
    };
  });

  return {
    data: themes,
    hasMore: data.length === limit,
  };
}

export async function fetchThemesByCategory(category: string): Promise<ThemeDefinition[]> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return [];
  }


  
  const categoryRow = await getCategoryId(category);
  const categoryId = categoryRow?.id;

  const { data, error } = await supabase
    .from('themes')
    .select('*, categories(name)')
    .eq('is_public', true)
    .or(`category_id.eq.${categoryId || '00000000-0000-0000-0000-000000000000'},config->>category.eq.${category}`);

  if (error) {
    return [];
  }

  const wallpapersByTheme = await fetchWallpapersByTheme((data || []).map((row: any) => row.id));

  return (data || []).map(row => {
    const config = row.config as any;
    const categoryName = row.categories?.name || config.category || 'popular';
    return {
      id: row.id,
      name: row.name,
      description: config.description || 'Community Theme',
      category: categoryName,
      featuredApps: Array.from(new Set<string>(config.featuredApps || [])),
      icon: config.icon,
      background: config.background,
      isPremium: row.is_premium || false,
      previewUrl: row.preview_url,
      preview: config.preview || {
        featuredApps: [],
        subtitle: '',
      },
      wallpapers: wallpapersByTheme[row.id] || (config.wallpapers || []).map(normalizeWallpaper),
    };
  });
}
