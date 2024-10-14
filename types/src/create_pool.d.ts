/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, Keypair } from "@solana/web3.js";
import { TX_RET } from "./global";
export declare const createPool: (connection: Connection, token_owner: Keypair, token_address: string, input_token_amount: number, input_quote_amount: number) => Promise<TX_RET>;
