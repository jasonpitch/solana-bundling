/// <reference types="jito-ts/node_modules/@solana/web3.js" />
import { CacheLTA, ProgramId } from "@raydium-io/raydium-sdk";
import { Keypair, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
export declare enum SPL_ERROR {
    E_INVALID_ARGUE = -1,
    E_OK = 0,
    E_FAIL = 1,
    E_CHECK_FAIL = 2,
    E_SEND_TX_FAIL = 3,
    E_CONFIRM_TX_FAIL = 4,
    E_CREATE_META_FAILED = 5,
    E_TOTAL_MINT_FAIL = 6
}
export declare enum NETWORK_MODE {
    NETWORK_MAIN = 0,
    NETWORK_DEV = 1,
    NETWORK_TEST = 2
}
export interface TX_RET {
    result: SPL_ERROR;
    value: string | (VersionedTransaction | Transaction)[] | undefined;
}
export interface TOKEN_INFO {
    address: string;
    name: string;
    symbol: string;
    decimal: number;
}
export interface BUNDLE_TRANSACTION {
    txn: VersionedTransaction;
    signer: Keypair;
}
export declare class EnvironmentManager {
    private static NET_MODE;
    private static JITO_BLOCKENGINE_URL;
    private static RPC_CHECK_URL;
    private static RPC_VERIFY_CODE;
    private static RPC_CONFIRM_CODE;
    private static RPC_MAIN_URL;
    private static RPC_DEVNET_URL;
    private static RPC_TESTNET_URL;
    private static JITO_KEYPAIR;
    private static QUOTE_TOKEN_INFO;
    static setNetworkMode(mode: NETWORK_MODE): void;
    static setMainNetURL(url: string): void;
    static setDevNetURL(url: string): void;
    static setTestNettURL(url: string): void;
    static getMainNetURL(): string;
    static getDevNetURL(): string;
    static getTestNetURL(): string;
    static getNetworkMode(): NETWORK_MODE;
    static getRpcNetUrl(): string;
    static setNetUrls(main_url: string, dev_url: string, test_url?: string): void;
    static getBundlrUrl(): string;
    static getCheckUrl(): string;
    static getVerifyCode(): string;
    static getConfirmCode(): string;
    static getProgramID(): ProgramId;
    static setQuoteTokenInfo(token_info: TOKEN_INFO): void;
    static getQuoteTokenInfo(): TOKEN_INFO;
    static getCacheLTA(): CacheLTA | undefined;
    static getFeeDestinationId(): PublicKey;
    static getJitoBlockEngine(): string;
    static setJitoKeypair(auth_key: Keypair): void;
    static getJitoKeypair(): Keypair;
}
