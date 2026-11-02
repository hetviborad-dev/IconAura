import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { APP_VERSION } from '../data/config';

export interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string;
  minVersion: string;
  required: boolean;
  storeUrl: string | null;
  message: string | null;
  error: string | null;
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n.replace(/\D/g, ''), 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n.replace(/\D/g, ''), 10) || 0);
  const length = Math.max(pa.length, pb.length);
  for (let i = 0; i < length; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

export async function checkForAppUpdate(): Promise<VersionCheckResult> {
  const currentVersion = APP_VERSION;
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';

  try {
    const { data, error } = await supabase
      .from('app_versions')
      .select('min_version, latest_version, force_update, store_url, message')
      .eq('platform', platform)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return {
        currentVersion,
        latestVersion: currentVersion,
        minVersion: currentVersion,
        required: false,
        storeUrl: null,
        message: null,
        error: null,
      };
    }

    const minVersion = data.min_version ?? currentVersion;
    const latestVersion = data.latest_version ?? currentVersion;
    const belowMin = compareVersions(currentVersion, minVersion) < 0;
    const belowLatest = compareVersions(currentVersion, latestVersion) < 0;
    const forceUpdate = Boolean(data.force_update);

    return {
      currentVersion,
      latestVersion,
      minVersion,
      required: belowLatest && (belowMin || forceUpdate),
      storeUrl: data.store_url ?? null,
      message: data.message ?? 'A new version is available. Please update to continue.',
      error: null,
    };
  } catch (err) {
    return {
      currentVersion,
      latestVersion: currentVersion,
      minVersion: currentVersion,
      required: false,
      storeUrl: null,
      message: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}