import * as semver from 'semver';
import { Logger } from '../logger/logger';
import { VersionMigrator0_7_0 } from './version-migrator-0-7-0';

export interface VersionMigrator {
    readonly targetVersion: string;
    migrate(): Promise<void>;
}

export class PostUpdateMigrator {
    private versionMigratorList: VersionMigrator[] = [];

    constructor(private logger: Logger) {
        this.versionMigratorList.push(new VersionMigrator0_7_0());
    }

    async migrate() {
        let currentModelVersion = await this.getCurrentModelVersion();
        this.logger.debug({message: `Current model version is ${currentModelVersion}`});

        for (const versionMigrator of this.versionMigratorList) {
            if (semver.lte(versionMigrator.targetVersion, currentModelVersion)) {
                continue;
            }

            this.logger.debug({message: `Migrating to ${versionMigrator.targetVersion}`});
            await versionMigrator.migrate();
            await this.setCurrentModelVersion(versionMigrator.targetVersion);
            currentModelVersion = versionMigrator.targetVersion;
        }
    }

    private async getCurrentModelVersion(): Promise<string> {
        const storageObject = await browser.storage.local.get('version');
        const currentModelVersion = storageObject.version ? storageObject.version : '0.1.0';

        return '' + currentModelVersion;
    }

    private async setCurrentModelVersion(version: string) {
        await browser.storage.local.set({version});
    }
}
