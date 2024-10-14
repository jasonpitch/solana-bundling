/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, Keypair } from "@solana/web3.js";
import { TX_RET } from "./global";
import { LiquidityPoolKeys } from "@raydium-io/raydium-sdk";
export declare const sellToken: (connection: Connection, buyer: Keypair, token_address: string, base_amount: number, quote_amount: number, pool_key: LiquidityPoolKeys) => Promise<TX_RET>;
