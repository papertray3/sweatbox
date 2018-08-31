import { Component, OnInit, Output } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { MediaInfo, ConfigOption } from '@sweatbox-core/common';

import { MediaService } from './services/media.service';
import { ConfigService } from './services/config.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ElectronService, MediaService, ConfigService]
})
export class AppComponent implements OnInit {
  bounds: Electron.Rectangle;
  rowHeight: number;

  weatherIcon = "wi-day-sunny";

  @Output()
  media : MediaInfo;

  path : any;

  private _timer;
  private _delayTime : number;

  constructor(private _config : ConfigService, private _eService : ElectronService, private _media : MediaService) { 
    this._delayTime = this._config.get(ConfigOption.MEDIA_DISPLAY_TIME);
  }

  ngOnInit() {
    this.bounds  = this._eService.screen.getPrimaryDisplay().bounds;
    this.rowHeight = Math.ceil(this.bounds.height / 12);
    this._media.nextMedia.subscribe((m : MediaInfo) => {
      this.media = m;

      if (this.media.mime.startsWith('image') && this._delayTime > 0) {
        this._timer = setTimeout(() => {
          this.next()}, this._delayTime);
      } 
    });

    this._media.next();
  }

  next() {
    this._media.next();
  }

  nextFromVideo() {
    this._timer = setTimeout(() => this.next(), 1500);
  }

  manualNext() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    } 

    this.next();
  }

  removeMedia() {
    this._media.remove(this.media);
    this.manualNext();
  }
}
