(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.engineFilesV3_7_3_Canvas = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
module.exports = require("./lib/index");

},{"./lib/index":87}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetAccessor = void 0;
/**
 * アセットへのアクセスを提供するアクセッサ群。
 *
 * 実態は `AssetManager` のいくつかのメソッドに対するラッパーである。
 * このクラスにより、パス・アセットID・パターン・フィルタから、対応する読み込み済みアセットを取得できる。
 *
 * 通常、ゲーム開発者はこのクラスのオブジェクトを生成する必要はない。
 * `g.Scene#asset` に代入されている値を利用すればよい。
 */
var AssetAccessor = /** @class */ (function () {
    /**
     * `AssetAccessor` のインスタンスを生成する。
     *
     * @param ラップする `AssetManager`
     */
    function AssetAccessor(assetManager) {
        this._assetManager = assetManager;
    }
    /**
     * パスから読み込み済みの画像アセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     *
     * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
     * 当該の画像アセットが読み込まれていない場合、エラー。
     *
     * @param path 取得する画像アセットのパス
     */
    AssetAccessor.prototype.getImage = function (path) {
        return this._assetManager.peekLiveAssetByAccessorPath(path, "image");
    };
    /**
     * パスから読み込み済みのオーディオアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     *
     * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
     * さらにオーディオアセットに限り、拡張子を省いたものでなければならない。(e.g. `"/audio/bgm01"`)
     *
     * 当該のオーディオアセットが読み込まれていない場合、エラー。
     *
     * @param path 取得するオーディオアセットのパス
     */
    AssetAccessor.prototype.getAudio = function (path) {
        return this._assetManager.peekLiveAssetByAccessorPath(path, "audio");
    };
    /**
     * パスから読み込み済みのスクリプトアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     *
     * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
     * 当該のスクリプトアセットが読み込まれていない場合、エラー。
     *
     * @param path 取得するスクリプトアセットのパス
     */
    AssetAccessor.prototype.getScript = function (path) {
        return this._assetManager.peekLiveAssetByAccessorPath(path, "script");
    };
    /**
     * パスから読み込み済みのテキストアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     *
     * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
     * 当該のテキストアセットが読み込まれていない場合、エラー。
     *
     * @param path 取得するテキストアセットのパス
     */
    AssetAccessor.prototype.getText = function (path) {
        return this._assetManager.peekLiveAssetByAccessorPath(path, "text");
    };
    /**
     * パスから読み込み済みのテキストアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得し、その内容の文字列を返す。
     *
     * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
     * 当該のテキストアセットが読み込まれていない場合、エラー。
     *
     * @param path 内容の文字列を取得するテキストアセットのパス
     */
    AssetAccessor.prototype.getTextContent = function (path) {
        return this.getText(path).data;
    };
    /**
     * パスから読み込み済みのテキストアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得し、その内容をJSONとしてパースした値を返す。
     *
     * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
     * 当該のテキストアセットが読み込まれていない場合、エラー。
     *
     * @param path 内容のJSONを取得するテキストアセットのパス
     */
    AssetAccessor.prototype.getJSONContent = function (path) {
        return JSON.parse(this.getTextContent(path));
    };
    /**
     * パスから読み込み済みのベクタ画像アセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     *
     * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
     * 当該のベクタ画像アセットが読み込まれていない場合、エラー。
     *
     * @param path 取得する画像アセットのパス
     */
    AssetAccessor.prototype.getVectorImage = function (path) {
        return this._assetManager.peekLiveAssetByAccessorPath(path, "vector-image");
    };
    /**
     * パスから読み込み済みのバイナリアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     *
     * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
     * 当該のバイナリアセットが読み込まれていない場合、エラー。
     *
     * @param path 取得するバイナリアセットのパス
     */
    AssetAccessor.prototype.getBinary = function (path) {
        return this._assetManager.peekLiveAssetByAccessorPath(path, "binary");
    };
    /**
     * パスから読み込み済みのバイナリアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得し、その内容のバイト配列を返す。
     *
     * パスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスでなければならない。
     * 当該のバイナリアセットが読み込まれていない場合、エラー。
     *
     * @param path 内容のバイト配列を取得するバイナリアセットのパス
     */
    AssetAccessor.prototype.getBinaryData = function (path) {
        return this.getBinary(path).data;
    };
    /**
     * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全画像アセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     *
     * ここでパスはgame.jsonのあるディレクトリをルート (`/`) とする、 `/` 区切りの絶対パスである。
     *
     * パターンは、パス文字列、またはパス中に0個以上の `**`, `*`, `?` を含む文字列である。
     * ここで `**` は0個以上の任意のディレクトリを、 `*` は0個以上の `/` でない文字を、
     * `?` は1個の `/` でない文字を表す。 (e.g. "/images/monsters??/*.png")
     *
     * フィルタは、パスを受け取ってbooleanを返す関数である。
     * フィルタを与えた場合、読み込み済みの全アセットのうち、フィルタが偽でない値を返したものを返す。
     *
     * @param patternOrFilter 取得する画像アセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
     */
    AssetAccessor.prototype.getAllImages = function (patternOrFilter) {
        return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter !== null && patternOrFilter !== void 0 ? patternOrFilter : "**/*", "image");
    };
    /**
     * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全オーディオアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
     * ただしオーディオアセットに限り、拡張子を省いたものでなければならない。(e.g. `"/audio/bgm*"`)
     *
     * @param patternOrFilter 取得するオーディオアセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
     */
    AssetAccessor.prototype.getAllAudios = function (patternOrFilter) {
        return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter !== null && patternOrFilter !== void 0 ? patternOrFilter : "**/*", "audio");
    };
    /**
     * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全スクリプトアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
     *
     * @param patternOrFilter 取得するスクリプトアセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
     */
    AssetAccessor.prototype.getAllScripts = function (patternOrFilter) {
        return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter !== null && patternOrFilter !== void 0 ? patternOrFilter : "**/*", "script");
    };
    /**
     * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全テキストアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
     *
     * @param patternOrFilter 取得するテキストアセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
     */
    AssetAccessor.prototype.getAllTexts = function (patternOrFilter) {
        return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter !== null && patternOrFilter !== void 0 ? patternOrFilter : "**/*", "text");
    };
    /**
     * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みの全ベクタ画像アセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
     *
     * @param patternOrFilter 取得するベクタ画像アセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
     */
    AssetAccessor.prototype.getAllVectorImages = function (patternOrFilter) {
        return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter !== null && patternOrFilter !== void 0 ? patternOrFilter : "**/*", "vector-image");
    };
    /**
     * 与えられたパターンまたはフィルタにマッチするパスを持つ、読み込み済みのバイナリアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     * 引数の仕様については `AssetAccessor#getAllImages()` の仕様を参照のこと。
     *
     * @param patternOrFilter 取得するベクタ画像アセットのパスパターンまたはフィルタ。省略した場合、読み込み済みの全て
     */
    AssetAccessor.prototype.getAllBinaries = function (patternOrFilter) {
        return this._assetManager.peekAllLiveAssetsByPattern(patternOrFilter !== null && patternOrFilter !== void 0 ? patternOrFilter : "**/*", "binary");
    };
    /**
     * アセットIDから読み込み済みの画像アセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     * 当該の画像アセットが読み込まれていない場合、エラー。
     *
     * @param assetId 取得する画像アセットのID
     */
    AssetAccessor.prototype.getImageById = function (assetId) {
        return this._assetManager.peekLiveAssetById(assetId, "image");
    };
    /**
     * アセットIDから読み込み済みのオーディオアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     * 当該のオーディオアセットが読み込まれていない場合、エラー。
     *
     * @param assetId 取得するオーディオアセットのID
     */
    AssetAccessor.prototype.getAudioById = function (assetId) {
        return this._assetManager.peekLiveAssetById(assetId, "audio");
    };
    /**
     * アセットIDから読み込み済みのスクリプトアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     * 当該のスクリプトアセットが読み込まれていない場合、エラー。
     *
     * @param assetId 取得するスクリプトアセットのID
     */
    AssetAccessor.prototype.getScriptById = function (assetId) {
        return this._assetManager.peekLiveAssetById(assetId, "script");
    };
    /**
     * アセットIDから読み込み済みのテキストアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     * 当該のテキストアセットが読み込まれていない場合、エラー。
     *
     * @param assetId 取得するテキストアセットのID
     */
    AssetAccessor.prototype.getTextById = function (assetId) {
        return this._assetManager.peekLiveAssetById(assetId, "text");
    };
    /**
     * アセットIDから読み込み済みのテキストアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得し、その内容の文字列を返す。
     * 当該のテキストアセットが読み込まれていない場合、エラー。
     *
     * @param assetId 内容の文字列を取得するテキストアセットのID
     */
    AssetAccessor.prototype.getTextContentById = function (assetId) {
        return this.getTextById(assetId).data;
    };
    /**
     * アセットIDから読み込み済みのテキストアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得し、その内容をJSONとしてパースして返す。
     * 当該のテキストアセットが読み込まれていない場合、エラー。
     *
     * @param assetId 内容のJSONを取得するテキストアセットのID
     */
    AssetAccessor.prototype.getJSONContentById = function (assetId) {
        return JSON.parse(this.getTextById(assetId).data);
    };
    /**
     * アセットIDから読み込み済みのベクタ画像アセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     * 当該のベクタ画像アセットが読み込まれていない場合、エラー。
     *
     * @param assetId 取得するベクタ画像アセットのID
     */
    AssetAccessor.prototype.getVectorImageById = function (assetId) {
        return this._assetManager.peekLiveAssetById(assetId, "vector-image");
    };
    /**
     * アセットIDから読み込み済みのバイナリアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得する。
     * 当該のバイナリアセットが読み込まれていない場合、エラー。
     *
     * @param assetId 取得するバイナリアセットのID
     */
    AssetAccessor.prototype.getBinaryById = function (assetId) {
        return this._assetManager.peekLiveAssetById(assetId, "binary");
    };
    /**
     * アセットIDから読み込み済みのバイナリアセット（現在のシーンで読み込んだ、またはグローバルなアセット）を取得し、その内容のバイト配列を返す。
     * 当該のバイナリアセットが読み込まれていない場合、エラー。
     *
     * @param assetId 取得するバイナリアセットのID
     */
    AssetAccessor.prototype.getBinaryDataById = function (assetId) {
        return this.getBinaryById(assetId).data;
    };
    return AssetAccessor;
}());
exports.AssetAccessor = AssetAccessor;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetHolder = void 0;
var ExceptionFactory_1 = require("./ExceptionFactory");
/**
 * シーンのアセットの読み込みと破棄を管理するクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
var AssetHolder = /** @class */ (function () {
    function AssetHolder(param) {
        var assetManager = param.assetManager;
        var assetIds = param.assetIds ? param.assetIds.concat() : [];
        assetIds.push.apply(assetIds, assetManager.resolvePatternsToAssetIds(param.assetPaths || []));
        this.waitingAssetsCount = assetIds.length;
        this.userData = param.userData;
        this._assetManager = assetManager;
        this._assetIds = assetIds;
        this._assets = [];
        this._handlerSet = param.handlerSet;
        this._requested = false;
    }
    AssetHolder.prototype.request = function () {
        if (this.waitingAssetsCount === 0)
            return false;
        if (this._requested)
            return true;
        this._requested = true;
        this._assetManager.requestAssets(this._assetIds, this);
        return true;
    };
    AssetHolder.prototype.destroy = function () {
        if (this._requested) {
            this._assetManager.unrefAssets(this._assets);
        }
        this.waitingAssetsCount = 0;
        this.userData = undefined;
        this._handlerSet = undefined;
        this._assetIds = undefined;
        this._requested = false;
    };
    AssetHolder.prototype.destroyed = function () {
        return !this._handlerSet;
    };
    /**
     * @private
     */
    AssetHolder.prototype._onAssetError = function (asset, error) {
        var hs = this._handlerSet;
        if (this.destroyed() || hs.owner.destroyed())
            return;
        var failureInfo = {
            asset: asset,
            error: error,
            cancelRetry: false
        };
        hs.handleLoadFailure.call(hs.owner, failureInfo);
        if (error.retriable && !failureInfo.cancelRetry) {
            this._assetManager.retryLoad(asset);
        }
        else {
            // game.json に定義されていればゲームを止める。それ以外 (DynamicAsset) では続行。
            if (this._assetManager.configuration[asset.id]) {
                hs.handleFinish.call(hs.owner, this, false);
            }
        }
    };
    /**
     * @private
     */
    AssetHolder.prototype._onAssetLoad = function (asset) {
        var hs = this._handlerSet;
        if (this.destroyed() || hs.owner.destroyed())
            return;
        hs.handleLoad.call(hs.owner, asset);
        this._assets.push(asset);
        --this.waitingAssetsCount;
        if (this.waitingAssetsCount > 0)
            return;
        if (this.waitingAssetsCount < 0)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetHolder#_onAssetLoad: broken waitingAssetsCount");
        hs.handleFinish.call(hs.owner, this, true);
    };
    return AssetHolder;
}());
exports.AssetHolder = AssetHolder;

},{"./ExceptionFactory":28}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetManager = void 0;
var EmptyBinaryAsset_1 = require("./auxiliary/EmptyBinaryAsset");
var EmptyGeneratedVectorImageAsset_1 = require("./auxiliary/EmptyGeneratedVectorImageAsset");
var EmptyVectorImageAsset_1 = require("./auxiliary/EmptyVectorImageAsset");
var PartialImageAsset_1 = require("./auxiliary/PartialImageAsset");
var ExceptionFactory_1 = require("./ExceptionFactory");
var VideoSystem_1 = require("./VideoSystem");
/**
 * @ignore
 */
var AssetLoadingInfo = /** @class */ (function () {
    function AssetLoadingInfo(asset, handler) {
        this.asset = asset;
        this.handlers = [handler];
        this.errorCount = 0;
        this.loading = false;
    }
    return AssetLoadingInfo;
}());
function normalizeAudioSystemConfMap(confMap) {
    if (confMap === void 0) { confMap = {}; }
    var systemDefaults = {
        music: {
            loop: true,
            hint: { streaming: true }
        },
        sound: {
            loop: false,
            hint: { streaming: false }
        }
    };
    for (var key in systemDefaults) {
        if (!(key in confMap)) {
            confMap[key] = systemDefaults[key];
        }
    }
    return confMap;
}
function normalizeCommonArea(area) {
    return Array.isArray(area) ? { x: area[0], y: area[1], width: area[2], height: area[3] } : area;
}
/**
 * パスパターンを関数に変換する。
 *
 * パスパターンは、パス文字列、または0個以上の `**`, `*`, `?` を含むパス文字列である。
 * (実装の単純化のため、いわゆる glob のうちよく使われそうなものだけをサポートしている。)
 * 詳細は `AssetAccessor#getAllImages()` の仕様を参照のこと。
 *
 * 戻り値は、文字列一つを受け取り、パターンにマッチするか否かを返す関数。
 *
 * @param pattern パターン文字列
 */
function patternToFilter(pattern) {
    var parserRe = /([^\*\\\?]*)(\\\*|\\\?|\?|\*(?!\*)|\*\*\/|$)/g;
    //                [----A-----][--------------B---------------]
    // A: パターンの特殊文字でない文字の塊。そのままマッチさせる(ためにエスケープして正規表現にする)
    // B: パターンの特殊文字一つ(*, ** など)かそのエスケープ。patternSpecialsTable で対応する正規表現に変換
    var patternSpecialsTable = {
        "": "",
        "\\*": "\\*",
        "\\?": "\\?",
        "*": "[^/]*",
        "?": "[^/]",
        "**/": "(?:^/)?(?:[^/]+/)*"
        //      [--C--][----D----]
        // C: 行頭の `/` (行頭でなければないので ? つき)
        // D: ディレクトリ一つ分(e.g. "foo/")が0回以上
    };
    var regExpSpecialsRe = /[\\^$.*+?()[\]{}|]/g;
    function escapeRegExp(s) {
        return s.replace(regExpSpecialsRe, "\\$&");
    }
    var code = "";
    for (var match = parserRe.exec(pattern); match && match[0] !== ""; match = parserRe.exec(pattern)) {
        code += escapeRegExp(match[1]) + patternSpecialsTable[match[2]];
    }
    var re = new RegExp("^" + code + "$");
    return function (path) { return re.test(path); };
}
/**
 * `Asset` を管理するクラス。
 *
 * このクラスのインスタンスは `Game` に一つデフォルトで存在する(デフォルトアセットマネージャ)。
 * デフォルトアセットマネージャは、game.json に記述された通常のアセットを読み込むために利用される。
 *
 * ゲーム開発者は、game.json に記述のないリソースを取得するために、このクラスのインスタンスを独自に生成してよい。
 */
var AssetManager = /** @class */ (function () {
    /**
     * `AssetManager` のインスタンスを生成する。
     *
     * @param gameParams このインスタンスが属するゲーム。
     * @param conf このアセットマネージャに与えるアセット定義。game.json の `"assets"` に相当。
     * @param audioSystemConfMap このアセットマネージャに与えるオーディオシステムの宣言。
     * @param moduleMainScripts このアセットマネージャに与える require() 解決用のエントリポイント。
     */
    function AssetManager(gameParams, conf, audioSystemConfMap, moduleMainScripts) {
        this._resourceFactory = gameParams.resourceFactory;
        this._audioSystemManager = gameParams.audio;
        this._defaultAudioSystemId = gameParams.defaultAudioSystemId;
        this._audioSystemConfMap = normalizeAudioSystemConfMap(audioSystemConfMap);
        this.configuration = this._normalize(conf || {});
        this._assets = {};
        this._virtualPathToIdTable = {};
        this._liveAssetVirtualPathTable = {};
        this._liveAssetPathTable = {};
        this._moduleMainScripts = moduleMainScripts ? moduleMainScripts : {};
        this._refCounts = {};
        this._loadings = {};
        this._generatedAssetCount = 0;
        var assetIds = Object.keys(this.configuration);
        for (var i = 0; i < assetIds.length; ++i) {
            var assetId = assetIds[i];
            var conf_1 = this.configuration[assetId];
            this._virtualPathToIdTable[conf_1.virtualPath] = assetId; // virtualPath の存在は _normalize() で確認済みのため 非 null アサーションとする
        }
    }
    /**
     * このインスタンスを破棄する。
     */
    AssetManager.prototype.destroy = function () {
        var assetIds = Object.keys(this._refCounts);
        for (var i = 0; i < assetIds.length; ++i) {
            this._releaseAsset(assetIds[i]);
        }
        this.configuration = undefined;
        this._assets = undefined;
        this._liveAssetVirtualPathTable = undefined;
        this._liveAssetPathTable = undefined;
        this._refCounts = undefined;
        this._loadings = undefined;
    };
    /**
     * このインスタンスが破棄済みであるかどうかを返す。
     */
    AssetManager.prototype.destroyed = function () {
        return this._assets === undefined;
    };
    /**
     * `Asset` の読み込みを再試行する。
     *
     * 引数 `asset` は読み込みの失敗が (`Scene#assetLoadFail` で) 通知されたアセットでなければならない。
     * @param asset 読み込みを再試行するアセット
     */
    AssetManager.prototype.retryLoad = function (asset) {
        if (!this._loadings.hasOwnProperty(asset.id))
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#retryLoad: invalid argument.");
        var loadingInfo = this._loadings[asset.id];
        if (loadingInfo.errorCount > AssetManager.MAX_ERROR_COUNT) {
            // DynamicAsset はエラーが規定回数超えた場合は例外にせず諦める。
            if (!this.configuration[asset.id])
                return;
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#retryLoad: too many retrying.");
        }
        if (!loadingInfo.loading) {
            loadingInfo.loading = true;
            asset._load(this);
        }
    };
    /**
     * グローバルアセットのIDを全て返す。
     */
    AssetManager.prototype.globalAssetIds = function () {
        var ret = [];
        var conf = this.configuration;
        for (var p in conf) {
            if (!conf.hasOwnProperty(p))
                continue;
            if (conf[p].global)
                ret.push(p);
        }
        return ret;
    };
    /**
     * プリロードすべきスクリプトアセットのIDを全て返す。
     */
    AssetManager.prototype.preloadScriptAssetIds = function () {
        return Object.entries(this.configuration)
            .filter(function (_a) {
            var conf = _a[1];
            return conf.type === "script" && conf.global && conf.preload;
        })
            .map(function (_a) {
            var assetId = _a[0];
            return assetId;
        });
    };
    /**
     * パターンまたはフィルタに合致するパスを持つアセットIDを全て返す。
     *
     * 戻り値は読み込み済みでないアセットのIDを含むことに注意。
     * 読み込み済みのアセットにアクセスする場合は、 `peekAllLiveAssetsByPattern()` を利用すること。
     *
     * @param patternOrFilters パターンまたはフィルタ。仕様は `AssetAccessor#getAllImages()` を参照
     */
    AssetManager.prototype.resolvePatternsToAssetIds = function (patternOrFilters) {
        if (patternOrFilters.length === 0)
            return [];
        var vpaths = Object.keys(this._virtualPathToIdTable);
        var ret = [];
        for (var i = 0; i < patternOrFilters.length; ++i) {
            var patternOrFilter = patternOrFilters[i];
            var filter = typeof patternOrFilter === "string" ? patternToFilter(this._replaceModulePathToAbsolute(patternOrFilter)) : patternOrFilter;
            for (var j = 0; j < vpaths.length; ++j) {
                var vpath = vpaths[j];
                var accessorPath = "/" + vpath; // virtualPath に "/" を足すと accessorPath という仕様
                if (filter(accessorPath))
                    ret.push(this._virtualPathToIdTable[vpath]);
            }
        }
        return ret;
    };
    /**
     * アセットの取得を要求する。
     *
     * 要求したアセットが読み込み済みでない場合、読み込みが行われる。
     * 取得した結果は `handler` を通して通知される。
     * ゲーム開発者はこのメソッドを呼び出してアセットを取得した場合、
     * 同じアセットID(または取得したアセット)で `unrefAsset()` を呼び出さなければならない。
     *
     * @param assetIdOrConf 要求するアセットのIDまたは設定
     * @param handler 要求結果を受け取るハンドラ
     */
    AssetManager.prototype.requestAsset = function (assetIdOrConf, handler) {
        var assetId;
        if (typeof assetIdOrConf === "string") {
            assetId = assetIdOrConf;
        }
        else if ("uri" in assetIdOrConf) {
            assetId = assetIdOrConf.id;
            assetIdOrConf = this._normalizeAssetBaseDeclaration(assetId, Object.create(assetIdOrConf));
        }
        else {
            // TODO: ノーマライズ処理を _normalizeAssetBaseDeclaration() に統合すべき
            assetId = assetIdOrConf.id;
        }
        var waiting = false;
        var loadingInfo;
        if (this._assets.hasOwnProperty(assetId)) {
            ++this._refCounts[assetId];
            handler._onAssetLoad(this._assets[assetId]);
        }
        else if (this._loadings.hasOwnProperty(assetId)) {
            loadingInfo = this._loadings[assetId];
            loadingInfo.handlers.push(handler);
            ++this._refCounts[assetId];
            waiting = true;
        }
        else {
            var system = this._getAudioSystem(assetIdOrConf);
            var audioAsset = system === null || system === void 0 ? void 0 : system.getDestroyRequestedAsset(assetId);
            if (system && audioAsset) {
                system.cancelRequestDestroy(audioAsset);
                this._addAssetToTables(audioAsset);
                this._refCounts[assetId] = 1;
                handler._onAssetLoad(audioAsset);
            }
            else {
                var a = this._createAssetFor(assetIdOrConf);
                loadingInfo = new AssetLoadingInfo(a, handler);
                this._loadings[assetId] = loadingInfo;
                this._refCounts[assetId] = 1;
                waiting = true;
                loadingInfo.loading = true;
                a._load(this);
            }
        }
        return waiting;
    };
    /**
     * アセットの参照カウントを減らす。
     * 引数の各要素で `unrefAsset()` を呼び出す。
     *
     * @param assetOrId 参照カウントを減らすアセットまたはアセットID
     */
    AssetManager.prototype.unrefAsset = function (assetOrId) {
        var assetId = typeof assetOrId === "string" ? assetOrId : assetOrId.id;
        if (--this._refCounts[assetId] > 0)
            return;
        this._releaseAsset(assetId);
    };
    /**
     * 複数のアセットの取得を要求する。
     * 引数の各要素で `requestAsset()` を呼び出す。
     *
     * @param assetIdOrConfs 取得するアセットのIDまたはアセット定義
     * @param handler 取得の結果を受け取るハンドラ
     */
    AssetManager.prototype.requestAssets = function (assetIdOrConfs, handler) {
        var waitingCount = 0;
        for (var i = 0, len = assetIdOrConfs.length; i < len; ++i) {
            if (this.requestAsset(assetIdOrConfs[i], handler)) {
                ++waitingCount;
            }
        }
        return waitingCount;
    };
    /**
     * 複数のアセットを解放する。
     * 引数の各要素で `unrefAsset()` を呼び出す。
     *
     * @param assetOrIds 参照カウントを減らすアセットまたはアセットID
     * @private
     */
    AssetManager.prototype.unrefAssets = function (assetOrIds) {
        for (var i = 0, len = assetOrIds.length; i < len; ++i) {
            this.unrefAsset(assetOrIds[i]);
        }
    };
    /**
     * アクセッサパスで指定された読み込み済みのアセットを返す。
     *
     * ここでアクセッサパスとは、 `AssetAccessor` が使うパス
     * (game.jsonのディレクトリをルート (`/`) とする、 `/` 区切りの絶対パス形式の仮想パス)である。
     * これは `/` を除けばアセットの仮想パス (virtualPath) と同一である。
     *
     * @param accessorPath 取得するアセットのアクセッサパス
     * @param type 取得するアセットのタイプ。対象のアセットと合致しない場合、エラー
     */
    AssetManager.prototype.peekLiveAssetByAccessorPath = function (accessorPath, type) {
        accessorPath = this._replaceModulePathToAbsolute(accessorPath);
        if (accessorPath[0] !== "/")
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#peekLiveAssetByAccessorPath(): accessorPath must start with '/'");
        var vpath = accessorPath.slice(1); // accessorPath から "/" を削ると virtualPath という仕様
        var asset = this._liveAssetVirtualPathTable[vpath];
        if (!asset || type !== asset.type)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#peekLiveAssetByAccessorPath(): No ".concat(type, " asset for ").concat(accessorPath));
        return asset; // asset.typeを直前で確認しているので確実にTになるが、型推論できないのでキャストする
    };
    /**
     * アセットIDで指定された読み込み済みのアセットを返す。
     *
     * @param assetId 取得するアセットのID
     * @param type 取得するアセットのタイプ。対象のアセットと合致しない場合、エラー
     */
    AssetManager.prototype.peekLiveAssetById = function (assetId, type) {
        var asset = this._assets[assetId];
        if (!asset || type !== asset.type)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#peekLiveAssetById(): No ".concat(type, " asset for id ").concat(assetId));
        return asset; // asset.typeを直前で確認しているので確実にTになるが、型推論できないのでキャストする
    };
    /**
     * パターンまたはフィルタにマッチするパスを持つ、指定されたタイプの全読み込み済みアセットを返す。
     *
     * 戻り値の要素の順序は保証されない。
     * パターンとフィルタについては `AssetAccessor#getAllImages()` の仕様を参照のこと。
     *
     * @param patternOrFilter 取得するアセットのパスパターンまたはフィルタ
     * @param type 取得するアセットのタイプ。 null の場合、全てのタイプとして扱われる。
     */
    AssetManager.prototype.peekAllLiveAssetsByPattern = function (patternOrFilter, type) {
        var vpaths = Object.keys(this._liveAssetVirtualPathTable);
        var filter = typeof patternOrFilter === "string" ? patternToFilter(this._replaceModulePathToAbsolute(patternOrFilter)) : patternOrFilter;
        var ret = [];
        for (var i = 0; i < vpaths.length; ++i) {
            var vpath = vpaths[i];
            var asset = this._liveAssetVirtualPathTable[vpath];
            if (type && asset.type !== type)
                continue;
            var accessorPath = "/" + vpath; // virtualPath に "/" を足すと accessorPath という仕様
            // typeがT["type"]であればasset.typeを直前で確認しているので確実にTになるが、typeがnullの時にassetがTではない可能性がある
            if (filter(accessorPath))
                ret.push(asset);
        }
        return ret;
    };
    /**
     * @ignore
     */
    AssetManager.prototype._normalize = function (configuration) {
        var ret = {};
        if (!(configuration instanceof Object))
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_normalize: invalid arguments.");
        for (var p in configuration) {
            if (!configuration.hasOwnProperty(p))
                continue;
            var conf = this._normalizeAssetBaseDeclaration(p, Object.create(configuration[p]));
            if (!conf.path) {
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_normalize: No path given for: " + p);
            }
            if (!conf.virtualPath) {
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_normalize: No virtualPath given for: " + p);
            }
            if (!conf.global)
                conf.global = false;
            ret[p] = conf;
        }
        return ret;
    };
    /**
     * @private
     */
    AssetManager.prototype._normalizeAssetBaseDeclaration = function (assetId, conf) {
        if (!conf.type) {
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_normalize: No type given for: " + assetId);
        }
        if (conf.type === "image") {
            if (typeof conf.width !== "number")
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong width given for the image asset: " + assetId);
            if (typeof conf.height !== "number")
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong height given for the image asset: " + assetId);
            conf.slice = conf.slice ? normalizeCommonArea(conf.slice) : undefined;
        }
        if (conf.type === "audio") {
            // durationというメンバは後から追加したため、古いgame.jsonではundefinedになる場合がある
            if (conf.duration === undefined)
                conf.duration = 0;
            var audioSystemConf = this._audioSystemConfMap[conf.systemId];
            if (conf.loop === undefined) {
                conf.loop = !!audioSystemConf && !!audioSystemConf.loop;
            }
            if (conf.hint === undefined) {
                conf.hint = audioSystemConf ? audioSystemConf.hint : {};
            }
            if (conf.systemId !== "music" && conf.systemId !== "sound") {
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong systemId given for the audio asset: " + assetId);
            }
        }
        if (conf.type === "video") {
            if (!conf.useRealSize) {
                if (typeof conf.width !== "number")
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong width given for the video asset: " + assetId);
                if (typeof conf.height !== "number")
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong height given for the video asset: " + assetId);
                conf.useRealSize = false;
            }
        }
        if (conf.type === "vector-image") {
            if (typeof conf.width !== "number")
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong width given for the vector-image asset: " + assetId);
            if (typeof conf.height !== "number")
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_normalize: wrong height given for the vector-image asset: " + assetId);
        }
        return conf;
    };
    /**
     * @private
     */
    AssetManager.prototype._createAssetFor = function (idOrConf) {
        var _a;
        var id;
        var uri;
        var conf;
        if (typeof idOrConf === "string") {
            id = idOrConf;
            conf = this.configuration[id];
            uri = this.configuration[id].path;
        }
        else if ("uri" in idOrConf) {
            id = idOrConf.id;
            conf = idOrConf;
            uri = idOrConf.uri;
        }
        else {
            return this._createGeneratedAssetFor(idOrConf);
        }
        var resourceFactory = this._resourceFactory;
        if (!conf)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_createAssetFor: unknown asset ID: " + id);
        var type = conf.type;
        switch (type) {
            case "image":
                // _normalize() で conf.slice を CommonArea | undefined にしているので本来は不要な分岐だが、型の担保のためにチェックを行う
                if (Array.isArray(conf.slice)) {
                    throw new Error("AssetManager#_createAssetFor: array type of configuration.slice is not yet supported");
                }
                var asset = conf.slice
                    ? new PartialImageAsset_1.PartialImageAsset(resourceFactory, id, uri, conf.width, conf.height, conf.slice)
                    : resourceFactory.createImageAsset(id, uri, conf.width, conf.height);
                asset.initialize(conf.hint);
                return asset;
            case "audio":
                var system = conf.systemId
                    ? this._audioSystemManager[conf.systemId]
                    : this._audioSystemManager[this._defaultAudioSystemId];
                return resourceFactory.createAudioAsset(id, uri, conf.duration, system, !!conf.loop, (_a = conf.hint) !== null && _a !== void 0 ? _a : {}, conf.offset);
            case "text":
                return resourceFactory.createTextAsset(id, uri);
            case "script":
                return resourceFactory.createScriptAsset(id, uri, conf.exports);
            case "video":
                // VideoSystemはまだ中身が定義されていなが、将来のためにVideoAssetにVideoSystemを渡すという体裁だけが整えられている。
                // 以上を踏まえ、ここでは簡単のために都度新たなVideoSystemインスタンスを生成している。
                var videoSystem = new VideoSystem_1.VideoSystem();
                return resourceFactory.createVideoAsset(id, uri, conf.width, conf.height, videoSystem, !!conf.loop, !!conf.useRealSize);
            case "vector-image":
                if (!resourceFactory.createVectorImageAsset) {
                    return new EmptyVectorImageAsset_1.EmptyVectorImageAsset(id, uri, conf.width, conf.height, conf.hint);
                }
                return resourceFactory.createVectorImageAsset(id, uri, conf.width, conf.height, conf.hint);
            case "binary":
                if (!resourceFactory.createBinaryAsset) {
                    return new EmptyBinaryAsset_1.EmptyBinaryAsset(id, uri);
                }
                return resourceFactory.createBinaryAsset(id, uri);
            default:
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssertionError#_createAssetFor: unknown asset type " + type + " for asset ID: " + id);
        }
    };
    /**
     * @private
     */
    AssetManager.prototype._createGeneratedAssetFor = function (conf) {
        var resourceFactory = this._resourceFactory;
        var path = "%akashic%/generated-asset-".concat(this._generatedAssetCount++);
        switch (conf.type) {
            case "vector-image":
                if (!resourceFactory.createVectorImageAssetFromString) {
                    return new EmptyGeneratedVectorImageAsset_1.EmptyGeneratedVectorImageAsset(conf.id, path, conf.data);
                }
                return resourceFactory.createVectorImageAssetFromString(conf.id, path, conf.data);
            default:
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssertionError#_createFromAssetGenerationFor: unsupported asset type ".concat(conf.type, " for asset ID: ").concat(conf.id));
        }
    };
    /**
     * @ignore
     */
    AssetManager.prototype._releaseAsset = function (assetId) {
        var asset = this._assets[assetId] || (this._loadings[assetId] && this._loadings[assetId].asset);
        var path = null;
        if (asset) {
            path = asset.path;
            if (asset.inUse()) {
                if (asset.type === "audio") {
                    asset._system.requestDestroy(asset);
                }
                else if (asset.type === "video") {
                    // NOTE: 一旦再生完了を待たずに破棄することにする
                    // TODO: 再生中の動画を破棄するタイミングをどのように扱うか検討し実装
                    asset.destroy();
                }
                else {
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#unrefAssets: Unsupported in-use " + asset.id);
                }
            }
            else {
                asset.destroy();
            }
        }
        delete this._refCounts[assetId];
        delete this._loadings[assetId];
        delete this._assets[assetId];
        if (this.configuration[assetId]) {
            var virtualPath = this.configuration[assetId].virtualPath;
            if (virtualPath && this._liveAssetVirtualPathTable.hasOwnProperty(virtualPath))
                delete this._liveAssetVirtualPathTable[virtualPath];
            if (path && this._liveAssetPathTable.hasOwnProperty(path))
                delete this._liveAssetPathTable[path];
        }
    };
    /**
     * 現在ロード中のアセットの数。(デバッグ用; 直接の用途はない)
     * @private
     */
    AssetManager.prototype._countLoadingAsset = function () {
        return Object.keys(this._loadings).length;
    };
    /**
     * @private
     */
    AssetManager.prototype._onAssetError = function (asset, error) {
        // ロード中に Scene が破棄されていた場合などで、asset が破棄済みになることがある
        if (this.destroyed() || asset.destroyed())
            return;
        var loadingInfo = this._loadings[asset.id];
        var hs = loadingInfo.handlers;
        loadingInfo.loading = false;
        ++loadingInfo.errorCount;
        if (loadingInfo.errorCount > AssetManager.MAX_ERROR_COUNT && error.retriable) {
            error = ExceptionFactory_1.ExceptionFactory.createAssetLoadError("Retry limit exceeded", false, null, error);
        }
        if (!error.retriable)
            delete this._loadings[asset.id];
        for (var i = 0; i < hs.length; ++i)
            hs[i]._onAssetError(asset, error, this.retryLoad.bind(this));
    };
    /**
     * @private
     */
    AssetManager.prototype._onAssetLoad = function (asset) {
        // ロード中に Scene が破棄されていた場合などで、asset が破棄済みになることがある
        if (this.destroyed() || asset.destroyed())
            return;
        var loadingInfo = this._loadings[asset.id];
        loadingInfo.loading = false;
        delete this._loadings[asset.id];
        this._addAssetToTables(asset);
        var hs = loadingInfo.handlers;
        for (var i = 0; i < hs.length; ++i)
            hs[i]._onAssetLoad(asset);
    };
    /**
     * @private
     */
    AssetManager.prototype._replaceModulePathToAbsolute = function (accessorPath) {
        if (accessorPath[0] === "/" ||
            accessorPath[0] === "*" // パスに `**/*` が指定された場合
        ) {
            return accessorPath;
        }
        for (var moduleName in this._moduleMainScripts) {
            if (!this._moduleMainScripts.hasOwnProperty(moduleName))
                continue;
            if (accessorPath.lastIndexOf(moduleName, 0) === 0) {
                return "/node_modules/" + accessorPath;
            }
        }
        return accessorPath;
    };
    /**
     * @private
     */
    AssetManager.prototype._getAudioSystem = function (assetIdOrConf) {
        var conf = null;
        if (typeof assetIdOrConf === "string") {
            conf = this.configuration[assetIdOrConf];
        }
        else if ("uri" in assetIdOrConf) {
            var dynConf = assetIdOrConf;
            conf = dynConf;
        }
        else {
            // NOTE: AssetGeneration では一旦非サポート。
        }
        if (!conf) {
            return null;
        }
        if (conf.type !== "audio") {
            return null;
        }
        return conf.systemId ? this._audioSystemManager[conf.systemId] : this._audioSystemManager[this._defaultAudioSystemId];
    };
    /**
     * @private
     */
    AssetManager.prototype._addAssetToTables = function (asset) {
        this._assets[asset.id] = asset;
        // DynamicAsset の場合は configuration に書かれていないので以下の判定が偽になる
        if (this.configuration[asset.id]) {
            var virtualPath = this.configuration[asset.id].virtualPath; // virtualPath の存在は _normalize() で確認済みのため 非 null アサーションとする
            if (!this._liveAssetVirtualPathTable.hasOwnProperty(virtualPath)) {
                this._liveAssetVirtualPathTable[virtualPath] = asset;
            }
            else {
                if (this._liveAssetVirtualPathTable[virtualPath].path !== asset.path)
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AssetManager#_onAssetLoad(): duplicated asset path");
            }
            if (!this._liveAssetPathTable.hasOwnProperty(asset.path))
                this._liveAssetPathTable[asset.path] = virtualPath;
        }
    };
    AssetManager.MAX_ERROR_COUNT = 3;
    return AssetManager;
}());
exports.AssetManager = AssetManager;

},{"./ExceptionFactory":28,"./VideoSystem":70,"./auxiliary/EmptyBinaryAsset":74,"./auxiliary/EmptyGeneratedVectorImageAsset":75,"./auxiliary/EmptyVectorImageAsset":76,"./auxiliary/PartialImageAsset":77}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPlayContext = void 0;
var trigger_1 = require("@akashic/trigger");
var AudioPlayContext = /** @class */ (function () {
    function AudioPlayContext(param) {
        var _a;
        /**
         * `play()` が呼び出された時に通知される `Trigger` 。
         */
        this.onPlay = new trigger_1.Trigger();
        /**
         * `stop()` が呼び出された時に通知される `Trigger` 。
         */
        this.onStop = new trigger_1.Trigger();
        this.asset = param.asset;
        this._system = param.system;
        this._resourceFactory = param.resourceFactory;
        this._volume = (_a = param.volume) !== null && _a !== void 0 ? _a : 1.0;
        this._id = param.id;
        this._systemId = param.systemId;
        this._player = this._createAudioPlayer();
        this.asset.onDestroyed.addOnce(this.stop, this);
    }
    Object.defineProperty(AudioPlayContext.prototype, "volume", {
        get: function () {
            return this._volume;
        },
        enumerable: false,
        configurable: true
    });
    AudioPlayContext.prototype.play = function () {
        this._player.play(this.asset);
    };
    AudioPlayContext.prototype.stop = function () {
        this._player.stop();
    };
    AudioPlayContext.prototype.changeVolume = function (vol) {
        this._volume = vol;
        this._player.changeVolume(vol);
    };
    /**
     * @private
     */
    AudioPlayContext.prototype._startSuppress = function () {
        if (this._systemId === "music") {
            this._player.changeVolume(0);
            return;
        }
        this.stop();
    };
    /**
     * @private
     */
    AudioPlayContext.prototype._endSuppress = function () {
        if (this._systemId === "music") {
            this._player.changeVolume(this._volume);
            return;
        }
    };
    AudioPlayContext.prototype._createAudioPlayer = function () {
        var audioPlayer = this._resourceFactory.createAudioPlayer(this._system);
        audioPlayer.changeVolume(this._volume);
        audioPlayer.onPlay.add(this.onPlay.fire, this.onPlay);
        audioPlayer.onStop.add(this.onStop.fire, this.onStop);
        return audioPlayer;
    };
    return AudioPlayContext;
}());
exports.AudioPlayContext = AudioPlayContext;

},{"@akashic/trigger":213}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundAudioSystem = exports.MusicAudioSystem = exports.AudioSystem = void 0;
var AudioPlayContext_1 = require("./AudioPlayContext");
var ExceptionFactory_1 = require("./ExceptionFactory");
var WeakRefKVS_1 = require("./WeakRefKVS");
var AudioSystem = /** @class */ (function () {
    function AudioSystem(param) {
        this.id = param.id;
        this._volume = param.volume || 1;
        this._destroyRequestedAssets = {};
        this._explicitMuted = param.muted || false;
        this._suppressed = false;
        this._muted = false;
        this._contextMap = new WeakRefKVS_1.WeakRefKVS();
        this._contextCount = 0;
        this._resourceFactory = param.resourceFactory;
        this._updateMuted();
    }
    Object.defineProperty(AudioSystem.prototype, "volume", {
        // volumeの変更時には通知が必要なのでアクセサを使う。
        // 呼び出し頻度が少ないため許容。
        get: function () {
            return this._volume;
        },
        set: function (value) {
            if (value < 0 || value > 1 || isNaN(value) || typeof value !== "number")
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AudioSystem#volume: expected: 0.0-1.0, actual: " + value);
            this._volume = value;
            this._onVolumeChanged();
        },
        enumerable: false,
        configurable: true
    });
    AudioSystem.prototype.play = function (asset) {
        var context = this.create(asset);
        context.play();
        return context;
    };
    AudioSystem.prototype.create = function (asset) {
        // TODO: 依存関係の見直し
        var context = new AudioPlayContext_1.AudioPlayContext({
            id: this._generateAudioPlayContextId(),
            resourceFactory: this._resourceFactory,
            asset: asset,
            system: this,
            systemId: this.id,
            volume: 1.0
        });
        if (this._contextCount % this._contentMapCleaningFrequency === 0) {
            this._contextMap.clean();
        }
        this._contextMap.set(context._id, context);
        return context;
    };
    AudioSystem.prototype.stopAll = function () {
        for (var _i = 0, _a = this._contextMap.keys(); _i < _a.length; _i++) {
            var key = _a[_i];
            var ctx = this._contextMap.get(key);
            ctx === null || ctx === void 0 ? void 0 : ctx.stop();
        }
        this._contextMap.clean();
    };
    AudioSystem.prototype.requestDestroy = function (asset) {
        this._destroyRequestedAssets[asset.id] = asset;
    };
    /**
     * `this.requestDestroy()` により破棄要求されているアセットの破棄を取り消す。
     * @param asset アセット。
     */
    // NOTE: akashic-engine の独自仕様
    AudioSystem.prototype.cancelRequestDestroy = function (asset) {
        delete this._destroyRequestedAssets[asset.id];
    };
    /**
     * `this.requestDestroy()` により破棄要求されていて、まだ実際には破棄されていないアセット。
     * 対象のアセットが破棄要求されていなければ `null` を返す。
     * @param assetId アセットID。
     */
    // NOTE: akashic-engine の独自仕様
    AudioSystem.prototype.getDestroyRequestedAsset = function (assetId) {
        if (this._destroyRequestedAssets.hasOwnProperty(assetId)) {
            return this._destroyRequestedAssets[assetId];
        }
        return null;
    };
    /**
     * @private
     */
    AudioSystem.prototype._reset = function () {
        this.stopAll();
        this._volume = 1;
        this._destroyRequestedAssets = {};
        this._muted = false;
        this._suppressed = false;
        this._explicitMuted = false;
    };
    /**
     * @private
     */
    AudioSystem.prototype._setMuted = function (value) {
        var before = this._explicitMuted;
        this._explicitMuted = !!value;
        if (this._explicitMuted !== before) {
            this._updateMuted();
            this._onMutedChanged();
        }
    };
    /**
     * @private
     */
    AudioSystem.prototype._setPlaybackRate = function (value) {
        if (value < 0 || isNaN(value) || typeof value !== "number")
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AudioSystem#playbackRate: expected: greater or equal to 0.0, actual: " + value);
        this._suppressed = value !== 1.0;
        this._updateMuted();
        this._onPlaybackRateChanged();
    };
    /**
     * @private
     */
    AudioSystem.prototype._updateMuted = function () {
        this._muted = this._explicitMuted || this._suppressed;
    };
    /**
     * @private
     */
    AudioSystem.prototype._generateAudioPlayContextId = function () {
        return "".concat(this.id, "-").concat(this._contextCount++);
    };
    /**
     * @private
     */
    AudioSystem.prototype._startSuppress = function () {
        // NOTE: 既存の AudioSystem は playbackRate に 1.0 以外を指定するとミュートとなる
        this._setPlaybackRate(100);
        for (var _i = 0, _a = this._contextMap.keys(); _i < _a.length; _i++) {
            var key = _a[_i];
            var ctx = this._contextMap.get(key);
            ctx === null || ctx === void 0 ? void 0 : ctx._startSuppress();
        }
    };
    /**
     * @private
     */
    AudioSystem.prototype._endSuppress = function () {
        // NOTE: 既存の AudioSystem は playbackRate に 1.0 を指定するとミュートが解除される
        this._setPlaybackRate(1.0);
        for (var _i = 0, _a = this._contextMap.keys(); _i < _a.length; _i++) {
            var key = _a[_i];
            var ctx = this._contextMap.get(key);
            ctx === null || ctx === void 0 ? void 0 : ctx._endSuppress();
        }
    };
    return AudioSystem;
}());
exports.AudioSystem = AudioSystem;
var MusicAudioSystem = /** @class */ (function (_super) {
    __extends(MusicAudioSystem, _super);
    function MusicAudioSystem(param) {
        var _this = _super.call(this, param) || this;
        /**
         * @private
         */
        _this._contentMapCleaningFrequency = 5;
        _this._player = undefined;
        return _this;
    }
    Object.defineProperty(MusicAudioSystem.prototype, "player", {
        // Note: 音楽のないゲームの場合に無駄なインスタンスを作るのを避けるため、アクセサを使う
        get: function () {
            if (!this._player) {
                this._player = this._resourceFactory.createAudioPlayer(this);
                this._player.onPlay.add(this._handlePlay, this);
                this._player.onStop.add(this._handleStop, this);
            }
            return this._player;
        },
        set: function (v) {
            this._player = v;
        },
        enumerable: false,
        configurable: true
    });
    MusicAudioSystem.prototype.findPlayers = function (asset) {
        if (this.player.currentAudio && this.player.currentAudio.id === asset.id)
            return [this.player];
        return [];
    };
    MusicAudioSystem.prototype.createPlayer = function () {
        return this.player;
    };
    MusicAudioSystem.prototype.stopAll = function () {
        _super.prototype.stopAll.call(this);
        if (!this._player)
            return;
        this._player.stop();
    };
    /**
     * @private
     */
    MusicAudioSystem.prototype._reset = function () {
        _super.prototype._reset.call(this);
        if (this._player) {
            this._player.onPlay.remove(this._handlePlay, this);
            this._player.onStop.remove(this._handleStop, this);
        }
        this._player = undefined;
    };
    /**
     * @private
     */
    MusicAudioSystem.prototype._onVolumeChanged = function () {
        this.player._notifyVolumeChanged();
    };
    /**
     * @private
     */
    MusicAudioSystem.prototype._onMutedChanged = function () {
        this.player._changeMuted(this._muted);
    };
    /**
     * @private
     */
    MusicAudioSystem.prototype._onPlaybackRateChanged = function () {
        this.player._changeMuted(this._muted);
    };
    /**
     * @private
     */
    MusicAudioSystem.prototype._handlePlay = function (e) {
        if (e.player !== this._player)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("MusicAudioSystem#_onPlayerPlayed: unexpected audio player");
    };
    /**
     * @private
     */
    MusicAudioSystem.prototype._handleStop = function (e) {
        if (this._destroyRequestedAssets[e.audio.id]) {
            delete this._destroyRequestedAssets[e.audio.id];
            e.audio.destroy();
        }
    };
    return MusicAudioSystem;
}(AudioSystem));
exports.MusicAudioSystem = MusicAudioSystem;
var SoundAudioSystem = /** @class */ (function (_super) {
    __extends(SoundAudioSystem, _super);
    function SoundAudioSystem(param) {
        var _this = _super.call(this, param) || this;
        /**
         * @private
         */
        _this._contentMapCleaningFrequency = 50;
        _this.players = [];
        return _this;
    }
    SoundAudioSystem.prototype.createPlayer = function () {
        var player = this._resourceFactory.createAudioPlayer(this);
        if (player.canHandleStopped())
            this.players.push(player);
        player.onPlay.add(this._handlePlay, this);
        player.onStop.add(this._handleStop, this);
        return player;
    };
    SoundAudioSystem.prototype.findPlayers = function (asset) {
        var ret = [];
        for (var i = 0; i < this.players.length; ++i) {
            var currentAudio = this.players[i].currentAudio;
            if (currentAudio && currentAudio.id === asset.id)
                ret.push(this.players[i]);
        }
        return ret;
    };
    SoundAudioSystem.prototype.stopAll = function () {
        _super.prototype.stopAll.call(this);
        var players = this.players.concat();
        for (var i = 0; i < players.length; ++i) {
            players[i].stop(); // auto remove
        }
    };
    /**
     * @private
     */
    SoundAudioSystem.prototype._reset = function () {
        _super.prototype._reset.call(this);
        for (var i = 0; i < this.players.length; ++i) {
            var player = this.players[i];
            player.onPlay.remove(this._handlePlay, this);
            player.onStop.remove(this._handleStop, this);
        }
        this.players = [];
    };
    /**
     * @private
     */
    SoundAudioSystem.prototype._onMutedChanged = function () {
        var players = this.players;
        for (var i = 0; i < players.length; ++i) {
            players[i]._changeMuted(this._muted);
        }
    };
    /**
     * @private
     */
    SoundAudioSystem.prototype._onPlaybackRateChanged = function () {
        var players = this.players;
        if (this._suppressed) {
            for (var i = 0; i < players.length; ++i) {
                players[i]._changeMuted(true);
            }
        }
    };
    /**
     * @private
     */
    SoundAudioSystem.prototype._handlePlay = function (_e) {
        // do nothing
    };
    /**
     * @private
     */
    SoundAudioSystem.prototype._handleStop = function (e) {
        var index = this.players.indexOf(e.player);
        if (index < 0)
            return;
        e.player.onStop.remove(this._handleStop, this);
        this.players.splice(index, 1);
        if (this._destroyRequestedAssets[e.audio.id]) {
            delete this._destroyRequestedAssets[e.audio.id];
            e.audio.destroy();
        }
    };
    /**
     * @private
     */
    SoundAudioSystem.prototype._onVolumeChanged = function () {
        for (var i = 0; i < this.players.length; ++i) {
            this.players[i]._notifyVolumeChanged();
        }
    };
    return SoundAudioSystem;
}(AudioSystem));
exports.SoundAudioSystem = SoundAudioSystem;

},{"./AudioPlayContext":9,"./ExceptionFactory":28,"./WeakRefKVS":71}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioSystemManager = void 0;
var AudioSystem_1 = require("./AudioSystem");
var ExceptionFactory_1 = require("./ExceptionFactory");
/**
 * `AudioSystem` の管理クラス。
 *
 * 複数の `AudioSystem` に一括で必要な状態設定を行う。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
var AudioSystemManager = /** @class */ (function () {
    function AudioSystemManager(resourceFactory) {
        /**
         * @private
         */
        this._muted = false;
        this._resourceFactory = resourceFactory;
        this.music = new AudioSystem_1.MusicAudioSystem({
            id: "music",
            muted: this._muted,
            resourceFactory: resourceFactory
        });
        this.sound = new AudioSystem_1.SoundAudioSystem({
            id: "sound",
            muted: this._muted,
            resourceFactory: resourceFactory
        });
    }
    /**
     * 対象の音声アセットの AudioPlayContext を生成する。
     *
     * @param asset 音声アセット
     */
    AudioSystemManager.prototype.create = function (asset) {
        if (asset._system.id === "music") {
            return this.music.create(asset);
        }
        else if (asset._system.id === "sound") {
            return this.sound.create(asset);
        }
        else {
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AudioSystemManager#create(): unknown systemId \"".concat(asset._system.id, "\" for asset ID \"").concat(asset.id, "\""));
        }
    };
    /**
     * 対象の音声アセットの AudioPlayContext を生成し、再生する。
     *
     * @param asset 音声アセット
     */
    AudioSystemManager.prototype.play = function (asset) {
        if (asset._system.id === "music") {
            return this.music.play(asset);
        }
        else if (asset._system.id === "sound") {
            return this.sound.play(asset);
        }
        else {
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("AudioSystemManager#play(): unknown systemId \"".concat(asset._system.id, "\" for asset ID \"").concat(asset.id, "\""));
        }
    };
    /**
     * @private
     */
    AudioSystemManager.prototype._reset = function () {
        this._muted = false;
        this.music._reset();
        this.sound._reset();
    };
    /**
     * @private
     */
    AudioSystemManager.prototype._setMuted = function (muted) {
        if (this._muted === muted)
            return;
        this._muted = muted;
        this.music._setMuted(muted);
        this.sound._setMuted(muted);
    };
    /**
     * @private
     */
    AudioSystemManager.prototype._setPlaybackRate = function (rate) {
        this.music._setPlaybackRate(rate);
        this.sound._setPlaybackRate(rate);
    };
    AudioSystemManager.prototype._startSuppress = function () {
        this.music._startSuppress();
        this.sound._startSuppress();
    };
    AudioSystemManager.prototype._endSuppress = function () {
        this.music._endSuppress();
        this.sound._endSuppress();
    };
    AudioSystemManager.prototype.stopAll = function () {
        this.music.stopAll();
        this.sound.stopAll();
    };
    return AudioSystemManager;
}());
exports.AudioSystemManager = AudioSystemManager;

},{"./AudioSystem":10,"./ExceptionFactory":28}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioUtil = void 0;
var Util_1 = require("./Util");
/**
 * linear のイージング関数。
 */
var linear = function (t, b, c, d) { return (c * t) / d + b; };
/**
 * Audio に関連するユーティリティ。
 */
var AudioUtil;
(function (AudioUtil) {
    /**
     * 音声をフェードインさせる。
     *
     * @param game 対象の `Game`。
     * @param context 対象の `AudioPlayContext` 。
     * @param duration フェードインの長さ (ms)。
     * @param to フェードイン後の音量。0 未満または 1 より大きい値を指定した場合の挙動は不定である。省略時は `1` 。
     * @param easing イージング関数。省略時は linear 。
     */
    function fadeIn(game, context, duration, to, easing) {
        if (to === void 0) { to = 1; }
        if (easing === void 0) { easing = linear; }
        context.changeVolume(0);
        context.play();
        var _a = transitionVolume(game, context, duration, to, easing), complete = _a.complete, cancel = _a.cancel;
        return {
            complete: function () {
                complete();
            },
            cancel: function (revert) {
                if (revert === void 0) { revert = false; }
                cancel(revert);
                if (revert) {
                    context.stop();
                }
            }
        };
    }
    AudioUtil.fadeIn = fadeIn;
    /**
     * 音声をフェードアウトさせる。
     *
     * @param game 対象の `Game`。
     * @param context 対象の `AudioPlayContext` 。
     * @param duration フェードアウトの長さ (ms)。
     * @param easing イージング関数。省略時は linear が指定される。
     */
    function fadeOut(game, context, duration, easing) {
        if (easing === void 0) { easing = linear; }
        var _a = transitionVolume(game, context, duration, 0, easing), complete = _a.complete, cancel = _a.cancel;
        return {
            complete: function () {
                complete();
                context.stop();
            },
            cancel: function (revert) {
                if (revert === void 0) { revert = false; }
                cancel(revert);
            }
        };
    }
    AudioUtil.fadeOut = fadeOut;
    /**
     * 二つの音声をクロスフェードさせる。
     *
     * @param game 対象の `Game`。
     * @param fadeInContext フェードイン対象の `AudioPlayContext` 。
     * @param fadeOutContext フェードアウト対象の `AudioPlayContext` 。
     * @param duration クロスフェードの長さ (ms)。
     * @param to クロスフェード後の音量。0 未満または 1 より大きい値を指定した場合の挙動は不定。省略時は `1` 。
     * @param easing イージング関数。フェードインとフェードアウトで共通であることに注意。省略時は linear が指定される。
     */
    function crossFade(game, fadeInContext, fadeOutContext, duration, to, easing) {
        if (to === void 0) { to = 1; }
        if (easing === void 0) { easing = linear; }
        var fadeInFuncs = fadeIn(game, fadeInContext, duration, to, easing);
        var fadeOutFuncs = fadeOut(game, fadeOutContext, duration, easing);
        return {
            complete: function () {
                fadeInFuncs.complete();
                fadeOutFuncs.complete();
            },
            cancel: function (revert) {
                if (revert === void 0) { revert = false; }
                fadeInFuncs.cancel(revert);
                fadeOutFuncs.cancel(revert);
            }
        };
    }
    AudioUtil.crossFade = crossFade;
    /**
     * 音量を指定のイージングで遷移させる。
     *
     * @param game 対象の `Game`。
     * @param context 対象の `AudioPlayContext` 。
     * @param duration 遷移の長さ (ms)。
     * @param to 遷移後の音量。0 未満または 1 より大きい値を指定した場合の挙動は不定。
     * @param easing イージング関数。省略時は linear が指定される。
     */
    function transitionVolume(game, context, duration, to, easing) {
        if (easing === void 0) { easing = linear; }
        var frame = 1000 / game.fps;
        var from = context.volume;
        var elapsed = 0;
        context.changeVolume(Util_1.Util.clamp(from, 0, 1));
        var handler = function () {
            elapsed += frame;
            if (elapsed <= duration) {
                var progress = easing(elapsed, from, to - from, duration);
                context.changeVolume(Util_1.Util.clamp(progress, 0, 1));
                return false;
            }
            else {
                context.changeVolume(to);
                return true;
            }
        };
        var remove = function () {
            if (game.onUpdate.contains(handler)) {
                game.onUpdate.remove(handler);
            }
        };
        game.onUpdate.add(handler);
        return {
            complete: function () {
                remove();
                context.changeVolume(to);
            },
            cancel: function (revert) {
                remove();
                if (revert) {
                    context.changeVolume(from);
                }
            }
        };
    }
    AudioUtil.transitionVolume = transitionVolume;
})(AudioUtil = exports.AudioUtil || (exports.AudioUtil = {}));

},{"./Util":69}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitmapFont = void 0;
var Font_1 = require("./Font");
var SurfaceUtil_1 = require("./SurfaceUtil");
/**
 * ラスタ画像によるフォント。
 */
var BitmapFont = /** @class */ (function (_super) {
    __extends(BitmapFont, _super);
    /**
     * 各種パラメータを指定して `BitmapFont` のインスタンスを生成する。
     * @param param `BitmapFont` に設定するパラメータ
     */
    function BitmapFont(param) {
        var _this = _super.call(this) || this;
        // @ts-ignore
        _this.surface = SurfaceUtil_1.SurfaceUtil.asSurface(param.src);
        if (param.glyphInfo) {
            _this.map = param.glyphInfo.map;
            _this.defaultGlyphWidth = param.glyphInfo.width;
            _this.defaultGlyphHeight = param.glyphInfo.height;
            _this.missingGlyph = param.glyphInfo.missingGlyph;
            _this.size = param.glyphInfo.height;
        }
        else {
            _this.map = param.map || {};
            _this.defaultGlyphWidth = param.defaultGlyphWidth || 0;
            _this.defaultGlyphHeight = param.defaultGlyphHeight || 0;
            _this.missingGlyph = param.missingGlyph;
            _this.size = param.defaultGlyphHeight || 0;
        }
        return _this;
    }
    /**
     * コードポイントに対応するグリフを返す。
     * @param code コードポイント
     */
    BitmapFont.prototype.glyphForCharacter = function (code) {
        var g = this.map[code] || this.missingGlyph;
        if (!g) {
            return null;
        }
        var w = g.width === undefined ? this.defaultGlyphWidth : g.width;
        var h = g.height === undefined ? this.defaultGlyphHeight : g.height;
        var offsetX = g.offsetX || 0;
        var offsetY = g.offsetY || 0;
        var advanceWidth = g.advanceWidth === undefined ? w : g.advanceWidth;
        var surface = w === 0 || h === 0 ? undefined : this.surface;
        return {
            code: code,
            x: g.x,
            y: g.y,
            width: w,
            height: h,
            surface: surface,
            offsetX: offsetX,
            offsetY: offsetY,
            advanceWidth: advanceWidth,
            isSurfaceValid: true,
            _atlas: null
        };
    };
    /**
     * 利用している `Surface` を破棄した上で、このフォントを破棄する。
     */
    BitmapFont.prototype.destroy = function () {
        if (this.surface && !this.surface.destroyed()) {
            this.surface.destroy();
        }
        this.map = undefined;
    };
    /**
     * 破棄されたオブジェクトかどうかを判定する。
     */
    BitmapFont.prototype.destroyed = function () {
        // mapをfalsy値で作成された場合最初から破棄扱いになるが、仕様とする
        return !this.map;
    };
    return BitmapFont;
}(Font_1.Font));
exports.BitmapFont = BitmapFont;

},{"./Font":29,"./SurfaceUtil":62}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],15:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Camera2D = void 0;
var Object2D_1 = require("./Object2D");
/**
 * 2D世界におけるカメラ。
 */
var Camera2D = /** @class */ (function (_super) {
    __extends(Camera2D, _super);
    /**
     * 指定されたパラメータで `Camera2D` のインスタンスを生成する。
     * @param param 初期化に用いるパラメータのオブジェクト
     */
    function Camera2D(param) {
        var _this = _super.call(this, param) || this;
        _this.local = !!param.local;
        _this.name = param.name;
        _this._modifiedCount = 0;
        return _this;
    }
    /**
     * 与えられたシリアリゼーションでカメラを復元する。
     *
     * @param ser `Camera2D#serialize()` の戻り値
     */
    Camera2D.deserialize = function (ser) {
        var s = ser;
        var ret = new Camera2D(s.param);
        return ret;
    };
    /**
     * カメラ状態の変更をエンジンに通知する。
     *
     * このメソッドの呼び出し後、このカメラのプロパティに対する変更が各 `Renderer` の描画に反映される。
     * ただし逆は真ではない。すなわち、再描画は他の要因によって行われることもある。
     * ゲーム開発者は、このメソッドを呼び出していないことをもって再描画が行われていないことを仮定してはならない。
     *
     * 本メソッドは、このオブジェクトの `Object2D` 由来のプロパティ (`x`, `y`, `angle` など) を変更した場合にも呼びだす必要がある。
     */
    Camera2D.prototype.modified = function () {
        this._modifiedCount = (this._modifiedCount + 1) % 32768;
        if (this._matrix)
            this._matrix._modified = true;
    };
    /**
     * このカメラをシリアライズする。
     *
     * このメソッドの戻り値を `Camera2D#deserialize()` に渡すことで同じ値を持つカメラを復元することができる。
     */
    Camera2D.prototype.serialize = function () {
        var ser = {
            param: {
                local: this.local,
                name: this.name,
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                opacity: this.opacity,
                scaleX: this.scaleX,
                scaleY: this.scaleY,
                angle: this.angle,
                anchorX: this.anchorX,
                anchorY: this.anchorY,
                compositeOperation: this.compositeOperation
            }
        };
        return ser;
    };
    /**
     * @private
     */
    Camera2D.prototype._applyTransformToRenderer = function (renderer) {
        if (this.angle || this.scaleX !== 1 || this.scaleY !== 1 || this.anchorX !== 0 || this.anchorY !== 0) {
            // Note: this.scaleX/scaleYが0の場合描画した結果何も表示されない事になるが、特殊扱いはしない
            renderer.transform(this.getMatrix()._matrix);
        }
        else {
            renderer.translate(-this.x, -this.y);
        }
        if (this.opacity !== 1)
            renderer.opacity(this.opacity);
    };
    /**
     * @private
     */
    Camera2D.prototype._updateMatrix = function () {
        if (!this._matrix)
            return;
        // カメラの angle, x, y はエンティティと逆方向に作用することに注意。
        if (this.angle || this.scaleX !== 1 || this.scaleY !== 1 || this.anchorX !== 0 || this.anchorY !== 0) {
            this._matrix.updateByInverse(this.width, this.height, this.scaleX, this.scaleY, this.angle, this.x, this.y, this.anchorX, this.anchorY);
        }
        else {
            this._matrix.reset(-this.x, -this.y);
        }
    };
    return Camera2D;
}(Object2D_1.Object2D));
exports.Camera2D = Camera2D;

},{"./Object2D":40}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collision = void 0;
var Util_1 = require("./Util");
// 外積の絶対値
function absCross(v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
}
// 二次元ベクトルの減算
function sub(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}
/**
 * オブジェクトなどの衝突判定機能を提供する。
 */
var Collision;
(function (Collision) {
    /**
     * 二つのエンティティの衝突判定を行い、その結果を返す。
     *
     * 回転・拡大されたエンティティや、親の異なるエンティティ同士も扱える汎用の衝突判定処理。
     * ただし計算量が多いので、大量のエンティティ間のすべての衝突を確認するような状況では利用を避けることが望ましい。
     * 親が同じで回転・拡大を行わないエンティティ同士の場合は、より軽量な Collision.intersectAreas() を利用すること。
     * 親が同じで中心座標同士の距離だけで判定してよい場合は、より軽量な Collision.withinAreas() を利用すること。
     *
     * 対象のエンティティの座標や大きさなどを変更した場合、
     * この関数の呼び出し前にそのエンティティの modified() を呼び出しておく必要がある。
     *
     * @param e1 衝突判定するエンティティ
     * @param e2 衝突判定するエンティティ
     * @param area1 e1 の当たり判定領域。省略された場合、`{ x: 0, y: 0, width: e1.width, hegiht: e1.height }`
     * @param area2 e2 の当たり判定領域。省略された場合、`{ x: 0, y: 0, width: e2.width, hegiht: e2.height }`
     */
    function intersectEntities(e1, e2, area1, area2) {
        var lca = e1._findLowestCommonAncestorWith(e2);
        if (!lca)
            return false;
        var r1 = area1
            ? { left: area1.x, top: area1.y, right: area1.x + area1.width, bottom: area1.y + area1.height }
            : { left: 0, top: 0, right: e1.width, bottom: e1.height };
        var r2 = area2
            ? { left: area2.x, top: area2.y, right: area2.x + area2.width, bottom: area2.y + area2.height }
            : { left: 0, top: 0, right: e2.width, bottom: e2.height };
        var mat1 = e1._calculateMatrixTo(lca);
        var mat2 = e2._calculateMatrixTo(lca);
        // 座標系を合わせる: 共通祖先の座標系に合わせたそれぞれの四隅の点を求める。
        var lt1 = mat1.multiplyPoint({ x: r1.left, y: r1.top });
        var rt1 = mat1.multiplyPoint({ x: r1.right, y: r1.top });
        var lb1 = mat1.multiplyPoint({ x: r1.left, y: r1.bottom });
        var rb1 = mat1.multiplyPoint({ x: r1.right, y: r1.bottom });
        var lt2 = mat2.multiplyPoint({ x: r2.left, y: r2.top });
        var rt2 = mat2.multiplyPoint({ x: r2.right, y: r2.top });
        var lb2 = mat2.multiplyPoint({ x: r2.left, y: r2.bottom });
        var rb2 = mat2.multiplyPoint({ x: r2.right, y: r2.bottom });
        // AABB で枝狩りする。(高速化だけでなく後続の条件を単純化するのにも必要である点に注意)
        var minX1 = Math.min(lt1.x, rt1.x, lb1.x, rb1.x);
        var maxX1 = Math.max(lt1.x, rt1.x, lb1.x, rb1.x);
        var minX2 = Math.min(lt2.x, rt2.x, lb2.x, rb2.x);
        var maxX2 = Math.max(lt2.x, rt2.x, lb2.x, rb2.x);
        if (maxX1 < minX2 || maxX2 < minX1)
            return false;
        var minY1 = Math.min(lt1.y, rt1.y, lb1.y, rb1.y);
        var maxY1 = Math.max(lt1.y, rt1.y, lb1.y, rb1.y);
        var minY2 = Math.min(lt2.y, rt2.y, lb2.y, rb2.y);
        var maxY2 = Math.max(lt2.y, rt2.y, lb2.y, rb2.y);
        if (maxY1 < minY2 || maxY2 < minY1)
            return false;
        // 二つの四角形それぞれのいずれかの辺同士が交差するなら衝突している。
        if (Collision.intersectLineSegments(lt1, rt1, lt2, rt2) ||
            Collision.intersectLineSegments(lt1, rt1, rt2, rb2) ||
            Collision.intersectLineSegments(lt1, rt1, rb2, lb2) ||
            Collision.intersectLineSegments(lt1, rt1, lb2, lt2) ||
            Collision.intersectLineSegments(rt1, rb1, lt2, rt2) ||
            Collision.intersectLineSegments(rt1, rb1, rt2, rb2) ||
            Collision.intersectLineSegments(rt1, rb1, rb2, lb2) ||
            Collision.intersectLineSegments(rt1, rb1, lb2, lt2) ||
            Collision.intersectLineSegments(rb1, lb1, lt2, rt2) ||
            Collision.intersectLineSegments(rb1, lb1, rt2, rb2) ||
            Collision.intersectLineSegments(rb1, lb1, rb2, lb2) ||
            Collision.intersectLineSegments(rb1, lb1, lb2, lt2) ||
            Collision.intersectLineSegments(lb1, lt1, lt2, rt2) ||
            Collision.intersectLineSegments(lb1, lt1, rt2, rb2) ||
            Collision.intersectLineSegments(lb1, lt1, rb2, lb2) ||
            Collision.intersectLineSegments(lb1, lt1, lb2, lt2)) {
            return true;
        }
        // そうでない場合、e1 が e2 を包含しているなら衝突している。
        // ここで辺は交差していないので、e1 が e2 の頂点一つ (lt2) を包含しているなら、全体を包含している。
        // cf. https://ksta.skr.jp/topic/diaryb09.html#040528 "各辺の内側判定による内外判定"
        var s1 = absCross(sub(lt1, rt1), sub(lt2, rt1));
        if (s1 * absCross(sub(lb1, lt1), sub(lt2, lt1)) >= 0 &&
            s1 * absCross(sub(rb1, lb1), sub(lt2, lb1)) >= 0 &&
            s1 * absCross(sub(rt1, rb1), sub(lt2, rb1)) >= 0) {
            return true;
        }
        // そうでない場合、e2 が e1 を包含しているなら衝突している。
        var s2 = absCross(sub(lt2, rt2), sub(lt1, rt2));
        return (s2 * absCross(sub(lb2, lt2), sub(lt1, lt2)) >= 0 &&
            s2 * absCross(sub(rb2, lb2), sub(lt1, lb2)) >= 0 &&
            s2 * absCross(sub(rt2, rb2), sub(lt1, rb2)) >= 0);
    }
    Collision.intersectEntities = intersectEntities;
    /**
     * 線分同士の衝突判定 (交差判定) を行い、その結果を返す。
     *
     * @param {CommonOffset} p1 線分の端点の一つ
     * @param {CommonOffset} p2 線分の端点の一つ
     * @param {CommonOffset} q1 もう一つの線分の端点の一つ
     * @param {CommonOffset} q2 もう一つの線分の端点の一つ
     */
    function intersectLineSegments(p1, p2, q1, q2) {
        // cf. https://ksta.skr.jp/topic/diaryb09.html#040518
        var p = sub(p2, p1);
        var q = sub(q2, q1);
        return (absCross(sub(q1, p1), p) * absCross(sub(q2, p1), p) <= 0 && absCross(sub(p1, q1), q) * absCross(sub(p2, q1), q) <= 0 // 符号が違うことを積の符号で判定している
        );
    }
    Collision.intersectLineSegments = intersectLineSegments;
    /**
     * 矩形交差による衝突判定を行い、その結果を返す。
     * 戻り値は、二つの矩形t1, t2が交差しているとき真、でなければ偽。
     *
     * @param {number} x1 t1のX座標
     * @param {number} y1 t1のY座標
     * @param {number} width1 t1の幅
     * @param {number} height1 t1の高さ
     * @param {number} x2 t2のX座標
     * @param {number} y2 t2のY座標
     * @param {number} width2 t2の幅
     * @param {number} height2 t2の高さ
     */
    function intersect(x1, y1, width1, height1, x2, y2, width2, height2) {
        return x1 <= x2 + width2 && x2 <= x1 + width1 && y1 <= y2 + height2 && y2 <= y1 + height1;
    }
    Collision.intersect = intersect;
    /**
     * 矩形交差による衝突判定を行い、その結果を返す。
     * 戻り値は、矩形t1, t2が交差しているとき真、でなければ偽。
     *
     * 特に、回転・拡大を利用していない、親が同じエンティティ同士の衝突判定に利用することができる。
     * 条件を満たさない場合は `withinAreas()` や、より重いが正確な `intersectEntities()` の利用を検討すること。
     *
     * @param {CommonArea} t1 矩形1
     * @param {CommonArea} t2 矩形2
     */
    function intersectAreas(t1, t2) {
        return Collision.intersect(t1.x, t1.y, t1.width, t1.height, t2.x, t2.y, t2.width, t2.height);
    }
    Collision.intersectAreas = intersectAreas;
    /**
     * 2点間の距離による衝突判定を行い、その結果を返す。
     * 戻り値は、2点間の距離が閾値以内であるとき真、でなければ偽。
     * @param {number} t1x 一点の X 座標
     * @param {number} t1y 一点の Y 座標
     * @param {number} t2x もう一点の X 座標
     * @param {number} t2y もう一点の Y 座標
     * @param {number} [distance=1] 衝突判定閾値 [pixel]
     */
    function within(t1x, t1y, t2x, t2y, distance) {
        if (distance === void 0) { distance = 1; }
        return distance >= Util_1.Util.distance(t1x, t1y, t2x, t2y);
    }
    Collision.within = within;
    /**
     * 2つの矩形の中心座標間距離による衝突判定を行い、その結果を返す。
     * 戻り値は、2点間の距離が閾値以内であるとき真、でなければ偽。
     * @param {CommonArea} t1 矩形1
     * @param {CommonArea} t2 矩形2
     * @param {number} [distance=1] 衝突判定閾値 [pixel]
     */
    function withinAreas(t1, t2, distance) {
        if (distance === void 0) { distance = 1; }
        return distance >= Util_1.Util.distanceBetweenAreas(t1, t2);
    }
    Collision.withinAreas = withinAreas;
})(Collision = exports.Collision || (exports.Collision = {}));

},{"./Util":69}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLoadingScene = void 0;
var CameraCancellingE_1 = require("./entities/CameraCancellingE");
var FilledRect_1 = require("./entities/FilledRect");
var LoadingScene_1 = require("./LoadingScene");
/**
 * デフォルトローディングシーン。
 *
 * `Game#_defaultLoadingScene` の初期値として利用される。
 * このシーンはいかなるアセットも用いてはならない。
 */
var DefaultLoadingScene = /** @class */ (function (_super) {
    __extends(DefaultLoadingScene, _super);
    /**
     * `DefaultLoadingScene` のインスタンスを生成する。
     * @param param 初期化に用いるパラメータのオブジェクト
     */
    function DefaultLoadingScene(param) {
        var _this = _super.call(this, { game: param.game, name: "akashic:default-loading-scene" }) || this;
        if (param.style === "compact") {
            _this._barWidth = _this.game.width / 4;
            _this._barHeight = 5;
            _this._style = "compact";
        }
        else {
            _this._barWidth = Math.min(_this.game.width, Math.max(100, _this.game.width / 2));
            _this._barHeight = 5;
            _this._style = "default";
        }
        _this._gauge = undefined;
        _this._gaugeUpdateCount = 0;
        _this._totalWaitingAssetCount = 0;
        _this.onLoad.add(_this._handleLoad, _this);
        _this.onTargetReset.add(_this._handleTargetReset, _this);
        _this.onTargetAssetLoad.add(_this._handleTargetAssetLoad, _this);
        return _this;
    }
    /**
     * @private
     */
    DefaultLoadingScene.prototype._handleLoad = function () {
        var barX, barY, bgColor;
        if (this._style === "compact") {
            var margin = Math.min(this.game.width, this.game.height) * 0.05;
            barX = this.game.width - margin - this._barWidth;
            barY = this.game.height - margin - this._barHeight;
            bgColor = "transparent";
        }
        else {
            barX = (this.game.width - this._barWidth) / 2;
            barY = (this.game.height - this._barHeight) / 2;
            bgColor = "rgba(0, 0, 0, 0.8)";
        }
        var gauge;
        this.append(new CameraCancellingE_1.CameraCancellingE({
            scene: this,
            children: [
                new FilledRect_1.FilledRect({
                    scene: this,
                    width: this.game.width,
                    height: this.game.height,
                    cssColor: bgColor,
                    children: [
                        new FilledRect_1.FilledRect({
                            scene: this,
                            x: barX,
                            y: barY,
                            width: this._barWidth,
                            height: this._barHeight,
                            cssColor: "gray",
                            children: [
                                (gauge = new FilledRect_1.FilledRect({
                                    scene: this,
                                    width: 0,
                                    height: this._barHeight,
                                    cssColor: "white"
                                }))
                            ]
                        })
                    ]
                })
            ]
        }));
        gauge.onUpdate.add(this._handleUpdate, this);
        this._gauge = gauge;
        return true; // Trigger 登録を解除する
    };
    /**
     * @private
     */
    DefaultLoadingScene.prototype._handleUpdate = function () {
        var BLINK_RANGE = 50;
        var BLINK_PER_SEC = 2 / 3;
        ++this._gaugeUpdateCount;
        // 白を上限に sin 波で明滅させる (updateしていることの確認)
        var c = Math.round(255 - BLINK_RANGE + Math.sin((this._gaugeUpdateCount / this.game.fps) * BLINK_PER_SEC * (2 * Math.PI)) * BLINK_RANGE);
        this._gauge.cssColor = "rgb(" + c + "," + c + "," + c + ")";
        this._gauge.modified();
    };
    /**
     * @private
     */
    DefaultLoadingScene.prototype._handleTargetReset = function (targetScene) {
        if (this._gauge) {
            this._gauge.width = 0;
            this._gauge.modified();
        }
        this._totalWaitingAssetCount = targetScene._sceneAssetHolder.waitingAssetsCount;
    };
    /**
     * @private
     */
    DefaultLoadingScene.prototype._handleTargetAssetLoad = function (_asset) {
        var waitingAssetsCount = this._targetScene._sceneAssetHolder.waitingAssetsCount;
        this._gauge.width = Math.ceil((1 - waitingAssetsCount / this._totalWaitingAssetCount) * this._barWidth);
        this._gauge.modified();
    };
    return DefaultLoadingScene;
}(LoadingScene_1.LoadingScene));
exports.DefaultLoadingScene = DefaultLoadingScene;

},{"./LoadingScene":34,"./entities/CameraCancellingE":79,"./entities/FilledRect":81}],18:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultSkippingScene = void 0;
var CameraCancellingE_1 = require("./entities/CameraCancellingE");
var FilledRect_1 = require("./entities/FilledRect");
var Scene_1 = require("./Scene");
/**
 * @ignore
 */
function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1)
        return (c / 2) * t * t + b;
    --t;
    return (-c / 2) * (t * (t - 2) - 1) + b;
}
/**
 * @ignore
 */
function easingInOutQuadWithSaturation(t, b, c, d) {
    var threshold = d * 0.15;
    return 0 < t && t < threshold ? easeInOutQuad(t, b, c, threshold) : b + c;
}
/**
 * @ignore
 */
var EasingFilledRect = /** @class */ (function (_super) {
    __extends(EasingFilledRect, _super);
    function EasingFilledRect(param) {
        var _this = _super.call(this, param) || this;
        _this.age = 0;
        _this.offsetDurationFrame = param.offsetDurationFrame;
        _this.easingDurationFrame = param.easingDurationFrame;
        _this.valueFrom = param.valueFrom;
        _this.valueTo = param.valueTo;
        _this.easing = param.easing;
        _this.onUpdate.add(_this._incrementAge, _this);
        _this.onUpdate.add(_this._updateColor, _this);
        return _this;
    }
    EasingFilledRect.prototype._incrementAge = function () {
        this.age++;
    };
    EasingFilledRect.prototype._updateColor = function () {
        var cssColor = this._calculateCSSColor();
        if (this.cssColor !== cssColor) {
            this.cssColor = cssColor;
            this.modified();
        }
    };
    EasingFilledRect.prototype._calculateCSSColor = function () {
        var _a = this, age = _a.age, offsetDurationFrame = _a.offsetDurationFrame, easingDurationFrame = _a.easingDurationFrame, valueFrom = _a.valueFrom, valueTo = _a.valueTo, easing = _a.easing;
        var t = Math.max(age - offsetDurationFrame, 0) % easingDurationFrame;
        var b = valueFrom;
        var c = valueTo - valueFrom;
        var d = easingDurationFrame;
        var col = easing(t, b, c, d);
        return "rgb(".concat(col, ", ").concat(col, ", ").concat(col, ")");
    };
    return EasingFilledRect;
}(FilledRect_1.FilledRect));
/**
 * デフォルトスキッピングシーン。
 *
 * `Game#_defaultSkippingScene` の初期値として利用される。
 */
var DefaultSkippingScene = /** @class */ (function (_super) {
    __extends(DefaultSkippingScene, _super);
    /**
     * `DefaultSkippingScene` のインスタンスを生成する。
     * @param param 初期化に用いるパラメータのオブジェクト
     */
    function DefaultSkippingScene(param) {
        var _this = _super.call(this, { game: param.game, local: "full-local", name: "akashic:default-skipping-scene" }) || this;
        if (param.style === "indicator") {
            _this.onLoad.addOnce(_this._handleLoadForIndicator, _this);
        }
        return _this;
    }
    /**
     * @private
     */
    DefaultSkippingScene.prototype._handleLoadForIndicator = function () {
        var _this = this;
        var game = this.game;
        var rectSize = (Math.min(game.width, game.height) * 0.03) | 0;
        var margin = (Math.min(game.width, game.height) * 0.03) | 0;
        var marginRight = (Math.min(game.width, game.height) * 0.05) | 0;
        var marginBottom = (Math.min(game.width, game.height) * 0.05) | 0;
        var offsetDurationFrame = 400 / (1000 / game.fps);
        var easingDurationFrame = 2500 / (1000 / game.fps);
        var valueFrom = 255 - 50;
        var valueTo = 255;
        var easing = easingInOutQuadWithSaturation;
        this.append(new CameraCancellingE_1.CameraCancellingE({
            scene: this,
            children: [3, 2, 1, 0].map(function (offsetIndex, i) {
                return new EasingFilledRect({
                    scene: _this,
                    cssColor: "rgb(".concat(valueTo, ", ").concat(valueTo, ", ").concat(valueTo, ")"),
                    width: rectSize,
                    height: rectSize,
                    x: game.width - i * (rectSize + margin) - marginRight,
                    y: game.height - marginBottom,
                    anchorX: 1,
                    anchorY: 1,
                    offsetDurationFrame: offsetDurationFrame * offsetIndex,
                    easingDurationFrame: easingDurationFrame,
                    valueFrom: valueFrom,
                    valueTo: valueTo,
                    easing: easing
                });
            })
        }));
    };
    return DefaultSkippingScene;
}(Scene_1.Scene));
exports.DefaultSkippingScene = DefaultSkippingScene;

},{"./Scene":52,"./entities/CameraCancellingE":79,"./entities/FilledRect":81}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],20:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicFont = void 0;
var pdi_types_1 = require("@akashic/pdi-types");
var BitmapFont_1 = require("./BitmapFont");
var Font_1 = require("./Font");
var SurfaceAtlasSet_1 = require("./SurfaceAtlasSet");
var Util_1 = require("./Util");
/**
 * ビットマップフォントを逐次生成するフォント。
 */
var DynamicFont = /** @class */ (function (_super) {
    __extends(DynamicFont, _super);
    /**
     * 各種パラメータを指定して `DynamicFont` のインスタンスを生成する。
     * @param param `DynamicFont` に設定するパラメータ
     */
    function DynamicFont(param) {
        var _this = _super.call(this) || this;
        _this.fontFamily = param.fontFamily;
        _this.size = param.size;
        _this.hint = param.hint != null ? param.hint : {};
        _this.fontColor = param.fontColor != null ? param.fontColor : "black";
        _this.fontWeight = param.fontWeight != null ? param.fontWeight : pdi_types_1.FontWeight.Normal;
        _this.strokeWidth = param.strokeWidth != null ? param.strokeWidth : 0;
        _this.strokeColor = param.strokeColor != null ? param.strokeColor : "black";
        _this.strokeOnly = param.strokeOnly != null ? param.strokeOnly : false;
        var game = param.game;
        _this._resourceFactory = game.resourceFactory;
        var ff = _this.fontFamily;
        var realFontFamily;
        if (typeof ff === "string") {
            realFontFamily = ff;
        }
        else if (Array.isArray(ff)) {
            var arr = [];
            for (var i = 0; i < ff.length; ++i) {
                var ffi = ff[i];
                arr.push(typeof ffi === "string" ? ffi : Util_1.Util.enumToSnakeCase(pdi_types_1.FontFamily, ffi));
            }
            realFontFamily = arr;
        }
        else {
            var arr = [];
            arr.push(typeof ff === "string" ? ff : Util_1.Util.enumToSnakeCase(pdi_types_1.FontFamily, ff));
            realFontFamily = arr;
        }
        var weight = _this.fontWeight;
        var realFontWeight = typeof weight === "string" ? weight : Util_1.Util.enumToSnakeCase(pdi_types_1.FontWeight, weight);
        _this._glyphFactory = _this._resourceFactory.createGlyphFactory(realFontFamily, _this.size, _this.hint.baselineHeight, _this.fontColor, _this.strokeWidth, _this.strokeColor, _this.strokeOnly, realFontWeight);
        _this._glyphs = {};
        _this._destroyed = false;
        _this._isSurfaceAtlasSetOwner = false;
        // NOTE: hint の特定プロパティ(baselineHeight)を分岐の条件にした場合、後でプロパティを追加した時に
        // ここで追従漏れの懸念があるため、引数の hint が省略されているかで分岐させている。
        if (param.surfaceAtlasSet) {
            _this._atlasSet = param.surfaceAtlasSet;
        }
        else if (!!param.hint) {
            _this._isSurfaceAtlasSetOwner = true;
            _this._atlasSet = new SurfaceAtlasSet_1.SurfaceAtlasSet({
                resourceFactory: game.resourceFactory,
                hint: _this.hint
            });
        }
        else {
            _this._atlasSet = game.surfaceAtlasSet;
        }
        if (_this.hint.presetChars) {
            for (var i = 0, len = _this.hint.presetChars.length; i < len; i++) {
                var code = Util_1.Util.charCodeAt(_this.hint.presetChars, i);
                if (!code) {
                    continue;
                }
                _this.glyphForCharacter(code);
            }
        }
        return _this;
    }
    /**
     * グリフの取得。
     *
     * 取得に失敗するとnullが返る。
     *
     * 取得に失敗した時、次のようにすることで成功するかもしれない。
     * - DynamicFont生成時に指定する文字サイズを小さくする
     * - アトラスの初期サイズ・最大サイズを大きくする
     *
     * @param code 文字コード
     */
    DynamicFont.prototype.glyphForCharacter = function (code) {
        var glyph = this._glyphs[code];
        if (!(glyph && glyph.isSurfaceValid)) {
            // g.Glyph にダウンキャストすることによって不整合が発生しうるので修正が必要
            // TODO: g.Glyph を返す create() メソッドを持つ g.GlyphFactory を定義すべき
            glyph = this._glyphFactory.create(code);
            if (glyph.surface) {
                // 空白文字でなければアトラス化する
                if (!this._atlasSet.addGlyph(glyph)) {
                    return null;
                }
            }
            this._glyphs[code] = glyph;
        }
        this._atlasSet.touchGlyph(glyph);
        return glyph;
    };
    /**
     * BtimapFontの生成。
     *
     * 実装上の制限から、このメソッドを呼び出す場合、maxAtlasNum が 1 または undefined/null(1として扱われる) である必要がある。
     * そうでない場合、失敗する可能性がある。
     *
     * @param missingGlyph `BitmapFont#map` に存在しないコードポイントの代わりに表示するべき文字。最初の一文字が用いられる。
     */
    DynamicFont.prototype.asBitmapFont = function (missingGlyphChar) {
        var _this = this;
        if (this._atlasSet.getAtlasNum() !== 1) {
            return null;
        }
        var missingGlyphCharCodePoint = null;
        if (missingGlyphChar) {
            missingGlyphCharCodePoint = Util_1.Util.charCodeAt(missingGlyphChar, 0);
            this.glyphForCharacter(missingGlyphCharCodePoint);
        }
        var glyphAreaMap = {};
        Object.keys(this._glyphs).forEach(function (_key) {
            var key = Number(_key);
            var glyph = _this._glyphs[key];
            var glyphArea = {
                x: glyph.x,
                y: glyph.y,
                width: glyph.width,
                height: glyph.height,
                offsetX: glyph.offsetX,
                offsetY: glyph.offsetY,
                advanceWidth: glyph.advanceWidth
            };
            glyphAreaMap[key] = glyphArea;
        });
        // NOTE: (defaultGlyphWidth, defaultGlyphHeight)= (0, this.size) とする
        //
        // それぞれの役割は第一に `GlyphArea#width`, `GlyphArea#height` が与えられないときの
        // デフォルト値である。ここでは必ず与えているのでデフォルト値としては利用されない。
        // しかし defaultGlyphHeight は BitmapFont#size にも用いられる。
        // そのために this.size をコンストラクタの第４引数に与えることにする。
        // @ts-ignore
        var missingGlyph = glyphAreaMap[missingGlyphCharCodePoint];
        var atlas = this._atlasSet.getAtlas(0);
        var size = atlas.getAtlasUsedSize();
        var surface = this._resourceFactory.createSurface(size.width, size.height);
        var renderer = surface.renderer();
        renderer.begin();
        renderer.drawImage(atlas._surface, 0, 0, size.width, size.height, 0, 0);
        renderer.end();
        var bitmapFont = new BitmapFont_1.BitmapFont({
            src: surface,
            map: glyphAreaMap,
            defaultGlyphWidth: 0,
            defaultGlyphHeight: this.size,
            missingGlyph: missingGlyph
        });
        return bitmapFont;
    };
    DynamicFont.prototype.destroy = function () {
        if (this._isSurfaceAtlasSetOwner) {
            this._atlasSet.destroy();
        }
        this._glyphs = undefined;
        this._glyphFactory = undefined;
        this._destroyed = true;
    };
    DynamicFont.prototype.destroyed = function () {
        return this._destroyed;
    };
    return DynamicFont;
}(Font_1.Font));
exports.DynamicFont = DynamicFont;

},{"./BitmapFont":13,"./Font":29,"./SurfaceAtlasSet":59,"./Util":69,"@akashic/pdi-types":193}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],22:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedEvent = exports.PlayerInfoEvent = exports.TimestampEvent = exports.LeaveEvent = exports.JoinEvent = exports.OperationEvent = exports.MessageEvent = exports.PointMoveEventBase = exports.PointUpEventBase = exports.PointDownEventBase = exports.PointEventBase = void 0;
/**
 * ポインティング操作を表すイベントの基底クラス。
 * PointEvent#targetでそのポインティング操作の対象が、
 * PointEvent#pointでその対象からの相対座標が取得できる。
 *
 * 本イベントはマルチタッチに対応しており、PointEvent#pointerIdを参照することで識別することが出来る。
 *
 * abstract
 */
var PointEventBase = /** @class */ (function () {
    function PointEventBase(pointerId, target, point, player, local, eventFlags, button) {
        // @ts-ignore TODO: eventFlags のデフォルト値の扱い
        this.eventFlags = eventFlags;
        this.local = !!local;
        this.player = player;
        this.pointerId = pointerId;
        this.target = target;
        this.point = point;
        this.button = button !== null && button !== void 0 ? button : 0;
    }
    return PointEventBase;
}());
exports.PointEventBase = PointEventBase;
/**
 * ポインティング操作の開始を表すイベントの基底クラス。
 */
var PointDownEventBase = /** @class */ (function (_super) {
    __extends(PointDownEventBase, _super);
    function PointDownEventBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "point-down";
        return _this;
    }
    return PointDownEventBase;
}(PointEventBase));
exports.PointDownEventBase = PointDownEventBase;
/**
 * ポインティング操作の終了を表すイベントの基底クラス。
 * PointDownEvent後にのみ発生する。
 *
 * PointUpEvent#startDeltaによってPointDownEvent時からの移動量が、
 * PointUpEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
 * PointUpEvent#pointにはPointDownEvent#pointと同じ値が格納される。
 */
var PointUpEventBase = /** @class */ (function (_super) {
    __extends(PointUpEventBase, _super);
    function PointUpEventBase(pointerId, target, point, prevDelta, startDelta, player, local, eventFlags, button) {
        var _this = _super.call(this, pointerId, target, point, player, local, eventFlags, button) || this;
        _this.type = "point-up";
        _this.prevDelta = prevDelta;
        _this.startDelta = startDelta;
        return _this;
    }
    return PointUpEventBase;
}(PointEventBase));
exports.PointUpEventBase = PointUpEventBase;
/**
 * ポインティング操作の移動を表すイベント。
 * PointDownEvent後にのみ発生するため、MouseMove相当のものが本イベントとして発生することはない。
 *
 * PointMoveEvent#startDeltaによってPointDownEvent時からの移動量が、
 * PointMoveEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
 * PointMoveEvent#pointにはPointMoveEvent#pointと同じ値が格納される。
 *
 * 本イベントは、プレイヤーがポインティングデバイスを移動していなくても、
 * カメラの移動等視覚的にポイントが変化している場合にも発生する。
 */
var PointMoveEventBase = /** @class */ (function (_super) {
    __extends(PointMoveEventBase, _super);
    function PointMoveEventBase(pointerId, target, point, prevDelta, startDelta, player, local, eventFlags, button) {
        var _this = _super.call(this, pointerId, target, point, player, local, eventFlags, button) || this;
        _this.type = "point-move";
        _this.prevDelta = prevDelta;
        _this.startDelta = startDelta;
        return _this;
    }
    return PointMoveEventBase;
}(PointEventBase));
exports.PointMoveEventBase = PointMoveEventBase;
/**
 * 汎用的なメッセージを表すイベント。
 * MessageEvent#dataによってメッセージ内容を取得出来る。
 */
var MessageEvent = /** @class */ (function () {
    function MessageEvent(data, player, local, eventFlags) {
        this.type = "message";
        // @ts-ignore TODO: eventFlags のデフォルト値の扱い
        this.eventFlags = eventFlags;
        this.local = !!local;
        this.player = player;
        this.data = data;
    }
    return MessageEvent;
}());
exports.MessageEvent = MessageEvent;
/**
 * 操作プラグインが通知する操作を表すイベント。
 * プラグインを識別する `OperationEvent#code` と、プラグインごとの内容 `OperationEvent#data` を持つ。
 */
var OperationEvent = /** @class */ (function () {
    function OperationEvent(code, data, player, local, eventFlags) {
        this.type = "operation";
        // @ts-ignore TODO: eventFlags のデフォルト値の扱い
        this.eventFlags = eventFlags;
        this.local = !!local;
        this.player = player;
        this.code = code;
        this.data = data;
    }
    return OperationEvent;
}());
exports.OperationEvent = OperationEvent;
/**
 * プレイヤーの参加を表すイベント。
 * JoinEvent#playerによって、参加したプレイヤーを取得出来る。
 */
var JoinEvent = /** @class */ (function () {
    function JoinEvent(player, storageValues, eventFlags) {
        this.type = "join";
        // @ts-ignore TODO: eventFlags のデフォルト値の扱い
        this.eventFlags = eventFlags;
        this.player = player;
        this.storageValues = storageValues;
    }
    return JoinEvent;
}());
exports.JoinEvent = JoinEvent;
/**
 * プレイヤーの離脱を表すイベント。
 * LeaveEvent#playerによって、離脱したプレイヤーを取得出来る。
 */
var LeaveEvent = /** @class */ (function () {
    function LeaveEvent(player, eventFlags) {
        this.type = "leave";
        // @ts-ignore TODO: eventFlags のデフォルト値の扱い
        this.eventFlags = eventFlags;
        this.player = player;
    }
    return LeaveEvent;
}());
exports.LeaveEvent = LeaveEvent;
/**
 * タイムスタンプを表すイベント。
 */
var TimestampEvent = /** @class */ (function () {
    function TimestampEvent(timestamp, player, eventFlags) {
        this.type = "timestamp";
        // @ts-ignore TODO: eventFlags のデフォルト値の扱い
        this.eventFlags = eventFlags;
        this.player = player;
        this.timestamp = timestamp;
    }
    return TimestampEvent;
}());
exports.TimestampEvent = TimestampEvent;
/**
 * プレイヤー情報を表すイベント。
 * PointInfoEvent#player.nameによってプレイヤー名を、PlayerInfoEvent#player.userDataによって送信者依存の追加データを取得できる。
 */
var PlayerInfoEvent = /** @class */ (function () {
    function PlayerInfoEvent(player, eventFlags) {
        this.type = "player-info";
        // @ts-ignore TODO: eventFlags のデフォルト値の扱い
        this.eventFlags = eventFlags;
        this.player = player;
    }
    return PlayerInfoEvent;
}());
exports.PlayerInfoEvent = PlayerInfoEvent;
/**
 * 新しい乱数の発生を表すイベント。
 * SeedEvent#generatorによって、本イベントで発生したRandomGeneratorを取得出来る。
 */
var SeedEvent = /** @class */ (function () {
    function SeedEvent(generator, eventFlags) {
        this.type = "seed";
        // @ts-ignore TODO: eventFlags のデフォルト値の扱い
        this.eventFlags = eventFlags;
        this.generator = generator;
    }
    return SeedEvent;
}());
exports.SeedEvent = SeedEvent;

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventConverter = void 0;
var E_1 = require("./entities/E");
var Event_1 = require("./Event");
var ExceptionFactory_1 = require("./ExceptionFactory");
var Storage_1 = require("./Storage");
/**
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 * @ignore
 */
var EventConverter = /** @class */ (function () {
    function EventConverter(param) {
        var _a;
        this._game = param.game;
        this._playerId = (_a = param.playerId) !== null && _a !== void 0 ? _a : null;
        this._playerTable = {};
        this._pointDownButtonTable = {};
    }
    /**
     * playlog.Eventからg.Eventへ変換する。
     */
    EventConverter.prototype.toGameEvent = function (pev) {
        var pointerId;
        var entityId;
        var target;
        var point;
        var startDelta;
        var prevDelta;
        var local;
        var timestamp;
        var button;
        var eventCode = pev[0 /* EventIndex.General.Code */];
        var prio = pev[1 /* EventIndex.General.EventFlags */];
        var playerId = pev[2 /* EventIndex.General.PlayerId */];
        // @ts-ignore
        var player = this._playerTable[playerId] || { id: playerId };
        switch (eventCode) {
            case 0 /* pl.EventCode.Join */:
                player = {
                    id: playerId,
                    name: pev[3 /* EventIndex.Join.PlayerName */]
                };
                // @ts-ignore
                if (this._playerTable[playerId] && this._playerTable[playerId].userData != null) {
                    // @ts-ignore
                    player.userData = this._playerTable[playerId].userData;
                }
                // @ts-ignore
                this._playerTable[playerId] = player;
                var store = undefined;
                if (pev[4 /* EventIndex.Join.StorageData */]) {
                    var keys_1 = [];
                    var values_1 = [];
                    pev[4 /* EventIndex.Join.StorageData */].map(function (data) {
                        keys_1.push(data.readKey);
                        values_1.push(data.values);
                    });
                    store = new Storage_1.StorageValueStore(keys_1, values_1);
                }
                return new Event_1.JoinEvent(player, store, prio);
            case 1 /* pl.EventCode.Leave */:
                delete this._playerTable[player.id];
                return new Event_1.LeaveEvent(player, prio);
            case 2 /* pl.EventCode.Timestamp */:
                timestamp = pev[3 /* EventIndex.Timestamp.Timestamp */];
                return new Event_1.TimestampEvent(timestamp, player, prio);
            case 3 /* pl.EventCode.PlayerInfo */:
                var playerName = pev[3 /* EventIndex.PlayerInfo.PlayerName */];
                var userData = pev[4 /* EventIndex.PlayerInfo.UserData */];
                player = {
                    id: playerId,
                    name: playerName,
                    userData: userData
                };
                // @ts-ignore
                this._playerTable[playerId] = player;
                return new Event_1.PlayerInfoEvent(player, prio);
            case 32 /* pl.EventCode.Message */:
                local = pev[4 /* EventIndex.Message.Local */];
                return new Event_1.MessageEvent(pev[3 /* EventIndex.Message.Message */], player, local, prio);
            case 33 /* pl.EventCode.PointDown */:
                local = pev[8 /* EventIndex.PointDown.Local */];
                pointerId = pev[3 /* EventIndex.PointDown.PointerId */];
                entityId = pev[6 /* EventIndex.PointDown.EntityId */];
                target = entityId == null ? undefined : entityId >= 0 ? this._game.db.get(entityId) : this._game._localDb.get(entityId);
                point = {
                    x: pev[4 /* EventIndex.PointDown.X */],
                    y: pev[5 /* EventIndex.PointDown.Y */]
                };
                button = pev[7 /* EventIndex.PointDown.Button */];
                this._pointDownButtonTable[pointerId] = button;
                return new E_1.PointDownEvent(pointerId, target, point, player, local, prio, button);
            case 34 /* pl.EventCode.PointMove */:
                local = pev[11 /* EventIndex.PointMove.Local */];
                pointerId = pev[3 /* EventIndex.PointMove.PointerId */];
                entityId = pev[10 /* EventIndex.PointMove.EntityId */];
                target = entityId == null ? undefined : entityId >= 0 ? this._game.db.get(entityId) : this._game._localDb.get(entityId);
                point = {
                    x: pev[4 /* EventIndex.PointMove.X */],
                    y: pev[5 /* EventIndex.PointMove.Y */]
                };
                startDelta = {
                    x: pev[6 /* EventIndex.PointMove.StartDeltaX */],
                    y: pev[7 /* EventIndex.PointMove.StartDeltaY */]
                };
                prevDelta = {
                    x: pev[8 /* EventIndex.PointMove.PrevDeltaX */],
                    y: pev[9 /* EventIndex.PointMove.PrevDeltaY */]
                };
                button = this._pointDownButtonTable[pointerId];
                return new E_1.PointMoveEvent(pointerId, target, point, prevDelta, startDelta, player, local, prio, button);
            case 35 /* pl.EventCode.PointUp */:
                local = pev[11 /* EventIndex.PointUp.Local */];
                pointerId = pev[3 /* EventIndex.PointUp.PointerId */];
                entityId = pev[10 /* EventIndex.PointUp.EntityId */];
                target = entityId == null ? undefined : entityId >= 0 ? this._game.db.get(entityId) : this._game._localDb.get(entityId);
                point = {
                    x: pev[4 /* EventIndex.PointUp.X */],
                    y: pev[5 /* EventIndex.PointUp.Y */]
                };
                startDelta = {
                    x: pev[6 /* EventIndex.PointUp.StartDeltaX */],
                    y: pev[7 /* EventIndex.PointUp.StartDeltaY */]
                };
                prevDelta = {
                    x: pev[8 /* EventIndex.PointUp.PrevDeltaX */],
                    y: pev[9 /* EventIndex.PointUp.PrevDeltaY */]
                };
                button = this._pointDownButtonTable[pointerId];
                delete this._pointDownButtonTable[pointerId];
                return new E_1.PointUpEvent(pointerId, target, point, prevDelta, startDelta, player, local, prio, button);
            case 64 /* pl.EventCode.Operation */:
                local = pev[5 /* EventIndex.Operation.Local */];
                var operationCode = pev[3 /* EventIndex.Operation.OperationCode */];
                var operationData = pev[4 /* EventIndex.Operation.OperationData */];
                var decodedData = this._game._decodeOperationPluginOperation(operationCode, operationData);
                return new Event_1.OperationEvent(operationCode, decodedData, player, local, prio);
            default:
                // TODO handle error
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("EventConverter#toGameEvent");
        }
    };
    /**
     * g.Eventからplaylog.Eventに変換する。
     */
    EventConverter.prototype.toPlaylogEvent = function (e, preservePlayer) {
        var _a, _b, _c, _d, _e, _f, _g;
        var targetId;
        var playerId;
        switch (e.type) {
            case "join":
            case "leave":
                // akashic-engine は決して Join と Leave を生成しない
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("EventConverter#toPlaylogEvent: Invalid type: " + e.type);
            case "timestamp":
                var ts = e;
                playerId = preservePlayer ? (_a = ts.player.id) !== null && _a !== void 0 ? _a : null : this._playerId;
                return [
                    2 /* pl.EventCode.Timestamp */,
                    ts.eventFlags,
                    playerId,
                    ts.timestamp //            3: タイムスタンプ
                ];
            case "player-info":
                var playerInfo = e;
                playerId = preservePlayer ? (_b = playerInfo.player.id) !== null && _b !== void 0 ? _b : null : this._playerId;
                return [
                    3 /* pl.EventCode.PlayerInfo */,
                    playerInfo.eventFlags,
                    playerId,
                    playerInfo.player.name,
                    playerInfo.player.userData // 4: ユーザデータ
                ];
            case "point-down":
                var pointDown = e;
                targetId = pointDown.target ? pointDown.target.id : null;
                playerId = preservePlayer && pointDown.player ? (_c = pointDown.player.id) !== null && _c !== void 0 ? _c : null : this._playerId;
                return [
                    33 /* pl.EventCode.PointDown */,
                    pointDown.eventFlags,
                    playerId,
                    pointDown.pointerId,
                    pointDown.point.x,
                    pointDown.point.y,
                    targetId,
                    pointDown.button,
                    !!pointDown.local //       8?: ローカルイベントかどうか
                ];
            case "point-move":
                var pointMove = e;
                targetId = pointMove.target ? pointMove.target.id : null;
                playerId = preservePlayer && pointMove.player ? (_d = pointMove.player.id) !== null && _d !== void 0 ? _d : null : this._playerId;
                return [
                    34 /* pl.EventCode.PointMove */,
                    pointMove.eventFlags,
                    playerId,
                    pointMove.pointerId,
                    pointMove.point.x,
                    pointMove.point.y,
                    pointMove.startDelta.x,
                    pointMove.startDelta.y,
                    pointMove.prevDelta.x,
                    pointMove.prevDelta.y,
                    targetId,
                    !!pointMove.local //       11?: ローカルイベントかどうか
                ];
            case "point-up":
                var pointUp = e;
                targetId = pointUp.target ? pointUp.target.id : null;
                playerId = preservePlayer && pointUp.player ? (_e = pointUp.player.id) !== null && _e !== void 0 ? _e : null : this._playerId;
                return [
                    35 /* pl.EventCode.PointUp */,
                    pointUp.eventFlags,
                    playerId,
                    pointUp.pointerId,
                    pointUp.point.x,
                    pointUp.point.y,
                    pointUp.startDelta.x,
                    pointUp.startDelta.y,
                    pointUp.prevDelta.x,
                    pointUp.prevDelta.y,
                    targetId,
                    !!pointUp.local //       11?: ローカルイベントかどうか
                ];
            case "message":
                var message = e;
                playerId = preservePlayer && message.player ? (_f = message.player.id) !== null && _f !== void 0 ? _f : null : this._playerId;
                return [
                    32 /* pl.EventCode.Message */,
                    message.eventFlags,
                    playerId,
                    message.data,
                    !!message.local //       4?: ローカル
                ];
            case "operation":
                var op = e;
                playerId = preservePlayer && op.player ? (_g = op.player.id) !== null && _g !== void 0 ? _g : null : this._playerId;
                return [
                    64 /* pl.EventCode.Operation */,
                    op.eventFlags,
                    playerId,
                    op.code,
                    op.data,
                    !!op.local //              5?: ローカル
                ];
            default:
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Unknown type: " + e.type);
        }
    };
    EventConverter.prototype.makePlaylogOperationEvent = function (op) {
        var playerId = this._playerId;
        var eventFlags = op.priority != null ? op.priority & 3 /* pl.EventFlagsMask.Priority */ : 0;
        return [
            64 /* pl.EventCode.Operation */,
            eventFlags,
            playerId,
            op._code,
            op.data,
            !!op.local //              5: ローカル
        ];
    };
    return EventConverter;
}());
exports.EventConverter = EventConverter;

},{"./Event":22,"./ExceptionFactory":28,"./Storage":57,"./entities/E":80}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionFactory = void 0;
/**
 * 例外生成ファクトリ。
 * エンジン内部での例外生成に利用するもので、ゲーム開発者は通常本モジュールを利用する必要はない。
 */
var ExceptionFactory;
(function (ExceptionFactory) {
    function createAssertionError(message, cause) {
        var e = new Error(message);
        e.name = "AssertionError";
        e.cause = cause;
        return e;
    }
    ExceptionFactory.createAssertionError = createAssertionError;
    function createTypeMismatchError(methodName, expected, actual, cause) {
        var message = "Type mismatch on " + methodName + "," + " expected type is " + expected;
        if (arguments.length > 2) {
            // actual 指定時
            try {
                var actualString = void 0;
                if (actual && actual.constructor && actual.constructor.name) {
                    actualString = actual.constructor.name;
                }
                else {
                    actualString = typeof actual;
                }
                message += ", actual type is " + (actualString.length > 40 ? actualString.substr(0, 40) : actualString);
            }
            catch (ex) {
                // メッセージ取得時に例外が発生したらactualの型情報出力はあきらめる
            }
        }
        message += ".";
        var e = new Error(message);
        e.name = "TypeMismatchError";
        e.cause = cause;
        e.expected = expected;
        e.actual = actual;
        return e;
    }
    ExceptionFactory.createTypeMismatchError = createTypeMismatchError;
    function createAssetLoadError(message, retriable, _type, // 歴史的経緯により残っている値。利用していない。
    cause) {
        if (retriable === void 0) { retriable = true; }
        if (_type === void 0) { _type = null; }
        var e = new Error(message);
        e.name = "AssetLoadError";
        e.cause = cause;
        e.retriable = retriable;
        return e;
    }
    ExceptionFactory.createAssetLoadError = createAssetLoadError;
})(ExceptionFactory = exports.ExceptionFactory || (exports.ExceptionFactory = {}));

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Font = void 0;
var Util_1 = require("./Util");
/**
 * フォント。
 */
var Font = /** @class */ (function () {
    function Font() {
    }
    /**
     * 対象の文字列を一行で描画した際の計測情報を返す。
     *
     * @param text 文字列
     */
    Font.prototype.measureText = function (text) {
        var width = 0;
        var actualBoundingBoxLeft = 0;
        var actualBoundingBoxRight = 0;
        var lastGlyph = null;
        for (var i = 0; i < text.length; i++) {
            var code = Util_1.Util.charCodeAt(text, i);
            if (!code)
                continue;
            var glyph = this.glyphForCharacter(code);
            if (!glyph || glyph.x < 0 || glyph.y < 0 || glyph.width < 0 || glyph.height < 0)
                continue;
            if (i === 0) {
                actualBoundingBoxLeft = -glyph.offsetX;
            }
            lastGlyph = glyph;
            width += glyph.advanceWidth;
        }
        if (lastGlyph) {
            actualBoundingBoxRight = width + lastGlyph.offsetX + lastGlyph.width - lastGlyph.advanceWidth;
        }
        return {
            width: width,
            actualBoundingBoxLeft: actualBoundingBoxLeft,
            actualBoundingBoxRight: actualBoundingBoxRight
        };
    };
    return Font;
}());
exports.Font = Font;

},{"./Util":69}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var trigger_1 = require("@akashic/trigger");
var AssetManager_1 = require("./AssetManager");
var AudioSystemManager_1 = require("./AudioSystemManager");
var DefaultLoadingScene_1 = require("./DefaultLoadingScene");
var DefaultSkippingScene_1 = require("./DefaultSkippingScene");
var EventConverter_1 = require("./EventConverter");
var ExceptionFactory_1 = require("./ExceptionFactory");
var LoadingScene_1 = require("./LoadingScene");
var ModuleManager_1 = require("./ModuleManager");
var OperationPluginManager_1 = require("./OperationPluginManager");
var PointEventResolver_1 = require("./PointEventResolver");
var Scene_1 = require("./Scene");
var Storage_1 = require("./Storage");
var SurfaceAtlasSet_1 = require("./SurfaceAtlasSet");
var WeakRefKVS_1 = require("./WeakRefKVS");
var XorshiftRandomGenerator_1 = require("./XorshiftRandomGenerator");
/**
 * コンテンツそのものを表すクラス。
 *
 * 本クラスのインスタンスは暗黙に生成され、ゲーム開発者が生成することはない。
 * ゲーム開発者は `g.game` によって本クラスのインスタンスを参照できる。
 *
 * 本クラスをゲーム開発者が利用するのは以下のようなケースである。
 * 1. Sceneの生成時、コンストラクタに引数として渡す
 * 2. Sceneに紐付かないイベント Game#join, Game#leave, Game#playerInfo, Game#seed を処理する
 * 3. 乱数を発生させるため、Game#randomにアクセスしRandomGeneratorを取得する
 * 4. ゲームのメタ情報を確認するため、Game#width, Game#height, Game#fpsにアクセスする
 * 5. グローバルアセットを取得するため、Game#assetsにアクセスする
 * 6. LoadingSceneを変更するため、Game#loadingSceneにゲーム開発者の定義したLoadingSceneを指定する
 * 7. スナップショットに対応するため、Game#requestSaveSnapshot()を呼び出す
 * 8. 現在フォーカスされているCamera情報を得るため、Game#focusingCameraにアクセスする
 * 9. AudioSystemを直接制御するため、Game#audioにアクセスする
 * 10.Sceneのスタック情報を調べるため、Game#scenesにアクセスする
 * 11.操作プラグインを直接制御するため、Game#operationPluginManagerにアクセスする
 */
var Game = /** @class */ (function () {
    /**
     * `Game` のインスタンスを生成する。
     *
     * @param param この `Game` に指定するパラメータ
     */
    function Game(param) {
        var gameConfiguration = this._normalizeConfiguration(param.configuration);
        this.fps = gameConfiguration.fps;
        this.width = gameConfiguration.width;
        this.height = gameConfiguration.height;
        this.renderers = [];
        this.scenes = [];
        this.age = 0;
        this.assetBase = param.assetBase || "";
        this.resourceFactory = param.resourceFactory;
        this.handlerSet = param.handlerSet;
        this.selfId = param.selfId;
        this.db = undefined;
        this.loadingScene = undefined;
        this.operationPlugins = undefined;
        this.random = undefined;
        this.localRandom = undefined;
        this._defaultLoadingScene = undefined;
        this._defaultSkippingScene = undefined;
        this._eventConverter = undefined;
        this._pointEventResolver = undefined;
        this._idx = undefined;
        this._localDb = undefined;
        this._localIdx = undefined;
        this._cameraIdx = undefined;
        this._isTerminated = undefined;
        this._modified = undefined;
        this._postTickTasks = undefined;
        this._toBeDestroyedScenes = [];
        this.playId = undefined;
        this.isSkipping = false;
        this.joinedPlayerIds = [];
        this.audio = new AudioSystemManager_1.AudioSystemManager(this.resourceFactory);
        this.defaultAudioSystemId = "sound";
        this.storage = new Storage_1.Storage();
        this.assets = {};
        this.surfaceAtlasSet = new SurfaceAtlasSet_1.SurfaceAtlasSet({ resourceFactory: this.resourceFactory });
        this.onJoin = new trigger_1.Trigger();
        this.onLeave = new trigger_1.Trigger();
        this.onPlayerInfo = new trigger_1.Trigger();
        this.onSeed = new trigger_1.Trigger();
        this.join = this.onJoin;
        this.leave = this.onLeave;
        this.playerInfo = this.onPlayerInfo;
        this.seed = this.onSeed;
        this._eventTriggerMap = {
            unknown: undefined,
            timestamp: undefined,
            join: this.onJoin,
            leave: this.onLeave,
            "player-info": this.onPlayerInfo,
            seed: this.onSeed,
            message: undefined,
            "point-down": undefined,
            "point-move": undefined,
            "point-up": undefined,
            operation: undefined
        };
        this.onResized = new trigger_1.Trigger();
        this.onSkipChange = new trigger_1.Trigger();
        this.resized = this.onResized;
        this.skippingChanged = this.onSkipChange;
        this.isLastTickLocal = true;
        this.lastOmittedLocalTickCount = 0;
        this.lastLocalTickMode = null;
        this.lastTickGenerationMode = null;
        this._onLoad = new trigger_1.Trigger();
        this._onStart = new trigger_1.Trigger();
        this._loaded = this._onLoad;
        this._started = this._onStart;
        this.isLoaded = false;
        this.onSnapshotRequest = new trigger_1.Trigger();
        this.snapshotRequest = this.onSnapshotRequest;
        this.external = {};
        this._runtimeValueBase = Object.create(param.engineModule, {
            game: {
                value: this,
                enumerable: true
            }
        });
        this._main = gameConfiguration.main;
        this._mainFunc = param.mainFunc;
        this._mainParameter = undefined;
        this._configuration = gameConfiguration;
        // TODO: AssetConfiguration[]のサポートができたらこの例外処理は削除する
        if (Array.isArray(gameConfiguration.assets)) {
            throw new Error("Game#constructor: array type of configuration.assets is not yet supported");
        }
        this._assetManager = new AssetManager_1.AssetManager(this, gameConfiguration.assets, gameConfiguration.audio, gameConfiguration.moduleMainScripts);
        this._moduleManager = undefined;
        this.operationPluginManager = new OperationPluginManager_1.OperationPluginManager(this, param.operationPluginViewInfo || null);
        this._onOperationPluginOperated = new trigger_1.Trigger();
        this._operationPluginOperated = this._onOperationPluginOperated;
        this._onOperationPluginOperated.add(this._handleOperationPluginOperated, this);
        this.onSceneChange = new trigger_1.Trigger();
        this._onSceneChange = new trigger_1.Trigger();
        this._onSceneChange.add(this._handleSceneChanged, this);
        this._sceneChanged = this._onSceneChange;
        this.onUpdate = new trigger_1.Trigger();
        this._initialScene = new Scene_1.Scene({
            game: this,
            assetIds: this._assetManager.globalAssetIds(),
            local: true,
            name: "akashic:initial-scene"
        });
        this._initialScene.onLoad.add(this._handleInitialSceneLoad, this);
        this._reset({ age: 0 });
    }
    Object.defineProperty(Game.prototype, "focusingCamera", {
        /**
         * 使用中のカメラ。
         *
         * `Game#draw()`, `Game#findPointSource()` のデフォルト値として使用される。
         * この値を変更した場合、変更を描画に反映するためには `Game#modified()` を呼び出す必要がある。
         */
        // focusingCameraが変更されても古いカメラをtargetCamerasに持つエンティティのEntityStateFlags.Modifiedを取りこぼすことが無いように、変更時にはrenderを呼べるようアクセサを使う
        get: function () {
            return this._focusingCamera;
        },
        set: function (c) {
            if (c === this._focusingCamera)
                return;
            if (this._modified)
                this.render();
            this._focusingCamera = c;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "skippingScene", {
        /**
         * スキッピングシーン。
         * ゲームが早送りとなった際に描画される特殊なシーンであり、以下の制限を持つ。
         *
         * * サポートするシーンの種別は "full-local" のみ
         * * 非グローバルアセットを利用してはならない
         * * シーン内で発生した一切のイベントは処理されない
         * * 早送りが複数回発生した場合でも、対象のシーンの onLoad は2度目以降発火せずにインスタンスが使い回される
         *
         * 初期値は `undefined` である。
         */
        get: function () {
            return this._skippingScene;
        },
        set: function (scene) {
            if (scene === this._skippingScene)
                return;
            if (scene) {
                if (scene.local !== "full-local") {
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#skippingScene: only 'full-local' scene is supported.");
                }
                if (scene._needsLoading()) {
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#skippingScene: must not depend on any assets/storages.");
                }
            }
            this._skippingScene = scene;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * シーンスタックへのシーンの追加と、そのシーンへの遷移を要求する。
     *
     * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
     * 実際のシーン遷移は現在のフレームの終わり(Scene#update の fire 後) まで遅延される。
     * このメソッドの呼び出しにより、現在のシーンの `stateChanged` が引数 `"deactive"` でfireされる。
     * その後 `scene.stateChanged` が引数 `"active"` でfireされる。
     * @param scene 遷移後のシーン
     */
    Game.prototype.pushScene = function (scene) {
        this._postTickTasks.push({
            type: 0 /* PostTickTaskType.PushScene */,
            scene: scene
        });
    };
    /**
     * 現在のシーンの置き換えを要求する。
     *
     * 現在のシーンをシーンスタックから取り除き、指定のシーンを追加することを要求する。
     * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
     * 実際のシーン遷移は現在のフレームの終わり(Scene#update の fire 後) まで遅延される。
     * 引数 `preserveCurrent` が偽の場合、このメソッドの呼び出しにより現在のシーンは破棄される。
     * またその時 `stateChanged` が引数 `"destroyed"` でfireされる。
     * その後 `scene.stateChanged` が引数 `"active"` でfireされる。
     *
     * @param scene 遷移後のシーン
     * @param preserveCurrent 真の場合、現在のシーンを破棄しない(ゲーム開発者が明示的に破棄せねばならない)。省略された場合、偽
     */
    Game.prototype.replaceScene = function (scene, preserveCurrent) {
        this._postTickTasks.push({
            type: 1 /* PostTickTaskType.ReplaceScene */,
            scene: scene,
            preserveCurrent: !!preserveCurrent
        });
    };
    /**
     * シーンスタックから現在のシーンを取り除くことを要求する
     *
     * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
     * 実際のシーン遷移は次のフレームまでに(次のupdateのfireまでに)行われる。
     * 引数 `preserve` が偽の場合、このメソッドの呼び出しにより取り除かれたシーンは全て破棄される。
     * またその時 `stateChanged` が引数 `"destroyed"` でfireされる。
     * その後一つ前のシーンの `stateChanged` が引数 `"active"` でfireされる。
     * また、step数がスタックされているシーンの数以上の場合、例外が投げられる。
     *
     * @param preserve 真の場合、シーンを破棄しない(ゲーム開発者が明示的に破棄せねばならない)。省略された場合、偽
     * @param step 取り除くシーンの数。省略された場合、1
     */
    Game.prototype.popScene = function (preserve, step) {
        if (step === void 0) { step = 1; }
        for (var i = 0; i < step; i++) {
            this._postTickTasks.push({ type: 2 /* PostTickTaskType.PopScene */, preserveCurrent: !!preserve });
        }
    };
    /**
     * 現在のシーンを返す。
     * ない場合、 `undefined` を返す。
     */
    Game.prototype.scene = function () {
        if (!this.scenes.length)
            return undefined;
        return this.scenes[this.scenes.length - 1];
    };
    /**
     * この `Game` の時間経過とそれに伴う処理を行う。
     *
     * 現在の `Scene` に対して `Scene#update` をfireし、 `events` に設定されたイベントを処理する。
     * このメソッドは暗黙に呼び出される。ゲーム開発者がこのメソッドを利用する必要はない。
     *
     * 戻り値は呼び出し前後でシーンが変わった(別のシーンに遷移した)場合、真。でなければ偽。
     * @param advanceAge 偽を与えた場合、`this.age` を進めない。
     * @param omittedTickCount タイムスタンプ待ちを省略する動作などにより、(前回の呼び出し以降に)省かれたローカルティックの数。省略された場合、 `0` 。
     * @param events ティックに含ませるイベント。省略された場合、 `undefined` 。
     */
    Game.prototype.tick = function (advanceAge, omittedTickCount, events) {
        var scene = null;
        if (this._isTerminated)
            return false;
        this.isLastTickLocal = !advanceAge;
        this.lastOmittedLocalTickCount = omittedTickCount || 0;
        if (this.scenes.length) {
            scene = this.scenes[this.scenes.length - 1];
            if (events && events.length) {
                for (var i = 0; i < events.length; ++i) {
                    var event = this._eventConverter.toGameEvent(events[i]);
                    var trigger = this._eventTriggerMap[event.type];
                    // @ts-ignore 処理の高速化のため以下の箇所のみ型の厳格なチェックをなくす
                    if (trigger)
                        trigger.fire(event);
                }
            }
            scene.onUpdate.fire();
            if (advanceAge)
                ++this.age;
        }
        this.onUpdate.fire();
        if (this._postTickTasks.length) {
            this._flushPostTickTasks();
            return scene !== this.scenes[this.scenes.length - 1];
        }
        return false;
    };
    /**
     * このGameを描画する。
     *
     * このゲームに紐づけられた `Renderer` (`this.renderers` に含まれるすべての `Renderer` で、この `Game` の描画を行う。
     * 描画内容に変更がない場合、描画処理がスキップされる点に注意。強制的に描画をする場合は `this.modified()` を呼ぶこと。
     * このメソッドは暗黙に呼び出される。ゲーム開発者がこのメソッドを利用する必要はない。
     */
    Game.prototype.render = function () {
        var _a;
        var scene;
        var skippingScene = (_a = this._skippingScene) !== null && _a !== void 0 ? _a : this._defaultSkippingScene;
        if (skippingScene && this.isSkipping) {
            scene = skippingScene;
            scene.onUpdate.fire();
        }
        else {
            scene = this.scene();
        }
        if (!this._modified)
            return;
        if (!scene)
            return;
        var camera = this.focusingCamera;
        var renderers = this.renderers; // unsafe
        for (var i = 0; i < renderers.length; ++i) {
            var renderer = renderers[i];
            renderer.begin();
            renderer.save();
            renderer.clear();
            if (camera) {
                renderer.save();
                camera._applyTransformToRenderer(renderer);
            }
            var children = scene.children;
            for (var j = 0; j < children.length; ++j)
                children[j].render(renderer, camera);
            if (camera) {
                renderer.restore();
            }
            renderer.restore();
            renderer.end();
        }
        this._modified = false;
    };
    /**
     * 対象のポイントイベントのターゲットエンティティ(`PointTarget#target`)を解決し、それを補完した playlog.Event を返す。
     * Down -> Move -> Up とは異なる順番で呼び出された場合 `null` を返す。
     * このメソッドは暗黙に呼び出される。ゲーム開発者がこのメソッドを利用する必要はない。
     * @param e プラットフォームのポイントイベント
     */
    Game.prototype.resolvePointEvent = function (e) {
        switch (e.type) {
            case 0 /* PlatformPointType.Down */:
                return this._pointEventResolver.pointDown(e);
            case 1 /* PlatformPointType.Move */:
                return this._pointEventResolver.pointMove(e);
            case 2 /* PlatformPointType.Up */:
                return this._pointEventResolver.pointUp(e);
        }
    };
    /**
     * その座標に反応する `PointSource` を返す。
     *
     * 戻り値は、対象が見つかった場合、 `target` に見つかった `E` を持つ `PointSource` である。
     * 対象が見つからなかった場合、 `undefined` である。
     *
     * 戻り値が `undefined` でない場合、その `target` プロパティは次を満たす:
     * - `E#touchable` が真である
     * - カメラ `camera` から可視である中で最も手前にある
     *
     * @param point 対象の座標
     * @param camera 対象のカメラ。指定しなければ `Game.focusingCamera` が使われる
     */
    Game.prototype.findPointSource = function (point, camera) {
        if (!camera)
            camera = this.focusingCamera;
        var scene = this.scene();
        if (!scene)
            return undefined;
        return scene.findPointSourceByPoint(point, false, camera);
    };
    /**
     * このGameにエンティティを登録する。
     *
     * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に利用する必要はない。
     * `e.id` が `undefined` である場合、このメソッドの呼び出し後、 `e.id` には `this` に一意の値が設定される。
     * `e.local` が偽である場合、このメソッドの呼び出し後、 `this.db[e.id] === e` が成立する。
     * `e.local` が真である場合、 `e.id` の値は不定である。
     *
     * @param e 登録するエンティティ
     */
    Game.prototype.register = function (e) {
        if (e.local) {
            if (e.id === undefined) {
                e.id = --this._localIdx;
            }
            else {
                // register前にidがある: スナップショットからの復元用パス
                // スナップショットはローカルエンティティを残さないはずだが、実装上はできるようにしておく。
                if (e.id > 0)
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#register: invalid local id: " + e.id);
                if (this._localDb.has(e.id))
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#register: conflicted id: " + e.id);
                if (this._localIdx > e.id)
                    this._localIdx = e.id;
            }
            this._localDb.set(e.id, e);
        }
        else {
            if (e.id === undefined) {
                e.id = ++this._idx;
            }
            else {
                // register前にidがある: スナップショットからの復元用パス
                if (e.id < 0)
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#register: invalid non-local id: " + e.id);
                if (this.db.has(e.id))
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#register: conflicted id: " + e.id);
                // _idxがユニークな値を作れるよう更新しておく
                if (this._idx < e.id)
                    this._idx = e.id;
            }
            this.db.set(e.id, e);
        }
    };
    /**
     * このGameからエンティティの登録を削除する。
     *
     * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に利用する必要はない。
     * このメソッドの呼び出し後、 `this.db[e.id]` は未定義である。
     * @param e 登録を削除するエンティティ
     */
    Game.prototype.unregister = function (e) {
        if (e.local) {
            this._localDb.delete(e.id);
        }
        else {
            this.db.delete(e.id);
        }
    };
    /**
     * このゲームを終了する。
     *
     * エンジンに対して続行の断念を通知する。
     * このメソッドの呼び出し後、このクライアントの操作要求は送信されない。
     * またこのクライアントのゲーム実行は行われない(updateを含むイベントのfireはおきない)。
     */
    Game.prototype.terminateGame = function () {
        this._isTerminated = true;
        this._terminateGame();
    };
    /**
     * 画面更新が必要のフラグを設定する。
     */
    Game.prototype.modified = function () {
        this._modified = true;
    };
    /**
     * イベントを発生させる。
     *
     * ゲーム開発者は、このメソッドを呼び出すことで、エンジンに指定のイベントを発生させることができる。
     *
     * @param e 発生させるイベント
     */
    Game.prototype.raiseEvent = function (e) {
        this.handlerSet.raiseEvent(this._eventConverter.toPlaylogEvent(e));
    };
    /**
     * ティックを発生させる。
     *
     * ゲーム開発者は、このメソッドを呼び出すことで、エンジンに時間経過を要求することができる。
     * 現在のシーンのティック生成モード `Scene#tickGenerationMode` が `"manual"` でない場合、エラー。
     *
     * @param events そのティックで追加で発生させるイベント
     */
    Game.prototype.raiseTick = function (events) {
        if (events == null || !events.length) {
            this.handlerSet.raiseTick();
            return;
        }
        var plEvents = [];
        for (var i = 0; i < events.length; i++) {
            plEvents.push(this._eventConverter.toPlaylogEvent(events[i]));
        }
        this.handlerSet.raiseTick(plEvents);
    };
    /**
     * イベントフィルタを追加する。
     *
     * 一つ以上のイベントフィルタが存在する場合、このゲームで発生したイベントは、通常の処理の代わりにイベントフィルタに渡される。
     * エンジンは、イベントフィルタが戻り値として返したイベントを、まるでそのイベントが発生したかのように処理する。
     *
     * イベントフィルタはローカルイベントに対しても適用される。
     * イベントフィルタはローカルティック補間シーンやローカルシーンの間であっても適用される。
     * 複数のイベントフィルタが存在する場合、そのすべてが適用される。適用順は登録の順である。
     *
     * @param filter 追加するイベントフィルタ
     * @param handleEmpty イベントが存在しない場合でも定期的にフィルタを呼び出すか否か。省略された場合、偽。
     */
    Game.prototype.addEventFilter = function (filter, handleEmpty) {
        this.handlerSet.addEventFilter(filter, handleEmpty);
    };
    /**
     * イベントフィルタを削除する。
     *
     * @param filter 削除するイベントフィルタ
     */
    Game.prototype.removeEventFilter = function (filter) {
        this.handlerSet.removeEventFilter(filter);
    };
    /**
     * このインスタンスにおいてスナップショットの保存を行うべきかを返す。
     *
     * スナップショット保存に対応するゲームであっても、
     * 必ずしもすべてのインスタンスにおいてスナップショット保存を行うべきとは限らない。
     * たとえば多人数プレイ時には、複数のクライアントで同一のゲームが実行される。
     * スナップショットを保存するのはそのうちの一つのインスタンスのみでよい。
     * 本メソッドはそのような場合に、自身がスナップショットを保存すべきかどうかを判定するために用いることができる。
     *
     * スナップショット保存に対応するゲームは、このメソッドが真を返す時にのみ `Game#saveSnapshot()` を呼び出すべきである。
     * 戻り値は、スナップショットの保存を行うべきであれば真、でなければ偽である。
     *
     * @deprecated 非推奨である。`saveSnapshot()` (非推奨) の利用時にしか必要ないため。アクティブインスタンスの判定には `isActiveInstance()` を用いること。
     */
    Game.prototype.shouldSaveSnapshot = function () {
        return this.handlerSet.shouldSaveSnapshot();
    };
    /**
     * スナップショットを保存する。
     *
     * このメソッドは `Game#shouldSaveSnapshot()` が真を返す `Game` に対してのみ呼び出されるべきである。
     * そうでない場合、このメソッドの動作は不定である。
     *
     * このメソッドで保存されたスナップショットは、
     * main スクリプト (ゲーム開始時に最初に実行されるスクリプト) の関数に、
     * 引数 (の `snapshot` プロパティ) として与えられる場合がある。
     * (e.g. マルチプレイのゲームプレイ画面を途中から開いた場合)
     * スナップショットが与えられた場合、ゲームはそのスナップショットから保存時の実行状態を復元しなければならない。
     *
     * @param snapshot 保存するスナップショット。JSONとして妥当な値でなければならない。
     * @param timestamp 保存時の時刻。 `g.TimestampEvent` を利用するゲームの場合、それらと同じ基準の時間情報を与えなければならない。
     * @deprecated 非推奨である。互換性のために残されているが、この関数では適切なタイミングのスナップショット保存ができない場合がある。代わりに `requestSaveSnapshot()` を利用すること。
     */
    Game.prototype.saveSnapshot = function (snapshot, timestamp) {
        this.handlerSet.saveSnapshot(this.age, snapshot, this.random.serialize(), this._idx, timestamp);
    };
    /**
     * スナップショットを保存する。
     *
     * (`saveSnapshot()` と同じ機能だが、インターフェースが異なる。こちらを利用すること。)
     *
     * 引数として与えた関数 `func()` がフレームの終了時に呼び出される。
     * エンジンは、`func()` の返した値に基づいて、実行環境にスナップショットの保存を要求する。
     *
     * 保存されたスナップショットは、必要に応じてゲームの起動時に与えられる。
     * 詳細は `g.GameMainParameterObject` を参照のこと。
     *
     * このメソッドを 1 フレーム中に複数回呼び出した場合、引数に与えた関数 `func()` の呼び出し順は保証されない。
     * (スナップショットはフレームごとに定まるので、1フレーム中に複数回呼び出す必要はない。)
     *
     * @param func フレーム終了時に呼び出す関数。 `SnapshotSaveRequest` を返した場合、スナップショット保存が要求される。
     * @param owner func の呼び出し時に `this` として使われる値。指定しなかった場合、 `undefined` 。
     */
    Game.prototype.requestSaveSnapshot = function (func, owner) {
        var _this = this;
        // 他の箇所と異なり push でなく unshift しているのは、他の処理 (シーン遷移処理) と重なった時に先行するため。
        // 効率はよくないが、このメソッドの利用頻度は高くないので許容。
        this._postTickTasks.unshift({
            type: 3 /* PostTickTaskType.Call */,
            fun: function () {
                if (!_this.handlerSet.shouldSaveSnapshot())
                    return;
                var req = func.call(owner);
                if (!req)
                    return; // (null に限らず) falsy は全部弾く。空の値を保存しても不具合の温床にしかならないため。
                _this.handlerSet.saveSnapshot(_this.age, req.snapshot, _this.random.serialize(), _this._idx, req.timestamp);
            },
            owner: null
        });
    };
    /**
     * 現在時刻を取得する。
     *
     * 値は1970-01-01T00:00:00Zからのミリ秒での経過時刻である。
     * `Date.now()` と異なり、この値は消化されたティックの数から算出される擬似的な時刻である。
     */
    Game.prototype.getCurrentTime = function () {
        return this.handlerSet.getCurrentTime();
    };
    /**
     * このインスタンスがアクティブインスタンスであるかどうか返す。
     *
     * ゲーム開発者は、この値の真偽に起因する処理で、ゲームのローカルな実行状態を変更してはならず、
     * `raiseEvent()` などによって、グローバルな状態を更新する必要がある。
     */
    Game.prototype.isActiveInstance = function () {
        return this.handlerSet.getInstanceType() === "active";
    };
    /**
     * @ignore
     */
    Game.prototype._pushPostTickTask = function (fun, owner) {
        this._postTickTasks.push({
            type: 3 /* PostTickTaskType.Call */,
            fun: fun,
            owner: owner
        });
    };
    /**
     * @ignore
     */
    Game.prototype._popSceneRaw = function (preserveCurrent) {
        this._postTickTasks.push({ type: 4 /* PostTickTaskType.PopSceneRaw */, preserveCurrent: preserveCurrent });
    };
    /**
     * @private
     */
    Game.prototype._normalizeConfiguration = function (gameConfiguration) {
        if (!gameConfiguration)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: invalid arguments");
        if (gameConfiguration.assets == null)
            gameConfiguration.assets = {};
        if (gameConfiguration.fps == null)
            gameConfiguration.fps = 30;
        if (typeof gameConfiguration.fps !== "number")
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: fps must be given as a number");
        if (!(0 <= gameConfiguration.fps && gameConfiguration.fps <= 60))
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: fps must be a number in (0, 60].");
        if (typeof gameConfiguration.width !== "number")
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: width must be given as a number");
        if (typeof gameConfiguration.height !== "number")
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_normalizeConfiguration: height must be given as a number");
        return gameConfiguration;
    };
    /**
     * @private
     */
    Game.prototype._setAudioPlaybackRate = function (playbackRate) {
        this.audio._setPlaybackRate(playbackRate);
    };
    /**
     * @private
     */
    Game.prototype._startSuppressAudio = function () {
        this.audio._startSuppress();
    };
    /**
     * @private
     */
    Game.prototype._endSuppressAudio = function () {
        this.audio._endSuppress();
    };
    /**
     * @private
     */
    Game.prototype._setMuted = function (muted) {
        this.audio._setMuted(muted);
    };
    /**
     * g.OperationEventのデータをデコードする。
     * @private
     */
    Game.prototype._decodeOperationPluginOperation = function (code, op) {
        var plugin = this.operationPluginManager.plugins[code];
        if (!plugin || !plugin.decode)
            return op;
        return plugin.decode(op);
    };
    /**
     * ゲーム状態のリセット。
     * @private
     */
    Game.prototype._reset = function (param) {
        this.operationPluginManager.reset();
        this.operationPluginManager.onOperate.add(this._onOperationPluginOperated.fire, this._onOperationPluginOperated);
        if (this.scene()) {
            while (this.scene() !== this._initialScene) {
                this._popSceneRaw(false);
                this._flushPostTickTasks();
            }
            if (!this.isLoaded) {
                // _initialSceneの読み込みが終わっていない: _initialScene自体は使い回すので単にpopする。
                this.scenes.pop();
            }
        }
        if (this._skippingScene && !this._skippingScene.destroyed()) {
            this._skippingScene.destroy();
        }
        if (param) {
            if (param.age !== undefined)
                this.age = param.age;
            if (param.nextEntityId !== undefined)
                this._idx = param.nextEntityId;
            if (param.randGenSer !== undefined) {
                this.random = XorshiftRandomGenerator_1.XorshiftRandomGenerator.deserialize(param.randGenSer);
            }
            else if (param.randSeed !== undefined) {
                this.random = new XorshiftRandomGenerator_1.XorshiftRandomGenerator(param.randSeed);
            }
        }
        this.audio._reset();
        this._onLoad.removeAll({ func: this._handleLoad, owner: this });
        this.onJoin.removeAll();
        this.onLeave.removeAll();
        this.onSeed.removeAll();
        this.onResized.removeAll();
        this.onSkipChange.removeAll();
        this.onSceneChange.removeAll();
        this.onUpdate.removeAll();
        this.handlerSet.removeAllEventFilters();
        this.isSkipping = false;
        this.onSkipChange.add(this._handleSkipChange, this);
        this.joinedPlayerIds = [];
        this.onJoin.add(this._handleJoinEvent, this);
        this.onLeave.add(this._handleLeaveEvent, this);
        this._idx = 0;
        this._localIdx = 0;
        this._cameraIdx = 0;
        this.db = new WeakRefKVS_1.WeakRefKVS();
        this._localDb = new WeakRefKVS_1.WeakRefKVS();
        this._modified = true;
        this.loadingScene = undefined;
        this._skippingScene = undefined;
        this._focusingCamera = undefined;
        this.lastLocalTickMode = null;
        this.lastTickGenerationMode = null;
        this.onSnapshotRequest.removeAll();
        this._postTickTasks = [];
        this._toBeDestroyedScenes = [];
        this._eventConverter = new EventConverter_1.EventConverter({ game: this, playerId: this.selfId }); // TODO: selfId が null のときの挙動
        // TODO: selfId が null のときの挙動
        this._pointEventResolver = new PointEventResolver_1.PointEventResolver({
            sourceResolver: this,
            playerId: this.selfId,
            maxPoints: this._configuration.maxPoints
        });
        // ES5だとNumber.MAX_SAFE_INTEGERは使えないのでその値(9007199254740991)を直接かける
        this.localRandom = new XorshiftRandomGenerator_1.XorshiftRandomGenerator(Math.floor(9007199254740991 * Math.random()));
        this._isTerminated = false;
        this.vars = {};
        this._moduleManager = new ModuleManager_1.ModuleManager(this._runtimeValueBase, this._assetManager);
        this.surfaceAtlasSet.destroy();
        this.surfaceAtlasSet = new SurfaceAtlasSet_1.SurfaceAtlasSet({ resourceFactory: this.resourceFactory });
        switch (this._configuration.defaultLoadingScene) {
            case "none":
                // Note: 何も描画しない実装として利用している
                this._defaultLoadingScene = new LoadingScene_1.LoadingScene({ game: this });
                break;
            case "compact":
                this._defaultLoadingScene = new DefaultLoadingScene_1.DefaultLoadingScene({ game: this, style: "compact" });
                break;
            default:
                this._defaultLoadingScene = new DefaultLoadingScene_1.DefaultLoadingScene({ game: this });
                break;
        }
        switch (this._configuration.defaultSkippingScene) {
            case "none":
                this._defaultSkippingScene = new DefaultSkippingScene_1.DefaultSkippingScene({ game: this, style: "none" });
                break;
            case "indicator":
                this._defaultSkippingScene = new DefaultSkippingScene_1.DefaultSkippingScene({ game: this, style: "indicator" });
                break;
            default:
                this._defaultSkippingScene = undefined;
                break;
        }
    };
    /**
     * ゲームを破棄する。
     * エンジンユーザとコンテンツに開放された一部プロパティ(external, vars)は維持する点に注意。
     * @private
     */
    Game.prototype._destroy = function () {
        // ユーザコードを扱う操作プラグインを真っ先に破棄
        this.operationPluginManager.destroy();
        // 到達できるシーンを全て破棄
        if (this.scene()) {
            while (this.scene() !== this._initialScene) {
                this.popScene();
                this._flushPostTickTasks();
            }
        }
        this._initialScene.destroy();
        if (this.loadingScene && !this.loadingScene.destroyed()) {
            this.loadingScene.destroy();
        }
        if (!this._defaultLoadingScene.destroyed()) {
            this._defaultLoadingScene.destroy();
        }
        if (this._defaultSkippingScene && !this._defaultSkippingScene.destroyed()) {
            this._defaultSkippingScene.destroy();
        }
        if (this._skippingScene && !this._skippingScene.destroyed()) {
            this._skippingScene.destroy();
        }
        // NOTE: fps, width, height, external, vars はそのまま保持しておく
        this.db = undefined;
        this.renderers = undefined;
        this.scenes = undefined;
        this.random = undefined;
        this._modified = false;
        this.age = 0;
        this.assets = undefined; // this._initialScene.assets のエイリアスなので、特に破棄処理はしない。
        this.isLoaded = false;
        this.loadingScene = undefined;
        this.assetBase = "";
        this.selfId = undefined;
        this.audio.music.stopAll();
        this.audio.sound.stopAll();
        this.audio = undefined;
        this.defaultAudioSystemId = undefined;
        this.handlerSet = undefined;
        this.localRandom = undefined;
        this.onJoin.destroy();
        this.onJoin = undefined;
        this.onLeave.destroy();
        this.onLeave = undefined;
        this.onSeed.destroy();
        this.onSeed = undefined;
        this.onPlayerInfo.destroy();
        this.onPlayerInfo = undefined;
        this.onResized.destroy();
        this.onResized = undefined;
        this.onSkipChange.destroy();
        this.onSkipChange = undefined;
        this.onSceneChange.destroy();
        this.onSceneChange = undefined;
        this.onUpdate.destroy();
        this.onUpdate = undefined;
        this.onSnapshotRequest.destroy();
        this.onSnapshotRequest = undefined;
        this.join = undefined;
        this.leave = undefined;
        this.seed = undefined;
        this.playerInfo = undefined;
        this.snapshotRequest = undefined;
        this.resized = undefined;
        this.skippingChanged = undefined;
        this._sceneChanged = undefined;
        this._loaded = undefined;
        this._started = undefined;
        this._operationPluginOperated = undefined;
        this._onSceneChange.destroy();
        this._onSceneChange = undefined;
        this._onLoad.destroy();
        this._onLoad = undefined;
        this._onStart.destroy();
        this._onStart = undefined;
        // TODO より能動的にdestroy処理を入れるべきかもしれない
        this.resourceFactory = undefined;
        this.storage = undefined;
        this.playId = undefined;
        this.operationPlugins = undefined; // this._operationPluginManager.pluginsのエイリアスなので、特に破棄処理はしない。
        this._eventTriggerMap = undefined;
        this._initialScene = undefined;
        this._defaultLoadingScene = undefined;
        this._main = undefined;
        this._mainFunc = undefined;
        this._mainParameter = undefined;
        this._assetManager.destroy();
        this._assetManager = undefined;
        this._eventConverter = undefined;
        this._pointEventResolver = undefined;
        this.operationPluginManager = undefined;
        this._onOperationPluginOperated.destroy();
        this._onOperationPluginOperated = undefined;
        this._idx = 0;
        this._localDb = undefined;
        this._localIdx = 0;
        this._cameraIdx = 0;
        this._isTerminated = true;
        this._focusingCamera = undefined;
        this._skippingScene = undefined;
        this._configuration = undefined;
        this._postTickTasks = undefined;
        this.surfaceAtlasSet.destroy();
        this.surfaceAtlasSet = undefined;
        this._moduleManager = undefined;
    };
    /**
     * ゲームを開始する。
     *
     * 存在するシーンをすべて(_initialScene以外; あるなら)破棄し、グローバルアセットを読み込み、完了後ゲーム開発者の実装コードの実行を開始する。
     * このメソッドの二度目以降の呼び出しの前には、 `this._reset()` を呼び出す必要がある。
     * @param param ゲームのエントリポイントに渡す値
     * @private
     */
    Game.prototype._loadAndStart = function (param) {
        this._mainParameter = param || {};
        if (!this.isLoaded) {
            this._onLoad.add(this._handleLoad, this);
            this.pushScene(this._initialScene);
            this._flushPostTickTasks();
        }
        else {
            this._handleLoad();
        }
    };
    /**
     * グローバルアセットの読み込みを開始する。
     * 単体テスト用 (mainSceneなど特定アセットの存在を前提にする_loadAndStart()はテストに使いにくい) なので、通常ゲーム開発者が利用することはない
     * @private
     */
    Game.prototype._startLoadingGlobalAssets = function () {
        if (this.isLoaded)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_startLoadingGlobalAssets: already loaded.");
        this.pushScene(this._initialScene);
        this._flushPostTickTasks();
    };
    /**
     * @private
     */
    Game.prototype._updateEventTriggers = function (scene) {
        this._modified = true;
        if (!scene) {
            this._eventTriggerMap.message = undefined;
            this._eventTriggerMap["point-down"] = undefined;
            this._eventTriggerMap["point-move"] = undefined;
            this._eventTriggerMap["point-up"] = undefined;
            this._eventTriggerMap.operation = undefined;
            return;
        }
        this._eventTriggerMap.message = scene.onMessage;
        this._eventTriggerMap["point-down"] = scene.onPointDownCapture;
        this._eventTriggerMap["point-move"] = scene.onPointMoveCapture;
        this._eventTriggerMap["point-up"] = scene.onPointUpCapture;
        this._eventTriggerMap.operation = scene.onOperation;
        scene._activate();
    };
    /**
     * @private
     */
    Game.prototype._handleInitialSceneLoad = function () {
        this._initialScene.onLoad.remove(this._handleInitialSceneLoad, this);
        this.assets = this._initialScene.assets;
        this.isLoaded = true;
        this._onLoad.fire(this);
    };
    /**
     * @ignore
     */
    Game.prototype._handleOperationPluginOperated = function (op) {
        var pev = this._eventConverter.makePlaylogOperationEvent(op);
        this.handlerSet.raiseEvent(pev);
    };
    /**
     * @ignore
     */
    Game.prototype._handleSceneChanged = function (scene) {
        this._updateEventTriggers(scene);
        var local = scene ? scene.local : "full-local";
        var tickGenerationMode = scene ? scene.tickGenerationMode : "by-clock";
        if (this.lastLocalTickMode === local && this.lastTickGenerationMode === tickGenerationMode) {
            return;
        }
        this.lastLocalTickMode = local;
        this.lastTickGenerationMode = tickGenerationMode;
        this.handlerSet.changeSceneMode({
            local: local,
            tickGenerationMode: tickGenerationMode
        });
    };
    /**
     * @ignore
     */
    Game.prototype._handleSkippingSceneReady = function (scene) {
        this._pushPostTickTask(scene._fireLoaded, scene);
    };
    /**
     * @private
     */
    Game.prototype._terminateGame = function () {
        // do nothing.
    };
    /**
     * post-tick タスクを実行する。
     *
     * `pushScene()` などのシーン遷移や `_pushPostTickTask()` によって要求された post-tick タスクを実行する。
     * 通常このメソッドは、毎フレーム一度、フレームの最後に呼び出されることを期待する (`Game#tick()` がこの呼び出しを行う)。
     * ただしゲーム開始時 (グローバルアセット読み込み・スナップショットローダ起動後またはmainScene実行開始時) に関しては、
     * シーン追加がゲーム開発者の記述によらない (`tick()` の外側である) ため、それぞれの箇所で明示的にこのメソッドを呼び出す。
     * @private
     */
    Game.prototype._flushPostTickTasks = function () {
        do {
            var reqs = this._postTickTasks;
            this._postTickTasks = [];
            for (var i = 0; i < reqs.length; ++i) {
                var req = reqs[i];
                switch (req.type) {
                    case 0 /* PostTickTaskType.PushScene */:
                        var oldScene = this.scene();
                        if (oldScene) {
                            oldScene._deactivate();
                        }
                        this._doPushScene(req.scene, false);
                        break;
                    case 1 /* PostTickTaskType.ReplaceScene */:
                        // NOTE: replaceSceneの場合、pop時点では_sceneChangedをfireしない。_doPushScene() で一度だけfireする。
                        this._doPopScene(req.preserveCurrent, false, false);
                        this._doPushScene(req.scene, false);
                        break;
                    case 2 /* PostTickTaskType.PopScene */:
                        this._doPopScene(req.preserveCurrent, false, true);
                        break;
                    case 3 /* PostTickTaskType.Call */:
                        req.fun.call(req.owner);
                        break;
                    case 4 /* PostTickTaskType.PopSceneRaw */:
                        this._doPopScene(req.preserveCurrent, true, true);
                        break;
                    default:
                        throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_flushPostTickTasks: unknown post-tick task type.");
                }
            }
        } while (this._postTickTasks.length > 0); // flush中に追加される限りflushを続行する
        if (this._toBeDestroyedScenes.length > 0) {
            for (var _i = 0, _a = this._toBeDestroyedScenes; _i < _a.length; _i++) {
                var scene = _a[_i];
                scene.destroy();
            }
            this._toBeDestroyedScenes = [];
        }
    };
    /**
     * @ignore
     */
    Game.prototype._handleSkipChange = function (isSkipping) {
        var _a;
        this.isSkipping = isSkipping;
        if (isSkipping) {
            var skippingScene = (_a = this._skippingScene) !== null && _a !== void 0 ? _a : this._defaultSkippingScene;
            if (skippingScene && !skippingScene._loaded) {
                skippingScene._load();
                skippingScene._onReady.addOnce(this._handleSkippingSceneReady, this);
            }
        }
        this._cleanDB();
        this._modified = true;
    };
    /**
     * @ignore
     */
    Game.prototype._handleJoinEvent = function (event) {
        if (!event.player.id || this.joinedPlayerIds.indexOf(event.player.id) !== -1) {
            return;
        }
        this.joinedPlayerIds.push(event.player.id);
    };
    /**
     * @ignore
     */
    Game.prototype._handleLeaveEvent = function (event) {
        this.joinedPlayerIds = this.joinedPlayerIds.filter(function (id) { return id !== event.player.id; });
    };
    /**
     * シーンスタックからシーンを取り除く。
     *
     * @ignore
     * @param preserveCurrent 取り除いたシーンを破棄せずそのままにするか
     * @param raw (ローディングシーンを考慮せず)そのまま取り除くか。偽の場合、シーンスタックトップのローディングシーンを全て除いてから取り除く
     * @param fireSceneChanged onSceneChangeをfireして通知するか
     */
    Game.prototype._doPopScene = function (preserveCurrent, raw, fireSceneChanged) {
        var _a;
        var scene = this.scenes.pop();
        if (!raw) {
            while (scene && scene instanceof LoadingScene_1.LoadingScene) {
                scene._clearTargetScene();
                scene = this.scenes.pop();
            }
        }
        if (!scene)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_doPopScene: invalid call; scene stack underflow");
        if (scene === this._initialScene)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_doPopScene: invalid call; attempting to pop the initial scene");
        if (!preserveCurrent) {
            if (!this._toBeDestroyedScenes.includes(scene)) {
                this._toBeDestroyedScenes.push(scene);
            }
        }
        if (!raw) {
            // 取り除いた結果スタックトップがロード中のシーンになった場合はローディングシーンを積み直す
            var nextScene = this.scene();
            if (nextScene && nextScene._needsLoading() && nextScene._loadingState !== "loaded-fired") {
                var loadingScene = (_a = this.loadingScene) !== null && _a !== void 0 ? _a : this._defaultLoadingScene;
                this._doPushScene(loadingScene, true, this._defaultLoadingScene);
                loadingScene.reset(nextScene);
            }
        }
        if (fireSceneChanged) {
            var nextScene = this.scene();
            this.onSceneChange.fire(nextScene);
            this._onSceneChange.fire(nextScene);
        }
    };
    Game.prototype._handleLoad = function () {
        var operationPluginsField = this._configuration.operationPlugins || [];
        // `game.json` の `operationPlugins` フィールドの登録は `game._onLoad` のfire後でなければならない。
        for (var _i = 0, operationPluginsField_1 = operationPluginsField; _i < operationPluginsField_1.length; _i++) {
            var pluginInfo = operationPluginsField_1[_i];
            if (!pluginInfo.script)
                continue;
            var pluginClass = this._moduleManager._require(pluginInfo.script);
            var plugin = this.operationPluginManager.register(pluginClass, pluginInfo.code, pluginInfo.option);
            if (!pluginInfo.manualStart && plugin) {
                plugin.start();
            }
        }
        this.operationPlugins = this.operationPluginManager.plugins;
        var preloadAssetIds = this._assetManager.preloadScriptAssetIds();
        for (var _a = 0, preloadAssetIds_1 = preloadAssetIds; _a < preloadAssetIds_1.length; _a++) {
            var preloadAssetId = preloadAssetIds_1[_a];
            var fun = this._moduleManager._require(preloadAssetId);
            if (!fun || typeof fun !== "function")
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_handleLoad: ".concat(preloadAssetId, " has no-exported function."));
            fun();
        }
        if (this._mainFunc) {
            this._mainFunc(this._runtimeValueBase, this._mainParameter || {});
        }
        else if (this._main) {
            var mainFun = this._moduleManager._require(this._main);
            if (!mainFun || typeof mainFun !== "function")
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_handleLoad: Entry point ".concat(this._main, " not found."));
            mainFun(this._mainParameter);
        }
        else {
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_handleLoad: does not have an entry point");
        }
        this._flushPostTickTasks(); // シーン遷移を要求する可能性がある(というかまずする)
        this._onStart.fire();
    };
    /**
     * シーンをシーンスタックに追加する。
     *
     * @ignore
     * @param scene 追加するシーン
     * @param raw (ローディングシーンを考慮せず)そのまま追加するか。偽の場合、スタックトップのローディングシーンを除いてから追加する
     * @param loadingScene ロードが必要な場合に利用するローディングシーン
     */
    Game.prototype._doPushScene = function (scene, raw, loadingScene) {
        var scenes = this.scenes;
        if (!raw) {
            while (scenes.length > 0 && scenes[scenes.length - 1] instanceof LoadingScene_1.LoadingScene) {
                var top = scenes.pop();
                top._clearTargetScene();
            }
        }
        if (!loadingScene)
            loadingScene = this.loadingScene || this._defaultLoadingScene;
        scenes.push(scene);
        if (scene._needsLoading() && scene._loadingState !== "loaded-fired") {
            if (this._defaultLoadingScene._needsLoading())
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Game#_doPushScene: _defaultLoadingScene must not depend on any assets/storages.");
            this._doPushScene(loadingScene, true, this._defaultLoadingScene);
            loadingScene.reset(scene);
        }
        else {
            this.onSceneChange.fire(scene);
            this._onSceneChange.fire(scene);
            // 読み込み待ちのアセットがなければその場で(loadingSceneに任せず)ロード、SceneReadyを発生させてからLoadingSceneEndを起こす。
            if (!scene._loaded) {
                scene._load();
                this._pushPostTickTask(scene._fireLoaded, scene);
            }
        }
        this._modified = true;
    };
    Game.prototype._cleanDB = function () {
        this.db.clean();
        this._localDb.clean();
    };
    return Game;
}());
exports.Game = Game;

},{"./AssetManager":7,"./AudioSystemManager":11,"./DefaultLoadingScene":17,"./DefaultSkippingScene":18,"./EventConverter":23,"./ExceptionFactory":28,"./LoadingScene":34,"./ModuleManager":38,"./OperationPluginManager":42,"./PointEventResolver":47,"./Scene":52,"./Storage":57,"./SurfaceAtlasSet":59,"./WeakRefKVS":71,"./XorshiftRandomGenerator":73,"@akashic/trigger":213}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],34:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingScene = void 0;
var trigger_1 = require("@akashic/trigger");
var ExceptionFactory_1 = require("./ExceptionFactory");
var Scene_1 = require("./Scene");
/**
 * Assetの読み込み中に表示されるシーン。
 *
 * 本シーンは通常のシーンと異なり、ゲーム内時間(`Game#age`)と独立に実行される。
 * アセットやストレージデータを読み込んでいる間、ゲーム内時間が進んでいない状態でも、
 * `LoadingScene` は画面に変化を与えることができる(`update` がfireされる)。
 *
 * ゲーム開発者は、ローディング中の演出を実装した独自の `LoadingScene` を
 * `Game#loadingScene` に代入することでエンジンに利用させることができる。
 *
 * ゲーム内時間と独立に処理される `LoadingScene` での処理には再現性がない(他プレイヤーと状態が共有されない)。
 * そのため `Game` に対して副作用のある操作を行ってはならない点に注意すること。
 */
var LoadingScene = /** @class */ (function (_super) {
    __extends(LoadingScene, _super);
    /**
     * `LoadingScene` のインスタンスを生成する。
     * @param param 初期化に用いるパラメータのオブジェクト
     */
    function LoadingScene(param) {
        var _this = this;
        param.local = true; // LoadingScene は強制的にローカルにする
        _this = _super.call(this, param) || this;
        _this.onTargetReset = new trigger_1.Trigger();
        _this.onTargetReady = new trigger_1.Trigger();
        _this.onTargetAssetLoad = new trigger_1.Trigger();
        _this.targetReset = _this.onTargetReset;
        _this.targetReady = _this.onTargetReady;
        _this.targetAssetLoaded = _this.onTargetAssetLoad;
        _this._explicitEnd = !!param.explicitEnd;
        _this._targetScene = undefined;
        return _this;
    }
    LoadingScene.prototype.destroy = function () {
        this._clearTargetScene();
        _super.prototype.destroy.call(this);
    };
    /**
     * アセットロード待ち対象シーンを変更する。
     *
     * このメソッドは、新たにシーンのロード待ちが必要になった場合にエンジンによって呼び出される。
     * (派生クラスはこの処理をオーバーライドしてもよいが、その場合その中で
     * このメソッド自身 (`g.LoadingScene.prototype.reset`) を呼び出す (`call()` する) 必要がある。)
     *
     * @param targetScene アセットロード待ちが必要なシーン
     */
    LoadingScene.prototype.reset = function (targetScene) {
        this._clearTargetScene();
        this._targetScene = targetScene;
        if (this._loadingState !== "loaded-fired") {
            this.onLoad.addOnce(this._doReset, this);
        }
        else {
            this._doReset();
        }
    };
    /**
     * アセットロード待ち対象シーンの残りのロード待ちアセット数を取得する。
     */
    LoadingScene.prototype.getTargetWaitingAssetsCount = function () {
        return this._targetScene ? this._targetScene._sceneAssetHolder.waitingAssetsCount : 0;
    };
    /**
     * ローディングシーンを終了する。
     *
     * `Scene#end()` と異なり、このメソッドの呼び出しはこのシーンを破棄しない。(ローディングシーンは再利用される。)
     * このメソッドが呼び出される時、 `targetReady` がfireされた後でなければならない。
     */
    LoadingScene.prototype.end = function () {
        if (!this._targetScene || this._targetScene._loadingState === "initial") {
            var state = this._targetScene ? this._targetScene._loadingState : "(no scene)";
            var msg = "LoadingScene#end(): the target scene is in invalid state: " + state;
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError(msg);
        }
        this.game._popSceneRaw(true);
        this.game._pushPostTickTask(this._targetScene._fireLoaded, this._targetScene);
        this._clearTargetScene();
    };
    /**
     * @private
     */
    LoadingScene.prototype._clearTargetScene = function () {
        if (!this._targetScene)
            return;
        this.onLoad.removeAll({ owner: this, func: this._doReset });
        this._targetScene._onReady.removeAll({ owner: this });
        this._targetScene.onAssetLoad.removeAll({ owner: this });
        this._targetScene = undefined;
    };
    /**
     * @private
     */
    LoadingScene.prototype._doReset = function () {
        this.onTargetReset.fire(this._targetScene);
        if (this._targetScene._loadingState === "initial" || this._targetScene._loadingState === "ready") {
            this._targetScene._onReady.add(this._handleReady, this);
            this._targetScene.onAssetLoad.add(this._handleAssetLoad, this);
            this._targetScene._load();
        }
        else {
            this._handleReady(this._targetScene);
        }
    };
    /**
     * @private
     */
    LoadingScene.prototype._handleAssetLoad = function (asset) {
        this.onTargetAssetLoad.fire(asset);
    };
    /**
     * @private
     */
    LoadingScene.prototype._handleReady = function (scene) {
        this.onTargetReady.fire(scene);
        if (!this._explicitEnd) {
            this.end();
        }
    };
    return LoadingScene;
}(Scene_1.Scene));
exports.LoadingScene = LoadingScene;

},{"./ExceptionFactory":28,"./Scene":52,"@akashic/trigger":213}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlainMatrix = void 0;
/**
 * 変換行列を一般的なJavaScriptのみで表したクラス。
 * 通常ゲーム開発者が本クラスを直接利用する事はない。
 * 各フィールド、メソッドの詳細は `Matrix` インターフェースの説明を参照。
 */
var PlainMatrix = /** @class */ (function () {
    function PlainMatrix(widthOrSrc, height, scaleX, scaleY, angle, anchorX, anchorY) {
        // TODO: (GAMEDEV-845) Float32Arrayの方が速いらしいので、polyfillして使うかどうか検討
        if (widthOrSrc === undefined) {
            this._modified = false;
            this._matrix = [1, 0, 0, 1, 0, 0];
        }
        else if (typeof widthOrSrc === "number") {
            this._modified = false;
            // TODO: [0, 0, 0, 0, 0, 0]と速度比較
            this._matrix = new Array(6);
            // @ts-ignore
            this.update(widthOrSrc, height, scaleX, scaleY, angle, 0, 0, anchorX, anchorY);
        }
        else {
            this._modified = widthOrSrc._modified;
            this._matrix = [
                widthOrSrc._matrix[0],
                widthOrSrc._matrix[1],
                widthOrSrc._matrix[2],
                widthOrSrc._matrix[3],
                widthOrSrc._matrix[4],
                widthOrSrc._matrix[5]
            ];
        }
    }
    PlainMatrix.prototype.update = function (width, height, scaleX, scaleY, angle, x, y, anchorX, anchorY) {
        if (anchorX == null || anchorY == null) {
            this._updateWithoutAnchor(width, height, scaleX, scaleY, angle, x, y);
            return;
        }
        // ここで求める変換行列Mは、引数で指定された変形を、拡大・回転・平行移動の順に適用するものである。
        // 変形の原点は (anchorX * width, anchorY * height) である。従って
        //    M = A^-1 T R S A
        // である。ただしここでA, S, R, Tは、それぞれ以下を表す変換行列である:
        //    A: アンカーを原点に移す(平行移動する)変換
        //    S: X軸方向にscaleX倍、Y軸方向にscaleY倍する変換
        //    R: angle度だけ回転する変換
        //    T: x, yの値だけ平行移動する変換
        // それらは次のように表せる:
        //           1    0   -w           sx    0    0            c   -s    0            1    0    x
        //    A = [  0    1   -h]    S = [  0   sy    0]    R = [  s    c    0]    T = [  0    1    y]
        //           0    0    1            0    0    1            0    0    1            0    0    1
        // ここで sx, sy は scaleX, scaleY であり、c, s は cos(theta), sin(theta)
        // (ただし theta = angle * PI / 180)、w = anchorX * width, h = anchorY * height である。
        // 以下の実装は、M の各要素をそれぞれ計算して直接求めている。
        var r = (angle * Math.PI) / 180;
        var _cos = Math.cos(r);
        var _sin = Math.sin(r);
        var a = _cos * scaleX;
        var b = _sin * scaleX;
        var c = _sin * scaleY;
        var d = _cos * scaleY;
        var w = anchorX * width;
        var h = anchorY * height;
        this._matrix[0] = a;
        this._matrix[1] = b;
        this._matrix[2] = -c;
        this._matrix[3] = d;
        this._matrix[4] = -a * w + c * h + x;
        this._matrix[5] = -b * w - d * h + y;
    };
    /**
     * このメソッドは anchorX, anchorY が存在しなかった当時との互換性のため存在する。将来この互換性を破棄する時に削除する予定である。
     * @private
     */
    PlainMatrix.prototype._updateWithoutAnchor = function (width, height, scaleX, scaleY, angle, x, y) {
        // ここで求める変換行列Mは、引数で指定された変形を、拡大・回転・平行移動の順に適用するものである。
        // 変形の原点は引数で指定された矩形の中心、すなわち (width/2, height/2) の位置である。従って
        //    M = A^-1 T R S A
        // である。ただしここでA, S, R, Tは、それぞれ以下を表す変換行列である:
        //    A: 矩形の中心を原点に移す(平行移動する)変換
        //    S: X軸方向にscaleX倍、Y軸方向にscaleY倍する変換
        //    R: angle度だけ回転する変換
        //    T: x, yの値だけ平行移動する変換
        // それらは次のように表せる:
        //           1    0   -w           sx    0    0            c   -s    0            1    0    x
        //    A = [  0    1   -h]    S = [  0   sy    0]    R = [  s    c    0]    T = [  0    1    y]
        //           0    0    1            0    0    1            0    0    1            0    0    1
        // ここで sx, sy は scaleX, scaleY であり、c, s は cos(theta), sin(theta)
        // (ただし theta = angle * PI / 180)、w = (width / 2), h = (height / 2) である。
        // 以下の実装は、M の各要素をそれぞれ計算して直接求めている。
        var r = (angle * Math.PI) / 180;
        var _cos = Math.cos(r);
        var _sin = Math.sin(r);
        var a = _cos * scaleX;
        var b = _sin * scaleX;
        var c = _sin * scaleY;
        var d = _cos * scaleY;
        var w = width / 2;
        var h = height / 2;
        this._matrix[0] = a;
        this._matrix[1] = b;
        this._matrix[2] = -c;
        this._matrix[3] = d;
        this._matrix[4] = -a * w + c * h + w + x;
        this._matrix[5] = -b * w - d * h + h + y;
    };
    PlainMatrix.prototype.updateByInverse = function (width, height, scaleX, scaleY, angle, x, y, anchorX, anchorY) {
        if (anchorX == null || anchorY == null) {
            this._updateByInverseWithoutAnchor(width, height, scaleX, scaleY, angle, x, y);
            return;
        }
        // ここで求める変換行列は、update() の求める行列Mの逆行列、M^-1である。update() のコメントに記述のとおり、
        //    M = A^-1 T R S A
        // であるから、
        //    M^-1 = A^-1 S^-1 R^-1 T^-1 A
        // それぞれは次のように表せる:
        //              1    0    w             1/sx     0    0               c    s    0               1    0   -x+w
        //    A^-1 = [  0    1    h]    S^-1 = [   0  1/sy    0]    R^-1 = [ -s    c    0]    T^-1 = [  0    1   -y+h]
        //              0    0    1                0     0    1               0    0    1               0    0    1
        // ここで各変数は update() のコメントのものと同様である。
        // 以下の実装は、M^-1 の各要素をそれぞれ計算して直接求めている。
        var r = (angle * Math.PI) / 180;
        var _cos = Math.cos(r);
        var _sin = Math.sin(r);
        var a = _cos / scaleX;
        var b = _sin / scaleY;
        var c = _sin / scaleX;
        var d = _cos / scaleY;
        var w = anchorX * width;
        var h = anchorY * height;
        this._matrix[0] = a;
        this._matrix[1] = -b;
        this._matrix[2] = c;
        this._matrix[3] = d;
        this._matrix[4] = -a * x - c * y + w;
        this._matrix[5] = b * x - d * y + h;
    };
    /**
     * このメソッドは anchorX, anchorY が存在しなかった当時との互換性のため存在する。将来この互換性を破棄する時に削除する予定である。
     * @private
     */
    PlainMatrix.prototype._updateByInverseWithoutAnchor = function (width, height, scaleX, scaleY, angle, x, y) {
        // ここで求める変換行列は、update() の求める行列Mの逆行列、M^-1である。update() のコメントに記述のとおり、
        //    M = A^-1 T R S A
        // であるから、
        //    M^-1 = A^-1 S^-1 R^-1 T^-1 A
        // それぞれは次のように表せる:
        //              1    0    w             1/sx     0    0               c    s    0               1    0   -x
        //    A^-1 = [  0    1    h]    S^-1 = [   0  1/sy    0]    R^-1 = [ -s    c    0]    T^-1 = [  0    1   -y]
        //              0    0    1                0     0    1               0    0    1               0    0    1
        // ここで各変数は update() のコメントのものと同様である。
        // 以下の実装は、M^-1 の各要素をそれぞれ計算して直接求めている。
        var r = (angle * Math.PI) / 180;
        var _cos = Math.cos(r);
        var _sin = Math.sin(r);
        var a = _cos / scaleX;
        var b = _sin / scaleY;
        var c = _sin / scaleX;
        var d = _cos / scaleY;
        var w = width / 2;
        var h = height / 2;
        this._matrix[0] = a;
        this._matrix[1] = -b;
        this._matrix[2] = c;
        this._matrix[3] = d;
        this._matrix[4] = -a * (w + x) - c * (h + y) + w;
        this._matrix[5] = b * (w + x) - d * (h + y) + h;
    };
    PlainMatrix.prototype.multiply = function (matrix) {
        var m1 = this._matrix;
        var m2 = matrix._matrix;
        var m10 = m1[0];
        var m11 = m1[1];
        var m12 = m1[2];
        var m13 = m1[3];
        m1[0] = m10 * m2[0] + m12 * m2[1];
        m1[1] = m11 * m2[0] + m13 * m2[1];
        m1[2] = m10 * m2[2] + m12 * m2[3];
        m1[3] = m11 * m2[2] + m13 * m2[3];
        m1[4] = m10 * m2[4] + m12 * m2[5] + m1[4];
        m1[5] = m11 * m2[4] + m13 * m2[5] + m1[5];
    };
    PlainMatrix.prototype.multiplyLeft = function (matrix) {
        var m1 = matrix._matrix;
        var m2 = this._matrix;
        var m20 = m2[0];
        var m22 = m2[2];
        var m24 = m2[4];
        m2[0] = m1[0] * m20 + m1[2] * m2[1];
        m2[1] = m1[1] * m20 + m1[3] * m2[1];
        m2[2] = m1[0] * m22 + m1[2] * m2[3];
        m2[3] = m1[1] * m22 + m1[3] * m2[3];
        m2[4] = m1[0] * m24 + m1[2] * m2[5] + m1[4];
        m2[5] = m1[1] * m24 + m1[3] * m2[5] + m1[5];
    };
    PlainMatrix.prototype.multiplyNew = function (matrix) {
        var ret = this.clone();
        ret.multiply(matrix);
        return ret;
    };
    PlainMatrix.prototype.reset = function (x, y) {
        this._matrix[0] = 1;
        this._matrix[1] = 0;
        this._matrix[2] = 0;
        this._matrix[3] = 1;
        this._matrix[4] = x || 0;
        this._matrix[5] = y || 0;
    };
    PlainMatrix.prototype.clone = function () {
        return new PlainMatrix(this);
    };
    PlainMatrix.prototype.multiplyInverseForPoint = function (point) {
        var m = this._matrix;
        // id = inverse of the determinant
        var _id = 1 / (m[0] * m[3] + m[2] * -m[1]);
        return {
            x: m[3] * _id * point.x + -m[2] * _id * point.y + (m[5] * m[2] - m[4] * m[3]) * _id,
            y: m[0] * _id * point.y + -m[1] * _id * point.x + (-m[5] * m[0] + m[4] * m[1]) * _id
        };
    };
    PlainMatrix.prototype.scale = function (x, y) {
        var m = this._matrix;
        m[0] *= x;
        m[1] *= y;
        m[2] *= x;
        m[3] *= y;
        m[4] *= x;
        m[5] *= y;
    };
    PlainMatrix.prototype.multiplyPoint = function (point) {
        var m = this._matrix;
        var x = m[0] * point.x + m[2] * point.y + m[4];
        var y = m[1] * point.x + m[3] * point.y + m[5];
        return { x: x, y: y };
    };
    return PlainMatrix;
}());
exports.PlainMatrix = PlainMatrix;

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
var PathUtil_1 = require("./PathUtil");
/**
 * Node.js が提供する module の互換クラス。
 */
var Module = /** @class */ (function () {
    function Module(param) {
        var _this = this;
        var path = param.path;
        var dirname = PathUtil_1.PathUtil.resolveDirname(path);
        // `virtualPath` と `virtualDirname` は　`DynamicAsset` の場合は `undefined` になる。
        var virtualPath = param.virtualPath;
        var virtualDirname = virtualPath ? PathUtil_1.PathUtil.resolveDirname(virtualPath) : undefined;
        var requireFunc = param.requireFunc;
        var resolveFunc = param.resolveFunc;
        this._runtimeValue = Object.create(param.runtimeValueBase, {
            filename: {
                value: path,
                enumerable: true
            },
            dirname: {
                value: dirname,
                enumerable: true
            },
            module: {
                value: this,
                writable: true,
                enumerable: true,
                configurable: true
            }
        });
        this.id = param.id;
        this.filename = param.path;
        this.exports = {};
        this.parent = null; // Node.js と互換
        this.loaded = false;
        this.children = [];
        this.paths = virtualDirname ? PathUtil_1.PathUtil.makeNodeModulePaths(virtualDirname) : [];
        this._dirname = dirname;
        this._virtualDirname = virtualDirname;
        // メソッドとしてではなく単体で呼ばれるのでメソッドにせずここで実体を代入する
        var require = (function (path) {
            return requireFunc(path, _this);
        });
        require.resolve = function (path) {
            return resolveFunc(path, _this);
        };
        this.require = require;
    }
    return Module;
}());
exports.Module = Module;

},{"./PathUtil":45}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleManager = void 0;
var ExceptionFactory_1 = require("./ExceptionFactory");
var Module_1 = require("./Module");
var PathUtil_1 = require("./PathUtil");
var RequireCachedValue_1 = require("./RequireCachedValue");
var ScriptAssetContext_1 = require("./ScriptAssetContext");
/**
 * `Module` を管理するクラス。
 * このクラスのインスタンスは `Game` に一つ存在し、スクリプトアセットの require() の解決に利用される。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
var ModuleManager = /** @class */ (function () {
    function ModuleManager(runtimeBase, assetManager) {
        this._assetManager = assetManager;
        this._runtimeValueBase = runtimeBase;
        this._scriptCaches = {};
    }
    /**
     * node.js の require() ライクな読み込み処理を行い、その結果を返す。
     *
     * node.jsのrequireに限りなく近いモデルでrequireする。
     * ただしアセットIDで該当すればそちらを優先する。また node.js のコアモジュールには対応していない。
     * 通常、ゲーム開発者が利用するのは `Module#require()` であり、このメソッドはその内部実装を提供する。
     *
     * @ignore
     * @param path requireのパス。相対パスと、Asset識別名を利用することが出来る。
     *              なお、./xxx.json のようにjsonを指定する場合、そのAssetはTextAssetである必要がある。
     *              その他の形式である場合、そのAssetはScriptAssetである必要がある。
     * @param currentModule このrequireを実行した Module
     * @returns {any} スクリプト実行結果。通常はScriptAsset#executeの結果。
     *                 例外的に、jsonであればTextAsset#dataをJSON.parseした結果が返る
     */
    ModuleManager.prototype._require = function (path, currentModule) {
        // Node.js の require の挙動については http://nodejs.jp/nodejs.org_ja/api/modules.html も参照。
        var _this = this;
        var targetScriptAsset;
        var resolvedPath;
        var liveAssetVirtualPathTable = this._assetManager._liveAssetVirtualPathTable;
        var moduleMainScripts = this._assetManager._moduleMainScripts;
        // 0. アセットIDらしい場合はまず当該アセットを探す
        if (path.indexOf("/") === -1) {
            if (this._assetManager._assets.hasOwnProperty(path)) {
                targetScriptAsset = this._assetManager._assets[path];
                resolvedPath = this._assetManager._liveAssetPathTable[targetScriptAsset.path];
            }
        }
        // 1. If X is a core module,
        // (何もしない。コアモジュールには対応していない。ゲーム開発者は自分でコアモジュールへの依存を解決する必要がある)
        if (/^\.\/|^\.\.\/|^\//.test(path)) {
            // 2. If X begins with './' or '/' or '../'
            if (currentModule) {
                if (!currentModule._virtualDirname)
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("g._require: require from modules without virtualPath is not supported");
                resolvedPath = PathUtil_1.PathUtil.resolvePath(currentModule._virtualDirname, path);
            }
            else {
                if (!/^\.\//.test(path))
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("g._require: entry point path must start with './'");
                resolvedPath = path.substring(2);
            }
            if (this._scriptCaches.hasOwnProperty(resolvedPath)) {
                return this._scriptCaches[resolvedPath]._cachedValue();
            }
            else if (this._scriptCaches.hasOwnProperty(resolvedPath + ".js")) {
                return this._scriptCaches[resolvedPath + ".js"]._cachedValue();
            }
            // 2.a. LOAD_AS_FILE(Y + X)
            if (!targetScriptAsset)
                targetScriptAsset = this._findAssetByPathAsFile(resolvedPath, liveAssetVirtualPathTable);
            // 2.b. LOAD_AS_DIRECTORY(Y + X)
            if (!targetScriptAsset)
                targetScriptAsset = this._findAssetByPathAsDirectory(resolvedPath, liveAssetVirtualPathTable);
        }
        else {
            // 3. LOAD_NODE_MODULES(X, dirname(Y))
            // `path` は node module の名前であると仮定して探す
            // akashic-engine独自仕様: 対象の `path` が `moduleMainScripts` に指定されていたらそちらを参照する
            if (moduleMainScripts[path]) {
                resolvedPath = moduleMainScripts[path];
                targetScriptAsset = liveAssetVirtualPathTable[resolvedPath];
            }
            if (!targetScriptAsset) {
                var dirs = currentModule ? currentModule.paths : [];
                dirs.push("node_modules");
                for (var i = 0; i < dirs.length; ++i) {
                    var dir = dirs[i];
                    resolvedPath = PathUtil_1.PathUtil.resolvePath(dir, path);
                    targetScriptAsset = this._findAssetByPathAsFile(resolvedPath, liveAssetVirtualPathTable);
                    if (targetScriptAsset)
                        break;
                    targetScriptAsset = this._findAssetByPathAsDirectory(resolvedPath, liveAssetVirtualPathTable);
                    if (targetScriptAsset)
                        break;
                }
            }
        }
        if (targetScriptAsset) {
            // @ts-ignore
            if (this._scriptCaches.hasOwnProperty(resolvedPath))
                return this._scriptCaches[resolvedPath]._cachedValue();
            if (targetScriptAsset.type === "script") {
                var module = new Module_1.Module({
                    runtimeValueBase: this._runtimeValueBase,
                    id: targetScriptAsset.id,
                    path: targetScriptAsset.path,
                    virtualPath: this._assetManager._liveAssetPathTable[targetScriptAsset.path],
                    requireFunc: function (path, mod) { return _this._require(path, mod); },
                    resolveFunc: function (path, mod) { return _this._resolvePath(path, mod); }
                });
                var script = new ScriptAssetContext_1.ScriptAssetContext(targetScriptAsset, module);
                // @ts-ignore
                this._scriptCaches[resolvedPath] = script;
                return script._executeScript(currentModule);
            }
            else if (targetScriptAsset.type === "text") {
                // JSONの場合の特殊挙動をトレースするためのコード。node.jsの仕様に準ずる
                if (targetScriptAsset && PathUtil_1.PathUtil.resolveExtname(path) === ".json") {
                    // Note: node.jsではここでBOMの排除をしているが、いったんakashicでは排除しないで実装
                    // @ts-ignore
                    var cache = (this._scriptCaches[resolvedPath] = new RequireCachedValue_1.RequireCachedValue(JSON.parse(targetScriptAsset.data)));
                    return cache._cachedValue();
                }
            }
        }
        throw ExceptionFactory_1.ExceptionFactory.createAssertionError("g._require: can not find module: " + path);
    };
    /**
     * 対象のモジュールからの相対パスを、 game.json のディレクトリをルート (`/`) とする `/` 区切りの絶対パス形式として解決する。
     * `this._require()` と違い `path` にアセットIDが指定されても解決しない点に注意。
     * 通常、ゲーム開発者が利用するのは `require.resolve()` であり、このメソッドはその内部実装を提供する。
     *
     * @ignore
     * @param path resolve する対象のパス。相対パスを利用することができる。
     * @param currentModule この require を実行した Module 。
     * @returns {string} 絶対パス
     */
    ModuleManager.prototype._resolvePath = function (path, currentModule) {
        var resolvedPath = null;
        var liveAssetVirtualPathTable = this._assetManager._liveAssetVirtualPathTable;
        var moduleMainScripts = this._assetManager._moduleMainScripts;
        // require(X) from module at path Y
        // 1. If X is a core module,
        // (何もしない。コアモジュールには対応していない。ゲーム開発者は自分でコアモジュールへの依存を解決する必要がある)
        if (/^\.\/|^\.\.\/|^\//.test(path)) {
            // 2. If X begins with './' or '/' or '../'
            if (currentModule) {
                if (!currentModule._virtualDirname) {
                    throw ExceptionFactory_1.ExceptionFactory.createAssertionError("g._require.resolve: couldn't resolve the moudle path without virtualPath");
                }
                resolvedPath = PathUtil_1.PathUtil.resolvePath(currentModule._virtualDirname, path);
            }
            else {
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("g._require.resolve: couldn't resolve the moudle without currentModule");
            }
            // 2.a. LOAD_AS_FILE(Y + X)
            var targetPath = this._resolveAbsolutePathAsFile(resolvedPath, liveAssetVirtualPathTable);
            if (targetPath) {
                return targetPath;
            }
            // 2.b. LOAD_AS_DIRECTORY(Y + X)
            targetPath = this._resolveAbsolutePathAsDirectory(resolvedPath, liveAssetVirtualPathTable);
            if (targetPath) {
                return targetPath;
            }
        }
        else {
            // 3. LOAD_NODE_MODULES(X, dirname(Y))
            // akashic-engine独自仕様: 対象の `path` が `moduleMainScripts` に指定されていたらそちらを返す
            if (moduleMainScripts[path]) {
                return moduleMainScripts[path];
            }
            // 3.a LOAD_NODE_MODULES(X, START)
            var dirs = currentModule ? currentModule.paths.concat() : [];
            dirs.push("node_modules");
            for (var i = 0; i < dirs.length; ++i) {
                var dir = dirs[i];
                var targetPath = PathUtil_1.PathUtil.resolvePath(dir, path);
                resolvedPath = this._resolveAbsolutePathAsFile(targetPath, liveAssetVirtualPathTable);
                if (resolvedPath) {
                    return resolvedPath;
                }
                resolvedPath = this._resolveAbsolutePathAsDirectory(targetPath, liveAssetVirtualPathTable);
                if (resolvedPath) {
                    return resolvedPath;
                }
            }
        }
        throw ExceptionFactory_1.ExceptionFactory.createAssertionError("g._require.resolve: couldn't resolve the path: " + path);
    };
    /**
     * 与えられたパス文字列がファイルパスであると仮定して、対応するアセットを探す。
     * 見つかった場合そのアセットを、そうでない場合 `undefined` を返す。
     * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
     *
     * @ignore
     * @param resolvedPath パス文字列
     * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
     */
    ModuleManager.prototype._findAssetByPathAsFile = function (resolvedPath, liveAssetPathTable) {
        if (liveAssetPathTable.hasOwnProperty(resolvedPath))
            return liveAssetPathTable[resolvedPath];
        if (liveAssetPathTable.hasOwnProperty(resolvedPath + ".js"))
            return liveAssetPathTable[resolvedPath + ".js"];
        return undefined;
    };
    /**
     * 与えられたパス文字列がディレクトリパスであると仮定して、対応するアセットを探す。
     * 見つかった場合そのアセットを、そうでない場合 `undefined` を返す。
     * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
     * ディレクトリ内に package.json が存在する場合、package.json 自体もアセットとして
     * `liveAssetPathTable` から参照可能でなければならないことに注意。
     *
     * @ignore
     * @param resolvedPath パス文字列
     * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
     */
    ModuleManager.prototype._findAssetByPathAsDirectory = function (resolvedPath, liveAssetPathTable) {
        var path;
        path = resolvedPath + "/package.json";
        var pkgJsonAsset = liveAssetPathTable[path];
        // liveAssetPathTable[path] != null だけではpathと同名のprototypeプロパティがある場合trueになってしまうので hasOwnProperty() を利用
        if (liveAssetPathTable.hasOwnProperty(path) && pkgJsonAsset.type === "text") {
            var pkg = JSON.parse(pkgJsonAsset.data);
            if (pkg && typeof pkg.main === "string") {
                var asset = this._findAssetByPathAsFile(PathUtil_1.PathUtil.resolvePath(resolvedPath, pkg.main), liveAssetPathTable);
                if (asset)
                    return asset;
            }
        }
        path = resolvedPath + "/index.js";
        if (liveAssetPathTable.hasOwnProperty(path))
            return liveAssetPathTable[path];
        return undefined;
    };
    /**
     * 与えられたパス文字列がファイルパスであると仮定して、対応するアセットの絶対パスを解決する。
     * アセットが存在した場合はそのパスを、そうでない場合 `null` を返す。
     * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
     *
     * @ignore
     * @param resolvedPath パス文字列
     * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
     */
    ModuleManager.prototype._resolveAbsolutePathAsFile = function (resolvedPath, liveAssetPathTable) {
        if (liveAssetPathTable.hasOwnProperty(resolvedPath))
            return "/" + resolvedPath;
        if (liveAssetPathTable.hasOwnProperty(resolvedPath + ".js"))
            return "/" + resolvedPath + ".js";
        return null;
    };
    /**
     * 与えられたパス文字列がディレクトリパスであると仮定して、対応するアセットの絶対パスを解決する。
     * アセットが存在した場合はそのパスを、そうでない場合 `null` を返す。
     * 通常、ゲーム開発者がファイルパスを扱うことはなく、このメソッドを呼び出す必要はない。
     * ディレクトリ内に package.json が存在する場合、package.json 自体もアセットとして
     * `liveAssetPathTable` から参照可能でなければならないことに注意。
     *
     * @ignore
     * @param resolvedPath パス文字列
     * @param liveAssetPathTable パス文字列のプロパティに対応するアセットを格納したオブジェクト
     */
    ModuleManager.prototype._resolveAbsolutePathAsDirectory = function (resolvedPath, liveAssetPathTable) {
        var path = resolvedPath + "/package.json";
        var asset = liveAssetPathTable[path];
        // liveAssetPathTable[path] != null だけではpathと同名のprototypeプロパティがある場合trueになってしまうので hasOwnProperty() を利用
        if (liveAssetPathTable.hasOwnProperty(path) && asset.type === "text") {
            var pkg = JSON.parse(asset.data);
            if (pkg && typeof pkg.main === "string") {
                var targetPath = this._resolveAbsolutePathAsFile(PathUtil_1.PathUtil.resolvePath(resolvedPath, pkg.main), liveAssetPathTable);
                if (targetPath) {
                    return "/" + targetPath;
                }
            }
        }
        path = resolvedPath + "/index.js";
        if (liveAssetPathTable.hasOwnProperty(path)) {
            return "/" + path;
        }
        return null;
    };
    return ModuleManager;
}());
exports.ModuleManager = ModuleManager;

},{"./ExceptionFactory":28,"./Module":37,"./PathUtil":45,"./RequireCachedValue":51,"./ScriptAssetContext":53}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NinePatchSurfaceEffector = void 0;
var SurfaceUtil_1 = require("./SurfaceUtil");
/**
 * ナインパッチによる描画処理を提供するSurfaceEffector。
 *
 * このSurfaceEffectorは、画像素材の拡大・縮小において「枠」の表現を実現するものである。
 * 画像の上下左右の「枠」部分の幅・高さを渡すことで、上下の「枠」を縦に引き延ばすことなく、
 * また左右の「枠」を横に引き延ばすことなく画像を任意サイズに拡大・縮小できる。
 * ゲームにおけるメッセージウィンドウやダイアログの表現に利用することを想定している。
 *
 * @deprecated 非推奨である。将来的に削除される。代わりに `SurfaceUtil#drawNinePatch()` を利用すること。
 */
var NinePatchSurfaceEffector = /** @class */ (function () {
    /**
     * `NinePatchSurfaceEffector` のインスタンスを生成する。
     * @deprecated 非推奨である。将来的に削除される。代わりに `SurfaceUtil#drawNinePatch()` を利用すること。
     * @param game このインスタンスが属する `Game`。
     * @param borderWidth 上下左右の「拡大しない」領域の大きさ。すべて同じ値なら数値一つを渡すことができる。省略された場合、 `4`
     */
    function NinePatchSurfaceEffector(game, borderWidth) {
        if (borderWidth === void 0) { borderWidth = 4; }
        this.game = game;
        if (typeof borderWidth === "number") {
            this.borderWidth = {
                top: borderWidth,
                bottom: borderWidth,
                left: borderWidth,
                right: borderWidth
            };
        }
        else {
            this.borderWidth = borderWidth;
        }
    }
    /**
     * 指定の大きさに拡大・縮小した描画結果の `Surface` を生成して返す。詳細は `SurfaceEffector#render` の項を参照。
     */
    NinePatchSurfaceEffector.prototype.render = function (srcSurface, width, height) {
        if (!this._surface || this._surface.width !== width || this._surface.height !== height || this._beforeSrcSurface !== srcSurface) {
            this._surface = this.game.resourceFactory.createSurface(Math.ceil(width), Math.ceil(height));
            this._beforeSrcSurface = srcSurface;
        }
        SurfaceUtil_1.SurfaceUtil.drawNinePatch(this._surface, srcSurface, this.borderWidth);
        return this._surface;
    };
    return NinePatchSurfaceEffector;
}());
exports.NinePatchSurfaceEffector = NinePatchSurfaceEffector;

},{"./SurfaceUtil":62}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Object2D = void 0;
var ExceptionFactory_1 = require("./ExceptionFactory");
var Matrix_1 = require("./Matrix");
/**
 * 二次元の幾何的オブジェクト。位置とサイズ (に加えて傾きや透明度も) を持つ。
 * ゲーム開発者は `E` を使えばよく、通常このクラスを意識する必要はない。
 */
var Object2D = /** @class */ (function () {
    function Object2D(param) {
        if (!param) {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            this.opacity = 1;
            this.scaleX = 1;
            this.scaleY = 1;
            this.angle = 0;
            this.compositeOperation = undefined;
            this.anchorX = 0;
            this.anchorY = 0;
            this._matrix = undefined;
        }
        else {
            this.x = param.x || 0;
            this.y = param.y || 0;
            this.width = param.width || 0;
            this.height = param.height || 0;
            this.opacity = param.opacity != null ? param.opacity : 1;
            this.scaleX = param.scaleX != null ? param.scaleX : 1;
            this.scaleY = param.scaleY != null ? param.scaleY : 1;
            this.angle = param.angle || 0;
            this.compositeOperation = param.compositeOperation;
            // `null` に後方互換性のための意味を持たせているので、 `=== undefined` で比較する
            this.anchorX = param.anchorX === undefined ? 0 : param.anchorX;
            this.anchorY = param.anchorY === undefined ? 0 : param.anchorY;
            this._matrix = undefined;
        }
    }
    Object2D.prototype.moveTo = function (posOrX, y) {
        if (typeof posOrX === "number" && typeof y !== "number") {
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Object2D#moveTo: arguments must be CommonOffset or pair of x and y as a number.");
        }
        if (typeof posOrX === "number") {
            this.x = posOrX;
            this.y = y;
        }
        else {
            this.x = posOrX.x;
            this.y = posOrX.y;
        }
    };
    /**
     * オブジェクトを相対的に移動する。
     * このメソッドは `x` と `y` を同時に加算するためのユーティリティメソッドである。
     * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
     * @param x X座標に加算する値
     * @param y Y座標に加算する値
     */
    Object2D.prototype.moveBy = function (x, y) {
        this.x += x;
        this.y += y;
    };
    Object2D.prototype.resizeTo = function (sizeOrWidth, height) {
        if (typeof sizeOrWidth === "number" && typeof height !== "number") {
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Object2D#resizeTo: arguments must be CommonSize or pair of width and height as a number.");
        }
        if (typeof sizeOrWidth === "number") {
            this.width = sizeOrWidth;
            this.height = height;
        }
        else {
            this.width = sizeOrWidth.width;
            this.height = sizeOrWidth.height;
        }
    };
    /**
     * オブジェクトのサイズを相対的に変更する。
     * このメソッドは `width` と `height` を同時に加算するためのユーティリティメソッドである。
     * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
     * @param width 加算する幅
     * @param height 加算する高さ
     */
    Object2D.prototype.resizeBy = function (width, height) {
        this.width += width;
        this.height += height;
    };
    /**
     * オブジェクトの拡大率を設定する。
     * このメソッドは `scaleX` と `scaleY` に同じ値を同時に設定するためのユーティリティメソッドである。
     * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
     * @param scale 拡大率
     */
    Object2D.prototype.scale = function (scale) {
        this.scaleX = scale;
        this.scaleY = scale;
    };
    /**
     * オブジェクトのアンカーの位置を設定する。
     * このメソッドは `anchorX` と `anchorY` を同時に設定するためのユーティリティメソッドである。
     * `E` や `Camera2D` においてこのメソッドを呼び出した場合、 `modified()` を呼び出す必要がある。
     */
    Object2D.prototype.anchor = function (x, y) {
        this.anchorX = x;
        this.anchorY = y;
    };
    /**
     * このオブジェクトの変換行列を得る。
     */
    Object2D.prototype.getMatrix = function () {
        if (!this._matrix) {
            this._matrix = new Matrix_1.PlainMatrix();
        }
        else if (!this._matrix._modified) {
            return this._matrix;
        }
        this._updateMatrix();
        this._matrix._modified = false;
        return this._matrix;
    };
    /**
     * 公開のプロパティから内部の変換行列キャッシュを更新する。
     * @private
     */
    Object2D.prototype._updateMatrix = function () {
        if (this.angle || this.scaleX !== 1 || this.scaleY !== 1 || this.anchorX !== 0 || this.anchorY !== 0) {
            // @ts-ignore
            this._matrix.update(this.width, this.height, this.scaleX, this.scaleY, this.angle, this.x, this.y, this.anchorX, this.anchorY);
        }
        else {
            // @ts-ignore
            this._matrix.reset(this.x, this.y);
        }
    };
    return Object2D;
}());
exports.Object2D = Object2D;

},{"./ExceptionFactory":28,"./Matrix":36}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],42:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationPluginManager = void 0;
var trigger_1 = require("@akashic/trigger");
/**
 * 操作プラグインからの通知をハンドルするクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 * @ignore
 */
var OperationHandler = /** @class */ (function () {
    function OperationHandler(code, owner, handler) {
        this._code = code;
        this._handler = handler;
        this._handlerOwner = owner;
    }
    OperationHandler.prototype.onOperation = function (op) {
        var iop;
        if (op instanceof Array) {
            iop = { _code: this._code, data: op };
        }
        else {
            iop = __assign({ _code: this._code }, op);
        }
        this._handler.call(this._handlerOwner, iop);
    };
    return OperationHandler;
}());
/**
 * 操作プラグインを管理するクラス。
 * 通常は game.json の `operationPlugins` フィールドを基に自動的に初期化される他、
 * ゲーム開発者は本クラスを用いて直接操作プラグインを登録することもできる。
 * 詳細は `this.register()` のコメントを参照。
 *
 * 本クラスのインスタンスをゲーム開発者が直接生成することない。
 */
var OperationPluginManager = /** @class */ (function () {
    function OperationPluginManager(game, viewInfo) {
        this.onOperate = new trigger_1.Trigger();
        this.operated = this.onOperate;
        this.plugins = {};
        this._game = game;
        this._viewInfo = viewInfo;
    }
    /**
     * 操作プラグインを手動で登録する。
     * このメソッドを利用する場合、game.json の `operationPlugins` フィールドから該当の定義を省略する必要がある。
     * 登録後、ゲーム開発者自身で `OperationPluginManager#start()` を呼び出さなければならない点に注意。
     * @param pluginClass new 可能な操作プラグインの実態
     * @param code 操作プラグインの識別コード
     * @param option 操作プラグインのコンストラクタに渡すパラメータ
     */
    OperationPluginManager.prototype.register = function (pluginClass, code, option) {
        return this._instantiateOperationPlugin(pluginClass, code, option);
    };
    /**
     * 対象の操作プラグインを開始する。
     * @param code 操作プラグインの識別コード
     */
    OperationPluginManager.prototype.start = function (code) {
        var plugin = this.plugins[code];
        if (!plugin)
            return;
        plugin.start();
    };
    /**
     * 対象の操作プラグインを終了する。
     * @param code 操作プラグインの識別コード
     */
    OperationPluginManager.prototype.stop = function (code) {
        var plugin = this.plugins[code];
        if (!plugin)
            return;
        plugin.stop();
    };
    OperationPluginManager.prototype.destroy = function () {
        this.stopAll();
        this.onOperate.destroy();
        this.onOperate = undefined;
        this.operated = undefined;
        this.plugins = undefined;
        this._game = undefined;
        this._viewInfo = undefined;
    };
    OperationPluginManager.prototype.reset = function () {
        this.stopAll();
        this.onOperate.removeAll();
        this.plugins = {};
    };
    OperationPluginManager.prototype.stopAll = function () {
        for (var code in this.plugins) {
            if (!this.plugins.hasOwnProperty(code))
                continue;
            var plugin = this.plugins[code];
            if (plugin)
                plugin.stop();
        }
    };
    OperationPluginManager.prototype._instantiateOperationPlugin = function (pluginClass, code, option) {
        if (!pluginClass.isSupported()) {
            return;
        }
        if (this.plugins[code]) {
            throw new Error("Plugin#code conflicted for code: ".concat(code));
        }
        var plugin = new pluginClass(this._game, this._viewInfo, option);
        this.plugins[code] = plugin;
        var handler = new OperationHandler(code, this.onOperate, this.onOperate.fire);
        plugin.operationTrigger.add(handler.onOperation, handler);
        return plugin;
    };
    return OperationPluginManager;
}());
exports.OperationPluginManager = OperationPluginManager;

},{"@akashic/trigger":213}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathUtil = void 0;
var ExceptionFactory_1 = require("./ExceptionFactory");
/**
 * パスユーティリティ。
 * 通常、ゲーム開発者がファイルパスを扱うことはなく、このモジュールのメソッドを呼び出す必要はない。
 */
var PathUtil;
(function (PathUtil) {
    /**
     * 二つのパス文字列をつなぎ、相対パス表現 (".", "..") を解決して返す。
     * @param base 左辺パス文字列 (先頭の "./" を除き、".", ".." を含んではならない)
     * @param path 右辺パス文字列
     */
    function resolvePath(base, path) {
        function split(str) {
            var ret = str.split("/");
            if (ret[ret.length - 1] === "")
                ret.pop();
            return ret;
        }
        if (path === "")
            return base;
        var baseComponents = PathUtil.splitPath(base);
        var parts = split(baseComponents.path).concat(split(path));
        var resolved = [];
        for (var i = 0; i < parts.length; ++i) {
            var part = parts[i];
            switch (part) {
                case "..":
                    var popped = resolved.pop();
                    if (popped === undefined || popped === "" || popped === ".")
                        throw ExceptionFactory_1.ExceptionFactory.createAssertionError("PathUtil.resolvePath: invalid arguments");
                    break;
                case ".":
                    if (resolved.length === 0) {
                        resolved.push(".");
                    }
                    break;
                case "": // 絶対パス
                    resolved = [""];
                    break;
                default:
                    resolved.push(part);
            }
        }
        return baseComponents.host + resolved.join("/");
    }
    PathUtil.resolvePath = resolvePath;
    /**
     * パス文字列からディレクトリ名部分を切り出して返す。
     * @param path パス文字列
     */
    function resolveDirname(path) {
        var index = path.lastIndexOf("/");
        if (index === -1)
            return path;
        return path.substr(0, index);
    }
    PathUtil.resolveDirname = resolveDirname;
    /**
     * パス文字列から拡張子部分を切り出して返す。
     * @param path パス文字列
     */
    function resolveExtname(path) {
        for (var i = path.length - 1; i >= 0; --i) {
            var c = path.charAt(i);
            if (c === ".") {
                return path.substr(i);
            }
            else if (c === "/") {
                return "";
            }
        }
        return "";
    }
    PathUtil.resolveExtname = resolveExtname;
    /**
     * パス文字列から、node.js において require() の探索範囲になるパスの配列を作成して返す。
     * @param path ディレクトリを表すパス文字列
     */
    function makeNodeModulePaths(path) {
        var pathComponents = PathUtil.splitPath(path);
        var host = pathComponents.host;
        path = pathComponents.path;
        if (path[path.length - 1] === "/") {
            path = path.slice(0, path.length - 1);
        }
        var parts = path.split("/");
        var firstDir = parts.indexOf("node_modules");
        var root = firstDir > 0 ? firstDir - 1 : 0;
        var dirs = [];
        for (var i = parts.length - 1; i >= root; --i) {
            if (parts[i] === "node_modules")
                continue;
            var dirParts = parts.slice(0, i + 1);
            dirParts.push("node_modules");
            var dir = dirParts.join("/");
            dirs.push(host + dir);
        }
        return dirs;
    }
    PathUtil.makeNodeModulePaths = makeNodeModulePaths;
    /**
     * 与えられたパス文字列からホストを切り出す。
     * @param path パス文字列
     */
    function splitPath(path) {
        var host = "";
        var doubleSlashIndex = path.indexOf("//");
        if (doubleSlashIndex >= 0) {
            var hostSlashIndex = path.indexOf("/", doubleSlashIndex + 2); // 2 === "//".length
            if (hostSlashIndex >= 0) {
                host = path.slice(0, hostSlashIndex);
                path = path.slice(hostSlashIndex); // 先頭に "/" を残して絶対パス扱いさせる
            }
            else {
                host = path;
                path = "/"; // path全体がホストだったので、絶対パス扱いさせる
            }
        }
        else {
            host = "";
        }
        return { host: host, path: path };
    }
    PathUtil.splitPath = splitPath;
})(PathUtil = exports.PathUtil || (exports.PathUtil = {}));

},{"./ExceptionFactory":28}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointEventResolver = void 0;
/**
 * PlatformPointEventからg.Eventへの変換機構。
 *
 * ほぼ座標しか持たないPlatformPointEventに対して、g.Point(Down|Move|Up)Eventはその座標にあるエンティティや、
 * (g.Point(Move|Up)Eventの場合)g.PointDownEventからの座標の差分を持っている。
 * それらの足りない情報を管理・追加して、PlatformPointEventをg.Eventに変換するクラス。
 * Platform実装はpointDown()なしでpointMove()を呼び出してくることも考えられるため、
 * Down -> Move -> Up の流れを保証する機能も持つ。
 *
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 * @ignore
 */
var PointEventResolver = /** @class */ (function () {
    function PointEventResolver(param) {
        var _a;
        this._currentPoints = 0;
        // g.Eと関連した座標データ
        this._pointEventMap = {};
        this._sourceResolver = param.sourceResolver;
        this._playerId = param.playerId;
        this._maxPoints = (_a = param.maxPoints) !== null && _a !== void 0 ? _a : null;
    }
    PointEventResolver.prototype.pointDown = function (e) {
        var _a;
        if (this._maxPoints != null && this._currentPoints >= this._maxPoints) {
            return null;
        }
        var source = this._sourceResolver.findPointSource(e.offset);
        // @ts-ignore
        var point = source.point ? source.point : e.offset;
        // @ts-ignore
        var targetId = source.target ? source.target.id : undefined;
        // @ts-ignore
        var local = source.local;
        this._pointEventMap[e.identifier] = {
            targetId: targetId,
            local: local,
            point: point,
            start: { x: e.offset.x, y: e.offset.y },
            prev: { x: e.offset.x, y: e.offset.y },
            button: (_a = e.button) !== null && _a !== void 0 ? _a : 0
        };
        this._currentPoints++;
        // NOTE: 優先度は機械的にJoinedをつけておく。Joinしていない限りPointDownEventなどはリジェクトされる。
        var ret = [
            33 /* pl.EventCode.PointDown */,
            2 /* EventPriority.Joined */,
            this._playerId,
            e.identifier,
            point.x,
            point.y,
            targetId,
            e.button //                7?: ボタンの種類
        ];
        if (source && source.local)
            ret.push(source.local); // 8?: ローカル
        return ret;
    };
    PointEventResolver.prototype.pointMove = function (e) {
        var holder = this._pointEventMap[e.identifier];
        if (!holder)
            return null;
        var prev = { x: 0, y: 0 };
        var start = { x: 0, y: 0 };
        this._pointMoveAndUp(holder, e.offset, prev, start);
        var ret = [
            34 /* pl.EventCode.PointMove */,
            2 /* EventPriority.Joined */,
            this._playerId,
            e.identifier,
            holder.point.x,
            holder.point.y,
            start.x,
            start.y,
            prev.x,
            prev.y,
            holder.targetId //         10?: エンティティID
        ];
        if (holder.local)
            ret.push(holder.local); // 11?: ローカル
        return ret;
    };
    PointEventResolver.prototype.pointUp = function (e) {
        var holder = this._pointEventMap[e.identifier];
        if (!holder)
            return null;
        var prev = { x: 0, y: 0 };
        var start = { x: 0, y: 0 };
        this._pointMoveAndUp(holder, e.offset, prev, start);
        delete this._pointEventMap[e.identifier];
        this._currentPoints--;
        var ret = [
            35 /* pl.EventCode.PointUp */,
            2 /* EventPriority.Joined */,
            this._playerId,
            e.identifier,
            holder.point.x,
            holder.point.y,
            start.x,
            start.y,
            prev.x,
            prev.y,
            holder.targetId //       10?: エンティティID
        ];
        if (holder.local)
            ret.push(holder.local); // 11?: ローカル
        return ret;
    };
    PointEventResolver.prototype._pointMoveAndUp = function (holder, offset, prevDelta, startDelta) {
        startDelta.x = offset.x - holder.start.x;
        startDelta.y = offset.y - holder.start.y;
        prevDelta.x = offset.x - holder.prev.x;
        prevDelta.y = offset.y - holder.prev.y;
        holder.prev.x = offset.x;
        holder.prev.y = offset.y;
    };
    return PointEventResolver;
}());
exports.PointEventResolver = PointEventResolver;

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomGenerator = void 0;
/**
 * 乱数生成器。
 * `RandomGenerator#get()` によって、新しい乱数を生成することができる。
 */
var RandomGenerator = /** @class */ (function () {
    function RandomGenerator(seed) {
        this.seed = seed;
    }
    return RandomGenerator;
}());
exports.RandomGenerator = RandomGenerator;

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireCachedValue = void 0;
var RequireCachedValue = /** @class */ (function () {
    function RequireCachedValue(value) {
        this._value = value;
    }
    /**
     * @private
     */
    RequireCachedValue.prototype._cachedValue = function () {
        return this._value;
    };
    return RequireCachedValue;
}());
exports.RequireCachedValue = RequireCachedValue;

},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scene = void 0;
var trigger_1 = require("@akashic/trigger");
var AssetAccessor_1 = require("./AssetAccessor");
var AssetHolder_1 = require("./AssetHolder");
var Camera2D_1 = require("./Camera2D");
var ExceptionFactory_1 = require("./ExceptionFactory");
var TimerManager_1 = require("./TimerManager");
/**
 * シーンを表すクラス。
 */
var Scene = /** @class */ (function () {
    /**
     * 各種パラメータを指定して `Scene` のインスタンスを生成する。
     * @param param 初期化に用いるパラメータのオブジェクト
     */
    function Scene(param) {
        var game = param.game;
        var local = param.local === undefined
            ? "non-local"
            : param.local === false
                ? "non-local"
                : param.local === true
                    ? "full-local"
                    : param.local;
        var tickGenerationMode = param.tickGenerationMode !== undefined ? param.tickGenerationMode : "by-clock";
        if (!param.storageKeys) {
            this._storageLoader = undefined;
            this.storageValues = undefined;
        }
        else {
            this._storageLoader = game.storage._createLoader(param.storageKeys, param.storageValuesSerialization);
            this.storageValues = this._storageLoader._valueStore;
        }
        this.name = param.name;
        this.game = game;
        this.local = local;
        this.tickGenerationMode = tickGenerationMode;
        this.onLoad = new trigger_1.Trigger();
        this.loaded = this.onLoad;
        this._onReady = new trigger_1.Trigger();
        this._ready = this._onReady;
        this.assets = {};
        this.asset = new AssetAccessor_1.AssetAccessor(game._assetManager);
        this._loaded = false;
        this._prefetchRequested = false;
        this._loadingState = "initial";
        this.onUpdate = new trigger_1.Trigger();
        this.update = this.onUpdate;
        this._timer = new TimerManager_1.TimerManager(this.onUpdate, this.game.fps);
        this.onAssetLoad = new trigger_1.Trigger();
        this.onAssetLoadFailure = new trigger_1.Trigger();
        this.onAssetLoadComplete = new trigger_1.Trigger();
        this.assetLoaded = this.onAssetLoad;
        this.assetLoadFailed = this.onAssetLoadFailure;
        this.assetLoadCompleted = this.onAssetLoadComplete;
        this.onMessage = new trigger_1.Trigger();
        this.onPointDownCapture = new trigger_1.Trigger();
        this.onPointMoveCapture = new trigger_1.Trigger();
        this.onPointUpCapture = new trigger_1.Trigger();
        this.onOperation = new trigger_1.Trigger();
        this.message = this.onMessage;
        this.pointDownCapture = this.onPointDownCapture;
        this.pointMoveCapture = this.onPointMoveCapture;
        this.pointUpCapture = this.onPointUpCapture;
        this.operation = this.onOperation;
        this.children = [];
        this.state = "standby";
        this.onStateChange = new trigger_1.Trigger();
        this._assetHolders = [];
        this._sceneAssetHolder = new AssetHolder_1.AssetHolder({
            assetManager: this.game._assetManager,
            assetIds: param.assetIds,
            assetPaths: param.assetPaths,
            handlerSet: {
                owner: this,
                handleLoad: this._handleSceneAssetLoad,
                handleLoadFailure: this._handleSceneAssetLoadFailure,
                handleFinish: this._handleSceneAssetLoadFinish
            },
            userData: null
        });
    }
    /**
     * このシーンが変更されたことをエンジンに通知する。
     *
     * このメソッドは、このシーンに紐づいている `E` の `modified()` を呼び出すことで暗黙に呼び出される。
     * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
     * @param isBubbling この関数をこのシーンの子の `modified()` から呼び出す場合、真を渡さなくてはならない。省略された場合、偽。
     */
    Scene.prototype.modified = function (_isBubbling) {
        this.game.modified();
    };
    /**
     * このシーンを破棄する。
     *
     * 破棄処理の開始時に、このシーンの `onStateChange` が引数 `BeforeDestroyed` でfireされる。
     * 破棄処理の終了時に、このシーンの `onStateChange` が引数 `Destroyed` でfireされる。
     * このシーンに紐づいている全ての `E` と全てのTimerは破棄される。
     * `Scene#setInterval()`, `Scene#setTimeout()` に渡された関数は呼び出されなくなる。
     *
     * このメソッドは `Scene#end` や `Game#popScene` などによって要求されたシーンの遷移時に暗黙に呼び出される。
     * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
     */
    Scene.prototype.destroy = function () {
        this.state = "before-destroyed";
        this.onStateChange.fire(this.state);
        // TODO: (GAMEDEV-483) Sceneスタックがそれなりの量になると重くなるのでScene#dbが必要かもしれない
        for (var _i = 0, _a = [this.game.db, this.game._localDb]; _i < _a.length; _i++) {
            var db = _a[_i];
            for (var _b = 0, _c = db.keys(); _b < _c.length; _b++) {
                var key = _c[_b];
                var e = db.get(key);
                if ((e === null || e === void 0 ? void 0 : e.scene) === this) {
                    e.destroy();
                }
            }
        }
        this._timer.destroy();
        this.onUpdate.destroy();
        this.onMessage.destroy();
        this.onPointDownCapture.destroy();
        this.onPointMoveCapture.destroy();
        this.onPointUpCapture.destroy();
        this.onOperation.destroy();
        this.onLoad.destroy();
        this.onAssetLoad.destroy();
        this.onAssetLoadFailure.destroy();
        this.onAssetLoadComplete.destroy();
        this.assets = {};
        // アセットを参照しているEより先に解放しないよう最後に解放する
        for (var i = 0; i < this._assetHolders.length; ++i)
            this._assetHolders[i].destroy();
        this._sceneAssetHolder.destroy();
        this._storageLoader = undefined;
        this.game = undefined;
        this.state = "destroyed";
        this.onStateChange.fire(this.state);
        this.onStateChange.destroy();
    };
    /**
     * 破棄済みであるかを返す。
     */
    Scene.prototype.destroyed = function () {
        return this.game === undefined;
    };
    /**
     * 一定間隔で定期的に処理を実行するTimerを作成して返す。
     *
     * 戻り値は作成されたTimerである。
     * 通常は `Scene#setInterval` を利用すればよく、ゲーム開発者がこのメソッドを呼び出す必要はない。
     * `Timer` はフレーム経過処理(`Scene#onUpdate`)で実現される疑似的なタイマーである。実時間の影響は受けない。
     * @param interval Timerの実行間隔（ミリ秒）
     */
    Scene.prototype.createTimer = function (interval) {
        return this._timer.createTimer(interval);
    };
    /**
     * Timerを削除する。
     * `Scene#createTimer()`と同様に、通常はゲーム開発者がこのメソッドを呼び出す必要はない。
     * このメソッドを利用する場合、メソッド実行前に対象のTimerのonElapseに登録したハンドラを全て削除しておく必要がある。
     * @param timer 削除するTimer
     */
    Scene.prototype.deleteTimer = function (timer) {
        this._timer.deleteTimer(timer);
    };
    /**
     * 一定間隔で定期的に実行される処理を作成する。
     *
     * `interval` ミリ秒おきに `owner` を `this` として `handler` を呼び出す。
     * 戻り値は `Scene#clearInterval` の引数に指定して定期実行を解除するために使える値である。
     * このタイマーはフレーム経過処理(`Scene#onUpdate`)で実現される疑似的なタイマーである。実時間の影響は受けない。
     * 関数は指定時間の経過直後ではなく、経過後最初のフレームで呼び出される。
     * @param handler 処理
     * @param interval 実行間隔(ミリ秒)
     * @param owner handlerの所有者。省略された場合、null
     */
    Scene.prototype.setInterval = function (handler, interval, owner) {
        return this._timer.setInterval(handler, interval, owner);
    };
    /**
     * setIntervalで作成した定期処理を解除する。
     * @param identifier 解除対象
     */
    Scene.prototype.clearInterval = function (identifier) {
        this._timer.clearInterval(identifier);
    };
    /**
     * 一定時間後に一度だけ実行される処理を作成する。
     *
     * `milliseconds` ミリ秒後(以降)に、一度だけ `owner` を `this` として `handler` を呼び出す。
     * 戻り値は `Scene#clearTimeout` の引数に指定して処理を削除するために使える値である。
     *
     * このタイマーはフレーム経過処理(`Scene#onUpdate`)で実現される疑似的なタイマーである。実時間の影響は受けない。
     * 関数は指定時間の経過直後ではなく、経過後最初のフレームで呼び出される。
     * (理想的なケースでは、30FPSなら50msのコールバックは66.6ms時点で呼び出される)
     * 時間経過に対して厳密な処理を行う必要があれば、自力で `Scene#onUpdate` 通知を処理すること。
     *
     * @param handler 処理
     * @param milliseconds 時間(ミリ秒)
     * @param owner handlerの所有者。省略された場合、null
     */
    Scene.prototype.setTimeout = function (handler, milliseconds, owner) {
        return this._timer.setTimeout(handler, milliseconds, owner);
    };
    /**
     * setTimeoutで作成した処理を削除する。
     * @param identifier 解除対象
     */
    Scene.prototype.clearTimeout = function (identifier) {
        this._timer.clearTimeout(identifier);
    };
    /**
     * このシーンが現在のシーンであるかどうかを返す。
     */
    Scene.prototype.isCurrentScene = function () {
        return this.game.scene() === this;
    };
    /**
     * 次のシーンへの遷移を要求する。
     *
     * このメソッドは、 `toPush` が真ならば `Game#pushScene()` の、でなければ `Game#replaceScene` のエイリアスである。
     * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
     * このシーンが現在のシーンでない場合、 `AssertionError` がthrowされる。
     * @param next 遷移後のシーン
     * @param toPush 現在のシーンを残したままにするなら真、削除して遷移するなら偽を指定する。省略された場合偽
     */
    Scene.prototype.gotoScene = function (next, toPush) {
        if (!this.isCurrentScene())
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Scene#gotoScene: this scene is not the current scene");
        if (toPush) {
            this.game.pushScene(next);
        }
        else {
            this.game.replaceScene(next);
        }
    };
    /**
     * このシーンの削除と、一つ前のシーンへの遷移を要求する。
     *
     * このメソッドは `Game#popScene()` のエイリアスである。
     * このメソッドは要求を行うだけである。呼び出し直後にはシーン遷移は行われていないことに注意。
     * このシーンが現在のシーンでない場合、 `AssertionError` がthrowされる。
     */
    Scene.prototype.end = function () {
        if (!this.isCurrentScene())
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Scene#end: this scene is not the current scene");
        this.game.popScene();
    };
    /**
     * このSceneにエンティティを登録する。
     *
     * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に呼び出す必要はない。
     * @param e 登録するエンティティ
     */
    Scene.prototype.register = function (e) {
        this.game.register(e);
        e.scene = this;
    };
    /**
     * このSceneからエンティティの登録を削除する。
     *
     * このメソッドは各エンティティに対して暗黙に呼び出される。ゲーム開発者がこのメソッドを明示的に呼び出す必要はない。
     * @param e 登録を削除するエンティティ
     */
    Scene.prototype.unregister = function (e) {
        // @ts-ignore
        e.scene = undefined;
        this.game.unregister(e);
    };
    /**
     * 子エンティティを追加する。
     *
     * `this.children` の末尾に `e` を追加する(`e` はそれまでに追加されたすべての子エンティティより手前に表示される)。
     *
     * @param e 子エンティティとして追加するエンティティ
     */
    Scene.prototype.append = function (e) {
        this.insertBefore(e, undefined);
    };
    /**
     * 子エンティティを挿入する。
     *
     * `this.children` の`target`の位置に `e` を挿入する。
     * `target` が`this` の子でない場合、`append(e)`と同じ動作となる。
     *
     * @param e 子エンティティとして追加するエンティティ
     * @param target 挿入位置にある子エンティティ
     */
    Scene.prototype.insertBefore = function (e, target) {
        if (e.parent)
            e.remove();
        e.parent = this;
        var index = -1;
        if (target !== undefined && (index = this.children.indexOf(target)) > -1) {
            this.children.splice(index, 0, e);
        }
        else {
            this.children.push(e);
        }
        this.modified(true);
    };
    /**
     * 子エンティティを削除する。
     * `this` の子から `e` を削除する。 `e` が `this` の子でない場合、何もしない。
     * @param e 削除する子エンティティ
     */
    Scene.prototype.remove = function (e) {
        var index = this.children.indexOf(e);
        if (index === -1)
            return;
        this.children[index].parent = undefined;
        this.children.splice(index, 1);
        this.modified(true);
    };
    /**
     * シーン内でその座標に反応する `PointSource` を返す。
     * @param point 対象の座標
     * @param force touchable指定を無視する場合真を指定する。指定されなかった場合偽
     * @param camera 対象のカメラ。指定されなかった場合undefined
     */
    Scene.prototype.findPointSourceByPoint = function (point, force, camera) {
        var mayConsumeLocalTick = this.local !== "non-local";
        var children = this.children;
        var m = camera && camera instanceof Camera2D_1.Camera2D ? camera.getMatrix() : undefined;
        for (var i = children.length - 1; i >= 0; --i) {
            var ret = children[i].findPointSourceByPoint(point, m, force);
            if (ret) {
                ret.local = (ret.target && ret.target.local) || mayConsumeLocalTick;
                return ret;
            }
        }
        return { target: undefined, point: undefined, local: mayConsumeLocalTick };
    };
    /**
     * アセットの先読みを要求する。
     *
     * `Scene` に必要なアセットは、通常、`Game#pushScene()` などによるシーン遷移にともなって暗黙に読み込みが開始される。
     * ゲーム開発者はこのメソッドを呼び出すことで、シーン遷移前にアセット読み込みを開始する(先読みする)ことができる。
     * 先読み開始後、シーン遷移時までに読み込みが完了していない場合、通常の読み込み処理同様にローディングシーンが表示される。
     *
     * このメソッドは `StorageLoader` についての先読み処理を行わない点に注意。
     * ストレージの場合、書き込みが行われる可能性があるため、順序を無視して先読みすることはできない。
     */
    Scene.prototype.prefetch = function () {
        if (this._loaded) {
            // _load() 呼び出し後に prefetch() する意味はない(先読みではない)。
            return;
        }
        if (this._prefetchRequested)
            return;
        this._prefetchRequested = true;
        this._sceneAssetHolder.request();
    };
    /**
     * シーンが読み込んだストレージの値をシリアライズする。
     *
     * `Scene#storageValues` の内容をシリアライズする。
     */
    Scene.prototype.serializeStorageValues = function () {
        if (!this._storageLoader)
            return undefined;
        return this._storageLoader._valueStoreSerialization;
    };
    Scene.prototype.requestAssets = function (assetIds, handler) {
        var _this = this;
        if (this._loadingState !== "ready-fired" && this._loadingState !== "loaded-fired") {
            // このメソッドは読み込み完了前には呼び出せない。これは実装上の制限である。
            // やろうと思えば _load() で読み込む対象として加えることができる。が、その場合 `handler` を呼び出す方法が単純でないので対応を見送る。
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("Scene#requestAssets(): can be called after loaded.");
        }
        var holder = new AssetHolder_1.AssetHolder({
            assetManager: this.game._assetManager,
            assetIds: assetIds,
            handlerSet: {
                owner: this,
                handleLoad: this._handleSceneAssetLoad,
                handleLoadFailure: this._handleSceneAssetLoadFailure,
                handleFinish: this._handleSceneAssetLoadFinish
            },
            userData: function () {
                // 不要なクロージャは避けたいが生存チェックのため不可避
                if (!_this.destroyed())
                    handler();
            }
        });
        this._assetHolders.push(holder);
        holder.request();
    };
    /**
     * @private
     */
    Scene.prototype._activate = function () {
        this.state = "active";
        this.onStateChange.fire(this.state);
    };
    /**
     * @private
     */
    Scene.prototype._deactivate = function () {
        this.state = "deactive";
        this.onStateChange.fire(this.state);
    };
    /**
     * @private
     */
    Scene.prototype._needsLoading = function () {
        return this._sceneAssetHolder.waitingAssetsCount > 0 || (!!this._storageLoader && !this._storageLoader._loaded);
    };
    /**
     * @private
     */
    Scene.prototype._load = function () {
        if (this._loaded)
            return;
        this._loaded = true;
        var needsWait = this._sceneAssetHolder.request();
        if (this._storageLoader) {
            this._storageLoader._load(this);
            needsWait = true;
        }
        if (!needsWait)
            this._notifySceneReady();
    };
    /**
     * @private
     */
    Scene.prototype._handleSceneAssetLoad = function (asset) {
        this.assets[asset.id] = asset;
        this.onAssetLoad.fire(asset);
        this.onAssetLoadComplete.fire(asset);
    };
    /**
     * @private
     */
    Scene.prototype._handleSceneAssetLoadFailure = function (failureInfo) {
        this.onAssetLoadFailure.fire(failureInfo);
        this.onAssetLoadComplete.fire(failureInfo.asset);
    };
    /**
     * @private
     */
    Scene.prototype._handleSceneAssetLoadFinish = function (holder, succeed) {
        if (!succeed) {
            this.game.terminateGame();
            return;
        }
        // 動的アセット (`requestAssets()` 由来) の場合
        if (holder.userData) {
            this.game._pushPostTickTask(holder.userData, null);
            return;
        }
        if (!this._loaded) {
            // prefetch() で開始されたアセット読み込みを完了したが、_load() がまだ呼ばれていない。
            // _notifySceneReady() は _load() 呼び出し後まで遅延する。
            return;
        }
        if (this._storageLoader && !this._storageLoader._loaded) {
            // アセット読み込みを完了したが、ストレージの読み込みが終わっていない。
            // _notifySceneReady() は  _onStorageLoaded() 呼び出し後まで遅延する。
            return;
        }
        this._notifySceneReady();
    };
    /**
     * @private
     */
    Scene.prototype._onStorageLoadError = function (_error) {
        this.game.terminateGame();
    };
    /**
     * @private
     */
    Scene.prototype._onStorageLoaded = function () {
        if (this._sceneAssetHolder.waitingAssetsCount === 0)
            this._notifySceneReady();
    };
    /**
     * @private
     */
    Scene.prototype._notifySceneReady = function () {
        // 即座に `_onReady` をfireすることはしない。tick()のタイミングで行うため、リクエストをgameに投げておく。
        this._loadingState = "ready";
        this.game._pushPostTickTask(this._fireReady, this);
    };
    /**
     * @private
     */
    Scene.prototype._fireReady = function () {
        if (this.destroyed())
            return;
        this._onReady.fire(this);
        this._loadingState = "ready-fired";
    };
    /**
     * @private
     */
    Scene.prototype._fireLoaded = function () {
        if (this.destroyed())
            return;
        if (this._loadingState === "loaded-fired")
            return;
        this.onLoad.fire(this);
        this._loadingState = "loaded-fired";
    };
    return Scene;
}());
exports.Scene = Scene;

},{"./AssetAccessor":3,"./AssetHolder":5,"./Camera2D":15,"./ExceptionFactory":28,"./TimerManager":68,"@akashic/trigger":213}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptAssetContext = void 0;
var ExceptionFactory_1 = require("./ExceptionFactory");
/**
 * `ScriptAsset` の実行コンテキスト。
 * 通常スクリプトアセットを実行するためにはこのクラスを経由する。
 *
 * ゲーム開発者がこのクラスを利用する必要はない。
 * スクリプトアセットを実行する場合は、暗黙にこのクラスを利用する `require()` を用いること。
 */
var ScriptAssetContext = /** @class */ (function () {
    function ScriptAssetContext(asset, module) {
        this._asset = asset;
        this._module = module;
        this._started = false;
    }
    /**
     * @private
     */
    ScriptAssetContext.prototype._cachedValue = function () {
        if (!this._started)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("ScriptAssetContext#_cachedValue: not executed yet.");
        return this._module.exports;
    };
    /**
     * @private
     */
    ScriptAssetContext.prototype._executeScript = function (currentModule) {
        if (this._started)
            return this._module.exports;
        if (currentModule) {
            // Node.js 互換挙動: Module#parent は一番最初に require() した module になる
            this._module.parent = currentModule;
            // Node.js 互換挙動: 親 module の children には自身が実行中の段階で既に追加されている
            currentModule.children.push(this._module);
        }
        this._started = true;
        this._asset.execute(this._module._runtimeValue);
        this._module.loaded = true;
        return this._module.exports;
    };
    return ScriptAssetContext;
}());
exports.ScriptAssetContext = ScriptAssetContext;

},{"./ExceptionFactory":28}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShaderProgram = void 0;
/**
 * akashic-engineにおけるシェーダ機能を提供するクラス。
 * 現バージョンのakashic-engineではフラグメントシェーダのみをサポートする。
 */
var ShaderProgram = /** @class */ (function () {
    /**
     * 各種パラメータを指定して `ShaderProgram` のインスタンスを生成する。
     * @param param `ShaderProgram` に設定するパラメータ
     */
    function ShaderProgram(param) {
        this.fragmentShader = param.fragmentShader;
        this.uniforms = param.uniforms;
    }
    return ShaderProgram;
}());
exports.ShaderProgram = ShaderProgram;

},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpriteFactory = void 0;
var Sprite_1 = require("./entities/Sprite");
var ExceptionFactory_1 = require("./ExceptionFactory");
var SpriteFactory = /** @class */ (function () {
    function SpriteFactory() {
    }
    /**
     * e の描画内容を持つ Sprite を生成する。
     * @param scene 作成したSpriteを登録するScene
     * @param e Sprite化したいE
     * @param camera 使用カメラ
     */
    SpriteFactory.createSpriteFromE = function (scene, e, camera) {
        var oldX = e.x;
        var oldY = e.y;
        var x = 0;
        var y = 0;
        var width = e.width;
        var height = e.height;
        var boundingRect = e.calculateBoundingRect();
        if (!boundingRect) {
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("SpriteFactory.createSpriteFromE: camera must look e");
        }
        width = boundingRect.right - boundingRect.left;
        height = boundingRect.bottom - boundingRect.top;
        if (boundingRect.left < e.x)
            x = e.x - boundingRect.left;
        if (boundingRect.top < e.y)
            y = e.y - boundingRect.top;
        e.moveTo(x, y);
        // 再描画フラグを立てたくないために e._matrix を直接触っている
        if (e._matrix)
            e._matrix._modified = true;
        var surface = scene.game.resourceFactory.createSurface(Math.ceil(width), Math.ceil(height));
        var renderer = surface.renderer();
        renderer.begin();
        e.render(renderer, camera);
        renderer.end();
        var s = new Sprite_1.Sprite({
            scene: scene,
            src: surface,
            width: width,
            height: height
        });
        s.moveTo(boundingRect.left, boundingRect.top);
        e.moveTo(oldX, oldY);
        if (e._matrix)
            e._matrix._modified = true;
        return s;
    };
    /**
     * scene の描画内容を持つ Sprite を生成する。
     * @param toScene 作ったSpriteを登録するScene
     * @param fromScene Sprite化したいScene
     * @param camera 使用カメラ
     */
    SpriteFactory.createSpriteFromScene = function (toScene, fromScene, camera) {
        var surface = toScene.game.resourceFactory.createSurface(Math.ceil(fromScene.game.width), Math.ceil(fromScene.game.height));
        var renderer = surface.renderer();
        renderer.begin();
        var children = fromScene.children;
        for (var i = 0; i < children.length; ++i)
            children[i].render(renderer, camera);
        renderer.end();
        return new Sprite_1.Sprite({
            scene: toScene,
            src: surface,
            width: fromScene.game.width,
            height: fromScene.game.height
        });
    };
    return SpriteFactory;
}());
exports.SpriteFactory = SpriteFactory;

},{"./ExceptionFactory":28,"./entities/Sprite":85}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = exports.StorageLoader = exports.StorageValueStore = exports.StorageCountsOperation = exports.StorageCondition = exports.StorageOrder = exports.StorageRegion = void 0;
// TODO: (GAMEDEV-1549) コメント整理
/**
 * 操作対象とするストレージのリージョンを表す。
 */
// サーバ仕様に則し、値を指定している。
var StorageRegion;
(function (StorageRegion) {
    /**
     * slotsを表す。
     */
    StorageRegion[StorageRegion["Slots"] = 1] = "Slots";
    /**
     * scoresを表す。
     */
    StorageRegion[StorageRegion["Scores"] = 2] = "Scores";
    /**
     * countsを表す。
     */
    StorageRegion[StorageRegion["Counts"] = 3] = "Counts";
    /**
     * valuesを表す。
     */
    StorageRegion[StorageRegion["Values"] = 4] = "Values";
})(StorageRegion = exports.StorageRegion || (exports.StorageRegion = {}));
/**
 * 一括取得を行う場合のソート順。
 */
var StorageOrder;
(function (StorageOrder) {
    /**
     * 昇順。
     */
    StorageOrder[StorageOrder["Asc"] = 0] = "Asc";
    /**
     * 降順。
     */
    StorageOrder[StorageOrder["Desc"] = 1] = "Desc";
})(StorageOrder = exports.StorageOrder || (exports.StorageOrder = {}));
/**
 * 条件を表す。
 */
// サーバ仕様に則し、値を指定している。
var StorageCondition;
(function (StorageCondition) {
    /**
     * 等価を表す（==）。
     */
    StorageCondition[StorageCondition["Equal"] = 1] = "Equal";
    /**
     * 「より大きい」を表す（>）。
     */
    StorageCondition[StorageCondition["GreaterThan"] = 2] = "GreaterThan";
    /**
     * 「より小さい」を表す（<）。
     */
    StorageCondition[StorageCondition["LessThan"] = 3] = "LessThan";
})(StorageCondition = exports.StorageCondition || (exports.StorageCondition = {}));
/**
 * Countsリージョンへの書き込み操作種別を表す。
 */
// サーバ仕様に則し、値を指定している。
var StorageCountsOperation;
(function (StorageCountsOperation) {
    /**
     * インクリメント操作を実行する。
     */
    StorageCountsOperation[StorageCountsOperation["Incr"] = 1] = "Incr";
    /**
     * デクリメント操作を実行する。
     */
    StorageCountsOperation[StorageCountsOperation["Decr"] = 2] = "Decr";
})(StorageCountsOperation = exports.StorageCountsOperation || (exports.StorageCountsOperation = {}));
/**
 * ストレージの値を保持するクラス。
 * ゲーム開発者がこのクラスのインスタンスを直接生成することはない。
 */
var StorageValueStore = /** @class */ (function () {
    function StorageValueStore(keys, values) {
        this._keys = keys;
        this._values = values;
    }
    /**
     * 値の配列を `StorageKey` またはインデックスから取得する。
     * 通常、インデックスは `Scene` のコンストラクタに指定した `storageKeys` のインデックスに対応する。
     * @param keyOrIndex `StorageKey` 又はインデックス
     */
    StorageValueStore.prototype.get = function (keyOrIndex) {
        if (this._values === undefined) {
            return [];
        }
        if (typeof keyOrIndex === "number") {
            return this._values[keyOrIndex];
        }
        else {
            var index = this._keys.indexOf(keyOrIndex);
            if (index !== -1) {
                return this._values[index];
            }
            for (var i = 0; i < this._keys.length; ++i) {
                var target = this._keys[i];
                if (target.region === keyOrIndex.region &&
                    target.regionKey === keyOrIndex.regionKey &&
                    target.userId === keyOrIndex.userId &&
                    target.gameId === keyOrIndex.gameId) {
                    return this._values[i];
                }
            }
        }
        return [];
    };
    /**
     * 値を `StorageKey` またはインデックスから取得する。
     * 対応する値が複数ある場合は、先頭の値を取得する。
     * 通常、インデックスは `Scene` のコンストラクタに指定した `storageKeys` のインデックスに対応する。
     * @param keyOrIndex `StorageKey` 又はインデックス
     */
    StorageValueStore.prototype.getOne = function (keyOrIndex) {
        var values = this.get(keyOrIndex);
        if (!values)
            return undefined;
        return values[0];
    };
    return StorageValueStore;
}());
exports.StorageValueStore = StorageValueStore;
/**
 * ストレージの値をロードするクラス。
 * ゲーム開発者がこのクラスのインスタンスを直接生成することはなく、
 * 本クラスの機能を利用することもない。
 */
var StorageLoader = /** @class */ (function () {
    function StorageLoader(storage, keys, serialization) {
        this._loaded = false;
        this._storage = storage;
        this._valueStore = new StorageValueStore(keys);
        this._handler = undefined;
        this._valueStoreSerialization = serialization;
    }
    /**
     * @private
     */
    StorageLoader.prototype._load = function (handler) {
        this._handler = handler;
        if (this._storage._load) {
            this._storage._load.call(this._storage, this._valueStore._keys, this, this._valueStoreSerialization);
        }
    };
    /**
     * @private
     */
    // 値の取得が完了したタイミングで呼び出される。
    // `values` は `this._valueStore._keys` に対応する値を表す `StorageValue` の配列。
    // 順番は `this._valueStore._keys` と同じでなければならない。
    StorageLoader.prototype._onLoaded = function (values, serialization) {
        this._valueStore._values = values;
        this._loaded = true;
        if (serialization)
            this._valueStoreSerialization = serialization;
        if (this._handler)
            this._handler._onStorageLoaded();
    };
    /**
     * @private
     */
    StorageLoader.prototype._onError = function (error) {
        if (this._handler)
            this._handler._onStorageLoadError(error);
    };
    return StorageLoader;
}());
exports.StorageLoader = StorageLoader;
/**
 * ストレージ。
 * ゲーム開発者がこのクラスのインスタンスを直接生成することはない。
 */
var Storage = /** @class */ (function () {
    function Storage() {
    }
    /**
     * ストレージに値を書き込む。
     * @param key ストレージキーを表す `StorageKey`
     * @param value 値を表す `StorageValue`
     * @param option 書き込みオプション
     */
    Storage.prototype.write = function (key, value, option) {
        if (this._write) {
            this._write(key, value, option);
        }
    };
    /**
     * 参加してくるプレイヤーの値をストレージから取得することを要求する。
     * 取得した値は `JoinEvent#storageValues` に格納される。
     * @param keys ストレージキーを表す `StorageReadKey` の配列。`StorageReadKey#userId` は無視される。
     */
    Storage.prototype.requestValuesForJoinPlayer = function (keys) {
        this._requestedKeysForJoinPlayer = keys;
    };
    /**
     * @private
     */
    Storage.prototype._createLoader = function (keys, serialization) {
        return new StorageLoader(this, keys, serialization);
    };
    /**
     * @private
     */
    // ストレージに値の書き込むを行う関数を登録する。
    // 登録した関数内の `this` は `Storage` を指す。
    Storage.prototype._registerWrite = function (write) {
        this._write = write;
    };
    /**
     * @private
     */
    // ストレージから値の読み込みを行う関数を登録する。
    // 登録した関数内の `this` は `Storage` を指す。
    // 読み込み完了した場合は、登録した関数内で `loader._onLoaded(values)` を呼ばなければならない。
    // エラーが発生した場合は、登録した関数内で `loader._onError(error)` を呼ばなければならない。
    Storage.prototype._registerLoad = function (load) {
        this._load = load;
    };
    return Storage;
}());
exports.Storage = Storage;

},{}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurfaceAtlas = void 0;
var SurfaceAtlasSlot_1 = require("./SurfaceAtlasSlot");
function getSurfaceAtlasSlot(slot, width, height) {
    while (slot) {
        if (slot.width >= width && slot.height >= height) {
            return slot;
        }
        // @ts-ignore
        slot = slot.next;
    }
    return null;
}
/**
 * サーフェスアトラス。
 *
 * 与えられたサーフェスの指定された領域をコピーし一枚のサーフェスにまとめる。
 *
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
var SurfaceAtlas = /** @class */ (function () {
    function SurfaceAtlas(surface) {
        this._surface = surface;
        this._emptySurfaceAtlasSlotHead = new SurfaceAtlasSlot_1.SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
        this._accessScore = 0;
        this._usedRectangleAreaSize = { width: 0, height: 0 };
    }
    SurfaceAtlas.prototype.reset = function () {
        var renderer = this._surface.renderer();
        renderer.begin();
        renderer.clear();
        renderer.end();
        this._emptySurfaceAtlasSlotHead = new SurfaceAtlasSlot_1.SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
        this._accessScore = 0;
        this._usedRectangleAreaSize.width = 0;
        this._usedRectangleAreaSize.height = 0;
    };
    /**
     * @private
     */
    SurfaceAtlas.prototype._acquireSurfaceAtlasSlot = function (width, height) {
        // Renderer#drawImage()でサーフェス上の一部を描画するとき、
        // 指定した部分に隣接する画素がにじみ出る現象が確認されている。
        // ここれではそれを避けるため1pixelの余白を与えている。
        width += 1;
        height += 1;
        var slot = getSurfaceAtlasSlot(this._emptySurfaceAtlasSlotHead, width, height);
        if (!slot) {
            return null;
        }
        var remainWidth = slot.width - width;
        var remainHeight = slot.height - height;
        var left;
        var right;
        if (remainWidth <= remainHeight) {
            left = new SurfaceAtlasSlot_1.SurfaceAtlasSlot(slot.x + width, slot.y, remainWidth, height);
            right = new SurfaceAtlasSlot_1.SurfaceAtlasSlot(slot.x, slot.y + height, slot.width, remainHeight);
        }
        else {
            left = new SurfaceAtlasSlot_1.SurfaceAtlasSlot(slot.x, slot.y + height, width, remainHeight);
            right = new SurfaceAtlasSlot_1.SurfaceAtlasSlot(slot.x + width, slot.y, remainWidth, slot.height);
        }
        left.prev = slot.prev;
        left.next = right;
        if (left.prev === null) {
            // left is head
            this._emptySurfaceAtlasSlotHead = left;
        }
        else {
            left.prev.next = left;
        }
        right.prev = left;
        right.next = slot.next;
        if (right.next) {
            right.next.prev = right;
        }
        var acquiredSlot = new SurfaceAtlasSlot_1.SurfaceAtlasSlot(slot.x, slot.y, width, height);
        this._updateUsedRectangleAreaSize(acquiredSlot);
        return acquiredSlot;
    };
    /**
     * @private
     */
    SurfaceAtlas.prototype._updateUsedRectangleAreaSize = function (slot) {
        var slotRight = slot.x + slot.width;
        var slotBottom = slot.y + slot.height;
        if (slotRight > this._usedRectangleAreaSize.width) {
            this._usedRectangleAreaSize.width = slotRight;
        }
        if (slotBottom > this._usedRectangleAreaSize.height) {
            this._usedRectangleAreaSize.height = slotBottom;
        }
    };
    /**
     * サーフェスを追加する。
     *
     * @param surface 追加するサーフェス
     * @param offsetX サーフェス内におけるX方向のオフセット位置。0以上の数値でなければならない
     * @param offsetY サーフェス内におけるY方向のオフセット位置。0以上の数値でなければならない
     * @param width サーフェス内における矩形の幅。0より大きい数値でなければならない
     * @param height サーフェス内における矩形の高さ。0より大きい数値でなければならない
     */
    SurfaceAtlas.prototype.addSurface = function (surface, offsetX, offsetY, width, height) {
        var slot = this._acquireSurfaceAtlasSlot(width, height);
        if (!slot) {
            return null;
        }
        var renderer = this._surface.renderer();
        renderer.begin();
        renderer.drawImage(surface, offsetX, offsetY, width, height, slot.x, slot.y);
        renderer.end();
        return slot;
    };
    /**
     * このSurfaceAtlasの破棄を行う。
     * 以後、このSurfaceを利用することは出来なくなる。
     */
    SurfaceAtlas.prototype.destroy = function () {
        this._surface.destroy();
    };
    /**
     * このSurfaceAtlasが破棄済であるかどうかを判定する。
     */
    SurfaceAtlas.prototype.destroyed = function () {
        return this._surface.destroyed();
    };
    /**
     * このSurfaceAtlasの大きさを取得する。
     */
    SurfaceAtlas.prototype.getAtlasUsedSize = function () {
        return this._usedRectangleAreaSize;
    };
    SurfaceAtlas.prototype.getAccessScore = function () {
        return this._accessScore;
    };
    return SurfaceAtlas;
}());
exports.SurfaceAtlas = SurfaceAtlas;

},{"./SurfaceAtlasSlot":60}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurfaceAtlasSet = void 0;
var SurfaceAtlas_1 = require("./SurfaceAtlas");
function calcAtlasSize(hint) {
    // @ts-ignore
    var width = Math.ceil(Math.min(hint.initialAtlasWidth, hint.maxAtlasWidth));
    // @ts-ignore
    var height = Math.ceil(Math.min(hint.initialAtlasHeight, hint.maxAtlasHeight));
    return { width: width, height: height };
}
/**
 * DynamicFont で使用される SurfaceAtlas を管理するクラス。
 *
 * 歴史的経緯のため、名前に反して DynamicFont 専用のクラスであり、汎用の SurfaceAtlas 管理クラスではない点に注意。
 */
var SurfaceAtlasSet = /** @class */ (function () {
    function SurfaceAtlasSet(params) {
        this._surfaceAtlases = [];
        this._atlasGlyphsTable = [];
        this._resourceFactory = params.resourceFactory;
        this._currentAtlasIndex = 0;
        var hint = params.hint ? params.hint : {};
        this._maxAtlasNum = hint.maxAtlasNum ? hint.maxAtlasNum : SurfaceAtlasSet.INITIAL_MAX_SURFACEATLAS_NUM;
        // 指定がないとき、やや古いモバイルデバイスでも確保できると言われる
        // 縦横512pxのテクスチャ一枚のアトラスにまとめる形にする
        // 2048x2048で確保してしまうと、Edge, Chrome にて処理が非常に遅くなることがある
        hint.initialAtlasWidth = hint.initialAtlasWidth ? hint.initialAtlasWidth : 512;
        hint.initialAtlasHeight = hint.initialAtlasHeight ? hint.initialAtlasHeight : 512;
        hint.maxAtlasWidth = hint.maxAtlasWidth ? hint.maxAtlasWidth : 512;
        hint.maxAtlasHeight = hint.maxAtlasHeight ? hint.maxAtlasHeight : 512;
        this._atlasSize = calcAtlasSize(hint);
    }
    /**
     * @private
     */
    SurfaceAtlasSet.prototype._deleteAtlas = function (delteNum) {
        for (var i = 0; i < delteNum; ++i) {
            var atlas = this._spliceLeastFrequentlyUsedAtlas();
            if (!atlas)
                return;
            atlas.destroy();
        }
    };
    /**
     * surfaceAtlases の最も利用されていない SurfaceAtlas を探し、 そのインデックスを返す。
     *
     * _surfaceAtlases の長さが 0 の場合、 -1 を返す。
     * @private
     */
    SurfaceAtlasSet.prototype._findLeastFrequentlyUsedAtlasIndex = function () {
        var minScore = Number.MAX_VALUE;
        var lowScoreAtlasIndex = -1;
        for (var i = 0; i < this._surfaceAtlases.length; ++i) {
            if (this._surfaceAtlases[i]._accessScore <= minScore) {
                minScore = this._surfaceAtlases[i]._accessScore;
                lowScoreAtlasIndex = i;
            }
        }
        return lowScoreAtlasIndex;
    };
    /**
     * surfaceAtlases の最も利用されていない SurfaceAtlas を切り離して返す。
     *
     * 返された SurfaceAtlas に紐づいていたすべての Glyph はサーフェスを失う (_isSurfaceValid が偽になる) 。
     * _surfaceAtlases の長さが 0 の場合、 何もせず null を返す。
     * @private
     */
    SurfaceAtlasSet.prototype._spliceLeastFrequentlyUsedAtlas = function () {
        var idx = this._findLeastFrequentlyUsedAtlasIndex();
        if (idx === -1)
            return null;
        if (this._currentAtlasIndex >= idx)
            --this._currentAtlasIndex;
        var spliced = this._surfaceAtlases.splice(idx, 1)[0];
        var glyphs = this._atlasGlyphsTable.splice(idx, 1)[0];
        for (var i = 0; i < glyphs.length; i++) {
            var glyph = glyphs[i];
            glyph.surface = undefined;
            glyph.isSurfaceValid = false;
            glyph._atlas = null;
        }
        return spliced;
    };
    /**
     * 空き領域のある SurfaceAtlas を探索する。
     * glyph が持つ情報を SurfaceAtlas へ移動し、移動した SurfaceAtlas の情報で glyph を置き換える。
     * glyph が持っていた surface は破棄される。
     *
     * 移動に成功した場合 `true` を、失敗した (空き領域が見つからなかった) 場合 `false` を返す。
     * @private
     */
    SurfaceAtlasSet.prototype._moveGlyphSurface = function (glyph) {
        for (var i = 0; i < this._surfaceAtlases.length; ++i) {
            var index = (this._currentAtlasIndex + i) % this._surfaceAtlases.length;
            var atlas = this._surfaceAtlases[index];
            var slot = atlas.addSurface(glyph.surface, glyph.x, glyph.y, glyph.width, glyph.height);
            if (slot) {
                this._currentAtlasIndex = index;
                if (glyph.surface)
                    glyph.surface.destroy();
                glyph.surface = atlas._surface;
                glyph.x = slot.x;
                glyph.y = slot.y;
                glyph._atlas = atlas;
                this._atlasGlyphsTable[index].push(glyph);
                return true;
            }
        }
        return false;
    };
    /**
     * サーフェスアトラスの再割り当てを行う。
     * @private
     */
    SurfaceAtlasSet.prototype._reallocateAtlas = function () {
        var atlas = null;
        if (this._surfaceAtlases.length >= this._maxAtlasNum) {
            atlas = this._spliceLeastFrequentlyUsedAtlas();
            atlas.reset();
        }
        else {
            atlas = new SurfaceAtlas_1.SurfaceAtlas(this._resourceFactory.createSurface(this._atlasSize.width, this._atlasSize.height));
        }
        this._surfaceAtlases.push(atlas);
        this._atlasGlyphsTable.push([]);
        this._currentAtlasIndex = this._surfaceAtlases.length - 1;
    };
    /**
     * 引数で指定されたindexのサーフェスアトラスを取得する。
     *
     * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
     * @param index 取得対象のインデックス
     */
    SurfaceAtlasSet.prototype.getAtlas = function (index) {
        return this._surfaceAtlases[index];
    };
    /**
     * サーフェスアトラスの保持数を取得する。
     *
     * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
     */
    SurfaceAtlasSet.prototype.getAtlasNum = function () {
        return this._surfaceAtlases.length;
    };
    /**
     * 最大サーフェスアトラス保持数取得する。
     */
    SurfaceAtlasSet.prototype.getMaxAtlasNum = function () {
        return this._maxAtlasNum;
    };
    /**
     * 最大アトラス保持数設定する。
     *
     * 設定された値が、現在保持している_surfaceAtlasesの数より大きい場合、
     * removeLeastFrequentlyUsedAtlas()で設定値まで削除する。
     * @param value 設定値
     */
    SurfaceAtlasSet.prototype.changeMaxAtlasNum = function (value) {
        this._maxAtlasNum = value;
        if (this._surfaceAtlases.length > this._maxAtlasNum) {
            var diff = this._surfaceAtlases.length - this._maxAtlasNum;
            this._deleteAtlas(diff);
        }
    };
    /**
     * サーフェスアトラスのサイズを取得する。
     *
     * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
     */
    SurfaceAtlasSet.prototype.getAtlasUsedSize = function () {
        return this._atlasSize;
    };
    /**
     * グリフを追加する。
     *
     * glyph が持っていたサーフェスは破棄され、このクラスが管理するいずれかの (サーフェスアトラスの) サーフェスに紐づけられる。
     * 追加に成功した場合 `true` を、失敗した (空き領域が見つからなかった) 場合 `false` を返す。
     *
     * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
     * @param glyph グリフ
     */
    SurfaceAtlasSet.prototype.addGlyph = function (glyph) {
        // グリフがアトラスより大きいとき、`_atlasSet.addGlyph()`は失敗する。
        // `_reallocateAtlas()`でアトラス増やしてもこれは解決できない。
        // 無駄な空き領域探索とアトラスの再確保を避けるためにここでリターンする。
        if (glyph.width > this._atlasSize.width || glyph.height > this._atlasSize.height) {
            return false;
        }
        if (this._moveGlyphSurface(glyph))
            return true;
        // retry
        this._reallocateAtlas();
        return this._moveGlyphSurface(glyph);
    };
    /**
     * グリフの利用を通知する。
     *
     * サーフェスが不足した時、このクラスは最も利用頻度の低いサーフェスを解放して再利用する。
     * このメソッドによるグリフの利用通知は、利用頻度の低いサーフェスを特定するために利用される。
     *
     * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
     * @param glyph グリフ
     */
    SurfaceAtlasSet.prototype.touchGlyph = function (glyph) {
        // スコア更新
        // NOTE: LRUを捨てる方式なら単純なタイムスタンプのほうがわかりやすいかもしれない
        // NOTE: 正確な時刻は必要ないはずで、インクリメンタルなカウンタで代用すればDate()生成コストは省略できる
        if (glyph._atlas)
            glyph._atlas._accessScore += 1;
        for (var i = 0; i < this._surfaceAtlases.length; i++) {
            var atlas = this._surfaceAtlases[i];
            atlas._accessScore /= 2;
        }
    };
    /**
     * このインスタンスを破棄する。
     */
    SurfaceAtlasSet.prototype.destroy = function () {
        for (var i = 0; i < this._surfaceAtlases.length; ++i) {
            this._surfaceAtlases[i].destroy();
        }
        this._surfaceAtlases = undefined;
        this._resourceFactory = undefined;
        this._atlasGlyphsTable = undefined;
    };
    /**
     * このインスタンスが破棄済みであるかどうかを返す。
     */
    SurfaceAtlasSet.prototype.destroyed = function () {
        return this._surfaceAtlases === undefined;
    };
    /**
     * SurfaceAtlas最大保持数初期値
     */
    SurfaceAtlasSet.INITIAL_MAX_SURFACEATLAS_NUM = 10;
    return SurfaceAtlasSet;
}());
exports.SurfaceAtlasSet = SurfaceAtlasSet;

},{"./SurfaceAtlas":58}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurfaceAtlasSlot = void 0;
/**
 * SurfaceAtlasの空き領域管理クラス。
 *
 * 本クラスのインスタンスをゲーム開発者が直接生成することはなく、ゲーム開発者が利用する必要もない。
 */
var SurfaceAtlasSlot = /** @class */ (function () {
    function SurfaceAtlasSlot(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.prev = null;
        this.next = null;
    }
    return SurfaceAtlasSlot;
}());
exports.SurfaceAtlasSlot = SurfaceAtlasSlot;

},{}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurfaceUtil = void 0;
var ExceptionFactory_1 = require("./ExceptionFactory");
/**
 * Surface に関連するユーティリティ。
 */
var SurfaceUtil;
(function (SurfaceUtil) {
    /**
     * 引数 `src` が `undefined` または `Surface` でそのまま返す。
     * そうでなくかつ `ImageAsset` であれば `Surface` に変換して返す。
     *
     * @param src
     */
    function asSurface(src) {
        if (!src) {
            return undefined;
        }
        else if ("type" in src && src.type === "image") {
            return src.asSurface();
        }
        else if ("_drawable" in src) {
            return src;
        }
        throw ExceptionFactory_1.ExceptionFactory.createTypeMismatchError("SurfaceUtil#asSurface", "ImageAsset|Surface", src);
    }
    SurfaceUtil.asSurface = asSurface;
    /**
     * サーフェスのアニメーティングイベントへのハンドラ登録。
     *
     * これはエンジンが利用するものであり、ゲーム開発者が呼び出す必要はない。
     *
     * @param animatingHandler アニメーティングハンドラ
     * @param surface サーフェス
     */
    function setupAnimatingHandler(animatingHandler, surface) {
        if (surface.isPlaying()) {
            animatingHandler._handleAnimationStart();
        }
    }
    SurfaceUtil.setupAnimatingHandler = setupAnimatingHandler;
    /**
     * アニメーティングハンドラを別のサーフェスへ移動する。
     *
     * これはエンジンが利用するものであり、ゲーム開発者が呼び出す必要はない。
     *
     * @param animatingHandler アニメーティングハンドラ
     * @param beforeSurface ハンドラ登録を解除するサーフェス
     * @param afterSurface ハンドラを登録するサーフェス
     */
    function migrateAnimatingHandler(animatingHandler, _beforeSurface, afterSurface) {
        animatingHandler._handleAnimationStop();
        if (afterSurface.isPlaying()) {
            animatingHandler._handleAnimationStart();
        }
    }
    SurfaceUtil.migrateAnimatingHandler = migrateAnimatingHandler;
    /**
     * 対象の `Surface` にナインパッチ処理された `Surface` を描画する。
     *
     * これは、画像素材の拡大・縮小において「枠」の表現を実現するものである。
     * 画像の上下左右の「枠」部分の幅・高さを渡すことで、上下の「枠」を縦に引き延ばすことなく、
     * また左右の「枠」を横に引き延ばすことなく画像を任意サイズに拡大・縮小できる。
     * ゲームにおけるメッセージウィンドウやダイアログの表現に利用することを想定している。
     *
     * @param destSurface 描画先 `Surface`
     * @param srcSurface 描画元 `Surface`
     * @param borderWidth 上下左右の「拡大しない」領域の大きさ。すべて同じ値なら数値一つを渡すことができる。省略された場合、 `4`
     */
    function drawNinePatch(destSurface, srcSurface, borderWidth) {
        if (borderWidth === void 0) { borderWidth = 4; }
        var renderer = destSurface.renderer();
        renderer.begin();
        renderer.clear();
        renderNinePatch(renderer, destSurface.width, destSurface.height, srcSurface, borderWidth);
        renderer.end();
    }
    SurfaceUtil.drawNinePatch = drawNinePatch;
    /**
     * 対象の `Renderer` にナインパッチ処理された `Surface` を描画する。
     *
     * 開発者は以下のような状況でこの関数を利用すべきである。
     * * E を継承した独自の Entity を renderSelf() メソッドで描画する場合。この場合描画先の Surface が不明なので drawNinePatch() よりもこの関数の方が適している。
     * * Surface全体ではなく部分的に描画したい場合。drawNinePatch() では Surface 全体の描画にしか対応していないため。
     *
     * @param renderer 描画先 `Renderer`
     * @param width 描画先の横幅
     * @param height 描画先の縦幅
     * @param surface 描画元 `Surface`
     * @param borderWidth 上下左右の「拡大しない」領域の大きさ。すべて同じ値なら数値一つを渡すことができる。省略された場合、 `4`
     */
    function renderNinePatch(renderer, width, height, surface, borderWidth) {
        if (borderWidth === void 0) { borderWidth = 4; }
        var border;
        if (typeof borderWidth === "number") {
            border = {
                top: borderWidth,
                bottom: borderWidth,
                left: borderWidth,
                right: borderWidth
            };
        }
        else {
            border = borderWidth;
        }
        //    x0  x1                          x2
        // y0 +-----------------------------------+
        //    | 1 |             5             | 2 |
        // y1 |---+---------------------------+---|
        //    |   |                           |   |
        //    | 7 |             9             | 8 |
        //    |   |                           |   |
        // y2 |---+---------------------------+---|
        //    | 3 |             6             | 4 |
        //    +-----------------------------------+
        //
        // 1-4: 拡縮無し
        // 5-6: 水平方向へ拡縮
        // 7-8: 垂直方向へ拡縮
        // 9  : 全方向へ拡縮
        var sx1 = border.left;
        var sx2 = surface.width - border.right;
        var sy1 = border.top;
        var sy2 = surface.height - border.bottom;
        var dx1 = border.left;
        var dx2 = width - border.right;
        var dy1 = border.top;
        var dy2 = height - border.bottom;
        // Draw corners
        var srcCorners = [
            {
                x: 0,
                y: 0,
                width: border.left,
                height: border.top
            },
            {
                x: sx2,
                y: 0,
                width: border.right,
                height: border.top
            },
            {
                x: 0,
                y: sy2,
                width: border.left,
                height: border.bottom
            },
            {
                x: sx2,
                y: sy2,
                width: border.right,
                height: border.bottom
            }
        ];
        var destCorners = [
            { x: 0, y: 0 },
            { x: dx2, y: 0 },
            { x: 0, y: dy2 },
            { x: dx2, y: dy2 }
        ];
        for (var i = 0; i < srcCorners.length; ++i) {
            var c = srcCorners[i];
            renderer.save();
            renderer.translate(destCorners[i].x, destCorners[i].y);
            renderer.drawImage(surface, c.x, c.y, c.width, c.height, 0, 0);
            renderer.restore();
        }
        // Draw borders
        var srcBorders = [
            { x: sx1, y: 0, width: sx2 - sx1, height: border.top },
            { x: 0, y: sy1, width: border.left, height: sy2 - sy1 },
            { x: sx2, y: sy1, width: border.right, height: sy2 - sy1 },
            { x: sx1, y: sy2, width: sx2 - sx1, height: border.bottom }
        ];
        var destBorders = [
            { x: dx1, y: 0, width: dx2 - dx1, height: border.top },
            { x: 0, y: dy1, width: border.left, height: dy2 - dy1 },
            { x: dx2, y: dy1, width: border.right, height: dy2 - dy1 },
            { x: dx1, y: dy2, width: dx2 - dx1, height: border.bottom }
        ];
        for (var i = 0; i < srcBorders.length; ++i) {
            var s = srcBorders[i];
            var d = destBorders[i];
            renderer.save();
            renderer.translate(d.x, d.y);
            renderer.transform([d.width / s.width, 0, 0, d.height / s.height, 0, 0]);
            renderer.drawImage(surface, s.x, s.y, s.width, s.height, 0, 0);
            renderer.restore();
        }
        // Draw center
        var sw = sx2 - sx1;
        var sh = sy2 - sy1;
        var dw = dx2 - dx1;
        var dh = dy2 - dy1;
        renderer.save();
        renderer.translate(dx1, dy1);
        renderer.transform([dw / sw, 0, 0, dh / sh, 0, 0]);
        renderer.drawImage(surface, sx1, sy1, sw, sh, 0, 0);
        renderer.restore();
    }
    SurfaceUtil.renderNinePatch = renderNinePatch;
})(SurfaceUtil = exports.SurfaceUtil || (exports.SurfaceUtil = {}));

},{"./ExceptionFactory":28}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextAlign = void 0;
/**
 * テキストの描画位置。
 * @deprecated 非推奨である。将来的に削除される。代わりに `TextAlignString` を利用すること。
 */
var TextAlign;
(function (TextAlign) {
    /**
     * 左寄せ。
     */
    TextAlign[TextAlign["Left"] = 0] = "Left";
    /**
     * 中央寄せ。
     */
    TextAlign[TextAlign["Center"] = 1] = "Center";
    /**
     * 右寄せ。
     */
    TextAlign[TextAlign["Right"] = 2] = "Right";
})(TextAlign = exports.TextAlign || (exports.TextAlign = {}));

},{}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],67:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
var trigger_1 = require("@akashic/trigger");
/**
 * 一定時間で繰り返される処理を表すタイマー。
 *
 * ゲーム開発者が本クラスのインスタンスを直接生成することはなく、
 * 通常はScene#setTimeout、Scene#setIntervalによって間接的に利用する。
 */
var Timer = /** @class */ (function () {
    function Timer(interval, fps) {
        this.interval = interval;
        // NOTE: intervalが浮動小数の場合があるため念のため四捨五入する
        this._scaledInterval = Math.round(interval * fps);
        this.onElapse = new trigger_1.Trigger();
        this.elapsed = this.onElapse;
        this._scaledElapsed = 0;
    }
    Timer.prototype.tick = function () {
        // NOTE: 1000 / fps * fps = 1000
        this._scaledElapsed += 1000;
        while (this._scaledElapsed >= this._scaledInterval) {
            // NOTE: this.elapsed.fire()内でdestroy()される可能性があるため、destroyed()を判定する
            if (!this.onElapse) {
                break;
            }
            this.onElapse.fire();
            this._scaledElapsed -= this._scaledInterval;
        }
    };
    Timer.prototype.canDelete = function () {
        return !this.onElapse || this.onElapse.length === 0;
    };
    Timer.prototype.destroy = function () {
        this.interval = undefined;
        this.onElapse.destroy();
        this.onElapse = undefined;
        this.elapsed = undefined;
        this._scaledInterval = 0;
        this._scaledElapsed = 0;
    };
    Timer.prototype.destroyed = function () {
        return this.onElapse === undefined;
    };
    return Timer;
}());
exports.Timer = Timer;

},{"@akashic/trigger":213}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimerManager = exports.TimerIdentifier = void 0;
var ExceptionFactory_1 = require("./ExceptionFactory");
var Timer_1 = require("./Timer");
/**
 * `Scene#setTimeout` や `Scene#setInterval` の実行単位を表す。
 * ゲーム開発者が本クラスのインスタンスを直接生成することはなく、
 * 本クラスの機能を直接利用することはない。
 */
var TimerIdentifier = /** @class */ (function () {
    function TimerIdentifier(timer, handler, handlerOwner, fired, firedOwner) {
        this._timer = timer;
        this._handler = handler;
        this._handlerOwner = handlerOwner;
        this._fired = fired;
        this._firedOwner = firedOwner;
        this._timer.onElapse.add(this._handleElapse, this);
    }
    TimerIdentifier.prototype.destroy = function () {
        this._timer.onElapse.remove(this._handleElapse, this);
        this._timer = undefined;
        this._handler = undefined;
        this._handlerOwner = undefined;
        this._fired = undefined;
        this._firedOwner = undefined;
    };
    TimerIdentifier.prototype.destroyed = function () {
        return this._timer === undefined;
    };
    /**
     * @private
     */
    TimerIdentifier.prototype._handleElapse = function () {
        if (this.destroyed())
            return;
        this._handler.call(this._handlerOwner);
        if (this._fired) {
            this._fired.call(this._firedOwner, this);
        }
    };
    return TimerIdentifier;
}());
exports.TimerIdentifier = TimerIdentifier;
/**
 * Timerを管理する機構を提供する。
 * ゲーム開発者が本クラスを利用する事はない。
 */
var TimerManager = /** @class */ (function () {
    function TimerManager(trigger, fps) {
        this._timers = [];
        this._trigger = trigger;
        this._identifiers = [];
        this._fps = fps;
        this._registered = false;
    }
    TimerManager.prototype.destroy = function () {
        for (var i = 0; i < this._identifiers.length; ++i) {
            this._identifiers[i].destroy();
        }
        for (var i = 0; i < this._timers.length; ++i) {
            this._timers[i].destroy();
        }
        this._timers = undefined;
        this._trigger = undefined;
        this._identifiers = undefined;
        this._fps = undefined;
    };
    TimerManager.prototype.destroyed = function () {
        return this._timers === undefined;
    };
    /**
     * 定期間隔で処理を実行するTimerを作成する。
     * 本Timerはフレーム経過によって動作する疑似タイマーであるため、実時間の影響は受けない
     * @param interval Timerの実行間隔（ミリ秒）
     * @returns 作成したTimer
     */
    TimerManager.prototype.createTimer = function (interval) {
        if (!this._registered) {
            this._trigger.add(this._tick, this);
            this._registered = true;
        }
        if (interval < 0)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("TimerManager#createTimer: invalid interval");
        // NODE: intervalが0の場合に、Timer#tick()で無限ループとなるためintervalの最小値を1とする。
        if (interval < 1)
            interval = 1;
        // NOTE: Timerの_scaledElapsedと比較するため、this.fps倍した値を用いる
        // Math.min(1000 / this._fps * this.fps, interval * this._fps);
        var acceptableMargin = Math.min(1000, interval * this._fps);
        for (var i = 0; i < this._timers.length; ++i) {
            if (this._timers[i].interval === interval) {
                if (this._timers[i]._scaledElapsed < acceptableMargin) {
                    return this._timers[i];
                }
            }
        }
        var timer = new Timer_1.Timer(interval, this._fps);
        this._timers.push(timer);
        return timer;
    };
    /**
     * Timerを削除する。
     * @param timer 削除するTimer
     */
    TimerManager.prototype.deleteTimer = function (timer) {
        if (!timer.canDelete())
            return;
        var index = this._timers.indexOf(timer);
        if (index < 0)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("TimerManager#deleteTimer: can not find timer");
        this._timers.splice(index, 1);
        timer.destroy();
        if (!this._timers.length) {
            if (!this._registered)
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("TimerManager#deleteTimer: handler is not handled");
            this._trigger.remove(this._tick, this);
            this._registered = false;
        }
    };
    TimerManager.prototype.setTimeout = function (handler, milliseconds, owner) {
        var timer = this.createTimer(milliseconds);
        var identifier = new TimerIdentifier(timer, handler, owner, this._onTimeoutFired, this);
        this._identifiers.push(identifier);
        return identifier;
    };
    TimerManager.prototype.clearTimeout = function (identifier) {
        this._clear(identifier);
    };
    TimerManager.prototype.setInterval = function (handler, interval, owner) {
        var timer = this.createTimer(interval);
        var identifier = new TimerIdentifier(timer, handler, owner);
        this._identifiers.push(identifier);
        return identifier;
    };
    TimerManager.prototype.clearInterval = function (identifier) {
        this._clear(identifier);
    };
    /**
     * すべてのTimerを時間経過させる。
     * @private
     */
    TimerManager.prototype._tick = function () {
        var timers = this._timers.concat();
        for (var i = 0; i < timers.length; ++i)
            timers[i].tick();
    };
    /**
     * @private
     */
    TimerManager.prototype._onTimeoutFired = function (identifier) {
        var index = this._identifiers.indexOf(identifier);
        if (index < 0)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("TimerManager#_onTimeoutFired: can not find identifier");
        this._identifiers.splice(index, 1);
        var timer = identifier._timer;
        identifier.destroy();
        this.deleteTimer(timer);
    };
    /**
     * @private
     */
    TimerManager.prototype._clear = function (identifier) {
        var index = this._identifiers.indexOf(identifier);
        if (index < 0)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("TimerManager#_clear: can not find identifier");
        if (identifier.destroyed())
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("TimerManager#_clear: invalid identifier");
        this._identifiers.splice(index, 1);
        var timer = identifier._timer;
        identifier.destroy();
        this.deleteTimer(timer);
    };
    return TimerManager;
}());
exports.TimerManager = TimerManager;

},{"./ExceptionFactory":28,"./Timer":67}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
var pdi_types_1 = require("@akashic/pdi-types");
/**
 * ユーティリティ。
 */
var Util;
(function (Util) {
    var _a;
    /**
     * 2点間(P1..P2)の距離(pixel)を返す。
     * @param {number} p1x P1-X
     * @param {number} p1y P1-Y
     * @param {number} p2x P2-X
     * @param {number} p2y P2-Y
     */
    function distance(p1x, p1y, p2x, p2y) {
        return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
    }
    Util.distance = distance;
    /**
     * 2点間(P1..P2)の距離(pixel)を返す。
     * @param {CommonOffset} p1 座標1
     * @param {CommonOffset} p2 座標2
     */
    function distanceBetweenOffsets(p1, p2) {
        return Util.distance(p1.x, p1.y, p2.x, p2.y);
    }
    Util.distanceBetweenOffsets = distanceBetweenOffsets;
    /**
     * 2つの矩形の中心座標(P1..P2)間の距離(pixel)を返す。
     * @param {CommonArea} p1 矩形1
     * @param {CommonArea} p2 矩形2
     */
    function distanceBetweenAreas(p1, p2) {
        return Util.distance(p1.x + p1.width / 2, p1.y + p1.height / 2, p2.x + p2.width / 2, p2.y + p2.height / 2);
    }
    Util.distanceBetweenAreas = distanceBetweenAreas;
    /**
     * idx文字目の文字のchar codeを返す。
     *
     * これはString#charCodeAt()と次の点で異なる。
     * - idx文字目が上位サロゲートの時これを16bit左シフトし、idx+1文字目の下位サロゲートと論理和をとった値を返す。
     * - idx文字目が下位サロゲートの時nullを返す。
     *
     * @param str 文字を取り出される文字列
     * @param idx 取り出される文字の位置
     */
    // highly based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
    function charCodeAt(str, idx) {
        var code = str.charCodeAt(idx);
        if (0xd800 <= code && code <= 0xdbff) {
            var hi = code;
            var low = str.charCodeAt(idx + 1);
            return (hi << 16) | low;
        }
        if (0xdc00 <= code && code <= 0xdfff) {
            // Low surrogate
            return null;
        }
        return code;
    }
    Util.charCodeAt = charCodeAt;
    /**
     * enum の値の文字列を snake-case に変換した文字列を返す。
     * @deprecated 非推奨である。非推奨の機能との互換性確保のために存在する。ゲーム開発者が使用すべきではない。
     */
    function enumToSnakeCase(enumDef, val) {
        var s = enumDef[val];
        // 呼び出し元で型が正しいことの保証が必要
        return (s[0].toLowerCase() + s.slice(1).replace(/[A-Z]/g, function (c) { return "-" + c.toLowerCase(); }));
    }
    Util.enumToSnakeCase = enumToSnakeCase;
    /**
     * 数値を範囲内［min, max］に丸める
     * @param num 丸める値
     * @param min 値の下限
     * @param max 値の上限
     */
    function clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    }
    Util.clamp = clamp;
    /**
     * CompositeOperation を CompositeOperationString に読み替えるテーブル。
     * @deprecated 非推奨である。非推奨の機能との互換性のために存在する。ゲーム開発者が使用すべきではない。
     */
    // enumToSnakeCase() で代用できるが、 CompositeOperation の変換は複数回実行されうるので専用のテーブルを作っている。
    Util.compositeOperationStringTable = (_a = {},
        _a[pdi_types_1.CompositeOperation.SourceOver] = "source-over",
        _a[pdi_types_1.CompositeOperation.SourceAtop] = "source-atop",
        _a[pdi_types_1.CompositeOperation.Lighter] = "lighter",
        _a[pdi_types_1.CompositeOperation.Copy] = "copy",
        _a[pdi_types_1.CompositeOperation.ExperimentalSourceIn] = "experimental-source-in",
        _a[pdi_types_1.CompositeOperation.ExperimentalSourceOut] = "experimental-source-out",
        _a[pdi_types_1.CompositeOperation.ExperimentalDestinationAtop] = "experimental-destination-atop",
        _a[pdi_types_1.CompositeOperation.ExperimentalDestinationIn] = "experimental-destination-in",
        _a[pdi_types_1.CompositeOperation.DestinationOut] = "destination-out",
        _a[pdi_types_1.CompositeOperation.DestinationOver] = "destination-over",
        _a[pdi_types_1.CompositeOperation.Xor] = "xor",
        _a);
})(Util = exports.Util || (exports.Util = {}));

},{"@akashic/pdi-types":193}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoSystem = void 0;
/**
 * 将来 VideoPlayerインスタンスの一元管理（ボリューム設定などAudioSystemと似た役割）
 * を担うインターフェース。VideoAssetはVideoSystemを持つという体裁を整えるために(中身が空であるが)
 * 定義されている。
 * TODO: 実装
 */
var VideoSystem = /** @class */ (function () {
    function VideoSystem() {
    }
    return VideoSystem;
}());
exports.VideoSystem = VideoSystem;

},{}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeakRefKVS = void 0;
/**
 * @private
 */
var PseudoWeakRef = /** @class */ (function () {
    function PseudoWeakRef(target) {
        this._target = target;
    }
    PseudoWeakRef.prototype.deref = function () {
        return this._target;
    };
    return PseudoWeakRef;
}());
/**
 * 対象の値を弱参照として保持する Key-Value 型データストア。
 * 通常、ゲーム開発者はこのクラスを利用する必要はない。
 */
var WeakRefKVS = /** @class */ (function () {
    function WeakRefKVS() {
        this._weakRefClass = typeof WeakRef !== "undefined" ? WeakRef : PseudoWeakRef;
        this._refMap = Object.create(null);
    }
    WeakRefKVS.prototype.set = function (key, value) {
        if (this._refMap[key]) {
            this.delete(key);
        }
        this._refMap[key] = new this._weakRefClass(value);
    };
    WeakRefKVS.prototype.get = function (key) {
        var ref = this._refMap[key];
        if (!ref) {
            return undefined;
        }
        return ref.deref();
    };
    WeakRefKVS.prototype.has = function (key) {
        return key in this._refMap;
    };
    WeakRefKVS.prototype.delete = function (key) {
        delete this._refMap[key];
    };
    WeakRefKVS.prototype.keys = function () {
        return Object.keys(this._refMap);
    };
    WeakRefKVS.prototype.clear = function () {
        this._refMap = Object.create(null);
    };
    /**
     * 参照されなくなった target のキーをマップから削除する。
     */
    WeakRefKVS.prototype.clean = function () {
        for (var _i = 0, _a = Object.entries(this._refMap); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], ref = _b[1];
            if (ref.deref() === undefined)
                this.delete(key);
        }
    };
    return WeakRefKVS;
}());
exports.WeakRefKVS = WeakRefKVS;

},{}],72:[function(require,module,exports){
"use strict";
// Copyright (c) 2014 Andreas Madsen & Emil Bay
// From https://github.com/AndreasMadsen/xorshift
// https://github.com/AndreasMadsen/xorshift/blob/master/LICENSE.md
// Arranged by DWANGO Co., Ltd.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Xorshift = void 0;
var Xorshift = /** @class */ (function () {
    function Xorshift(seed) {
        var seeds = Array.isArray(seed) ? seed : this.generateSeeds(seed);
        this._state0U = seeds[0] | 0;
        this._state0L = seeds[1] | 0;
        this._state1U = seeds[2] | 0;
        this._state1L = seeds[3] | 0;
    }
    Xorshift.deserialize = function (ser) {
        var ret = new Xorshift([ser._state0U, ser._state0L, ser._state1U, ser._state1L]);
        return ret;
    };
    Xorshift.prototype.initState = function (seed) {
        var seeds = this.generateSeeds(seed);
        this._state0L = seeds[0] | 0;
        this._state0U = seeds[1] | 0;
        this._state1L = seeds[2] | 0;
        this._state1U = seeds[3] | 0;
    };
    Xorshift.prototype.randomInt = function () {
        var s1U = this._state0U;
        var s1L = this._state0L;
        var s0U = this._state1U;
        var s0L = this._state1L;
        var sumL = (s0L >>> 0) + (s1L >>> 0);
        var resU = (s0U + s1U + ((sumL / 2) >>> 31)) >>> 0;
        var resL = sumL >>> 0;
        this._state0U = s0U;
        this._state0L = s0L;
        var t1U = 0;
        var t1L = 0;
        var t2U = 0;
        var t2L = 0;
        var a1 = 23;
        var m1 = 0xffffffff << (32 - a1);
        t1U = (s1U << a1) | ((s1L & m1) >>> (32 - a1));
        t1L = s1L << a1;
        s1U = s1U ^ t1U;
        s1L = s1L ^ t1L;
        t1U = s1U ^ s0U;
        t1L = s1L ^ s0L;
        var a2 = 18;
        var m2 = 0xffffffff >>> (32 - a2);
        t2U = s1U >>> a2;
        t2L = (s1L >>> a2) | ((s1U & m2) << (32 - a2));
        t1U = t1U ^ t2U;
        t1L = t1L ^ t2L;
        var a3 = 5;
        var m3 = 0xffffffff >>> (32 - a3);
        t2U = s0U >>> a3;
        t2L = (s0L >>> a3) | ((s0U & m3) << (32 - a3));
        t1U = t1U ^ t2U;
        t1L = t1L ^ t2L;
        this._state1U = t1U;
        this._state1L = t1L;
        return [resU, resL];
    };
    Xorshift.prototype.random = function () {
        var t2 = this.randomInt();
        // Math.pow(2, -32) = 2.3283064365386963e-10
        // Math.pow(2, -52) = 2.220446049250313e-16
        return t2[0] * 2.3283064365386963e-10 + (t2[1] >>> 12) * 2.220446049250313e-16;
    };
    Xorshift.prototype.nextInt = function (min, sup) {
        return Math.floor(min + this.random() * (sup - min));
    };
    Xorshift.prototype.serialize = function () {
        return {
            _state0U: this._state0U,
            _state0L: this._state0L,
            _state1U: this._state1U,
            _state1L: this._state1L
        };
    };
    // シード値が1つの場合にどのようにして初期状態を定義するかは特に定まっていない
    // このコードはロジック的な裏付けは無いが採用例が多いために採用した
    // 以下採用例
    // http://meme.biology.tohoku.ac.jp/klabo-wiki/index.php?cmd=read&page=%B7%D7%BB%BB%B5%A1%2FC%2B%2B#y919a7e1
    // http://hexadrive.sblo.jp/article/63660775.html
    // http://meme.biology.tohoku.ac.jp/students/iwasaki/cxx/random.html#xorshift
    Xorshift.prototype.generateSeeds = function (seed) {
        var factor = 1812433253;
        seed = factor * (seed ^ (seed >> 30)) + 1;
        var seed1 = seed;
        seed = factor * (seed ^ (seed >> 30)) + 2;
        var seed2 = seed;
        seed = factor * (seed ^ (seed >> 30)) + 3;
        var seed3 = seed;
        seed = factor * (seed ^ (seed >> 30)) + 4;
        var seed4 = seed;
        return [seed1, seed2, seed3, seed4];
    };
    return Xorshift;
}());
exports.Xorshift = Xorshift;

},{}],73:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.XorshiftRandomGenerator = void 0;
var ExceptionFactory_1 = require("./ExceptionFactory");
var RandomGenerator_1 = require("./RandomGenerator");
var Xorshift_1 = require("./Xorshift");
/**
 * Xorshiftを用いた乱数生成期。
 */
var XorshiftRandomGenerator = /** @class */ (function (_super) {
    __extends(XorshiftRandomGenerator, _super);
    function XorshiftRandomGenerator(seed, xorshift) {
        var _this = this;
        if (seed === undefined) {
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("XorshiftRandomGenerator#constructor: seed is undefined");
        }
        else {
            _this = _super.call(this, seed) || this;
            if (!!xorshift) {
                _this._xorshift = Xorshift_1.Xorshift.deserialize(xorshift);
            }
            else {
                _this._xorshift = new Xorshift_1.Xorshift(seed);
            }
        }
        return _this;
    }
    XorshiftRandomGenerator.deserialize = function (ser) {
        return new XorshiftRandomGenerator(ser._seed, ser._xorshift);
    };
    /**
     * 乱数を生成する。
     * `min` 以上 `max` 以下の数値を返す。
     *
     * @deprecated 非推奨である。将来的に削除される。代わりに `XorshiftRandomGenerator#generate()` を利用すること。
     */
    XorshiftRandomGenerator.prototype.get = function (min, max) {
        return this._xorshift.nextInt(min, max + 1);
    };
    /**
     * 乱数を生成する。
     * 0 以上 1 未満の数値を返す。
     *
     * ローカルイベントの処理中を除き、原則 `Math.random()` ではなくこのメソッドを利用すること。
     */
    XorshiftRandomGenerator.prototype.generate = function () {
        return this._xorshift.random();
    };
    XorshiftRandomGenerator.prototype.serialize = function () {
        return {
            _seed: this.seed,
            _xorshift: this._xorshift.serialize()
        };
    };
    return XorshiftRandomGenerator;
}(RandomGenerator_1.RandomGenerator));
exports.XorshiftRandomGenerator = XorshiftRandomGenerator;

},{"./ExceptionFactory":28,"./RandomGenerator":48,"./Xorshift":72}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyBinaryAsset = void 0;
var trigger_1 = require("@akashic/trigger");
var EmptyBinaryAsset = /** @class */ (function () {
    function EmptyBinaryAsset(id, path) {
        this.type = "binary";
        this.onDestroyed = new trigger_1.Trigger();
        this.id = id;
        this.path = path;
        this.originalPath = path;
        this.data = new ArrayBuffer(0);
    }
    EmptyBinaryAsset.prototype.inUse = function () {
        return false;
    };
    EmptyBinaryAsset.prototype.destroy = function () {
        if (this.destroyed()) {
            return;
        }
        this.onDestroyed.destroy();
        this.onDestroyed = undefined;
    };
    EmptyBinaryAsset.prototype.destroyed = function () {
        return !this.onDestroyed;
    };
    EmptyBinaryAsset.prototype._load = function (loader) {
        loader._onAssetLoad(this);
    };
    EmptyBinaryAsset.prototype._assetPathFilter = function (path) {
        return path;
    };
    return EmptyBinaryAsset;
}());
exports.EmptyBinaryAsset = EmptyBinaryAsset;

},{"@akashic/trigger":213}],75:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyGeneratedVectorImageAsset = void 0;
var EmptyVectorImageAsset_1 = require("./EmptyVectorImageAsset");
var EmptyGeneratedVectorImageAsset = /** @class */ (function (_super) {
    __extends(EmptyGeneratedVectorImageAsset, _super);
    function EmptyGeneratedVectorImageAsset(id, path, data) {
        var _this = _super.call(this, id, path, 0, 0) || this;
        _this.data = data;
        return _this;
    }
    return EmptyGeneratedVectorImageAsset;
}(EmptyVectorImageAsset_1.EmptyVectorImageAsset));
exports.EmptyGeneratedVectorImageAsset = EmptyGeneratedVectorImageAsset;

},{"./EmptyVectorImageAsset":76}],76:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyVectorImageAsset = void 0;
var trigger_1 = require("@akashic/trigger");
var EmptyVectorImageAsset = /** @class */ (function () {
    function EmptyVectorImageAsset(id, path, width, height, hint) {
        this.type = "vector-image";
        this.width = 0;
        this.height = 0;
        this.onDestroyed = new trigger_1.Trigger();
        this.id = id;
        this.path = path;
        this.originalPath = path;
        this.width = width;
        this.height = height;
        this.hint = hint;
    }
    EmptyVectorImageAsset.prototype.createSurface = function (_width, _height, _sx, _sy, _sWidth, _sHeight) {
        return null;
    };
    EmptyVectorImageAsset.prototype.inUse = function () {
        return false;
    };
    EmptyVectorImageAsset.prototype.destroy = function () {
        if (this.destroyed()) {
            return;
        }
        this.onDestroyed.destroy();
        this.onDestroyed = undefined;
    };
    EmptyVectorImageAsset.prototype.destroyed = function () {
        return !this.onDestroyed;
    };
    EmptyVectorImageAsset.prototype._load = function (loader) {
        loader._onAssetLoad(this);
    };
    EmptyVectorImageAsset.prototype._assetPathFilter = function (path) {
        return path;
    };
    return EmptyVectorImageAsset;
}());
exports.EmptyVectorImageAsset = EmptyVectorImageAsset;

},{"@akashic/trigger":213}],77:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialImageAsset = void 0;
var trigger_1 = require("@akashic/trigger");
/**
 * 部分画像アセット。
 *
 * `resourceFacotory.createImageAsset()` で生成したアセットをラップし、`slice` で指定される領域の画像アセットとして振る舞う。
 * 通常、ゲーム開発者がこのクラスを生成する必要はない。
 */
var PartialImageAsset = /** @class */ (function () {
    /**
     * 部分画像アセットを生成する。
     *
     * `createImageAsset()` と異なり、 `slice` で指定された領域の画像アセットとして振る舞うため、
     * `this.width`, `this.height` が引数の `width`, height` ではなく `slice` の値で初期化される点に注意。
     * (`width`, `height` は元になる画像アセットの生成に使われる)
     */
    function PartialImageAsset(resourceFactory, id, uri, width, height, slice) {
        this.type = "image";
        this.hint = undefined;
        this.onDestroyed = new trigger_1.Trigger();
        this._surface = null;
        this._loadHandler = null;
        this.id = id;
        this.path = uri;
        this.originalPath = uri;
        this.width = slice.width;
        this.height = slice.height;
        this._slice = slice;
        this._resourceFactory = resourceFactory;
        var internalId = "".concat(id, "/<internal>"); // AssetManager が管理しないので値は何でもよいが、わかりやすさのため `id` を元にしておく
        this._src = resourceFactory.createImageAsset(internalId, uri, width, height);
    }
    PartialImageAsset.prototype.initialize = function (hint) {
        this.hint = hint; // 自分では使わないが、外部観測的に `ImageAsset` と合うように代入しておく
        this._src.initialize(hint);
    };
    PartialImageAsset.prototype.inUse = function () {
        return false;
    };
    PartialImageAsset.prototype.destroy = function () {
        if (this.destroyed()) {
            return;
        }
        this.onDestroyed.fire(this);
        this._src.destroy();
        this._src = null;
        this._slice = null;
        this._resourceFactory = null;
        this._surface = null;
        this._loadHandler = null;
        this.onDestroyed.destroy();
        this.onDestroyed = undefined;
    };
    PartialImageAsset.prototype.destroyed = function () {
        return !this._src;
    };
    PartialImageAsset.prototype.asSurface = function () {
        if (this._surface)
            return this._surface;
        var _a = this._slice, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        var surface = this._resourceFactory.createSurface(width, height);
        var r = surface.renderer();
        r.begin();
        r.drawImage(this._src.asSurface(), x, y, width, height, 0, 0);
        r.end();
        this._surface = surface;
        return surface;
    };
    /**
     * @private
     */
    PartialImageAsset.prototype._load = function (loader) {
        this._loadHandler = loader;
        this._src._load(this);
    };
    /**
     * this._src 用のロードハンドラ。
     * @private
     */
    PartialImageAsset.prototype._onAssetLoad = function (_asset) {
        this._loadHandler._onAssetLoad(this);
    };
    /**
     * this._src 用のロードエラーハンドラ。
     * @private
     */
    PartialImageAsset.prototype._onAssetError = function (_asset, error) {
        this._loadHandler._onAssetError(this, error);
    };
    /**
     * @private
     */
    PartialImageAsset.prototype._assetPathFilter = function (path) {
        return path;
    };
    return PartialImageAsset;
}());
exports.PartialImageAsset = PartialImageAsset;

},{"@akashic/trigger":213}],78:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheableE = void 0;
var E_1 = require("./E");
/**
 * 内部描画キャッシュを持つ `E` 。
 */
var CacheableE = /** @class */ (function (_super) {
    __extends(CacheableE, _super);
    /**
     * 各種パラメータを指定して `CacheableE` のインスタンスを生成する。
     * @param param このエンティティに対するパラメータ
     */
    function CacheableE(param) {
        var _this = _super.call(this, param) || this;
        _this._shouldRenderChildren = true;
        _this._cache = undefined;
        _this._renderer = undefined;
        _this._renderedCamera = undefined;
        return _this;
    }
    /**
     * このエンティティの描画キャッシュ無効化をエンジンに通知する。
     * このメソッドを呼び出し後、描画キャッシュの再構築が行われ、各 `Renderer` に描画内容の変更が反映される。
     */
    CacheableE.prototype.invalidate = function () {
        this.state &= ~2 /* EntityStateFlags.Cached */;
        this.modified();
    };
    /**
     * このエンティティ自身の描画を行う。
     * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
     */
    CacheableE.prototype.renderSelf = function (renderer, camera) {
        var padding = CacheableE.PADDING;
        if (this._renderedCamera !== camera) {
            this.state &= ~2 /* EntityStateFlags.Cached */;
            this._renderedCamera = camera;
        }
        if (!(this.state & 2 /* EntityStateFlags.Cached */)) {
            this._cacheSize = this.calculateCacheSize();
            var w = Math.ceil(this._cacheSize.width) + padding * 2;
            var h = Math.ceil(this._cacheSize.height) + padding * 2;
            var isNew = !this._cache || this._cache.width < w || this._cache.height < h;
            if (isNew) {
                if (this._cache && !this._cache.destroyed()) {
                    this._cache.destroy();
                }
                this._cache = this.scene.game.resourceFactory.createSurface(w, h);
                this._renderer = this._cache.renderer();
            }
            var cacheRenderer = this._renderer;
            cacheRenderer.begin();
            if (!isNew) {
                cacheRenderer.clear();
            }
            cacheRenderer.save();
            cacheRenderer.translate(padding, padding);
            this.renderCache(cacheRenderer, camera);
            cacheRenderer.restore();
            this.state |= 2 /* EntityStateFlags.Cached */;
            cacheRenderer.end();
        }
        if (this._cache && this._cacheSize.width > 0 && this._cacheSize.height > 0) {
            renderer.translate(-padding, -padding);
            this.renderSelfFromCache(renderer);
            renderer.translate(padding, padding);
        }
        return this._shouldRenderChildren;
    };
    /**
     * 内部キャッシュから自身の描画を行う。
     * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
     */
    CacheableE.prototype.renderSelfFromCache = function (renderer) {
        renderer.drawImage(this._cache, 0, 0, this._cacheSize.width + CacheableE.PADDING, this._cacheSize.height + CacheableE.PADDING, 0, 0);
    };
    /**
     * 利用している `Surface` を破棄した上で、このエンティティを破棄する。
     */
    CacheableE.prototype.destroy = function () {
        if (this._cache && !this._cache.destroyed()) {
            this._cache.destroy();
        }
        this._cache = undefined;
        _super.prototype.destroy.call(this);
    };
    /**
     * キャッシュのサイズを取得する。
     * 本クラスを継承したクラスでエンティティのサイズと異なるサイズを利用する場合、このメソッドをオーバーライドする。
     * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
     * このメソッドから得られる値を変更した場合、 `this.invalidate()` を呼び出す必要がある。
     */
    CacheableE.prototype.calculateCacheSize = function () {
        return {
            width: this.width,
            height: this.height
        };
    };
    /**
     * _cache のパディングサイズ。
     *
     * @private
     */
    CacheableE.PADDING = 1;
    return CacheableE;
}(E_1.E));
exports.CacheableE = CacheableE;

},{"./E":80}],79:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraCancellingE = void 0;
var Camera2D_1 = require("../Camera2D");
var Object2D_1 = require("../Object2D");
var E_1 = require("./E");
/**
 * カメラのtransformを戻すエンティティ。
 * 特定シーンのエンティティがカメラの影響を受けないようにするための内部エンティティ。
 */
var CameraCancellingE = /** @class */ (function (_super) {
    __extends(CameraCancellingE, _super);
    function CameraCancellingE(param) {
        var _this = _super.call(this, param) || this;
        _this._canceller = new Object2D_1.Object2D();
        return _this;
    }
    CameraCancellingE.prototype.renderSelf = function (renderer, camera) {
        if (!this.children)
            return false;
        if (camera && camera instanceof Camera2D_1.Camera2D) {
            var c = camera;
            var canceller = this._canceller;
            if (c.x !== canceller.x ||
                c.y !== canceller.y ||
                c.angle !== canceller.angle ||
                c.scaleX !== canceller.scaleX ||
                c.scaleY !== canceller.scaleY) {
                canceller.x = c.x;
                canceller.y = c.y;
                canceller.angle = c.angle;
                canceller.scaleX = c.scaleX;
                canceller.scaleY = c.scaleY;
                if (canceller._matrix) {
                    canceller._matrix._modified = true;
                }
            }
            renderer.save();
            renderer.transform(canceller.getMatrix()._matrix);
        }
        // Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
        var children = this.children;
        for (var i = 0; i < children.length; ++i)
            children[i].render(renderer, camera);
        if (camera) {
            renderer.restore();
        }
        return false;
    };
    return CameraCancellingE;
}(E_1.E));
exports.CameraCancellingE = CameraCancellingE;

},{"../Camera2D":15,"../Object2D":40,"./E":80}],80:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.E = exports.PointMoveEvent = exports.PointUpEvent = exports.PointDownEvent = void 0;
var trigger_1 = require("@akashic/trigger");
var Event_1 = require("../Event");
var ExceptionFactory_1 = require("../ExceptionFactory");
var Matrix_1 = require("../Matrix");
var Object2D_1 = require("../Object2D");
var Util_1 = require("../Util");
/**
 * ポインティング操作の開始を表すイベント。
 */
var PointDownEvent = /** @class */ (function (_super) {
    __extends(PointDownEvent, _super);
    function PointDownEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PointDownEvent;
}(Event_1.PointDownEventBase));
exports.PointDownEvent = PointDownEvent;
/**
 * ポインティング操作の終了を表すイベント。
 * PointDownEvent後にのみ発生する。
 *
 * PointUpEvent#startDeltaによってPointDownEvent時からの移動量が、
 * PointUpEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
 * PointUpEvent#pointにはPointDownEvent#pointと同じ値が格納される。
 */
var PointUpEvent = /** @class */ (function (_super) {
    __extends(PointUpEvent, _super);
    function PointUpEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PointUpEvent;
}(Event_1.PointUpEventBase));
exports.PointUpEvent = PointUpEvent;
/**
 * ポインティング操作の移動を表すイベント。
 * PointDownEvent後にのみ発生するため、MouseMove相当のものが本イベントとして発生することはない。
 *
 * PointMoveEvent#startDeltaによってPointDownEvent時からの移動量が、
 * PointMoveEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
 * PointMoveEvent#pointにはPointMoveEvent#pointと同じ値が格納される。
 *
 * 本イベントは、プレイヤーがポインティングデバイスを移動していなくても、
 * カメラの移動等視覚的にポイントが変化している場合にも発生する。
 */
var PointMoveEvent = /** @class */ (function (_super) {
    __extends(PointMoveEvent, _super);
    function PointMoveEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PointMoveEvent;
}(Event_1.PointMoveEventBase));
exports.PointMoveEvent = PointMoveEvent;
/**
 * akashic-engineに描画される全てのエンティティを表す基底クラス。
 * 本クラス単体に描画処理にはなく、直接利用する場合はchildrenを利用したコンテナとして程度で利用される。
 */
var E = /** @class */ (function (_super) {
    __extends(E, _super);
    // pointMoveは代入する必要がないのでsetterを定義しない
    /**
     * 各種パラメータを指定して `E` のインスタンスを生成する。
     * @param param 初期化に用いるパラメータのオブジェクト
     */
    function E(param) {
        var _this = _super.call(this, param) || this;
        _this.children = undefined;
        _this.parent = undefined;
        _this._touchable = false;
        _this.state = 0 /* EntityStateFlags.None */;
        _this._hasTouchableChildren = false;
        _this._onUpdate = undefined;
        _this._onMessage = undefined;
        _this._onPointDown = undefined;
        _this._onPointMove = undefined;
        _this._onPointUp = undefined;
        _this.tag = param.tag;
        _this.shaderProgram = param.shaderProgram;
        // local は Scene#register() や this.append() の呼び出しよりも先に立てなければならない
        // ローカルシーン・ローカルティック補間シーンのエンティティは強制的に local (ローカルティックが来て他プレイヤーとずれる可能性がある)
        _this.local = param.scene.local !== "non-local" || !!param.local;
        if (param.children) {
            for (var i = 0; i < param.children.length; ++i)
                _this.append(param.children[i]);
        }
        if (param.parent) {
            param.parent.append(_this);
        }
        if (param.touchable != null)
            _this.touchable = param.touchable;
        if (!!param.hidden)
            _this.hide();
        // set id, scene
        // @ts-ignore NOTE: Game クラスで割り当てられるため、ここでは undefined を許容している
        _this.id = param.id;
        param.scene.register(_this);
        return _this;
    }
    Object.defineProperty(E.prototype, "onUpdate", {
        /**
         * 時間経過イベント。本イベントの一度のfireにつき、常に1フレーム分の時間経過が起こる。
         */
        // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
        get: function () {
            if (!this._onUpdate)
                this._onUpdate = new trigger_1.ChainTrigger(this.scene.onUpdate);
            return this._onUpdate;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(E.prototype, "onMessage", {
        // onUpdateは代入する必要がないのでsetterを定義しない
        /**
         * このエンティティのmessageイベント。
         */
        // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
        get: function () {
            if (!this._onMessage)
                this._onMessage = new trigger_1.ChainTrigger(this.scene.onMessage);
            return this._onMessage;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(E.prototype, "onPointDown", {
        // onMessageは代入する必要がないのでsetterを定義しない
        /**
         * このエンティティのpoint downイベント。
         */
        // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
        get: function () {
            if (!this._onPointDown)
                this._onPointDown = new trigger_1.ChainTrigger(this.scene.onPointDownCapture, this._isTargetOperation, this);
            return this._onPointDown;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(E.prototype, "onPointUp", {
        // onPointDownは代入する必要がないのでsetterを定義しない
        /**
         * このエンティティのpoint upイベント。
         */
        // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
        get: function () {
            if (!this._onPointUp)
                this._onPointUp = new trigger_1.ChainTrigger(this.scene.onPointUpCapture, this._isTargetOperation, this);
            return this._onPointUp;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(E.prototype, "onPointMove", {
        // onPointUpは代入する必要がないのでsetterを定義しない
        /**
         * このエンティティのpoint moveイベント。
         */
        // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
        get: function () {
            if (!this._onPointMove)
                this._onPointMove = new trigger_1.ChainTrigger(this.scene.onPointMoveCapture, this._isTargetOperation, this);
            return this._onPointMove;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(E.prototype, "touchable", {
        // onPointMoveは代入する必要がないのでsetterを定義しない
        /**
         * プレイヤーにとって触れられるオブジェクトであるかを表す。
         *
         * この値が偽である場合、ポインティングイベントの対象にならない。
         * 初期値は `false` である。
         *
         * `E` の他のプロパティと異なり、この値の変更後に `this.modified()` を呼び出す必要はない。
         */
        get: function () {
            return this._touchable;
        },
        set: function (v) {
            if (this._touchable === v)
                return;
            this._touchable = v;
            if (v) {
                this._enableTouchPropagation();
            }
            else {
                this._disableTouchPropagation();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(E.prototype, "update", {
        /**
         * 時間経過イベント。本イベントの一度のfireにつき、常に1フレーム分の時間経過が起こる。
         * @deprecated 非推奨である。将来的に削除される。代わりに `onUpdate` を利用すること。
         */
        // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
        get: function () {
            return this.onUpdate;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(E.prototype, "message", {
        // updateは代入する必要がないのでsetterを定義しない
        /**
         * このエンティティのmessageイベント。
         * @deprecated 非推奨である。将来的に削除される。代わりに `onMessage` を利用すること。
         */
        // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
        get: function () {
            return this.onMessage;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(E.prototype, "pointDown", {
        // messageは代入する必要がないのでsetterを定義しない
        /**
         * このエンティティのpoint downイベント。
         * @deprecated 非推奨である。将来的に削除される。代わりに `onPointDown` を利用すること。
         */
        // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
        get: function () {
            return this.onPointDown;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(E.prototype, "pointUp", {
        // pointDownは代入する必要がないのでsetterを定義しない
        /**
         * このエンティティのpoint upイベント。
         * @deprecated 非推奨である。将来的に削除される。代わりに `onPointUp` を利用すること。
         */
        // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
        get: function () {
            return this.onPointUp;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(E.prototype, "pointMove", {
        // pointUpは代入する必要がないのでsetterを定義しない
        /**
         * このエンティティのpoint moveイベント。
         * @deprecated 非推奨である。将来的に削除される。代わりに `onPointMove` を利用すること。
         */
        // Eの生成コスト低減を考慮し、参照された時のみ生成出来るようアクセサを使う
        get: function () {
            return this.onPointMove;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * 自分自身と子孫の内容を描画する。
     *
     * このメソッドは、 `Renderer#draw()` からエンティティのツリー構造をトラバースする過程で暗黙に呼び出される。
     * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
     * @param renderer 描画先に対するRenderer
     * @param camera 対象のカメラ。省略された場合、undefined
     */
    E.prototype.render = function (renderer, camera) {
        this.state &= ~4 /* EntityStateFlags.Modified */;
        if (this.state & 1 /* EntityStateFlags.Hidden */)
            return;
        if (this.state & 8 /* EntityStateFlags.ContextLess */) {
            renderer.translate(this.x, this.y);
            var goDown_1 = this.renderSelf(renderer, camera);
            if (goDown_1 && this.children) {
                var children = this.children;
                var len = children.length;
                for (var i = 0; i < len; ++i)
                    children[i].render(renderer, camera);
            }
            renderer.translate(-this.x, -this.y);
            return;
        }
        renderer.save();
        if (this.angle || this.scaleX !== 1 || this.scaleY !== 1 || this.anchorX !== 0 || this.anchorY !== 0) {
            // Note: this.scaleX/scaleYが0の場合描画した結果何も表示されない事になるが、特殊扱いはしない
            renderer.transform(this.getMatrix()._matrix);
        }
        else {
            // Note: 変形なしのオブジェクトはキャッシュもとらずtranslateのみで処理
            renderer.translate(this.x, this.y);
        }
        if (this.opacity !== 1)
            renderer.opacity(this.opacity);
        var op = this.compositeOperation;
        if (op !== undefined) {
            renderer.setCompositeOperation(typeof op === "string" ? op : Util_1.Util.compositeOperationStringTable[op]);
        }
        if (this.shaderProgram !== undefined && renderer.isSupportedShaderProgram())
            renderer.setShaderProgram(this.shaderProgram);
        var goDown = this.renderSelf(renderer, camera);
        if (goDown && this.children) {
            // Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
            var children = this.children;
            for (var i = 0; i < children.length; ++i)
                children[i].render(renderer, camera);
        }
        renderer.restore();
    };
    /**
     * 自分自身の内容を描画する。
     *
     * このメソッドは、 `Renderer#draw()` からエンティティのツリー構造をトラバースする過程で暗黙に呼び出される。
     * 通常、ゲーム開発者がこのメソッドを呼び出す必要はない。
     *
     * 戻り値は、このエンティティの子孫の描画をスキップすべきであれば偽、でなければ真である。
     * (この値は、子孫の描画方法をカスタマイズする一部のサブクラスにおいて、通常の描画パスをスキップするために用いられる)
     *
     * @param renderer 描画先に対するRenderer
     * @param camera 対象のカメラ
     */
    E.prototype.renderSelf = function (_renderer, _camera) {
        // nothing to do
        return true;
    };
    /**
     * このエンティティが属する `Game` を返す。
     */
    E.prototype.game = function () {
        return this.scene.game;
    };
    /**
     * 子を追加する。
     *
     * @param e 子エンティティとして追加するエンティティ
     */
    E.prototype.append = function (e) {
        this.insertBefore(e, undefined);
    };
    /**
     * 子を挿入する。
     *
     * `target` が`this` の子でない場合、`append(e)` と同じ動作となる。
     *
     * @param e 子エンティティとして追加するエンティティ
     * @param target 挿入位置にある子エンティティ
     */
    E.prototype.insertBefore = function (e, target) {
        if (e.parent)
            e.remove();
        if (!this.children)
            this.children = [];
        e.parent = this;
        var index = -1;
        if (target !== undefined && (index = this.children.indexOf(target)) > -1) {
            this.children.splice(index, 0, e);
        }
        else {
            this.children.push(e);
        }
        if (e._touchable || e._hasTouchableChildren) {
            this._hasTouchableChildren = true;
            this._enableTouchPropagation();
        }
        this.modified(true);
    };
    /**
     * 子を削除する。
     *
     * `e` が `this` の子でない場合、 `AssertionError` がthrowされる。
     * `e === undefined` であり親がない場合、 `AssertionError` がthrowされる。
     *
     * @param e 削除する子エンティティ。省略された場合、自身を親から削除する
     */
    E.prototype.remove = function (e) {
        if (e === undefined) {
            this.parent.remove(this);
            return;
        }
        var index = this.children ? this.children.indexOf(e) : -1;
        if (index < 0)
            throw ExceptionFactory_1.ExceptionFactory.createAssertionError("E#remove: invalid child");
        this.children[index].parent = undefined;
        this.children.splice(index, 1);
        if (e._touchable || e._hasTouchableChildren) {
            if (!this._findTouchableChildren(this)) {
                this._hasTouchableChildren = false;
                this._disableTouchPropagation();
            }
        }
        this.modified(true);
    };
    /**
     * このエンティティを破棄する。
     *
     * 親がある場合、親からは `remove()` される。
     * 子孫を持っている場合、子孫も破棄される。
     */
    E.prototype.destroy = function () {
        if (this.parent)
            this.remove();
        if (this.children) {
            for (var i = this.children.length - 1; i >= 0; --i) {
                this.children[i].destroy();
            }
            if (this.children.length !== 0)
                throw ExceptionFactory_1.ExceptionFactory.createAssertionError("E#destroy: can not destroy all children, " + this.children.length);
            this.children = undefined;
        }
        // この解放はstringとforeachを使って書きたいが、minifyする時は.アクセスの方がいいのでやむを得ない
        if (this._onUpdate) {
            this._onUpdate.destroy();
            this._onUpdate = undefined;
        }
        if (this._onMessage) {
            this._onMessage.destroy();
            this._onMessage = undefined;
        }
        if (this._onPointDown) {
            this._onPointDown.destroy();
            this._onPointDown = undefined;
        }
        if (this._onPointMove) {
            this._onPointMove.destroy();
            this._onPointMove = undefined;
        }
        if (this._onPointUp) {
            this._onPointUp.destroy();
            this._onPointUp = undefined;
        }
        this.scene.unregister(this);
    };
    /**
     * このエンティティが破棄済みであるかを返す。
     */
    E.prototype.destroyed = function () {
        return this.scene === undefined;
    };
    /**
     * このエンティティに対する変更をエンジンに通知する。
     *
     * このメソッドの呼び出し後、 `this` に対する変更が各 `Renderer` の描画に反映される。
     * ただし逆は真ではない。すなわち、再描画は他の要因によって行われることもある。
     * ゲーム開発者は、このメソッドを呼び出していないことをもって再描画が行われていないことを仮定してはならない。
     *
     * 本メソッドは、このオブジェクトの `Object2D` 由来のプロパティ (`x`, `y`, `angle` など) を変更した場合にも呼びだす必要がある。
     * 本メソッドは、描画キャッシュの無効化処理を含まない。描画キャッシュを持つエンティティは、このメソッドとは別に `invalidate()` を提供している。
     * 描画キャッシュの無効化も必要な場合は、このメソッドではなくそちらを呼び出す必要がある。
     * @param isBubbling 通常ゲーム開発者が指定する必要はない。この変更通知が、(このエンティティ自身のみならず)子孫の変更の通知を含む場合、真を渡さなければならない。省略された場合、偽。
     */
    E.prototype.modified = function (_isBubbling) {
        // _matrixの用途は描画に限らない(e.g. E#findPointSourceByPoint)ので、Modifiedフラグと無関係にクリアする必要がある
        if (this._matrix)
            this._matrix._modified = true;
        if (this.angle ||
            this.scaleX !== 1 ||
            this.scaleY !== 1 ||
            this.anchorX !== 0 ||
            this.anchorY !== 0 ||
            this.opacity !== 1 ||
            this.compositeOperation !== undefined ||
            this.shaderProgram !== undefined) {
            this.state &= ~8 /* EntityStateFlags.ContextLess */;
        }
        else {
            this.state |= 8 /* EntityStateFlags.ContextLess */;
        }
        if (this.state & 4 /* EntityStateFlags.Modified */)
            return;
        this.state |= 4 /* EntityStateFlags.Modified */;
        if (this.parent)
            this.parent.modified(true);
    };
    /**
     * このメソッドは、 `E#findPointSourceByPoint()` 内で子孫の探索をスキップすべきか判断するために呼ばれる。
     * 通常、子孫の描画方法をカスタマイズする一部のサブクラスにおいて、与えられた座標に対する子孫の探索を制御する場合に利用する。
     * ゲーム開発者がこのメソッドを呼び出す必要はない。
     *
     * 戻り値は、子孫の探索をスキップすべきであれば偽、でなければ真である。
     *
     * @param point このエンティティ（`this`）の位置を基準とした相対座標
     */
    E.prototype.shouldFindChildrenByPoint = function (_point) {
        // nothing to do
        return true;
    };
    /**
     * 自身と自身の子孫の中で、その座標に反応する `PointSource` を返す。
     *
     * 戻り値は、対象が見つかった場合、 `target` に見つかったエンティティを持つ `PointSource` である。
     * 対象が見つからなかった場合、 `undefined` である。戻り値が `undefined` でない場合、その `target` プロパティは次を満たす:
     * - このエンティティ(`this`) またはその子孫である
     * - `E#touchable` が真である
     *
     * @param point 対象の座標
     * @param m `this` に適用する変換行列。省略された場合、単位行列
     * @param force touchable指定を無視する場合真を指定する。省略された場合、偽
     */
    E.prototype.findPointSourceByPoint = function (point, m, force) {
        if (this.state & 1 /* EntityStateFlags.Hidden */)
            return undefined;
        m = m ? m.multiplyNew(this.getMatrix()) : this.getMatrix().clone();
        var p = m.multiplyInverseForPoint(point);
        if (this._hasTouchableChildren || (force && this.children && this.children.length)) {
            var children = this.children;
            if (this.shouldFindChildrenByPoint(p)) {
                for (var i = children.length - 1; i >= 0; --i) {
                    var child = children[i];
                    if (force || child._touchable || child._hasTouchableChildren) {
                        var target = child.findPointSourceByPoint(point, m, force);
                        if (target)
                            return target;
                    }
                }
            }
        }
        if (!(force || this._touchable))
            return undefined;
        // 逆行列をポイントにかけた結果がEにヒットしているかを計算
        if (0 <= p.x && this.width > p.x && 0 <= p.y && this.height > p.y) {
            return {
                target: this,
                point: p
            };
        }
        return undefined;
    };
    /**
     * このEが表示状態であるかどうかを返す。
     */
    E.prototype.visible = function () {
        return (this.state & 1 /* EntityStateFlags.Hidden */) !== 1 /* EntityStateFlags.Hidden */;
    };
    /**
     * このEを表示状態にする。
     *
     * `this.hide()` によって非表示状態にされたエンティティを表示状態に戻す。
     * 生成直後のエンティティは表示状態であり、 `hide()` を呼び出さない限りこのメソッドを呼び出す必要はない。
     */
    E.prototype.show = function () {
        if (!(this.state & 1 /* EntityStateFlags.Hidden */))
            return;
        this.state &= ~1 /* EntityStateFlags.Hidden */;
        if (this.parent) {
            this.parent.modified(true);
        }
    };
    /**
     * このEを非表示状態にする。
     *
     * `this.show()` が呼ばれるまでの間、このエンティティは各 `Renderer` によって描画されない。
     * また `Game#findPointSource()` で返されることもなくなる。
     * `this#pointDown`, `pointMove`, `pointUp` なども通常の方法ではfireされなくなる。
     */
    E.prototype.hide = function () {
        if (this.state & 1 /* EntityStateFlags.Hidden */)
            return;
        this.state |= 1 /* EntityStateFlags.Hidden */;
        if (this.parent) {
            this.parent.modified(true);
        }
    };
    /**
     * このEの包含矩形を計算する。
     */
    E.prototype.calculateBoundingRect = function () {
        return this._calculateBoundingRect(undefined);
    };
    /**
     * このEの位置を基準とした相対座標をゲームの左上端を基準とした座標に変換する。
     * @param offset Eの位置を基準とした相対座標
     */
    E.prototype.localToGlobal = function (offset) {
        var point = offset;
        for (var entity = this; entity instanceof E; entity = entity.parent) {
            point = entity.getMatrix().multiplyPoint(point);
        }
        return point;
    };
    /**
     * ゲームの左上端を基準とした座標をこのEの位置を基準とした相対座標に変換する。
     * @param offset ゲームの左上端を基準とした座標
     */
    E.prototype.globalToLocal = function (offset) {
        var matrix = new Matrix_1.PlainMatrix();
        for (var entity = this; entity instanceof E; entity = entity.parent) {
            matrix.multiplyLeft(entity.getMatrix());
        }
        return matrix.multiplyInverseForPoint(offset);
    };
    /**
     * このエンティティの座標系を、指定された祖先エンティティ (またはシーン) の座標系に変換する行列を求める。
     *
     * 指定されたエンティティが、このエンティティの祖先でない時、その値は無視される。
     * 指定されたシーンが、このエンティティの属するシーン出ない時、その値は無視される。
     *
     * @param target 座標系の変換先エンティティまたはシーン。省略した場合、このエンティティの属するシーン(グローバル座標系への変換行列になる)
     * @private
     */
    E.prototype._calculateMatrixTo = function (target) {
        var matrix = new Matrix_1.PlainMatrix();
        for (var entity = this; entity instanceof E && entity !== target; entity = entity.parent) {
            matrix.multiplyLeft(entity.getMatrix());
        }
        return matrix;
    };
    /**
     * このエンティティと与えられたエンティティの共通祖先のうち、もっとも子孫側にあるものを探す。
     * 共通祖先がない場合、 `undefined` を返す。
     *
     * @param target このエンティティとの共通祖先を探すエンティティ
     * @private
     */
    E.prototype._findLowestCommonAncestorWith = function (target) {
        var seen = {};
        for (var p = this; p instanceof E; p = p.parent) {
            seen[p.id] = true;
        }
        var ret = target;
        for (; ret instanceof E; ret = ret.parent) {
            if (seen.hasOwnProperty(ret.id))
                break;
        }
        return ret;
    };
    /**
     * @private
     */
    E.prototype._calculateBoundingRect = function (m) {
        var matrix = this.getMatrix();
        if (m) {
            matrix = m.multiplyNew(matrix);
        }
        if (!this.visible()) {
            return undefined;
        }
        var thisBoundingRect = {
            left: 0,
            right: this.width,
            top: 0,
            bottom: this.height
        };
        var targetCoordinates = [
            { x: thisBoundingRect.left, y: thisBoundingRect.top },
            { x: thisBoundingRect.left, y: thisBoundingRect.bottom },
            { x: thisBoundingRect.right, y: thisBoundingRect.top },
            { x: thisBoundingRect.right, y: thisBoundingRect.bottom }
        ];
        var convertedPoint = matrix.multiplyPoint(targetCoordinates[0]);
        var result = {
            left: convertedPoint.x,
            right: convertedPoint.x,
            top: convertedPoint.y,
            bottom: convertedPoint.y
        };
        for (var i = 1; i < targetCoordinates.length; ++i) {
            convertedPoint = matrix.multiplyPoint(targetCoordinates[i]);
            if (result.left > convertedPoint.x)
                result.left = convertedPoint.x;
            if (result.right < convertedPoint.x)
                result.right = convertedPoint.x;
            if (result.top > convertedPoint.y)
                result.top = convertedPoint.y;
            if (result.bottom < convertedPoint.y)
                result.bottom = convertedPoint.y;
        }
        if (this.children !== undefined) {
            for (var i = 0; i < this.children.length; ++i) {
                var nowResult = this.children[i]._calculateBoundingRect(matrix);
                if (nowResult) {
                    if (result.left > nowResult.left)
                        result.left = nowResult.left;
                    if (result.right < nowResult.right)
                        result.right = nowResult.right;
                    if (result.top > nowResult.top)
                        result.top = nowResult.top;
                    if (result.bottom < nowResult.bottom)
                        result.bottom = nowResult.bottom;
                }
            }
        }
        return result;
    };
    /**
     * @private
     */
    E.prototype._enableTouchPropagation = function () {
        var p = this.parent;
        while (p instanceof E && !p._hasTouchableChildren) {
            p._hasTouchableChildren = true;
            p = p.parent;
        }
    };
    /**
     * @private
     */
    E.prototype._disableTouchPropagation = function () {
        var p = this.parent;
        while (p instanceof E && p._hasTouchableChildren) {
            if (this._findTouchableChildren(p))
                break;
            p._hasTouchableChildren = false;
            p = p.parent;
        }
    };
    /**
     * @private
     */
    E.prototype._isTargetOperation = function (e) {
        if (this.state & 1 /* EntityStateFlags.Hidden */)
            return false;
        if (e instanceof Event_1.PointEventBase)
            return this._touchable && e.target === this;
        return false;
    };
    E.prototype._findTouchableChildren = function (e) {
        if (e.children) {
            for (var i = 0; i < e.children.length; ++i) {
                if (e.children[i].touchable)
                    return e.children[i];
                var tmp = this._findTouchableChildren(e.children[i]);
                if (tmp)
                    return tmp;
            }
        }
        return undefined;
    };
    return E;
}(Object2D_1.Object2D));
exports.E = E;

},{"../Event":22,"../ExceptionFactory":28,"../Matrix":36,"../Object2D":40,"../Util":69,"@akashic/trigger":213}],81:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilledRect = void 0;
var ExceptionFactory_1 = require("../ExceptionFactory");
var E_1 = require("./E");
/**
 * 塗りつぶされた矩形を表すエンティティ。
 */
var FilledRect = /** @class */ (function (_super) {
    __extends(FilledRect, _super);
    /**
     * 各種パラメータを指定して `FilledRect` のインスタンスを生成する。
     * @param param このエンティティに対するパラメータ
     */
    function FilledRect(param) {
        var _this = _super.call(this, param) || this;
        if (typeof param.cssColor !== "string")
            throw ExceptionFactory_1.ExceptionFactory.createTypeMismatchError("ColorBox#constructor(cssColor)", "string", param.cssColor);
        _this.cssColor = param.cssColor;
        return _this;
    }
    /**
     * このエンティティ自身の描画を行う。
     * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
     */
    FilledRect.prototype.renderSelf = function (renderer) {
        renderer.fillRect(0, 0, this.width, this.height, this.cssColor);
        return true;
    };
    return FilledRect;
}(E_1.E));
exports.FilledRect = FilledRect;

},{"../ExceptionFactory":28,"./E":80}],82:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameSprite = void 0;
var trigger_1 = require("@akashic/trigger");
var Sprite_1 = require("./Sprite");
/**
 * フレームとタイマーによるアニメーション機構を持つ `Sprite` 。
 *
 * このクラスは、コンストラクタで渡された画像を、
 * 幅 `srcWidth`, 高さ `srcHeight` 単位で区切られた小さな画像(以下、画像片)の集まりであると解釈する。
 * 各画像片は、左上から順に 0 から始まるインデックスで参照される。
 *
 * ゲーム開発者は、このインデックスからなる配列を `FrameSprite#frames` に設定する。
 * `FrameSprite` は、 `frames` に指定されたインデックス(が表す画像片)を順番に描画することでアニメーションを実現する。
 * アニメーションは `interval` ミリ秒ごとに進み、 `frames` の内容をループする。
 *
 * このクラスにおける `srcWidth`, `srcHeight` の扱いは、親クラスである `Sprite` とは異なっていることに注意。
 */
var FrameSprite = /** @class */ (function (_super) {
    __extends(FrameSprite, _super);
    /**
     * 各種パラメータを指定して `FrameSprite` のインスタンスを生成する。
     * @param param `FrameSprite` に設定するパラメータ
     */
    function FrameSprite(param) {
        var _this = _super.call(this, param) || this;
        _this._lastUsedIndex = 0;
        _this.frameNumber = param.frameNumber || 0;
        _this.frames = param.frames != null ? param.frames : [0];
        _this.interval = param.interval;
        _this._timer = undefined;
        _this.loop = param.loop != null ? param.loop : true;
        _this.onFinish = new trigger_1.Trigger();
        _this.finished = _this.onFinish;
        _this._modifiedSelf();
        return _this;
    }
    /**
     * `Sprite` から `FrameSprite` を作成する。
     * @param sprite 画像として使う`Sprite`
     * @param width 作成されるエンティティの高さ。省略された場合、 `sprite.width`
     * @param hegith 作成されるエンティティの高さ。省略された場合、 `sprite.height`
     */
    FrameSprite.createBySprite = function (sprite, width, height) {
        var frameSprite = new FrameSprite({
            scene: sprite.scene,
            src: sprite.src,
            width: width === undefined ? sprite.width : width,
            height: height === undefined ? sprite.height : height
        });
        frameSprite.srcHeight = height === undefined ? sprite.srcHeight : height;
        frameSprite.srcWidth = width === undefined ? sprite.srcWidth : width;
        return frameSprite;
    };
    /**
     * アニメーションを開始する。
     */
    FrameSprite.prototype.start = function () {
        if (this.interval === undefined)
            this.interval = 1000 / this.game().fps;
        if (this._timer)
            this._free();
        this._timer = this.scene.createTimer(this.interval);
        this._timer.onElapse.add(this._handleElapse, this);
    };
    /**
     * このエンティティを破棄する。
     * デフォルトでは利用している `Surface` の破棄は行わない点に注意。
     * @param destroySurface trueを指定した場合、このエンティティが抱える `Surface` も合わせて破棄する
     */
    FrameSprite.prototype.destroy = function (destroySurface) {
        this.stop();
        _super.prototype.destroy.call(this, destroySurface);
    };
    /**
     * アニメーションを停止する。
     */
    FrameSprite.prototype.stop = function () {
        if (this._timer)
            this._free();
    };
    /**
     * このエンティティに対する変更をエンジンに通知する。詳細は `E#modified()` のドキュメントを参照。
     */
    FrameSprite.prototype.modified = function (isBubbling) {
        this._modifiedSelf(isBubbling);
        _super.prototype.modified.call(this, isBubbling);
    };
    /**
     * @private
     */
    FrameSprite.prototype._handleElapse = function () {
        if (this.frameNumber === this.frames.length - 1) {
            if (this.loop) {
                this.frameNumber = 0;
            }
            else {
                this.stop();
                this.onFinish.fire();
            }
        }
        else {
            this.frameNumber++;
        }
        this.modified();
    };
    /**
     * @private
     */
    FrameSprite.prototype._free = function () {
        if (!this._timer)
            return;
        this._timer.onElapse.remove(this._handleElapse, this);
        if (this._timer.canDelete())
            this.scene.deleteTimer(this._timer);
        this._timer = undefined;
    };
    /**
     * @private
     */
    FrameSprite.prototype._changeFrame = function () {
        var frame = this.frames[this.frameNumber];
        var sep = Math.floor(this._surface.width / this.srcWidth);
        this.srcX = (frame % sep) * this.srcWidth;
        this.srcY = Math.floor(frame / sep) * this.srcHeight;
        this._lastUsedIndex = frame;
    };
    FrameSprite.prototype._modifiedSelf = function (_isBubbling) {
        if (this._lastUsedIndex !== this.frames[this.frameNumber])
            this._changeFrame();
    };
    return FrameSprite;
}(Sprite_1.Sprite));
exports.FrameSprite = FrameSprite;

},{"./Sprite":85,"@akashic/trigger":213}],83:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Label = void 0;
var TextAlign_1 = require("../TextAlign");
var Util_1 = require("../Util");
var CacheableE_1 = require("./CacheableE");
/**
 * 単一行のテキストを描画するエンティティ。
 * 本クラスの利用には `BitmapFont` または `DynamicFont` が必要となる。
 */
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    /**
     * 各種パラメータを指定して `Label` のインスタンスを生成する。
     * @param param このエンティティに指定するパラメータ
     */
    function Label(param) {
        var _this = _super.call(this, param) || this;
        _this.text = param.text;
        _this.font = param.font;
        _this.textAlign = param.textAlign != null ? param.textAlign : TextAlign_1.TextAlign.Left;
        _this.glyphs = new Array(param.text.length);
        _this.fontSize = param.fontSize != null ? param.fontSize : param.font.size;
        _this.maxWidth = param.maxWidth;
        _this.widthAutoAdjust = param.widthAutoAdjust != null ? param.widthAutoAdjust : true;
        _this.textColor = param.textColor;
        _this._realTextAlign = "left";
        _this._textWidth = 0;
        _this._overhangLeft = 0;
        _this._overhangRight = 0;
        _this._invalidateSelf();
        return _this;
    }
    /**
     * `width` と `textAlign` を設定し、 `widthAutoAdjust` を `false` に設定する。
     *
     * このメソッドは `this.textAlign` を設定するためのユーティリティである。
     * `textAlign` を `"left"` (または非推奨の旧称 `TextAlign.Left`) 以外に設定する場合には、
     * 通常 `width` や `widthAutoAdjust` も設定する必要があるため、それらをまとめて行う。
     * このメソッドの呼び出し後、 `this.invalidate()` を呼び出す必要がある。
     * @param width 幅
     * @param textAlign テキストの描画位置
     */
    Label.prototype.aligning = function (width, textAlign) {
        this.width = width;
        this.widthAutoAdjust = false;
        this.textAlign = textAlign;
    };
    /**
     * このエンティティの描画キャッシュ無効化をエンジンに通知する。
     * このメソッドを呼び出し後、描画キャッシュの再構築が行われ、各 `Renderer` に描画内容の変更が反映される。
     */
    Label.prototype.invalidate = function () {
        this._invalidateSelf();
        _super.prototype.invalidate.call(this);
    };
    /**
     * Label自身の描画を行う。
     */
    Label.prototype.renderSelfFromCache = function (renderer) {
        // glyphのはみ出し量に応じて、描画先のX座標を調整する。
        var destOffsetX;
        switch (this._realTextAlign) {
            case "center":
                destOffsetX = this.widthAutoAdjust ? this._overhangLeft : 0;
                break;
            case "right":
                destOffsetX = this.widthAutoAdjust ? this._overhangLeft : this._overhangRight;
                break;
            default:
                destOffsetX = this._overhangLeft;
                break;
        }
        renderer.drawImage(this._cache, 0, 0, this._cacheSize.width + CacheableE_1.CacheableE.PADDING, this._cacheSize.height + CacheableE_1.CacheableE.PADDING, destOffsetX, 0);
    };
    Label.prototype.renderCache = function (renderer) {
        if (!this.fontSize || this.height <= 0 || this._textWidth <= 0) {
            return;
        }
        var scale = this.maxWidth && this.maxWidth > 0 && this.maxWidth < this._textWidth ? this.maxWidth / this._textWidth : 1;
        var offsetX = 0;
        switch (this._realTextAlign) {
            case "center":
                offsetX = this.width / 2 - ((this._textWidth + this._overhangLeft) / 2) * scale;
                break;
            case "right":
                offsetX = this.width - (this._textWidth + this._overhangLeft) * scale;
                break;
            default:
                offsetX -= this._overhangLeft * scale;
                break;
        }
        renderer.translate(Math.round(offsetX), 0);
        if (scale !== 1) {
            renderer.transform([scale, 0, 0, 1, 0, 0]);
        }
        renderer.save();
        var glyphScale = this.fontSize / this.font.size;
        var cumulativeOffset = 0;
        for (var i = 0; i < this.glyphs.length; ++i) {
            var glyph = this.glyphs[i];
            var glyphWidth = glyph.advanceWidth * glyphScale;
            var code = glyph.code;
            if (!glyph.isSurfaceValid) {
                glyph = this.font.glyphForCharacter(code);
                if (!glyph) {
                    this._outputOfWarnLogWithNoGlyph(code, "renderCache()");
                    continue;
                }
            }
            if (glyph.surface) {
                // 非空白文字
                renderer.save();
                renderer.translate(Math.round(cumulativeOffset), 0);
                renderer.transform([glyphScale, 0, 0, glyphScale, 0, 0]);
                renderer.drawImage(glyph.surface, glyph.x, glyph.y, glyph.width, glyph.height, glyph.offsetX, glyph.offsetY);
                renderer.restore();
            }
            cumulativeOffset += glyphWidth;
        }
        renderer.restore();
        renderer.save();
        if (this.textColor) {
            renderer.setCompositeOperation("source-atop");
            renderer.fillRect(0, 0, this._textWidth, this.height, this.textColor);
        }
        renderer.restore();
    };
    /**
     * このエンティティを破棄する。
     * 利用している `BitmapFont` の破棄は行わないため、 `BitmapFont` の破棄はコンテンツ製作者が明示的に行う必要がある。
     */
    Label.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    Label.prototype._invalidateSelf = function () {
        this.glyphs.length = 0;
        this._textWidth = 0;
        var align = this.textAlign;
        this._realTextAlign = typeof align === "string" ? align : Util_1.Util.enumToSnakeCase(TextAlign_1.TextAlign, align);
        if (!this.fontSize) {
            this.height = 0;
            return;
        }
        var effectiveTextLastIndex = this.text.length - 1;
        // 右のはみだし量を求めるため、text内での有効な最後の glyph のindexを解決する。
        for (var i = this.text.length - 1; i >= 0; --i) {
            var code = Util_1.Util.charCodeAt(this.text, i);
            if (!code) {
                continue;
            }
            var glyph = this.font.glyphForCharacter(code);
            if (glyph && glyph.width !== 0 && glyph.advanceWidth !== 0) {
                effectiveTextLastIndex = i;
                break;
            }
        }
        var maxHeight = 0;
        var glyphScale = this.font.size > 0 ? this.fontSize / this.font.size : 0;
        for (var i = 0; i <= effectiveTextLastIndex; ++i) {
            var code = Util_1.Util.charCodeAt(this.text, i);
            if (!code) {
                continue;
            }
            var glyph = this.font.glyphForCharacter(code);
            if (!glyph) {
                this._outputOfWarnLogWithNoGlyph(code, "_invalidateSelf()");
                continue;
            }
            if (glyph.width < 0 || glyph.height < 0) {
                continue;
            }
            if (glyph.x < 0 || glyph.y < 0) {
                continue;
            }
            this.glyphs.push(glyph);
            // Font に StrokeWidth が設定されている場合、文字の描画内容は、描画の基準点よりも左にはみ出る場合や、glyph.advanceWidth より右にはみ出る場合がある。
            // キャッシュサーフェスの幅は、最初の文字と最後の文字のはみ出し部分を考慮して求める必要がある。
            var overhang = 0;
            if (i === 0) {
                this._overhangLeft = Math.min(glyph.offsetX, 0);
                overhang = -this._overhangLeft;
            }
            if (i === effectiveTextLastIndex) {
                this._overhangRight = Math.max(glyph.width + glyph.offsetX - glyph.advanceWidth, 0);
                overhang += this._overhangRight;
            }
            this._textWidth += (glyph.advanceWidth + overhang) * glyphScale;
            var height = glyph.offsetY + glyph.height;
            if (maxHeight < height) {
                maxHeight = height;
            }
        }
        if (this.widthAutoAdjust) {
            this.width = this._textWidth;
        }
        this.height = maxHeight * glyphScale;
    };
    Label.prototype._outputOfWarnLogWithNoGlyph = function (code, functionName) {
        var str = code & 0xffff0000 ? String.fromCharCode((code & 0xffff0000) >>> 16, code & 0xffff) : String.fromCharCode(code);
        console.warn("Label#" +
            functionName +
            ": failed to get a glyph for '" +
            str +
            "' " +
            "(BitmapFont might not have the glyph or DynamicFont might create a glyph larger than its atlas).");
    };
    return Label;
}(CacheableE_1.CacheableE));
exports.Label = Label;

},{"../TextAlign":63,"../Util":69,"./CacheableE":78}],84:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pane = void 0;
var SurfaceUtil_1 = require("../SurfaceUtil");
var CacheableE_1 = require("./CacheableE");
/**
 * 枠を表すエンティティ。
 * クリッピングやパディング、バックグラウンドイメージの演出等の機能を持つため、
 * メニューやメッセージ、ステータスのウィンドウ等に利用されることが期待される。
 * このエンティティの子要素は、このエンティティの持つ `Surface` に描画される。
 */
var Pane = /** @class */ (function (_super) {
    __extends(Pane, _super);
    /**
     * 各種パラメータを指定して `Pane` のインスタンスを生成する。
     * @param param このエンティティに指定するパラメータ
     */
    function Pane(param) {
        var _this = _super.call(this, param) || this;
        _this._oldWidth = param.width;
        _this._oldHeight = param.height;
        _this.backgroundImage = param.backgroundImage;
        _this._beforeBackgroundImage = param.backgroundImage;
        _this._backgroundImageSurface = SurfaceUtil_1.SurfaceUtil.asSurface(param.backgroundImage);
        _this.backgroundEffector = param.backgroundEffector;
        _this._shouldRenderChildren = false;
        _this._padding = param.padding || 0;
        _this._initialize();
        _this._paddingChanged = false;
        return _this;
    }
    Object.defineProperty(Pane.prototype, "padding", {
        get: function () {
            return this._padding;
        },
        /**
         * パディング。
         * このエンティティの子孫は、パディングに指定された分だけ右・下にずれた場所に描画され、またパディングの矩形サイズでクリッピングされる。
         */
        // NOTE: paddingの変更は頻繁に行われるものでは無いと思われるので、フラグを立てるためにアクセサを使う
        set: function (padding) {
            this._padding = padding;
            this._paddingChanged = true;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * このエンティティに対する変更をエンジンに通知する。
     * このメソッドの呼び出し後、 `this` に対する変更が各 `Renderer` の描画に反映される。
     * このメソッドは描画キャッシュの無効化を保証しない。描画キャッシュの無効化も必要な場合、 `invalidate()`を呼び出さなければならない。
     * 詳細は `E#modified()` のドキュメントを参照。
     */
    Pane.prototype.modified = function (isBubbling) {
        if (isBubbling)
            this.state &= ~2 /* EntityStateFlags.Cached */;
        _super.prototype.modified.call(this);
    };
    Pane.prototype.shouldFindChildrenByPoint = function (point) {
        var p = this._normalizedPadding;
        if (p.left < point.x && this.width - p.right > point.x && p.top < point.y && this.height - p.bottom > point.y) {
            return true;
        }
        return false;
    };
    Pane.prototype.renderCache = function (renderer, camera) {
        if (this.width <= 0 || this.height <= 0) {
            return;
        }
        this._renderBackground();
        this._renderChildren(camera);
        if (this._bgSurface) {
            renderer.drawImage(this._bgSurface, 0, 0, this.width, this.height, 0, 0);
        }
        else if (this._backgroundImageSurface) {
            renderer.drawImage(this._backgroundImageSurface, 0, 0, this.width, this.height, 0, 0);
        }
        if (this._childrenArea.width <= 0 || this._childrenArea.height <= 0) {
            return;
        }
        renderer.save();
        if (this._childrenArea.x !== 0 || this._childrenArea.y !== 0) {
            renderer.translate(this._childrenArea.x, this._childrenArea.y);
        }
        renderer.drawImage(this._childrenSurface, 0, 0, this._childrenArea.width, this._childrenArea.height, 0, 0);
        renderer.restore();
    };
    /**
     * このエンティティを破棄する。また、バックバッファで利用している `Surface` も合わせて破棄される。
     * ただし、 `backgroundImage` に利用している `Surface` の破棄は行わない。
     * @param destroySurface trueを指定した場合、 `backgroundImage` に利用している `Surface` も合わせて破棄する。
     */
    Pane.prototype.destroy = function (destroySurface) {
        if (destroySurface && this._backgroundImageSurface && !this._backgroundImageSurface.destroyed()) {
            this._backgroundImageSurface.destroy();
        }
        if (this._bgSurface && !this._bgSurface.destroyed()) {
            this._bgSurface.destroy();
        }
        if (this._childrenSurface && !this._childrenSurface.destroyed()) {
            this._childrenSurface.destroy();
        }
        this.backgroundImage = undefined;
        this._backgroundImageSurface = undefined;
        this._beforeBackgroundImage = undefined;
        this._bgSurface = undefined;
        this._childrenSurface = undefined;
        _super.prototype.destroy.call(this);
    };
    /**
     * @private
     */
    Pane.prototype._renderBackground = function () {
        if (this.backgroundImage !== this._beforeBackgroundImage) {
            this._backgroundImageSurface = SurfaceUtil_1.SurfaceUtil.asSurface(this.backgroundImage);
            this._beforeBackgroundImage = this.backgroundImage;
        }
        if (this._backgroundImageSurface && this.backgroundEffector) {
            var bgSurface = this.backgroundEffector.render(this._backgroundImageSurface, this.width, this.height);
            if (this._bgSurface !== bgSurface) {
                if (this._bgSurface && !this._bgSurface.destroyed()) {
                    this._bgSurface.destroy();
                }
                this._bgSurface = bgSurface;
            }
        }
        else {
            this._bgSurface = undefined;
        }
    };
    /**
     * @private
     */
    Pane.prototype._renderChildren = function (camera) {
        var isNew = this._oldWidth !== this.width || this._oldHeight !== this.height || this._paddingChanged;
        if (isNew) {
            this._initialize();
            this._paddingChanged = false;
            this._oldWidth = this.width;
            this._oldHeight = this.height;
        }
        this._childrenRenderer.begin();
        if (!isNew) {
            this._childrenRenderer.clear();
        }
        if (this.children) {
            // Note: concatしていないのでunsafeだが、render中に配列の中身が変わる事はない前提とする
            var children = this.children;
            for (var i = 0; i < children.length; ++i) {
                children[i].render(this._childrenRenderer, camera);
            }
        }
        this._childrenRenderer.end();
    };
    /**
     * @private
     */
    Pane.prototype._initialize = function () {
        var p = this._padding;
        var r;
        if (typeof p === "number") {
            r = { top: p, bottom: p, left: p, right: p };
        }
        else {
            r = p;
        }
        this._childrenArea = {
            x: r.left,
            y: r.top,
            width: this.width - r.left - r.right,
            height: this.height - r.top - r.bottom
        };
        var resourceFactory = this.scene.game.resourceFactory;
        if (this._childrenSurface && !this._childrenSurface.destroyed()) {
            this._childrenSurface.destroy();
        }
        this._childrenSurface = resourceFactory.createSurface(Math.ceil(this._childrenArea.width), Math.ceil(this._childrenArea.height));
        this._childrenRenderer = this._childrenSurface.renderer();
        this._normalizedPadding = r;
    };
    /**
     * このPaneの包含矩形を計算する。
     * Eを継承する他のクラスと異なり、Paneは子要素の位置を包括矩形に含まない。
     * @private
     */
    Pane.prototype._calculateBoundingRect = function (m) {
        var matrix = this.getMatrix();
        if (m) {
            matrix = m.multiplyNew(matrix);
        }
        if (!this.visible()) {
            return undefined;
        }
        var thisBoundingRect = {
            left: 0,
            right: this.width,
            top: 0,
            bottom: this.height
        };
        var targetCoordinates = [
            { x: thisBoundingRect.left, y: thisBoundingRect.top },
            { x: thisBoundingRect.left, y: thisBoundingRect.bottom },
            { x: thisBoundingRect.right, y: thisBoundingRect.top },
            { x: thisBoundingRect.right, y: thisBoundingRect.bottom }
        ];
        var convertedPoint = matrix.multiplyPoint(targetCoordinates[0]);
        var result = {
            left: convertedPoint.x,
            right: convertedPoint.x,
            top: convertedPoint.y,
            bottom: convertedPoint.y
        };
        for (var i = 1; i < targetCoordinates.length; ++i) {
            convertedPoint = matrix.multiplyPoint(targetCoordinates[i]);
            if (result.left > convertedPoint.x)
                result.left = convertedPoint.x;
            if (result.right < convertedPoint.x)
                result.right = convertedPoint.x;
            if (result.top > convertedPoint.y)
                result.top = convertedPoint.y;
            if (result.bottom < convertedPoint.y)
                result.bottom = convertedPoint.y;
        }
        return result;
    };
    return Pane;
}(CacheableE_1.CacheableE));
exports.Pane = Pane;

},{"../SurfaceUtil":62,"./CacheableE":78}],85:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sprite = void 0;
var Matrix_1 = require("../Matrix");
var SurfaceUtil_1 = require("../SurfaceUtil");
var E_1 = require("./E");
/**
 * 画像を描画するエンティティ。
 */
var Sprite = /** @class */ (function (_super) {
    __extends(Sprite, _super);
    /**
     * 各種パラメータを指定して `Sprite` のインスタンスを生成する。
     * @param param `Sprite` に設定するパラメータ
     */
    function Sprite(param) {
        var _this = _super.call(this, param) || this;
        _this.src = param.src;
        if ("_drawable" in param.src) {
            _this._surface = param.src;
        }
        else {
            // @ts-ignore
            _this._surface = SurfaceUtil_1.SurfaceUtil.asSurface(param.src);
        }
        if (param.width == null)
            _this.width = _this._surface.width;
        if (param.height == null)
            _this.height = _this._surface.height;
        _this.srcWidth = param.srcWidth != null ? param.srcWidth : _this.width;
        _this.srcHeight = param.srcHeight != null ? param.srcHeight : _this.height;
        _this.srcX = param.srcX || 0;
        _this.srcY = param.srcY || 0;
        _this._stretchMatrix = undefined;
        _this._beforeSrc = _this.src;
        _this._beforeSurface = _this._surface;
        SurfaceUtil_1.SurfaceUtil.setupAnimatingHandler(_this, _this._surface);
        _this._invalidateSelf();
        return _this;
    }
    /**
     * @private
     */
    Sprite.prototype._handleUpdate = function () {
        this.modified();
    };
    /**
     * @private
     */
    Sprite.prototype._handleAnimationStart = function () {
        if (!this.onUpdate.contains(this._handleUpdate, this)) {
            this.onUpdate.add(this._handleUpdate, this);
        }
    };
    /**
     * @private
     */
    Sprite.prototype._handleAnimationStop = function () {
        if (!this.destroyed()) {
            this.onUpdate.remove(this._handleUpdate, this);
        }
    };
    /**
     * このエンティティ自身の描画を行う。
     * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
     */
    Sprite.prototype.renderSelf = function (renderer, _camera) {
        if (this.srcWidth <= 0 || this.srcHeight <= 0) {
            return true;
        }
        if (this._stretchMatrix) {
            renderer.save();
            renderer.transform(this._stretchMatrix._matrix);
        }
        renderer.drawImage(this._surface, this.srcX, this.srcY, this.srcWidth, this.srcHeight, 0, 0);
        if (this._stretchMatrix)
            renderer.restore();
        return true;
    };
    /**
     * このエンティティの描画キャッシュ無効化をエンジンに通知する。
     * このメソッドを呼び出し後、描画キャッシュの再構築が行われ、各 `Renderer` に描画内容の変更が反映される。
     */
    Sprite.prototype.invalidate = function () {
        this._invalidateSelf();
        this.modified();
    };
    /**
     * このエンティティを破棄する。
     * デフォルトでは利用している `Surface` の破棄は行わない点に注意。
     * @param destroySurface trueを指定した場合、このエンティティが抱える `Surface` も合わせて破棄する
     */
    Sprite.prototype.destroy = function (destroySurface) {
        if (this._surface && !this._surface.destroyed() && destroySurface) {
            this._surface.destroy();
        }
        this.src = undefined;
        this._beforeSrc = undefined;
        this._surface = undefined;
        _super.prototype.destroy.call(this);
    };
    Sprite.prototype._invalidateSelf = function () {
        if (this.width === this.srcWidth && this.height === this.srcHeight) {
            this._stretchMatrix = undefined;
        }
        else {
            this._stretchMatrix = new Matrix_1.PlainMatrix();
            this._stretchMatrix.scale(this.width / this.srcWidth, this.height / this.srcHeight);
        }
        if (this.src !== this._beforeSrc) {
            this._beforeSrc = this.src;
            if ("_drawable" in this.src) {
                this._surface = this.src;
            }
            else {
                // @ts-ignore
                this._surface = SurfaceUtil_1.SurfaceUtil.asSurface(this.src);
            }
        }
        if (this._surface !== this._beforeSurface) {
            SurfaceUtil_1.SurfaceUtil.migrateAnimatingHandler(this, this._beforeSurface, this._surface);
            this._beforeSurface = this._surface;
        }
    };
    return Sprite;
}(E_1.E));
exports.Sprite = Sprite;

},{"../Matrix":36,"../SurfaceUtil":62,"./E":80}],86:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoSystem = exports.ShaderProgram = exports.Module = exports.AudioSystem = void 0;
__exportStar(require("@akashic/game-configuration"), exports);
__exportStar(require("@akashic/trigger"), exports);
// pdi-types 由来の型を g 直下から reexport する。
// ただし一部の型名は、akashic-engine で同名のクラス実装を与えているため、
// そのままでは両方 export しようとして衝突する。
// ここで明示的に片方を export して衝突を解決している。
__exportStar(require("@akashic/pdi-types"), exports);
var AudioSystem_1 = require("./AudioSystem");
Object.defineProperty(exports, "AudioSystem", { enumerable: true, get: function () { return AudioSystem_1.AudioSystem; } });
var Module_1 = require("./Module");
Object.defineProperty(exports, "Module", { enumerable: true, get: function () { return Module_1.Module; } });
var ShaderProgram_1 = require("./ShaderProgram");
Object.defineProperty(exports, "ShaderProgram", { enumerable: true, get: function () { return ShaderProgram_1.ShaderProgram; } });
var VideoSystem_1 = require("./VideoSystem");
Object.defineProperty(exports, "VideoSystem", { enumerable: true, get: function () { return VideoSystem_1.VideoSystem; } });
__exportStar(require("./entities/CacheableE"), exports);
__exportStar(require("./entities/E"), exports);
__exportStar(require("./entities/FilledRect"), exports);
__exportStar(require("./entities/FrameSprite"), exports);
__exportStar(require("./entities/Label"), exports);
__exportStar(require("./entities/Pane"), exports);
__exportStar(require("./entities/Sprite"), exports);
__exportStar(require("./AssetAccessor"), exports);
__exportStar(require("./AssetGenerationConfiguration"), exports);
__exportStar(require("./AssetHolder"), exports);
__exportStar(require("./AssetLoadFailureInfo"), exports);
__exportStar(require("./AssetManager"), exports);
__exportStar(require("./AssetManagerLoadHandler"), exports);
__exportStar(require("./AudioPlayContext"), exports);
__exportStar(require("./AudioSystem"), exports);
__exportStar(require("./AudioSystemManager"), exports);
__exportStar(require("./AudioUtil"), exports);
__exportStar(require("./BitmapFont"), exports);
__exportStar(require("./Camera"), exports);
__exportStar(require("./Camera2D"), exports);
__exportStar(require("./Collision"), exports);
__exportStar(require("./DefaultLoadingScene"), exports);
__exportStar(require("./DefaultSkippingScene"), exports);
__exportStar(require("./DynamicAssetConfiguration"), exports);
__exportStar(require("./DynamicFont"), exports);
__exportStar(require("./EntityStateFlags"), exports);
__exportStar(require("./Event"), exports);
__exportStar(require("./EventConverter"), exports);
__exportStar(require("./EventFilter"), exports);
__exportStar(require("./EventFilterController"), exports);
__exportStar(require("./EventIndex"), exports);
__exportStar(require("./EventPriority"), exports);
__exportStar(require("./ExceptionFactory"), exports);
__exportStar(require("./Font"), exports);
__exportStar(require("./GameMainParameterObject"), exports);
__exportStar(require("./InternalOperationPluginInfo"), exports);
__exportStar(require("./LoadingScene"), exports);
__exportStar(require("./LocalTickModeString"), exports);
__exportStar(require("./Matrix"), exports);
__exportStar(require("./Module"), exports);
__exportStar(require("./ModuleManager"), exports);
__exportStar(require("./NinePatchSurfaceEffector"), exports);
__exportStar(require("./Object2D"), exports);
__exportStar(require("./OperationPlugin"), exports);
__exportStar(require("./OperationPluginManager"), exports);
__exportStar(require("./OperationPluginOperation"), exports);
__exportStar(require("./OperationPluginStatic"), exports);
__exportStar(require("./PathUtil"), exports);
__exportStar(require("./Player"), exports);
__exportStar(require("./PointEventResolver"), exports);
__exportStar(require("./RandomGenerator"), exports);
__exportStar(require("./Require"), exports);
__exportStar(require("./RequireCacheable"), exports);
__exportStar(require("./RequireCachedValue"), exports);
__exportStar(require("./ScriptAssetContext"), exports);
__exportStar(require("./ShaderProgram"), exports);
__exportStar(require("./SnapshotSaveRequest"), exports);
__exportStar(require("./SpriteFactory"), exports);
__exportStar(require("./Storage"), exports);
__exportStar(require("./SurfaceAtlas"), exports);
__exportStar(require("./SurfaceAtlasSet"), exports);
__exportStar(require("./SurfaceAtlasSlot"), exports);
__exportStar(require("./SurfaceEffector"), exports);
__exportStar(require("./SurfaceUtil"), exports);
__exportStar(require("./TextAlign"), exports);
__exportStar(require("./TextAlignString"), exports);
__exportStar(require("./TextMetrics"), exports);
__exportStar(require("./TickGenerationModeString"), exports);
__exportStar(require("./Timer"), exports);
__exportStar(require("./TimerManager"), exports);
__exportStar(require("./Util"), exports);
__exportStar(require("./VideoSystem"), exports);
__exportStar(require("./WeakRefKVS"), exports);
__exportStar(require("./Xorshift"), exports);
__exportStar(require("./XorshiftRandomGenerator"), exports);
__exportStar(require("./Scene"), exports);
__exportStar(require("./Game"), exports);

},{"./AssetAccessor":3,"./AssetGenerationConfiguration":4,"./AssetHolder":5,"./AssetLoadFailureInfo":6,"./AssetManager":7,"./AssetManagerLoadHandler":8,"./AudioPlayContext":9,"./AudioSystem":10,"./AudioSystemManager":11,"./AudioUtil":12,"./BitmapFont":13,"./Camera":14,"./Camera2D":15,"./Collision":16,"./DefaultLoadingScene":17,"./DefaultSkippingScene":18,"./DynamicAssetConfiguration":19,"./DynamicFont":20,"./EntityStateFlags":21,"./Event":22,"./EventConverter":23,"./EventFilter":24,"./EventFilterController":25,"./EventIndex":26,"./EventPriority":27,"./ExceptionFactory":28,"./Font":29,"./Game":30,"./GameMainParameterObject":32,"./InternalOperationPluginInfo":33,"./LoadingScene":34,"./LocalTickModeString":35,"./Matrix":36,"./Module":37,"./ModuleManager":38,"./NinePatchSurfaceEffector":39,"./Object2D":40,"./OperationPlugin":41,"./OperationPluginManager":42,"./OperationPluginOperation":43,"./OperationPluginStatic":44,"./PathUtil":45,"./Player":46,"./PointEventResolver":47,"./RandomGenerator":48,"./Require":49,"./RequireCacheable":50,"./RequireCachedValue":51,"./Scene":52,"./ScriptAssetContext":53,"./ShaderProgram":54,"./SnapshotSaveRequest":55,"./SpriteFactory":56,"./Storage":57,"./SurfaceAtlas":58,"./SurfaceAtlasSet":59,"./SurfaceAtlasSlot":60,"./SurfaceEffector":61,"./SurfaceUtil":62,"./TextAlign":63,"./TextAlignString":64,"./TextMetrics":65,"./TickGenerationModeString":66,"./Timer":67,"./TimerManager":68,"./Util":69,"./VideoSystem":70,"./WeakRefKVS":71,"./Xorshift":72,"./XorshiftRandomGenerator":73,"./entities/CacheableE":78,"./entities/E":80,"./entities/FilledRect":81,"./entities/FrameSprite":82,"./entities/Label":83,"./entities/Pane":84,"./entities/Sprite":85,"@akashic/game-configuration":93,"@akashic/pdi-types":193,"@akashic/trigger":213}],87:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./index.common"), exports);
__exportStar(require("./GameHandlerSet"), exports); // NOTE: コンテンツから参照する必要はない

},{"./GameHandlerSet":31,"./index.common":86}],88:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._cloneDeep = exports.MemoryAmflowClient = void 0;
var MemoryAmflowClient = /** @class */ (function () {
    function MemoryAmflowClient(param) {
        this._tickHandlers = [];
        this._eventHandlers = [];
        /**
         * onEvent() 呼び出し前に sendEvent() されたものを保持しておくバッファ。
         */
        this._events = [];
        this._tickList = null;
        this._playId = param.playId;
        this._putStorageDataSyncFunc = param.putStorageDataSyncFunc || (function () {
            throw new Error("Implementation not given");
        });
        this._getStorageDataSyncFunc = param.getStorageDataSyncFunc || (function () {
            throw new Error("Implementation not given");
        });
        if (param.startPoints) {
            if (param.tickList) {
                this._tickList = param.tickList;
            }
            this._startPoints = param.startPoints;
        }
        else {
            this._startPoints = [];
        }
    }
    MemoryAmflowClient.prototype.dump = function () {
        return {
            tickList: this._tickList,
            startPoints: this._startPoints
        };
    };
    MemoryAmflowClient.prototype.open = function (playId, callback) {
        var _this = this;
        setTimeout(function () {
            if (!callback)
                return;
            if (playId !== _this._playId)
                return void callback(new Error("MemoryAmflowClient#open: unknown playId"));
            callback(null);
        }, 0);
    };
    MemoryAmflowClient.prototype.close = function (callback) {
        if (!callback)
            return;
        setTimeout(function () {
            callback(null);
        }, 0);
    };
    MemoryAmflowClient.prototype.authenticate = function (token, callback) {
        setTimeout(function () {
            switch (token) {
                case MemoryAmflowClient.TOKEN_ACTIVE:
                    callback(null, {
                        writeTick: true,
                        readTick: true,
                        subscribeTick: false,
                        sendEvent: false,
                        subscribeEvent: true,
                        maxEventPriority: 2
                    });
                    break;
                case MemoryAmflowClient.TOKEN_PASSIVE:
                    callback(null, {
                        writeTick: false,
                        readTick: true,
                        subscribeTick: true,
                        sendEvent: true,
                        subscribeEvent: false,
                        maxEventPriority: 2
                    });
                    break;
                default:
                    callback(null, {
                        writeTick: true,
                        readTick: true,
                        subscribeTick: true,
                        sendEvent: true,
                        subscribeEvent: true,
                        maxEventPriority: 2
                    });
                    break;
            }
        }, 0);
    };
    MemoryAmflowClient.prototype.sendTick = function (tick) {
        tick = _cloneDeep(tick); // 元の値が後から変更されてもいいようにコピーしておく
        if (!this._tickList) {
            this._tickList = [tick[0 /* Frame */], tick[0 /* Frame */], []];
        }
        else {
            // 既に存在するTickListのfrom~to間にtickが挿入されることは無い
            if (this._tickList[0 /* From */] <= tick[0 /* Frame */] &&
                tick[0 /* Frame */] <= this._tickList[1 /* To */])
                throw new Error("illegal age tick");
            this._tickList[1 /* To */] = tick[0 /* Frame */];
        }
        var events = tick[1 /* Events */];
        var storageData = tick[2 /* StorageData */];
        if (events || storageData) {
            if (events) {
                tick[1 /* Events */] = events.filter(function (event) { return !(event[1 /* EventFlags */] & 8 /* Transient */); });
            }
            // @ts-ignore
            this._tickList[2 /* Ticks */].push(tick);
        }
        this._tickHandlers.forEach(function (h) { return h(tick); });
    };
    MemoryAmflowClient.prototype.onTick = function (handler) {
        this._tickHandlers.push(handler);
    };
    MemoryAmflowClient.prototype.offTick = function (handler) {
        this._tickHandlers = this._tickHandlers.filter(function (h) { return (h !== handler); });
    };
    MemoryAmflowClient.prototype.sendEvent = function (pev) {
        pev = _cloneDeep(pev); // 元の値が後から変更されてもいいようにコピーしておく
        if (this._eventHandlers.length === 0) {
            this._events.push(pev);
            return;
        }
        this._eventHandlers.forEach(function (h) { return h(pev); });
    };
    MemoryAmflowClient.prototype.onEvent = function (handler) {
        var _this = this;
        this._eventHandlers.push(handler);
        if (this._events.length > 0) {
            this._events.forEach(function (pev) {
                _this._eventHandlers.forEach(function (h) { return h(pev); });
            });
            this._events = [];
        }
    };
    MemoryAmflowClient.prototype.offEvent = function (handler) {
        this._eventHandlers = this._eventHandlers.filter(function (h) { return (h !== handler); });
    };
    MemoryAmflowClient.prototype.getTickList = function (optsOrBegin, endOrCallback, callbackOrUndefined) {
        var opts;
        var callback;
        if (typeof optsOrBegin === "number") {
            // NOTE: optsOrBegin === "number" であれば必ず amflow@2 以前の引数だとみなしてキャストする
            opts = {
                begin: optsOrBegin,
                end: endOrCallback
            };
            callback = callbackOrUndefined;
        }
        else {
            // NOTE: optsOrBegin !== "number" であれば必ず amflow@3 以降の引数だとみなしてキャストする
            opts = optsOrBegin;
            callback = endOrCallback;
        }
        if (!this._tickList) {
            if (callback) {
                setTimeout(function () { return callback(null); }, 0);
            }
            return;
        }
        var from = Math.max(opts.begin, this._tickList[0 /* From */]);
        var to = Math.min(opts.end, this._tickList[1 /* To */]);
        // @ts-ignore
        var ticks = this._tickList[2 /* Ticks */].filter(function (tick) {
            var age = tick[0 /* Frame */];
            return from <= age && age <= to;
        });
        var tickList = [from, to, ticks];
        setTimeout(function () { return callback(null, tickList); }, 0);
    };
    MemoryAmflowClient.prototype.putStartPoint = function (startPoint, callback) {
        var _this = this;
        setTimeout(function () {
            _this._startPoints.push(startPoint);
            callback(null);
        }, 0);
    };
    MemoryAmflowClient.prototype.getStartPoint = function (opts, callback) {
        var _this = this;
        setTimeout(function () {
            if (!_this._startPoints || _this._startPoints.length === 0)
                return void callback(new Error("no startpoint"));
            var index = 0;
            if (opts.frame != null) {
                var nearestFrame = _this._startPoints[0].frame;
                for (var i = 1; i < _this._startPoints.length; ++i) {
                    var frame = _this._startPoints[i].frame;
                    if (frame <= opts.frame && nearestFrame < frame) {
                        nearestFrame = frame;
                        index = i;
                    }
                }
            }
            else {
                var nearestTimestamp = _this._startPoints[0].timestamp;
                for (var i = 1; i < _this._startPoints.length; ++i) {
                    var timestamp = _this._startPoints[i].timestamp;
                    // NOTE: opts.frame が null の場合は opts.timestamp が non-null であることが仕様上保証されている
                    if (timestamp <= opts.timestamp && nearestTimestamp < timestamp) {
                        nearestTimestamp = timestamp;
                        index = i;
                    }
                }
            }
            callback(null, _this._startPoints[index]);
        }, 0);
    };
    MemoryAmflowClient.prototype.putStorageData = function (key, value, options, callback) {
        var _this = this;
        setTimeout(function () {
            try {
                _this._putStorageDataSyncFunc(key, value, options);
                callback(null);
            }
            catch (e) {
                callback(e);
            }
        }, 0);
    };
    MemoryAmflowClient.prototype.getStorageData = function (keys, callback) {
        var _this = this;
        setTimeout(function () {
            try {
                var data = _this._getStorageDataSyncFunc(keys);
                callback(null, data);
            }
            catch (e) {
                callback(e);
            }
        }, 0);
    };
    /**
     * 与えられていたティックリストを部分的に破棄する。
     * @param age ティックを破棄する基準のage(このageのティックも破棄される)
     */
    MemoryAmflowClient.prototype.dropAfter = function (age) {
        if (!this._tickList)
            return;
        var from = this._tickList[0 /* From */];
        var to = this._tickList[1 /* To */];
        if (age <= from) {
            this._tickList = null;
            this._startPoints = [];
        }
        else if (age <= to) {
            this._tickList[1 /* To */] = age - 1;
            // @ts-ignore
            this._tickList[2 /* Ticks */] = this._tickList[2 /* Ticks */].filter(function (tick) {
                var ta = tick[0 /* Frame */];
                return from <= ta && ta <= (age - 1);
            });
            this._startPoints = this._startPoints.filter(function (sp) { return sp.frame < age; });
        }
    };
    /**
     * `writeTick` 権限を持つトークン。
     * この値は authenticate() の挙動以外は変更しない。
     * 他メソッド(sendEvent()など)の呼び出しは(権限に反していても)エラーを起こすとは限らない。
     */
    MemoryAmflowClient.TOKEN_ACTIVE = "mamfc-token:active";
    /**
     * `subscribeTick` 権限を持つトークン。
     * この値は authenticate() の挙動以外は変更しない。
     * 他メソッド(sendTick()など)の呼び出しは(権限に反していても)エラーを起こすとは限らない。
     */
    MemoryAmflowClient.TOKEN_PASSIVE = "mamfc-token:passive";
    return MemoryAmflowClient;
}());
exports.MemoryAmflowClient = MemoryAmflowClient;
function _cloneDeep(v) {
    if (v && typeof v === "object") {
        if (Array.isArray(v)) {
            return v.map(_cloneDeep);
        }
        else {
            return Object.keys(v).reduce(function (acc, k) { return (acc[k] = _cloneDeep(v[k]), acc); }, {});
        }
    }
    return v;
}
exports._cloneDeep = _cloneDeep;

},{}],89:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayAmflowProxy = void 0;
var ReplayAmflowProxy = /** @class */ (function () {
    function ReplayAmflowProxy(param) {
        this._amflow = param.amflow;
        this._tickList = param.tickList;
        this._startPoints = param.startPoints;
    }
    /**
     * 与えられていたティックリストを部分的に破棄する。
     * ReplayAmflowProxy の独自メソッド。
     * @param age ティックを破棄する基準のage(このageのティックも破棄される)
     */
    ReplayAmflowProxy.prototype.dropAfter = function (age) {
        if (!this._tickList)
            return;
        var givenFrom = this._tickList[0 /* From */];
        var givenTo = this._tickList[1 /* To */];
        var givenTicksWithEvents = this._tickList[2 /* Ticks */] || [];
        if (age <= givenFrom) {
            this._tickList = null;
            this._startPoints = [];
        }
        else if (age <= givenTo) {
            this._tickList[1 /* To */] = age - 1;
            this._tickList[2 /* Ticks */] = this._sliceTicks(givenTicksWithEvents, givenTo, age - 1);
            this._startPoints = this._startPoints.filter(function (sp) { return sp.frame < age; });
        }
    };
    ReplayAmflowProxy.prototype.open = function (playId, callback) {
        this._amflow.open(playId, callback);
    };
    ReplayAmflowProxy.prototype.close = function (callback) {
        this._amflow.close(callback);
    };
    ReplayAmflowProxy.prototype.authenticate = function (token, callback) {
        this._amflow.authenticate(token, callback);
    };
    ReplayAmflowProxy.prototype.sendTick = function (tick) {
        this._amflow.sendTick(tick);
    };
    ReplayAmflowProxy.prototype.onTick = function (handler) {
        this._amflow.onTick(handler);
    };
    ReplayAmflowProxy.prototype.offTick = function (handler) {
        this._amflow.offTick(handler);
    };
    ReplayAmflowProxy.prototype.sendEvent = function (event) {
        this._amflow.sendEvent(event);
    };
    ReplayAmflowProxy.prototype.onEvent = function (handler) {
        this._amflow.onEvent(handler);
    };
    ReplayAmflowProxy.prototype.offEvent = function (handler) {
        this._amflow.offEvent(handler);
    };
    ReplayAmflowProxy.prototype.getTickList = function (optsOrBegin, endOrCallback, callbackOrUndefined) {
        var _this = this;
        var opts;
        var callback;
        if (typeof optsOrBegin === "number") {
            // NOTE: optsOrBegin === "number" であれば必ず amflow@2 以前の引数だとみなしてキャストする
            opts = {
                begin: optsOrBegin,
                end: endOrCallback
            };
            callback = callbackOrUndefined;
        }
        else {
            // NOTE: optsOrBegin !== "number" であれば必ず amflow@3 以降の引数だとみなしてキャストする
            opts = optsOrBegin;
            callback = endOrCallback;
        }
        if (!this._tickList) {
            this._amflow.getTickList(opts, callback);
            return;
        }
        var from = opts.begin;
        var to = opts.end;
        var givenFrom = this._tickList[0 /* From */];
        var givenTo = this._tickList[1 /* To */];
        var givenTicksWithEvents = this._tickList[2 /* Ticks */] || [];
        var fromInGiven = givenFrom <= from && from <= givenTo;
        var toInGiven = givenFrom <= to && to <= givenTo;
        if (fromInGiven && toInGiven) { // 手持ちが要求範囲を包含
            setTimeout(function () {
                callback(null, [from, to, _this._sliceTicks(givenTicksWithEvents, from, to)]);
            }, 0);
        }
        else {
            this._amflow.getTickList({ begin: from, end: to }, function (err, tickList) {
                if (err)
                    return void callback(err);
                if (!tickList) {
                    // 何も得られなかった。手持ちの重複範囲を返すだけ。
                    if (!fromInGiven && !toInGiven) {
                        if (to < givenFrom || givenTo < from) { // 重複なし
                            callback(null, tickList);
                        }
                        else { // 要求範囲が手持ちを包含
                            callback(null, [givenFrom, givenTo, _this._sliceTicks(givenTicksWithEvents, from, to)]);
                        }
                    }
                    else if (fromInGiven) { // 前半重複
                        callback(null, [from, givenTo, _this._sliceTicks(givenTicksWithEvents, from, to)]);
                    }
                    else { // 後半重複
                        callback(null, [givenFrom, to, _this._sliceTicks(givenTicksWithEvents, from, to)]);
                    }
                }
                else {
                    // 何かは得られた。手持ちとマージする。
                    if (!fromInGiven && !toInGiven) {
                        if (to < givenFrom || givenTo < from) { // 重複なし
                            callback(null, tickList);
                        }
                        else { // 要求範囲が手持ちを包含
                            var ticksWithEvents = tickList[2 /* Ticks */];
                            if (ticksWithEvents) {
                                var beforeGiven = _this._sliceTicks(ticksWithEvents, from, givenFrom - 1);
                                var afterGiven = _this._sliceTicks(ticksWithEvents, givenTo + 1, to);
                                ticksWithEvents = beforeGiven.concat(givenTicksWithEvents, afterGiven);
                            }
                            else {
                                ticksWithEvents = givenTicksWithEvents;
                            }
                            callback(null, [from, to, ticksWithEvents]);
                        }
                    }
                    else if (fromInGiven) { // 前半重複
                        var ticksWithEvents = _this._sliceTicks(givenTicksWithEvents, from, to)
                            .concat(tickList[2 /* Ticks */] || []);
                        callback(null, [from, tickList[1 /* To */], ticksWithEvents]);
                    }
                    else { // 後半重複
                        var ticksWithEvents = (tickList[2 /* Ticks */] || [])
                            .concat(_this._sliceTicks(givenTicksWithEvents, from, to));
                        callback(null, [tickList[0 /* From */], to, ticksWithEvents]);
                    }
                }
            });
        }
    };
    ReplayAmflowProxy.prototype.putStartPoint = function (startPoint, callback) {
        this._amflow.putStartPoint(startPoint, callback);
    };
    ReplayAmflowProxy.prototype.getStartPoint = function (opts, callback) {
        var _this = this;
        var index = 0;
        if (this._startPoints.length > 0) {
            if (opts.frame != null) {
                var nearestFrame = this._startPoints[0].frame;
                for (var i = 1; i < this._startPoints.length; ++i) {
                    var frame = this._startPoints[i].frame;
                    if (frame <= opts.frame && nearestFrame < frame) {
                        nearestFrame = frame;
                        index = i;
                    }
                }
            }
            else {
                var nearestTimestamp = this._startPoints[0].timestamp;
                for (var i = 1; i < this._startPoints.length; ++i) {
                    var timestamp = this._startPoints[i].timestamp;
                    // NOTE: opts.frame が null の場合は opts.timestamp が non-null であることが仕様上保証されている
                    if (timestamp <= opts.timestamp && nearestTimestamp < timestamp) {
                        nearestTimestamp = timestamp;
                        index = i;
                    }
                }
            }
        }
        var givenTo = this._tickList ? this._tickList[1 /* To */] : -1;
        if (typeof opts.frame === "number" && opts.frame > givenTo) {
            this._amflow.getStartPoint(opts, function (err, startPoint) {
                if (err) {
                    callback(err);
                    return;
                }
                if (startPoint && givenTo < startPoint.frame) {
                    callback(null, startPoint);
                }
                else {
                    // 与えられたティックリストの範囲内のスタートポイントが見つかったとしてもなかったかのように振る舞う
                    callback(null, _this._startPoints[index]);
                }
            });
        }
        else {
            setTimeout(function () {
                callback(null, _this._startPoints[index]);
            }, 0);
        }
    };
    ReplayAmflowProxy.prototype.putStorageData = function (key, value, options, callback) {
        this._amflow.putStorageData(key, value, options, callback);
    };
    ReplayAmflowProxy.prototype.getStorageData = function (keys, callback) {
        this._amflow.getStorageData(keys, callback);
    };
    ReplayAmflowProxy.prototype._sliceTicks = function (ticks, from, to) {
        return ticks.filter(function (t) {
            var age = t[0 /* Frame */];
            return from <= age && age <= to;
        });
    };
    return ReplayAmflowProxy;
}());
exports.ReplayAmflowProxy = ReplayAmflowProxy;

},{}],90:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],91:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],92:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],93:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./AssetConfiguration"), exports);
__exportStar(require("./GameConfiguration"), exports);
__exportStar(require("./OperationPluginInfo"), exports);

},{"./AssetConfiguration":90,"./GameConfiguration":91,"./OperationPluginInfo":92}],94:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathUtil = void 0;
/**
 * パスユーティリティ。
 */
var PathUtil;
(function (PathUtil) {
    /**
     * 二つのパス文字列をつなぎ、相対パス表現 (".", "..") を解決して返す。
     * @param base 左辺パス文字列 (先頭の "./" を除き、".", ".." を含んではならない)
     * @param path 右辺パス文字列
     */
    function resolvePath(base, path) {
        function split(str) {
            var ret = str.split("/");
            if (ret[ret.length - 1] === "")
                ret.pop();
            return ret;
        }
        if (path === "")
            return base;
        var baseComponents = PathUtil.splitPath(base);
        var parts = split(baseComponents.path).concat(split(path));
        var resolved = [];
        for (var i = 0; i < parts.length; ++i) {
            var part = parts[i];
            switch (part) {
                case "..":
                    var popped = resolved.pop();
                    if (popped === undefined || popped === "" || popped === ".")
                        throw new Error("PathUtil.resolvePath: invalid arguments");
                    break;
                case ".":
                    if (resolved.length === 0) {
                        resolved.push(".");
                    }
                    break;
                case "": // 絶対パス
                    resolved = [""];
                    break;
                default:
                    resolved.push(part);
            }
        }
        return baseComponents.host + resolved.join("/");
    }
    PathUtil.resolvePath = resolvePath;
    /**
     * パス文字列からディレクトリ名部分を切り出して返す。
     * @param path パス文字列
     */
    function resolveDirname(path) {
        var index = path.lastIndexOf("/");
        if (index === -1)
            return path;
        return path.substr(0, index);
    }
    PathUtil.resolveDirname = resolveDirname;
    /**
     * パス文字列から拡張子部分を切り出して返す。
     * @param path パス文字列
     */
    function resolveExtname(path) {
        for (var i = path.length - 1; i >= 0; --i) {
            var c = path.charAt(i);
            if (c === ".") {
                return path.substr(i);
            }
            else if (c === "/") {
                return "";
            }
        }
        return "";
    }
    PathUtil.resolveExtname = resolveExtname;
    /**
     * パス文字列から、node.js において require() の探索範囲になるパスの配列を作成して返す。
     * @param path ディレクトリを表すパス文字列
     */
    function makeNodeModulePaths(path) {
        var pathComponents = PathUtil.splitPath(path);
        var host = pathComponents.host;
        path = pathComponents.path;
        if (path[path.length - 1] === "/") {
            path = path.slice(0, path.length - 1);
        }
        var parts = path.split("/");
        var firstDir = parts.indexOf("node_modules");
        var root = firstDir > 0 ? firstDir - 1 : 0;
        var dirs = [];
        for (var i = parts.length - 1; i >= root; --i) {
            if (parts[i] === "node_modules")
                continue;
            var dirParts = parts.slice(0, i + 1);
            dirParts.push("node_modules");
            var dir = dirParts.join("/");
            dirs.push(host + dir);
        }
        return dirs;
    }
    PathUtil.makeNodeModulePaths = makeNodeModulePaths;
    /**
     * 与えられたパス文字列からホストを切り出す。
     * @param path パス文字列
     */
    function splitPath(path) {
        var host = "";
        var doubleSlashIndex = path.indexOf("//");
        if (doubleSlashIndex >= 0) {
            var hostSlashIndex = path.indexOf("/", doubleSlashIndex + 2); // 2 === "//".length
            if (hostSlashIndex >= 0) {
                host = path.slice(0, hostSlashIndex);
                path = path.slice(hostSlashIndex); // 先頭に "/" を残して絶対パス扱いさせる
            }
            else {
                host = path;
                path = "/"; // path全体がホストだったので、絶対パス扱いさせる
            }
        }
        else {
            host = "";
        }
        return { host: host, path: path };
    }
    PathUtil.splitPath = splitPath;
})(PathUtil || (exports.PathUtil = PathUtil = {}));

},{}],95:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./PathUtil"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./utils"), exports);
// utils 以下の他のモジュールと無関係のなのモジュールはここで export しない
// TODO: utils以下にディレクトリを切って、関係のあるモジュール毎にまとめる

},{"./PathUtil":94,"./types":96,"./utils":97}],96:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],97:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._mergeObject = exports.toAssetArray = exports.makeLoadConfigurationFunc = void 0;
var es6_promise_1 = require("es6-promise");
var PathUtil_1 = require("./PathUtil");
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function makeLoadConfigurationFunc(loadConfiguration) {
    function loadResolvedConfiguration(url, assetBase, cascadeBase, callback) {
        loadConfiguration(url, function (err, conf) {
            if (err) {
                return void callback(err);
            }
            if (!("definitions" in conf)) {
                var c = void 0;
                try {
                    c = _normalizeAssets(conf, assetBase !== null && assetBase !== void 0 ? assetBase : PathUtil_1.PathUtil.resolveDirname(url));
                }
                catch (e) {
                    return void callback(e);
                }
                return void callback(null, c);
            }
            var defs = conf.definitions.map(function (def) {
                if (typeof def === "string") {
                    var resolvedUrl = cascadeBase ? PathUtil_1.PathUtil.resolvePath(cascadeBase, def) : def;
                    return promisifiedLoad(resolvedUrl, undefined, cascadeBase);
                }
                else {
                    var resolvedUrl = cascadeBase ? PathUtil_1.PathUtil.resolvePath(cascadeBase, def.url) : def.url;
                    return promisifiedLoad(resolvedUrl, def.basePath, cascadeBase);
                }
            });
            es6_promise_1.Promise.all(defs)
                .then(function (confs) { return callback(null, confs.reduce(_mergeObject)); })
                .catch(function (e) { return callback(e); });
        });
    }
    function promisifiedLoad(url, assetBase, cascadeBase) {
        return new es6_promise_1.Promise(function (resolve, reject) {
            loadResolvedConfiguration(url, assetBase, cascadeBase, function (err, conf) { return (err ? reject(err) : resolve(conf)); });
        });
    }
    return loadResolvedConfiguration;
}
exports.makeLoadConfigurationFunc = makeLoadConfigurationFunc;
/**
 * アセット定義のマップを配列に変換する。
 * @param assets アセット定義のマップ
 */
function toAssetArray(assets) {
    return Object.keys(assets).map(function (assetId) {
        return __assign({ id: assetId }, assets[assetId]);
    });
}
exports.toAssetArray = toAssetArray;
/**
 * 与えられたオブジェクト二つを「マージ」する。
 * ここでマージとは、オブジェクトのフィールドをイテレートし、
 * プリミティブ値であれば上書き、配列であればconcat、オブジェクトであれば再帰的にマージする処理である。
 *
 * @param target マージされるオブジェクト。この値は破壊される
 * @param source マージするオブジェクト
 */
function _mergeObject(target, source) {
    var ks = Object.keys(source);
    for (var i = 0, len = ks.length; i < len; ++i) {
        var k = ks[i];
        var sourceVal = source[k];
        var sourceValType = typeof sourceVal;
        var targetValType = typeof target[k];
        if (sourceValType !== targetValType) {
            target[k] = sourceVal;
            continue;
        }
        if (sourceValType === "string" || sourceValType === "number" || sourceValType === "boolean") {
            target[k] = sourceVal;
        }
        else if (sourceValType === "object") {
            if (sourceVal == null) {
                target[k] = sourceVal;
            }
            else if (Array.isArray(sourceVal)) {
                target[k] = target[k].concat(sourceVal);
            }
            else {
                _mergeObject(target[k], sourceVal);
            }
        }
        else {
            throw new Error("_mergeObject(): unknown type");
        }
    }
    return target;
}
exports._mergeObject = _mergeObject;
/**
 * @private
 */
function _normalizeAssets(configuration, assetBase) {
    var _a;
    var assets = {};
    function addAsset(assetId, asset) {
        if (assets.hasOwnProperty(assetId))
            throw new Error("_normalizeAssets: asset ID already exists: " + assetId);
        assets[assetId] = asset;
    }
    if (Array.isArray(configuration.assets)) {
        configuration.assets.forEach(function (asset) {
            var _a;
            var path = asset.path;
            if (path) {
                asset.virtualPath = (_a = asset.virtualPath) !== null && _a !== void 0 ? _a : asset.path;
                asset.path = PathUtil_1.PathUtil.resolvePath(assetBase, path);
            }
            addAsset(path, asset);
        });
    }
    else if (typeof configuration.assets === "object") {
        for (var assetId in configuration.assets) {
            if (!configuration.assets.hasOwnProperty(assetId))
                continue;
            var asset = configuration.assets[assetId];
            if (asset.path) {
                asset.virtualPath = (_a = asset.virtualPath) !== null && _a !== void 0 ? _a : asset.path;
                asset.path = PathUtil_1.PathUtil.resolvePath(assetBase, asset.path);
            }
            addAsset(assetId, asset);
        }
    }
    if (configuration.globalScripts) {
        configuration.globalScripts.forEach(function (path) {
            addAsset(path, {
                type: /\.json$/i.test(path) ? "text" : "script",
                virtualPath: path,
                path: PathUtil_1.PathUtil.resolvePath(assetBase, path),
                global: true
            });
        });
        delete configuration.globalScripts;
    }
    configuration.assets = assets;
    return configuration;
}

},{"./PathUtil":94,"es6-promise":215}],98:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"./lib/index":116,"dup":2}],99:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clock = void 0;
var g = require("@akashic/akashic-engine");
/**
 * FPS管理用のクロック。
 *
 * `pdi.Looper` の定期または不定期の呼び出しを受け付け、指定されたFPSから求めた
 * 1フレーム分の時間(1フレーム時間)が経過するたびに `frameTrigger` をfireする。
 */
var Clock = exports.Clock = /** @class */ (function () {
    function Clock(param) {
        this.fps = param.fps;
        this.scaleFactor = param.scaleFactor || 1;
        this.frameTrigger = new g.Trigger();
        this.rawFrameTrigger = new g.Trigger();
        this._platform = param.platform;
        this._maxFramePerOnce = param.maxFramePerOnce;
        this._deltaTimeBrokenThreshold = param.deltaTimeBrokenThreshold || Clock.DEFAULT_DELTA_TIME_BROKEN_THRESHOLD;
        if (param.frameHandler) {
            this.frameTrigger.add(param.frameHandler, param.frameHandlerOwner);
        }
        this.running = false;
        this._totalDeltaTime = 0;
        this._onLooperCall_bound = this._onLooperCall.bind(this);
        this._looper = this._platform.createLooper(this._onLooperCall_bound);
        this._waitTime = 0;
        this._waitTimeDoubled = 0;
        this._waitTimeMax = 0;
        this._skipFrameWaitTime = 0;
        this._realMaxFramePerOnce = 0;
    }
    Clock.prototype.start = function () {
        if (this.running)
            return;
        this._totalDeltaTime = 0;
        this._updateWaitTimes(this.fps, this.scaleFactor);
        this._looper.start();
        this.running = true;
    };
    Clock.prototype.stop = function () {
        if (!this.running)
            return;
        this._looper.stop();
        this.running = false;
    };
    /**
     * `scaleFactor` を変更する。
     * start()した後にも呼び出せるが、1フレーム以下の経過時間情報はリセットされる点に注意。
     */
    Clock.prototype.changeScaleFactor = function (scaleFactor) {
        if (this.running) {
            this.stop();
            this.scaleFactor = scaleFactor;
            this.start();
        }
        else {
            this.scaleFactor = scaleFactor;
        }
    };
    Clock.prototype._onLooperCall = function (deltaTime) {
        if (isNaN(deltaTime)) {
            // NaN が渡された場合 次のフレームまで進行する。
            deltaTime = this._waitTime - this._totalDeltaTime;
        }
        var rawDeltaTime = deltaTime;
        if (deltaTime <= 0) {
            // 時間が止まっているか巻き戻っている。初回呼び出しか、あるいは何かがおかしい。時間経過0と見なす。
            return this._waitTime - this._totalDeltaTime;
        }
        if (deltaTime > this._deltaTimeBrokenThreshold) {
            // 間隔が長すぎる。何かがおかしい。時間経過を1フレーム分とみなす。
            deltaTime = this._waitTime;
        }
        var totalDeltaTime = this._totalDeltaTime;
        totalDeltaTime += deltaTime;
        if (totalDeltaTime <= this._skipFrameWaitTime) {
            // 1フレーム分消化するほどの時間が経っていない。
            this._totalDeltaTime = totalDeltaTime;
            return this._waitTime - totalDeltaTime;
        }
        var frameCount = (totalDeltaTime < this._waitTimeDoubled) ? 1
            : (totalDeltaTime > this._waitTimeMax) ? this._realMaxFramePerOnce
                : (totalDeltaTime / this._waitTime) | 0;
        var fc = frameCount;
        var arg = {
            deltaTime: rawDeltaTime,
            interrupt: false
        };
        while (fc > 0 && this.running && !arg.interrupt) {
            --fc;
            this.frameTrigger.fire(arg);
            arg.deltaTime = 0; // 同ループによる2度目以降の呼び出しは差分を0とみなす。
        }
        totalDeltaTime -= ((frameCount - fc) * this._waitTime);
        this.rawFrameTrigger.fire();
        this._totalDeltaTime = totalDeltaTime;
        return this._waitTime - totalDeltaTime;
    };
    Clock.prototype._updateWaitTimes = function (fps, scaleFactor) {
        var realFps = fps * scaleFactor;
        this._waitTime = 1000 / realFps;
        this._waitTimeDoubled = Math.max((2000 / realFps) | 0, 1);
        this._waitTimeMax = Math.max(scaleFactor * (1000 * this._maxFramePerOnce / realFps) | 0, 1);
        this._skipFrameWaitTime = (this._waitTime * Clock.ANTICIPATE_RATE) | 0;
        this._realMaxFramePerOnce = this._maxFramePerOnce * scaleFactor;
    };
    /**
     * 経過時間先取りの比率。
     *
     * FPSから定まる「1フレーム」の経過時間が経っていなくても、この割合の時間が経過していれば1フレーム分の計算を進めてしまう。
     * その代わりに次フレームまでの所要時間を長くする。
     * 例えば20FPSであれば50msで1フレームだが、50*0.8 = 40ms 時点で1フレーム進めてしまい、次フレームまでの時間を60msにする。
     */
    Clock.ANTICIPATE_RATE = 0.8;
    /**
     * 異常値とみなして無視する `Looper` の呼び出し間隔[ms]のデフォルト値。
     */
    Clock.DEFAULT_DELTA_TIME_BROKEN_THRESHOLD = 150;
    return Clock;
}());

},{"@akashic/akashic-engine":2}],100:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBuffer = void 0;
/**
 * AMFlowとPDIから流れ込むイベントを蓄積するバッファ。
 *
 * AMFLowから受信するかどうか、AMFlowに送るかどうかは外部から切り替えることができる。
 * 状態によっては、`_amflow` の認証で `subscribeEvent` と `sendEvent` のいずれかまたは両方の権限を取得している必要がある。
 * 詳細は `setMode()` のコメントを参照。
 */
var EventBuffer = /** @class */ (function () {
    function EventBuffer(param) {
        var _this = this;
        /**
         * スキップ中に発生した非ローカルイベントを破棄するかどうか。
         * NOTE: 基本的には `true` で問題ないはずだが念の為メンバ変数として持たせておく
         */
        this._discardsEventsDuringSkip = true;
        /**
         * スキップ中に発生したローカルイベントを破棄するかどうか。
         * NOTE: 基本的には `true` で問題ないはずだが念の為メンバ変数として持たせておく
         */
        this._discardsLocalEventsDuringSkip = true;
        this._filters = null;
        this._amflow = param.amflow;
        this._isLocalReceiver = true;
        this._isReceiver = false;
        this._isSender = false;
        this._isDiscarder = false;
        this._skipping = false;
        this._defaultEventPriority = 0;
        this._buffer = [];
        this._joinLeaveBuffer = [];
        this._localBuffer = [];
        this._filters = null;
        this._filterController = {
            // この関数は `this.processEvents()` が呼び出すイベントフィルタから同期的にしか呼び出されることはない。(また呼び出されてはならない)
            // `this.processEvents()` は `this._unfilteredEvents` などを空にして、同期的にイベントフィルタを呼ぶ。
            // 従ってこの関数が呼ばれる時、 `this._unfilteredEvents` などに後続の (次フレーム以降に処理される) イベントが積まれている可能性はない。
            // よって単純に push() しても、後続のイベントとの順序が崩れる可能性はない。
            processNext: function (pev) {
                if (EventBuffer.isEventLocal(pev)) {
                    _this._unfilteredLocalEvents.push(pev);
                }
                else {
                    _this._unfilteredEvents.push(pev);
                }
            }
        };
        this._unfilteredLocalEvents = [];
        this._unfilteredEvents = [];
        this._resolvePointEvent_bound = param.game.resolvePointEvent.bind(param.game);
        this._onEvent_bound = this.onEvent.bind(this);
    }
    EventBuffer.isEventLocal = function (pev) {
        switch (pev[0 /* g.EventIndex.General.Code */]) {
            case 0 /* pl.EventCode.Join */:
                return pev[5 /* g.EventIndex.Join.Local */];
            case 1 /* pl.EventCode.Leave */:
                return pev[3 /* g.EventIndex.Leave.Local */];
            case 2 /* pl.EventCode.Timestamp */:
                return pev[4 /* g.EventIndex.Timestamp.Local */];
            case 3 /* pl.EventCode.PlayerInfo */:
                return pev[5 /* g.EventIndex.PlayerInfo.Local */];
            case 32 /* pl.EventCode.Message */:
                return pev[4 /* g.EventIndex.Message.Local */];
            case 33 /* pl.EventCode.PointDown */:
                return pev[8 /* g.EventIndex.PointDown.Local */];
            case 34 /* pl.EventCode.PointMove */:
                return pev[11 /* g.EventIndex.PointMove.Local */];
            case 35 /* pl.EventCode.PointUp */:
                return pev[11 /* g.EventIndex.PointUp.Local */];
            case 64 /* pl.EventCode.Operation */:
                return pev[5 /* g.EventIndex.Operation.Local */];
            default:
                throw new Error("EventBuffer.isEventLocal");
        }
    };
    /**
     * モードを切り替える。
     *
     * この関数の呼び出す場合、最後に呼び出された _amflow#authenticate() から得た Permission は次の条件を満たさねばならない:
     * * 引数 `param.isReceiver` に真を渡す場合、次に偽を渡すまでの間、 `subscribeEvent` が真であること。
     * * 引数 `param.isSender` に真を渡す場合、次に偽を渡すまでの間、 `sendEvent` が真であること。
     */
    EventBuffer.prototype.setMode = function (param) {
        if (param.isLocalReceiver != null) {
            this._isLocalReceiver = param.isLocalReceiver;
        }
        if (param.isReceiver != null) {
            if (this._isReceiver !== param.isReceiver) {
                this._isReceiver = param.isReceiver;
                if (param.isReceiver) {
                    this._amflow.onEvent(this._onEvent_bound);
                }
                else {
                    this._amflow.offEvent(this._onEvent_bound);
                }
            }
        }
        if (param.isSender != null) {
            this._isSender = param.isSender;
        }
        if (param.isDiscarder != null) {
            this._isDiscarder = param.isDiscarder;
        }
        if (param.defaultEventPriority != null) {
            this._defaultEventPriority = 3 /* pl.EventFlagsMask.Priority */ & param.defaultEventPriority;
        }
    };
    EventBuffer.prototype.getMode = function () {
        return {
            isLocalReceiver: this._isLocalReceiver,
            isReceiver: this._isReceiver,
            isSender: this._isSender,
            isDiscarder: this._isDiscarder,
            defaultEventPriority: this._defaultEventPriority
        };
    };
    EventBuffer.prototype.onEvent = function (pev) {
        if (EventBuffer.isEventLocal(pev)) {
            if (this._isLocalReceiver &&
                !this._isDiscarder &&
                !(this._skipping && this._discardsLocalEventsDuringSkip)) {
                this._unfilteredLocalEvents.push(pev);
            }
            return;
        }
        if (this._skipping && this._discardsEventsDuringSkip) {
            return;
        }
        if (this._isReceiver && !this._isDiscarder) {
            this._unfilteredEvents.push(pev);
        }
        if (this._isSender) {
            if (pev[1 /* g.EventIndex.General.EventFlags */] == null) {
                pev[1 /* g.EventIndex.General.EventFlags */] = this._defaultEventPriority & 3 /* pl.EventFlagsMask.Priority */;
            }
            this._amflow.sendEvent(pev);
        }
    };
    EventBuffer.prototype.onPointEvent = function (e) {
        var pev = this._resolvePointEvent_bound(e);
        if (pev)
            this.onEvent(pev);
    };
    /**
     * filterを無視してイベントを追加する。
     */
    EventBuffer.prototype.addEventDirect = function (pev) {
        if (EventBuffer.isEventLocal(pev)) {
            if (!this._isLocalReceiver || this._isDiscarder)
                return;
            this._localBuffer.push(pev);
            return;
        }
        if (this._isReceiver && !this._isDiscarder) {
            if (pev[0 /* g.EventIndex.General.Code */] === 0 /* pl.EventCode.Join */ || pev[0 /* g.EventIndex.General.Code */] === 1 /* pl.EventCode.Leave */) {
                this._joinLeaveBuffer.push(pev);
            }
            else {
                this._buffer.push(pev);
            }
        }
        if (this._isSender) {
            if (pev[1 /* g.EventIndex.General.EventFlags */] == null) {
                pev[1 /* g.EventIndex.General.EventFlags */] = this._defaultEventPriority & 3 /* pl.EventFlagsMask.Priority */;
            }
            this._amflow.sendEvent(pev);
        }
    };
    EventBuffer.prototype.readEvents = function () {
        var ret = this._buffer;
        if (ret.length === 0)
            return null;
        this._buffer = [];
        return ret;
    };
    EventBuffer.prototype.readJoinLeaves = function () {
        var ret = this._joinLeaveBuffer;
        if (ret.length === 0)
            return null;
        this._joinLeaveBuffer = [];
        return ret;
    };
    EventBuffer.prototype.readLocalEvents = function () {
        var ret = this._localBuffer;
        if (ret.length === 0)
            return null;
        this._localBuffer = [];
        return ret;
    };
    EventBuffer.prototype.addFilter = function (filter, handleEmpty) {
        if (!this._filters)
            this._filters = [];
        this._filters.push({ func: filter, handleEmpty: !!handleEmpty });
    };
    EventBuffer.prototype.removeFilter = function (filter) {
        if (!this._filters)
            return;
        if (!filter) {
            this._filters = null;
            return;
        }
        for (var i = this._filters.length - 1; i >= 0; --i) {
            if (this._filters[i].func === filter)
                this._filters.splice(i, 1);
        }
    };
    EventBuffer.prototype.processEvents = function (isLocal) {
        var ulpevs = this._unfilteredLocalEvents;
        var upevs = this._unfilteredEvents;
        this._unfilteredLocalEvents = [];
        var pevs = ulpevs;
        if (!isLocal && upevs.length > 0) {
            pevs = (pevs.length > 0) ? pevs.concat(upevs) : upevs;
            this._unfilteredEvents = [];
        }
        if (this._filters) {
            for (var i = 0; i < this._filters.length; ++i) {
                var filter = this._filters[i];
                if (pevs.length > 0 || filter.handleEmpty)
                    pevs = this._filters[i].func(pevs, this._filterController) || [];
            }
        }
        for (var i = 0; i < pevs.length; ++i) {
            var pev = pevs[i];
            if (EventBuffer.isEventLocal(pev)) {
                this._localBuffer.push(pev);
            }
            else if (pev[0 /* g.EventIndex.General.Code */] === 0 /* pl.EventCode.Join */ || pev[0 /* g.EventIndex.General.Code */] === 1 /* pl.EventCode.Leave */) {
                this._joinLeaveBuffer.push(pev);
            }
            else {
                this._buffer.push(pev);
            }
        }
    };
    EventBuffer.prototype.startSkipping = function () {
        this._skipping = true;
    };
    EventBuffer.prototype.endSkipping = function () {
        this._skipping = false;
    };
    return EventBuffer;
}());
exports.EventBuffer = EventBuffer;

},{}],101:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * `GameLoop` の実行モード。
 */
var ExecutionMode;
(function (ExecutionMode) {
    /**
     * `GameLoop` がactiveである。
     *
     * `GameLoop#_executionMode` がこの値である場合、そのインスタンスは:
     *  - playlog.Eventを外部から受け付ける
     *  - playlog.Tickを生成し外部へ送信する
     */
    ExecutionMode[ExecutionMode["Active"] = 0] = "Active";
    /**
     * `GameLoop` がpassiveである。
     *
     * `GameLoop#_executionMode` がこの値である場合、そのインスタンスは:
     *  - playlog.Eventを外部に送信する
     *  - playlog.Tickを受信し、それに基づいて `g.Game#tick()` を呼び出す
     */
    ExecutionMode[ExecutionMode["Passive"] = 1] = "Passive";
})(ExecutionMode || (ExecutionMode = {}));
exports.default = ExecutionMode;

},{}],102:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var g = require("@akashic/akashic-engine");
/**
 * Gameクラス。
 *
 * このクラスはakashic-engineに由来するクラスであり、
 * アンダースコアで始まるプロパティ (e.g. _foo) を外部から参照する場合がある点に注意。
 * (akashic-engine においては、_foo は「ゲーム開発者向けでない」ことしか意味しない。)
 */
var Game = /** @class */ (function (_super) {
    __extends(Game, _super);
    function Game(param) {
        var _this = _super.call(this, param) || this;
        /**
         * 特定ageへの到達を通知するTrigger。
         * fire時には到達したageが渡される。
         */
        _this.agePassedTrigger = new g.Trigger();
        /**
         * 要求を受けた後の目標時刻到達を通知するTrigger。
         * 目標時刻関数を用いたリプレイ中でなければfireされない。
         * fire時には到達した目標時刻が渡される。
         */
        _this.targetTimeReachedTrigger = new g.Trigger();
        /**
         * GameLoopのスキップ状態の変化を通知するTrigger。
         * 通常状態からスキップ状態に遷移する際にtrue、スキップ状態から通常状態に戻る時にfalseが渡される。
         *
         * ゲーム開発者に公開される g.Game#skippingChanged との違いに注意。
         * 組み込み側に公開されるこちらが常にfireされる一方、`skippingChanged` は `isSkipAware` が真の時のみfireされる。
         */
        _this.skippingChangedTrigger = new g.Trigger();
        /**
         * Gameの続行が断念されたことを通知するTrigger。
         *
         * 現在のバージョンでは、これをfireする方法は `Game#_abortGame()` の呼び出し、または
         * それを引き起こすリトライ不能のアセットエラーだけである。
         * ただしこの `Game#_abortGame()` の仕様は今後変動しうる。
         */
        _this.abortTrigger = new g.Trigger();
        _this._notifyPassedAgeTable = Object.create(null);
        _this._notifiesTargetTimeReached = false;
        _this._isSkipAware = false;
        _this.player = param.player;
        _this.handlerSet = param.handlerSet;
        _this._gameArgs = param.gameArgs;
        _this._globalGameArgs = param.globalGameArgs;
        _this.skippingChangedTrigger.add(_this._onSkippingChanged, _this);
        return _this;
    }
    /**
     * 特定age到達時の通知を要求する。
     * @param age 通知を要求するage
     */
    Game.prototype.requestNotifyAgePassed = function (age) {
        this._notifyPassedAgeTable[age] = true;
    };
    /**
     * 特定age到達時の通知要求を解除する。
     * @param age 通知要求を解除するage
     */
    Game.prototype.cancelNotifyAgePassed = function (age) {
        delete this._notifyPassedAgeTable[age];
    };
    /**
     * 次に目標時刻を到達した時点を通知するよう要求する。
     * 重複呼び出しはサポートしていない。すなわち、呼び出し後 `targetTimeReachedTrigger` がfireされるまでの呼び出しは無視される。
     */
    Game.prototype.requestNotifyTargetTimeReached = function () {
        this._notifiesTargetTimeReached = true;
    };
    /**
     * 目標時刻を到達した時点を通知要求を解除する。
     */
    Game.prototype.cancelNofityTargetTimeReached = function () {
        this._notifiesTargetTimeReached = false;
    };
    Game.prototype.fireAgePassedIfNeeded = function () {
        var age = this.age - 1; // 通過済みのageを確認するため -1 する。
        if (this._notifyPassedAgeTable[age]) {
            delete this._notifyPassedAgeTable[age];
            this.agePassedTrigger.fire(age);
            return true;
        }
        return false;
    };
    Game.prototype.setStorageFunc = function (funcs) {
        this.storage._registerLoad(funcs.storageGetFunc);
        this.storage._registerWrite(funcs.storagePutFunc);
        // TODO: akashic-engine 側で書き換えられるようにする
        this.storage.requestValuesForJoinPlayer = funcs.requestValuesForJoinFunc;
    };
    Game.prototype.getIsSkipAware = function () {
        return this._isSkipAware;
    };
    Game.prototype.setIsSkipAware = function (aware) {
        this._isSkipAware = aware;
    };
    Game.prototype._destroy = function () {
        this.agePassedTrigger.destroy();
        this.agePassedTrigger = null;
        this.targetTimeReachedTrigger.destroy();
        this.targetTimeReachedTrigger = null;
        this.skippingChangedTrigger.destroy();
        this.skippingChangedTrigger = null;
        this.abortTrigger.destroy();
        this.abortTrigger = null;
        this.player = null;
        this.handlerSet = null;
        this._notifyPassedAgeTable = null;
        this._gameArgs = null;
        this._globalGameArgs = null;
        _super.prototype._destroy.call(this);
    };
    Game.prototype._restartWithSnapshot = function (snapshot) {
        var data = snapshot.data;
        if (data.seed != null) {
            // 例外ケース: 第0スタートポイントでスナップショットは持っていないので特別対応
            this._reset({ age: snapshot.frame, randSeed: data.seed });
            this._loadAndStart({ args: this._gameArgs, globalArgs: this._globalGameArgs });
        }
        else {
            this._reset({ age: snapshot.frame, nextEntityId: data.nextEntityId, randGenSer: data.randGenSer });
            this._loadAndStart({ args: this._gameArgs, snapshot: data.gameSnapshot });
        }
    };
    Game.prototype._abortGame = function () {
        this.abortTrigger.fire();
    };
    Game.prototype._onRawTargetTimeReached = function (targetTime) {
        if (this._notifiesTargetTimeReached) {
            this._notifiesTargetTimeReached = false;
            this.targetTimeReachedTrigger.fire(targetTime);
        }
    };
    Game.prototype._onSkippingChanged = function (skipping) {
        if (this._isSkipAware) {
            this.onSkipChange.fire(skipping);
        }
    };
    return Game;
}(g.Game));
exports.Game = Game;

},{"@akashic/akashic-engine":2}],103:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameDriver = void 0;
var g = require("@akashic/akashic-engine");
var utils_1 = require("@akashic/game-configuration/lib/utils");
var es6_promise_1 = require("es6-promise");
var constants = require("./constants");
var EventBuffer_1 = require("./EventBuffer");
var ExecutionMode_1 = require("./ExecutionMode");
var Game_1 = require("./Game");
var GameHandlerSet_1 = require("./GameHandlerSet");
var GameLoop_1 = require("./GameLoop");
var LoopMode_1 = require("./LoopMode");
var GAME_DESTROYED_MESSAGE = "GAME_DESTROYED";
var GameDriver = /** @class */ (function () {
    function GameDriver(param) {
        this.errorTrigger = new g.Trigger();
        this.configurationLoadedTrigger = new g.Trigger();
        this.gameCreatedTrigger = new g.Trigger();
        this._rendererRequirement = null;
        this._game = null;
        this._gameLoop = null;
        this._eventBuffer = null;
        this._openedAmflow = false;
        this._playToken = null;
        this._permission = null;
        this._hidden = false;
        this._destroyed = false;
        if (param.errorHandler)
            this.errorTrigger.add(param.errorHandler, param.errorHandlerOwner);
        this._platform = param.platform;
        this._loadConfigurationFunc = (0, utils_1.makeLoadConfigurationFunc)(param.platform.loadGameConfiguration);
        this._player = param.player;
    }
    /**
     * `GameDriver` を初期化する。
     */
    GameDriver.prototype.initialize = function (param, callback) {
        this.doInitialize(param).then(function () {
            callback();
        }, callback);
    };
    /**
     * `GameDriver` の各種状態を変更する。
     *
     * 引数 `param` のうち、省略されなかった値が新たに設定される。
     * `startGame()` によりゲームが開始されていた場合、暗黙に `stopGame()` が行われ、完了後 `startGame()` される。
     */
    GameDriver.prototype.changeState = function (param, callback) {
        var _this = this;
        var _a;
        var pausing = this._gameLoop && this._gameLoop.running;
        if (pausing)
            (_a = this._gameLoop) === null || _a === void 0 ? void 0 : _a.stop();
        this.initialize(param, function (err) {
            var _a;
            if (err) {
                callback(err);
                return;
            }
            if (pausing)
                (_a = _this._gameLoop) === null || _a === void 0 ? void 0 : _a.start();
            callback();
        });
    };
    /**
     * ゲームを開始する。
     * このメソッドの呼び出しは、 `initialize()` の完了後でなければならない。
     */
    GameDriver.prototype.startGame = function () {
        if (!this._gameLoop) {
            this.errorTrigger.fire(new Error("Not initialized"));
            return;
        }
        this._gameLoop.start();
    };
    /**
     * ゲームを(一時的に)止める。
     *
     * このメソッドの呼び出し後、 `startGame()` が呼び出されるまで、 `Game#tick()` は呼び出されない。
     * Active であればティックの生成が行われず、 Passive であれば受信したティックは蓄積される。
     */
    GameDriver.prototype.stopGame = function () {
        if (this._gameLoop) {
            this._gameLoop.stop();
        }
    };
    /**
     * このドライバが次にティックを生成する場合の、ageの値を設定する。
     * `ExecutionMode.Active` でない場合、動作に影響を与えない。
     * このメソッドの呼び出しは、 `initialize()` の完了後でなければならない。
     *
     * @param age 次に生成されるティックのage
     */
    GameDriver.prototype.setNextAge = function (age) {
        var _a;
        (_a = this._gameLoop) === null || _a === void 0 ? void 0 : _a.setNextAge(age);
    };
    GameDriver.prototype.getPermission = function () {
        return this._permission;
    };
    GameDriver.prototype.getDriverConfiguration = function () {
        var _a;
        return {
            playId: this._playId,
            playToken: (_a = this._playToken) !== null && _a !== void 0 ? _a : undefined,
            executionMode: this._gameLoop ? this._gameLoop.getExecutionMode() : undefined,
            eventBufferMode: this._eventBuffer ? this._eventBuffer.getMode() : undefined
        };
    };
    GameDriver.prototype.getLoopConfiguration = function () {
        return this._gameLoop ? this._gameLoop.getLoopConfiguration() : null;
    };
    GameDriver.prototype.getHidden = function () {
        return this._hidden;
    };
    /**
     * PDIに対してプライマリサーフェスのリセットを要求する。
     *
     * @param width プライマリサーフェスの幅。
     * @param height プライマリサーフェスの高さ。
     * @param rendererCandidates Rendererのタイプ。
     */
    GameDriver.prototype.resetPrimarySurface = function (width, height, rendererCandidates) {
        rendererCandidates = rendererCandidates ? rendererCandidates
            : this._rendererRequirement ? this._rendererRequirement.rendererCandidates
                : undefined;
        var game = this._game;
        var pf = this._platform;
        var primarySurface = pf.getPrimarySurface();
        game.renderers = game.renderers.filter(function (renderer) { return renderer !== primarySurface.renderer(); });
        pf.setRendererRequirement({
            primarySurfaceWidth: width,
            primarySurfaceHeight: height,
            rendererCandidates: rendererCandidates
        });
        this._rendererRequirement = {
            primarySurfaceWidth: width,
            primarySurfaceHeight: height,
            rendererCandidates: rendererCandidates
        };
        game.renderers.push(pf.getPrimarySurface().renderer());
        game.width = width;
        game.height = height;
        game.onResized.fire({ width: width, height: height });
        game.modified();
    };
    GameDriver.prototype.doInitialize = function (param) {
        var _this = this;
        var p = new es6_promise_1.Promise(function (resolve, reject) {
            if (_this._gameLoop && _this._gameLoop.running) {
                return reject(new Error("Game is running. Must be stopped."));
            }
            if (_this._gameLoop && param.loopConfiguration) {
                _this._gameLoop.setLoopConfiguration(param.loopConfiguration);
            }
            if (param.hidden != null) {
                _this._hidden = param.hidden;
                if (_this._game) {
                    _this._game._setMuted(param.hidden);
                }
            }
            resolve();
        }).then(function () {
            _this._assertLive();
            return _this._doSetDriverConfiguration(param.driverConfiguration);
        });
        var configurationUrl = param.configurationUrl;
        if (!configurationUrl)
            return p;
        return p.then(function () {
            _this._assertLive();
            return _this._loadConfiguration(configurationUrl, param.assetBase, param.configurationBase);
        }).then(function (conf) {
            _this._assertLive();
            return _this._createGame(conf, _this._player, param);
        });
    };
    GameDriver.prototype.destroy = function () {
        var _this = this;
        // NOTE: ここで破棄されるTriggerのfire中に呼ばれるとクラッシュするので、同期的処理だが念のためPromiseに包んで非同期で実行する
        return new es6_promise_1.Promise(function (resolve, _reject) {
            _this.stopGame();
            if (_this._game) {
                _this._game._destroy();
                _this._game = null;
            }
            _this.errorTrigger.destroy();
            _this.errorTrigger = null;
            _this.configurationLoadedTrigger.destroy();
            _this.configurationLoadedTrigger = null;
            _this.gameCreatedTrigger.destroy();
            _this.gameCreatedTrigger = null;
            if (_this._platform.destroy) {
                _this._platform.destroy();
            }
            else {
                _this._platform.setRendererRequirement(undefined);
            }
            _this._platform = null;
            _this._loadConfigurationFunc = null;
            _this._player = null;
            _this._rendererRequirement = null;
            _this._playId = undefined;
            _this._gameLoop = null;
            _this._eventBuffer = null;
            _this._openedAmflow = false;
            _this._playToken = null;
            _this._permission = null;
            _this._hidden = false;
            _this._destroyed = true;
            resolve();
        });
    };
    GameDriver.prototype._doSetDriverConfiguration = function (dconf) {
        var _this = this;
        var _a, _b;
        if (dconf == null) {
            return es6_promise_1.Promise.resolve();
        }
        // デフォルト値の補完
        if (dconf.playId === undefined)
            dconf.playId = (_a = this._playId) !== null && _a !== void 0 ? _a : undefined;
        if (dconf.playToken === undefined)
            dconf.playToken = (_b = this._playToken) !== null && _b !== void 0 ? _b : undefined;
        if (dconf.eventBufferMode === undefined) {
            if (dconf.executionMode === ExecutionMode_1.default.Active) {
                dconf.eventBufferMode = { isReceiver: true, isSender: false };
            }
            else if (dconf.executionMode === ExecutionMode_1.default.Passive) {
                dconf.eventBufferMode = { isReceiver: false, isSender: true };
            }
        }
        var p = es6_promise_1.Promise.resolve();
        if (this._playId !== dconf.playId) {
            p = p.then(function () {
                _this._assertLive();
                return _this._doOpenAmflow(dconf.playId);
            });
        }
        if (this._playToken !== dconf.playToken) {
            p = p.then(function () {
                _this._assertLive();
                return _this._doAuthenticate(dconf.playToken);
            });
        }
        return p.then(function () {
            _this._assertLive();
            if (dconf.eventBufferMode != null) {
                if (dconf.eventBufferMode.defaultEventPriority == null) {
                    if (_this._permission) {
                        dconf.eventBufferMode.defaultEventPriority = 3 /* pl.EventFlagsMask.Priority */ & _this._permission.maxEventPriority;
                    }
                    else {
                        // NOTE: permission が無ければイベントを送信することはできないが、念の為に優先度を最低につけておく。
                        dconf.eventBufferMode.defaultEventPriority = 0;
                    }
                }
                if (_this._eventBuffer) {
                    _this._eventBuffer.setMode(dconf.eventBufferMode);
                }
            }
            if (dconf.executionMode != null) {
                if (_this._gameLoop) {
                    _this._gameLoop.setExecutionMode(dconf.executionMode);
                }
            }
        });
    };
    GameDriver.prototype._doCloseAmflow = function () {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve, reject) {
            if (!_this._openedAmflow)
                return resolve();
            _this._platform.amflow.close(function (err) {
                _this._openedAmflow = false;
                var error = _this._getCallbackError(err);
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    };
    GameDriver.prototype._doOpenAmflow = function (playId) {
        var _this = this;
        if (playId === undefined) {
            return es6_promise_1.Promise.resolve();
        }
        var p = this._doCloseAmflow();
        return p.then(function () {
            _this._assertLive();
            return new es6_promise_1.Promise(function (resolve, reject) {
                if (playId === null)
                    return resolve();
                _this._platform.amflow.open(playId, function (err) {
                    var error = _this._getCallbackError(err);
                    if (error) {
                        return reject(error);
                    }
                    _this._openedAmflow = true;
                    _this._playId = playId;
                    if (_this._game)
                        _this._updateGamePlayId(_this._game);
                    resolve();
                });
            });
        });
    };
    GameDriver.prototype._doAuthenticate = function (playToken) {
        var _this = this;
        if (playToken == null)
            return es6_promise_1.Promise.resolve();
        return new es6_promise_1.Promise(function (resolve, reject) {
            _this._platform.amflow.authenticate(playToken, function (err, permission) {
                var error = _this._getCallbackError(err);
                if (error) {
                    return reject(error);
                }
                if (!permission) {
                    reject(new Error("Permission denied."));
                    return;
                }
                _this._playToken = playToken;
                _this._permission = permission;
                if (_this._game) {
                    _this._game.handlerSet.isSnapshotSaver = permission.writeTick;
                }
                resolve();
            });
        });
    };
    GameDriver.prototype._loadConfiguration = function (configurationUrl, assetBase, configurationBase) {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve, reject) {
            _this._loadConfigurationFunc(configurationUrl, assetBase, configurationBase, function (err, conf) {
                var error = _this._getCallbackError(err);
                if (error) {
                    return void reject(error);
                }
                if (!conf) {
                    return void reject(new Error("GameDriver#_loadConfiguration: No configuration found."));
                }
                _this.configurationLoadedTrigger.fire(conf);
                resolve(conf);
            });
        });
    };
    GameDriver.prototype._putZerothStartPoint = function (data) {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve, reject) {
            // AMFlowは第0スタートポイントに関して「書かれるまで待つ」という動作をするため、「なければ書き込む」ことはできない。
            // NOTE: 仕様上第0スタートポイントには必ず data.startedAt が存在するとみなせる。
            var zerothStartPoint = { frame: 0, timestamp: data.startedAt, data: data };
            _this._platform.amflow.putStartPoint(zerothStartPoint, function (err) {
                var error = _this._getCallbackError(err);
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });
    };
    GameDriver.prototype._getStartPoint = function (frame) {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve, reject) {
            _this._platform.amflow.getStartPoint({ frame: frame }, function (err, startPoint) {
                var error = _this._getCallbackError(err);
                if (error)
                    return reject(error);
                if (!startPoint)
                    return reject(new Error("GameDriver#_getStartPoint: No startPoint found"));
                resolve(startPoint);
            });
        });
    };
    GameDriver.prototype._createGame = function (conf, player, param) {
        var _this = this;
        var _a, _b;
        var writeTick = !!((_a = this._permission) === null || _a === void 0 ? void 0 : _a.writeTick);
        var putSeed = !!(((_b = param.driverConfiguration) === null || _b === void 0 ? void 0 : _b.executionMode) === ExecutionMode_1.default.Active) && writeTick;
        if (!param.loopConfiguration) // このパス (configurationUrl があって Game を作る) では必須
            throw new Error("GameDriver#_createGame: No loopConfiguration");
        var loopConfiguration = param.loopConfiguration;
        var p;
        if (putSeed) {
            p = this._putZerothStartPoint({
                seed: Date.now(),
                globalArgs: param.globalGameArgs,
                fps: conf.fps,
                startedAt: Date.now()
            });
        }
        else {
            p = es6_promise_1.Promise.resolve();
        }
        p = p.then(function () {
            _this._assertLive();
            return _this._getStartPoint(0);
        }).then(function (zerothSp) {
            if (!putSeed && loopConfiguration.loopMode === LoopMode_1.default.Realtime) {
                // 明確に最新に追いつきたいので、最新のスナップショットを探す
                return _this._getStartPoint(constants.PSEUDO_INFINITE_AGE).then(function (latestSp) { return [zerothSp, latestSp]; });
            }
            return [zerothSp, zerothSp];
        });
        return p.then(function (_a) {
            var zerothStartPoint = _a[0], latestStartPoint = _a[1];
            _this._assertLive();
            var zerothData = zerothStartPoint.data;
            if (typeof zerothData.seed !== "number") // 型がないので一応確認
                throw new Error("GameDriver#_createGame: No seed found in the zeroth startpoint.");
            var pf = _this._platform;
            var driverConf = param.driverConfiguration || {
                eventBufferMode: { isReceiver: true, isSender: false },
                executionMode: ExecutionMode_1.default.Active
            };
            var seed = zerothData.seed;
            var args = param.gameArgs;
            var globalArgs = zerothData.globalArgs;
            var startedAt = zerothData.startedAt;
            var rendererRequirement = {
                primarySurfaceWidth: conf.width,
                primarySurfaceHeight: conf.height,
                rendererCandidates: conf.renderers // TODO: g.GameConfiguration に renderers の定義を加える
            };
            pf.setRendererRequirement(rendererRequirement);
            var handlerSet = new GameHandlerSet_1.GameHandlerSet({
                isSnapshotSaver: writeTick
            });
            var game = new Game_1.Game({
                engineModule: g,
                handlerSet: handlerSet,
                configuration: conf,
                selfId: player.id,
                player: player,
                resourceFactory: pf.getResourceFactory(),
                assetBase: param.assetBase,
                operationPluginViewInfo: (pf.getOperationPluginViewInfo ? pf.getOperationPluginViewInfo() : undefined),
                gameArgs: args,
                globalGameArgs: globalArgs
            });
            var eventBuffer = new EventBuffer_1.EventBuffer({ game: game, amflow: pf.amflow });
            // NOTE: this._doSetDriverConfiguration() により driverConf の各 config が non-null であることが保証されている
            var eventBufferMode = driverConf.eventBufferMode;
            var executionMode = driverConf.executionMode;
            eventBuffer.setMode(eventBufferMode);
            pf.setPlatformEventHandler(eventBuffer);
            handlerSet.setEventFilterFuncs({
                addFilter: eventBuffer.addFilter.bind(eventBuffer),
                removeFilter: eventBuffer.removeFilter.bind(eventBuffer)
            });
            game.renderers.push(pf.getPrimarySurface().renderer());
            var gameLoop = new GameLoop_1.GameLoop({
                game: game,
                amflow: pf.amflow,
                platform: pf,
                executionMode: executionMode,
                eventBuffer: eventBuffer,
                configuration: loopConfiguration,
                startedAt: startedAt,
                profiler: param.profiler
            });
            gameLoop.rawTargetTimeReachedTrigger.add(game._onRawTargetTimeReached, game);
            handlerSet.setCurrentTimeFunc(gameLoop.getCurrentTime.bind(gameLoop));
            game._reset({ age: 0, randSeed: seed });
            _this._updateGamePlayId(game);
            if (_this._hidden)
                game._setMuted(true);
            handlerSet.snapshotTrigger.add(function (startPoint) {
                if (startPoint.frame === 0) {
                    // 0 フレーム目の startPoint は状態復元の高速化に寄与しない。
                    // またシードの保存など別用途で使っているので無視。(ref. _putZerothStartPoint())
                    return;
                }
                _this._platform.amflow.putStartPoint(startPoint, function (err) {
                    var error = _this._getCallbackError(err);
                    if (error) {
                        _this.errorTrigger.fire(error);
                    }
                });
            });
            _this._game = game;
            _this._eventBuffer = eventBuffer;
            _this._gameLoop = gameLoop;
            _this._rendererRequirement = rendererRequirement;
            _this.gameCreatedTrigger.fire(game);
            gameLoop.reset(latestStartPoint);
        });
    };
    GameDriver.prototype._updateGamePlayId = function (game) {
        var _this = this;
        game.playId = this._playId;
        game.external.send = function (data) {
            if (!_this._playId)
                return;
            _this._platform.sendToExternal(_this._playId, data);
        };
    };
    // 非同期処理中にゲームがdestroy済みかどうか判定するためのメソッド
    GameDriver.prototype._assertLive = function () {
        if (this._destroyed) {
            throw new Error(GAME_DESTROYED_MESSAGE);
        }
    };
    // コールバック時にエラーが発生もしくはゲームがdestroy済みの場合はErrorを返す
    GameDriver.prototype._getCallbackError = function (err) {
        if (err) {
            return err;
        }
        else if (this._destroyed) {
            return new Error(GAME_DESTROYED_MESSAGE);
        }
        return null;
    };
    return GameDriver;
}());
exports.GameDriver = GameDriver;

},{"./EventBuffer":100,"./ExecutionMode":101,"./Game":102,"./GameHandlerSet":104,"./GameLoop":105,"./LoopMode":107,"./constants":115,"@akashic/akashic-engine":2,"@akashic/game-configuration/lib/utils":95,"es6-promise":215}],104:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameHandlerSet = void 0;
var g = require("@akashic/akashic-engine");
var GameHandlerSet = /** @class */ (function () {
    function GameHandlerSet(param) {
        this.raiseEventTrigger = new g.Trigger();
        this.raiseTickTrigger = new g.Trigger();
        this.snapshotTrigger = new g.Trigger();
        this.changeSceneModeTrigger = new g.Trigger();
        this._getCurrentTimeFunc = null;
        this._eventFilterFuncs = null;
        this._local = null;
        this._tickGenerationMode = null;
        this.isSnapshotSaver = !!param.isSnapshotSaver;
    }
    /**
     * `Game` が利用する時刻取得関数をセットする。
     * このメソッドは `Game#_load()` 呼び出しに先行して呼び出されていなければならない。
     */
    GameHandlerSet.prototype.setCurrentTimeFunc = function (fun) {
        this._getCurrentTimeFunc = fun;
    };
    /**
     * `Game` のイベントフィルタ関連実装をセットする。
     * このメソッドは `Game#_load()` 呼び出しに先行して呼び出されていなければならない。
     */
    GameHandlerSet.prototype.setEventFilterFuncs = function (funcs) {
        this._eventFilterFuncs = funcs;
    };
    GameHandlerSet.prototype.removeAllEventFilters = function () {
        if (this._eventFilterFuncs)
            this._eventFilterFuncs.removeFilter();
    };
    GameHandlerSet.prototype.changeSceneMode = function (mode) {
        this._local = mode.local;
        this._tickGenerationMode = mode.tickGenerationMode;
        this.changeSceneModeTrigger.fire(mode);
    };
    GameHandlerSet.prototype.getCurrentTime = function () {
        // GameLoopの同名メソッドとは戻り値が異なるが、 `Game.getCurrentTime()` は `Date.now()` の代替として使用されるため、整数値を返す。
        return Math.floor(this._getCurrentTimeFunc());
    };
    GameHandlerSet.prototype.raiseEvent = function (event) {
        this.raiseEventTrigger.fire(event);
    };
    GameHandlerSet.prototype.raiseTick = function (events) {
        this.raiseTickTrigger.fire(events);
    };
    GameHandlerSet.prototype.addEventFilter = function (filter, handleEmpty) {
        if (this._eventFilterFuncs)
            this._eventFilterFuncs.addFilter(filter, handleEmpty);
    };
    GameHandlerSet.prototype.removeEventFilter = function (filter) {
        if (this._eventFilterFuncs && filter) // `filter` のチェックは念のため。(undefined で呼ぶと removeFilter() が全削除になってしまう)
            this._eventFilterFuncs.removeFilter(filter);
    };
    GameHandlerSet.prototype.shouldSaveSnapshot = function () {
        return this.isSnapshotSaver;
    };
    GameHandlerSet.prototype.getInstanceType = function () {
        // NOTE: Active かどうかは `shouldSaveSnapshot()` と等価なので、簡易対応としてこの実装を用いる。
        return this.shouldSaveSnapshot() ? "active" : "passive";
    };
    GameHandlerSet.prototype.saveSnapshot = function (frame, gameSnapshot, randGenSer, nextEntityId, timestamp) {
        if (timestamp === void 0) { timestamp = this._getCurrentTimeFunc(); }
        if (!this.shouldSaveSnapshot())
            return;
        this.snapshotTrigger.fire({
            frame: frame,
            timestamp: timestamp,
            data: {
                randGenSer: randGenSer,
                nextEntityId: nextEntityId,
                gameSnapshot: gameSnapshot
            }
        });
    };
    return GameHandlerSet;
}());
exports.GameHandlerSet = GameHandlerSet;

},{"@akashic/akashic-engine":2}],105:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameLoop = void 0;
var g = require("@akashic/akashic-engine");
var Clock_1 = require("./Clock");
var constants = require("./constants");
var ExecutionMode_1 = require("./ExecutionMode");
var LoopMode_1 = require("./LoopMode");
var LoopRenderMode_1 = require("./LoopRenderMode");
var ProfilerClock_1 = require("./ProfilerClock");
var TickController_1 = require("./TickController");
var EventIndex = g.EventIndex; // eslint-disable-line @typescript-eslint/naming-convention
/**
 * ゲームのメインループ管理クラス。
 * clock frameの度にTickBufferに蓄積されたTickを元にゲームを動かす。
 *
 * start() から stop() までの間、最後に呼び出された _amflow.authenticate() は Permission#readTick を返していなければならない。
 */
var GameLoop = /** @class */ (function () {
    function GameLoop(param) {
        this.errorTrigger = new g.Trigger();
        this.rawTargetTimeReachedTrigger = new g.Trigger();
        this.running = false;
        /**
         * 最後のティック通知以後に、ローカルティック補間なしでスキップされた時間。
         *
         * ローカルティックの数は不定であるため、本来「省略された」数を数えることはできない。
         * ただし Realtime 時や omitInterpolatedTickOnReplay フラグが真の場合には「タイムスタンプ待ちをせずに即座に時間を進める」場合がある。
         * このような時に「タイムスタンプ待ちを行なっていたらいくつのローカルティックがある時間だったか」は求まる。この時間を累積する変数。
         */
        this._omittedTickDuration = 0;
        this._sceneTickMode = null;
        this._sceneLocalMode = null;
        this._waitingStartPoint = false;
        this._lastRequestedStartPointAge = -1;
        this._lastRequestedStartPointTime = -1;
        this._waitingNextTick = false;
        /**
         * reset() 後、一度でも最新 (既知最新でなく実際の最新と思われる) tick を見つけたか。
         *
         * この値が偽である場合、受信できていない後続 tick が存在する可能性がある。
         * 真ならば、以降の tick はすべて AMFlow#onTick() で受け取るはずなので、後続を探すための tick リクエストが不要になる。
         * (なお一部の異常系ではこの値が真でも後続 tick を見落としている可能性があるが、その場合はポーリング処理で救うことにする)
         */
        this._foundLatestTick = false;
        this._skipping = false;
        this._lastPollingTickTime = 0;
        this._events = [];
        this._currentTime = param.startedAt;
        this._currentTickTime = this._currentTime;
        this._frameTime = 1000 / param.game.fps;
        if (param.errorHandler) {
            this.errorTrigger.add(param.errorHandler, param.errorHandlerOwner);
        }
        var conf = param.configuration;
        this._startedAt = param.startedAt;
        this._targetTimeFunc = conf.targetTimeFunc || null;
        this._targetTimeOffset = conf.targetTimeOffset || null;
        this._originDate = conf.originDate || null;
        this._realTargetTimeOffset = (this._originDate != null) ? this._originDate : (this._targetTimeOffset || 0) + this._startedAt;
        this._delayIgnoreThreshold = conf.delayIgnoreThreshold || constants.DEFAULT_DELAY_IGNORE_THRESHOLD;
        this._skipTicksAtOnce = conf.skipTicksAtOnce || constants.DEFAULT_SKIP_TICKS_AT_ONCE;
        this._skipThreshold = conf.skipThreshold || constants.DEFAULT_SKIP_THRESHOLD;
        this._skipThresholdTime = this._skipThreshold * this._frameTime;
        // this._skipAwareGame はないことに注意 (Game#getIsSkipAware()) を使う
        this._jumpTryThreshold = conf.jumpTryThreshold || constants.DEFAULT_JUMP_TRY_THRESHOLD;
        this._jumpIgnoreThreshold = conf.jumpIgnoreThreshold || constants.DEFAULT_JUMP_IGNORE_THRESHOLD;
        this._pollingTickThreshold = conf._pollingTickThreshold || constants.DEFAULT_POLLING_TICK_THRESHOLD;
        this._playbackRate = conf.playbackRate || 1;
        var loopRenderMode = (conf.loopRenderMode != null) ? conf.loopRenderMode : LoopRenderMode_1.default.AfterRawFrame;
        this._loopRenderMode = null; // 後の_setLoopRenderMode()で初期化
        this._omitInterpolatedTickOnReplay = (conf.omitInterpolatedTickOnReplay != null) ? conf.omitInterpolatedTickOnReplay : true;
        this._loopMode = conf.loopMode;
        this._amflow = param.amflow;
        this._game = param.game;
        this._eventBuffer = param.eventBuffer;
        this._executionMode = param.executionMode;
        this._targetAge = (conf.targetAge != null) ? conf.targetAge : null;
        // todo: 本来は、パフォーマンス測定機構を含まないリリースモードによるビルド方式も提供すべき。
        if (!param.profiler) {
            this._clock = new Clock_1.Clock({
                fps: param.game.fps,
                scaleFactor: this._playbackRate,
                platform: param.platform,
                maxFramePerOnce: 5
            });
        }
        else {
            this._clock = new ProfilerClock_1.ProfilerClock({
                fps: param.game.fps,
                scaleFactor: this._playbackRate,
                platform: param.platform,
                maxFramePerOnce: 5,
                profiler: param.profiler
            });
        }
        this._tickController = new TickController_1.TickController({
            amflow: param.amflow,
            clock: this._clock,
            game: param.game,
            eventBuffer: param.eventBuffer,
            executionMode: param.executionMode,
            startedAt: param.startedAt,
            errorHandler: this.errorTrigger.fire,
            errorHandlerOwner: this.errorTrigger
        });
        this._tickBuffer = this._tickController.getBuffer();
        this._onGotStartPoint_bound = this._onGotStartPoint.bind(this);
        this._setLoopRenderMode(loopRenderMode);
        this._game.setIsSkipAware(conf.skipAwareGame != null ? conf.skipAwareGame : true);
        this._game.setStorageFunc(this._tickController.storageFunc());
        this._game.handlerSet.raiseEventTrigger.add(this._onGameRaiseEvent, this);
        this._game.handlerSet.raiseTickTrigger.add(this._onGameRaiseTick, this);
        this._game.handlerSet.changeSceneModeTrigger.add(this._handleSceneChange, this);
        this._game._onStart.add(this._onGameStarted, this);
        this._tickBuffer.gotNextTickTrigger.add(this._onGotNextFrameTick, this);
        this._tickBuffer.gotNoTickTrigger.add(this._onGotNoTick, this);
        this._tickBuffer.start();
        this._updateGameAudioSuppression();
    }
    GameLoop.prototype.reset = function (startPoint) {
        // リセットから `g.Game#_start()` まで(エントリポイント実行まで)の間、processEvents() は起こらないようにする。
        // すなわちこれ以降 `_onGameStarted()` までの間 EventBuffer からイベントは取得できない。しかしそもそもこの状態では
        // イベントを処理するシーンがいない = 非ローカルティックは生成されない = 非ローカルティック生成時にのみ行われるイベントの取得もない。
        this._clock.frameTrigger.remove(this._onEventsProcessed, this);
        if (this._skipping)
            this._stopSkipping();
        this._tickBuffer.setCurrentAge(startPoint.frame);
        this._currentTime = startPoint.timestamp || startPoint.data.timestamp || 0; // data.timestamp は後方互換性のために存在。現在は使っていない。
        this._currentTickTime = this._currentTime;
        this._waitingNextTick = false; // 現在ageを変えた後、さらに後続のTickが足りないかどうかは_onFrameで判断する。
        this._foundLatestTick = false; // 同上。
        this._lastRequestedStartPointAge = -1; // 現在ageを変えた時はリセットしておく(場合によっては不要だが、安全のため)。
        this._lastRequestedStartPointTime = -1; // 同上。
        this._omittedTickDuration = 0;
        this._game._restartWithSnapshot(startPoint);
    };
    GameLoop.prototype.start = function () {
        this.running = true;
        this._clock.start();
    };
    GameLoop.prototype.stop = function () {
        this._clock.stop();
        this.running = false;
    };
    GameLoop.prototype.setNextAge = function (age) {
        this._tickController.setNextAge(age);
    };
    GameLoop.prototype.getExecutionMode = function () {
        return this._executionMode;
    };
    GameLoop.prototype.setExecutionMode = function (execMode) {
        this._executionMode = execMode;
        this._tickController.setExecutionMode(execMode);
    };
    GameLoop.prototype.getLoopConfiguration = function () {
        var _a, _b, _c, _d, _e;
        return {
            loopMode: this._loopMode,
            delayIgnoreThreshold: this._delayIgnoreThreshold,
            skipTicksAtOnce: this._skipTicksAtOnce,
            skipThreshold: this._skipThreshold,
            skipAwareGame: this._game.getIsSkipAware(),
            jumpTryThreshold: this._jumpTryThreshold,
            jumpIgnoreThreshold: this._jumpIgnoreThreshold,
            playbackRate: this._playbackRate,
            loopRenderMode: (_a = this._loopRenderMode) !== null && _a !== void 0 ? _a : undefined,
            targetTimeFunc: (_b = this._targetTimeFunc) !== null && _b !== void 0 ? _b : undefined,
            targetTimeOffset: (_c = this._targetTimeOffset) !== null && _c !== void 0 ? _c : undefined,
            originDate: (_d = this._originDate) !== null && _d !== void 0 ? _d : undefined,
            omitInterpolatedTickOnReplay: this._omitInterpolatedTickOnReplay,
            targetAge: (_e = this._targetAge) !== null && _e !== void 0 ? _e : undefined
        };
    };
    GameLoop.prototype.setLoopConfiguration = function (conf) {
        if (conf.loopMode != null)
            this._loopMode = conf.loopMode;
        if (conf.delayIgnoreThreshold != null)
            this._delayIgnoreThreshold = conf.delayIgnoreThreshold;
        if (conf.skipTicksAtOnce != null)
            this._skipTicksAtOnce = conf.skipTicksAtOnce;
        if (conf.skipThreshold != null) {
            this._skipThreshold = conf.skipThreshold;
            this._skipThresholdTime = this._skipThreshold * this._frameTime;
        }
        if (conf.skipAwareGame != null)
            this._game.setIsSkipAware(conf.skipAwareGame);
        if (conf.jumpTryThreshold != null)
            this._jumpTryThreshold = conf.jumpTryThreshold;
        if (conf.jumpIgnoreThreshold != null)
            this._jumpIgnoreThreshold = conf.jumpIgnoreThreshold;
        if (conf.playbackRate != null) {
            this._playbackRate = conf.playbackRate;
            this._clock.changeScaleFactor(this._playbackRate);
            this._updateGameAudioSuppression();
        }
        if (conf.loopRenderMode != null)
            this._setLoopRenderMode(conf.loopRenderMode);
        if (conf.targetTimeFunc != null) {
            this._targetTimeFunc = conf.targetTimeFunc;
        }
        if (conf.targetTimeOffset != null)
            this._targetTimeOffset = conf.targetTimeOffset;
        if (conf.originDate != null)
            this._originDate = conf.originDate;
        this._realTargetTimeOffset = (this._originDate != null) ? this._originDate : (this._targetTimeOffset || 0) + this._startedAt;
        if (conf.omitInterpolatedTickOnReplay != null)
            this._omitInterpolatedTickOnReplay = conf.omitInterpolatedTickOnReplay;
        if (conf.targetAge != null) {
            if (this._targetAge !== conf.targetAge) {
                // targetAgeの変化によって必要なティックが変化した可能性がある。
                // 一度リセットして _onFrame() で改めて _waitingNextTick を求め直す。
                this._waitingNextTick = false;
            }
            this._targetAge = conf.targetAge;
        }
    };
    GameLoop.prototype.addTickList = function (tickList) {
        this._tickBuffer.addTickList(tickList);
    };
    GameLoop.prototype.getCurrentTime = function () {
        return this._currentTime;
    };
    /**
     * 早送り状態に入る。
     *
     * すべての早回し(1フレームでの複数ティック消費)で早送り状態に入るわけではないことに注意。
     * 少々の遅れはこのクラスが暗黙に早回しして吸収する。
     * 早送り状態は、暗黙の早回しでは吸収しきれない規模の早回しの開始時に通知される。
     * 具体的な値との関連は `skipThreshold` など `LoopConfiguration` のメンバを参照のこと。
     *
     * @param isNear 真の場合、ゲームの再生速度設定を変えない (実質 "効果音をミュートしない")。ゲームへのスキッピング通知は行うことに注意。
     */
    GameLoop.prototype._startSkipping = function (isNear) {
        this._skipping = true;
        if (!isNear)
            this._updateGameAudioSuppression();
        this._tickBuffer.startSkipping();
        this._eventBuffer.startSkipping();
        this._game.skippingChangedTrigger.fire(true);
    };
    /**
     * 早送り状態を終える。
     */
    GameLoop.prototype._stopSkipping = function () {
        this._skipping = false;
        this._updateGameAudioSuppression();
        this._tickBuffer.endSkipping();
        this._eventBuffer.endSkipping();
        this._game.skippingChangedTrigger.fire(false);
    };
    /**
     * Gameの音量抑制設定を更新する。
     */
    GameLoop.prototype._updateGameAudioSuppression = function () {
        var realPlaybackRate = this._skipping ? (this._playbackRate * this._skipTicksAtOnce) : this._playbackRate;
        if (realPlaybackRate !== 1.0) {
            this._game._startSuppressAudio();
        }
        else {
            this._game._endSuppressAudio();
        }
    };
    GameLoop.prototype._handleSceneChange = function (mode) {
        var localMode = mode.local;
        var tickMode = mode.tickGenerationMode;
        if (this._sceneLocalMode !== localMode || this._sceneTickMode !== tickMode) {
            this._sceneLocalMode = localMode;
            this._sceneTickMode = tickMode;
            this._clock.frameTrigger.remove(this._onFrame, this);
            this._clock.frameTrigger.remove(this._onLocalFrame, this);
            switch (localMode) {
                case "full-local":
                    // ローカルシーン: TickGenerationMode に関係なくローカルティックのみ
                    this._tickController.stopTick();
                    this._clock.frameTrigger.add(this._onLocalFrame, this);
                    break;
                case "non-local":
                case "interpolate-local":
                    if (tickMode === "by-clock") {
                        this._tickController.startTick();
                    }
                    else {
                        // Manual の場合: storageDataが乗る可能性がある最初のTickだけ生成させ、あとは生成を止める。(Manualの仕様どおりの挙動)
                        // storageDataがある場合は送らないとPassiveのインスタンスがローディングシーンを終えられない。
                        this._tickController.startTickOnce();
                    }
                    this._clock.frameTrigger.add(this._onFrame, this);
                    break;
                default:
                    this.errorTrigger.fire(new Error("Unknown LocalTickMode: " + localMode));
                    return;
            }
        }
    };
    /**
     * ローカルシーンのフレーム処理。
     *
     * `this._clock` の管理する時間経過に従い、ローカルシーンにおいて1フレーム時間につき1回呼び出される。
     */
    GameLoop.prototype._onLocalFrame = function () {
        this._doLocalTick();
    };
    GameLoop.prototype._doLocalTick = function () {
        var game = this._game;
        var pevs = this._eventBuffer.readLocalEvents();
        this._currentTime += this._frameTime; // ここでは _currenTickTime は進まないことに注意 (ローカルティック消化では進まない)
        if (pevs) {
            game.tick(false, Math.floor(this._omittedTickDuration / this._frameTime), pevs);
        }
        else {
            game.tick(false, Math.floor(this._omittedTickDuration / this._frameTime));
        }
        this._omittedTickDuration = 0;
    };
    /**
     * 非ローカルシーンのフレーム処理。
     *
     * `this._clock` の管理する時間経過に従い、非ローカルシーンにおいて1フレーム時間につき1回呼び出される。
     */
    GameLoop.prototype._onFrame = function (frameArg) {
        if (this._loopMode !== LoopMode_1.default.Replay || !this._targetTimeFunc) {
            this._onFrameNormal(frameArg);
        }
        else {
            var givenTargetTime = this._targetTimeFunc();
            var targetTime = givenTargetTime + this._realTargetTimeOffset;
            var prevTickTime = this._currentTickTime;
            this._onFrameForTimedReplay(targetTime, frameArg);
            // 目標時刻到達判定: 進めなくなり、あと1フレームで目標時刻を過ぎるタイミングを到達として通知する。
            // 時間進行を進めていっても目標時刻 "以上" に進むことはないので「過ぎた」タイミングは使えない点に注意。
            // (また、それでもなお (prevTime <= targetTime) の条件はなくせない点にも注意。巻き戻す時は (prevTime > targetTime) になる)
            if ((prevTickTime === this._currentTickTime) && (prevTickTime <= targetTime) && this._isImmediateBeforeOf(targetTime))
                this.rawTargetTimeReachedTrigger.fire(givenTargetTime);
        }
    };
    /**
     * 時刻関数が与えられている場合のフレーム処理。
     *
     * 通常ケース (`_onFrameNormal()`) とは主に次の点で異なる:
     *  1. `Replay` 時の実装しか持たない (`Realtime` は時刻関数を使わずとにかく最新ティックを目指すので不要)
     *  2. ローカルティック補間をタイムスタンプに従ってしか行わない
     * 後者は、ティック受信待ちなどの状況で起きるローカルティック補間がなくなることを意味する。
     */
    GameLoop.prototype._onFrameForTimedReplay = function (targetTime, frameArg) {
        var _a, _b;
        var _c;
        var sceneChanged = false;
        var game = this._game;
        var timeGap = targetTime - this._currentTickTime;
        var frameGap = (timeGap / this._frameTime);
        if ((frameGap > this._jumpTryThreshold || frameGap < 0) &&
            (!this._waitingStartPoint) &&
            (this._lastRequestedStartPointTime < this._currentTickTime)) {
            // スナップショットを要求だけして続行する(スナップショットが来るまで進める限りは進む)。
            this._waitingStartPoint = true;
            this._lastRequestedStartPointTime = targetTime;
            this._amflow.getStartPoint({ timestamp: targetTime }, this._onGotStartPoint_bound);
        }
        if (frameGap <= 0) {
            if (this._skipping)
                this._stopSkipping();
            return;
        }
        if (!this._skipping) {
            if ((frameGap > this._skipThreshold || this._tickBuffer.currentAge === 0) &&
                (this._tickBuffer.hasNextTick() || (this._omitInterpolatedTickOnReplay && this._foundLatestTick))) {
                // ここでは常に `frameGap > 0` であることに注意。0の時にskipに入ってもすぐ戻ってしまう
                var isTargetNear = frameGap <= this._skipThreshold; // (currentAge === 0) の時のみ真になりうることに注意
                this._startSkipping(isTargetNear);
            }
        }
        var consumedFrame = 0;
        for (; consumedFrame < this._skipTicksAtOnce; ++consumedFrame) {
            var nextFrameTime = this._currentTime + this._frameTime;
            if (!this._tickBuffer.hasNextTick()) {
                if (!this._waitingNextTick) {
                    this._startWaitingNextTick();
                    if (!this._foundLatestTick)
                        this._tickBuffer.requestNonIgnorableTicks();
                }
                if (this._omitInterpolatedTickOnReplay && this._sceneLocalMode === "interpolate-local") {
                    if (this._foundLatestTick) {
                        // これ以上新しいティックが存在しない場合は現在時刻を目標時刻に合わせる。
                        // (_doLocalTick() により現在時刻が this._frameTime 進むのでその直前まで進める)
                        this._currentTime = targetTime - this._frameTime;
                    }
                    // ティックがなく、目標時刻に到達していない場合、補間ティックを挿入する。
                    // (経緯上ここだけフラグ名と逆っぽい挙動になってしまっている点に注意。TODO フラグを改名する)
                    if (targetTime > nextFrameTime)
                        this._doLocalTick();
                }
                break;
            }
            var nextTickTime = (_c = this._tickBuffer.readNextTickTime()) !== null && _c !== void 0 ? _c : (this._currentTickTime + this._frameTime);
            if (targetTime <= nextTickTime && targetTime <= nextFrameTime) {
                // 次ティックを消化すると目標時刻に到達・超過する: 次ティックは消化できない
                // 次フレーム時刻も目標時刻に到達・超過する: ローカルティック補完も要らない
                break;
            }
            else if (nextFrameTime < nextTickTime) {
                // 次フレーム時刻ではまだ次ティックを消化できない: ローカルティック補完するか、次ティック時刻まで一気に進む
                if (this._omitInterpolatedTickOnReplay && this._skipping) {
                    // スキップ中、ティック補間不要なら即座に次ティック時刻(かその手前の目標時刻)まで進める。
                    // (_onFrameNormal()の対応箇所と異なり、ここでは「次ティック時刻の "次フレーム時刻"」に切り上げないことに注意。
                    //  時間ベースリプレイでは目標時刻 "以後" には進めないという制約がある。これを単純な実装で守るべく切り上げを断念している)
                    if (targetTime <= nextTickTime) {
                        // 次ティック時刻まで進めると目標時刻を超えてしまう: 目標時刻直前まで動いて抜ける(目標時刻直前までは来ないと目標時刻到達通知が永久にできない)
                        this._omittedTickDuration += targetTime - this._currentTickTime;
                        this._currentTime = Math.floor(targetTime / this._frameTime) * this._frameTime;
                        break;
                    }
                    nextFrameTime = nextTickTime;
                    this._omittedTickDuration += nextTickTime - this._currentTickTime;
                }
                else {
                    if (this._sceneLocalMode === "interpolate-local") {
                        this._doLocalTick();
                    }
                    continue;
                }
            }
            this._currentTime = nextFrameTime;
            this._currentTickTime = nextTickTime;
            var tick = this._tickBuffer.consume();
            var consumedAge = -1;
            this._events.length = 0;
            if (tick != null) {
                var plEvents = this._eventBuffer.readLocalEvents();
                if (plEvents) {
                    (_a = this._events).push.apply(_a, plEvents);
                }
                if (typeof tick === "number") {
                    consumedAge = tick;
                    sceneChanged = game.tick(true, Math.floor(this._omittedTickDuration / this._frameTime), this._events);
                }
                else {
                    consumedAge = tick[0 /* EventIndex.Tick.Age */];
                    var pevs = tick[1 /* EventIndex.Tick.Events */];
                    if (pevs) {
                        (_b = this._events).push.apply(_b, pevs);
                    }
                    sceneChanged = game.tick(true, Math.floor(this._omittedTickDuration / this._frameTime), this._events);
                }
            }
            this._omittedTickDuration = 0;
            if (game._notifyPassedAgeTable[consumedAge]) {
                // ↑ 無駄な関数コールを避けるため汚いが外部から事前チェック
                if (game.fireAgePassedIfNeeded()) {
                    // age到達通知したらドライバユーザが何かしている可能性があるので抜ける
                    frameArg.interrupt = true;
                    break;
                }
            }
            if (sceneChanged) {
                break; // シーンが変わったらローカルシーンに入っているかもしれないので一度抜ける
            }
        }
        if (this._skipping && (targetTime - this._currentTime < this._frameTime) && this._isImmediateBeforeOf(targetTime)) {
            this._stopSkipping();
            // スキップ状態が解除された (≒等倍に戻った) タイミングで改めてすべてのティックを取得し直す
            this._tickBuffer.dropAll();
            this._tickBuffer.requestTicks();
        }
    };
    /**
     * 非ローカルシーンの通常ケースのフレーム処理。
     * 時刻関数が与えられていない、またはリプレイでない場合に用いられる。
     */
    GameLoop.prototype._onFrameNormal = function (frameArg) {
        var _a, _b;
        var sceneChanged = false;
        var game = this._game;
        // NOTE: ブラウザが長時間非アクティブ状態 (裏タブに遷移していたなど) であったとき、長時間ゲームループが呼ばれないケースがある。
        // もしその期間がスキップの閾値を超えていたら、即座にスキップに入る。
        if (!this._skipping && frameArg.deltaTime > this._skipThresholdTime) {
            this._startSkipping(false);
            // ただしティック待ちが無ければすぐにスキップを抜ける。
            if (this._waitingNextTick)
                this._stopSkipping();
        }
        if (this._waitingNextTick) {
            if (this._sceneLocalMode === "interpolate-local")
                this._doLocalTick();
            return;
        }
        var targetAge;
        var ageGap;
        var currentAge = this._tickBuffer.currentAge;
        if (this._loopMode === LoopMode_1.default.Realtime) {
            targetAge = this._tickBuffer.knownLatestAge + 1;
            ageGap = targetAge - currentAge;
        }
        else {
            if (this._targetAge === null) {
                // targetAgeがない: ただリプレイして見ているだけの状態。1フレーム時間経過 == 1age消化。
                targetAge = null;
                ageGap = 1;
            }
            else if (this._targetAge === currentAge) {
                // targetAgeに到達した: targetAgeなし状態になる。
                targetAge = this._targetAge = null;
                ageGap = 1;
            }
            else {
                // targetAgeがあり、まだ到達していない。
                targetAge = this._targetAge;
                ageGap = targetAge - currentAge;
            }
        }
        if ((ageGap > this._jumpTryThreshold || ageGap < 0) &&
            (!this._waitingStartPoint) &&
            (this._lastRequestedStartPointAge < currentAge)) {
            // スナップショットを要求だけして続行する(スナップショットが来るまで進める限りは進む)。
            //
            // 上の条件が _lastRequestedStartPointAge を参照しているのは、スナップショットで飛んだ後もなお
            // `ageGap` が大きい場合に、延々スナップショットをリクエストし続けるのを避けるためである。
            // 実際にはageが進めば新たなスナップショットが保存されている可能性もあるので、
            // `targetAge` が変わればリクエストし続けるのが全くの無駄というわけではない。
            // が、`Realtime` で実行している場合 `targetAge` は毎フレーム変化してしまうし、
            // スナップショットがそれほど頻繁に保存されるとは思えない(すべきでもない)。ここでは割り切って抑制しておく。
            this._waitingStartPoint = true;
            // @ts-ignore TODO: targetAge が null の場合の振る舞い
            this._lastRequestedStartPointAge = targetAge;
            // @ts-ignore TODO: targetAge が null の場合の振る舞い
            this._amflow.getStartPoint({ frame: targetAge }, this._onGotStartPoint_bound);
        }
        if (ageGap <= 0) {
            if (ageGap === 0) {
                if (!this._foundLatestTick) {
                    // NOTE: Manualのシーンやアクティブインスタンスがポーズしている状況では、後続のティックが長時間受信できない場合がある。(TickBuffer#addTick()が呼ばれない)
                    // そのケースでは後続ティックの受信にポーリングの単位時間(初期値: 10秒)かかってしまうため、ここで最新ティックを要求する。
                    this._tickBuffer.requestNonIgnorableTicks();
                }
                // 既知最新ティックに追いついたので、ポーリング処理により後続ティックを要求する。
                // NOTE: Manualのシーンでは最新ティックの生成そのものが長時間起きない可能性がある。
                // (Manualでなくても、最新ティックの受信が長時間起きないことはありうる(長いローディングシーンなど))
                this._startWaitingNextTick();
            }
            if (this._sceneLocalMode === "interpolate-local") {
                // ティック待ちの間、ローカルティックを(補間して)消費: 上の暫定対処のrequestTicks()より後に行うべきである点に注意。
                // ローカルティックを消費すると、ゲームスクリプトがraiseTick()する(_waitingNextTickが立つのはおかしい)可能性がある。
                this._doLocalTick();
            }
            if (this._skipping)
                this._stopSkipping();
            return;
        }
        if (!this._skipping && (ageGap > this._skipThreshold || currentAge === 0) && this._tickBuffer.hasNextTick()) {
            // ここでは常に (ageGap > 0) であることに注意。(0の時にskipに入ってもすぐ戻ってしまう)
            var isTargetNear = (currentAge === 0) && // 余計な関数呼び出しを避けるためにチェック
                this._tickBuffer.isKnownLatestTickTimeNear(this._skipThresholdTime, this._currentTickTime, this._frameTime);
            this._startSkipping(isTargetNear);
        }
        var loopCount = (!this._skipping && ageGap <= this._delayIgnoreThreshold) ? 1 : Math.min(ageGap, this._skipTicksAtOnce);
        var consumedFrame = 0;
        for (; consumedFrame < loopCount; ++consumedFrame) {
            // ティック時刻確認
            var nextFrameTime = this._currentTime + this._frameTime;
            var explicitNextTickTime = this._tickBuffer.readNextTickTime();
            if (explicitNextTickTime != null && nextFrameTime < explicitNextTickTime) {
                if (this._loopMode === LoopMode_1.default.Realtime || (this._omitInterpolatedTickOnReplay && this._skipping)) {
                    // リアルタイムモード(と早送り中のリプレイでティック補間しない場合)ではティック時刻を気にせず続行するが、
                    // リプレイモードに切り替えた時に矛盾しないよう時刻を補正する(当該ティック時刻まで待った扱いにする)。
                    nextFrameTime = Math.ceil(explicitNextTickTime / this._frameTime) * this._frameTime;
                    this._omittedTickDuration += nextFrameTime - this._currentTickTime;
                }
                else {
                    if (this._sceneLocalMode === "interpolate-local") {
                        this._doLocalTick();
                        continue;
                    }
                    break;
                }
            }
            this._currentTime = nextFrameTime;
            this._currentTickTime = explicitNextTickTime !== null && explicitNextTickTime !== void 0 ? explicitNextTickTime : (this._currentTickTime + this._frameTime);
            var tick = this._tickBuffer.consume();
            var consumedAge = -1;
            this._events.length = 0;
            if (tick != null) {
                var plEvents = this._eventBuffer.readLocalEvents();
                if (plEvents) {
                    (_a = this._events).push.apply(_a, plEvents);
                }
                if (typeof tick === "number") {
                    consumedAge = tick;
                    sceneChanged = game.tick(true, Math.floor(this._omittedTickDuration / this._frameTime), this._events);
                }
                else {
                    consumedAge = tick[0 /* EventIndex.Tick.Age */];
                    var pevs = tick[1 /* EventIndex.Tick.Events */];
                    if (pevs) {
                        (_b = this._events).push.apply(_b, pevs);
                    }
                    sceneChanged = game.tick(true, Math.floor(this._omittedTickDuration / this._frameTime), this._events);
                }
                this._omittedTickDuration = 0;
            }
            else {
                // 時間は経過しているが消費すべきティックが届いていない
                this._tickBuffer.requestTicks();
                this._startWaitingNextTick();
                break;
            }
            if (game._notifyPassedAgeTable[consumedAge]) {
                // ↑ 無駄な関数コールを避けるため汚いが外部から事前チェック
                if (game.fireAgePassedIfNeeded()) {
                    // age到達通知したらドライバユーザが何かしている可能性があるので抜ける
                    frameArg.interrupt = true;
                    break;
                }
            }
            if (sceneChanged) {
                break; // シーンが変わったらローカルシーンに入っているかもしれないので一度抜ける
            }
        }
        // @ts-ignore TODO: targetAge が null の場合の振る舞い
        if (this._skipping && (targetAge - this._tickBuffer.currentAge < 1))
            this._stopSkipping();
    };
    GameLoop.prototype._onGotNextFrameTick = function () {
        if (!this._waitingNextTick)
            return;
        if (this._loopMode === LoopMode_1.default.FrameByFrame) {
            // コマ送り実行時、Tickの受信は実行に影響しない。
            return;
        }
        this._stopWaitingNextTick();
    };
    GameLoop.prototype._onGotNoTick = function () {
        if (this._waitingNextTick)
            this._foundLatestTick = true;
    };
    GameLoop.prototype._onGotStartPoint = function (err, startPoint) {
        this._waitingStartPoint = false;
        if (err) {
            this.errorTrigger.fire(err);
            return;
        }
        if (!startPoint) {
            // NOTE: err が無ければ startPoint は必ず存在するはずだが、念の為にバリデートする。
            return;
        }
        if (!this._targetTimeFunc || this._loopMode === LoopMode_1.default.Realtime) {
            var targetAge = (this._loopMode === LoopMode_1.default.Realtime) ? this._tickBuffer.knownLatestAge + 1 : this._targetAge;
            if (targetAge === null || targetAge < startPoint.frame) {
                // 要求した時点と今で目標age(targetAge)が変わっている。
                // 現在の状況では飛ぶ必要がないか、得られたStartPointでは目標ageより未来に飛んでしまう。
                return;
            }
            var currentAge = this._tickBuffer.currentAge;
            if (currentAge <= targetAge && startPoint.frame < currentAge + this._jumpIgnoreThreshold) {
                // 今の目標age(targetAge)は過去でない一方、得られたStartPointは至近未来または過去のもの → 飛ぶ価値なし。
                return;
            }
        }
        else {
            var targetTime = this._targetTimeFunc() + this._realTargetTimeOffset;
            if (targetTime < startPoint.timestamp) {
                // 要求した時点と今で目標時刻(targetTime)が変わっている。得られたStartPointでは目標時刻より未来に飛んでしまう。
                return;
            }
            var currentTickTime = this._currentTickTime;
            if (currentTickTime <= targetTime && startPoint.timestamp < currentTickTime + (this._jumpIgnoreThreshold * this._frameTime)) {
                // 今の目標時刻(targetTime)は過去でない一方、得られたStartPointは至近未来または過去のもの → 飛ぶ価値なし。
                return;
            }
        }
        this.reset(startPoint);
    };
    GameLoop.prototype._onGameStarted = function () {
        // 必ず先頭に挿入することで、同じClockを参照する `TickGenerator` のティック生成などに毎フレーム先行してイベントフィルタを適用する。
        // 全体的に `this._clock` のhandle順は動作順に直結するので注意が必要。
        this._clock.frameTrigger.add({ index: 0, owner: this, func: this._onEventsProcessed });
    };
    GameLoop.prototype._onEventsProcessed = function () {
        this._eventBuffer.processEvents(this._sceneLocalMode === "full-local");
    };
    GameLoop.prototype._setLoopRenderMode = function (mode) {
        if (mode === this._loopRenderMode)
            return;
        this._loopRenderMode = mode;
        switch (mode) {
            case LoopRenderMode_1.default.AfterRawFrame:
                this._clock.rawFrameTrigger.add(this._renderOnRawFrame, this);
                break;
            case LoopRenderMode_1.default.None:
                this._clock.rawFrameTrigger.remove(this._renderOnRawFrame, this);
                break;
            default:
                this.errorTrigger.fire(new Error("GameLoop#_setLoopRenderMode: unknown mode: " + mode));
                break;
        }
    };
    GameLoop.prototype._renderOnRawFrame = function () {
        this._game.render();
    };
    GameLoop.prototype._onGameRaiseEvent = function (event) {
        this._eventBuffer.onEvent(event);
    };
    GameLoop.prototype._onGameRaiseTick = function (es) {
        if (this._executionMode !== ExecutionMode_1.default.Active)
            return;
        // TODO: イベントフィルタの中で呼ばれるとおかしくなる(フィルタ中のイベントがtickに乗らない)。
        if (es) {
            for (var i = 0; i < es.length; ++i)
                this._eventBuffer.addEventDirect(es[i]);
        }
        this._tickController.forceGenerateTick();
    };
    GameLoop.prototype._onPollingTick = function () {
        // この関数が呼ばれる時、 `this._waitingNextTick` は必ず真である。
        // TODO: rawFrameTriggerのfire時に前回呼び出し時からの経過時間を渡せばnew Dateする必要はなくなる。
        var time = Date.now();
        if (time - this._lastPollingTickTime > this._pollingTickThreshold) {
            this._lastPollingTickTime = time;
            this._tickBuffer.requestTicks();
        }
    };
    GameLoop.prototype._startWaitingNextTick = function () {
        this._waitingNextTick = true;
        // TODO: Active時はポーリングしない (要 Active/Passive 切り替えの対応)
        this._clock.rawFrameTrigger.add(this._onPollingTick, this);
        this._lastPollingTickTime = Date.now();
        if (this._skipping)
            this._stopSkipping();
    };
    GameLoop.prototype._stopWaitingNextTick = function () {
        this._waitingNextTick = false;
        this._clock.rawFrameTrigger.remove(this._onPollingTick, this);
    };
    GameLoop.prototype._isImmediateBeforeOf = function (targetTime) {
        var _a;
        // 目標時刻への到達判定。次ティックがない場合は _foundLatestTick に委ねる、
        // すなわち既存全ティックを消化した時は到達とみなす点に注意。あまり直観的でないが、こうでないと永久に
        // rawTargetTimeReachedTrigger を fire できない可能性があり、後方互換性に影響がありうる。
        return this._tickBuffer.hasNextTick() ?
            (targetTime < ((_a = this._tickBuffer.readNextTickTime()) !== null && _a !== void 0 ? _a : (this._currentTickTime + this._frameTime))) :
            this._foundLatestTick;
    };
    return GameLoop;
}());
exports.GameLoop = GameLoop;

},{"./Clock":99,"./ExecutionMode":101,"./LoopMode":107,"./LoopRenderMode":108,"./ProfilerClock":109,"./TickController":112,"./constants":115,"@akashic/akashic-engine":2}],106:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinResolver = exports.JoinLeaveRequest = void 0;
var g = require("@akashic/akashic-engine");
var JoinLeaveRequest = /** @class */ (function () {
    function JoinLeaveRequest(pev, joinResolver, amflow, keys) {
        this.joinResolver = joinResolver;
        this.pev = pev;
        if (pev[0 /* g.EventIndex.General.Code */] === 0 /* pl.EventCode.Join */ && keys) {
            this.resolved = false;
            amflow === null || amflow === void 0 ? void 0 : amflow.getStorageData(keys, this._onGotStorageData.bind(this));
        }
        else {
            this.resolved = true;
        }
    }
    JoinLeaveRequest.prototype._onGotStorageData = function (err, sds) {
        this.resolved = true;
        if (err) {
            this.joinResolver.errorTrigger.fire(err);
            return;
        }
        this.pev[4 /* g.EventIndex.Join.StorageData */] = sds;
    };
    return JoinLeaveRequest;
}());
exports.JoinLeaveRequest = JoinLeaveRequest;
var JoinResolver = /** @class */ (function () {
    function JoinResolver(param) {
        this._keysForJoin = null;
        this._requested = [];
        this.errorTrigger = new g.Trigger();
        if (param.errorHandler)
            this.errorTrigger.add(param.errorHandler, param.errorHandlerOwner);
        this._amflow = param.amflow;
    }
    JoinResolver.prototype.request = function (pev) {
        this._requested.push(new JoinLeaveRequest(pev, this, this._amflow, this._keysForJoin || undefined));
    };
    JoinResolver.prototype.readResolved = function () {
        var len = this._requested.length;
        if (len === 0 || !this._requested[0].resolved)
            return null;
        var ret = [];
        var i;
        for (i = 0; i < len; ++i) {
            var req = this._requested[i];
            if (!req.resolved)
                break;
            ret.push(req.pev);
        }
        this._requested.splice(0, i);
        return ret;
    };
    JoinResolver.prototype.setRequestValuesForJoin = function (keys) {
        this._keysForJoin = keys;
    };
    return JoinResolver;
}());
exports.JoinResolver = JoinResolver;

},{"@akashic/akashic-engine":2}],107:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * `GameLoop` のループ制御のモード。
 * `GameLoop` は、この値に応じて `g.Game#tick()` の呼び出し方法を変える。
 */
var LoopMode;
(function (LoopMode) {
    /**
     * 最新フレームに最大限追いつくモード。
     *
     * Passiveである場合、自分の現在フレームが取得済みの最新フレームから大きく遅れているなら、
     * 早送りやスナップショットによるジャンプを行う。
     *
     * ローカルティック補間シーンにおいては、ティックの受信を待っている間ティック補間を行う。すなわち:
     *  * 次ティックがある場合: ローカルティックを生成せず、ただちに次ティックを消化する(補間しない)
     *  * 次ティックがない場合: ローカルティックを生成して消化する(補間する)
     */
    LoopMode[LoopMode["Realtime"] = 0] = "Realtime";
    /**
     * 追いつこうとするフレームを自分で制御するモード。
     *
     * `Realtime` と同様早送りやスナップショットによるジャンプを行うが、
     * その基準フレームとして `LoopConfiguration#targetAge` (を保持する `GameLoop#_targetAge`) を使う。
     * 早送りやスナップショットによるジャンプを行う。
     *
     * ローカルティック補間シーンにおいては、ティックのタイムスタンプ情報にできるだけ忠実にティック補間を行う。すなわち:
     *  * 次ティックがある場合: 現在時刻が次ティックのタイムスタンプか目標時刻に至るまで、ローカルティックを生成して消化する(補間する)。
     *  * 次ティックがない場合: 何もしない(補間しない)。
     * ただし LoopConfiguration#omitInterpolatedTickOnReplay が真の場合は、次の規則が追加で適用される。
     *  * 次ティックがある場合、スキップ中ならば: ローカルティックを生成せず、ただちに次ティックを消化する(補間しない; Realtimeと同じになる)
     *  * 次ティックがない場合、目標時刻に到達していなければ: ローカルティックを生成して消化する(補間する; Realtimeと同じになる)
     */
    LoopMode[LoopMode["Replay"] = 1] = "Replay";
    /**
     * 正しく使っていない。削除する予定。
     *
     * コマ送りモード。
     * `GameLoop#step()` 呼び出し時に1フレーム進む。それ以外の方法では進まない。
     * 早送りやスナップショットによるジャンプは行わない。
     */
    LoopMode[LoopMode["FrameByFrame"] = 2] = "FrameByFrame";
})(LoopMode || (LoopMode = {}));
exports.default = LoopMode;

},{}],108:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * `GameLoop` が描画を行う基準。
 */
var LoopRenderMode;
(function (LoopRenderMode) {
    /**
     * 毎raw frame後に描画する。
     * raw frameの詳細についてはClock.tsのコメントを参照。
     */
    LoopRenderMode[LoopRenderMode["AfterRawFrame"] = 0] = "AfterRawFrame";
    /**
     * 描画をまったく行わない。
     */
    LoopRenderMode[LoopRenderMode["None"] = 1] = "None";
})(LoopRenderMode || (LoopRenderMode = {}));
exports.default = LoopRenderMode;

},{}],109:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilerClock = void 0;
var Clock_1 = require("./Clock");
/**
 * プロファイラーを有するクロック。
 *
 * note: _onLooperCall()のみをオーバーライドし、 `this._profiler.~~` を追加しただけとなっています。
 */
var ProfilerClock = /** @class */ (function (_super) {
    __extends(ProfilerClock, _super);
    function ProfilerClock(param) {
        var _this = _super.call(this, param) || this;
        _this._profiler = param.profiler;
        return _this;
    }
    ProfilerClock.prototype._onLooperCall = function (deltaTime) {
        var rawDeltaTime = deltaTime;
        if (deltaTime <= 0) {
            // 時間が止まっているか巻き戻っている。初回呼び出しか、あるいは何かがおかしい。時間経過0と見なす。
            return this._waitTime - this._totalDeltaTime;
        }
        if (deltaTime > this._deltaTimeBrokenThreshold) {
            // 間隔が長すぎる。何かがおかしい。時間経過を1フレーム分とみなす。
            deltaTime = this._waitTime;
        }
        var totalDeltaTime = this._totalDeltaTime;
        totalDeltaTime += deltaTime;
        if (totalDeltaTime <= this._skipFrameWaitTime) {
            // 1フレーム分消化するほどの時間が経っていない。
            this._totalDeltaTime = totalDeltaTime;
            return this._waitTime - totalDeltaTime;
        }
        this._profiler.timeEnd(1 /* ProfilerValueType.RawFrameInterval */);
        this._profiler.time(1 /* ProfilerValueType.RawFrameInterval */);
        var frameCount = (totalDeltaTime < this._waitTimeDoubled) ? 1
            : (totalDeltaTime > this._waitTimeMax) ? this._realMaxFramePerOnce
                : (totalDeltaTime / this._waitTime) | 0;
        var fc = frameCount;
        var arg = {
            deltaTime: rawDeltaTime,
            interrupt: false
        };
        this._profiler.setValue(0 /* ProfilerValueType.SkippedFrameCount */, fc - 1);
        while (fc > 0 && this.running && !arg.interrupt) {
            --fc;
            this._profiler.time(2 /* ProfilerValueType.FrameTime */);
            this.frameTrigger.fire(arg);
            this._profiler.timeEnd(2 /* ProfilerValueType.FrameTime */);
            arg.deltaTime = 0; // 同ループによる2度目以降の呼び出しは差分を0とみなす。
        }
        totalDeltaTime -= ((frameCount - fc) * this._waitTime);
        this._profiler.time(3 /* ProfilerValueType.RenderingTime */);
        this.rawFrameTrigger.fire();
        this._profiler.timeEnd(3 /* ProfilerValueType.RenderingTime */);
        this._totalDeltaTime = totalDeltaTime;
        this._profiler.flush();
        return this._waitTime - totalDeltaTime;
    };
    return ProfilerClock;
}(Clock_1.Clock));
exports.ProfilerClock = ProfilerClock;

},{"./Clock":99}],110:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageResolver = void 0;
var g = require("@akashic/akashic-engine");
var ExecutionMode_1 = require("./ExecutionMode");
/**
 * ストレージの読み書きを担うクラス。
 * Gameのストレージアクセスはすべてこのクラスが一次受けする(一次受けする関数を提供する)。
 *
 * ただし読み込みに関しては、実際にはこのクラスでは行わない。
 * Activeモードの場合、ストレージから読み込んだデータはTickに乗せる必要がある。
 * このクラスはTickGeneratorにリクエストを通知し、読み込みはTickGeneratorが解決する。
 * Passiveモードやスナップショットからの復元の場合、ストレージのデータは `TickBuffer` で受信したTickから得られる。
 * このクラスは、読み込みリクエストを得られたストレージデータと付き合わせて完了を通知する役割を持つ。
 */
var StorageResolver = /** @class */ (function () {
    function StorageResolver(param) {
        this.errorTrigger = new g.Trigger();
        this._unresolvedLoaders = Object.create(null);
        this._unresolvedStorages = Object.create(null);
        if (param.errorHandler)
            this.errorTrigger.add(param.errorHandler, param.errorHandlerOwner);
        this.getStorageFunc = this._getStorage.bind(this);
        this.putStorageFunc = this._putStorage.bind(this);
        this.requestValuesForJoinFunc = this._requestValuesForJoin.bind(this);
        this._onStoragePut_bound = this._onStoragePut.bind(this);
        this._game = param.game;
        this._amflow = param.amflow;
        this._tickGenerator = param.tickGenerator;
        this._tickBuffer = param.tickBuffer;
        this._executionMode = null; // 後続のsetExecutionMode()で設定する。
        this.setExecutionMode(param.executionMode);
    }
    /**
     * ExecutionModeを変更する。
     */
    StorageResolver.prototype.setExecutionMode = function (executionMode) {
        if (this._executionMode === executionMode)
            return;
        this._executionMode = executionMode;
        var tickBuf = this._tickBuffer;
        var tickGen = this._tickGenerator;
        if (executionMode === ExecutionMode_1.default.Active) {
            tickBuf.gotStorageTrigger.remove(this._onGotStorageOnTick, this);
            tickGen.gotStorageTrigger.add(this._onGotStorageOnTick, this);
        }
        else {
            tickGen.gotStorageTrigger.remove(this._onGotStorageOnTick, this);
            tickBuf.gotStorageTrigger.add(this._onGotStorageOnTick, this);
        }
    };
    StorageResolver.prototype._onGotStorageOnTick = function (storageOnTick) {
        var resolvingAge = storageOnTick.age;
        var storageData = storageOnTick.storageData;
        var loader = this._unresolvedLoaders[resolvingAge];
        if (!loader) {
            this._unresolvedStorages[resolvingAge] = storageData;
            return;
        }
        delete this._unresolvedLoaders[resolvingAge];
        var serialization = resolvingAge;
        var values = storageData.map(function (d) { return d.values; });
        loader._onLoaded(values, serialization);
    };
    StorageResolver.prototype._getStorage = function (keys, loader, ser) {
        var resolvingAge;
        if (ser != null) {
            // akashic-engineにとって `ser' の型は単にanyである。実態は実装(game-driver)に委ねられている。
            // game-driverはシリアリゼーションとして「ストレージが含められていたTickのage」を採用する。
            resolvingAge = ser;
            this._tickBuffer.requestTicks(resolvingAge, 1); // request しておけば後は _onGotStorageOnTick() に渡ってくる
        }
        else {
            if (this._executionMode === ExecutionMode_1.default.Active) {
                resolvingAge = this._tickGenerator.requestStorageTick(keys);
            }
            else {
                resolvingAge = this._game.age; // TODO: gameを参照せずともageがとれるようにすべき。
                this._tickBuffer.requestTicks(resolvingAge, 1); // request しておけば後は _onGotStorageOnTick() に渡ってくる
            }
        }
        var sd = this._unresolvedStorages[resolvingAge];
        if (!sd) {
            this._unresolvedLoaders[resolvingAge] = loader;
            return;
        }
        delete this._unresolvedStorages[resolvingAge];
        var serialization = resolvingAge;
        var values = sd.map(function (d) { return d.values; });
        loader._onLoaded(values, serialization);
    };
    StorageResolver.prototype._putStorage = function (key, value, option) {
        if (this._executionMode === ExecutionMode_1.default.Active) {
            this._amflow.putStorageData(key, value, option, this._onStoragePut_bound);
        }
    };
    StorageResolver.prototype._requestValuesForJoin = function (keys) {
        this._tickGenerator.setRequestValuesForJoin(keys);
    };
    StorageResolver.prototype._onStoragePut = function (err) {
        if (err)
            this.errorTrigger.fire(err);
    };
    return StorageResolver;
}());
exports.StorageResolver = StorageResolver;

},{"./ExecutionMode":101,"@akashic/akashic-engine":2}],111:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TickBuffer = void 0;
var g = require("@akashic/akashic-engine");
var ExecutionMode_1 = require("./ExecutionMode");
var EventIndex = g.EventIndex; // eslint-disable-line @typescript-eslint/naming-convention
/**
 * AMFlowから流れ込むTickを蓄積するバッファ。
 *
 * 主に以下を行う。
 * * 受信済みのTickの管理
 * * 現在age・既知の最新age・直近の欠けているTickの管理
 * * 足りなそうなTickの先行リクエスト
 * * 処理済みTickの破棄
 */
var TickBuffer = exports.TickBuffer = /** @class */ (function () {
    function TickBuffer(param) {
        /**
         * 現在のage。
         * 次に `consume()` した時、このageのTickを返す。
         */
        this.currentAge = 0;
        /**
         * 既知の最新age。
         * AMFlow から受け取った、または setCurrentAge() で外部から存在を示された最新の age 。
         */
        this.knownLatestAge = -1;
        /**
         * 現在ageのTickを新たに取得したときにfireされる `g.Trigger` 。
         * Tick取得待ちを解除する契機として使える。
         */
        this.gotNextTickTrigger = new g.Trigger();
        /**
         * 最新Tick取得した結果、新たに消化すべきTickが存在しないときにfireされる `g.Trigger` 。
         * 取得済みのTickの消化待ちにかかわらず発火されることに注意。
         */
        this.gotNoTickTrigger = new g.Trigger();
        /**
         * ストレージを含むTickを取得した時にfireされる `g.Trigger` 。
         */
        this.gotStorageTrigger = new g.Trigger();
        this._receiving = false;
        this._skipping = false;
        /**
         * 取得したTick。
         */
        this._tickRanges = [];
        /**
         * `readNextTickTime()` の値のキャッシュ。
         * ティック時刻に到達するまでループの度に確認されるのでキャッシュしておく。
         *
         * 旧仕様(相対時刻)用の暫定対応のため、この値をティックのタイムスタンプと直接比較してはならない(cf. readNextTickTime())。
         */
        this._nextTickTimeCache = null;
        this._amflow = param.amflow;
        this._prefetchThreshold = param.prefetchThreshold || TickBuffer.DEFAULT_PREFETCH_THRESHOLD;
        this._sizeRequestOnce = param.sizeRequestOnce || TickBuffer.DEFAULT_SIZE_REQUEST_ONCE;
        this._executionMode = param.executionMode;
        this._startedAt = param.startedAt || 0;
        this._oldTimestampThreshold = (param.startedAt != null) ? (param.startedAt - (86400 * 1000 * 10)) : 0; // 数字は適当な値(10日分)。
        this._nearestAbsentAge = this.currentAge;
        this._addTick_bound = this.addTick.bind(this);
        this._onTicks_bound = this._onTicks.bind(this);
    }
    TickBuffer.prototype.start = function () {
        this._receiving = true;
        this._updateAmflowReceiveState();
    };
    TickBuffer.prototype.stop = function () {
        this._receiving = false;
        this._updateAmflowReceiveState();
    };
    TickBuffer.prototype.setExecutionMode = function (execMode) {
        // TODO: getTickList()中にauthenticate()しなおした場合の挙動確認
        if (this._executionMode === execMode)
            return;
        this._dropUntil(this.knownLatestAge + 1); // 既存データは捨てる(特にPassive->Activeで既存Tickを上書きする必要がありうる)
        this.knownLatestAge = this.currentAge;
        this._nextTickTimeCache = null;
        this._nearestAbsentAge = this.currentAge;
        this._executionMode = execMode;
        this._updateAmflowReceiveState();
    };
    /**
     * currentAge を設定する。
     *
     * 引数は存在することがわかっている age でなければならない。
     * (Realtime モードの tick/StartPoint 取得の基準となる knownLatestAge も更新するため)
     */
    TickBuffer.prototype.setCurrentAge = function (age) {
        this._dropUntil(age);
        this._nextTickTimeCache = null;
        this.currentAge = age;
        if (this.knownLatestAge < age - 1)
            this.knownLatestAge = age - 1;
        this._nearestAbsentAge = this._findNearestAbscentAge(age);
    };
    TickBuffer.prototype.startSkipping = function () {
        this._skipping = true;
    };
    TickBuffer.prototype.endSkipping = function () {
        this._skipping = false;
    };
    TickBuffer.prototype.hasNextTick = function () {
        return this.currentAge !== this._nearestAbsentAge;
    };
    TickBuffer.prototype.consume = function () {
        if (this.currentAge === this._nearestAbsentAge)
            return null;
        var age = this.currentAge;
        var range = this._tickRanges[0];
        if (age === range.start) {
            this._nextTickTimeCache = null;
            ++this.currentAge;
            ++range.start;
            if (age + this._prefetchThreshold === this._nearestAbsentAge) {
                this.requestTicks(this._nearestAbsentAge, this._sizeRequestOnce);
            }
            if (range.start === range.end)
                this._tickRanges.shift();
            return (range.ticks.length > 0 && range.ticks[0][0 /* EventIndex.Tick.Age */] === age) ? range.ticks.shift() : age;
        }
        // range.start < age。外部から前に追加された場合。破棄してリトライする。
        this._dropUntil(this.currentAge);
        return this.consume();
    };
    TickBuffer.prototype.readNextTickTime = function () {
        if (this._nextTickTimeCache != null)
            return this._nextTickTimeCache;
        if (this.currentAge === this._nearestAbsentAge)
            return null;
        var age = this.currentAge;
        var range = this._tickRanges[0];
        if (age === range.start) {
            if (range.ticks.length === 0)
                return null;
            var tick = range.ticks[0];
            if (tick[0 /* EventIndex.Tick.Age */] !== age)
                return null;
            var pevs = tick[1 /* EventIndex.Tick.Events */];
            if (!pevs)
                return null;
            for (var i = 0; i < pevs.length; ++i) {
                if (pevs[i][0 /* EventIndex.General.Code */] === 2 /* pl.EventCode.Timestamp */) {
                    var nextTickTime = pevs[i][3 /* EventIndex.Timestamp.Timestamp */];
                    // 暫定処理: 旧仕様(相対時刻)用ワークアラウンド。小さすぎる時刻は相対とみなす
                    if (nextTickTime < this._oldTimestampThreshold)
                        nextTickTime += this._startedAt;
                    this._nextTickTimeCache = nextTickTime;
                    return nextTickTime;
                }
            }
            return null;
        }
        // range.start < age。外部から前に追加された場合。破棄してリトライする。
        this._dropUntil(this.currentAge);
        return this.readNextTickTime();
    };
    /**
     * 既知の最新tickが「近い」かどうか判定する。
     * ここで「近い」とは、既知最新 tick の消化までに必要なゲーム内時間が timeThreshold より短いことである。
     * tick をトラバースするので最悪の場合の実行時間は timeThreshold に比例する点に注意。
     */
    TickBuffer.prototype.isKnownLatestTickTimeNear = function (timeThreshold, baseTime, frameTime) {
        // TODO コード整理して baseTime と frameTime の引数をなくす。
        // 両者は GameLoop#_frameTime, _currentTickTime にそれぞれ対応している。このクラスがそれらを管理する方が自然。
        return this._calcKnownLatestTickTimeDelta(timeThreshold, baseTime, frameTime) < timeThreshold;
    };
    TickBuffer.prototype.requestTicks = function (from, len) {
        if (from === void 0) { from = this.currentAge; }
        if (len === void 0) { len = this._sizeRequestOnce; }
        if (this._skipping) {
            this.requestNonIgnorableTicks(from, len);
        }
        else {
            this.requestAllTicks(from, len);
        }
    };
    TickBuffer.prototype.requestAllTicks = function (from, len) {
        if (from === void 0) { from = this.currentAge; }
        if (len === void 0) { len = this._sizeRequestOnce; }
        if (this._executionMode !== ExecutionMode_1.default.Passive)
            return;
        // NOTE: 移行期のため一部特殊な環境では旧インターフェイスを利用する
        // TODO: このパスを削除する
        if (typeof window !== "undefined" && window.prompt === window.confirm) {
            this._amflow.getTickList(from, from + len, this._onTicks_bound);
            return;
        }
        this._amflow.getTickList({ begin: from, end: from + len }, this._onTicks_bound);
    };
    TickBuffer.prototype.requestNonIgnorableTicks = function (from, len) {
        if (from === void 0) { from = this.currentAge; }
        if (len === void 0) { len = this._sizeRequestOnce; }
        if (this._executionMode !== ExecutionMode_1.default.Passive)
            return;
        // NOTE: 移行期のため一部特殊な環境では旧インターフェイスを利用する。ignorable には対応しない。
        // TODO: このパスを削除する
        if (typeof window !== "undefined" && window.prompt === window.confirm) {
            this._amflow.getTickList(from, from + len, this._onTicks_bound);
            return;
        }
        this._amflow.getTickList({ begin: from, end: from + len, excludeEventFlags: { ignorable: true } }, this._onTicks_bound);
    };
    TickBuffer.prototype.addTick = function (tick) {
        var age = tick[0 /* EventIndex.Tick.Age */];
        var gotNext = (this.currentAge === age) && (this._nearestAbsentAge === age);
        if (this.knownLatestAge < age) {
            this.knownLatestAge = age;
        }
        var storageData = tick[2 /* EventIndex.Tick.StorageData */];
        if (storageData) {
            this.gotStorageTrigger.fire({ age: tick[0 /* EventIndex.Tick.Age */], storageData: storageData });
        }
        var i = this._tickRanges.length - 1;
        for (; i >= 0; --i) {
            var range = this._tickRanges[i];
            if (age >= range.start)
                break;
        }
        var nextRange = this._tickRanges[i + 1];
        if (i < 0) {
            // 既知のどの tick よりも過去、または単に既知の tick がない。
            // NOTE: _tickRanges[0]を過去方向に拡張できるかもしれないが、
            //       addTickはほぼ最新フレームしか受信しないので気にせず新たにTickRangeを作る。
            this._tickRanges.unshift(this._createTickRangeFromTick(tick));
        }
        else {
            var range = this._tickRanges[i];
            if (age === range.end) {
                // 直近の TickRange のすぐ後に続く tick だった。
                ++range.end;
                if (tick[1 /* EventIndex.Tick.Events */]) {
                    range.ticks.push(tick);
                }
            }
            else if (age > range.end) {
                // 既存 TickList に続かない tick だった。新規に TickList を作って挿入
                this._tickRanges.splice(i + 1, 0, this._createTickRangeFromTick(tick));
            }
            else {
                // (start <= age < end) 既存 tick と重複している。何もしない。
            }
        }
        if (this._nearestAbsentAge === age) {
            ++this._nearestAbsentAge;
            if (nextRange && this._nearestAbsentAge === nextRange.start) {
                // 直近の欠けているageを追加したら前後のrangeが繋がってしまった。諦めて_nearestAbsentAgeを求め直す。
                this._nearestAbsentAge = this._findNearestAbscentAge(this._nearestAbsentAge);
            }
        }
        if (gotNext)
            this.gotNextTickTrigger.fire();
    };
    TickBuffer.prototype.addTickList = function (tickList) {
        var start = tickList[0 /* EventIndex.TickList.From */];
        var end = tickList[1 /* EventIndex.TickList.To */] + 1;
        var ticks = tickList[2 /* EventIndex.TickList.TicksWithEvents */];
        var origStart = start;
        var origEnd = end;
        if (this.knownLatestAge < end - 1) {
            this.knownLatestAge = end - 1;
        }
        // 今回挿入分の開始ageよりも「後」に開始される最初のrangeを探す
        var i = 0;
        var len = this._tickRanges.length;
        for (i = 0; i < len; ++i) {
            var range = this._tickRanges[i];
            if (start < range.start)
                break;
        }
        var insertPoint = i;
        // 左側が重複しうるrangeを探して重複を除く
        if (i > 0) {
            // 左側が重複しうるrangeは、今回挿入分の開始ageの直前に始まるもの
            --i;
            var leftEndAge = this._tickRanges[i].end;
            if (start < leftEndAge)
                start = leftEndAge;
        }
        // 右側で重複しうるrangeを探して重複を除く
        for (; i < len; ++i) {
            var range = this._tickRanges[i];
            if (end <= range.end)
                break;
        }
        if (i < len) {
            var rightStartAge = this._tickRanges[i].start;
            if (end > rightStartAge)
                end = rightStartAge;
        }
        if (start >= end) {
            // 今回挿入分はすべて重複だった。何もせずreturn
            return { start: start, end: start, ticks: [] };
        }
        if (!ticks)
            ticks = [];
        if (origStart !== start || origEnd !== end) {
            ticks = ticks.filter(function (tick) {
                var age = tick[0 /* EventIndex.Tick.Age */];
                return start <= age && age < end;
            });
        }
        for (var j = 0; j < ticks.length; ++j) {
            var tick = ticks[j];
            var storageData = tick[2 /* EventIndex.Tick.StorageData */];
            if (storageData)
                this.gotStorageTrigger.fire({ age: tick[0 /* EventIndex.Tick.Age */], storageData: storageData });
        }
        var tickRange = { start: start, end: end, ticks: ticks };
        var delLen = Math.max(0, i - insertPoint);
        this._tickRanges.splice(insertPoint, delLen, tickRange);
        if (start <= this._nearestAbsentAge && this._nearestAbsentAge < end) {
            this._nearestAbsentAge = this._findNearestAbscentAge(this._nearestAbsentAge);
        }
        return tickRange;
    };
    TickBuffer.prototype.dropAll = function () {
        this._tickRanges = [];
        this._nearestAbsentAge = this.currentAge;
        this._nextTickTimeCache = null;
    };
    TickBuffer.prototype._updateAmflowReceiveState = function () {
        if (this._receiving && this._executionMode === ExecutionMode_1.default.Passive) {
            this._amflow.onTick(this._addTick_bound);
        }
        else {
            this._amflow.offTick(this._addTick_bound);
        }
    };
    TickBuffer.prototype._onTicks = function (err, ticks) {
        if (err)
            throw err;
        if (!ticks) {
            this.gotNoTickTrigger.fire();
            return;
        }
        var mayGotNext = (this.currentAge === this._nearestAbsentAge);
        var inserted = this.addTickList(ticks);
        if (mayGotNext && (inserted.start <= this.currentAge && this.currentAge < inserted.end)) {
            this.gotNextTickTrigger.fire();
        }
        if (inserted.start === inserted.end) {
            this.gotNoTickTrigger.fire();
        }
    };
    TickBuffer.prototype._findNearestAbscentAge = function (age) {
        var i = 0;
        var len = this._tickRanges.length;
        for (; i < len; ++i) {
            if (age <= this._tickRanges[i].end)
                break;
        }
        for (; i < len; ++i) {
            var range = this._tickRanges[i];
            if (age < range.start)
                break;
            age = range.end;
        }
        return age;
    };
    TickBuffer.prototype._dropUntil = function (age) {
        // [start,end) が全部 age 以前のものを削除
        var i;
        for (i = 0; i < this._tickRanges.length; ++i) {
            if (age < this._tickRanges[i].end)
                break;
        }
        this._tickRanges = this._tickRanges.slice(i);
        if (this._tickRanges.length === 0)
            return;
        // start を書き換えることで、[start, age) の範囲を削除
        var range = this._tickRanges[0];
        if (age < range.start)
            return;
        range.start = age;
        for (i = 0; i < range.ticks.length; ++i) {
            if (age <= range.ticks[i][0 /* EventIndex.Tick.Age */])
                break;
        }
        range.ticks = range.ticks.slice(i);
    };
    /**
     * 既知最新 Tick の時刻までの所要時間を求める。
     * ただし timeThreshold を超える場合、処理を打ち切って timeThreshold を返す。
     * また間隙がある (途中に欠けた Tick がある) 場合、Infinity を返す。
     *
     * _tickRanges をトラバースするので、最悪の場合の実行時間は timeThreshold に比例する。
     */
    TickBuffer.prototype._calcKnownLatestTickTimeDelta = function (timeThreshold, baseTime, frameTime) {
        var tickRanges = this._tickRanges;
        if (tickRanges.length === 0)
            return 0;
        var timeDelta = 0;
        var lastRangeStart = tickRanges[tickRanges.length - 1].end;
        var lastAgeWithEvents = lastRangeStart;
        for (var i = tickRanges.length - 1; i >= 0; --i) {
            var range = tickRanges[i];
            if (range.end !== lastRangeStart) // 既知tickに間隙がある場合
                return Infinity;
            lastRangeStart = range.start;
            var ticksWithEvents = range.ticks;
            for (var j = ticksWithEvents.length - 1; j >= 0; --j) {
                var tick = ticksWithEvents[j];
                var pevs = tick[1 /* EventIndex.Tick.Events */];
                if (!pevs) // ticksWithEvents は「ストレージまたはイベントを持つtick」なのでイベントはない場合もある
                    continue;
                // この tick までの時間を加算
                var age = tick[0 /* EventIndex.Tick.Age */];
                timeDelta += (lastAgeWithEvents - age) * frameTime;
                if (timeDelta > timeThreshold) // timestamp なしの tick だけで timeThreshold 分の時間を超過した
                    return timeThreshold;
                lastAgeWithEvents = age;
                // timestamp が見つかれば時間が確定する
                for (var k = 0; k < pevs.length; ++k) {
                    if (pevs[k][0 /* EventIndex.General.Code */] === 2 /* pl.EventCode.Timestamp */) {
                        var timestamp = pevs[k][3 /* EventIndex.Timestamp.Timestamp */];
                        var duration = (timestamp - baseTime) + timeDelta; // 計算順に注意。先に時刻を減算して値を小さくする(小数部の誤差を軽減する)
                        return Math.min(duration, timeThreshold);
                    }
                }
            }
        }
        timeDelta += (lastAgeWithEvents - tickRanges[0].start) * frameTime;
        return Math.min(timeDelta, timeThreshold);
    };
    TickBuffer.prototype._createTickRangeFromTick = function (tick) {
        var age = tick[0 /* EventIndex.Tick.Age */];
        var range = {
            start: age,
            end: age + 1,
            ticks: []
        };
        if (tick[1 /* EventIndex.Tick.Events */]) {
            range.ticks.push(tick);
        }
        return range;
    };
    TickBuffer.DEFAULT_PREFETCH_THRESHOLD = 30 * 60; // 数字は適当に30FPSで1分間分。30FPS * 60秒。
    TickBuffer.DEFAULT_SIZE_REQUEST_ONCE = 30 * 60 * 5; // 数字は適当に30FPSで5分間分。
    return TickBuffer;
}());

},{"./ExecutionMode":101,"@akashic/akashic-engine":2}],112:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TickController = void 0;
var g = require("@akashic/akashic-engine");
var ExecutionMode_1 = require("./ExecutionMode");
var sr = require("./StorageResolver");
var TickBuffer_1 = require("./TickBuffer");
var TickGenerator_1 = require("./TickGenerator");
/**
 * `GameLoop` に流れるTickを管理するクラス。
 *
 * `GameLoop` に対して `TickGenerator` と `AMFlow` を隠蔽し、
 * Active/Passiveに(ほぼ)関係なくTickを扱えるようにする。
 */
var TickController = /** @class */ (function () {
    function TickController(param) {
        this.errorTrigger = new g.Trigger();
        if (param.errorHandler)
            this.errorTrigger.add(param.errorHandler, param.errorHandlerOwner);
        this._amflow = param.amflow;
        this._clock = param.clock;
        this._started = false;
        this._executionMode = param.executionMode;
        this._generator = new TickGenerator_1.TickGenerator({
            amflow: param.amflow,
            eventBuffer: param.eventBuffer,
            errorHandler: this.errorTrigger.fire,
            errorHandlerOwner: this.errorTrigger
        });
        this._buffer = new TickBuffer_1.TickBuffer({
            amflow: param.amflow,
            executionMode: param.executionMode,
            startedAt: param.startedAt
        });
        this._storageResolver = new sr.StorageResolver({
            game: param.game,
            amflow: param.amflow,
            tickGenerator: this._generator,
            tickBuffer: this._buffer,
            executionMode: param.executionMode,
            errorHandler: this.errorTrigger.fire,
            errorHandlerOwner: this.errorTrigger
        });
        this._generator.tickTrigger.add(this._onTickGenerated, this);
        this._clock.frameTrigger.add(this._generator.next, this._generator);
    }
    TickController.prototype.startTick = function () {
        this._started = true;
        this._updateGeneratorState();
    };
    TickController.prototype.stopTick = function () {
        this._started = false;
        this._updateGeneratorState();
    };
    TickController.prototype.startTickOnce = function () {
        this._started = true;
        this._generator.tickTrigger.addOnce(this._stopTriggerOnTick, this);
        this._updateGeneratorState();
    };
    TickController.prototype.setNextAge = function (age) {
        this._generator.setNextAge(age);
    };
    TickController.prototype.forceGenerateTick = function () {
        this._generator.forceNext();
    };
    TickController.prototype.getBuffer = function () {
        return this._buffer;
    };
    TickController.prototype.storageFunc = function () {
        return {
            storageGetFunc: this._storageResolver.getStorageFunc,
            storagePutFunc: this._storageResolver.putStorageFunc,
            requestValuesForJoinFunc: this._storageResolver.requestValuesForJoinFunc
        };
    };
    TickController.prototype.setExecutionMode = function (execMode) {
        if (this._executionMode === execMode)
            return;
        this._executionMode = execMode;
        this._updateGeneratorState();
        this._buffer.setExecutionMode(execMode);
        this._storageResolver.setExecutionMode(execMode);
    };
    TickController.prototype._stopTriggerOnTick = function () {
        this.stopTick();
    };
    TickController.prototype._updateGeneratorState = function () {
        var toGenerate = (this._started && this._executionMode === ExecutionMode_1.default.Active);
        this._generator.startStopGenerate(toGenerate);
    };
    TickController.prototype._onTickGenerated = function (tick) {
        this._amflow.sendTick(tick);
        this._buffer.addTick(tick);
    };
    return TickController;
}());
exports.TickController = TickController;

},{"./ExecutionMode":101,"./StorageResolver":110,"./TickBuffer":111,"./TickGenerator":113,"@akashic/akashic-engine":2}],113:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TickGenerator = void 0;
var g = require("@akashic/akashic-engine");
var JoinResolver_1 = require("./JoinResolver");
/**
 * `playlog.Tick` の生成器。
 * `next()` が呼ばれる度に、EventBuffer に蓄積されたイベントを集めてtickを生成、`tickTrigger` で通知する。
 */
var TickGenerator = /** @class */ (function () {
    function TickGenerator(param) {
        this.tickTrigger = new g.Trigger();
        this.gotStorageTrigger = new g.Trigger();
        this.errorTrigger = new g.Trigger();
        this._nextAge = 0;
        this._storageDataForNext = null;
        this._generatingTick = false;
        this._waitingStorage = false;
        if (param.errorHandler)
            this.errorTrigger.add(param.errorHandler, param.errorHandlerOwner);
        this._amflow = param.amflow;
        this._eventBuffer = param.eventBuffer;
        this._joinResolver = new JoinResolver_1.JoinResolver({
            amflow: param.amflow,
            errorHandler: this.errorTrigger.fire,
            errorHandlerOwner: this.errorTrigger
        });
        this._onGotStorageData_bound = this._onGotStorageData.bind(this);
    }
    TickGenerator.prototype.next = function () {
        if (!this._generatingTick || this._waitingStorage)
            return;
        var joinLeaves = this._eventBuffer.readJoinLeaves();
        if (joinLeaves) {
            for (var i = 0; i < joinLeaves.length; ++i)
                this._joinResolver.request(joinLeaves[i]);
        }
        var evs = this._eventBuffer.readEvents();
        var resolvedJoinLeaves = this._joinResolver.readResolved();
        if (resolvedJoinLeaves) {
            if (evs) {
                evs.push.apply(evs, resolvedJoinLeaves);
            }
            else {
                evs = resolvedJoinLeaves;
            }
        }
        var sds = this._storageDataForNext;
        this._storageDataForNext = null;
        if (sds) {
            this.tickTrigger.fire([
                this._nextAge++,
                evs,
                sds // 2?: ストレージデータ
            ]);
        }
        else {
            this.tickTrigger.fire([
                this._nextAge++,
                evs // 1?: イベント
            ]);
        }
    };
    TickGenerator.prototype.forceNext = function () {
        if (this._waitingStorage) {
            this.errorTrigger.fire(new Error("TickGenerator#forceNext(): cannot generate tick while waiting storage."));
            return;
        }
        var origValue = this._generatingTick;
        this._generatingTick = true;
        this.next();
        this._generatingTick = origValue;
    };
    TickGenerator.prototype.startStopGenerate = function (toGenerate) {
        this._generatingTick = toGenerate;
    };
    TickGenerator.prototype.startTick = function () {
        this._generatingTick = true;
    };
    TickGenerator.prototype.stopTick = function () {
        this._generatingTick = false;
    };
    TickGenerator.prototype.setNextAge = function (age) {
        if (this._waitingStorage) {
            // エッジケース: 次のtickにストレージを乗せるはずだったが、ageが変わってしまうのでできない。
            // Activeでストレージ要求(シーン切り替え)して待っている間にここに来るとこのパスにかかる。
            // 現実にはActiveで実行開始した後にageを変えるケースは想像しにくい(tickが飛び飛びになったり重複したりする)。
            this.errorTrigger.fire(new Error("TickGenerator#setNextAge(): cannot change the next age while waiting storage."));
            return;
        }
        this._nextAge = age;
    };
    /**
     * 次に生成するtickにstorageDataを持たせる。
     * 取得が完了するまで、次のtickは生成されない。
     */
    TickGenerator.prototype.requestStorageTick = function (keys) {
        if (this._waitingStorage) {
            var err = new Error("TickGenerator#requestStorageTick(): Unsupported: multiple storage request");
            this.errorTrigger.fire(err);
            return -1;
        }
        this._waitingStorage = true;
        this._amflow.getStorageData(keys, this._onGotStorageData_bound);
        return this._nextAge;
    };
    TickGenerator.prototype.setRequestValuesForJoin = function (keys) {
        this._joinResolver.setRequestValuesForJoin(keys);
    };
    TickGenerator.prototype._onGotStorageData = function (err, sds) {
        this._waitingStorage = false;
        if (err) {
            this.errorTrigger.fire(err);
            return;
        }
        if (!sds) {
            // NOTE: err が無ければ storageData は必ず存在するはずだが、念の為にバリデートする。
            return;
        }
        this._storageDataForNext = sds;
        this.gotStorageTrigger.fire({ age: this._nextAge, storageData: sds });
    };
    return TickGenerator;
}());
exports.TickGenerator = TickGenerator;

},{"./JoinResolver":106,"@akashic/akashic-engine":2}],114:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleProfiler = void 0;
var g = require("@akashic/akashic-engine");
var SimpleProfiler = exports.SimpleProfiler = /** @class */ (function () {
    function SimpleProfiler(param) {
        var _a;
        this._startTime = 0;
        this._beforeFlushTime = 0;
        this._beforeTimes = [];
        this._values = [];
        this._calculateProfilerValueTrigger = new g.Trigger();
        this._interval = (_a = param.interval) !== null && _a !== void 0 ? _a : SimpleProfiler.DEFAULT_INTERVAL;
        if (param.limit != null) {
            this._limit = param.limit >= SimpleProfiler.DEFAULT_LIMIT ? param.limit : SimpleProfiler.DEFAULT_LIMIT;
        }
        else {
            this._limit = SimpleProfiler.DEFAULT_LIMIT;
        }
        if (param.getValueHandler) {
            this._calculateProfilerValueTrigger.add(param.getValueHandler, param.getValueHandlerOwner);
        }
        this._reset();
    }
    SimpleProfiler.prototype.time = function (type) {
        this._beforeTimes[type] = this._getCurrentTime();
    };
    SimpleProfiler.prototype.timeEnd = function (type) {
        var now = this._getCurrentTime();
        var value = this._beforeTimes[type] != null ? now - this._beforeTimes[type] : 0;
        this._values[type].push({
            time: now,
            value: value
        });
    };
    SimpleProfiler.prototype.flush = function () {
        var now = this._getCurrentTime();
        if (this._beforeFlushTime === 0)
            this._beforeFlushTime = now;
        if (this._beforeFlushTime + this._interval < now) {
            this._calculateProfilerValueTrigger.fire(this.getProfilerValue(this._interval));
            this._beforeFlushTime = now;
        }
        if (this._values[1 /* ProfilerValueType.RawFrameInterval */].length > this._limit) {
            for (var i in this._values) {
                if (this._values.hasOwnProperty(i))
                    this._values[i] = this._values[i].slice(-SimpleProfiler.BACKUP_MARGIN);
            }
        }
    };
    SimpleProfiler.prototype.setValue = function (type, value) {
        this._values[type].push({
            time: this._getCurrentTime(),
            value: value
        });
    };
    /**
     * 現在時刻から、指定した時間までを遡った期間の `SimpleProfilerValue` を取得する。
     */
    SimpleProfiler.prototype.getProfilerValue = function (time) {
        var rawFrameInterval = this._calculateProfilerValue(1 /* ProfilerValueType.RawFrameInterval */, time);
        return {
            skippedFrameCount: this._calculateProfilerValue(0 /* ProfilerValueType.SkippedFrameCount */, time),
            rawFrameInterval: rawFrameInterval,
            framePerSecond: {
                ave: 1000 / rawFrameInterval.ave,
                max: 1000 / rawFrameInterval.min,
                min: 1000 / rawFrameInterval.max
            },
            frameTime: this._calculateProfilerValue(2 /* ProfilerValueType.FrameTime */, time),
            renderingTime: this._calculateProfilerValue(3 /* ProfilerValueType.RenderingTime */, time)
        };
    };
    SimpleProfiler.prototype._reset = function () {
        this._startTime = this._getCurrentTime();
        this._beforeFlushTime = 0;
        this._beforeTimes = [];
        this._beforeTimes[1 /* ProfilerValueType.RawFrameInterval */] = 0;
        this._beforeTimes[2 /* ProfilerValueType.FrameTime */] = 0;
        this._beforeTimes[3 /* ProfilerValueType.RenderingTime */] = 0;
        this._beforeTimes[0 /* ProfilerValueType.SkippedFrameCount */] = 0;
        this._values = [];
        this._values[1 /* ProfilerValueType.RawFrameInterval */] = [];
        this._values[2 /* ProfilerValueType.FrameTime */] = [];
        this._values[3 /* ProfilerValueType.RenderingTime */] = [];
        this._values[0 /* ProfilerValueType.SkippedFrameCount */] = [];
    };
    SimpleProfiler.prototype._calculateProfilerValue = function (type, time) {
        var limit = this._getCurrentTime() - time;
        var sum = 0;
        var num = 0;
        var max = 0;
        var min = Number.MAX_VALUE;
        for (var i = this._values[type].length - 1; i >= 0; --i) {
            if (0 < num && this._values[type][i].time < limit)
                break;
            var value = this._values[type][i].value;
            if (max < value)
                max = value;
            if (value < min)
                min = value;
            sum += value;
            ++num;
        }
        return {
            ave: sum / num,
            max: max,
            min: min
        };
    };
    SimpleProfiler.prototype._getCurrentTime = function () {
        return +new Date();
    };
    SimpleProfiler.DEFAULT_INTERVAL = 1000;
    SimpleProfiler.DEFAULT_LIMIT = 1000;
    SimpleProfiler.BACKUP_MARGIN = 100;
    return SimpleProfiler;
}());

},{"@akashic/akashic-engine":2}],115:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PSEUDO_INFINITE_AGE = exports.DEFAULT_POLLING_TICK_THRESHOLD = exports.DEFAULT_JUMP_IGNORE_THRESHOLD = exports.DEFAULT_JUMP_TRY_THRESHOLD = exports.DEFAULT_SKIP_THRESHOLD = exports.DEFAULT_SKIP_TICKS_AT_ONCE = exports.DEFAULT_DELAY_IGNORE_THRESHOLD = void 0;
/**
 * 遅延を無視する域値のデフォルト。
 * `LoopConfiguration#delayIgnoreThreshold` のデフォルト値。
 * このフレーム以下の遅延は遅れてないものとみなす(常時コマが飛ぶのを避けるため)。
 */
exports.DEFAULT_DELAY_IGNORE_THRESHOLD = 6;
/**
 * 「早送り」時倍率のデフォルト値。
 * `LoopConfiguration#skipTicksAtOnce` のデフォルト値。
 */
exports.DEFAULT_SKIP_TICKS_AT_ONCE = 100;
/**
 * 「早送り」状態に移る域値のデフォルト。
 * `LoopConfiguration#skipThreshold` のデフォルト値。
 */
exports.DEFAULT_SKIP_THRESHOLD = 100;
/**
 * スナップショットジャンプを試みる域値のデフォルト。
 * `LoopConfiguration#jumpTryThreshold` のデフォルト値。
 */
exports.DEFAULT_JUMP_TRY_THRESHOLD = 30000; // 30FPSの100倍早送りで換算3000FPSで進めても10秒かかる閾値
/**
 * 取得したスナップショットを無視する域値のデフォルト。
 * `LoopConfiguration#jumpIgnoreThreshold` のデフォルト値。
 */
exports.DEFAULT_JUMP_IGNORE_THRESHOLD = 15000; // 30FPSの100倍早送りで換算3000FPSで進めて5秒で済む閾値
/**
 * 最新ティックをポーリングする間隔(ms)のデフォルト。
 */
exports.DEFAULT_POLLING_TICK_THRESHOLD = 10000;
/**
 * 擬似的に無限未来として扱うage。
 */
exports.PSEUDO_INFINITE_AGE = 1892160000; // = 365 * 86400 * 60 = 60FPSで一年分。(特に制限ではないが32bit signed intに収まる)

},{}],116:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopRenderMode = exports.LoopMode = exports.GameDriver = exports.Game = exports.ExecutionMode = exports.SimpleProfiler = exports.ReplayAmflowProxy = exports.MemoryAmflowClient = void 0;
__exportStar(require("./constants"), exports);
var MemoryAmflowClient_1 = require("@akashic/amflow-util/lib/MemoryAmflowClient");
Object.defineProperty(exports, "MemoryAmflowClient", { enumerable: true, get: function () { return MemoryAmflowClient_1.MemoryAmflowClient; } });
var ReplayAmflowProxy_1 = require("@akashic/amflow-util/lib/ReplayAmflowProxy");
Object.defineProperty(exports, "ReplayAmflowProxy", { enumerable: true, get: function () { return ReplayAmflowProxy_1.ReplayAmflowProxy; } });
var SimpleProfiler_1 = require("./auxiliary/SimpleProfiler");
Object.defineProperty(exports, "SimpleProfiler", { enumerable: true, get: function () { return SimpleProfiler_1.SimpleProfiler; } });
var ExecutionMode_1 = require("./ExecutionMode");
exports.ExecutionMode = ExecutionMode_1.default;
var Game_1 = require("./Game");
Object.defineProperty(exports, "Game", { enumerable: true, get: function () { return Game_1.Game; } });
var GameDriver_1 = require("./GameDriver");
Object.defineProperty(exports, "GameDriver", { enumerable: true, get: function () { return GameDriver_1.GameDriver; } });
var LoopMode_1 = require("./LoopMode");
exports.LoopMode = LoopMode_1.default;
var LoopRenderMode_1 = require("./LoopRenderMode");
exports.LoopRenderMode = LoopRenderMode_1.default;

},{"./ExecutionMode":101,"./Game":102,"./GameDriver":103,"./LoopMode":107,"./LoopRenderMode":108,"./auxiliary/SimpleProfiler":114,"./constants":115,"@akashic/amflow-util/lib/MemoryAmflowClient":88,"@akashic/amflow-util/lib/ReplayAmflowProxy":89}],117:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioManager = void 0;
var AudioManager = /** @class */ (function () {
    function AudioManager() {
        this.audioAssets = [];
        this._masterVolume = 1.0;
    }
    AudioManager.prototype.registerAudioAsset = function (asset) {
        if (this.audioAssets.indexOf(asset) === -1)
            this.audioAssets.push(asset);
    };
    AudioManager.prototype.removeAudioAsset = function (asset) {
        var index = this.audioAssets.indexOf(asset);
        if (index === -1)
            this.audioAssets.splice(index, 1);
    };
    AudioManager.prototype.setMasterVolume = function (volume) {
        this._masterVolume = volume;
        for (var i = 0; i < this.audioAssets.length; i++) {
            if (this.audioAssets[i]._lastPlayedPlayer) {
                this.audioAssets[i]._lastPlayedPlayer.notifyMasterVolumeChanged();
            }
        }
    };
    AudioManager.prototype.getMasterVolume = function () {
        return this._masterVolume;
    };
    return AudioManager;
}());
exports.AudioManager = AudioManager;

},{}],118:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerController = void 0;
var trigger_1 = require("@akashic/trigger");
var InputHandlerLayer_1 = require("./InputHandlerLayer");
/*
 HTML要素のContainerを管理するクラス。
 CanvasやInputHandlerの実態となる要素の順番や追加済みなのかを管理する。
 ContainerはInput、Canvasを1つのセットとして扱う。

 以下のようなDOM構造を持つ

 ContainerController.rootView
 └── InputHandlerLayer
     └── CanvasSurface
 */
var ContainerController = /** @class */ (function () {
    function ContainerController(resourceFactory) {
        this.container = undefined;
        this.surface = undefined;
        this.inputHandlerLayer = undefined;
        this.rootView = undefined;
        /**
         * ゲームコンテンツのCanvas拡大・縮小時に内部のコンテキスト領域のリサイズを行うかどうか。初期値はfalse。
         * Note: この機能は実験的なものです。特定の環境や実行状態によっては正常な描画が期待できない場合もあります。
         * 現バージョン(0.7.5) ではfalseにしておくことを推奨しています。
         */
        this.useResizeForScaling = false;
        this.pointEventTrigger = new trigger_1.Trigger();
        this._rendererReq = undefined;
        this.resourceFactory = resourceFactory;
    }
    ContainerController.prototype.initialize = function (param) {
        this._rendererReq = param.rendererRequirement;
        this._loadView();
    };
    ContainerController.prototype.setRootView = function (rootView) {
        if (rootView === this.rootView) {
            return;
        }
        // 一つのContainerは一つのrootしか持たないのでloadし直す
        if (this.rootView) {
            this.unloadView();
            this._loadView();
        }
        this.rootView = rootView;
        this._appendToRootView(rootView);
    };
    ContainerController.prototype.resetView = function (rendererReq) {
        this.unloadView();
        this._rendererReq = rendererReq;
        this._loadView();
        this._appendToRootView(this.rootView);
    };
    ContainerController.prototype.getRenderer = function () {
        if (!this.surface) {
            throw new Error("this container has no surface");
        }
        // TODO: should be cached?
        return this.surface.renderer();
    };
    ContainerController.prototype.changeScale = function (xScale, yScale) {
        if (this.useResizeForScaling) {
            this.surface.changePhysicalScale(xScale, yScale);
        }
        else {
            this.surface.changeVisualScale(xScale, yScale);
        }
        this.inputHandlerLayer._inputHandler.setScale(xScale, yScale);
    };
    ContainerController.prototype.unloadView = function () {
        // イベントを片付けてから、rootViewに所属するElementを開放する
        this.inputHandlerLayer.disablePointerEvent();
        if (this.rootView) {
            while (this.rootView.firstChild) {
                this.rootView.removeChild(this.rootView.firstChild);
            }
        }
    };
    ContainerController.prototype._loadView = function () {
        var _a = this._rendererReq, width = _a.primarySurfaceWidth, height = _a.primarySurfaceHeight;
        // DocumentFragmentはinsertした時点で開放されているため毎回作る
        // https://dom.spec.whatwg.org/#concept-node-insert
        this.container = document.createDocumentFragment();
        // 入力受け付けレイヤー - DOM Eventの管理
        if (!this.inputHandlerLayer) {
            this.inputHandlerLayer = new InputHandlerLayer_1.InputHandlerLayer({ width: width, height: height });
        }
        else {
            // Note: 操作プラグインに与えた view 情報を削除しないため、 inputHandlerLayer を使いまわしている
            this.inputHandlerLayer.setViewSize({ width: width, height: height });
            this.inputHandlerLayer.pointEventTrigger.removeAll();
            if (this.surface && !this.surface.destroyed()) {
                this.inputHandlerLayer.view.removeChild(this.surface.canvas);
                this.surface.destroy();
            }
        }
        // 入力受け付けレイヤー > 描画レイヤー
        this.surface = this.resourceFactory.createPrimarySurface(width, height);
        this.inputHandlerLayer.view.appendChild(this.surface.getHTMLElement());
        // containerController -> input -> canvas
        this.container.appendChild(this.inputHandlerLayer.view);
    };
    ContainerController.prototype._appendToRootView = function (rootView) {
        rootView.appendChild(this.container);
        this.inputHandlerLayer.enablePointerEvent(); // Viewが追加されてから設定する
        this.inputHandlerLayer.pointEventTrigger.add(this.pointEventTrigger.fire, this.pointEventTrigger);
    };
    return ContainerController;
}());
exports.ContainerController = ContainerController;

},{"./InputHandlerLayer":119,"@akashic/trigger":213}],119:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputHandlerLayer = void 0;
var trigger_1 = require("@akashic/trigger");
var PointerEventHandler_1 = require("./handler/PointerEventHandler");
/**
 * ユーザの入力を受け付けるViewのレイヤー。
 *
 * 実行環境に適切なDOMイベントを設定し、DOMイベントから座標データへ変換した結果をGameに伝える。
 * InputHandlerLayerはあくまで一つのレイヤーであり、Containerではない。
 * 従ってこのViewの親子要素がどうなっているかを知る必要はない。
 */
var InputHandlerLayer = /** @class */ (function () {
    /**
     * @example
     *
     * const inputHandlerLayer = new InputHandlerLayer();
     * inputHandlerLayer.pointEventTrigger.add(function(pointEvent){
     *   console.log(pointEvent);
     * });
     * containerController.appendChild(inputHandlerLayer.view);
     */
    function InputHandlerLayer(param) {
        this.view = this._createInputView(param.width, param.height);
        this._inputHandler = undefined;
        this.pointEventTrigger = new trigger_1.Trigger();
    }
    // 実行環境でサポートしてるDOM Eventを使い、それぞれonPoint*Triggerを関連付ける
    InputHandlerLayer.prototype.enablePointerEvent = function () {
        var _this = this;
        this._inputHandler = new PointerEventHandler_1.PointerEventHandler(this.view);
        // 各種イベントのTrigger
        this._inputHandler.pointTrigger.add(function (e) {
            _this.pointEventTrigger.fire(e);
        });
        this._inputHandler.start();
    };
    // DOMイベントハンドラを開放する
    InputHandlerLayer.prototype.disablePointerEvent = function () {
        var _a;
        (_a = this._inputHandler) === null || _a === void 0 ? void 0 : _a.stop();
    };
    InputHandlerLayer.prototype.setOffset = function (offset) {
        var inputViewStyle = "position:relative; left:".concat(offset.x, "px; top:").concat(offset.y, "px");
        this._inputHandler.inputView.setAttribute("style", inputViewStyle);
    };
    InputHandlerLayer.prototype.setViewSize = function (size) {
        var view = this.view;
        view.style.width = size.width + "px";
        view.style.height = size.height + "px";
    };
    InputHandlerLayer.prototype._createInputView = function (width, height) {
        var view = document.createElement("div");
        view.setAttribute("style", "display:inline-block; outline:none;");
        view.style.width = width + "px";
        view.style.height = height + "px";
        return view;
    };
    return InputHandlerLayer;
}());
exports.InputHandlerLayer = InputHandlerLayer;

},{"./handler/PointerEventHandler":143,"@akashic/trigger":213}],120:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = void 0;
var XHRTextAsset_1 = require("./asset/XHRTextAsset");
var AudioManager_1 = require("./AudioManager");
var ContainerController_1 = require("./ContainerController");
var AudioPluginManager_1 = require("./plugin/AudioPluginManager");
var AudioPluginRegistry_1 = require("./plugin/AudioPluginRegistry");
var RafLooper_1 = require("./RafLooper");
var ResourceFactory_1 = require("./ResourceFactory");
var Platform = /** @class */ (function () {
    function Platform(param) {
        /**
         * DOM に対するタッチイベントの捕捉方法として pointer-events を利用しているかどうか。
         * 現バージョンにおいては常に true となる。
         * この値は MouseEvent および TouchEvent を利用していた旧バージョンとの識別のために存在し、もしこの値が undefined の場合は旧バージョンであるとみなす。
         */
        this.usingPointerEvents = true;
        this.containerView = param.containerView;
        this.audioPluginManager = new AudioPluginManager_1.AudioPluginManager();
        if (param.audioPlugins) {
            this.audioPluginManager.tryInstallPlugin(param.audioPlugins);
        }
        // TODO: make it deprecated
        this.audioPluginManager.tryInstallPlugin(AudioPluginRegistry_1.AudioPluginRegistry.getRegisteredAudioPlugins());
        this._audioManager = new AudioManager_1.AudioManager();
        this.amflow = param.amflow;
        this._platformEventHandler = null;
        this._resourceFactory = param.resourceFactory || new ResourceFactory_1.ResourceFactory({
            audioPluginManager: this.audioPluginManager,
            platform: this,
            audioManager: this._audioManager
        });
        this.containerController = new ContainerController_1.ContainerController(this._resourceFactory);
        this._rendererReq = null;
        this._disablePreventDefault = !!param.disablePreventDefault;
    }
    Platform.prototype.setPlatformEventHandler = function (handler) {
        if (this.containerController) {
            this.containerController.pointEventTrigger.removeAll({ owner: this._platformEventHandler });
            this.containerController.pointEventTrigger.add(handler.onPointEvent, handler);
        }
        this._platformEventHandler = handler;
    };
    Platform.prototype.loadGameConfiguration = function (url, callback) {
        var a = new XHRTextAsset_1.XHRTextAsset("(game.json)", url);
        a._load({
            _onAssetLoad: function (_asset) {
                callback(null, JSON.parse(a.data));
            },
            _onAssetError: function (_asset, error) {
                callback(error, null);
            }
        });
    };
    Platform.prototype.getResourceFactory = function () {
        return this._resourceFactory;
    };
    Platform.prototype.setRendererRequirement = function (requirement) {
        var _a;
        if (!requirement) {
            if (this.containerController)
                this.containerController.unloadView();
            return;
        }
        this._rendererReq = requirement;
        this._resourceFactory._rendererCandidates = (_a = this._rendererReq.rendererCandidates) !== null && _a !== void 0 ? _a : [];
        // Note: this.containerController.inputHandlerLayer の存在により this.containerController が初期化されているかを判定
        if (this.containerController && !this.containerController.inputHandlerLayer) {
            this.containerController.initialize({
                rendererRequirement: requirement,
                disablePreventDefault: this._disablePreventDefault
            });
            this.containerController.setRootView(this.containerView);
            if (this._platformEventHandler) {
                this.containerController.pointEventTrigger.add(this._platformEventHandler.onPointEvent, this._platformEventHandler);
            }
        }
        else {
            this.containerController.resetView(requirement);
        }
    };
    Platform.prototype.getPrimarySurface = function () {
        return this.containerController.surface;
    };
    Platform.prototype.getOperationPluginViewInfo = function () {
        var _this = this;
        return {
            type: "pdi-browser",
            view: this.containerController.inputHandlerLayer.view,
            getScale: function () { return _this.containerController.inputHandlerLayer._inputHandler.getScale(); }
        };
    };
    Platform.prototype.createLooper = function (fun) {
        return new RafLooper_1.RafLooper(fun);
    };
    Platform.prototype.sendToExternal = function (_playId, _data) {
        // Nothing to do.
    };
    Platform.prototype.registerAudioPlugins = function (plugins) {
        return this.audioPluginManager.tryInstallPlugin(plugins);
    };
    Platform.prototype.setScale = function (xScale, yScale) {
        this.containerController.changeScale(xScale, yScale);
    };
    Platform.prototype.notifyViewMoved = function () {
        // 既に役割のないメソッド(呼び出さなくても正しく動作する)。公開APIのため後方互換性のために残している。
    };
    /**
     * 最終的に出力されるマスター音量を変更する
     *
     * @param volume マスター音量
     */
    Platform.prototype.setMasterVolume = function (volume) {
        this._audioManager.setMasterVolume(volume);
    };
    /**
     * 最終的に出力されるマスター音量を取得する
     */
    Platform.prototype.getMasterVolume = function () {
        return this._audioManager.getMasterVolume();
    };
    Platform.prototype.destroy = function () {
        this.setRendererRequirement(undefined);
        this.setMasterVolume(0);
    };
    return Platform;
}());
exports.Platform = Platform;

},{"./AudioManager":117,"./ContainerController":118,"./RafLooper":121,"./ResourceFactory":122,"./asset/XHRTextAsset":133,"./plugin/AudioPluginManager":146,"./plugin/AudioPluginRegistry":147}],121:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RafLooper = void 0;
var RafLooper = /** @class */ (function () {
    function RafLooper(fun) {
        this._timerId = null;
        this._fun = fun;
        this._prev = 0;
    }
    RafLooper.prototype.start = function () {
        var _this = this;
        var onAnimationFrame = function (deltaTime) {
            if (_this._timerId == null) {
                // NOTE: Firefox Quantum 57.0.2の不具合(？)(cancelAnimationFrame()が機能しないことがある)暫定対策
                return;
            }
            _this._timerId = requestAnimationFrame(onAnimationFrame);
            _this._fun(deltaTime - _this._prev);
            _this._prev = deltaTime;
        };
        var onFirstFrame = function (deltaTime) {
            _this._timerId = requestAnimationFrame(onAnimationFrame);
            _this._fun(0);
            _this._prev = deltaTime;
        };
        this._timerId = requestAnimationFrame(onFirstFrame);
    };
    RafLooper.prototype.stop = function () {
        if (this._timerId != null) {
            cancelAnimationFrame(this._timerId);
        }
        this._timerId = null;
        this._prev = 0;
    };
    return RafLooper;
}());
exports.RafLooper = RafLooper;

},{}],122:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceFactory = void 0;
var BinaryAsset_1 = require("./asset/BinaryAsset");
var GeneratedSVGImageAsset_1 = require("./asset/GeneratedSVGImageAsset");
var HTMLImageAsset_1 = require("./asset/HTMLImageAsset");
var HTMLVideoAsset_1 = require("./asset/HTMLVideoAsset");
var SVGImageAsset_1 = require("./asset/SVGImageAsset");
var XHRScriptAsset_1 = require("./asset/XHRScriptAsset");
var XHRTextAsset_1 = require("./asset/XHRTextAsset");
var GlyphFactory_1 = require("./canvas/GlyphFactory");
var SurfaceFactory_1 = require("./canvas/shims/SurfaceFactory");
var ResourceFactory = /** @class */ (function () {
    function ResourceFactory(param) {
        this._audioPluginManager = param.audioPluginManager;
        this._audioManager = param.audioManager;
        this._platform = param.platform;
        this._surfaceFactory = new SurfaceFactory_1.SurfaceFactory();
    }
    ResourceFactory.prototype.createAudioAsset = function (id, assetPath, duration, system, loop, hint, offset) {
        var activePlugin = this._audioPluginManager.getActivePlugin();
        if (!activePlugin) {
            throw new Error("ResourceFactory#createAudioAsset(): could not initialize ActivePlugin");
        }
        var audioAsset = activePlugin.createAsset(id, assetPath, duration, system, loop, hint, offset);
        this._audioManager.registerAudioAsset(audioAsset);
        audioAsset.onDestroyed.addOnce(this._onAudioAssetDestroyed, this);
        return audioAsset;
    };
    ResourceFactory.prototype.createAudioPlayer = function (system) {
        var activePlugin = this._audioPluginManager.getActivePlugin();
        if (!activePlugin) {
            throw new Error("ResourceFactory#createAudioAsset(): could not initialize ActivePlugin");
        }
        return activePlugin.createPlayer(system, this._audioManager);
    };
    ResourceFactory.prototype.createImageAsset = function (id, assetPath, width, height) {
        return new HTMLImageAsset_1.HTMLImageAsset(id, assetPath, width, height);
    };
    ResourceFactory.prototype.createVideoAsset = function (id, assetPath, width, height, system, loop, useRealSize) {
        return new HTMLVideoAsset_1.HTMLVideoAsset(id, assetPath, width, height, system, loop, useRealSize);
    };
    ResourceFactory.prototype.createTextAsset = function (id, assetPath) {
        return new XHRTextAsset_1.XHRTextAsset(id, assetPath);
    };
    ResourceFactory.prototype.createScriptAsset = function (id, assetPath, exports) {
        return new XHRScriptAsset_1.XHRScriptAsset(id, assetPath, exports);
    };
    ResourceFactory.prototype.createPrimarySurface = function (width, height) {
        return this._surfaceFactory.createPrimarySurface(width, height, this._rendererCandidates);
    };
    ResourceFactory.prototype.createSurface = function (width, height) {
        return this._surfaceFactory.createBackSurface(width, height, this._rendererCandidates);
    };
    ResourceFactory.prototype.createGlyphFactory = function (fontFamily, fontSize, baseline, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
        return new GlyphFactory_1.GlyphFactory(fontFamily, fontSize, baseline, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight);
    };
    ResourceFactory.prototype.createVectorImageAsset = function (id, assetPath, width, height, hint) {
        return new SVGImageAsset_1.SVGImageAsset(id, assetPath, width, height, hint);
    };
    ResourceFactory.prototype.createVectorImageAssetFromString = function (id, assetPath, data) {
        return new GeneratedSVGImageAsset_1.GeneratedSVGImageAsset(id, assetPath, data);
    };
    ResourceFactory.prototype.createBinaryAsset = function (id, assetPath) {
        return new BinaryAsset_1.BinaryAsset(id, assetPath);
    };
    ResourceFactory.prototype._onAudioAssetDestroyed = function (asset) {
        this._audioManager.removeAudioAsset(asset);
    };
    return ResourceFactory;
}());
exports.ResourceFactory = ResourceFactory;

},{"./asset/BinaryAsset":126,"./asset/GeneratedSVGImageAsset":127,"./asset/HTMLImageAsset":128,"./asset/HTMLVideoAsset":129,"./asset/SVGImageAsset":131,"./asset/XHRScriptAsset":132,"./asset/XHRTextAsset":133,"./canvas/GlyphFactory":136,"./canvas/shims/SurfaceFactory":142}],123:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Surface = void 0;
var Surface = /** @class */ (function () {
    function Surface(width, height, drawable) {
        this.width = width;
        this.height = height;
        this._drawable = drawable;
        if (width % 1 !== 0 || height % 1 !== 0) {
            throw new Error("Surface#constructor: width and height must be integers");
        }
        this.width = width;
        this.height = height;
        this._drawable = drawable;
    }
    Surface.prototype.destroy = function () {
        this._destroyed = true;
    };
    Surface.prototype.destroyed = function () {
        // _destroyedはundefinedかtrueなため、常にbooleanが返すように!!演算子を用いる
        return !!this._destroyed;
    };
    return Surface;
}());
exports.Surface = Surface;

},{}],124:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
var trigger_1 = require("@akashic/trigger");
var Asset = /** @class */ (function () {
    function Asset(id, path) {
        this.onDestroyed = new trigger_1.Trigger();
        this.id = id;
        this.originalPath = path;
        this.path = this._assetPathFilter(path);
    }
    Asset.prototype.destroy = function () {
        this.onDestroyed.fire(this);
        this.id = undefined;
        this.originalPath = undefined;
        this.path = undefined;
        this.onDestroyed.destroy();
        this.onDestroyed = undefined;
    };
    Asset.prototype.destroyed = function () {
        return this.id === undefined;
    };
    Asset.prototype.inUse = function () {
        return false;
    };
    Asset.prototype._assetPathFilter = function (path) {
        // 拡張子の補完・読み替えが必要なassetはこれをオーバーライドすればよい。(対応形式が限定されるaudioなどの場合)
        return path;
    };
    return Asset;
}());
exports.Asset = Asset;

},{"@akashic/trigger":213}],125:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioAsset = void 0;
var Asset_1 = require("./Asset");
var AudioAsset = /** @class */ (function (_super) {
    __extends(AudioAsset, _super);
    function AudioAsset(id, path, duration, system, loop, hint, offset) {
        var _this = _super.call(this, id, path) || this;
        _this.type = "audio";
        _this.data = undefined;
        _this.duration = duration;
        _this.loop = loop;
        _this.hint = hint;
        _this._system = system;
        _this.offset = offset;
        _this.path = _this._modifyPath(_this.path);
        return _this;
    }
    AudioAsset.prototype.play = function () {
        var player = this._system.createPlayer();
        player.play(this);
        this._lastPlayedPlayer = player;
        return player;
    };
    AudioAsset.prototype.stop = function () {
        var players = this._system.findPlayers(this);
        for (var i = 0; i < players.length; ++i)
            players[i].stop();
    };
    AudioAsset.prototype.inUse = function () {
        return this._system.findPlayers(this).length > 0;
    };
    AudioAsset.prototype.destroy = function () {
        if (this._system)
            this.stop();
        this.data = undefined;
        this._system = undefined;
        this._lastPlayedPlayer = undefined;
        _super.prototype.destroy.call(this);
    };
    return AudioAsset;
}(Asset_1.Asset));
exports.AudioAsset = AudioAsset;

},{"./Asset":124}],126:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryAsset = void 0;
var XHRLoader_1 = require("../utils/XHRLoader");
var Asset_1 = require("./Asset");
var BinaryAsset = /** @class */ (function (_super) {
    __extends(BinaryAsset, _super);
    function BinaryAsset(id, assetPath) {
        var _this = _super.call(this, id, assetPath) || this;
        _this.type = "binary";
        _this.data = undefined;
        return _this;
    }
    BinaryAsset.prototype.destroy = function () {
        this.data = undefined;
        _super.prototype.destroy.call(this);
    };
    BinaryAsset.prototype._load = function (handler) {
        var _this = this;
        var loader = new XHRLoader_1.XHRLoader();
        loader.getArrayBuffer(this.path, function (error, responseData) {
            if (error) {
                handler._onAssetError(_this, error);
                return;
            }
            if (responseData == null) {
                handler._onAssetError(_this, {
                    name: "AssetLoadError",
                    retriable: false,
                    message: "BinaryAsset#_load(): no data received"
                });
                return;
            }
            _this.data = responseData;
            handler._onAssetLoad(_this);
        });
    };
    return BinaryAsset;
}(Asset_1.Asset));
exports.BinaryAsset = BinaryAsset;

},{"../utils/XHRLoader":162,"./Asset":124}],127:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratedSVGImageAsset = void 0;
var ExceptionFactory_1 = require("../utils/ExceptionFactory");
var SVGImageAsset_1 = require("./SVGImageAsset");
/**
 * 文字列を解釈して動的に SVG を生成する VectorImageAsset 。
 * `width`, `height` は `_load()` 完了まで確定しない (`0` である) 点に注意。
 */
var GeneratedSVGImageAsset = /** @class */ (function (_super) {
    __extends(GeneratedSVGImageAsset, _super);
    function GeneratedSVGImageAsset(id, path, data) {
        var _this = _super.call(this, id, path, 0, 0) || this;
        _this._svgString = data;
        return _this;
    }
    GeneratedSVGImageAsset.prototype.destroy = function () {
        this._svgString = null;
        _super.prototype.destroy.call(this);
    };
    GeneratedSVGImageAsset.prototype._load = function (loader) {
        var _this = this;
        var svgString = this._svgString;
        var parser = new DOMParser();
        var base64SVG;
        try {
            var doc = parser.parseFromString(svgString, "text/xml");
            var inlineSVG = doc.getElementsByTagName("svg")[0];
            var stringWidth = inlineSVG.getAttribute("width");
            var stringHeight = inlineSVG.getAttribute("height");
            if (stringWidth == null) {
                throw new Error("must give width in the root element.");
            }
            if (stringHeight == null) {
                throw new Error("must give height in the root element.");
            }
            if (!isPixelUnits(stringWidth)) {
                throw new Error("the width in the root element must be given in \"px\" units");
            }
            if (!isPixelUnits(stringHeight)) {
                throw new Error("the height in the root element must be given in \"px\" units");
            }
            base64SVG = window.btoa(svgString);
            this.width = parseFloat(stringWidth);
            this.height = parseFloat(stringHeight);
        }
        catch (e) {
            loader._onAssetError(this, ExceptionFactory_1.ExceptionFactory.createAssetLoadError(e.message, false, e));
            return;
        }
        var image = new Image();
        image.onerror = function (e) {
            loader._onAssetError(_this, ExceptionFactory_1.ExceptionFactory.createAssetLoadError("GeneratedSVGImageAsset: unknown loading error", undefined, e));
        };
        image.onload = function () {
            _this.data = image;
            loader._onAssetLoad(_this);
        };
        image.src = "data:image/svg+xml;base64," + base64SVG;
    };
    return GeneratedSVGImageAsset;
}(SVGImageAsset_1.SVGImageAsset));
exports.GeneratedSVGImageAsset = GeneratedSVGImageAsset;
/**
 * "1.00", "1.0e2", ".1pt", "10%", "20px" などの文字列の単位が px かどうかチェックする。
 */
function isPixelUnits(value) {
    // @see https://developer.mozilla.org/en-US/docs/Web/SVG/Content_type#number
    // [+-]? [0-9]* "." [0-9]+ ([Ee] integer)?
    return /^[+-]?(?:(?:[0-9]+(?:\.[0-9]*)?)|(?:\.[0-9]+))(?:[eE][+-]?[0-9]+)?(?:px)?$/.test(value);
}

},{"../utils/ExceptionFactory":161,"./SVGImageAsset":131}],128:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLImageAsset = exports.ImageAssetSurface = void 0;
var Surface_1 = require("../Surface");
var ExceptionFactory_1 = require("../utils/ExceptionFactory");
var Asset_1 = require("./Asset");
var ImageAssetSurface = /** @class */ (function (_super) {
    __extends(ImageAssetSurface, _super);
    function ImageAssetSurface() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImageAssetSurface.prototype.renderer = function () {
        throw new Error("ImageAssetSurface cannot be rendered.");
    };
    ImageAssetSurface.prototype.isPlaying = function () {
        return false;
    };
    return ImageAssetSurface;
}(Surface_1.Surface));
exports.ImageAssetSurface = ImageAssetSurface;
var HTMLImageAsset = /** @class */ (function (_super) {
    __extends(HTMLImageAsset, _super);
    function HTMLImageAsset(id, path, width, height) {
        var _this = _super.call(this, id, path) || this;
        _this.type = "image";
        _this.width = width;
        _this.height = height;
        _this.data = undefined;
        _this._surface = undefined;
        return _this;
    }
    HTMLImageAsset.prototype.initialize = function (hint) {
        this.hint = hint;
    };
    HTMLImageAsset.prototype.destroy = function () {
        if (this._surface && !this._surface.destroyed()) {
            this._surface.destroy();
        }
        this.data = undefined;
        this._surface = undefined;
        _super.prototype.destroy.call(this);
    };
    HTMLImageAsset.prototype._load = function (loader) {
        var _this = this;
        var image = new Image();
        if (this.hint && this.hint.untainted) {
            image.crossOrigin = "anonymous";
        }
        image.onerror = function () {
            loader._onAssetError(_this, ExceptionFactory_1.ExceptionFactory.createAssetLoadError("HTMLImageAsset unknown loading error"));
        };
        image.onload = function () {
            _this.data = image;
            loader._onAssetLoad(_this);
        };
        image.src = this.path;
    };
    HTMLImageAsset.prototype.asSurface = function () {
        if (!this.data) {
            throw new Error("ImageAssetImpl#asSurface: not yet loaded.");
        }
        if (this._surface) {
            return this._surface;
        }
        this._surface = new ImageAssetSurface(this.width, this.height, this.data);
        return this._surface;
    };
    return HTMLImageAsset;
}(Asset_1.Asset));
exports.HTMLImageAsset = HTMLImageAsset;

},{"../Surface":123,"../utils/ExceptionFactory":161,"./Asset":124}],129:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLVideoAsset = void 0;
var Surface_1 = require("../Surface");
var Asset_1 = require("./Asset");
var HTMLVideoPlayer_1 = require("./HTMLVideoPlayer");
var VideoAssetSurface = /** @class */ (function (_super) {
    __extends(VideoAssetSurface, _super);
    function VideoAssetSurface(width, height, drawable) {
        return _super.call(this, width, height, drawable) || this;
    }
    VideoAssetSurface.prototype.renderer = function () {
        throw new Error("VideoAssetSurface cannot be rendered.");
    };
    VideoAssetSurface.prototype.isPlaying = function () {
        return false;
    };
    return VideoAssetSurface;
}(Surface_1.Surface));
var HTMLVideoAsset = /** @class */ (function (_super) {
    __extends(HTMLVideoAsset, _super);
    function HTMLVideoAsset(id, assetPath, width, height, system, loop, useRealSize) {
        var _this = _super.call(this, id, assetPath) || this;
        _this.type = "video";
        _this.width = width;
        _this.height = height;
        _this.realWidth = 0;
        _this.realHeight = 0;
        _this._system = system;
        _this._loop = loop;
        _this._useRealSize = useRealSize;
        _this._player = new HTMLVideoPlayer_1.HTMLVideoPlayer();
        _this._surface = new VideoAssetSurface(width, height);
        return _this;
    }
    HTMLVideoAsset.prototype.play = function (_loop) {
        this.getPlayer().play(this);
        return this.getPlayer();
    };
    HTMLVideoAsset.prototype.stop = function () {
        this.getPlayer().stop();
    };
    HTMLVideoAsset.prototype.inUse = function () {
        return false;
    };
    HTMLVideoAsset.prototype._load = function (loader) {
        var _this = this;
        setTimeout(function () {
            loader._onAssetLoad(_this);
        }, 0);
    };
    HTMLVideoAsset.prototype.getPlayer = function () {
        return this._player;
    };
    HTMLVideoAsset.prototype.asSurface = function () {
        return this._surface;
    };
    return HTMLVideoAsset;
}(Asset_1.Asset));
exports.HTMLVideoAsset = HTMLVideoAsset;

},{"../Surface":123,"./Asset":124,"./HTMLVideoPlayer":130}],130:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLVideoPlayer = void 0;
var trigger_1 = require("@akashic/trigger");
var HTMLVideoPlayer = /** @class */ (function () {
    function HTMLVideoPlayer(loop) {
        this._loop = !!loop;
        this.onPlay = new trigger_1.Trigger();
        this.onStop = new trigger_1.Trigger();
        this.played = this.onPlay;
        this.stopped = this.onStop;
        this.currentVideo = undefined;
        this.volume = 1.0;
        this.isDummy = true;
    }
    HTMLVideoPlayer.prototype.play = function (_videoAsset) {
        // not yet supported
    };
    HTMLVideoPlayer.prototype.stop = function () {
        // not yet supported
    };
    HTMLVideoPlayer.prototype.changeVolume = function (_volume) {
        // not yet supported
    };
    return HTMLVideoPlayer;
}());
exports.HTMLVideoPlayer = HTMLVideoPlayer;

},{"@akashic/trigger":213}],131:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SVGImageAsset = exports.SVGImageAssetSurface = void 0;
var Context2DSurface_1 = require("../canvas/context2d/Context2DSurface");
var Surface_1 = require("../Surface");
var ExceptionFactory_1 = require("../utils/ExceptionFactory");
var Asset_1 = require("./Asset");
var SVGImageAssetSurface = /** @class */ (function (_super) {
    __extends(SVGImageAssetSurface, _super);
    function SVGImageAssetSurface() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SVGImageAssetSurface.prototype.renderer = function () {
        throw new Error("SVGImageAssetSurface cannot be rendered.");
    };
    SVGImageAssetSurface.prototype.isPlaying = function () {
        return false;
    };
    return SVGImageAssetSurface;
}(Surface_1.Surface));
exports.SVGImageAssetSurface = SVGImageAssetSurface;
var SVGImageAsset = /** @class */ (function (_super) {
    __extends(SVGImageAsset, _super);
    function SVGImageAsset(id, path, width, height, hint) {
        var _this = _super.call(this, id, path) || this;
        _this.type = "vector-image";
        _this.width = width;
        _this.height = height;
        _this.hint = hint;
        _this.data = null;
        _this._surface = null;
        return _this;
    }
    SVGImageAsset.prototype.destroy = function () {
        this.data = null;
        this.hint = undefined;
        this._surface = null;
        _super.prototype.destroy.call(this);
    };
    SVGImageAsset.prototype._load = function (loader) {
        var _this = this;
        var image = new Image();
        if (this.hint && this.hint.untainted) {
            image.crossOrigin = "anonymous";
        }
        image.onerror = function () {
            loader._onAssetError(_this, ExceptionFactory_1.ExceptionFactory.createAssetLoadError("SVGImageAsset unknown loading error"));
        };
        image.onload = function () {
            _this.data = image;
            loader._onAssetLoad(_this);
        };
        image.src = this.path;
    };
    SVGImageAsset.prototype.createSurface = function (width, height, sx, sy, sWidth, sHeight) {
        if (sx === void 0) { sx = 0; }
        if (sy === void 0) { sy = 0; }
        var _a = this, viewportWidth = _a.width, viewportHeight = _a.height, data = _a.data;
        if (!data) {
            throw new Error("SVGImageAsset#asSurface: not yet loaded.");
        }
        if (!this._surface) {
            this._surface = new SVGImageAssetSurface(viewportWidth, viewportHeight, data);
        }
        if (!sWidth) {
            sWidth = viewportWidth;
        }
        if (!sHeight) {
            sHeight = viewportHeight;
        }
        var surface = new Context2DSurface_1.Context2DSurface(width, height);
        var renderer = surface.renderer();
        renderer.save();
        renderer.transform([width / sWidth, 0, 0, height / sHeight, 0, 0]);
        renderer.drawImage(this._surface, sx, sy, sWidth, sHeight, 0, 0);
        renderer.restore();
        return surface;
    };
    return SVGImageAsset;
}(Asset_1.Asset));
exports.SVGImageAsset = SVGImageAsset;

},{"../Surface":123,"../canvas/context2d/Context2DSurface":140,"../utils/ExceptionFactory":161,"./Asset":124}],132:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.XHRScriptAsset = void 0;
var XHRLoader_1 = require("../utils/XHRLoader");
var Asset_1 = require("./Asset");
var XHRScriptAsset = /** @class */ (function (_super) {
    __extends(XHRScriptAsset, _super);
    function XHRScriptAsset(id, path, exports) {
        if (exports === void 0) { exports = []; }
        var _this = _super.call(this, id, path) || this;
        _this.type = "script";
        _this.script = ""; // _load() までは空文字が代入されている点に注意
        _this.exports = exports;
        return _this;
    }
    XHRScriptAsset.prototype._load = function (handler) {
        var _this = this;
        var loader = new XHRLoader_1.XHRLoader();
        loader.get(this.path, function (error, responseText) {
            if (error) {
                handler._onAssetError(_this, error);
                return;
            }
            _this.script = responseText + "\n";
            handler._onAssetLoad(_this);
        });
    };
    XHRScriptAsset.prototype.execute = function (execEnv) {
        // TODO: この方式では読み込んだスクリプトがcookie参照できる等本質的な危険性がある
        // 信頼できないスクリプトを読み込むようなケースでは、iframeに閉じ込めて実行などの方式を検討する事。
        var func = this._wrap();
        func(execEnv);
        return execEnv.module.exports;
    };
    XHRScriptAsset.prototype.destroy = function () {
        this.script = undefined;
        _super.prototype.destroy.call(this);
    };
    XHRScriptAsset.prototype._wrap = function () {
        var postScript = "";
        for (var _i = 0, _a = this.exports; _i < _a.length; _i++) {
            var key = _a[_i];
            postScript += "exports[\"".concat(key, "\"] = typeof ").concat(key, " !== \"undefined\" ? ").concat(key, " : undefined;\n");
        }
        var func = new Function("g", "(function(exports, require, module, __filename, __dirname) {\n" +
            this.script + "\n" +
            postScript + "\n" +
            "})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);");
        return func;
    };
    return XHRScriptAsset;
}(Asset_1.Asset));
exports.XHRScriptAsset = XHRScriptAsset;

},{"../utils/XHRLoader":162,"./Asset":124}],133:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.XHRTextAsset = void 0;
var XHRLoader_1 = require("../utils/XHRLoader");
var Asset_1 = require("./Asset");
var XHRTextAsset = /** @class */ (function (_super) {
    __extends(XHRTextAsset, _super);
    function XHRTextAsset(id, path) {
        var _this = _super.call(this, id, path) || this;
        _this.type = "text";
        _this.data = ""; // _load() までは空文字が代入されている点に注意
        return _this;
    }
    XHRTextAsset.prototype._load = function (handler) {
        var _this = this;
        var loader = new XHRLoader_1.XHRLoader();
        loader.get(this.path, function (error, responseText) {
            if (error) {
                handler._onAssetError(_this, error);
                return;
            }
            if (!responseText) {
                handler._onAssetError(_this, {
                    name: "AssetLoadError",
                    message: "XHRTextAsset#_load(): no data received",
                    retriable: false
                });
                return;
            }
            _this.data = responseText;
            handler._onAssetLoad(_this);
        });
    };
    XHRTextAsset.prototype.destroy = function () {
        this.data = undefined;
        _super.prototype.destroy.call(this);
    };
    return XHRTextAsset;
}(Asset_1.Asset));
exports.XHRTextAsset = XHRTextAsset;

},{"../utils/XHRLoader":162,"./Asset":124}],134:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffineTransformer = void 0;
var AffineTransformer = /** @class */ (function () {
    function AffineTransformer(rhs) {
        if (rhs) {
            this.matrix = new Float32Array(rhs.matrix);
        }
        else {
            this.matrix = new Float32Array([1, 0, 0, 1, 0, 0]);
        }
    }
    AffineTransformer.prototype.scale = function (x, y) {
        var m = this.matrix;
        m[0] *= x;
        m[1] *= x;
        m[2] *= y;
        m[3] *= y;
        return this;
    };
    AffineTransformer.prototype.translate = function (x, y) {
        var m = this.matrix;
        m[4] += m[0] * x + m[2] * y;
        m[5] += m[1] * x + m[3] * y;
        return this;
    };
    AffineTransformer.prototype.transform = function (matrix) {
        var m = this.matrix;
        var a = matrix[0] * m[0] + matrix[1] * m[2];
        var b = matrix[0] * m[1] + matrix[1] * m[3];
        var c = matrix[2] * m[0] + matrix[3] * m[2];
        var d = matrix[2] * m[1] + matrix[3] * m[3];
        var e = matrix[4] * m[0] + matrix[5] * m[2] + m[4];
        var f = matrix[4] * m[1] + matrix[5] * m[3] + m[5];
        m[0] = a;
        m[1] = b;
        m[2] = c;
        m[3] = d;
        m[4] = e;
        m[5] = f;
        return this;
    };
    AffineTransformer.prototype.setTransform = function (matrix) {
        var m = this.matrix;
        m[0] = matrix[0];
        m[1] = matrix[1];
        m[2] = matrix[2];
        m[3] = matrix[3];
        m[4] = matrix[4];
        m[5] = matrix[5];
    };
    AffineTransformer.prototype.copyFrom = function (rhs) {
        this.matrix.set(rhs.matrix);
        return this;
    };
    return AffineTransformer;
}());
exports.AffineTransformer = AffineTransformer;

},{}],135:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasSurface = void 0;
var Surface_1 = require("../Surface");
var CanvasSurface = /** @class */ (function (_super) {
    __extends(CanvasSurface, _super);
    function CanvasSurface(width, height) {
        var _this = this;
        var canvas = document.createElement("canvas");
        _this = _super.call(this, width, height, canvas) || this;
        canvas.width = width;
        canvas.height = height;
        _this.canvas = canvas;
        return _this;
    }
    CanvasSurface.prototype.destroy = function () {
        this.canvas.width = 1;
        this.canvas.height = 1;
        this.canvas = undefined;
        _super.prototype.destroy.call(this);
    };
    CanvasSurface.prototype.getHTMLElement = function () {
        return this.canvas;
    };
    /**
     * 表示上の拡大率を変更する。
     * `changeRawSize()` との差異に注意。
     */
    CanvasSurface.prototype.changeVisualScale = function (xScale, yScale) {
        /*
         Canvas要素のリサイズをCSS transformで行う。
         CSSのwidth/height styleによるリサイズはおかしくなるケースが存在するので、可能な限りtransformを使う。
         - https://twitter.com/uupaa/status/639002317576998912
         - http://havelog.ayumusato.com/develop/performance/e554-paint_gpu_acceleration_problems.html
         - http://buccchi.jp/blog/2013/03/android_canvas_deathpoint/
         */
        var canvasStyle = this.canvas.style;
        if ("transform" in canvasStyle) {
            canvasStyle.transformOrigin = "0 0";
            canvasStyle.transform = "scale(" + xScale + "," + yScale + ")";
        }
        else if ("webkitTransform" in canvasStyle) {
            canvasStyle.webkitTransformOrigin = "0 0";
            canvasStyle.webkitTransform = "scale(" + xScale + "," + yScale + ")";
        }
        else {
            canvasStyle.width = Math.floor(xScale * this.width) + "px";
            canvasStyle.height = Math.floor(yScale * this.width) + "px";
        }
    };
    return CanvasSurface;
}(Surface_1.Surface));
exports.CanvasSurface = CanvasSurface;

},{"../Surface":123}],136:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlyphFactory = void 0;
var Context2DSurface_1 = require("./context2d/Context2DSurface");
function createGlyphRenderedSurface(code, fontSize, cssFontFamily, baselineHeight, marginW, marginH, needImageData, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
    // 要求されたフォントサイズが描画可能な最小フォントサイズ以下だった場合、必要なスケーリング係数
    var scale = fontSize < GlyphFactory._environmentMinimumFontSize ? fontSize / GlyphFactory._environmentMinimumFontSize : 1;
    var surfaceWidth = Math.ceil((fontSize + marginW * 2) * scale);
    var surfaceHeight = Math.ceil((fontSize + marginH * 2) * scale);
    var surface = new Context2DSurface_1.Context2DSurface(surfaceWidth, surfaceHeight);
    // NOTE: canvasを直接操作する
    // 理由:
    // * Renderer#drawSystemText()を廃止または非推奨にしたいのでそれを用いず文字列を描画する
    // * RenderingHelperがcontextの状態を復帰するためTextMetricsを取れない
    var canvas = surface.canvas;
    var context = canvas.getContext("2d");
    if (!context) {
        throw new Error("createGlyphRenderedSurface(): could not initialize CanvasRenderingContext2D");
    }
    var str = (code & 0xFFFF0000) ? String.fromCharCode((code & 0xFFFF0000) >>> 16, code & 0xFFFF) : String.fromCharCode(code);
    context.save();
    // CanvasRenderingContext2D.font
    // see: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font
    // > This string uses the same syntax as the CSS font specifier. The default font is 10px sans-serif.
    context.font = fontWeight + " " + fontSize + "px " + cssFontFamily;
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.lineJoin = "bevel";
    // 描画可能な最小フォントサイズ以下のフォントサイズはスケーリングで実現する
    if (scale !== 1)
        context.scale(scale, scale);
    if (strokeWidth > 0) {
        context.lineWidth = strokeWidth;
        context.strokeStyle = strokeColor;
        context.strokeText(str, marginW, marginH + baselineHeight);
    }
    if (!strokeOnly) {
        context.fillStyle = fontColor;
        context.fillText(str, marginW, marginH + baselineHeight);
    }
    var advanceWidth = context.measureText(str).width;
    context.restore();
    var result = {
        surface: surface,
        advanceWidth: advanceWidth,
        imageData: needImageData ? context.getImageData(0, 0, canvas.width, canvas.height) : undefined
    };
    return result;
}
function calcGlyphArea(imageData) {
    var sx = imageData.width;
    var sy = imageData.height;
    var ex = 0;
    var ey = 0;
    var currentPos = 0;
    for (var y = 0, height = imageData.height; y < height; y = (y + 1) | 0) {
        for (var x = 0, width = imageData.width; x < width; x = (x + 1) | 0) {
            var a = imageData.data[currentPos + 3]; // get alpha value
            if (a !== 0) {
                if (x < sx) {
                    sx = x;
                }
                if (x > ex) {
                    ex = x;
                }
                if (y < sy) {
                    sy = y;
                }
                if (y > ey) {
                    ey = y;
                }
            }
            currentPos += 4; // go to next pixel
        }
    }
    var glyphArea;
    if (sx === imageData.width) { // 空白文字
        glyphArea = { x: 0, y: 0, width: 0, height: 0 }; // 空の領域に設定
    }
    else {
        // sx, sy, ex, eyは座標ではなく画素のメモリ上の位置を指す添字。
        // 故にwidth, heightを算出する時 1 加算する。
        glyphArea = { x: sx, y: sy, width: ex - sx + 1, height: ey - sy + 1 };
    }
    return glyphArea;
}
function isGlyphAreaEmpty(glyphArea) {
    return glyphArea.width === 0 || glyphArea.height === 0;
}
// ジェネリックフォントファミリとして定義されているキーワードのリスト
// see: https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
var genericFontFamilyNames = [
    "serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"
];
// ジェネリックフォントファミリでない時クォートする。
// > Font family names must either be given quoted as strings, or unquoted as a sequence of one or more identifiers.
// > Generic family names are keywords and must not be quoted.
// see: https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
function quoteIfNonGeneric(name) {
    return (genericFontFamilyNames.indexOf(name) !== -1) ? name : "\"" + name + "\"";
}
function createGlyph(code, x, y, width, height, offsetX, offsetY, advanceWidth, surface, isSurfaceValid) {
    return {
        code: code,
        x: x,
        y: y,
        width: width,
        height: height,
        surface: surface,
        offsetX: offsetX,
        offsetY: offsetY,
        advanceWidth: advanceWidth,
        isSurfaceValid: isSurfaceValid,
        _atlas: null
    };
}
var GlyphFactory = /** @class */ (function () {
    function GlyphFactory(fontFamily, fontSize, baselineHeight, fontColor, strokeWidth, strokeColor, strokeOnly, fontWeight) {
        if (baselineHeight === void 0) { baselineHeight = fontSize; }
        if (fontColor === void 0) { fontColor = "black"; }
        if (strokeWidth === void 0) { strokeWidth = 0; }
        if (strokeColor === void 0) { strokeColor = "black"; }
        if (strokeOnly === void 0) { strokeOnly = false; }
        if (fontWeight === void 0) { fontWeight = "normal"; }
        this._glyphAreas = Object.create(null);
        this.fontFamily = fontFamily;
        this.fontSize = fontSize;
        this.baselineHeight = baselineHeight;
        this.fontColor = fontColor;
        this.strokeWidth = strokeWidth;
        this.strokeColor = strokeColor;
        this.strokeOnly = strokeOnly;
        this.fontWeight = fontWeight;
        this._cssFontFamily = (typeof fontFamily === "string")
            ? quoteIfNonGeneric(fontFamily)
            : fontFamily.map(quoteIfNonGeneric).join(",");
        // Akashicエンジンは指定されたフォントに利用可能なものが見つからない時
        // `"sans-serif"` を利用する、と仕様して定められている。
        if (this._cssFontFamily.indexOf("sans-serif") === -1) {
            this._cssFontFamily += ",sans-serif";
        }
        // `this.fontSize`の大きさの文字を描画するためのサーフェスを生成する。
        // 一部の文字は縦横が`this.fontSize`幅の矩形に収まらない。
        // そこで上下左右にマージンを設ける。マージン幅は`this.fontSize`に
        // 0.3 を乗じたものにする。0.3に確たる根拠はないが、検証した範囲では
        // これで十分であることを確認している。
        //
        // strokeWidthサポートに伴い、輪郭線の厚みを加味している。
        this._marginW = Math.ceil(this.fontSize * 0.3 + this.strokeWidth / 2);
        this._marginH = Math.ceil(this.fontSize * 0.3 + this.strokeWidth / 2);
        if (GlyphFactory._environmentMinimumFontSize === undefined) {
            GlyphFactory._environmentMinimumFontSize = this.measureMinimumFontSize();
        }
    }
    GlyphFactory.prototype.create = function (code) {
        var result = null;
        var glyphArea = this._glyphAreas[code];
        if (!glyphArea) {
            result = createGlyphRenderedSurface(code, this.fontSize, this._cssFontFamily, this.baselineHeight, this._marginW, this._marginH, true, this.fontColor, this.strokeWidth, this.strokeColor, this.strokeOnly, this.fontWeight);
            glyphArea = calcGlyphArea(result.imageData);
            glyphArea.advanceWidth = result.advanceWidth;
            this._glyphAreas[code] = glyphArea;
        }
        if (isGlyphAreaEmpty(glyphArea)) {
            if (result) {
                result.surface.destroy();
            }
            return createGlyph(code, 0, 0, 0, 0, 0, 0, glyphArea.advanceWidth, undefined, true);
        }
        else {
            // pdi.Glyphに格納するサーフェスを生成する。
            // glyphAreaはサーフェスをキャッシュしないため、描画する内容を持つグリフに対しては
            // サーフェスを生成する。もし前段でcalcGlyphArea()のためのサーフェスを生成して
            // いればここでは生成せずにそれを利用する。
            if (!result) {
                result = createGlyphRenderedSurface(code, this.fontSize, this._cssFontFamily, this.baselineHeight, this._marginW, this._marginH, false, this.fontColor, this.strokeWidth, this.strokeColor, this.strokeOnly, this.fontWeight);
            }
            return createGlyph(code, glyphArea.x, glyphArea.y, glyphArea.width, glyphArea.height, glyphArea.x - this._marginW, glyphArea.y - this._marginH, glyphArea.advanceWidth, result.surface, true);
        }
    };
    // 実行環境の描画可能なフォントサイズの最小値を返す
    GlyphFactory.prototype.measureMinimumFontSize = function () {
        var fontSize = 1;
        var str = "M";
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        if (!context) {
            throw new Error("GlyphFactory#measureMinimumFontSize(): could not initialize CanvasRenderingContext2D");
        }
        context.textAlign = "left";
        context.textBaseline = "alphabetic";
        context.lineJoin = "bevel";
        var preWidth;
        context.font = fontSize + "px sans-serif";
        var width = context.measureText(str).width;
        do {
            preWidth = width;
            fontSize += 1;
            context.font = fontSize + "px sans-serif";
            width = context.measureText(str).width;
        } while (preWidth === width || fontSize > 50); // フォントサイズに対応しない動作環境の場合を考慮して上限値を設ける
        return fontSize;
    };
    return GlyphFactory;
}());
exports.GlyphFactory = GlyphFactory;

},{"./context2d/Context2DSurface":140}],137:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasRenderingState = void 0;
var AffineTransformer_1 = require("../AffineTransformer");
var CanvasRenderingState = /** @class */ (function () {
    function CanvasRenderingState(crs) {
        if (crs) {
            this.fillStyle = crs.fillStyle;
            this.globalAlpha = crs.globalAlpha;
            this.globalCompositeOperation = crs.globalCompositeOperation;
            this.transformer = new AffineTransformer_1.AffineTransformer(crs.transformer);
        }
        else {
            this.fillStyle = "#000000";
            this.globalAlpha = 1.0;
            this.globalCompositeOperation = "source-over";
            this.transformer = new AffineTransformer_1.AffineTransformer();
        }
    }
    return CanvasRenderingState;
}());
exports.CanvasRenderingState = CanvasRenderingState;

},{"../AffineTransformer":134}],138:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasSurfaceContext = void 0;
var CanvasRenderingState_1 = require("./CanvasRenderingState");
var CanvasSurfaceContext = /** @class */ (function () {
    function CanvasSurfaceContext(context) {
        this._stateStack = [];
        this._modifiedTransform = false;
        this._context = context;
        var state = new CanvasRenderingState_1.CanvasRenderingState();
        this._contextFillStyle = state.fillStyle;
        this._contextGlobalAlpha = state.globalAlpha;
        this._contextGlobalCompositeOperation = state.globalCompositeOperation;
        this.pushState(state);
    }
    Object.defineProperty(CanvasSurfaceContext.prototype, "fillStyle", {
        get: function () {
            return this.currentState().fillStyle;
        },
        set: function (fillStyle) {
            this.currentState().fillStyle = fillStyle;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CanvasSurfaceContext.prototype, "globalAlpha", {
        get: function () {
            return this.currentState().globalAlpha;
        },
        set: function (globalAlpha) {
            this.currentState().globalAlpha = globalAlpha;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CanvasSurfaceContext.prototype, "globalCompositeOperation", {
        get: function () {
            return this.currentState().globalCompositeOperation;
        },
        set: function (operation) {
            this.currentState().globalCompositeOperation = operation;
        },
        enumerable: false,
        configurable: true
    });
    CanvasSurfaceContext.prototype.getCanvasRenderingContext2D = function () {
        return this._context;
    };
    CanvasSurfaceContext.prototype.clearRect = function (x, y, width, height) {
        this.prerender();
        this._context.clearRect(x, y, width, height);
    };
    CanvasSurfaceContext.prototype.save = function () {
        var state = new CanvasRenderingState_1.CanvasRenderingState(this.currentState());
        this.pushState(state);
    };
    CanvasSurfaceContext.prototype.restore = function () {
        this.popState();
    };
    CanvasSurfaceContext.prototype.scale = function (x, y) {
        this.currentState().transformer.scale(x, y);
        this._modifiedTransform = true;
    };
    CanvasSurfaceContext.prototype.drawImage = function (image, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH) {
        this.prerender();
        this._context.drawImage(image, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
    };
    CanvasSurfaceContext.prototype.fillRect = function (x, y, width, height) {
        this.prerender();
        this._context.fillRect(x, y, width, height);
    };
    CanvasSurfaceContext.prototype.fillText = function (text, x, y, maxWidth) {
        this.prerender();
        this._context.fillText(text, x, y, maxWidth);
    };
    CanvasSurfaceContext.prototype.strokeText = function (text, x, y, maxWidth) {
        this.prerender();
        this._context.strokeText(text, x, y, maxWidth);
    };
    CanvasSurfaceContext.prototype.translate = function (x, y) {
        this.currentState().transformer.translate(x, y);
        this._modifiedTransform = true;
    };
    CanvasSurfaceContext.prototype.transform = function (m11, m12, m21, m22, dx, dy) {
        this.currentState().transformer.transform([m11, m12, m21, m22, dx, dy]);
        this._modifiedTransform = true;
    };
    CanvasSurfaceContext.prototype.setTransform = function (m11, m12, m21, m22, dx, dy) {
        this.currentState().transformer.setTransform([m11, m12, m21, m22, dx, dy]);
        this._modifiedTransform = true;
    };
    CanvasSurfaceContext.prototype.setGlobalAlpha = function (globalAlpha) {
        this.currentState().globalAlpha = globalAlpha;
    };
    CanvasSurfaceContext.prototype.getImageData = function (sx, sy, sw, sh) {
        return this._context.getImageData(sx, sy, sw, sh);
    };
    CanvasSurfaceContext.prototype.putImageData = function (imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
        this._context.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
    };
    CanvasSurfaceContext.prototype.prerender = function () {
        var currentState = this.currentState();
        if (currentState.fillStyle !== this._contextFillStyle) {
            this._context.fillStyle = currentState.fillStyle;
            this._contextFillStyle = currentState.fillStyle;
        }
        if (currentState.globalAlpha !== this._contextGlobalAlpha) {
            this._context.globalAlpha = currentState.globalAlpha;
            this._contextGlobalAlpha = currentState.globalAlpha;
        }
        if (currentState.globalCompositeOperation !== this._contextGlobalCompositeOperation) {
            this._context.globalCompositeOperation = currentState.globalCompositeOperation;
            this._contextGlobalCompositeOperation = currentState.globalCompositeOperation;
        }
        if (this._modifiedTransform) {
            var transformer = currentState.transformer;
            this._context.setTransform(transformer.matrix[0], transformer.matrix[1], transformer.matrix[2], transformer.matrix[3], transformer.matrix[4], transformer.matrix[5]);
            this._modifiedTransform = false;
        }
    };
    CanvasSurfaceContext.prototype.pushState = function (state) {
        this._stateStack.push(state);
    };
    CanvasSurfaceContext.prototype.popState = function () {
        if (this._stateStack.length <= 1) {
            return;
        }
        this._stateStack.pop();
        this._modifiedTransform = true;
        // TODO: `_context` が外部(Context2DRenderer)で破壊されているのでここで値を反映している。本来 `_context` の操作は全てこのクラスに集約すべきである。
        this._contextFillStyle = this._context.fillStyle;
        this._contextGlobalAlpha = this._context.globalAlpha;
        this._contextGlobalCompositeOperation = this._context.globalCompositeOperation;
    };
    CanvasSurfaceContext.prototype.currentState = function () {
        return this._stateStack[this._stateStack.length - 1];
    };
    return CanvasSurfaceContext;
}());
exports.CanvasSurfaceContext = CanvasSurfaceContext;

},{"./CanvasRenderingState":137}],139:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context2DRenderer = void 0;
var compositeOperationTable = {
    "source-over": "source-over",
    "source-atop": "source-atop",
    "lighter": "lighter",
    "copy": "copy",
    "experimental-source-in": "source-in",
    "experimental-source-out": "source-out",
    "experimental-destination-atop": "destination-atop",
    "experimental-destination-in": "destination-in",
    "destination-out": "destination-out",
    "destination-over": "destination-over",
    "xor": "xor"
};
var Context2DRenderer = /** @class */ (function () {
    function Context2DRenderer(surface) {
        this.surface = surface;
        this.context = surface.context();
        this.canvasRenderingContext2D = this.context.getCanvasRenderingContext2D();
    }
    Context2DRenderer.prototype.begin = function () {
        this.canvasRenderingContext2D.save();
        this.context.save();
    };
    Context2DRenderer.prototype.end = function () {
        this.canvasRenderingContext2D.restore();
        this.context.restore();
    };
    Context2DRenderer.prototype.clear = function () {
        this.context.clearRect(0, 0, this.surface.width, this.surface.height);
    };
    Context2DRenderer.prototype.drawImage = function (surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY) {
        this.context.drawImage(surface._drawable, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, width, height);
    };
    Context2DRenderer.prototype.drawSprites = function (surface, offsetX, offsetY, width, height, canvasOffsetX, canvasOffsetY, count) {
        for (var i = 0; i < count; ++i) {
            this.drawImage(surface, offsetX[i], offsetY[i], width[i], height[i], canvasOffsetX[i], canvasOffsetY[i]);
        }
    };
    Context2DRenderer.prototype.translate = function (x, y) {
        this.context.translate(x, y);
    };
    Context2DRenderer.prototype.transform = function (matrix) {
        this.context.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
    };
    Context2DRenderer.prototype.opacity = function (opacity) {
        // Note:globalAlphaの初期値が1であることは仕様上保証されているため、常に掛け合わせる
        this.context.globalAlpha *= opacity;
    };
    Context2DRenderer.prototype.save = function () {
        this.context.save();
    };
    Context2DRenderer.prototype.restore = function () {
        this.context.restore();
    };
    Context2DRenderer.prototype.fillRect = function (x, y, width, height, cssColor) {
        this.context.fillStyle = cssColor;
        this.context.fillRect(x, y, width, height);
    };
    Context2DRenderer.prototype.setCompositeOperation = function (operation) {
        this.context.globalCompositeOperation = compositeOperationTable[operation] || "source-over";
    };
    Context2DRenderer.prototype.setOpacity = function (opacity) {
        this.context.globalAlpha = opacity;
    };
    Context2DRenderer.prototype.setTransform = function (matrix) {
        this.context.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
    };
    Context2DRenderer.prototype.setShaderProgram = function (_shaderProgram) {
        throw new Error("Context2DRenderer#setShaderProgram() is not implemented");
    };
    Context2DRenderer.prototype.isSupportedShaderProgram = function () {
        return false;
    };
    Context2DRenderer.prototype.getContext = function () {
        return this.context.getCanvasRenderingContext2D();
    };
    Context2DRenderer.prototype.flush = function () {
        // do nothing.
    };
    Context2DRenderer.prototype._getImageData = function (sx, sy, sw, sh) {
        return this.context.getImageData(sx, sy, sw, sh);
    };
    Context2DRenderer.prototype._putImageData = function (imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
        if (dirtyX === void 0) { dirtyX = 0; }
        if (dirtyY === void 0) { dirtyY = 0; }
        if (dirtyWidth === void 0) { dirtyWidth = imageData.width; }
        if (dirtyHeight === void 0) { dirtyHeight = imageData.height; }
        this.context.putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
    };
    return Context2DRenderer;
}());
exports.Context2DRenderer = Context2DRenderer;

},{}],140:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context2DSurface = void 0;
var CanvasSurface_1 = require("../CanvasSurface");
var CanvasSurfaceContext_1 = require("./CanvasSurfaceContext");
var Context2DRenderer_1 = require("./Context2DRenderer");
var Context2DSurface = /** @class */ (function (_super) {
    __extends(Context2DSurface, _super);
    function Context2DSurface() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Context2DSurface.prototype.context = function () {
        if (!this._context) {
            var context = this.canvas.getContext("2d");
            if (!context) {
                throw new Error("Context2DSurface#context(): could not initialize CanvasRenderingContext2D");
            }
            this._context = new CanvasSurfaceContext_1.CanvasSurfaceContext(context);
        }
        return this._context;
    };
    Context2DSurface.prototype.renderer = function () {
        if (!this._renderer) {
            this._renderer = new Context2DRenderer_1.Context2DRenderer(this);
        }
        return this._renderer;
    };
    Context2DSurface.prototype.changePhysicalScale = function (xScale, yScale) {
        if (!this._context) {
            throw new Error("Context2DSurface#changePhysicalScale(): context has not been initialized");
        }
        this.canvas.width = this.width * xScale;
        this.canvas.height = this.height * yScale;
        this._context.scale(xScale, yScale);
    };
    Context2DSurface.prototype.isPlaying = function () {
        return false;
    };
    return Context2DSurface;
}(CanvasSurface_1.CanvasSurface));
exports.Context2DSurface = Context2DSurface;

},{"../CanvasSurface":135,"./CanvasSurfaceContext":138,"./Context2DRenderer":139}],141:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasDisposer = void 0;
var CanvasDisposer = /** @class */ (function () {
    function CanvasDisposer() {
        this._idCounter = 0;
        this._canvasMap = {};
        this._registry = typeof FinalizationRegistry !== "undefined" ? new FinalizationRegistry(this._dispose.bind(this)) : null;
    }
    CanvasDisposer.prototype.register = function (target, canvas) {
        if (!this._registry)
            return;
        var id = "".concat(this._idCounter++);
        this._canvasMap[id] = canvas;
        this._registry.register(target, id);
    };
    CanvasDisposer.prototype._dispose = function (id) {
        var canvas = this._canvasMap[id];
        if (!canvas)
            return;
        canvas.width = 1;
        canvas.height = 1;
        delete this._canvasMap[id];
    };
    return CanvasDisposer;
}());
exports.CanvasDisposer = CanvasDisposer;

},{}],142:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SurfaceFactory = void 0;
var Context2DSurface_1 = require("../context2d/Context2DSurface");
var CanvasDisposer_1 = require("./CanvasDisposer");
var SurfaceFactory = /** @class */ (function () {
    function SurfaceFactory() {
        this._disposer = new CanvasDisposer_1.CanvasDisposer();
    }
    SurfaceFactory.prototype.createPrimarySurface = function (width, height, _rendererCandidates) {
        return new Context2DSurface_1.Context2DSurface(width, height);
    };
    SurfaceFactory.prototype.createBackSurface = function (width, height, _rendererCandidates) {
        var surface = new Context2DSurface_1.Context2DSurface(width, height);
        this._disposer.register(surface, surface.getHTMLElement());
        return surface;
    };
    return SurfaceFactory;
}());
exports.SurfaceFactory = SurfaceFactory;

},{"../context2d/Context2DSurface":140,"./CanvasDisposer":141}],143:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointerEventHandler = void 0;
var trigger_1 = require("@akashic/trigger");
/**
 * pointer-events を利用した入力ハンドラ。
 *
 * コンストラクタで受け取ったViewに対して pointer-events のハンドラを設定する。
 * DOMイベント情報から `PlatformPointEvent` へ変換したデータを `pointTrigger` を通して通知する。
 * Down -> Move -> Up のフローにおける、Moveイベントのロックを管理する。
 */
var PointerEventHandler = /** @class */ (function () {
    function PointerEventHandler(inputView) {
        var _this = this;
        this.onPointerDown = function (e) {
            _this.pointDown(e.pointerId, _this.getOffsetPositionFromInputView(e), _this.getPlatformButtonType(e));
            var onPointerMove = function (event) {
                _this.pointMove(event.pointerId, _this.getOffsetPositionFromInputView(event), _this.getPlatformButtonType(event));
            };
            var onPointerUp = function (event) {
                _this.pointUp(event.pointerId, _this.getOffsetPositionFromInputView(event), _this.getPlatformButtonType(event));
                if (e.pointerId === event.pointerId) {
                    var handlers = _this._eventHandlersMap[event.pointerId];
                    if (!handlers)
                        return;
                    var onPointerMove_1 = handlers.onPointerMove, onPointerUp_1 = handlers.onPointerUp;
                    window.removeEventListener("pointermove", onPointerMove_1, false);
                    window.removeEventListener("pointerup", onPointerUp_1, false);
                    delete _this._eventHandlersMap[event.pointerId];
                }
            };
            window.addEventListener("pointermove", onPointerMove, false);
            window.addEventListener("pointerup", onPointerUp, false);
            _this._eventHandlersMap[e.pointerId] = { onPointerMove: onPointerMove, onPointerUp: onPointerUp };
        };
        this.onContextMenu = function (ev) {
            ev.preventDefault();
        };
        this.inputView = inputView;
        this.pointerEventLock = {};
        this._eventHandlersMap = Object.create(null);
        this._xScale = 1;
        this._yScale = 1;
        this.pointTrigger = new trigger_1.Trigger();
        inputView.style.touchAction = "none";
        inputView.style.userSelect = "none";
    }
    // `start()` で設定するDOMイベントをサポートしているかを返す
    PointerEventHandler.isSupported = function () {
        return false;
    };
    PointerEventHandler.prototype.start = function () {
        this.inputView.addEventListener("pointerdown", this.onPointerDown, false);
        this.inputView.addEventListener("contextmenu", this.onContextMenu, false);
    };
    PointerEventHandler.prototype.stop = function () {
        this.inputView.removeEventListener("pointerdown", this.onPointerDown, false);
        this.inputView.removeEventListener("contextmenu", this.onContextMenu, false);
    };
    PointerEventHandler.prototype.setScale = function (xScale, yScale) {
        if (yScale === void 0) { yScale = xScale; }
        this._xScale = xScale;
        this._yScale = yScale;
    };
    PointerEventHandler.prototype.pointDown = function (identifier, pagePosition, button) {
        this.pointTrigger.fire({
            type: 0 /* PlatformPointType.Down */,
            identifier: identifier,
            offset: this.getOffsetFromEvent(pagePosition),
            button: button
        });
        // downのイベントIDを保存して、moveとupのイベントの抑制をする(ロックする)
        this.pointerEventLock[identifier] = true;
    };
    PointerEventHandler.prototype.pointMove = function (identifier, pagePosition, button) {
        if (!this.pointerEventLock.hasOwnProperty(identifier + "")) {
            return;
        }
        this.pointTrigger.fire({
            type: 1 /* PlatformPointType.Move */,
            identifier: identifier,
            offset: this.getOffsetFromEvent(pagePosition),
            button: button
        });
    };
    PointerEventHandler.prototype.pointUp = function (identifier, pagePosition, button) {
        if (!this.pointerEventLock.hasOwnProperty(identifier + "")) {
            return;
        }
        this.pointTrigger.fire({
            type: 2 /* PlatformPointType.Up */,
            identifier: identifier,
            offset: this.getOffsetFromEvent(pagePosition),
            button: button
        });
        // Upが完了したら、Down->Upが完了したとしてロックを外す
        delete this.pointerEventLock[identifier];
    };
    PointerEventHandler.prototype.getOffsetFromEvent = function (e) {
        return { x: e.offsetX, y: e.offsetY };
    };
    PointerEventHandler.prototype.getScale = function () {
        return { x: this._xScale, y: this._yScale };
    };
    PointerEventHandler.prototype.getOffsetPositionFromInputView = function (position) {
        // windowの左上を0,0とした時のinputViewのoffsetを取得する
        var bounding = this.inputView.getBoundingClientRect();
        var scale = this.getScale();
        return {
            offsetX: (position.pageX - Math.round(window.pageXOffset + bounding.left)) / scale.x,
            offsetY: (position.pageY - Math.round(window.pageYOffset + bounding.top)) / scale.y
        };
    };
    PointerEventHandler.prototype.getPlatformButtonType = function (e) {
        switch (e.button) {
            case 0:
                // 左クリック
                return 0 /* PlatformButtonType.Primary */;
            case 1:
                // ミドルクリック
                return 1 /* PlatformButtonType.Auxiliary */;
            case 2:
                // 右クリック
                return 2 /* PlatformButtonType.Secondary */;
            default:
                // 上記以外のボタンは左クリックとして扱う
                return 0 /* PlatformButtonType.Primary */;
        }
    };
    return PointerEventHandler;
}());
exports.PointerEventHandler = PointerEventHandler;

},{"@akashic/trigger":213}],144:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyAudioPlugin = exports.WebAudioPlugin = exports.HTMLAudioPlugin = exports.AudioPluginManager = exports.AudioPluginRegistry = exports.ResourceFactory = exports.Platform = void 0;
var Platform_1 = require("./Platform");
Object.defineProperty(exports, "Platform", { enumerable: true, get: function () { return Platform_1.Platform; } });
var AudioPluginRegistry_1 = require("./plugin/AudioPluginRegistry");
Object.defineProperty(exports, "AudioPluginRegistry", { enumerable: true, get: function () { return AudioPluginRegistry_1.AudioPluginRegistry; } });
var AudioPluginManager_1 = require("./plugin/AudioPluginManager");
Object.defineProperty(exports, "AudioPluginManager", { enumerable: true, get: function () { return AudioPluginManager_1.AudioPluginManager; } });
// TODO: Audio Pluginの実態は別リポジトリに切り出す事を検討する
var HTMLAudioPlugin_1 = require("./plugin/HTMLAudioPlugin/HTMLAudioPlugin");
Object.defineProperty(exports, "HTMLAudioPlugin", { enumerable: true, get: function () { return HTMLAudioPlugin_1.HTMLAudioPlugin; } });
var ProxyAudioPlugin_1 = require("./plugin/ProxyAudioPlugin/ProxyAudioPlugin");
Object.defineProperty(exports, "ProxyAudioPlugin", { enumerable: true, get: function () { return ProxyAudioPlugin_1.ProxyAudioPlugin; } });
var WebAudioPlugin_1 = require("./plugin/WebAudioPlugin/WebAudioPlugin");
Object.defineProperty(exports, "WebAudioPlugin", { enumerable: true, get: function () { return WebAudioPlugin_1.WebAudioPlugin; } });
var ResourceFactory_1 = require("./ResourceFactory");
Object.defineProperty(exports, "ResourceFactory", { enumerable: true, get: function () { return ResourceFactory_1.ResourceFactory; } });

},{"./Platform":120,"./ResourceFactory":122,"./plugin/AudioPluginManager":146,"./plugin/AudioPluginRegistry":147,"./plugin/HTMLAudioPlugin/HTMLAudioPlugin":151,"./plugin/ProxyAudioPlugin/ProxyAudioPlugin":154,"./plugin/WebAudioPlugin/WebAudioPlugin":159}],145:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPlayer = void 0;
var trigger_1 = require("@akashic/trigger");
var AudioPlayer = /** @class */ (function () {
    function AudioPlayer(system) {
        this.onPlay = new trigger_1.Trigger();
        this.onStop = new trigger_1.Trigger();
        this.played = this.onPlay;
        this.stopped = this.onStop;
        this.volume = 1;
        this._muted = false;
        this._system = system;
    }
    AudioPlayer.prototype.play = function (audio) {
        this.currentAudio = audio;
        this.onPlay.fire({
            player: this,
            audio: audio
        });
    };
    AudioPlayer.prototype.stop = function () {
        var audio = this.currentAudio;
        if (!audio)
            return;
        this.currentAudio = undefined;
        this.onStop.fire({
            player: this,
            audio: audio
        });
    };
    AudioPlayer.prototype.canHandleStopped = function () {
        return true;
    };
    AudioPlayer.prototype.changeVolume = function (volume) {
        this.volume = volume;
    };
    // 歴史的経緯のためこの名前になっているが、対称性を考えればこのメソッドの正しい名前は _notifyMutedChanged() である。
    AudioPlayer.prototype._changeMuted = function (_muted) {
        // this._muted が未使用のため何もしない。
    };
    AudioPlayer.prototype._notifyVolumeChanged = function () {
        // AudioPlayerの音量を AudioSystem の音量で上書きしていたため、最終音量が正常に計算できていなかった。
        // 暫定対応として、 changeVolume() に AudioPlayer 自身の音量を渡す事により最終音量の計算を実行させる。
        this.changeVolume(this.volume);
    };
    return AudioPlayer;
}());
exports.AudioPlayer = AudioPlayer;

},{"@akashic/trigger":213}],146:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPluginManager = void 0;
/*
 Audioプラグインを登録し、現在登録しているプラグインを管理するクラス

 TODO: 各Gameインスタンスが一つのAudioプラグインしか持たないので、
 PluginManagerが状態をもたずにGame自体にpluginを登録する方式もあり
 */
var AudioPluginManager = /** @class */ (function () {
    function AudioPluginManager() {
        this._activePlugin = null;
    }
    AudioPluginManager.prototype.getActivePlugin = function () {
        return this._activePlugin;
    };
    // Audioプラグインに登録を行い、どれか一つでも成功ならtrue、それ以外はfalseを返す
    AudioPluginManager.prototype.tryInstallPlugin = function (plugins) {
        for (var i = 0, len = plugins.length; i < len; i++) {
            var p = plugins[i];
            if (p.isSupported) {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                var PluginConstructor = p; // インスタンス化するので命名規則の lint を除外
                if (PluginConstructor.isSupported()) {
                    this._activePlugin = new PluginConstructor();
                    return true;
                }
            }
            else {
                this._activePlugin = p;
                return true;
            }
        }
        return false;
    };
    return AudioPluginManager;
}());
exports.AudioPluginManager = AudioPluginManager;

},{}],147:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPluginRegistry = void 0;
var audioPlugins = [];
// eslint-disable-next-line @typescript-eslint/naming-convention
exports.AudioPluginRegistry = {
    addPlugin: function (plugin) {
        if (audioPlugins.indexOf(plugin) === -1) {
            audioPlugins.push(plugin);
        }
    },
    getRegisteredAudioPlugins: function () {
        return audioPlugins;
    },
    clear: function () {
        audioPlugins = [];
    }
};

},{}],148:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLAudioAsset = void 0;
var AudioAsset_1 = require("../../asset/AudioAsset");
var ExceptionFactory_1 = require("../../utils/ExceptionFactory");
var audioUtil_1 = require("../audioUtil");
var HTMLAudioAsset = /** @class */ (function (_super) {
    __extends(HTMLAudioAsset, _super);
    function HTMLAudioAsset() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._intervalId = -1;
        _this._intervalCount = 0;
        return _this;
    }
    HTMLAudioAsset.prototype._load = function (loader) {
        var _this = this;
        if (this.path == null) {
            // 再生可能な形式がない。実際には鳴らない音声としてロード成功しておく
            this.data = null;
            setTimeout(function () { return loader._onAssetLoad(_this); }, 0);
            return;
        }
        var audio = this.createAudioElement();
        var startLoadingAudio = function (path, handlers) {
            // autoplay は preload よりも優先されるため明示的にfalseとする
            audio.autoplay = false;
            audio.preload = "none";
            audio.src = path;
            _this._attachAll(audio, handlers);
            /* eslint-disable max-len */
            // Firefoxはpreload="auto"でないと読み込みされない
            // preloadはブラウザに対するHint属性なので、どう扱うかはブラウザの実装次第となる
            // https://html.spec.whatwg.org/multipage/embedded-content.html#attr-media-preload
            // https://developer.mozilla.org/ja/docs/Web/HTML/Element/audio#attr-preload
            // https://github.com/CreateJS/SoundJS/blob/e2d4842a84ff425ada861edb9f6e9b57f63d7caf/src/soundjs/htmlaudio/HTMLAudioSoundInstance.js#L147-147
            /* eslint-enable max-len */
            audio.preload = "auto";
            setAudioLoadInterval(audio, handlers);
            audio.load();
        };
        var handlers = {
            success: function () {
                _this._detachAll(audio, handlers);
                _this.data = audio;
                loader._onAssetLoad(_this);
                window.clearInterval(_this._intervalId);
            },
            error: function () {
                _this._detachAll(audio, handlers);
                _this.data = audio;
                loader._onAssetError(_this, ExceptionFactory_1.ExceptionFactory.createAssetLoadError("HTMLAudioAsset loading error"));
                window.clearInterval(_this._intervalId);
            }
        };
        var setAudioLoadInterval = function (audio, handlers) {
            // IE11において、canplaythroughイベントが正常に発火しない問題が確認されたため、その対処として以下の処理を行っている。
            // なお、canplaythroughはreadyStateの値が4になった時点で呼び出されるイベントである。
            // インターバルとして指定している100msに根拠は無い。
            _this._intervalCount = 0;
            _this._intervalId = window.setInterval(function () {
                if (audio.readyState === 4) {
                    handlers.success();
                }
                else {
                    ++_this._intervalCount;
                    // readyStateの値が4にならない状態が1分（100ms×600）続いた場合、
                    // 読み込みに失敗したとする。1分という時間に根拠は無い。
                    if (_this._intervalCount === 600) {
                        handlers.error();
                    }
                }
            }, 100);
        };
        // 暫定対応：後方互換性のため、aacファイルが無い場合はmp4へのフォールバックを試みる。
        // この対応を止める際には、HTMLAudioPluginのsupportedExtensionsからaacを除外する必要がある。
        var delIndex = this.path.indexOf("?");
        var basePath = delIndex >= 0 ? this.path.substring(0, delIndex) : this.path;
        if (basePath.slice(-4) === ".aac" && HTMLAudioAsset.supportedFormats.indexOf("mp4") !== -1) {
            var altHandlers_1 = {
                success: handlers.success,
                error: function () {
                    _this._detachAll(audio, altHandlers_1);
                    window.clearInterval(_this._intervalId);
                    _this.path = (0, audioUtil_1.addExtname)(_this.originalPath, ".mp4");
                    startLoadingAudio(_this.path, handlers);
                }
            };
            startLoadingAudio(this.path, altHandlers_1);
            return;
        }
        startLoadingAudio(this.path, handlers);
    };
    HTMLAudioAsset.prototype.cloneElement = function () {
        return this.data ? this.createAudioElement(this.data.src) : null;
    };
    HTMLAudioAsset.prototype._assetPathFilter = function (path) {
        if (HTMLAudioAsset.supportedFormats.indexOf("ogg") !== -1) {
            return (0, audioUtil_1.addExtname)(path, ".ogg");
        }
        if (HTMLAudioAsset.supportedFormats.indexOf("aac") !== -1) {
            return (0, audioUtil_1.addExtname)(path, ".aac");
        }
        // ここで検出されるのは最初にアクセスを試みるオーディオアセットのファイルパスなので、
        // supportedFormatsに(後方互換性保持で使う可能性がある)mp4が含まれていても利用しない
        // TODO: _assetPathFilter() における戻り値 `null` の扱い
        return null;
    };
    HTMLAudioAsset.prototype._modifyPath = function (path) {
        var _a;
        var ext = (0, audioUtil_1.resolveExtname)((_a = this.hint) === null || _a === void 0 ? void 0 : _a.extensions, HTMLAudioAsset.supportedFormats);
        return ext ? (0, audioUtil_1.addExtname)(this.originalPath, ext) : path;
    };
    HTMLAudioAsset.prototype.createAudioElement = function (src) {
        return new Audio(src);
    };
    HTMLAudioAsset.prototype._attachAll = function (audio, handlers) {
        if (handlers.success) {
            /* eslint-disable max-len */
            // https://developer.mozilla.org/en-US/docs/Web/Events/canplaythrough
            // https://github.com/goldfire/howler.js/blob/1dad25cdd9d6982232050454e8b45411902efe65/howler.js#L372
            // https://github.com/CreateJS/SoundJS/blob/e2d4842a84ff425ada861edb9f6e9b57f63d7caf/src/soundjs/htmlaudio/HTMLAudioSoundInstance.js#L145-145
            /* eslint-enable max-len */
            audio.addEventListener("canplaythrough", handlers.success, false);
        }
        if (handlers.error) {
            // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events
            // stalledはfetchして取れなかった時に起きるイベント
            audio.addEventListener("stalled", handlers.error, false);
            audio.addEventListener("error", handlers.error, false);
            audio.addEventListener("abort", handlers.error, false);
        }
    };
    HTMLAudioAsset.prototype._detachAll = function (audio, handlers) {
        if (handlers.success) {
            audio.removeEventListener("canplaythrough", handlers.success, false);
        }
        if (handlers.error) {
            audio.removeEventListener("stalled", handlers.error, false);
            audio.removeEventListener("error", handlers.error, false);
            audio.removeEventListener("abort", handlers.error, false);
        }
    };
    return HTMLAudioAsset;
}(AudioAsset_1.AudioAsset));
exports.HTMLAudioAsset = HTMLAudioAsset;

},{"../../asset/AudioAsset":125,"../../utils/ExceptionFactory":161,"../audioUtil":160}],149:[function(require,module,exports){
"use strict";
/// chrome66以降などのブラウザに導入されるAutoplay Policyに対応する
// https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChromeMEIWorkaround = void 0;
var state = 0 /* PlayableState.Unknown */;
var suspendedAudioElements = [];
function setupChromeMEIWorkaround(audio) {
    // TODO 短時間 (e.g. 同期的) に複数呼ばれると timer が上書きされそう
    var timer = null;
    function playHandler() {
        switch (state) {
            case 0 /* PlayableState.Unknown */:
            case 1 /* PlayableState.WaitingInteraction */: // 通常のケースではここには到達しないが、何らかの外因によって音を鳴らすことができた場合
                playSuspendedAudioElements();
                break;
            case 2 /* PlayableState.Ready */:
                break;
            default:
            // do nothing
        }
        state = 2 /* PlayableState.Ready */;
        clearTimeout(timer);
    }
    function suspendedHandler() {
        audio.removeEventListener("play", playHandler);
        switch (state) {
            case 0 /* PlayableState.Unknown */:
                suspendedAudioElements.push(audio);
                state = 1 /* PlayableState.WaitingInteraction */;
                setUserInteractListener();
                break;
            case 1 /* PlayableState.WaitingInteraction */:
                suspendedAudioElements.push(audio);
                break;
            case 2 /* PlayableState.Ready */:
                audio.play(); // suspendedHandler が呼ばれるまでに音が鳴らせるようになった場合
                break;
            default:
            // do nothing;
        }
    }
    switch (state) {
        case 0 /* PlayableState.Unknown */:
            audio.addEventListener("play", playHandler, true);
            timer = window.setTimeout(suspendedHandler, 100); // 明確な根拠はないが100msec待ってもplayされなければ再生できないと判断する
            break;
        case 1 /* PlayableState.WaitingInteraction */:
            suspendedAudioElements.push(audio);
            break;
        case 2 /* PlayableState.Ready */:
            break;
        default:
        // do nothing
    }
}
exports.setupChromeMEIWorkaround = setupChromeMEIWorkaround;
function resumeHandler() {
    playSuspendedAudioElements();
    clearUserInteractListener();
}
function setUserInteractListener() {
    document.addEventListener("keydown", resumeHandler, true);
    document.addEventListener("mousedown", resumeHandler, true);
    document.addEventListener("touchend", resumeHandler, true);
}
function clearUserInteractListener() {
    document.removeEventListener("keydown", resumeHandler);
    document.removeEventListener("mousedown", resumeHandler);
    document.removeEventListener("touchend", resumeHandler);
}
function playSuspendedAudioElements() {
    state = 2 /* PlayableState.Ready */;
    suspendedAudioElements.forEach(function (audio) { return audio.play(); });
    suspendedAudioElements = [];
}

},{}],150:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLAudioPlayer = void 0;
var AudioPlayer_1 = require("../AudioPlayer");
var HTMLAudioAutoplayHelper_1 = require("./HTMLAudioAutoplayHelper");
var HTMLAudioPlayer = /** @class */ (function (_super) {
    __extends(HTMLAudioPlayer, _super);
    function HTMLAudioPlayer(system, manager) {
        var _this = _super.call(this, system) || this;
        _this._audioInstance = null;
        _this._isWaitingPlayEvent = false;
        _this._isStopRequested = false;
        _this._manager = manager;
        _this._endedEventHandler = function () {
            _this._onAudioEnded();
        };
        _this._onPlayEventHandler = function () {
            _this._onPlayEvent();
        };
        _this._dummyDurationWaitTimer = null;
        return _this;
    }
    HTMLAudioPlayer.prototype.play = function (asset) {
        var _a;
        if (this.currentAudio) {
            this.stop();
        }
        var audio = asset.cloneElement();
        if (audio) {
            if (asset.offset === undefined) {
                // offsetが指定されていない場合、durationを無視して全体再生する
                audio.loop = asset.loop;
            }
            else {
                var offsetSec_1 = ((_a = asset.offset) !== null && _a !== void 0 ? _a : 0) / 1000;
                var durationEndSec_1 = asset.duration / 1000 + offsetSec_1;
                audio.currentTime = offsetSec_1;
                audio.ontimeupdate = function () {
                    if (durationEndSec_1 <= audio.currentTime) {
                        if (asset.loop) {
                            audio.currentTime = offsetSec_1;
                        }
                        else {
                            audio.pause();
                        }
                    }
                };
                audio.onended = function () {
                    if (asset.loop) {
                        audio.currentTime = offsetSec_1;
                        audio.play();
                    }
                };
            }
            (0, HTMLAudioAutoplayHelper_1.setupChromeMEIWorkaround)(audio);
            audio.volume = this._calculateVolume();
            audio.play().catch(function (_err) { });
            audio.addEventListener("ended", this._endedEventHandler, false);
            audio.addEventListener("play", this._onPlayEventHandler, false);
            this._isWaitingPlayEvent = true;
            this._audioInstance = audio;
        }
        else {
            // 再生できるオーディオがない場合。duration後に停止処理だけ行う(処理のみ進め音は鳴らさない)
            this._dummyDurationWaitTimer = setTimeout(this._endedEventHandler, asset.duration);
        }
        _super.prototype.play.call(this, asset);
    };
    HTMLAudioPlayer.prototype.stop = function () {
        if (!this.currentAudio) {
            _super.prototype.stop.call(this);
            return;
        }
        this._clearEndedEventHandler();
        if (this._audioInstance) {
            if (!this._isWaitingPlayEvent) {
                // _audioInstance が再び play されることは無いので、 removeEventListener("play") する必要は無い
                this._audioInstance.pause();
                this._audioInstance = null;
            }
            else {
                this._isStopRequested = true;
            }
        }
        _super.prototype.stop.call(this);
    };
    HTMLAudioPlayer.prototype.changeVolume = function (volume) {
        _super.prototype.changeVolume.call(this, volume);
        if (this._audioInstance) {
            this._audioInstance.volume = this._calculateVolume();
        }
    };
    HTMLAudioPlayer.prototype._changeMuted = function (muted) {
        _super.prototype._changeMuted.call(this, muted);
        if (this._audioInstance) {
            this._audioInstance.volume = this._calculateVolume();
        }
    };
    HTMLAudioPlayer.prototype.notifyMasterVolumeChanged = function () {
        if (this._audioInstance) {
            this._audioInstance.volume = this._calculateVolume();
        }
    };
    HTMLAudioPlayer.prototype._onAudioEnded = function () {
        this._clearEndedEventHandler();
        _super.prototype.stop.call(this);
    };
    HTMLAudioPlayer.prototype._clearEndedEventHandler = function () {
        if (this._audioInstance)
            this._audioInstance.removeEventListener("ended", this._endedEventHandler, false);
        if (this._dummyDurationWaitTimer != null) {
            clearTimeout(this._dummyDurationWaitTimer);
            this._dummyDurationWaitTimer = null;
        }
    };
    // audio.play() は非同期なので、 play が開始される前に stop を呼ばれた場合はこのハンドラ到達時に停止する
    HTMLAudioPlayer.prototype._onPlayEvent = function () {
        var _a;
        if (!this._isWaitingPlayEvent)
            return;
        this._isWaitingPlayEvent = false;
        if (this._isStopRequested) {
            this._isStopRequested = false;
            // _audioInstance が再び play されることは無いので、 removeEventListener("play") する必要は無い
            (_a = this._audioInstance) === null || _a === void 0 ? void 0 : _a.pause();
            this._audioInstance = null;
        }
    };
    HTMLAudioPlayer.prototype._calculateVolume = function () {
        return this._system._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
    };
    return HTMLAudioPlayer;
}(AudioPlayer_1.AudioPlayer));
exports.HTMLAudioPlayer = HTMLAudioPlayer;

},{"../AudioPlayer":145,"./HTMLAudioAutoplayHelper":149}],151:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLAudioPlugin = void 0;
var audioUtil_1 = require("../audioUtil");
var HTMLAudioAsset_1 = require("./HTMLAudioAsset");
var HTMLAudioPlayer_1 = require("./HTMLAudioPlayer");
var HTMLAudioPlugin = /** @class */ (function () {
    function HTMLAudioPlugin() {
        this._supportedFormats = [];
        this.supportedFormats = (0, audioUtil_1.detectSupportedFormats)();
    }
    // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio.js
    // https://github.com/CreateJS/SoundJS/blob/master/src/soundjs/htmlaudio/HTMLAudioPlugin.js
    HTMLAudioPlugin.isSupported = function () {
        // Audio要素を実際に作って、canPlayTypeが存在するかで確認する
        var audioElement = document.createElement("audio");
        var result = false;
        try {
            result = (audioElement.canPlayType !== undefined);
        }
        catch (e) {
            // ignore Error
        }
        return result;
    };
    Object.defineProperty(HTMLAudioPlugin.prototype, "supportedFormats", {
        get: function () {
            return this._supportedFormats;
        },
        set: function (supportedFormats) {
            this._supportedFormats = supportedFormats;
            HTMLAudioAsset_1.HTMLAudioAsset.supportedFormats = supportedFormats;
        },
        enumerable: false,
        configurable: true
    });
    HTMLAudioPlugin.prototype.createAsset = function (id, path, duration, system, loop, hint, offset) {
        return new HTMLAudioAsset_1.HTMLAudioAsset(id, path, duration, system, loop, hint, offset);
    };
    HTMLAudioPlugin.prototype.createPlayer = function (system, manager) {
        return new HTMLAudioPlayer_1.HTMLAudioPlayer(system, manager);
    };
    return HTMLAudioPlugin;
}());
exports.HTMLAudioPlugin = HTMLAudioPlugin;

},{"../audioUtil":160,"./HTMLAudioAsset":148,"./HTMLAudioPlayer":150}],152:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyAudioAsset = void 0;
var AudioAsset_1 = require("../../asset/AudioAsset");
var ExceptionFactory_1 = require("../../utils/ExceptionFactory");
var ProxyAudioAsset = /** @class */ (function (_super) {
    __extends(ProxyAudioAsset, _super);
    function ProxyAudioAsset(handlerSet, id, assetPath, duration, system, loop, hint, offset) {
        var _this = _super.call(this, id, assetPath, duration, system, loop, hint, offset) || this;
        _this._handlerSet = handlerSet;
        return _this;
    }
    ProxyAudioAsset.prototype.destroy = function () {
        this._handlerSet.unloadAudioAsset(this.id);
        _super.prototype.destroy.call(this);
    };
    ProxyAudioAsset.prototype._load = function (loader) {
        var _this = this;
        this._handlerSet.loadAudioAsset({
            id: this.id,
            assetPath: this.path,
            duration: this.duration,
            loop: this.loop,
            hint: this.hint,
            offset: this.offset
        }, function (err) {
            if (err) {
                loader._onAssetError(_this, ExceptionFactory_1.ExceptionFactory.createAssetLoadError(err));
            }
            else {
                loader._onAssetLoad(_this);
            }
        });
    };
    ProxyAudioAsset.prototype._assetPathFilter = function (path) {
        return path;
    };
    ProxyAudioAsset.prototype._modifyPath = function (path) {
        return path;
    };
    return ProxyAudioAsset;
}(AudioAsset_1.AudioAsset));
exports.ProxyAudioAsset = ProxyAudioAsset;

},{"../../asset/AudioAsset":125,"../../utils/ExceptionFactory":161}],153:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyAudioPlayer = void 0;
var AudioPlayer_1 = require("../AudioPlayer");
var ProxyAudioPlayer = exports.ProxyAudioPlayer = /** @class */ (function (_super) {
    __extends(ProxyAudioPlayer, _super);
    function ProxyAudioPlayer(handlerSet, system, manager) {
        var _this = _super.call(this, system) || this;
        _this._audioPlayerId = null;
        _this._handlerSet = handlerSet;
        _this._manager = manager;
        return _this;
    }
    ProxyAudioPlayer.prototype.changeVolume = function (volume) {
        _super.prototype.changeVolume.call(this, volume);
        this._notifyVolumeToHandler();
    };
    ProxyAudioPlayer.prototype._changeMuted = function (muted) {
        _super.prototype._changeMuted.call(this, muted);
        this._notifyVolumeToHandler();
    };
    ProxyAudioPlayer.prototype.play = function (asset) {
        if (this._audioPlayerId != null) {
            this.stop();
        }
        this._audioPlayerId = "ap".concat(ProxyAudioPlayer._audioPlayerIdCounter++);
        this._handlerSet.createAudioPlayer({
            assetId: asset.id,
            audioPlayerId: this._audioPlayerId,
            isPlaying: true,
            volume: this._calculateVolume(),
            playbackRate: 1 // 未使用
        });
        _super.prototype.play.call(this, asset);
    };
    ProxyAudioPlayer.prototype.stop = function () {
        if (this._audioPlayerId != null) {
            this._handlerSet.stopAudioPlayer(this._audioPlayerId);
            this._handlerSet.destroyAudioPlayer(this._audioPlayerId);
            this._audioPlayerId = null;
        }
        _super.prototype.stop.call(this);
    };
    ProxyAudioPlayer.prototype.notifyMasterVolumeChanged = function () {
        this._notifyVolumeToHandler();
    };
    ProxyAudioPlayer.prototype._notifyVolumeToHandler = function () {
        if (this._audioPlayerId != null) {
            this._handlerSet.changeAudioVolume(this._audioPlayerId, this._calculateVolume());
        }
    };
    ProxyAudioPlayer.prototype._calculateVolume = function () {
        return this._system._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
    };
    ProxyAudioPlayer._audioPlayerIdCounter = 0;
    return ProxyAudioPlayer;
}(AudioPlayer_1.AudioPlayer));

},{"../AudioPlayer":145}],154:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyAudioPlugin = void 0;
var ProxyAudioAsset_1 = require("./ProxyAudioAsset");
var ProxyAudioPlayer_1 = require("./ProxyAudioPlayer");
var ProxyAudioPlugin = /** @class */ (function () {
    function ProxyAudioPlugin(handlerSet) {
        this.supportedFormats = [];
        this._handlerSet = handlerSet;
    }
    ProxyAudioPlugin.isSupported = function () {
        return true;
    };
    ProxyAudioPlugin.prototype.createAsset = function (id, assetPath, duration, system, loop, hint, offset) {
        return new ProxyAudioAsset_1.ProxyAudioAsset(this._handlerSet, id, assetPath, duration, system, loop, hint, offset);
    };
    ProxyAudioPlugin.prototype.createPlayer = function (system, manager) {
        return new ProxyAudioPlayer_1.ProxyAudioPlayer(this._handlerSet, system, manager);
    };
    return ProxyAudioPlugin;
}());
exports.ProxyAudioPlugin = ProxyAudioPlugin;

},{"./ProxyAudioAsset":152,"./ProxyAudioPlayer":153}],155:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAudioAsset = void 0;
var AudioAsset_1 = require("../../asset/AudioAsset");
var ExceptionFactory_1 = require("../../utils/ExceptionFactory");
var XHRLoader_1 = require("../../utils/XHRLoader");
var audioUtil_1 = require("../audioUtil");
var helper = require("./WebAudioHelper");
var WebAudioAsset = exports.WebAudioAsset = /** @class */ (function (_super) {
    __extends(WebAudioAsset, _super);
    function WebAudioAsset() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WebAudioAsset.prototype._load = function (loader) {
        var _this = this;
        if (this.path == null) {
            // 再生可能な形式がない。実際には鳴らない音声としてロード成功しておく
            this.data = null;
            setTimeout(function () { return loader._onAssetLoad(_this); }, 0);
            return;
        }
        var successHandler = function (decodedAudio) {
            _this.data = decodedAudio;
            loader._onAssetLoad(_this);
        };
        var errorHandler = function () {
            loader._onAssetError(_this, ExceptionFactory_1.ExceptionFactory.createAssetLoadError("WebAudioAsset unknown loading error"));
        };
        var onLoadArrayBufferHandler = function (response) {
            var audioContext = helper.getAudioContext();
            audioContext.decodeAudioData(response, successHandler, errorHandler);
        };
        var xhrLoader = new XHRLoader_1.XHRLoader();
        var loadArrayBuffer = function (path, onSuccess, onFailed) {
            xhrLoader.getArrayBuffer(path, function (error, response) {
                if (error) {
                    onFailed(error);
                }
                else {
                    onSuccess(response);
                }
            });
        };
        var delIndex = this.path.indexOf("?");
        var basePath = delIndex >= 0 ? this.path.substring(0, delIndex) : this.path;
        if (basePath.slice(-4) === ".aac") {
            // 暫定対応：後方互換性のため、aacファイルが無い場合はmp4へのフォールバックを試みる。
            // この対応を止める際には、WebAudioPluginのsupportedExtensionsからaacを除外する必要がある。
            loadArrayBuffer(this.path, onLoadArrayBufferHandler, function (_error) {
                var altPath = (0, audioUtil_1.addExtname)(_this.originalPath, ".mp4");
                loadArrayBuffer(altPath, function (response) {
                    _this.path = altPath;
                    onLoadArrayBufferHandler(response);
                }, errorHandler);
            });
            return;
        }
        loadArrayBuffer(this.path, onLoadArrayBufferHandler, errorHandler);
    };
    WebAudioAsset.prototype._assetPathFilter = function (path) {
        if (WebAudioAsset.supportedFormats.indexOf("ogg") !== -1) {
            return (0, audioUtil_1.addExtname)(path, ".ogg");
        }
        if (WebAudioAsset.supportedFormats.indexOf("aac") !== -1) {
            return (0, audioUtil_1.addExtname)(path, ".aac");
        }
        // ここで検出されるのは最初にアクセスを試みるオーディオアセットのファイルパスなので、
        // supportedFormatsに(後方互換性保持で使う可能性がある)mp4が含まれていても利用しない
        // TODO: _assetPathFilter() における戻り値 `null` の扱い
        return null;
    };
    WebAudioAsset.prototype._modifyPath = function (path) {
        var _a;
        var ext = (0, audioUtil_1.resolveExtname)((_a = this.hint) === null || _a === void 0 ? void 0 : _a.extensions, WebAudioAsset.supportedFormats);
        return ext ? (0, audioUtil_1.addExtname)(this.originalPath, ext) : path;
    };
    // _assetPathFilterの判定処理を小さくするため、予めサポートしてる拡張子一覧を持つ
    WebAudioAsset.supportedFormats = [];
    return WebAudioAsset;
}(AudioAsset_1.AudioAsset));

},{"../../asset/AudioAsset":125,"../../utils/ExceptionFactory":161,"../../utils/XHRLoader":162,"../audioUtil":160,"./WebAudioHelper":157}],156:[function(require,module,exports){
"use strict";
var helper = require("./WebAudioHelper");
// chrome66以降などのブラウザに導入されるAutoplay Policyに対応する
// https://developers.google.com/web/updates/2017/09/autoplay-policy-changes
var WebAudioAutoplayHelper;
(function (WebAudioAutoplayHelper) {
    function setupChromeMEIWorkaround() {
        var context = helper.getAudioContext();
        if (context && typeof context.resume !== "function")
            return;
        var gain = helper.createGainNode(context);
        // テスト用の音源を用意する
        var osc = context.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = 440; // 何でも良いがドの音
        osc.connect(gain);
        osc.start(0);
        var contextState = context.state;
        osc.disconnect();
        if (contextState !== "running")
            setUserInteractListener();
    }
    WebAudioAutoplayHelper.setupChromeMEIWorkaround = setupChromeMEIWorkaround;
})(WebAudioAutoplayHelper || (WebAudioAutoplayHelper = {}));
function resumeHandler() {
    var context = helper.getAudioContext();
    context.resume();
    clearUserInteractListener();
}
function setUserInteractListener() {
    document.addEventListener("keydown", resumeHandler, true);
    document.addEventListener("mousedown", resumeHandler, true);
    document.addEventListener("touchend", resumeHandler, true);
}
function clearUserInteractListener() {
    document.removeEventListener("keydown", resumeHandler);
    document.removeEventListener("mousedown", resumeHandler);
    document.removeEventListener("touchend", resumeHandler);
}
module.exports = WebAudioAutoplayHelper;

},{"./WebAudioHelper":157}],157:[function(require,module,exports){
"use strict";
// WebAudioのブラウザ間の差を吸収する
// Compatible Table: http://compatibility.shwups-cms.ch/en/home?&property=AudioParam.prototype
// http://qiita.com/mohayonao/items/d79e9fc56b4e9c157be1#polyfill
// https://github.com/cwilso/webkitAudioContext-MonkeyPatch
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Porting_webkitAudioContext_code_to_standards_based_AudioContext
// eslint-disable-next-line @typescript-eslint/naming-convention
var AudioContext = window.AudioContext || window.webkitAudioContext;
var WebAudioHelper;
(function (WebAudioHelper) {
    // AudioContextをシングルトンとして取得する
    // 一つのページに一つのContextが存在すれば良い
    function getAudioContext() {
        if (!window.__akashic__) {
            Object.defineProperty(window, "__akashic__", {
                value: {},
                enumerable: false,
                configurable: false,
                writable: false
            });
        }
        var ctx = window.__akashic__.audioContext;
        if (!(ctx instanceof AudioContext)) {
            ctx = window.__akashic__.audioContext = new AudioContext();
            WebAudioHelper._workAroundSafari();
        }
        return ctx;
    }
    WebAudioHelper.getAudioContext = getAudioContext;
    function createGainNode(context) {
        if (context.createGain) {
            return context.createGain();
        }
        return context.createGainNode();
    }
    WebAudioHelper.createGainNode = createGainNode;
    function createBufferNode(context) {
        var sourceNode = context.createBufferSource();
        // @ts-ignore startがあるなら問題ないので、拡張しないで返す
        if (sourceNode.start) {
            return sourceNode;
        }
        // start/stopがない環境へのエイリアスを貼る
        sourceNode.start = sourceNode.noteOn;
        sourceNode.stop = sourceNode.noteOff;
        return sourceNode;
    }
    WebAudioHelper.createBufferNode = createBufferNode;
    // Safari対策ワークアラウンド
    function _workAroundSafari() {
        document.addEventListener("touchstart", function touchInitializeHandler() {
            document.removeEventListener("touchstart", touchInitializeHandler);
            WebAudioHelper.getAudioContext().createBufferSource().start(0);
        }, true);
    }
    WebAudioHelper._workAroundSafari = _workAroundSafari;
})(WebAudioHelper || (WebAudioHelper = {}));
module.exports = WebAudioHelper;

},{}],158:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAudioPlayer = void 0;
var AudioPlayer_1 = require("../AudioPlayer");
var helper = require("./WebAudioHelper");
var WebAudioPlayer = /** @class */ (function (_super) {
    __extends(WebAudioPlayer, _super);
    function WebAudioPlayer(system, manager) {
        var _this = _super.call(this, system) || this;
        _this._audioContext = helper.getAudioContext();
        _this._manager = manager;
        _this._gainNode = helper.createGainNode(_this._audioContext);
        _this._gainNode.connect(_this._audioContext.destination);
        _this._dummyDurationWaitTimer = null;
        _this._endedEventHandler = function () {
            _this._onAudioEnded();
        };
        return _this;
    }
    WebAudioPlayer.prototype.changeVolume = function (volume) {
        _super.prototype.changeVolume.call(this, volume);
        this._gainNode.gain.value = this._calculateVolume();
    };
    WebAudioPlayer.prototype._changeMuted = function (muted) {
        _super.prototype._changeMuted.call(this, muted);
        this._gainNode.gain.value = this._calculateVolume();
    };
    WebAudioPlayer.prototype.play = function (asset) {
        var _a;
        if (this.currentAudio) {
            this.stop();
        }
        if (asset.data) {
            var bufferNode = helper.createBufferNode(this._audioContext);
            bufferNode.buffer = asset.data;
            this._gainNode.gain.value = this._calculateVolume();
            bufferNode.connect(this._gainNode);
            this._sourceNode = bufferNode;
            // Chromeだとevent listerで指定した場合に動かないことがある
            // https://github.com/mozilla-appmaker/appmaker/issues/1984
            this._sourceNode.onended = this._endedEventHandler;
            // loop時にoffsetを指定すると正しく動作しないことがあるため、暫定対応としてloopが真の場合はoffsetを指定しない
            if (asset.loop) {
                bufferNode.loop = asset.loop;
                this._sourceNode.start(0);
            }
            else {
                var offset = ((_a = asset.offset) !== null && _a !== void 0 ? _a : 0) / 1000;
                if (asset.duration > 0) {
                    this._sourceNode.start(0, offset, asset.duration / 1000);
                }
                else {
                    this._sourceNode.start(0, offset);
                }
            }
        }
        else {
            // 再生できるオーディオがない場合。duration後に停止処理だけ行う(処理のみ進め音は鳴らさない)
            this._dummyDurationWaitTimer = setTimeout(this._endedEventHandler, asset.duration);
        }
        _super.prototype.play.call(this, asset);
    };
    WebAudioPlayer.prototype.stop = function () {
        if (!this.currentAudio) {
            _super.prototype.stop.call(this);
            return;
        }
        this._clearEndedEventHandler();
        if (this._sourceNode)
            this._sourceNode.stop(0);
        _super.prototype.stop.call(this);
    };
    WebAudioPlayer.prototype.notifyMasterVolumeChanged = function () {
        this._gainNode.gain.value = this._calculateVolume();
    };
    WebAudioPlayer.prototype._onAudioEnded = function () {
        this._clearEndedEventHandler();
        _super.prototype.stop.call(this);
    };
    WebAudioPlayer.prototype._clearEndedEventHandler = function () {
        if (this._sourceNode)
            this._sourceNode.onended = null;
        if (this._dummyDurationWaitTimer != null) {
            clearTimeout(this._dummyDurationWaitTimer);
            this._dummyDurationWaitTimer = null;
        }
    };
    WebAudioPlayer.prototype._calculateVolume = function () {
        return this._system._muted ? 0 : this.volume * this._system.volume * this._manager.getMasterVolume();
    };
    return WebAudioPlayer;
}(AudioPlayer_1.AudioPlayer));
exports.WebAudioPlayer = WebAudioPlayer;

},{"../AudioPlayer":145,"./WebAudioHelper":157}],159:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAudioPlugin = void 0;
var audioUtil_1 = require("../audioUtil");
var WebAudioAsset_1 = require("./WebAudioAsset");
var autoPlayHelper = require("./WebAudioAutoplayHelper");
var WebAudioPlayer_1 = require("./WebAudioPlayer");
var WebAudioPlugin = /** @class */ (function () {
    function WebAudioPlugin() {
        this._supportedFormats = [];
        this.supportedFormats = (0, audioUtil_1.detectSupportedFormats)();
        autoPlayHelper.setupChromeMEIWorkaround();
    }
    // AudioContextが存在するかどうかで判定する
    // http://mohayonao.hatenablog.com/entry/2012/12/12/103009
    // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/audio/webaudio.js
    WebAudioPlugin.isSupported = function () {
        if ("AudioContext" in window) {
            return true;
        }
        else if ("webkitAudioContext" in window) {
            return true;
        }
        return false;
    };
    Object.defineProperty(WebAudioPlugin.prototype, "supportedFormats", {
        get: function () {
            return this._supportedFormats;
        },
        set: function (supportedFormats) {
            this._supportedFormats = supportedFormats;
            WebAudioAsset_1.WebAudioAsset.supportedFormats = supportedFormats;
        },
        enumerable: false,
        configurable: true
    });
    WebAudioPlugin.prototype.createAsset = function (id, assetPath, duration, system, loop, hint, offset) {
        return new WebAudioAsset_1.WebAudioAsset(id, assetPath, duration, system, loop, hint, offset);
    };
    WebAudioPlugin.prototype.createPlayer = function (system, manager) {
        return new WebAudioPlayer_1.WebAudioPlayer(system, manager);
    };
    return WebAudioPlugin;
}());
exports.WebAudioPlugin = WebAudioPlugin;

},{"../audioUtil":160,"./WebAudioAsset":155,"./WebAudioAutoplayHelper":156,"./WebAudioPlayer":158}],160:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExtname = exports.resolveExtname = exports.detectSupportedFormats = void 0;
/**
 * Audio 要素で再生できる形式を検出する。
 * @returns 再生できる形式の配列
 */
function detectSupportedFormats() {
    var _a;
    // Edgeは再生できるファイル形式とcanPlayTypeの結果が一致しないため、固定でAACを利用する
    if (navigator.userAgent.indexOf("Edge/") !== -1)
        return ["aac"];
    // Audio要素を実際に作って、canPlayTypeで再生できるかを判定する
    var audioElement = document.createElement("audio");
    var formats = ["ogg", "m4a", "aac", "mp4"]; // 順番重要: この順で優先的に使うことに注意 (ref. resolveExtName())
    var mimeTable = { "m4a": "audio/x-m4a" };
    var supportedFormats = [];
    for (var i = 0, len = formats.length; i < len; i++) {
        var format = formats[i];
        var mimeType = (_a = mimeTable[format]) !== null && _a !== void 0 ? _a : ("audio/" + format);
        try {
            var canPlay = audioElement.canPlayType(mimeType);
            if (canPlay !== "no" && canPlay !== "") {
                supportedFormats.push(format);
            }
        }
        catch (_e) {
            // do nothing: just skip
        }
    }
    return supportedFormats;
}
exports.detectSupportedFormats = detectSupportedFormats;
/**
 * 拡張子の配列から、再生可能な形式に合致するものを探す。
 * @param extensions 拡張子の配列または null | undefined (空配列と見なす)
 * @param supportedFormats 再生可能な形式。detectSupportedFormats() の戻り値を期待する
 * @returns 再生可能な形式の拡張子。なければ null
 */
function resolveExtname(extensions, supportedFormats) {
    if (!extensions || !extensions.length)
        return null;
    for (var _i = 0, supportedFormats_1 = supportedFormats; _i < supportedFormats_1.length; _i++) {
        var fmt = supportedFormats_1[_i];
        var ext = "." + fmt;
        if (extensions.indexOf(ext) !== -1)
            return ext;
    }
    return null;
}
exports.resolveExtname = resolveExtname;
/**
 * 与えられたパス文字列に与えられた拡張子を追加する。
 * @param path パス文字列
 * @param ext 追加する拡張子 ("." を含む)
 */
function addExtname(path, ext) {
    var index = path.indexOf("?");
    if (index === -1) {
        return path + ext;
    }
    // hoge?query => hoge.ext?query
    return path.substring(0, index) + ext + path.substring(index, path.length);
}
exports.addExtname = addExtname;

},{}],161:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionFactory = void 0;
var ExceptionFactory;
(function (ExceptionFactory) {
    function createAssetLoadError(message, retriable, cause) {
        if (retriable === void 0) { retriable = true; }
        return {
            name: "AssetLoadError",
            message: message,
            retriable: retriable,
            cause: cause
        };
    }
    ExceptionFactory.createAssetLoadError = createAssetLoadError;
})(ExceptionFactory = exports.ExceptionFactory || (exports.ExceptionFactory = {}));

},{}],162:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XHRLoader = void 0;
var ExceptionFactory_1 = require("./ExceptionFactory");
var XHRLoader = /** @class */ (function () {
    function XHRLoader(options) {
        if (options === void 0) { options = {}; }
        // デフォルトのタイムアウトは15秒
        // TODO: タイムアウト値はこれが妥当であるか後日詳細を検討する
        this.timeout = options.timeout || 15000;
    }
    XHRLoader.prototype.get = function (url, callback) {
        this._getRequestObject({
            url: url,
            responseType: "text"
        }, callback);
    };
    XHRLoader.prototype.getArrayBuffer = function (url, callback) {
        this._getRequestObject({
            url: url,
            responseType: "arraybuffer"
        }, callback);
    };
    XHRLoader.prototype._getRequestObject = function (requestObject, callback) {
        var request = new XMLHttpRequest();
        request.open("GET", requestObject.url, true);
        request.responseType = requestObject.responseType;
        request.timeout = this.timeout;
        request.addEventListener("timeout", function () {
            callback(ExceptionFactory_1.ExceptionFactory.createAssetLoadError("loading timeout"));
        }, false);
        request.addEventListener("load", function () {
            if (request.status >= 200 && request.status < 300) {
                // "text" とそれ以外で取得方法を分類する
                var response = requestObject.responseType === "text" ? request.responseText : request.response;
                callback(null, response);
            }
            else {
                callback(ExceptionFactory_1.ExceptionFactory.createAssetLoadError("loading error. status: " + request.status));
            }
        }, false);
        request.addEventListener("error", function () {
            callback(ExceptionFactory_1.ExceptionFactory.createAssetLoadError("loading error. status: " + request.status));
        }, false);
        request.send();
    };
    return XHRLoader;
}());
exports.XHRLoader = XHRLoader;

},{"./ExceptionFactory":161}],163:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
var trigger_1 = require("@akashic/trigger");
/**
 * 各種リソースを表すクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 */
var Asset = /** @class */ (function () {
    function Asset(id, path) {
        this.id = id;
        this.originalPath = path;
        this.path = this._assetPathFilter(path);
        this.onDestroyed = new trigger_1.Trigger();
    }
    Asset.prototype.destroy = function () {
        this.onDestroyed.fire(this);
        this.id = undefined;
        this.originalPath = undefined;
        this.path = undefined;
        this.onDestroyed.destroy();
        this.onDestroyed = undefined;
    };
    Asset.prototype.destroyed = function () {
        return this.id === undefined;
    };
    /**
     * 現在利用中で解放出来ない `Asset` かどうかを返す。
     * 戻り値は、利用中である場合真、でなければ偽である。
     *
     * 本メソッドは通常 `false` が返るべきである。
     * 例えば `Sprite` の元画像として使われているケース等では、その `Sprite` によって `Asset` は `Surface` に変換されているべきで、
     * `Asset` が利用中で解放出来ない状態になっていない事を各プラットフォームで保障する必要がある。
     *
     * 唯一、例外的に本メソッドが `true` を返すことがあるのは音楽を表す `Asset` である。
     * BGM等はシーンをまたいで演奏することもありえる上、
     * 演奏中のリソースのコピーを常に各プラットフォームに強制するにはコストがかかりすぎるため、
     * 本メソッドは `true` を返し、適切なタイミングで `Asset` が解放されるよう制御する必要がある。
     */
    Asset.prototype.inUse = function () {
        return false;
    };
    /**
     * @private
     */
    Asset.prototype._assetPathFilter = function (path) {
        // 拡張子の補完・読み替えが必要なassetはこれをオーバーライドすればよい。(対応形式が限定されるaudioなどの場合)
        return path;
    };
    return Asset;
}());
exports.Asset = Asset;

},{"@akashic/trigger":213}],164:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioAsset = void 0;
var Asset_1 = require("./Asset");
/**
 * 音リソースを表すクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 *
 * AudioAsset#playを呼び出す事で、その音を再生することが出来る。
 */
var AudioAsset = /** @class */ (function (_super) {
    __extends(AudioAsset, _super);
    function AudioAsset(id, assetPath, duration, system, loop, hint, offset) {
        var _this = _super.call(this, id, assetPath) || this;
        _this.type = "audio";
        _this.duration = duration;
        _this.loop = loop;
        _this.hint = hint;
        _this._system = system;
        _this.data = undefined;
        _this.offset = offset;
        return _this;
    }
    AudioAsset.prototype.play = function () {
        var player = this._system.createPlayer();
        player.play(this);
        this._lastPlayedPlayer = player;
        return player;
    };
    AudioAsset.prototype.stop = function () {
        var players = this._system.findPlayers(this);
        for (var i = 0; i < players.length; ++i)
            players[i].stop();
    };
    AudioAsset.prototype.inUse = function () {
        return this._system.findPlayers(this).length > 0;
    };
    AudioAsset.prototype.destroy = function () {
        if (this._system)
            this.stop();
        this.data = undefined;
        this._system = undefined;
        this._lastPlayedPlayer = undefined;
        _super.prototype.destroy.call(this);
    };
    return AudioAsset;
}(Asset_1.Asset));
exports.AudioAsset = AudioAsset;

},{"./Asset":163}],165:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPlayer = void 0;
var trigger_1 = require("@akashic/trigger");
/**
 * サウンド再生を行うクラス。
 *
 * 本クラスのインスタンスは、 `AudioSystem#createPlayer()` によって明示的に、
 * または `AudioAsset#play()` によって暗黙的に生成される。
 * ゲーム開発者は本クラスのインスタンスを直接生成すべきではない。
 */
var AudioPlayer = /** @class */ (function () {
    /**
     * `AudioPlayer` のインスタンスを生成する。
     */
    function AudioPlayer(system) {
        this.onPlay = new trigger_1.Trigger();
        this.onStop = new trigger_1.Trigger();
        this.played = this.onPlay;
        this.stopped = this.onStop;
        this.currentAudio = undefined;
        this.volume = system.volume;
        this._muted = system._muted;
        this._system = system;
    }
    /**
     * `AudioAsset` を再生する。
     *
     * 再生後、 `this.onPlay` がfireされる。
     * @param audio 再生するオーディオアセット
     */
    AudioPlayer.prototype.play = function (audio) {
        this.currentAudio = audio;
        this.onPlay.fire({
            player: this,
            audio: audio
        });
    };
    /**
     * 再生を停止する。
     *
     * 停止後、 `this.onStop` がfireされる。
     * 再生中でない場合、何もしない(`onStop` もfireされない)。
     */
    AudioPlayer.prototype.stop = function () {
        var audio = this.currentAudio;
        if (!audio)
            return;
        this.currentAudio = undefined;
        this.onStop.fire({
            player: this,
            audio: audio
        });
    };
    /**
     * 音声の終了を検知できるか否か。
     * 通常、ゲーム開発者がこのメソッドを利用する必要はない。
     */
    AudioPlayer.prototype.canHandleStopped = function () {
        return true;
    };
    /**
     * 音量を変更する。
     *
     * @param volume 音量。0以上1.0以下でなければならない
     */
    // エンジンユーザが `AudioPlayer` の派生クラスを実装する場合は、
    // `_changeMuted()` などと同様、このメソッドをオーバーライドして実際に音量を変更する処理を行うこと。
    // オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
    AudioPlayer.prototype.changeVolume = function (volume) {
        this.volume = volume;
    };
    /**
     * ミュート状態を変更する。
     *
     * エンジンユーザが `AudioPlayer` の派生クラスを実装する場合は、
     * このメソッドをオーバーライドして実際にミュート状態を変更する処理を行うこと。
     * オーバーライド先のメソッドはこのメソッドを呼びださなければならない。
     *
     * @param muted ミュート状態にするか否か
     * @private
     */
    AudioPlayer.prototype._changeMuted = function (muted) {
        this._muted = muted;
    };
    /**
     * 音量の変更を通知する。
     * @private
     */
    AudioPlayer.prototype._notifyVolumeChanged = function () {
        // AudioPlayerの音量を AudioSystem の音量で上書きしていたため、最終音量が正常に計算できていなかった。
        // 暫定対応として、 changeVolume() に AudioPlayer 自身の音量を渡す事により最終音量の計算を実行させる。
        this.changeVolume(this.volume);
    };
    return AudioPlayer;
}());
exports.AudioPlayer = AudioPlayer;

},{"@akashic/trigger":213}],166:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptAsset = void 0;
var Asset_1 = require("./Asset");
/**
 * スクリプトリソースを表すクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 *
 * ScriptAsset#executeによって、本リソースが表すスクリプトを実行し、その結果を受け取る事が出来る。
 * requireによる参照とは異なり、executeはキャッシュされないため、何度でも呼び出し違う結果を受け取ることが出来る。
 */
var ScriptAsset = /** @class */ (function (_super) {
    __extends(ScriptAsset, _super);
    function ScriptAsset(id, path, exports) {
        if (exports === void 0) { exports = []; }
        var _this = _super.call(this, id, path) || this;
        _this.type = "script";
        _this.exports = exports;
        _this.script = undefined;
        return _this;
    }
    ScriptAsset.prototype.destroy = function () {
        this.script = undefined;
        _super.prototype.destroy.call(this);
    };
    return ScriptAsset;
}(Asset_1.Asset));
exports.ScriptAsset = ScriptAsset;

},{"./Asset":163}],167:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextAsset = void 0;
var Asset_1 = require("./Asset");
/**
 * 文字列リソースを表すクラス。
 * 本クラスのインスタンスをゲーム開発者が直接生成することはない。
 * game.jsonによって定義された内容をもとに暗黙的に生成されたインスタンスを、
 * Scene#assets、またはGame#assetsによって取得して利用する。
 *
 * TextAsset#dataによって、本リソースが保持する文字列を取得することが出来る。
 */
var TextAsset = /** @class */ (function (_super) {
    __extends(TextAsset, _super);
    function TextAsset(id, assetPath) {
        var _this = _super.call(this, id, assetPath) || this;
        _this.type = "text";
        _this.data = undefined;
        return _this;
    }
    TextAsset.prototype.destroy = function () {
        this.data = undefined;
        _super.prototype.destroy.call(this);
    };
    return TextAsset;
}(Asset_1.Asset));
exports.TextAsset = TextAsset;

},{"./Asset":163}],168:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],169:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetLoadErrorType = void 0;
/**
 * アセット読み込み失敗時のエラーの種別。
 *
 * この値はあくまでもエラーメッセージ出力のための補助情報であり、
 * 網羅性・厳密性を追求したものではないことに注意。
 *
 * @deprecated 非推奨である。将来的に削除される。現在この型が必要な処理は存在しない。
 */
var AssetLoadErrorType;
(function (AssetLoadErrorType) {
    /**
     * 明示されていない(以下のいずれかかもしれないし、そうでないかもしれない)。
     */
    AssetLoadErrorType[AssetLoadErrorType["Unspecified"] = 0] = "Unspecified";
    /**
     * エンジンの再試行回数上限設定値を超えた。
     */
    AssetLoadErrorType[AssetLoadErrorType["RetryLimitExceeded"] = 1] = "RetryLimitExceeded";
    /**
     * ネットワークエラー。タイムアウトなど。
     */
    AssetLoadErrorType[AssetLoadErrorType["NetworkError"] = 2] = "NetworkError";
    /**
     * リクエストに問題があるエラー。HTTP 4XX など。
     */
    AssetLoadErrorType[AssetLoadErrorType["ClientError"] = 3] = "ClientError";
    /**
     * サーバ側のエラー。HTTP 5XX など。
     */
    AssetLoadErrorType[AssetLoadErrorType["ServerError"] = 4] = "ServerError";
})(AssetLoadErrorType = exports.AssetLoadErrorType || (exports.AssetLoadErrorType = {}));

},{}],170:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],171:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],172:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],173:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],174:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],175:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],176:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],177:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],178:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],179:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],180:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],181:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],182:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],183:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],184:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],185:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],186:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],187:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],188:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontFamily = void 0;
/**
 * 文字列描画のフォントファミリ。
 * @deprecated 非推奨である。将来的に削除される。代わりに文字列 `"sans-serif"`, `"serif"`, `"monospace"` を利用すること。
 */
var FontFamily;
(function (FontFamily) {
    /**
     * サンセリフ体。ＭＳ Ｐゴシック等
     */
    FontFamily[FontFamily["SansSerif"] = 0] = "SansSerif";
    /**
     * セリフ体。ＭＳ 明朝等
     */
    FontFamily[FontFamily["Serif"] = 1] = "Serif";
    /**
     * 等幅。ＭＳ ゴシック等
     */
    FontFamily[FontFamily["Monospace"] = 2] = "Monospace";
})(FontFamily = exports.FontFamily || (exports.FontFamily = {}));

},{}],189:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontWeight = void 0;
/**
 * フォントのウェイト。
 * @deprecated 非推奨である。将来的に削除される。代わりに `FontWeightString` を利用すること。
 */
var FontWeight;
(function (FontWeight) {
    /**
     * 通常のフォントウェイト。
     */
    FontWeight[FontWeight["Normal"] = 0] = "Normal";
    /**
     * 太字のフォントウェイト。
     */
    FontWeight[FontWeight["Bold"] = 1] = "Bold";
})(FontWeight = exports.FontWeight || (exports.FontWeight = {}));

},{}],190:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],191:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],192:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],193:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./commons"), exports);
__exportStar(require("./errors"), exports);
__exportStar(require("./surface/CompositeOperation"), exports);
__exportStar(require("./surface/CompositeOperationString"), exports);
__exportStar(require("./surface/ImageData"), exports);
__exportStar(require("./surface/Renderer"), exports);
__exportStar(require("./surface/ShaderProgram"), exports);
__exportStar(require("./surface/ShaderUniform"), exports);
__exportStar(require("./surface/Surface"), exports);
__exportStar(require("./asset/audio/AudioAsset"), exports);
__exportStar(require("./asset/audio/AudioPlayer"), exports);
__exportStar(require("./asset/audio/AudioSystem"), exports);
__exportStar(require("./asset/audio/AudioAssetHint"), exports);
__exportStar(require("./asset/image/ImageAssetHint"), exports);
__exportStar(require("./asset/image/ImageAsset"), exports);
__exportStar(require("./asset/script/ScriptAsset"), exports);
__exportStar(require("./asset/script/Module"), exports);
__exportStar(require("./asset/script/ScriptAssetRuntimeValue"), exports);
__exportStar(require("./asset/text/TextAsset"), exports);
__exportStar(require("./asset/video/VideoPlayer"), exports);
__exportStar(require("./asset/video/VideoSystem"), exports);
__exportStar(require("./asset/video/VideoAsset"), exports);
__exportStar(require("./asset/vector-image/VectorImageAsset"), exports);
__exportStar(require("./asset/vector-image/VectorImageAssetHint"), exports);
__exportStar(require("./asset/binary/BinaryAsset"), exports);
__exportStar(require("./asset/Asset"), exports);
__exportStar(require("./asset/AssetLoadErrorType"), exports);
__exportStar(require("./font/FontWeightString"), exports);
__exportStar(require("./font/FontWeight"), exports);
__exportStar(require("./font/FontFamily"), exports);
__exportStar(require("./font/Glyph"), exports);
__exportStar(require("./font/GlyphFactory"), exports);
__exportStar(require("./platform/Looper"), exports);
__exportStar(require("./platform/OperationPluginView"), exports);
__exportStar(require("./platform/OperationPluginViewInfo"), exports);
__exportStar(require("./platform/Platform"), exports);
__exportStar(require("./platform/PlatformEventHandler"), exports);
__exportStar(require("./platform/PlatformPointEvent"), exports);
__exportStar(require("./platform/RendererRequirement"), exports);
__exportStar(require("./platform/ResourceFactory"), exports);

},{"./asset/Asset":168,"./asset/AssetLoadErrorType":169,"./asset/audio/AudioAsset":170,"./asset/audio/AudioAssetHint":171,"./asset/audio/AudioPlayer":172,"./asset/audio/AudioSystem":173,"./asset/binary/BinaryAsset":174,"./asset/image/ImageAsset":175,"./asset/image/ImageAssetHint":176,"./asset/script/Module":177,"./asset/script/ScriptAsset":178,"./asset/script/ScriptAssetRuntimeValue":179,"./asset/text/TextAsset":180,"./asset/vector-image/VectorImageAsset":181,"./asset/vector-image/VectorImageAssetHint":182,"./asset/video/VideoAsset":183,"./asset/video/VideoPlayer":184,"./asset/video/VideoSystem":185,"./commons":186,"./errors":187,"./font/FontFamily":188,"./font/FontWeight":189,"./font/FontWeightString":190,"./font/Glyph":191,"./font/GlyphFactory":192,"./platform/Looper":194,"./platform/OperationPluginView":195,"./platform/OperationPluginViewInfo":196,"./platform/Platform":197,"./platform/PlatformEventHandler":198,"./platform/PlatformPointEvent":199,"./platform/RendererRequirement":200,"./platform/ResourceFactory":201,"./surface/CompositeOperation":202,"./surface/CompositeOperationString":203,"./surface/ImageData":204,"./surface/Renderer":205,"./surface/ShaderProgram":206,"./surface/ShaderUniform":207,"./surface/Surface":208}],194:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],195:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],196:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],197:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],198:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],199:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],200:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],201:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],202:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeOperation = void 0;
/**
 * 描画時の合成方法。
 * @deprecated 非推奨である。将来的に削除される。代わりに `CompositeOperationString` を利用すること。
 */
var CompositeOperation;
(function (CompositeOperation) {
    /**
     * 先に描画された領域の上に描画する。
     */
    CompositeOperation[CompositeOperation["SourceOver"] = 0] = "SourceOver";
    /**
     * 先に描画された領域と重なった部分のみを描画する。
     */
    CompositeOperation[CompositeOperation["SourceAtop"] = 1] = "SourceAtop";
    /**
     * 先に描画された領域と重なった部分の色を加算して描画する。
     */
    CompositeOperation[CompositeOperation["Lighter"] = 2] = "Lighter";
    /**
     * 先に描画された領域を全て無視して描画する。
     */
    CompositeOperation[CompositeOperation["Copy"] = 3] = "Copy";
    /**
     * 先に描画された領域と重なった部分に描画を行い、それ以外の部分を透明にする。
     * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
     */
    CompositeOperation[CompositeOperation["ExperimentalSourceIn"] = 4] = "ExperimentalSourceIn";
    /**
     * 先に描画された領域と重なっていない部分に描画を行い、それ以外の部分を透明にする。
     * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
     */
    CompositeOperation[CompositeOperation["ExperimentalSourceOut"] = 5] = "ExperimentalSourceOut";
    /**
     * 描画する領域だけを表示し、先に描画された領域と重なった部分は描画先を表示する。
     * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
     */
    CompositeOperation[CompositeOperation["ExperimentalDestinationAtop"] = 6] = "ExperimentalDestinationAtop";
    /**
     * 先に描画された領域と重なっていない部分を透明にし、重なった部分は描画先を表示する。
     * 環境により、描画結果が大きく異なる可能性があるため、試験的導入である。
     */
    CompositeOperation[CompositeOperation["ExperimentalDestinationIn"] = 7] = "ExperimentalDestinationIn";
    /**
     * 描画する領域を透明にする。
     */
    CompositeOperation[CompositeOperation["DestinationOut"] = 8] = "DestinationOut";
    /**
     * 先に描画された領域の下に描画する。
     */
    CompositeOperation[CompositeOperation["DestinationOver"] = 9] = "DestinationOver";
    /**
     * 先に描画された領域と重なった部分のみ透明にする。
     */
    CompositeOperation[CompositeOperation["Xor"] = 10] = "Xor";
})(CompositeOperation = exports.CompositeOperation || (exports.CompositeOperation = {}));

},{}],203:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],204:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],205:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],206:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],207:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],208:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],209:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainTrigger = void 0;
var Trigger_1 = require("./Trigger");
/**
 * 他のTriggerLikeに反応して発火するイベント通知機構。
 */
var ChainTrigger = /** @class */ (function (_super) {
    __extends(ChainTrigger, _super);
    /**
     * `ChainTrigger` のインスタンスを生成する。
     *
     * このインスタンスは、 `chain` がfireされたときに `filter` を実行し、真を返した場合に自身をfireする。
     * @param chain このインスタンスがfireするきっかけとなる TriggerLike
     * @param filter `chain` がfireされたときに実行される関数。省略された場合、または本関数の戻り値が真の場合、このインスタンスをfireする。
     * @param filterOwner `filter` 呼び出し時に使われる `this` の値。
     */
    function ChainTrigger(chain, filter, filterOwner) {
        var _this = _super.call(this) || this;
        _this.chain = chain;
        _this.filter = filter != null ? filter : null;
        _this.filterOwner = filterOwner;
        _this._isActivated = false;
        return _this;
    }
    ChainTrigger.prototype.add = function (paramsOrHandler, owner) {
        _super.prototype.add.call(this, paramsOrHandler, owner);
        if (!this._isActivated) {
            this.chain.add(this._onChainTriggerFired, this);
            this._isActivated = true;
        }
    };
    ChainTrigger.prototype.addOnce = function (paramsOrHandler, owner) {
        _super.prototype.addOnce.call(this, paramsOrHandler, owner);
        if (!this._isActivated) {
            this.chain.add(this._onChainTriggerFired, this);
            this._isActivated = true;
        }
    };
    ChainTrigger.prototype.remove = function (paramsOrFunc, owner) {
        _super.prototype.remove.call(this, paramsOrFunc, owner);
        if (this.length === 0 && this._isActivated) {
            this.chain.remove(this._onChainTriggerFired, this);
            this._isActivated = false;
        }
    };
    ChainTrigger.prototype.removeAll = function (params) {
        _super.prototype.removeAll.call(this, params);
        if (this.length === 0 && this._isActivated) {
            this.chain.remove(this._onChainTriggerFired, this);
            this._isActivated = false;
        }
    };
    ChainTrigger.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.chain.remove(this._onChainTriggerFired, this);
        this.filter = null;
        this.filterOwner = null;
        this._isActivated = false;
    };
    /**
     * @private
     */
    ChainTrigger.prototype._onChainTriggerFired = function (args) {
        if (!this.filter || this.filter.call(this.filterOwner, args)) {
            this.fire(args);
        }
    };
    return ChainTrigger;
}(Trigger_1.Trigger));
exports.ChainTrigger = ChainTrigger;

},{"./Trigger":211}],210:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],211:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trigger = void 0;
var isPromise_1 = require("./isPromise");
/**
 * イベント通知機構クラス。
 */
var Trigger = /** @class */ (function () {
    function Trigger() {
        this._handlers = [];
        this.length = 0;
    }
    Trigger.prototype.add = function (paramsOrFunc, owner) {
        if (typeof paramsOrFunc === "function") {
            this._handlers.push({
                func: paramsOrFunc,
                owner: owner,
                once: false,
                name: undefined
            });
        }
        else {
            var params = paramsOrFunc;
            if (typeof params.index === "number") {
                this._handlers.splice(params.index, 0, {
                    func: params.func,
                    owner: params.owner,
                    once: false,
                    name: params.name
                });
            }
            else {
                this._handlers.push({
                    func: params.func,
                    owner: params.owner,
                    once: false,
                    name: params.name
                });
            }
        }
        this.length = this._handlers.length;
    };
    Trigger.prototype.addOnce = function (paramsOrFunc, owner) {
        if (typeof paramsOrFunc === "function") {
            this._handlers.push({
                func: paramsOrFunc,
                owner: owner,
                once: true,
                name: undefined
            });
        }
        else {
            var params = paramsOrFunc;
            if (typeof params.index === "number") {
                this._handlers.splice(params.index, 0, {
                    func: params.func,
                    owner: params.owner,
                    once: true,
                    name: params.name
                });
            }
            else {
                this._handlers.push({
                    func: params.func,
                    owner: params.owner,
                    once: true,
                    name: params.name
                });
            }
        }
        this.length = this._handlers.length;
    };
    /**
     * このTriggerにハンドラを追加する。
     * @deprecated 互換性のために残されている。代わりに `add()` を利用すべきである。実装の変化のため、 `func` が `boolean` を返した時の動作はサポートされていない。
     */
    Trigger.prototype.handle = function (owner, func, name) {
        this.add(func ? { owner: owner, func: func, name: name } : { func: owner });
    };
    /**
     * このTriggerを発火する。
     *
     * 登録された全ハンドラの関数を、引数 `arg` を与えて呼び出す。
     * 呼び出し後、次のいずれかの条件を満たす全ハンドラの登録は解除される。
     * * ハンドラが `addOnce()` で登録されていた場合
     * * ハンドラが `add()` で登録される際に `once: true` オプションが与えられていた場合
     * * ハンドラが Promise 以外の truthy な値を返した場合
     *
     * @param arg ハンドラに与えられる引数
     */
    Trigger.prototype.fire = function (arg) {
        if (!this._handlers || !this._handlers.length)
            return;
        var handlers = this._handlers.concat();
        for (var i = 0; i < handlers.length; i++) {
            var handler = handlers[i];
            var ret = handler.func.call(handler.owner, arg);
            var returnedTruthy = !(0, isPromise_1.isPromise)(ret) && !!ret;
            if (returnedTruthy || handler.once) {
                if (!this._handlers)
                    continue;
                var index = this._handlers.indexOf(handler);
                if (index !== -1)
                    this._handlers.splice(index, 1);
            }
        }
        if (this._handlers != null)
            this.length = this._handlers.length;
    };
    Trigger.prototype.contains = function (paramsOrFunc, owner) {
        var condition = typeof paramsOrFunc === "function" ? { func: paramsOrFunc, owner: owner } : paramsOrFunc;
        for (var i = 0; i < this._handlers.length; i++) {
            if (this._comparePartial(condition, this._handlers[i])) {
                return true;
            }
        }
        return false;
    };
    Trigger.prototype.remove = function (paramsOrFunc, owner) {
        var condition = typeof paramsOrFunc === "function" ? { func: paramsOrFunc, owner: owner } : paramsOrFunc;
        for (var i = 0; i < this._handlers.length; i++) {
            var handler = this._handlers[i];
            if (condition.func === handler.func && condition.owner === handler.owner && condition.name === handler.name) {
                this._handlers.splice(i, 1);
                --this.length;
                return;
            }
        }
    };
    /**
     * 指定した条件に部分一致するイベントハンドラを削除する。
     *
     * 本メソッドは引数に与えた条件に一致したイベントハンドラを全て削除する。
     * 引数の条件を一部省略した場合、その値の内容が登録時と異なっていても対象のイベントハンドラは削除される。
     * 引数に与えた条件と完全に一致したイベントハンドラのみを削除したい場合は `this.remove()` を用いる。
     * 引数を省略した場合は全てのイベントハンドラを削除する。
     *
     * @param params 削除するイベントハンドラの条件
     */
    Trigger.prototype.removeAll = function (params) {
        var handlers = [];
        if (params) {
            for (var i = 0; i < this._handlers.length; i++) {
                var handler = this._handlers[i];
                if (!this._comparePartial(params, handler)) {
                    handlers.push(handler);
                }
            }
        }
        this._handlers = handlers;
        this.length = this._handlers.length;
    };
    /**
     * このTriggerを破棄する。
     */
    Trigger.prototype.destroy = function () {
        this._handlers = null;
        this.length = null;
    };
    /**
     * このTriggerが破棄されているかを返す。
     */
    Trigger.prototype.destroyed = function () {
        return this._handlers === null;
    };
    /**
     * @private
     */
    Trigger.prototype._comparePartial = function (target, compare) {
        if (target.func !== undefined && target.func !== compare.func)
            return false;
        if (target.owner !== undefined && target.owner !== compare.owner)
            return false;
        if (target.name !== undefined && target.name !== compare.name)
            return false;
        return true;
    };
    return Trigger;
}());
exports.Trigger = Trigger;

},{"./isPromise":214}],212:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],213:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./TriggerLike"), exports);
__exportStar(require("./ChainTriggerLike"), exports);
__exportStar(require("./Trigger"), exports);
__exportStar(require("./ChainTrigger"), exports);

},{"./ChainTrigger":209,"./ChainTriggerLike":210,"./Trigger":211,"./TriggerLike":212}],214:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = void 0;
function isPromise(target) {
    return (target != null &&
        (typeof target === "object" || typeof target === "function") &&
        typeof target.then === "function");
}
exports.isPromise = isPromise;

},{}],215:[function(require,module,exports){
(function (process,global){(function (){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   v4.2.8+1e68dce6
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
  var type = typeof x;
  return x !== null && (type === 'object' || type === 'function');
}

function isFunction(x) {
  return typeof x === 'function';
}



var _isArray = void 0;
if (Array.isArray) {
  _isArray = Array.isArray;
} else {
  _isArray = function (x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  };
}

var isArray = _isArray;

var len = 0;
var vertxNext = void 0;
var customSchedulerFn = void 0;

var asap = function asap(callback, arg) {
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    // If len is 2, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    if (customSchedulerFn) {
      customSchedulerFn(flush);
    } else {
      scheduleFlush();
    }
  }
};

function setScheduler(scheduleFn) {
  customSchedulerFn = scheduleFn;
}

function setAsap(asapFn) {
  asap = asapFn;
}

var browserWindow = typeof window !== 'undefined' ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

// node
function useNextTick() {
  // node version 0.10.x displays a deprecation warning when nextTick is used recursively
  // see https://github.com/cujojs/when/issues/410 for details
  return function () {
    return process.nextTick(flush);
  };
}

// vertx
function useVertxTimer() {
  if (typeof vertxNext !== 'undefined') {
    return function () {
      vertxNext(flush);
    };
  }

  return useSetTimeout();
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function () {
    node.data = iterations = ++iterations % 2;
  };
}

// web worker
function useMessageChannel() {
  var channel = new MessageChannel();
  channel.port1.onmessage = flush;
  return function () {
    return channel.port2.postMessage(0);
  };
}

function useSetTimeout() {
  // Store setTimeout reference so es6-promise will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var globalSetTimeout = setTimeout;
  return function () {
    return globalSetTimeout(flush, 1);
  };
}

var queue = new Array(1000);
function flush() {
  for (var i = 0; i < len; i += 2) {
    var callback = queue[i];
    var arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
}

function attemptVertx() {
  try {
    var vertx = Function('return this')().require('vertx');
    vertxNext = vertx.runOnLoop || vertx.runOnContext;
    return useVertxTimer();
  } catch (e) {
    return useSetTimeout();
  }
}

var scheduleFlush = void 0;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else if (isWorker) {
  scheduleFlush = useMessageChannel();
} else if (browserWindow === undefined && typeof require === 'function') {
  scheduleFlush = attemptVertx();
} else {
  scheduleFlush = useSetTimeout();
}

function then(onFulfillment, onRejection) {
  var parent = this;

  var child = new this.constructor(noop);

  if (child[PROMISE_ID] === undefined) {
    makePromise(child);
  }

  var _state = parent._state;


  if (_state) {
    var callback = arguments[_state - 1];
    asap(function () {
      return invokeCallback(_state, child, callback, parent._result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}

/**
  `Promise.resolve` returns a promise that will become resolved with the
  passed `value`. It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @static
  @param {Any} value value that the returned promise will be resolved with
  Useful for tooling.
  @return {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve$1(object) {
  /*jshint validthis:true */
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop);
  resolve(promise, object);
  return promise;
}

var PROMISE_ID = Math.random().toString(36).substring(2);

function noop() {}

var PENDING = void 0;
var FULFILLED = 1;
var REJECTED = 2;

function selfFulfillment() {
  return new TypeError("You cannot resolve a promise with itself");
}

function cannotReturnOwn() {
  return new TypeError('A promises callback cannot return that same promise.');
}

function tryThen(then$$1, value, fulfillmentHandler, rejectionHandler) {
  try {
    then$$1.call(value, fulfillmentHandler, rejectionHandler);
  } catch (e) {
    return e;
  }
}

function handleForeignThenable(promise, thenable, then$$1) {
  asap(function (promise) {
    var sealed = false;
    var error = tryThen(then$$1, thenable, function (value) {
      if (sealed) {
        return;
      }
      sealed = true;
      if (thenable !== value) {
        resolve(promise, value);
      } else {
        fulfill(promise, value);
      }
    }, function (reason) {
      if (sealed) {
        return;
      }
      sealed = true;

      reject(promise, reason);
    }, 'Settle: ' + (promise._label || ' unknown promise'));

    if (!sealed && error) {
      sealed = true;
      reject(promise, error);
    }
  }, promise);
}

function handleOwnThenable(promise, thenable) {
  if (thenable._state === FULFILLED) {
    fulfill(promise, thenable._result);
  } else if (thenable._state === REJECTED) {
    reject(promise, thenable._result);
  } else {
    subscribe(thenable, undefined, function (value) {
      return resolve(promise, value);
    }, function (reason) {
      return reject(promise, reason);
    });
  }
}

function handleMaybeThenable(promise, maybeThenable, then$$1) {
  if (maybeThenable.constructor === promise.constructor && then$$1 === then && maybeThenable.constructor.resolve === resolve$1) {
    handleOwnThenable(promise, maybeThenable);
  } else {
    if (then$$1 === undefined) {
      fulfill(promise, maybeThenable);
    } else if (isFunction(then$$1)) {
      handleForeignThenable(promise, maybeThenable, then$$1);
    } else {
      fulfill(promise, maybeThenable);
    }
  }
}

function resolve(promise, value) {
  if (promise === value) {
    reject(promise, selfFulfillment());
  } else if (objectOrFunction(value)) {
    var then$$1 = void 0;
    try {
      then$$1 = value.then;
    } catch (error) {
      reject(promise, error);
      return;
    }
    handleMaybeThenable(promise, value, then$$1);
  } else {
    fulfill(promise, value);
  }
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._result);
  }

  publish(promise);
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) {
    return;
  }

  promise._result = value;
  promise._state = FULFILLED;

  if (promise._subscribers.length !== 0) {
    asap(publish, promise);
  }
}

function reject(promise, reason) {
  if (promise._state !== PENDING) {
    return;
  }
  promise._state = REJECTED;
  promise._result = reason;

  asap(publishRejection, promise);
}

function subscribe(parent, child, onFulfillment, onRejection) {
  var _subscribers = parent._subscribers;
  var length = _subscribers.length;


  parent._onerror = null;

  _subscribers[length] = child;
  _subscribers[length + FULFILLED] = onFulfillment;
  _subscribers[length + REJECTED] = onRejection;

  if (length === 0 && parent._state) {
    asap(publish, parent);
  }
}

function publish(promise) {
  var subscribers = promise._subscribers;
  var settled = promise._state;

  if (subscribers.length === 0) {
    return;
  }

  var child = void 0,
      callback = void 0,
      detail = promise._result;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    if (child) {
      invokeCallback(settled, child, callback, detail);
    } else {
      callback(detail);
    }
  }

  promise._subscribers.length = 0;
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value = void 0,
      error = void 0,
      succeeded = true;

  if (hasCallback) {
    try {
      value = callback(detail);
    } catch (e) {
      succeeded = false;
      error = e;
    }

    if (promise === value) {
      reject(promise, cannotReturnOwn());
      return;
    }
  } else {
    value = detail;
  }

  if (promise._state !== PENDING) {
    // noop
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (succeeded === false) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    fulfill(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

function initializePromise(promise, resolver) {
  try {
    resolver(function resolvePromise(value) {
      resolve(promise, value);
    }, function rejectPromise(reason) {
      reject(promise, reason);
    });
  } catch (e) {
    reject(promise, e);
  }
}

var id = 0;
function nextId() {
  return id++;
}

function makePromise(promise) {
  promise[PROMISE_ID] = id++;
  promise._state = undefined;
  promise._result = undefined;
  promise._subscribers = [];
}

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

var Enumerator = function () {
  function Enumerator(Constructor, input) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this.length = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate(input);
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  Enumerator.prototype._enumerate = function _enumerate(input) {
    for (var i = 0; this._state === PENDING && i < input.length; i++) {
      this._eachEntry(input[i], i);
    }
  };

  Enumerator.prototype._eachEntry = function _eachEntry(entry, i) {
    var c = this._instanceConstructor;
    var resolve$$1 = c.resolve;


    if (resolve$$1 === resolve$1) {
      var _then = void 0;
      var error = void 0;
      var didError = false;
      try {
        _then = entry.then;
      } catch (e) {
        didError = true;
        error = e;
      }

      if (_then === then && entry._state !== PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof _then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise$1) {
        var promise = new c(noop);
        if (didError) {
          reject(promise, error);
        } else {
          handleMaybeThenable(promise, entry, _then);
        }
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(function (resolve$$1) {
          return resolve$$1(entry);
        }), i);
      }
    } else {
      this._willSettleAt(resolve$$1(entry), i);
    }
  };

  Enumerator.prototype._settledAt = function _settledAt(state, i, value) {
    var promise = this.promise;


    if (promise._state === PENDING) {
      this._remaining--;

      if (state === REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  };

  Enumerator.prototype._willSettleAt = function _willSettleAt(promise, i) {
    var enumerator = this;

    subscribe(promise, undefined, function (value) {
      return enumerator._settledAt(FULFILLED, i, value);
    }, function (reason) {
      return enumerator._settledAt(REJECTED, i, reason);
    });
  };

  return Enumerator;
}();

/**
  `Promise.all` accepts an array of promises, and returns a new promise which
  is fulfilled with an array of fulfillment values for the passed promises, or
  rejected with the reason of the first passed promise to be rejected. It casts all
  elements of the passed iterable to promises as it runs this algorithm.

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = resolve(2);
  let promise3 = resolve(3);
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  let promise1 = resolve(1);
  let promise2 = reject(new Error("2"));
  let promise3 = reject(new Error("3"));
  let promises = [ promise1, promise2, promise3 ];

  Promise.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @static
  @param {Array} entries array of promises
  @param {String} label optional string for labeling the promise.
  Useful for tooling.
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
  @static
*/
function all(entries) {
  return new Enumerator(this, entries).promise;
}

/**
  `Promise.race` returns a new promise which is settled in the same way as the
  first passed promise to settle.

  Example:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 2');
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // result === 'promise 2' because it was resolved before promise1
    // was resolved.
  });
  ```

  `Promise.race` is deterministic in that only the state of the first
  settled promise matters. For example, even if other promises given to the
  `promises` array argument are resolved, but the first settled promise has
  become rejected before the other promises became fulfilled, the returned
  promise will become rejected:

  ```javascript
  let promise1 = new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve('promise 1');
    }, 200);
  });

  let promise2 = new Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error('promise 2'));
    }, 100);
  });

  Promise.race([promise1, promise2]).then(function(result){
    // Code here never runs
  }, function(reason){
    // reason.message === 'promise 2' because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  An example real-world use case is implementing timeouts:

  ```javascript
  Promise.race([ajax('foo.json'), timeout(5000)])
  ```

  @method race
  @static
  @param {Array} promises array of promises to observe
  Useful for tooling.
  @return {Promise} a promise which settles in the same way as the first passed
  promise to settle.
*/
function race(entries) {
  /*jshint validthis:true */
  var Constructor = this;

  if (!isArray(entries)) {
    return new Constructor(function (_, reject) {
      return reject(new TypeError('You must pass an array to race.'));
    });
  } else {
    return new Constructor(function (resolve, reject) {
      var length = entries.length;
      for (var i = 0; i < length; i++) {
        Constructor.resolve(entries[i]).then(resolve, reject);
      }
    });
  }
}

/**
  `Promise.reject` returns a promise rejected with the passed `reason`.
  It is shorthand for the following:

  ```javascript
  let promise = new Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  let promise = Promise.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @static
  @param {Any} reason value that the returned promise will be rejected with.
  Useful for tooling.
  @return {Promise} a promise rejected with the given `reason`.
*/
function reject$1(reason) {
  /*jshint validthis:true */
  var Constructor = this;
  var promise = new Constructor(noop);
  reject(promise, reason);
  return promise;
}

function needsResolver() {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew() {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}

/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {Function} resolver
  Useful for tooling.
  @constructor
*/

var Promise$1 = function () {
  function Promise(resolver) {
    this[PROMISE_ID] = nextId();
    this._result = this._state = undefined;
    this._subscribers = [];

    if (noop !== resolver) {
      typeof resolver !== 'function' && needsResolver();
      this instanceof Promise ? initializePromise(this, resolver) : needsNew();
    }
  }

  /**
  The primary way of interacting with a promise is through its `then` method,
  which registers callbacks to receive either a promise's eventual value or the
  reason why the promise cannot be fulfilled.
   ```js
  findUser().then(function(user){
    // user is available
  }, function(reason){
    // user is unavailable, and you are given the reason why
  });
  ```
   Chaining
  --------
   The return value of `then` is itself a promise.  This second, 'downstream'
  promise is resolved with the return value of the first promise's fulfillment
  or rejection handler, or rejected if the handler throws an exception.
   ```js
  findUser().then(function (user) {
    return user.name;
  }, function (reason) {
    return 'default name';
  }).then(function (userName) {
    // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
    // will be `'default name'`
  });
   findUser().then(function (user) {
    throw new Error('Found user, but still unhappy');
  }, function (reason) {
    throw new Error('`findUser` rejected and we're unhappy');
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
    // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
  });
  ```
  If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
   ```js
  findUser().then(function (user) {
    throw new PedagogicalException('Upstream error');
  }).then(function (value) {
    // never reached
  }).then(function (value) {
    // never reached
  }, function (reason) {
    // The `PedgagocialException` is propagated all the way down to here
  });
  ```
   Assimilation
  ------------
   Sometimes the value you want to propagate to a downstream promise can only be
  retrieved asynchronously. This can be achieved by returning a promise in the
  fulfillment or rejection handler. The downstream promise will then be pending
  until the returned promise is settled. This is called *assimilation*.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // The user's comments are now available
  });
  ```
   If the assimliated promise rejects, then the downstream promise will also reject.
   ```js
  findUser().then(function (user) {
    return findCommentsByAuthor(user);
  }).then(function (comments) {
    // If `findCommentsByAuthor` fulfills, we'll have the value here
  }, function (reason) {
    // If `findCommentsByAuthor` rejects, we'll have the reason here
  });
  ```
   Simple Example
  --------------
   Synchronous Example
   ```javascript
  let result;
   try {
    result = findResult();
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
  findResult(function(result, err){
    if (err) {
      // failure
    } else {
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findResult().then(function(result){
    // success
  }, function(reason){
    // failure
  });
  ```
   Advanced Example
  --------------
   Synchronous Example
   ```javascript
  let author, books;
   try {
    author = findAuthor();
    books  = findBooksByAuthor(author);
    // success
  } catch(reason) {
    // failure
  }
  ```
   Errback Example
   ```js
   function foundBooks(books) {
   }
   function failure(reason) {
   }
   findAuthor(function(author, err){
    if (err) {
      failure(err);
      // failure
    } else {
      try {
        findBoooksByAuthor(author, function(books, err) {
          if (err) {
            failure(err);
          } else {
            try {
              foundBooks(books);
            } catch(reason) {
              failure(reason);
            }
          }
        });
      } catch(error) {
        failure(err);
      }
      // success
    }
  });
  ```
   Promise Example;
   ```javascript
  findAuthor().
    then(findBooksByAuthor).
    then(function(books){
      // found books
  }).catch(function(reason){
    // something went wrong
  });
  ```
   @method then
  @param {Function} onFulfilled
  @param {Function} onRejected
  Useful for tooling.
  @return {Promise}
  */

  /**
  `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
  as the catch block of a try/catch statement.
  ```js
  function findAuthor(){
  throw new Error('couldn't find that author');
  }
  // synchronous
  try {
  findAuthor();
  } catch(reason) {
  // something went wrong
  }
  // async with promises
  findAuthor().catch(function(reason){
  // something went wrong
  });
  ```
  @method catch
  @param {Function} onRejection
  Useful for tooling.
  @return {Promise}
  */


  Promise.prototype.catch = function _catch(onRejection) {
    return this.then(null, onRejection);
  };

  /**
    `finally` will be invoked regardless of the promise's fate just as native
    try/catch/finally behaves
  
    Synchronous example:
  
    ```js
    findAuthor() {
      if (Math.random() > 0.5) {
        throw new Error();
      }
      return new Author();
    }
  
    try {
      return findAuthor(); // succeed or fail
    } catch(error) {
      return findOtherAuther();
    } finally {
      // always runs
      // doesn't affect the return value
    }
    ```
  
    Asynchronous example:
  
    ```js
    findAuthor().catch(function(reason){
      return findOtherAuther();
    }).finally(function(){
      // author was either found, or not
    });
    ```
  
    @method finally
    @param {Function} callback
    @return {Promise}
  */


  Promise.prototype.finally = function _finally(callback) {
    var promise = this;
    var constructor = promise.constructor;

    if (isFunction(callback)) {
      return promise.then(function (value) {
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        return constructor.resolve(callback()).then(function () {
          throw reason;
        });
      });
    }

    return promise.then(callback, callback);
  };

  return Promise;
}();

Promise$1.prototype.then = then;
Promise$1.all = all;
Promise$1.race = race;
Promise$1.resolve = resolve$1;
Promise$1.reject = reject$1;
Promise$1._setScheduler = setScheduler;
Promise$1._setAsap = setAsap;
Promise$1._asap = asap;

/*global self*/
function polyfill() {
  var local = void 0;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }

  var P = local.Promise;

  if (P) {
    var promiseToString = null;
    try {
      promiseToString = Object.prototype.toString.call(P.resolve());
    } catch (e) {
      // silently ignored
    }

    if (promiseToString === '[object Promise]' && !P.cast) {
      return;
    }
  }

  local.Promise = Promise$1;
}

// Strange compat..
Promise$1.polyfill = polyfill;
Promise$1.Promise = Promise$1;

return Promise$1;

})));





}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":1}],216:[function(require,module,exports){
var akashicEngine = require("@akashic/akashic-engine");

// 後方互換性のための暫定対応。
// 現状 akashic-engine の AudioAsset などは pdi-types 由来の interface になっているが、ここでは過去バージョン当時の値を入れる。
// 一部環境に、これらの値に依存している処理が残っているため。
//
// これらの値は、TS 上では interface (型だけの存在) に見える一方 JS レイヤーでは値が存在する、という状況になる。
// 元々 engine-files の利用者のレイヤーでは JS としてしか扱っておらず、
// また TS として利用している場合は値を参照することがないので問題はない。
akashicEngine.AudioAsset = require("@akashic/pdi-common-impl/lib/AudioAsset").AudioAsset;
akashicEngine.AudioPlayer = require("@akashic/pdi-common-impl/lib/AudioPlayer").AudioPlayer;
akashicEngine.ScriptAsset = require("@akashic/pdi-common-impl/lib/ScriptAsset").ScriptAsset;
akashicEngine.TextAsset = require("@akashic/pdi-common-impl/lib/TextAsset").TextAsset;
module.exports = akashicEngine;

},{"@akashic/akashic-engine":2,"@akashic/pdi-common-impl/lib/AudioAsset":164,"@akashic/pdi-common-impl/lib/AudioPlayer":165,"@akashic/pdi-common-impl/lib/ScriptAsset":166,"@akashic/pdi-common-impl/lib/TextAsset":167}],217:[function(require,module,exports){
module.exports = {
  gameDriver: require("@akashic/game-driver"),
  akashicEngine: require("./akashicEngine"),
  pdiBrowser: typeof window !== "undefined" ? require("@akashic/pdi-browser/lib/canvas") : null
};

},{"./akashicEngine":216,"@akashic/game-driver":98,"@akashic/pdi-browser/lib/canvas":144}]},{},[217])(217)
});
