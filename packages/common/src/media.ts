// for some reason image-size doesn't export the ImageInfo type
export interface ImageInfo {
    height: number,
    width: number,
    type: string
}

export interface MediaInfo {
    path : string,
    mime?: string | null,
    imageInfo? : ImageInfo,
    user?: string,
    profilePic?: string
}


export interface MediaCacheConstructor {
    new (directory : string, update : number, filter? : string[]) : MediaCache;
}

export abstract class MediaCache {
    abstract nextFile() : MediaInfo;
    abstract removeFile(media : MediaInfo) : MediaInfo | undefined;
}