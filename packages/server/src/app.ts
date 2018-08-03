import express from 'express';
import { join, resolve, relative, normalize } from 'path';
import { existsSync, lstatSync } from 'fs';
import { getLogger, configure } from 'log4js';

import { version } from './version';
import { getConfig, commonOptions, CliOptions } from '@papertray3/express-config';
import { mediaRouter, MediaCache } from './media';

let options : CliOptions = {
    rootDir: {
        describe: 'Root directory to serve.',
        type: 'string',
        normalize: true,
        env: 'ROOT_DIR',
        confDefault: join(__dirname, '..', 'public')
    },
    mediaDir: {
        describe: 'Root directory for media to serve',
        type: 'string',
        normalize: true,
        env: 'MEDIA_DIR'
    },
    updateInterval: {
        describe: 'Amount of time (in minutes) to refresh the media directory.',
        type: 'number',
        env: 'UPDATE_INTERVAL',
        confDefault: 10
    }
};

const config = getConfig({
    version: version,
    cliOptions: Object.assign(commonOptions, options),
    overrides: {
        serverName: '@sweatbox/server',
        version: version
    }
});

configure({
    appenders: { server: { type: 'console'}},
    categories: { 
        default: {
            appenders: ['server'],
            level: config.get('logLevel')
        }
    }
});

const log = getLogger('sweatbox');
log.info(`Server ${config.get('serverName')} v${config.get('version')} starting in ${config.get('env')} mode`);
log.debug(config.get('updateInterval'));

const app = express();

_serveFolder(config.get('rootDir'), '/');
_serveFolder(config.get('mediaDir'), '/media');

app.use('/api', mediaRouter(new MediaCache('/media', resolve(config.get('mediaDir')), config.get('updateInterval'))));

app.listen(config.get('port'), () => {
    log.info(`listening on port ${config.get('port')}`);
    log.info(`Url: ${config.get('url')}`);
})

function _serveFolder(directory : string, root : string) {
    if (existsSync(directory) && lstatSync(directory).isDirectory()) {
        log.info(`Attempting to serve ${directory}`);
        app.use(root, express.static(directory));
    }
}