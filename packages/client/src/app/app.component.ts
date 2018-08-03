import { Component, OnInit } from '@angular/core';

import { MediaInfo } from '@sweatbox-core/common';
import { MediaService } from './services/media.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  media = 'sweatbox-client';

  constructor(private _mediaService : MediaService) { }

  ngOnInit() {
    this._mediaService.nextMedia.subscribe((m : MediaInfo) => {
      console.log(m);
      this.media = m.path;
    });

    this._mediaService.start();
  }
}
