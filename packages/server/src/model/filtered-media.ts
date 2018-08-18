import {getLogger} from 'log4js';
import Database from 'better-sqlite3';

import { DBTableNames, FilteredMedia as BaseFilteredMedia } from '@sweatbox-core/common';
import { getDatabase } from '../db';

const log = getLogger('filteredMedia');

export class FilteredMedia extends BaseFilteredMedia {

    private _db : Database;
    private _files: string[] = [];

    constructor() {
        super();
        this._db = getDatabase();
        let results = this._db.prepare(`select path from ${DBTableNames.FILTERED_MEDIA}`).all();
        results.forEach(row => {
            this._files.push(row.path);
        })
        log.debug(`Found ${this._files.length} files to filter`);
    }

    get files() { return this._files.slice(); }

    addFile(user : string, path : string) : void {
        let rr = this._db.prepare(`insert into ${DBTableNames.FILTERED_MEDIA} (user, path) values(?,?)`).run(user, path);
        if (rr.changes > 0) {
            this._files.push(path);
            log.debug(`Filtering out a new file: ${path}`);
        }
    }
}