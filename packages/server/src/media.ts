import { resolve, join, relative } from 'path';
import { existsSync, lstatSync, readdirSync } from 'fs';
import { getLogger } from 'log4js';
import express from 'express';
import helmet from 'helmet';
import nconf = require('nconf');

import { MediaInfo } from '@sweatbox-core/common';

const shuffle = require('knuth-shuffle').knuthShuffle;

const MINUTE: number = 60 * 1000;
const log = getLogger('sweatbox/media');


export class MediaCacheError extends Error {
    private _file: string;

    constructor(directory: string, ...args: any[]) {
        super(...args);
        this._file = directory;
    }

    get file(): string { return this._file; }
}

export class MediaCache {

    private _idx: number = 0;
    private _mediaDir: string;
    private _files: string[] = [];
    private _root: string;

    constructor(root: string, directory: string, update: number) {
        let interval = update * MINUTE;
        this._root = root;
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
        let files = readdirSync(directory);
        files.forEach((nextFile: string) => {
            let target = join(directory, nextFile);
            let lstat = lstatSync(target);
            if (lstat.isFile() && target.endsWith('.jpg')) {
                this._files.push(this.rf(target));
            } else if (lstat.isDirectory()) {
                this.addDir(target);
            }
        });
    }

    private rf(file: string): string {
        return join(this._root, relative(this._mediaDir, file));
    }

    get nextFile() : string {
        let file = this._files[this._idx++];
        this._idx %= this._files.length;
        return file;
    }

    get root(): string { return this._root; }
}


export function mediaRouter(mediaCache: MediaCache): express.Router {
    let mr = express.Router();

    mr.use(helmet.noCache());

    mr.get('/next-media', (req: express.Request, res: express.Response) => {
        res.json({
            path: mediaCache.nextFile
        } as MediaInfo);
    });

    log.debug('Built Media API');
    return mr;
}