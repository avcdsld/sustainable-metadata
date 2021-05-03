require('dotenv').config();

const fcl = require('@onflow/fcl');
const t = require('@onflow/types');

const validateDepositScript = `
import Collectible from 0x6f48f852926e137a

pub fun main(id: UInt64): Bool {
    let gateKeeperAccount = getAccount(0xGateKeeper)
    let collectionCapability = gateKeeperAccount.getCapability<&{Collectible.CollectibleCollectionPublic}>(Collectible.CollectionPublicPath)
    if !collectionCapability.check() {
        return false
    }
    let collection = collectionCapability.borrow()!
    let token = collection.borrowNFT(id: id)
    return token != nil
}
`;

class FlowService {
  constructor() {
    fcl.config()
      // .put("accessNode.api", "http://localhost:8080"); // local Flow emulator
      .put('accessNode.api', 'https://access-testnet.onflow.org'); // Flow testnet
  }

  async executeScript(script, args = []) {
    const response = await fcl.send([
      fcl.script`${script.replace(/0xGateKeeper/gi, process.env.GATE_KEEPER_FLOW_ADDRESS)}`,
      fcl.args(args)
    ]);
    return await fcl.decode(response);
  }

  async validateDeposit(id) {
    const isValid = await this.executeScript(validateDepositScript, [ fcl.arg(Number(id), t.UInt64) ]);
    if (!isValid) {
      throw new Error('No Deposit');
    }
  }
}

exports.flow = new FlowService();
