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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
const web3_js_1 = require("@solana/web3.js");
const global_1 = require("./global");
const spl_token_1 = require("@solana/spl-token");
const js_1 = require("@metaplex-foundation/js");
const fs_1 = require("fs");
const utility_1 = require("./utility");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const transaction = __importStar(require("./transaction-helper/transaction"));
const totalSupplyMint = (connection, token_owner, token_addr, total_supply) => __awaiter(void 0, void 0, void 0, function* () {
    const token_mint = new web3_js_1.PublicKey(token_addr);
    const mint_info = yield (0, spl_token_1.getMint)(connection, token_mint);
    try {
        const owner_token_account = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, token_owner, token_mint, token_owner.publicKey);
        if (owner_token_account.address.toBase58().length <= 0) {
            console.log('Error: [Total Supply Mint] failed to create associated token account');
            return global_1.SPL_ERROR.E_TOTAL_MINT_FAIL;
        }
        const token_amount = (0, utility_1.xWeiAmount)(total_supply, mint_info.decimals);
        const mint_result = yield (0, spl_token_1.mintTo)(connection, token_owner, token_mint, owner_token_account.address, token_owner, BigInt(token_amount.toString()));
        if (mint_result.length <= 0) {
            console.log('Error: [Total Supply Mint] failed to mint to owner wallet');
            return global_1.SPL_ERROR.E_TOTAL_MINT_FAIL;
        }
    }
    catch (error) {
        console.log('Error: [Total Supply Mint] failed to mint to owner wallet');
        return global_1.SPL_ERROR.E_TOTAL_MINT_FAIL;
    }
    return global_1.SPL_ERROR.E_OK;
});
const createTokenMetaData = (connection, token_owner, token_addr, name, symbol, token_logo, rpc_url, description) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const metaplex = js_1.Metaplex.make(connection)
            .use((0, js_1.keypairIdentity)(token_owner))
            .use((0, js_1.irysStorage)({
            address: global_1.EnvironmentManager.getBundlrUrl(),
            providerUrl: rpc_url,
            timeout: 60000,
        }));
        const buffer = (0, fs_1.readFileSync)(token_logo);
        const file = (0, js_1.toMetaplexFile)(buffer, 'token-logo.png');
        const logo_url = yield metaplex.storage().upload(file);
        if (logo_url.length <= 0) {
            console.log('Error: [Create Token Meta Data] failed to load metapelx data!!!');
            return global_1.SPL_ERROR.E_FAIL;
        }
        const metaplex_data = {
            name: name,
            symbol: symbol,
            image: logo_url,
            description,
        };
        const { uri } = yield metaplex.nfts().uploadMetadata(metaplex_data);
        if (uri.length <= 0) {
            console.log('Error: [Create Token Meta Data] failed to upload metaplex data!!!');
            return global_1.SPL_ERROR.E_FAIL;
        }
        const token_mint = new web3_js_1.PublicKey(token_addr);
        const [metadata_PDA] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('metadata'), mpl_token_metadata_1.PROGRAM_ID.toBuffer(), token_mint.toBuffer()], mpl_token_metadata_1.PROGRAM_ID);
        const token_meta_data = {
            name: name,
            symbol: symbol,
            uri: uri,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
        };
        const txn = new web3_js_1.Transaction().add((0, mpl_token_metadata_1.createCreateMetadataAccountV3Instruction)({
            metadata: metadata_PDA,
            mint: token_mint,
            mintAuthority: token_owner.publicKey,
            payer: token_owner.publicKey,
            updateAuthority: token_owner.publicKey,
        }, {
            createMetadataAccountArgsV3: {
                data: token_meta_data,
                isMutable: true,
                collectionDetails: null,
            },
        }));
        if ((yield transaction.sendAndConfirmTransactionWithCheck(connection, token_owner, txn)) !== global_1.SPL_ERROR.E_OK) {
            return global_1.SPL_ERROR.E_FAIL;
        }
    }
    catch (error) {
        console.log('Error: [Create Token Meta Data] failed to create meta data -', error);
        return global_1.SPL_ERROR.E_FAIL;
    }
    return global_1.SPL_ERROR.E_OK;
});
const createToken = (connection, token_owner, name, symbol, decimal, total_supply, token_logo, description) => __awaiter(void 0, void 0, void 0, function* () {
    if (name.length <= 0 ||
        symbol.length <= 0 ||
        token_logo.length <= 0 ||
        token_owner.publicKey.toBase58().length <= 0 ||
        global_1.EnvironmentManager.getRpcNetUrl().length <= 0 ||
        decimal <= 0 ||
        total_supply <= 0) {
        console.log('Error: [Create Token] invalid argument to create token!!!');
        return { result: global_1.SPL_ERROR.E_INVALID_ARGUE, value: undefined };
    }
    if ((yield (0, utility_1.checkFileExists)(token_logo)) === false) {
        console.log('Error: [Create Token] invalid argument to create token - token logo path invalid!!!');
        return { result: global_1.SPL_ERROR.E_INVALID_ARGUE, value: undefined };
    }
    console.log('<-----------------[Create Token]---------------------');
    console.log('Name: ', name, 'Symbol: ', symbol, 'Decimal: ', decimal, 'Total Supply: ', total_supply, 'Token Logo: ', token_logo, 'Token Description: ', description);
    console.log('<-----------------[Create Token]---------------------');
    const token_mint = yield (0, spl_token_1.createMint)(connection, token_owner, token_owner.publicKey, token_owner.publicKey, decimal);
    if (token_mint.toBase58().length <= 0) {
        console.log('Error: [Create Token] failed to create mint!!!');
        return { result: global_1.SPL_ERROR.E_FAIL, value: undefined };
    }
    console.log('<-----------------[Create Token Meta Data]---------------------');
    const meta_result = yield createTokenMetaData(connection, token_owner, token_mint.toBase58(), name, symbol, token_logo, global_1.EnvironmentManager.getRpcNetUrl(), description);
    if (meta_result !== global_1.SPL_ERROR.E_OK) {
        console.log('Error: [Create Token] failed to create meta data!!!');
        return { result: global_1.SPL_ERROR.E_CREATE_META_FAILED, value: undefined };
    }
    console.log('<-----------------[Token mint]---------------------');
    if ((yield totalSupplyMint(connection, token_owner, token_mint.toBase58(), total_supply)) !== global_1.SPL_ERROR.E_OK) {
        console.log('Error: [Create Token] failed to mint total supply!!!');
        return { result: global_1.SPL_ERROR.E_TOTAL_MINT_FAIL, value: undefined };
    }
    console.log('Success: [Create Token] Mint Address: ', token_mint.toBase58());
    return { result: global_1.SPL_ERROR.E_OK, value: token_mint.toBase58() };
});
exports.createToken = createToken;
//# sourceMappingURL=create_token.js.map