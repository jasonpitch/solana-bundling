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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.getATAAddress = exports.getAvailablePoolKeyAndPoolInfo = exports.getWalletAccounts = exports.getConnection = exports.xWeiAmount = exports.checkFileExists = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const fs = __importStar(require("fs"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const web3_js_1 = require("@solana/web3.js");
const global_1 = require("./global");
const spl_token_1 = require("@solana/spl-token");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const serum_1 = require("@project-serum/serum");
function checkFileExists(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs.promises.access(filePath, fs.constants.F_OK);
            return true; // File exists
        }
        catch (error) {
            return false; // File doesn't exist
        }
    });
}
exports.checkFileExists = checkFileExists;
const xWeiAmount = (amount, decimals) => {
    return new bn_js_1.default(new bignumber_js_1.default(amount.toString() + "e" + decimals.toString()).toFixed(0));
};
exports.xWeiAmount = xWeiAmount;
const getConnection = (commitment) => {
    return new web3_js_1.Connection(global_1.EnvironmentManager.getRpcNetUrl(), commitment);
};
exports.getConnection = getConnection;
const getWalletAccounts = (connection, wallet) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet_token_account = yield connection.getTokenAccountsByOwner(wallet, {
        programId: spl_token_1.TOKEN_PROGRAM_ID
    });
    return wallet_token_account.value.map((i) => ({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: raydium_sdk_1.SPL_ACCOUNT_LAYOUT.decode(i.account.data)
    }));
});
exports.getWalletAccounts = getWalletAccounts;
const getAvailablePoolKeyAndPoolInfo = (connection, baseToken, quoteToken, marketAccounts) => __awaiter(void 0, void 0, void 0, function* () {
    let bFound = false;
    let count = 0;
    let poolKeys;
    let poolInfo;
    while (bFound === false && count < marketAccounts.length) {
        const marketInfo = serum_1.MARKET_STATE_LAYOUT_V3.decode(marketAccounts[count].accountInfo.data);
        poolKeys = raydium_sdk_1.Liquidity.getAssociatedPoolKeys({
            version: 4,
            marketVersion: 3,
            baseMint: baseToken.mint,
            quoteMint: quoteToken.mint,
            baseDecimals: baseToken.decimals,
            quoteDecimals: quoteToken.decimals,
            marketId: marketAccounts[count].publicKey,
            programId: global_1.EnvironmentManager.getProgramID().AmmV4,
            marketProgramId: global_1.EnvironmentManager.getProgramID().OPENBOOK_MARKET
        });
        poolKeys.marketBaseVault = marketInfo.baseVault;
        poolKeys.marketQuoteVault = marketInfo.quoteVault;
        poolKeys.marketBids = marketInfo.bids;
        poolKeys.marketAsks = marketInfo.asks;
        poolKeys.marketEventQueue = marketInfo.eventQueue;
        try {
            poolInfo = yield raydium_sdk_1.Liquidity.fetchInfo({
                connection: connection,
                poolKeys: poolKeys
            });
            bFound = true;
            console.log("Success to get pool infos...");
        }
        catch (error) {
            bFound = false;
            poolInfo = undefined;
            poolKeys = undefined;
            console.log("Failed to get pool infos...");
        }
        count++;
    }
    return {
        poolKeys: poolKeys,
        poolInfo: poolInfo
    };
});
exports.getAvailablePoolKeyAndPoolInfo = getAvailablePoolKeyAndPoolInfo;
function getATAAddress(programId, owner, mint) {
    const { publicKey, nonce } = (0, raydium_sdk_1.findProgramAddress)([owner.toBuffer(), programId.toBuffer(), mint.toBuffer()], new web3_js_1.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"));
    return { publicKey, nonce };
}
exports.getATAAddress = getATAAddress;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
exports.sleep = sleep;
//# sourceMappingURL=utility.js.map