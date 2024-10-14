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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpenBookMarket = void 0;
const web3_js_1 = require("@solana/web3.js");
const global_1 = require("./global");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const spl_token_1 = require("@solana/spl-token");
const bn_js_1 = __importDefault(require("bn.js"));
const transactions = __importStar(require("./transaction-helper/transaction"));
function makeCreateMarketInstruction(_a) {
    return __awaiter(this, arguments, void 0, function* ({ connection, wallet, baseInfo, quoteInfo, lotSize, // 1
    tickSize, // 0.01
    dexProgramId, makeTxVersion, lookupTableCache }) {
        const market = (0, raydium_sdk_1.generatePubKey)({
            fromPublicKey: wallet,
            programId: dexProgramId
        });
        const requestQueue = (0, raydium_sdk_1.generatePubKey)({
            fromPublicKey: wallet,
            programId: dexProgramId
        });
        const eventQueue = (0, raydium_sdk_1.generatePubKey)({
            fromPublicKey: wallet,
            programId: dexProgramId
        });
        const bids = (0, raydium_sdk_1.generatePubKey)({
            fromPublicKey: wallet,
            programId: dexProgramId
        });
        const asks = (0, raydium_sdk_1.generatePubKey)({
            fromPublicKey: wallet,
            programId: dexProgramId
        });
        const baseVault = (0, raydium_sdk_1.generatePubKey)({
            fromPublicKey: wallet,
            programId: spl_token_1.TOKEN_PROGRAM_ID
        });
        const quoteVault = (0, raydium_sdk_1.generatePubKey)({
            fromPublicKey: wallet,
            programId: spl_token_1.TOKEN_PROGRAM_ID
        });
        const feeRateBps = 0;
        const quoteDustThreshold = new bn_js_1.default(100);
        function getVaultOwnerAndNonce() {
            const vaultSignerNonce = new bn_js_1.default(0);
            while (true) {
                try {
                    const vaultOwner = web3_js_1.PublicKey.createProgramAddressSync([
                        market.publicKey.toBuffer(),
                        vaultSignerNonce.toArrayLike(Buffer, "le", 8)
                    ], dexProgramId);
                    return { vaultOwner, vaultSignerNonce };
                }
                catch (e) {
                    vaultSignerNonce.iaddn(1);
                    if (vaultSignerNonce.gt(new bn_js_1.default(25555)))
                        throw Error("find vault owner error");
                }
            }
        }
        function initializeMarketInstruction({ programId, marketInfo }) {
            const dataLayout = (0, raydium_sdk_1.struct)([
                (0, raydium_sdk_1.u8)("version"),
                (0, raydium_sdk_1.u32)("instruction"),
                (0, raydium_sdk_1.u64)("baseLotSize"),
                (0, raydium_sdk_1.u64)("quoteLotSize"),
                (0, raydium_sdk_1.u16)("feeRateBps"),
                (0, raydium_sdk_1.u64)("vaultSignerNonce"),
                (0, raydium_sdk_1.u64)("quoteDustThreshold")
            ]);
            const keys = [
                { pubkey: marketInfo.id, isSigner: false, isWritable: true },
                { pubkey: marketInfo.requestQueue, isSigner: false, isWritable: true },
                { pubkey: marketInfo.eventQueue, isSigner: false, isWritable: true },
                { pubkey: marketInfo.bids, isSigner: false, isWritable: true },
                { pubkey: marketInfo.asks, isSigner: false, isWritable: true },
                { pubkey: marketInfo.baseVault, isSigner: false, isWritable: true },
                { pubkey: marketInfo.quoteVault, isSigner: false, isWritable: true },
                { pubkey: marketInfo.baseMint, isSigner: false, isWritable: false },
                { pubkey: marketInfo.quoteMint, isSigner: false, isWritable: false },
                // Use a dummy address if using the new dex upgrade to save tx space.
                {
                    pubkey: marketInfo.authority
                        ? marketInfo.quoteMint
                        : web3_js_1.SYSVAR_RENT_PUBKEY,
                    isSigner: false,
                    isWritable: false
                }
            ]
                .concat(marketInfo.authority
                ? { pubkey: marketInfo.authority, isSigner: false, isWritable: false }
                : [])
                .concat(marketInfo.authority && marketInfo.pruneAuthority
                ? {
                    pubkey: marketInfo.pruneAuthority,
                    isSigner: false,
                    isWritable: false
                }
                : []);
            const data = Buffer.alloc(dataLayout.span);
            dataLayout.encode({
                version: 0,
                instruction: 0,
                baseLotSize: marketInfo.baseLotSize,
                quoteLotSize: marketInfo.quoteLotSize,
                feeRateBps: marketInfo.feeRateBps,
                vaultSignerNonce: marketInfo.vaultSignerNonce,
                quoteDustThreshold: marketInfo.quoteDustThreshold
            }, data);
            return new web3_js_1.TransactionInstruction({
                keys,
                programId,
                data
            });
        }
        const { vaultOwner, vaultSignerNonce } = getVaultOwnerAndNonce();
        const ZERO = new bn_js_1.default(0);
        const baseLotSize = new bn_js_1.default(Math.round(10 ** baseInfo.decimals * lotSize));
        const quoteLotSize = new bn_js_1.default(Math.round(lotSize * 10 ** quoteInfo.decimals * tickSize));
        if (baseLotSize.eq(ZERO))
            throw Error("lot size is too small");
        if (quoteLotSize.eq(ZERO))
            throw Error("tick size or lot size is too small");
        const ins1 = [];
        const accountLamports = yield connection.getMinimumBalanceForRentExemption(165);
        ins1.push(web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: baseVault.seed,
            newAccountPubkey: baseVault.publicKey,
            lamports: accountLamports,
            space: 165,
            programId: spl_token_1.TOKEN_PROGRAM_ID
        }), web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: quoteVault.seed,
            newAccountPubkey: quoteVault.publicKey,
            lamports: accountLamports,
            space: 165,
            programId: spl_token_1.TOKEN_PROGRAM_ID
        }), (0, spl_token_1.createInitializeAccountInstruction)(baseVault.publicKey, baseInfo.mint, vaultOwner), (0, spl_token_1.createInitializeAccountInstruction)(quoteVault.publicKey, quoteInfo.mint, vaultOwner));
        const EVENT_QUEUE_ITEMS = 128; // Default: 2978
        const REQUEST_QUEUE_ITEMS = 63; // Default: 63
        const ORDERBOOK_ITEMS = 201; // Default: 909
        const eventQueueSpace = EVENT_QUEUE_ITEMS * 88 + 44 + 48;
        const requestQueueSpace = REQUEST_QUEUE_ITEMS * 80 + 44 + 48;
        const orderBookSpace = ORDERBOOK_ITEMS * 80 + 44 + 48;
        const ins2 = [];
        ins2.push(web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: market.seed,
            newAccountPubkey: market.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(raydium_sdk_1.MARKET_STATE_LAYOUT_V2.span),
            space: raydium_sdk_1.MARKET_STATE_LAYOUT_V2.span,
            programId: dexProgramId
        }), web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: requestQueue.seed,
            newAccountPubkey: requestQueue.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(requestQueueSpace),
            space: requestQueueSpace,
            programId: dexProgramId
        }), web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: eventQueue.seed,
            newAccountPubkey: eventQueue.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(eventQueueSpace),
            space: eventQueueSpace,
            programId: dexProgramId
        }), web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: bids.seed,
            newAccountPubkey: bids.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(orderBookSpace),
            space: orderBookSpace,
            programId: dexProgramId
        }), web3_js_1.SystemProgram.createAccountWithSeed({
            fromPubkey: wallet,
            basePubkey: wallet,
            seed: asks.seed,
            newAccountPubkey: asks.publicKey,
            lamports: yield connection.getMinimumBalanceForRentExemption(orderBookSpace),
            space: orderBookSpace,
            programId: dexProgramId
        }), initializeMarketInstruction({
            programId: dexProgramId,
            marketInfo: {
                id: market.publicKey,
                requestQueue: requestQueue.publicKey,
                eventQueue: eventQueue.publicKey,
                bids: bids.publicKey,
                asks: asks.publicKey,
                baseVault: baseVault.publicKey,
                quoteVault: quoteVault.publicKey,
                baseMint: baseInfo.mint,
                quoteMint: quoteInfo.mint,
                baseLotSize: baseLotSize,
                quoteLotSize: quoteLotSize,
                feeRateBps: feeRateBps,
                vaultSignerNonce: vaultSignerNonce,
                quoteDustThreshold: quoteDustThreshold
            }
        }));
        const ins = {
            address: {
                marketId: market.publicKey,
                requestQueue: requestQueue.publicKey,
                eventQueue: eventQueue.publicKey,
                bids: bids.publicKey,
                asks: asks.publicKey,
                baseVault: baseVault.publicKey,
                quoteVault: quoteVault.publicKey,
                baseMint: baseInfo.mint,
                quoteMint: quoteInfo.mint
            },
            innerTransactions: [
                {
                    instructions: ins1,
                    signers: [],
                    instructionTypes: [
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.initAccount,
                        raydium_sdk_1.InstructionType.initAccount
                    ]
                },
                {
                    instructions: ins2,
                    signers: [],
                    instructionTypes: [
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.createAccount,
                        raydium_sdk_1.InstructionType.initMarket
                    ]
                }
            ]
        };
        return {
            address: ins.address,
            innerTransactions: yield (0, raydium_sdk_1.splitTxAndSigners)({
                connection,
                makeTxVersion,
                computeBudgetConfig: undefined,
                payer: wallet,
                innerTransaction: ins.innerTransactions,
                lookupTableCache
            })
        };
    });
}
const createOpenBookMarket = (connection_1, token_owner_1, token_address_1, ...args_1) => __awaiter(void 0, [connection_1, token_owner_1, token_address_1, ...args_1], void 0, function* (connection, token_owner, token_address, min_order_size = 1, tick_size = 0.01) {
    if (token_owner.publicKey.toBase58().length <= 0 ||
        token_address.length <= 0) {
        console.log("Error: [Create Open Book Market] invalid argument for create open book market");
        return global_1.SPL_ERROR.E_INVALID_ARGUE;
    }
    try {
        const token_mint = new web3_js_1.PublicKey(token_address);
        const mint_info = yield (0, spl_token_1.getMint)(connection, token_mint);
        const base_token = new raydium_sdk_1.Token(spl_token_1.TOKEN_PROGRAM_ID, token_address, mint_info.decimals);
        const quote_token_info = global_1.EnvironmentManager.getQuoteTokenInfo();
        const quote_token = new raydium_sdk_1.Token(spl_token_1.TOKEN_PROGRAM_ID, quote_token_info.address, quote_token_info.decimal, quote_token_info.symbol, quote_token_info.name);
        console.log("[Create Open Book Market]<--------------------make marekt instruction");
        const { innerTransactions, address } = yield makeCreateMarketInstruction({
            connection: connection,
            wallet: token_owner.publicKey,
            baseInfo: base_token,
            quoteInfo: quote_token,
            lotSize: min_order_size,
            tickSize: tick_size,
            dexProgramId: global_1.EnvironmentManager.getProgramID().OPENBOOK_MARKET,
            makeTxVersion: raydium_sdk_1.TxVersion.V0,
            lookupTableCache: global_1.EnvironmentManager.getCacheLTA()
        });
        console.log("[Create Open Book Market]<--------------------create simple transaction");
        const txns = yield (0, raydium_sdk_1.buildSimpleTransaction)({
            connection: connection,
            makeTxVersion: raydium_sdk_1.TxVersion.V0,
            payer: token_owner.publicKey,
            innerTransactions: innerTransactions,
            addLookupTableInfo: global_1.EnvironmentManager.getCacheLTA()
        });
        console.log("[Create Open Book Market]<--------------------send and confirm transaction");
        const txn_result = yield transactions.sendAndConfirmTransactionsWithCheck(connection, token_owner, txns);
        if (txn_result !== global_1.SPL_ERROR.E_OK) {
            console.error("Error: [Create Open Book Market] failed to send and confirm transaction");
            return global_1.SPL_ERROR.E_FAIL;
        }
    }
    catch (error) {
        console.error("Error: [Create Open Book Market] error occured: ", error);
        return global_1.SPL_ERROR.E_FAIL;
    }
    console.log("Success: [Create Open Book Market] Success to create open book market id");
    return global_1.SPL_ERROR.E_OK;
});
exports.createOpenBookMarket = createOpenBookMarket;
//# sourceMappingURL=create_open_market.js.map