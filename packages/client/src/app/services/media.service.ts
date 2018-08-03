import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, interval, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { MediaInfo } from '@sweatbox-core/common';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private _mediaInfo = new Subject<MediaInfo>();
  public nextMedia = this._mediaInfo.asObservable();

  constructor(private _http: HttpClient) { }

  start() {
    interval(10000).pipe(
      mergeMap((terval: number) => {
        let t = +new Date();
        return this._http.get<MediaInfo>('/api/next-media', {
          params: {
            t: t.toString()
          }
        });
      })
    ).subscribe((media: MediaInfo) => {
      this._mediaInfo.next(media);
    });
  }
}
