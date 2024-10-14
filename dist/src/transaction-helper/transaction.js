"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signTransactions = exports.signTransaction = exports.sendAndConfirmTransactionsWithCheck = exports.sendAndConfirmTransactionWithCheck = void 0;
const web3_js_1 = require("@solana/web3.js");
const check_transaction_1 = require("./check_transaction");
const global_1 = require("../global");
const sendAndConfirmTransactionWithCheck = (connection, signer, txn) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((0, check_transaction_1.checkTransactions)(txn, signer) === false) {
            return global_1.SPL_ERROR.E_CHECK_FAIL;
        }
        let res, signature;
        if (txn instanceof web3_js_1.Transaction) {
            txn.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
            signature = yield connection.sendTransaction(txn, [signer]);
        }
        else {
            txn.sign([signer]);
            signature = yield connection.sendTransaction(txn);
        }
        if (signature.length <= 0) {
            console.log("Error: [Send Transaction] failed... ");
            return global_1.SPL_ERROR.E_SEND_TX_FAIL;
        }
        const txnId = yield connection.confirmTransaction({
            signature: signature,
            abortSignal: AbortSignal.timeout(90000),
        });
        if (txnId.value.err) {
            console.log("Error: [Confirm Transaction] failed - ", txnId.value.err);
            return global_1.SPL_ERROR.E_CONFIRM_TX_FAIL;
        }
    }
    catch (error) {
        console.log("Error: [Confirm Transaction] failed - ", error);
        return global_1.SPL_ERROR.E_FAIL;
    }
    return global_1.SPL_ERROR.E_OK;
});
exports.sendAndConfirmTransactionWithCheck = sendAndConfirmTransactionWithCheck;
const sendAndConfirmTransactionsWithCheck = (connection, signer, txns) => __awaiter(void 0, void 0, void 0, function* () {
    for (const txn of txns) {
        if (txn instanceof web3_js_1.VersionedTransaction || txn instanceof web3_js_1.Transaction) {
            const txn_res = yield (0, exports.sendAndConfirmTransactionWithCheck)(connection, signer, txn);
            if (txn_res !== global_1.SPL_ERROR.E_OK) {
                return global_1.SPL_ERROR.E_FAIL;
            }
        }
    }
    return global_1.SPL_ERROR.E_OK;
});
exports.sendAndConfirmTransactionsWithCheck = sendAndConfirmTransactionsWithCheck;
const signTransaction = (signer, txn) => {
    if ((0, check_transaction_1.checkTransactions)(txn, signer)) {
        txn.sign([signer]);
    }
};
exports.signTransaction = signTransaction;
const signTransactions = (signer, txns) => {
    for (const txn of txns) {
        if (txn instanceof web3_js_1.VersionedTransaction) {
            (0, exports.signTransaction)(signer, txn);
        }
    }
};
exports.signTransactions = signTransactions;
//# sourceMappingURL=transaction.js.map