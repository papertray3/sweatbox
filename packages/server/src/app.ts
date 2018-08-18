import { app, BrowserWindow, globalShortcut } from 'electron';
import { join, resolve } from 'path';
import { getLogger, configure } from 'log4js';
import { format } from 'url';

import { version } from './version';
import { getConfig, commonOptions, CliOptions } from '@papertray3/express-config';
import { ConfigOption } from '@sweatbox-core/common';

type RegisterFileProtocolCallback = (file?: { path: string }) => void;

// don't need these
delete commonOptions.bind;
delete commonOptions.port;

let options: CliOptions = {};
options[ConfigOption.ROOT_DIR] = {
    describe: 'Root directory to serve.',
    type: 'string',
    normalize: true,
    env: 'ROOT_DIR',
    confDefault: join(__dirname, '..', 'public')
};

options[ConfigOption.MEDIA_DIR] = {
    describe: `Root directory for media to serve. Expected format: 
<mediaDir>
|_<user1>
|__ProfilePic.<user1>.<id>.jpg
|__[Image|Sidecar|Video|StoryImage].<user1>.<id>.<jpg|mp4>
.
.
.
|_<user2>
|__ProfilePic.<user2>.<id>.jpg
.
.
.
|_<user3>
.
.
.

Currently, only JPEGs are supported and videos are ignored
`,
    type: 'string',
    normalize: true,
    env: 'MEDIA_DIR'
};
options[ConfigOption.UPDATE_INTERVAL] = {
    describe: 'Amount of time (in minutes) to refresh the media directory.',
    type: 'number',
    env: 'UPDATE_INTERVAL',
    confDefault: 10
};

options[ConfigOption.KIOSK_OFF] = {
    describe: 'Turn off kiosk mode',
    type: 'boolean',
    default: undefined,
    env: 'KIOSK_OFF',
    confDefault: false
};

options[ConfigOption.MEDIA_DISPLAY_TIME] = {
    describe: 'Time in milliseconds to display images',
    type: 'number',
    env: 'MEDIA_DISPLAY_TIME',
    confDefault: 8000
}

options[ConfigOption.DB_FILE] = {
    describe: 'DB file to use, if left blank an in-memory DB will be created',
    type: 'string',
    normalize: true,
    env: 'DB_FILE'
}

const config = getConfig({
    version: version,
    cliOptions: Object.assign(commonOptions, options),
    overrides: {
        serverName: '@sweatbox/server',
        version: version
    }
});

configure({
    appenders: { server: { type: 'console' } },
    categories: {
        default: {
            appenders: ['server'],
            level: config.get('logLevel')
        }
    }
});

const log = getLogger('sweatbox');
log.info(`Server ${config.get('serverName')} v${config.get('version')} starting in ${config.get('env')} mode`);

//TODO: this will probably change based on packaging
const contentPath = resolve(config.get(ConfigOption.ROOT_DIR));

let win: BrowserWindow | null;

function createWindow() {
    win = new BrowserWindow({ kiosk: !config.get(ConfigOption.KIOSK_OFF), skipTaskbar: false })

    // load the dist folder from Angular
    win.loadURL(format({
        pathname: join(contentPath, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools optionally:
    if (config.get('env') === 'development') {
        win.webContents.openDevTools()
    }

    win.on('closed', () => {
        win = null;
    });

    globalShortcut.register('f5', function() {
        log.debug('f5 is pressed')
        if (win != null)
    		win.reload();
	})
	globalShortcut.register('CommandOrControl+R', function() {
        log.debug('CommandOrControl+R is pressed');
        if (win != null)
		    win.reload();
	})
}

app.on('ready', createWindow);


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
});