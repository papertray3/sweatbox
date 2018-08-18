export interface FilteredMediaConstructor {
    new () : FilteredMedia;
}

export interface FilterFiles { 
    files : ReadonlyArray<string>;
}

export abstract class FilteredMedia implements FilterFiles {
    abstract get files() : ReadonlyArray<string>;
    abstract addFile(user : string, path : string) : void;
}