import { ElectronService } from 'ngx-electron';

import { MediaCacheConstructor, FilteredMediaConstructor } from '@sweatbox-core/common';

const eservice = new ElectronService();

export const MediaCacheFactory = eservice.remote.require('./media').MediaCache as MediaCacheConstructor;
export const FilteredMediaFactory = eservice.remote.require('./model/filtered-media').FilteredMedia as FilteredMediaConstructor;