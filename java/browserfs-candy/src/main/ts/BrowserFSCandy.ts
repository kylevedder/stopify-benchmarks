import { FileSystem } from "browserfs/index";
// import {BFSCallback} from "/Users/nicoleandrews/Documents/PLASMA Lab/stopify-benchmarks/java/browserfs-candy/src/main/java/def/browserfs";
import {BFSCallback} from "/Users/nicoleandrews/Documents/PLASMA Lab/BrowserFS/src/core/file_system";
import {default as Stats, FileType} from "/Users/nicoleandrews/Documents/PLASMA Lab/BrowserFS/src/core/node_fs_stats";
import {ApiError} from "/Users/nicoleandrews/Documents/PLASMA Lab/BrowserFS/src/core/api_error";
import * as path from "path";

const GoogleDriveFileSystem = FileSystem.GoogleDrive;

export function init(cb: () => void): void {
    if (GoogleDriveFileSystem.isAvailable()) {
        var oauthToken: any;        

        // Use the API Loader script to load google.picker and gapi.auth.
        var onApiLoad = () => {
            // load the APIs
            gapi.load('client:auth', onAuthApiLoad);
        };

        var onAuthApiLoad = () => {
            // The Client ID obtained from the Google Developers Console. Replace with your own Client ID.
            var clientId = "576255310053-nl3vla4sgg0cmu9ieb3l79fca2iuhrcs.apps.googleusercontent.com"
            // Scope to use to access user's items.
            var scope = ['https://www.googleapis.com/auth/drive'];

            ( < any > window).gapi.auth.authorize({
                    'client_id': clientId,
                    'scope': scope,
                    'immediate': false
                },
                // log the user in
                handleAuthResult);
        };

        var handleAuthResult = (authResult: any) => {
            if (authResult && !authResult.error) {
                oauthToken = authResult.access_token;
                gapi.client.load('drive', 'v2', () => {
                    var fs = new GoogleDriveFileSystem(oauthToken);
                    fs.empty(() => {
                        cb();
                    });
                });
            }
        };

        onApiLoad();
    } else {
        cb();
    }
}

export function isAvailable(): boolean {
    return true;
}

export function getName(): string {
    return 'Google Drive';
  }

  export function isReadOnly(): boolean {
    return false;
  }

  export function supportsProps(): boolean {
    return false;
  }

  export function supportsSynch(): boolean {
    return false;
  }

  export function supportsSymlinks(): boolean {
    return false;
  }

  export function supportsLinks(): boolean {
    return false;
  }

  // export function empty(mainCb: BFSOneArgCallback): void {
  //   mainCb();
  // }

   export function stat(p: string, isLstat: boolean | null, cb: BFSCallback<Stats>): void {
    // Ignore lstat case -- GoogleDrive doesn't support symlinks
    // Stat the file
    if (p === '/') {
      // assume the root directory exists
      const stats = new Stats(FileType.DIRECTORY, 0, 0);
      return cb(null, stats);
    } else {
      const title = path.basename(p);
      const request = (<any> (gapi.client)).drive.files.list({
        q: "title = '" + title + "'",
      });
      request.execute((resp: any) => {
        if (typeof resp.items !== 'undefined' && typeof resp.items[0] !== 'undefined' && typeof resp.items[0].id !== 'undefined') {
          const id = resp.items[0].id;
          const secondRequest = (<any> (gapi.client)).drive.files.get({
            fileId: id
          });
          secondRequest.execute(function(resp: any) {
            const type = resp.mimeType;
            if (type === 'application/vnd.google-apps.folder') {
              const stats = new Stats(FileType.DIRECTORY, 0, 0);
              return cb(null, stats);
            } else {
              const stats = new Stats(FileType.FILE, 0, 0);
              return cb(null, stats);
            }
          });
        } else {
          return cb(ApiError.ENOENT(p));
        }
      });
    }
  }
