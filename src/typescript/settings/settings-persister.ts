import { Settings } from './settings';

export interface SettingsPersister {
    get(): Promise<Settings>;
    set(settings: Settings): Promise<void>;
}
