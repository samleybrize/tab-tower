import { VersionMigrator } from './post-update-migrator';

// tslint:disable:class-name
export class VersionMigrator0_7_0 implements VersionMigrator {
    readonly targetVersion = '0.7.0';

    async migrate() {
        await this.clearStorage();
    }

    private async clearStorage() {
        await browser.storage.local.clear();
    }
}
