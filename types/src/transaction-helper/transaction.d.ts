/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { Connection, Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import { SPL_ERROR } from "../global";
export declare const sendAndConfirmTransactionWithCheck: (connection: Connection, signer: Keypair, txn: Transaction | VersionedTransaction) => Promise<SPL_ERROR>;
export declare const sendAndConfirmTransactionsWithCheck: (connection: Connection, signer: Keypair, txns: string | (VersionedTransaction | Transaction)[]) => Promise<SPL_ERROR>;
export declare const signTransaction: (signer: Keypair, txn: VersionedTransaction) => void;
export declare const signTransactions: (signer: Keypair, txns: (VersionedTransaction | Transaction)[]) => void;
