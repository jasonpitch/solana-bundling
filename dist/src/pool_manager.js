"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolManager = void 0;
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const global_1 = require("./global");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const utility_1 = require("./utility");
class PoolManager {
    constructor(base_token_info, quote_token_info, base_amount, quote_amount, market_id) {
        this.base_token_info = base_token_info;
        this.quote_token_info = quote_token_info;
        this.base_amount = base_amount;
        this.quote_amount = quote_amount;
        this.market_id = market_id;
        const { base_token, quote_token } = this.getPairToken();
        this.pool_keys = raydium_sdk_1.Liquidity.getAssociatedPoolKeys({
            version: 4,
            marketVersion: 3,
            baseMint: base_token.mint,
            quoteMint: quote_token.mint,
            baseDecimals: base_token.decimals,
            quoteDecimals: quote_token.decimals,
            marketId: this.market_id,
            programId: global_1.EnvironmentManager.getProgramID().AmmV4,
            marketProgramId: global_1.EnvironmentManager.getProgramID().OPENBOOK_MARKET
        });
        this.pool_info = {
            status: new bn_js_1.BN(0),
            baseDecimals: this.base_token_info.decimal,
            lpDecimals: this.quote_token_info.decimal,
            quoteDecimals: this.quote_token_info.decimal,
            baseReserve: (0, utility_1.xWeiAmount)(this.base_amount, this.base_token_info.decimal),
            quoteReserve: (0, utility_1.xWeiAmount)(this.quote_amount, this.quote_token_info.decimal),
            lpSupply: new bn_js_1.BN(base_amount),
            startTime: new bn_js_1.BN(0)
        };
    }
    initializePoolInfo(market_id) {
        this.market_id = market_id;
        const { base_token, quote_token } = this.getPairToken();
        this.pool_keys = raydium_sdk_1.Liquidity.getAssociatedPoolKeys({
            version: 4,
            marketVersion: 3,
            baseMint: base_token.mint,
            quoteMint: quote_token.mint,
            baseDecimals: base_token.decimals,
            quoteDecimals: quote_token.decimals,
            marketId: this.market_id,
            programId: global_1.EnvironmentManager.getProgramID().AmmV4,
            marketProgramId: global_1.EnvironmentManager.getProgramID().OPENBOOK_MARKET
        });
        this.pool_info = {
            status: new bn_js_1.BN(0),
            baseDecimals: this.base_token_info.decimal,
            lpDecimals: this.quote_token_info.decimal,
            quoteDecimals: this.quote_token_info.decimal,
            baseReserve: (0, utility_1.xWeiAmount)(this.base_amount, this.base_token_info.decimal),
            quoteReserve: (0, utility_1.xWeiAmount)(this.quote_amount, this.quote_token_info.decimal),
            lpSupply: new bn_js_1.BN(this.base_amount),
            startTime: new bn_js_1.BN(0)
        };
        console.log("Simulated Pool baseReserve: ", this.pool_info.baseReserve.toString());
        console.log("Simulated Pool quoteReserve: ", this.pool_info.quoteReserve.toString());
    }
    computeSolAmount(base_amount, in_out) {
        const { base_token, quote_token } = this.getPairToken();
        // console.log("Simulated PoolInfo: ", this.pool_info);
        if (in_out) {
            const { maxAmountIn } = raydium_sdk_1.Liquidity.computeAmountIn({
                poolKeys: this.pool_keys,
                poolInfo: this.pool_info,
                amountOut: new raydium_sdk_1.TokenAmount(base_token, base_amount, false),
                currencyIn: quote_token,
                slippage: new raydium_sdk_1.Percent(1, 100)
            });
            return maxAmountIn;
        }
        else {
            const { minAmountOut } = raydium_sdk_1.Liquidity.computeAmountOut({
                poolKeys: this.pool_keys,
                poolInfo: this.pool_info,
                amountIn: new raydium_sdk_1.TokenAmount(base_token, base_amount, false),
                currencyOut: quote_token,
                slippage: new raydium_sdk_1.Percent(1, 100)
            });
            return minAmountOut;
        }
    }
    computeCurrentPrice() {
        return this.quote_amount / this.base_amount;
    }
    buyToken(base_amount) {
        const sol_input = this.computeSolAmount(base_amount, true);
        const { base_token, quote_token } = this.getPairToken();
        const { amountOut } = raydium_sdk_1.Liquidity.computeAmountOut({
            poolKeys: this.pool_keys,
            poolInfo: this.pool_info,
            amountIn: sol_input,
            currencyOut: base_token,
            slippage: new raydium_sdk_1.Percent(1, 100)
        });
        this.quote_amount += sol_input.raw
            .div(new bn_js_1.BN(10 ** this.quote_token_info.decimal))
            .toNumber();
        this.base_amount -= base_amount;
        this.pool_info = Object.assign(Object.assign({}, this.pool_info), { baseReserve: this.pool_info.baseReserve.sub(amountOut.raw), quoteReserve: this.pool_info.quoteReserve.add(sol_input.raw) });
        console.log("Simulated Pool baseReserve: ", this.pool_info.baseReserve.toString());
        console.log("Simulated Pool quoteReserve: ", this.pool_info.quoteReserve.toString());
        // this.initializePoolInfo(this.market_id);
    }
    sellToken(base_amount) {
        const sol_input = this.computeSolAmount(base_amount, false);
        this.quote_amount -= sol_input.raw
            .div(new bn_js_1.BN(10 ** this.quote_token_info.decimal))
            .toNumber();
        this.base_amount += base_amount;
        this.initializePoolInfo(this.market_id);
    }
    getPairToken() {
        const base_mint = new web3_js_1.PublicKey(this.base_token_info.address);
        const base = new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, base_mint, this.base_token_info.decimal, this.base_token_info.symbol, this.base_token_info.name);
        const quote = new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, new web3_js_1.PublicKey(this.quote_token_info.address), this.quote_token_info.decimal, this.quote_token_info.symbol, this.quote_token_info.name);
        return { base_token: base, quote_token: quote };
    }
}
exports.PoolManager = PoolManager;
//# sourceMappingURL=pool_manager.js.map