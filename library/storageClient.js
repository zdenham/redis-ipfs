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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.RipDBStorageClient = void 0;
var async_retry_1 = require("async-retry");
var nft_storage_1 = require("nft.storage");
var redis_1 = require("redis");
var node_buffer_1 = require("node:buffer");
var cross_fetch_1 = require("cross-fetch");
var RipDBStorageClient = /** @class */ (function () {
    function RipDBStorageClient(_a) {
        var redisUrl = _a.redisUrl, redisUsername = _a.redisUsername, redisPassword = _a.redisPassword, ipfsApiKey = _a.ipfsApiKey, ipfsGatewayBaseUrl = _a.ipfsGatewayBaseUrl;
        this.redisClient = redis_1.createClient({
            url: redisUrl,
            username: redisUsername,
            password: redisPassword
        });
        this.ipfsClient = new nft_storage_1.NFTStorage({ token: ipfsApiKey });
        this.gatewayUrl = ipfsGatewayBaseUrl || 'https://ipfs.io/ipfs';
        this.redisClient.connect();
    }
    RipDBStorageClient.prototype.wrapData = function (dataToWrap, config) {
        return __assign(__assign({}, config), { setAtTimestamp: Date.now(), data: dataToWrap });
    };
    RipDBStorageClient.prototype._backUpDataToIPFSAsync = function (key, value, timeStamp) {
        if (timeStamp === void 0) { timeStamp = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var dataStr, blob, cid, curr, backedUpData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataStr = JSON.stringify(value);
                        blob = new node_buffer_1["default"]([dataStr], { type: 'application/json' });
                        return [4 /*yield*/, this.ipfsClient.storeBlob(blob)];
                    case 1:
                        cid = _a.sent();
                        return [4 /*yield*/, this.get(key)];
                    case 2:
                        curr = _a.sent();
                        if (!curr || curr.setAtTimestamp !== timeStamp) {
                            return [2 /*return*/];
                        }
                        backedUpData = __assign(__assign({}, curr), { cid: cid });
                        return [4 /*yield*/, this.redisClient.set(key, JSON.stringify(backedUpData))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // fetch from IPFS with exponential backoff
    RipDBStorageClient.prototype.fetchJsonFromIPFS = function (cid, retries) {
        if (retries === void 0) { retries = 5; }
        return __awaiter(this, void 0, void 0, function () {
            var awaited;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (cid === 'pending') {
                            throw new Error('Cannot fetch from IPFS, backup is pending');
                        }
                        return [4 /*yield*/, async_retry_1["default"](function (bail) { return __awaiter(_this, void 0, void 0, function () {
                                var res, data;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, cross_fetch_1["default"](this.gatewayUrl + "/" + cid)];
                                        case 1:
                                            res = _a.sent();
                                            if (403 === res.status) {
                                                bail(new Error('Unauthorized'));
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, res.json()];
                                        case 2:
                                            data = _a.sent();
                                            return [2 /*return*/, data];
                                    }
                                });
                            }); }, {
                                retries: retries,
                                factor: 2,
                                maxTimeout: 5 * 60 * 1000
                            })];
                    case 1:
                        awaited = _a.sent();
                        if (!awaited) {
                            throw new Error('Failed to fetch from IPFS');
                        }
                        return [2 /*return*/, awaited];
                }
            });
        });
    };
    RipDBStorageClient.prototype.set = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var wrapped;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wrapped = this.wrapData(value, { cid: 'pending' });
                        return [4 /*yield*/, this.redisClient.set(key, JSON.stringify(wrapped))];
                    case 1:
                        _a.sent();
                        // asyncronously upload the data to decentralized storage in the background
                        this._backUpDataToIPFSAsync(key, value, wrapped.setAtTimestamp);
                        return [2 /*return*/, wrapped];
                }
            });
        });
    };
    RipDBStorageClient.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var redisVal, wrapped, cid, json, nextWrapped;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redisClient.get(key)];
                    case 1:
                        redisVal = _a.sent();
                        if (!redisVal) {
                            return [2 /*return*/, null];
                        }
                        wrapped = JSON.parse(redisVal);
                        if (wrapped.data) {
                            return [2 /*return*/, wrapped];
                        }
                        cid = wrapped.cid;
                        return [4 /*yield*/, this.fetchJsonFromIPFS(cid)];
                    case 2:
                        json = _a.sent();
                        nextWrapped = __assign(__assign({}, wrapped), { data: json });
                        // update the cache to include the fetched data (asyncrounously)
                        this.redisClient.set(key, JSON.stringify(nextWrapped));
                        return [2 /*return*/, nextWrapped];
                }
            });
        });
    };
    // purge is an explicit function to reclaim some redis space
    // in favor of the IPFS back up. Use this when data is no longer
    // "hot" and fast refresh
    RipDBStorageClient.prototype.purge = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var wrappedStr, wrapped, nextWrapped;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redisClient.get(key)];
                    case 1:
                        wrappedStr = _a.sent();
                        if (!wrappedStr) {
                            return [2 /*return*/];
                        }
                        wrapped = JSON.parse(wrappedStr);
                        if (wrapped.cid === 'pending') {
                            throw new Error('Cannot purge redis before IPFS backup is complete');
                        }
                        nextWrapped = __assign(__assign({}, wrapped), { data: null });
                        return [4 /*yield*/, this.redisClient.set(key, JSON.stringify(nextWrapped))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RipDBStorageClient;
}());
exports.RipDBStorageClient = RipDBStorageClient;
