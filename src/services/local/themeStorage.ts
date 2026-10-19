import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeDefinition } from '../../types/data';

const SAVED_THEMES_KEY = '@iconaura_saved_themes';

export async function saveTheme(theme: ThemeDefinition): Promise<{ success: boolean; isAlreadySaved: boolean }> {
  try {
    const savedThemesJson = await AsyncStorage.getItem(SAVED_THEMES_KEY);
    const savedThemes: ThemeDefinition[] = savedThemesJson ? JSON.parse(savedThemesJson) : [];

    const isAlreadySaved = savedThemes.some(t => t.id === theme.id);
    if (isAlreadySaved) {
      return { success: true, isAlreadySaved: true };
    }

    const nextSavedThemes = [...savedThemes, theme];
    await AsyncStorage.setItem(SAVED_THEMES_KEY, JSON.stringify(nextSavedThemes));
    return { success: true, isAlreadySaved: false };
  } catch (e) {
    console.error('Error saving theme:', e);
    return { success: false, isAlreadySaved: false };
  }
}

export async function unsaveTheme(themeId: string): Promise<boolean> {
  try {
    const savedThemesJson = await AsyncStorage.getItem(SAVED_THEMES_KEY);
    if (!savedThemesJson) return false;

    const savedThemes: ThemeDefinition[] = JSON.parse(savedThemesJson);
    const nextSavedThemes = savedThemes.filter(t => t.id !== themeId);

    await AsyncStorage.setItem(SAVED_THEMES_KEY, JSON.stringify(nextSavedThemes));
    return true;
  } catch (e) {
    console.error('Error unsaving theme:', e);
    return false;
  }
}

export async function getSavedThemes(): Promise<ThemeDefinition[]> {
  try {
    const savedThemesJson = await AsyncStorage.getItem(SAVED_THEMES_KEY);
    return savedThemesJson ? JSON.parse(savedThemesJson) : [];
  } catch (e) {
    console.error('Error fetching saved themes:', e);
    return [];
  }
}

export async function isThemeSaved(themeId: string): Promise<boolean> {
  try {
    const savedThemes = await getSavedThemes();
    return savedThemes.some(t => t.id === themeId);
  } catch (e) {
    return false;
  }
}
