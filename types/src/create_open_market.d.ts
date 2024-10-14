/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, Keypair } from "@solana/web3.js";
import { SPL_ERROR } from "./global";
export declare const createOpenBookMarket: (connection: Connection, token_owner: Keypair, token_address: string, min_order_size?: number, tick_size?: number) => Promise<SPL_ERROR>;
