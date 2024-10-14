/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, Keypair } from '@solana/web3.js';
import { TX_RET } from './global';
export declare const createToken: (connection: Connection, token_owner: Keypair, name: string, symbol: string, decimal: number, total_supply: number, token_logo: string, description?: string) => Promise<TX_RET>;
