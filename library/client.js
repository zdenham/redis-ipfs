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
exports.RipDBClient = void 0;
// @ts-ignore - TODO - declare types
var lit_js_sdk_1 = require("lit-js-sdk");
var RipDBClient = /** @class */ (function () {
    function RipDBClient(_a) {
        var ripServerUrl = _a.ripServerUrl;
        this.ripServerUrl = ripServerUrl;
        this.litNodeClient = new lit_js_sdk_1["default"].LitNodeClient({
            debug: false,
            alertWhenUnauthorized: typeof window !== 'undefined'
        });
        this._init();
    }
    RipDBClient.prototype._init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.litNodeClient.connect({ debug: false })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RipDBClient.prototype.set = function (key, value, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var dataToSet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataToSet = (opts === null || opts === void 0 ? void 0 : opts.encrypted) ? this._encryptData(value, opts) : value;
                        return [4 /*yield*/, this._ripServerFetch({
                                path: "set/" + key,
                                method: "POST",
                                body: dataToSet
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RipDBClient.prototype.get = function (key, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var rawData, decryptedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._ripServerFetch({
                            path: "get/" + key,
                            method: 'GET'
                        })];
                    case 1:
                        rawData = _a.sent();
                        if (!this._isEncryptedData(rawData)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._decryptData(rawData.data, opts)];
                    case 2:
                        decryptedData = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, rawData), { data: decryptedData })];
                    case 3: return [2 /*return*/, rawData];
                }
            });
        });
    };
    // TODO - add auth to this endpoint
    // and make it available in the client
    // only an "owner" address should be able
    // to purge the cache for nw
    RipDBClient.prototype.purge = function (key, authSig) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('PURGE NOT IMPLEMENTED: ', key, authSig);
                        return [4 /*yield*/, this._ripServerFetch({
                                path: "purge/" + key,
                                method: 'POST'
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RipDBClient.prototype.signMessageForEncryption = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (typeof window === 'undefined') {
                            throw new Error('Encryption messages can only be signed in the browser');
                        }
                        _a = this;
                        return [4 /*yield*/, lit_js_sdk_1["default"].checkAndSignAuthMessage({
                                chain: 'ethereum'
                            })];
                    case 1:
                        _a.encryptionAuthSig = _b.sent();
                        return [2 /*return*/, this.encryptionAuthSig];
                }
            });
        });
    };
    RipDBClient.prototype.getEncryptionAuthSignature = function () {
        return this.encryptionAuthSig;
    };
    RipDBClient.prototype._ripServerFetch = function (_a) {
        var path = _a.path, method = _a.method, body = _a.body;
        return __awaiter(this, void 0, void 0, function () {
            var opts, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        opts = {
                            method: method,
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(body)
                        };
                        return [4 /*yield*/, fetch(this.ripServerUrl + "/" + path, opts)];
                    case 1:
                        res = _b.sent();
                        return [4 /*yield*/, res.json()];
                    case 2: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    RipDBClient.prototype._encryptData = function (dataToEncrypt, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var stringified, resp, encryptedString, symmetricKey, authSig, _a, accessControlConditions, encryptedSymmetricKey, encryptedData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        stringified = JSON.stringify(dataToEncrypt);
                        return [4 /*yield*/, lit_js_sdk_1["default"].encryptString(stringified)];
                    case 1:
                        resp = _b.sent();
                        if (!resp) {
                            throw new Error('Failed to encrypt');
                        }
                        encryptedString = resp.encryptedString, symmetricKey = resp.symmetricKey;
                        _a = opts.overrideEncryptionAuthSig ||
                            this.encryptionAuthSig;
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.signMessageForEncryption()];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        authSig = _a;
                        if (!authSig) {
                            throw new Error('Auth sig is not defined');
                        }
                        accessControlConditions = [
                            {
                                contractAddress: '',
                                standardContractType: '',
                                chain: 'ethereum',
                                method: '',
                                parameters: [':userAddress'],
                                returnValueTest: {
                                    comparator: '=',
                                    value: authSig.address
                                }
                            },
                        ];
                        return [4 /*yield*/, this.litNodeClient.saveEncryptionKey({
                                accessControlConditions: accessControlConditions,
                                symmetricKey: symmetricKey,
                                authSig: authSig,
                                chain: 'ethereum'
                            })];
                    case 4:
                        encryptedSymmetricKey = _b.sent();
                        return [4 /*yield*/, this._getDataUrl(encryptedString)];
                    case 5:
                        encryptedData = _b.sent();
                        return [2 /*return*/, {
                                ownerAddress: authSig.address,
                                encryptedSymmetricKey: lit_js_sdk_1["default"].uint8arrayToString(encryptedSymmetricKey, 'base16'),
                                encryptedData: encryptedData
                            }];
                }
            });
        });
    };
    RipDBClient.prototype._decryptData = function (dataToDecrypt, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var encryptedData, encryptedSymmetricKey, ownerAddress, accessControlConditions, authSig, _a, symmetricKey, blob, decryptedString;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        encryptedData = dataToDecrypt.encryptedData, encryptedSymmetricKey = dataToDecrypt.encryptedSymmetricKey, ownerAddress = dataToDecrypt.ownerAddress;
                        accessControlConditions = [
                            {
                                contractAddress: '',
                                standardContractType: '',
                                chain: 'ethereum',
                                method: '',
                                parameters: [':userAddress'],
                                returnValueTest: {
                                    comparator: '=',
                                    value: ownerAddress
                                }
                            },
                        ];
                        _a = (opts === null || opts === void 0 ? void 0 : opts.overrideEncryptionAuthSig) ||
                            this.encryptionAuthSig;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.signMessageForEncryption()];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        authSig = _a;
                        return [4 /*yield*/, this.litNodeClient.getEncryptionKey({
                                accessControlConditions: accessControlConditions,
                                toDecrypt: encryptedSymmetricKey,
                                chain: 'ethereum',
                                authSig: authSig
                            })];
                    case 3:
                        symmetricKey = _b.sent();
                        return [4 /*yield*/, fetch(encryptedData)];
                    case 4: return [4 /*yield*/, (_b.sent()).blob()];
                    case 5:
                        blob = _b.sent();
                        return [4 /*yield*/, lit_js_sdk_1["default"].decryptString(blob, symmetricKey)];
                    case 6:
                        decryptedString = _b.sent();
                        if (!decryptedString) {
                            throw new Error('Failed to decrypt');
                        }
                        return [2 /*return*/, JSON.parse(decryptedString)];
                }
            });
        });
    };
    RipDBClient.prototype._isEncryptedData = function (maybeEncryptedData) {
        return !!maybeEncryptedData.data.encryptedSymmetricKey;
    };
    RipDBClient.prototype._getDataUrl = function (blob) {
        return new Promise(function (resolve) {
            var fr = new FileReader();
            fr.addEventListener('load', function () {
                var _a;
                // convert image file to base64 string
                resolve(((_a = fr.result) === null || _a === void 0 ? void 0 : _a.toString()) || '');
            }, false);
            fr.readAsDataURL(blob);
        });
    };
    return RipDBClient;
}());
exports.RipDBClient = RipDBClient;
