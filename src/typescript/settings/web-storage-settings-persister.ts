import { Settings } from './settings';
import { SettingsPersister } from './settings-persister';

const storageKey = 'settings';

export class WebStorageSettingsPersister implements SettingsPersister {
    async get(): Promise<Settings> {
        const storageObject = await browser.storage.local.get(storageKey);
        const rawSettingsObject = storageObject[storageKey] as Settings;

        const settings = new Settings();
        Object.assign(settings, rawSettingsObject);

        return settings;
    }

    async set(settings: Settings): Promise<void> {
        const persistObject: any = {};
        persistObject[storageKey] = settings;

        await browser.storage.local.set(persistObject);
    }
}
