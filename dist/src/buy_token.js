"use strict";
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
exports.buyToken = void 0;
const web3_js_1 = require("@solana/web3.js");
const global_1 = require("./global");
const spl_token_1 = require("@solana/spl-token");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const utility_1 = require("./utility");
const buyToken = (connection, buyer, token_address, base_amount, quote_amount, pool_key) => __awaiter(void 0, void 0, void 0, function* () {
    if (token_address.length <= 0 || base_amount <= 0) {
        console.error("Error: [Buy Token] invalid argument iput!!!");
        return { result: global_1.SPL_ERROR.E_INVALID_ARGUE, value: undefined };
    }
    try {
        const token_mint = new web3_js_1.PublicKey(token_address);
        const token_info = yield (0, spl_token_1.getMint)(connection, token_mint);
        const base_token = new raydium_sdk_1.Token(spl_token_1.TOKEN_PROGRAM_ID, token_address, token_info.decimals);
        const quote_info = global_1.EnvironmentManager.getQuoteTokenInfo();
        const quote_token = new raydium_sdk_1.Token(spl_token_1.TOKEN_PROGRAM_ID, quote_info.address, quote_info.decimal, quote_info.symbol, quote_info.name);
        const base_token_amount = new raydium_sdk_1.TokenAmount(base_token, base_amount * 0.95, false);
        const quote_token_amount = new raydium_sdk_1.TokenAmount(quote_token, quote_amount, false);
        const wallet_token_accounts = yield (0, utility_1.getWalletAccounts)(connection, buyer.publicKey);
        const { innerTransactions } = yield raydium_sdk_1.Liquidity.makeSwapInstructionSimple({
            connection: connection,
            poolKeys: pool_key,
            userKeys: {
                tokenAccounts: wallet_token_accounts,
                owner: buyer.publicKey,
            },
            amountIn: quote_token_amount,
            amountOut: base_token_amount,
            fixedSide: "in",
            makeTxVersion: raydium_sdk_1.TxVersion.V0,
        });
        const transactions = yield (0, raydium_sdk_1.buildSimpleTransaction)({
            connection: connection,
            makeTxVersion: raydium_sdk_1.TxVersion.V0,
            payer: buyer.publicKey,
            innerTransactions: innerTransactions,
            addLookupTableInfo: global_1.EnvironmentManager.getCacheLTA(),
            recentBlockhash: (yield connection.getLatestBlockhash()).blockhash,
        });
        return { result: global_1.SPL_ERROR.E_OK, value: transactions };
    }
    catch (error) {
        console.error("Error: [buy Tokens] error code: ", error);
        return { result: global_1.SPL_ERROR.E_FAIL, value: undefined };
    }
});
exports.buyToken = buyToken;
//# sourceMappingURL=buy_token.js.map