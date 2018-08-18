import { existsSync } from 'fs';
import Database from 'better-sqlite3';
import nconf = require('nconf');
import { ConfigOption } from '@sweatbox-core/common';

import { schema } from './db-schema';

let db : Database;

export function getDatabase() : Database {

    if (db) {
        return db;
    }

    let file = nconf.get(ConfigOption.DB_FILE);
    let dbname = file || 'my.db';
    let options = file ? {} : { memory : true };
    let create = !file || !existsSync(file);

    db = new Database(dbname, options);

    if (create) {
        db.exec(schema);
    }

    return db;
}