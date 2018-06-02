import { Query } from '../../bus/query-bus';
import { Settings } from '../settings';

export class GetSettings implements Query<Settings> {
    readonly resultType: Settings;
}
