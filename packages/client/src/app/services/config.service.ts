import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ConfigOption } from '../../../../common/lib';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  _config : any;

  constructor(private _eService : ElectronService) { 

    this._config = this._eService.remote.require('nconf');
  }


  get(key? : ConfigOption) : any {
    return this._config.get(key);
  }
}
