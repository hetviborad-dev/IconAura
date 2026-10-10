import { supabase } from '../lib/supabase';
import type { ThemeDefinition, ThemeId } from '../types/data';
import 'react-native-url-polyfill/auto';

export async function fetchTheme(themeId: ThemeId): Promise<ThemeDefinition> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    throw new Error('Supabase client not found');
  }

  // Determine if we are searching by UUID (id) or friendly name (slug)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(themeId);
  const searchColumn = isUuid ? 'id' : 'slug';

  // Fetch from Supabase
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq(searchColumn, themeId)
    .single();

  if (error || !data) {
    throw new Error(`Theme not found: ${themeId}`);
  }

  // Map Supabase row to ThemeDefinition
  const config = data.config as any;

  return {
    id: data.id,
    name: data.name,
    description: config.description || 'Community Theme',
    category: config.category || 'popular',
    featuredApps: config.featuredApps || [],
    icon: config.icon,
    background: config.background,
    previewUrl: data.preview_url,
    preview: config.preview || {
      featuredApps: [],
      subtitle: '',
    },
  };
}

export async function fetchPublicThemes(): Promise<ThemeDefinition[]> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('is_public', true);

  if (error || !data) return [];

  return data.map(row => {
    const config = row.config as any;
    return {
      id: row.id,
      name: row.name,
      description: config.description || 'Community Theme',
      category: config.category || 'popular',
      featuredApps: config.featuredApps || [],
      icon: config.icon,
      background: config.background,
      previewUrl: row.preview_url,
      preview: config.preview || {
        featuredApps: [],
        subtitle: '',
      },
    };
  });
}

export async function fetchThemesByCategory(category: string): Promise<ThemeDefinition[]> {
  if (!supabase) {
    console.error('Supabase client is not initialized');
    return [];
  }

  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('is_public', true)
    .eq('config->>category', category);

  if (error || !data) return [];
console.log('Fetched themes for category:', category, data);
  return data.map(row => {
    const config = row.config as any;
    return {
      id: row.id,
      name: row.name,
      description: config.description || 'Community Theme',
      category: config.category || 'popular',
      featuredApps: config.featuredApps || [],
      icon: config.icon,
      background: config.background,
      previewUrl: row.preview_url,
      preview: config.preview || {
        featuredApps: [],
        subtitle: '',
      },
    };
  });
}
