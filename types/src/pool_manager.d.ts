/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { CurrencyAmount, Token } from "@raydium-io/raydium-sdk";
import { TOKEN_INFO } from "./global";
import { PublicKey } from "@solana/web3.js";
interface PairToken {
    base_token: Token;
    quote_token: Token;
}
export declare class PoolManager {
    private base_token_info;
    private quote_token_info;
    private base_amount;
    private quote_amount;
    private market_id;
    private pool_info;
    private pool_keys;
    constructor(base_token_info: TOKEN_INFO, quote_token_info: TOKEN_INFO, base_amount: number, quote_amount: number, market_id: PublicKey);
    initializePoolInfo(market_id: PublicKey): void;
    computeSolAmount(base_amount: number, in_out: boolean): CurrencyAmount;
    computeCurrentPrice(): number;
    buyToken(base_amount: number): void;
    sellToken(base_amount: number): void;
    getPairToken(): PairToken;
}
export {};
