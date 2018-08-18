import { resolve, join } from 'path';
import { existsSync, lstatSync, readdirSync } from 'fs';
import { getLogger } from 'log4js';
import { getType } from 'mime';
import sizeOf from 'image-size';

import { MediaInfo, MediaCache as BaseMediaCache } from '@sweatbox-core/common';

const shuffle = require('knuth-shuffle').knuthShuffle;

const MINUTE: number = 60 * 1000;
const PROFILE: string = 'ProfilePic';
const log = getLogger('sweatbox/media');


export class MediaCacheError extends Error {
    private _file: string;

    constructor(directory: string, ...args: any[]) {
        super(...args);
        this._file = directory;
    }

    get file(): string { return this._file; }
}

interface Profiles {
    [user : string] : string
}

export class MediaCache extends BaseMediaCache {

    private _idx: number = 0;
    private _mediaDir: string;
    private _files: MediaInfo[] = [];
    private _filter : string[] = [];
    private _profiles : Profiles = {};

    constructor(directory: string, update: number, filter? : string[]) {
        super();
        let interval = update * MINUTE;

        if (filter) {
            this._filter = filter.slice();
            log.debug(`Filter provided, ${this._filter.length} files to filter out`);
        }

        this._mediaDir = resolve(directory);
        if (!existsSync(this._mediaDir) && !lstatSync(this._mediaDir).isDirectory()) {
            throw new MediaCacheError(this._mediaDir, 'Cannot access media directory');
        }

        if (interval > 0) {

            log.debug(`setting interval for ${interval} ms`);
            setInterval(() => {
                this.load();
            }, interval);
        } else {
            log.debug('Interval Loading is disabled');
        }

        this.load();
    }

    private load() {
        log.debug('loading media');
        this._files = [];
        this.addDir(this._mediaDir);
        shuffle(this._files);
        log.debug(`loaded ${this._files.length} files`);
    }

    private addDir(directory: string) {
        let users = readdirSync(directory);
        users.forEach((user: string) => {
            let target = join(directory, user);
            let lstat = lstatSync(target);
            if (lstat.isDirectory()) {
                this.addUserDir(target, user);
            }
        });
    }

    private addUserDir(userDirectory : string, user : string) {
        let files = readdirSync(userDirectory);
        files.forEach((file : string) => {
            let target = join(userDirectory, file);
            let lstat = lstatSync(target);
            if (lstat.isFile()) {
                if (file.startsWith(PROFILE)) {
                    this._profiles[user] = target;
                } else {
                    this.addfile(target, user);
                }
            }
        });
    }


    private addfile(media : string, user : string) {
        let m : MediaInfo = {
            path: media,
            user: user,
            mime: getType(media)
        }

        if (m.mime && m.mime.startsWith('image')) {
            m.imageInfo = sizeOf(media);
        }

        if (this._files.length == 0 && this._filter) {
            this._filter.forEach(filter => log.debug(`Filter: ${filter}`));
        }

        if (!this._filter || this._filter.indexOf(m.path) == -1) {
            this._files.push(m);
        }
    }

    nextFile() : MediaInfo {
        let file = this._files[this._idx++];
        if (file.user) {
            file.profilePic = this._profiles[file.user];
        }
        this._idx %= this._files.length;
        return file;
    }

    removeFile(media : MediaInfo) : MediaInfo | undefined { 
        let mediaFile = media.path;
        let idx = this._files.findIndex((m) => {
            return m.path === mediaFile;
        });

        if (idx >= 0) {
            let ret = this._files.splice(idx, 1);
            this._idx %= this._files.length;

            this._filter.push(ret[0].path);

            return ret[0];
        } else {
            return undefined;
        }
    }

}
