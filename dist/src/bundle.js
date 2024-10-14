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
exports.createAndSendBundleTransaction = void 0;
const web3_js_1 = require("@solana/web3.js");
const searcher_1 = require("jito-ts/dist/sdk/block-engine/searcher");
const global_1 = require("./global");
const types_1 = require("jito-ts/dist/sdk/block-engine/types");
const utils = __importStar(require("./utility"));
const transaction_1 = require("./transaction-helper/transaction");
const bs58_1 = __importDefault(require("bs58"));
const createAndSendBundleTransaction = (connection, fee, bundleTransactions, payer) => __awaiter(void 0, void 0, void 0, function* () {
    const seacher = (0, searcher_1.searcherClient)(global_1.EnvironmentManager.getJitoBlockEngine(), global_1.EnvironmentManager.getJitoKeypair());
    const _tipAccount = (yield seacher.getTipAccounts())[0];
    const tipAccount = new web3_js_1.PublicKey(_tipAccount);
    let transactionsConfirmResult = false;
    let breakCheckTransactionStatus = false;
    try {
        const recentBlockhash = (yield connection.getLatestBlockhash("finalized"))
            .blockhash;
        const bundleTransaction = [];
        for (let i = 0; i < bundleTransactions.length; i++) {
            bundleTransactions[i].txn.message.recentBlockhash = recentBlockhash;
            (0, transaction_1.signTransaction)(bundleTransactions[i].signer, bundleTransactions[i].txn);
            bundleTransaction.push(bundleTransactions[i].txn);
        }
        let bundleTx = new types_1.Bundle(bundleTransaction, 5);
        bundleTx.addTipTx(payer, fee, tipAccount, recentBlockhash);
        seacher.onBundleResult((bundleResult) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(bundleResult);
            if (bundleResult.rejected) {
                try {
                    if (bundleResult.rejected.simulationFailure.msg.includes("custom program error") ||
                        bundleResult.rejected.simulationFailure.msg.includes("Error processing Instruction")) {
                        breakCheckTransactionStatus = true;
                    }
                    else if (bundleResult.rejected.simulationFailure.msg.includes("This transaction has already been processed") ||
                        bundleResult.rejected.droppedBundle.msg.includes("Bundle partially processed")) {
                        transactionsConfirmResult = true;
                        breakCheckTransactionStatus = true;
                    }
                }
                catch (error) { }
            }
        }), (error) => {
            console.log("Bundle error:", error);
            breakCheckTransactionStatus = true;
        });
        yield seacher.sendBundle(bundleTx);
        setTimeout(() => {
            breakCheckTransactionStatus = true;
        }, 20000);
        const trxHash = bs58_1.default.encode(bundleTransaction[bundleTransaction.length - 1].signatures[0]);
        while (!breakCheckTransactionStatus) {
            yield utils.sleep(2000);
            try {
                const result = yield connection.getSignatureStatus(trxHash, {
                    searchTransactionHistory: true,
                });
                if (result && result.value && result.value.confirmationStatus) {
                    transactionsConfirmResult = true;
                    breakCheckTransactionStatus = true;
                }
            }
            catch (error) {
                transactionsConfirmResult = false;
                breakCheckTransactionStatus = true;
            }
        }
        return transactionsConfirmResult;
    }
    catch (error) {
        console.error("Creating and sending bundle failed...", error);
        yield utils.sleep(10000);
        return false;
    }
});
exports.createAndSendBundleTransaction = createAndSendBundleTransaction;
//# sourceMappingURL=bundle.js.map