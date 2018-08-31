import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MediaInfo, ImageInfo } from '@sweatbox-core/common';


@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit {

  @ViewChild('imageContainer')
  private _imageContainer : ElementRef;

  private _media : MediaInfo;
  imagePath : string;
  videoPath : string;

  @Output()
  videoEnded : EventEmitter<boolean> = new EventEmitter<boolean>();

  imageWidth : number = 0;
  imageHeight : number = 0;
  imageTop : number = 0;
  imageLeft : number = 0;

  @Input()
  set media(m : MediaInfo) {
    this._media = m;

    if (m.mime.startsWith('image')) {
      this.imagePath = 'url(' + m.path + ')';
      this.setImageSize(m.imageInfo);
    } else {
      this.imagePath = null;
    }
    this.videoPath = m.mime.startsWith('video') ? m.path : null;

  }

  constructor() { }

  ngOnInit() {

  }

  onVideoEnded() {
    this.videoEnded.emit(true);
  }

  private setImageSize(info : ImageInfo | undefined) {
    let cW = this.imageContainerWidth;
    let cH = this.imageContainerHeight;

    if (!info) { 
      this.imageWidth = cW
      this.imageHeight = cH
      return;
    }

    let w = info.width;
    let h = info.height;
    let a = w/h;

    //bias to width...don't overrun width but height we can

    if (a >= 1) {
      w = cW;
      h = cW;
    } else {
      w = cH*a > cW ? cW : cH*a;
      h = w/a;
    }

    this.imageWidth = w;
    this.imageHeight = h;
    this.imageTop = Math.max((cH - h)/2, 0);
    this.imageLeft = Math.max((cW - w)/2, 0);
  }

  get imageContainerWidth() { return this._imageContainer.nativeElement.offsetWidth; }
  get imageContainerHeight() { return this._imageContainer.nativeElement.offsetHeight; }

}
