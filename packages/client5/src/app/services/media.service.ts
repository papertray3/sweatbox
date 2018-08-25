import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { MediaInfo, ConfigOption, MediaCache, FilteredMedia } from '@sweatbox-core/common';
import { ConfigService } from './config.service';
import { MediaCacheFactory, FilteredMediaFactory } from '../model/common';


@Injectable()
export class MediaService {

  private _mc : MediaCache;
  private _filteredMedia : FilteredMedia;
  private _mediaInfo = new Subject<MediaInfo>();

  public nextMedia = this._mediaInfo.asObservable();

  constructor(private _config : ConfigService) { 
    this._filteredMedia = new FilteredMediaFactory();
    let filter = this._filteredMedia.files;
    this._mc = new MediaCacheFactory(this._config.get(ConfigOption.MEDIA_DIR), this._config.get(ConfigOption.UPDATE_INTERVAL), filter.slice());
  }

  next() {
    this._mediaInfo.next(this._mc.nextFile());
  }

  remove(media : MediaInfo) {
    this._mc.removeFile(media);
    this._filteredMedia.addFile(media.user || "none", media.path);
  }

}
