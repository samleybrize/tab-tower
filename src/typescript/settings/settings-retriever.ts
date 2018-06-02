import { GetSettings } from './query/get-settings';
import { SettingsPersister } from './settings-persister';

export class SettingsRetriever {
    constructor(private settingsPersister: SettingsPersister) {
    }

    async querySettings(query: GetSettings) {
        return await this.settingsPersister.get();
    }
}
