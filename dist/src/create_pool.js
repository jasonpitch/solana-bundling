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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPool = void 0;
const web3_js_1 = require("@solana/web3.js");
const global_1 = require("./global");
const spl_token_1 = require("@solana/spl-token");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const serum_1 = require("@project-serum/serum");
const utiles = __importStar(require("./utility"));
const bn_js_1 = require("bn.js");
const createPool = (connection, token_owner, token_address, input_token_amount, input_quote_amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (token_address.length <= 0) {
            console.log("Error: [Create Pool] invalid argument for create pool");
            return { result: global_1.SPL_ERROR.E_INVALID_ARGUE, value: undefined };
        }
        console.log("<---------------------[Create Pool]-----------------------");
        const token_mint = new web3_js_1.PublicKey(token_address);
        const mint_info = yield (0, spl_token_1.getMint)(connection, token_mint);
        const base_token = new raydium_sdk_1.Token(spl_token_1.TOKEN_PROGRAM_ID, token_address, mint_info.decimals);
        const quote_token_info = global_1.EnvironmentManager.getQuoteTokenInfo();
        const quote_token = new raydium_sdk_1.Token(spl_token_1.TOKEN_PROGRAM_ID, quote_token_info.address, quote_token_info.decimal, quote_token_info.symbol, quote_token_info.name);
        const accounts = yield serum_1.Market.findAccountsByMints(connection, base_token.mint, quote_token.mint, global_1.EnvironmentManager.getProgramID().OPENBOOK_MARKET);
        if (accounts.length === 0) {
            throw "Get market account failed";
        }
        console.log("Market Found");
        const market_id = accounts[0].publicKey;
        const start_time = Math.floor(Date.now() / 1000);
        const base_amount = utiles.xWeiAmount(input_token_amount, base_token.decimals);
        const quote_amount = utiles.xWeiAmount(input_quote_amount, quote_token.decimals);
        const wallet_token_accounts = yield utiles.getWalletAccounts(connection, token_owner.publicKey);
        if (!wallet_token_accounts || wallet_token_accounts.length <= 0) {
            throw "Get wallet account failed";
        }
        const { innerTransactions, address } = yield raydium_sdk_1.Liquidity.makeCreatePoolV4InstructionV2Simple({
            connection: connection,
            programId: global_1.EnvironmentManager.getProgramID().AmmV4,
            marketInfo: {
                marketId: market_id,
                programId: global_1.EnvironmentManager.getProgramID().OPENBOOK_MARKET
            },
            baseMintInfo: base_token,
            quoteMintInfo: quote_token,
            baseAmount: base_amount,
            quoteAmount: quote_amount,
            startTime: new bn_js_1.BN(start_time),
            ownerInfo: {
                feePayer: token_owner.publicKey,
                wallet: token_owner.publicKey,
                tokenAccounts: wallet_token_accounts,
                useSOLBalance: true
            },
            makeTxVersion: raydium_sdk_1.TxVersion.V0,
            associatedOnly: false,
            checkCreateATAOwner: true,
            feeDestinationId: global_1.EnvironmentManager.getFeeDestinationId()
        });
        const txns = yield (0, raydium_sdk_1.buildSimpleTransaction)({
            connection: connection,
            makeTxVersion: raydium_sdk_1.TxVersion.V0,
            payer: token_owner.publicKey,
            innerTransactions: innerTransactions,
            addLookupTableInfo: global_1.EnvironmentManager.getCacheLTA(),
            recentBlockhash: (yield connection.getLatestBlockhash()).blockhash
        });
        console.log("Success: [Create Pool] made transaction successfully");
        return { result: global_1.SPL_ERROR.E_OK, value: txns };
    }
    catch (error) {
        console.error("Error: [Create Pool] err: ", error);
        return { result: global_1.SPL_ERROR.E_FAIL, value: undefined };
    }
});
exports.createPool = createPool;
//# sourceMappingURL=create_pool.js.map