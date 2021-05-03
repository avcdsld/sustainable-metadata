import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';

const getIDsScript = `
  import Collectible from 0x6f48f852926e137a

  pub fun main(addr: Address): [UInt64] {
      let collectionCapability = getAccount(addr).getCapability<&{Collectible.CollectibleCollectionPublic}>(Collectible.CollectionPublicPath)
      if !collectionCapability.check() {
          return []
      }
      let collection = collectionCapability.borrow()!
      return collection.getIDs()
  }
`;

const getMedatadaScript = `\
  import Collectible from 0x6f48f852926e137a

  pub fun main(addr: Address, ids: [UInt64]): [{String: String}] {
      var metadataArray: [{String: String}] = []
      let collectionCapability = getAccount(addr).getCapability<&{Collectible.CollectibleCollectionPublic}>(Collectible.CollectionPublicPath)
      if !collectionCapability.check() {
          return metadataArray
      }
      let collection = collectionCapability.borrow()!
      for id in ids {
          let token = collection.borrowCollectible(id: id)
          let metadataURIs = token.getMetadataURIs()
          let maintainer = getAccount(token.minter).getCapability<&{Collectible.CollectibleMaintainerPublic}>(Collectible.MaintainerPublicPath).borrow()!
          let newMetadataURI = maintainer.getProposingMetadataURI(id: id)
          if (newMetadataURI != nil) {
              metadataArray.append({
                  "id": id.toString(),
                  "metadataURI": metadataURIs[metadataURIs.length - 1],
                  "newMetadataURI": newMetadataURI!,
                  "minter": token.minter.toString()
              })
          } else {
              metadataArray.append({
                  "id": id.toString(),
                  "metadataURI": metadataURIs[metadataURIs.length - 1],
                  "newMetadataURI": "",
                  "minter": token.minter.toString()
              })
          }
      }
      return metadataArray
  }
`;

const getAllMintedMetadataScript = `
  import Collectible from 0x6f48f852926e137a

  pub fun main(addr: Address): [{String: String}] {
    var metadataArray: [{String: String}] = []
    let maintainerCapability = getAccount(addr).getCapability<&{Collectible.CollectibleMaintainerPublic}>(Collectible.MaintainerPublicPath)
    if !maintainerCapability.check() {
        return metadataArray
    }
    let maintainer = maintainerCapability.borrow()!
    let ids = maintainer.getMintedIDs()
    for id in ids {
        metadataArray.append({
            "id": id.toString(),
            "metadataURI": maintainer.getMetadataURI(id: id),
            "minter": addr.toString()
        })
    }
    return metadataArray
  }
`;

const getMintedMetadataScript = `
  import Collectible from 0x6f48f852926e137a

  pub fun main(addr: Address, id: UInt64): {String: String} {
      let maintainerCapability = getAccount(addr).getCapability<&{Collectible.CollectibleMaintainerPublic}>(Collectible.MaintainerPublicPath)
      if !maintainerCapability.check() {
          return {}
      }
      let maintainer = maintainerCapability.borrow()!
      let newMetadataURI = maintainer.getProposingMetadataURI(id: id)
      if (newMetadataURI != nil) {
          let metadata = {
              "id": id.toString(),
              "metadataURI": maintainer.getMetadataURI(id: id),
              "newMetadataURI": newMetadataURI!,
              "minter": addr.toString()
          }
          return metadata
      } else {
          let metadata = {
              "id": id.toString(),
              "metadataURI": maintainer.getMetadataURI(id: id),
              "newMetadataURI": "",
              "minter": addr.toString()
          }
          return metadata
      }
  }
`;

const getAirDropsMetadataScript = `
import Collectible from 0x6f48f852926e137a

pub fun main(): [{String: String}] {
    var metadataArray: [{String: String}] = []
    let ids = Collectible.getAirDropIDs()
    for id in ids {
      let token = &Collectible.airDrops[id] as &Collectible.NFT
      let metadataURIs = token.getMetadataURIs()
      metadataArray.append({
          "id": id.toString(),
          "metadataURI": metadataURIs[metadataURIs.length - 1],
          "minter": token.minter.toString()
      })
    }
    return metadataArray
}
`;

const mintNFTTransaction = `
import Collectible from 0x6f48f852926e137a

transaction(metadataURI: String) {
    prepare(acct: AuthAccount) {
        // Setup Collection
        if acct.borrow<&Collectible.Collection>(from: Collectible.CollectionStoragePath) == nil {
            acct.save(<- Collectible.createEmptyCollection(), to: Collectible.CollectionStoragePath)
            acct.link<&{Collectible.CollectibleCollectionPublic}>(Collectible.CollectionPublicPath, target: Collectible.CollectionStoragePath)
        }

        // Setup Maintainer
        if acct.borrow<&Collectible.Maintainer>(from: Collectible.MaintainerStoragePath) == nil {
            acct.save(<- Collectible.createMaintainer(), to: Collectible.MaintainerStoragePath)
            acct.link<&{Collectible.CollectibleMaintainerPublic}>(Collectible.MaintainerPublicPath, target: Collectible.MaintainerStoragePath)
        }

        // Mint NFT
        let maintainer = acct.borrow<&Collectible.Maintainer>(from: Collectible.MaintainerStoragePath)!
        let token <- maintainer.mintNFT(metadataURI: metadataURI)

        // Deposit to AirDrops
        Collectible.depositAirDrop(token: <- token)

        log("Mint NFT and Deposit AirDrop succeeded")
    }
}
`;

const getNftTransaction = `\
import Collectible from 0x6f48f852926e137a

transaction(id: UInt64) {
    prepare(acct: AuthAccount) {
        // Setup Collection
        if acct.borrow<&Collectible.Collection>(from: Collectible.CollectionStoragePath) == nil {
            acct.save(<- Collectible.createEmptyCollection(), to: Collectible.CollectionStoragePath)
            acct.link<&{Collectible.CollectibleCollectionPublic}>(Collectible.CollectionPublicPath, target: Collectible.CollectionStoragePath)
        }

        // Withdraw from AirDrops
        let token <- Collectible.withdrawAirDrop(id: id)
        let collection = acct.borrow<&Collectible.Collection>(from: Collectible.CollectionStoragePath)!
        collection.deposit(token: <- token)

        log("Withdraw NFT from AirDrops succeeded")
    }
}
`;

const proposeNewMetadataURITransaction = `
import Collectible from 0x6f48f852926e137a

transaction(id: UInt64, newMetadataURI: String) {
    prepare(acct: AuthAccount) {
        // Setup Maintainer
        if acct.borrow<&Collectible.Maintainer>(from: Collectible.MaintainerStoragePath) == nil {
            acct.save(<- Collectible.createMaintainer(), to: Collectible.MaintainerStoragePath)
            acct.link<&{Collectible.CollectibleMaintainerPublic}>(Collectible.MaintainerPublicPath, target: Collectible.MaintainerStoragePath)
        }

        // Propose New Metadata URI
        let maintainer = acct.borrow<&Collectible.Maintainer>(from: Collectible.MaintainerStoragePath)!
        maintainer.proposeNewMetadataURI(id: id, newMetadataURI: newMetadataURI)

        log("Propose New Metadata URI succeeded")
    }
}
`;

const acceptNewMetadataURITransaction = `
import Collectible from 0x6f48f852926e137a

transaction(id: UInt64) {
    prepare(acct: AuthAccount) {
        let collection = acct.borrow<&Collectible.Collection>(from: Collectible.CollectionStoragePath)!
        let token = collection.borrowCollectible(id: id) as! &Collectible.NFT

        let maintainer = getAccount(token.minter).getCapability<&{Collectible.CollectibleMaintainerPublic}>(Collectible.MaintainerPublicPath).borrow()!
        let newMetadataURI = maintainer.getProposingMetadataURI(id: token.id)

        if (newMetadataURI == nil) {
            panic("There is no newMetadataURI")
        } else  {
            maintainer.acceptNewMetadataURI(token: token, newMetadataURI: newMetadataURI!)
        }

        log("Accept New Metadata URI succeeded")
    }
}
`;

const transferNFTForMigrationTransaction = `
import NonFungibleToken from 0x631e88ae7f1d7c20
import Collectible from 0x6f48f852926e137a

transaction(withdrawID: UInt64) {
    prepare(acct: AuthAccount) {
        let collection = acct.borrow<&Collectible.Collection>(from: Collectible.CollectionStoragePath)!
        let token <- collection.withdraw(withdrawID: withdrawID)

        // let gateKeeperAccount = getAccount(0xcf4f93e326e5876f)
        let gateKeeperAccount = acct
        let receiver = gateKeeperAccount.getCapability<&{Collectible.CollectibleCollectionPublic}>(Collectible.CollectionPublicPath).borrow()!
        receiver.deposit(token: <- token)
    }
}
`;

class FlowService {
  async authenticate() {
    await fcl.authenticate();
  }

  unauthenticate() {
    fcl.unauthenticate();
  }

  async getCurrentUserAddressInner() {
    return new Promise((resolve, reject) => {
      try {
        fcl.currentUser().subscribe(async curretUser => {
          return resolve(curretUser.addr);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async getCurrentUserAddress() {
    let addr = await this.getCurrentUserAddressInner();
    if (!addr) {
      await this.authenticate();
      addr = await this.getCurrentUserAddressInner();
    }
    return addr;
  }

  async executeScript(script, args = []) {
    const response = await fcl.send([ fcl.script(script), fcl.args(args) ]);
    return await fcl.decode(response);
  }

  async sendTransaction(transaction, args) {
    const response = await fcl.send([
      fcl.transaction(transaction),
      fcl.args(args),
      fcl.proposer(fcl.currentUser().authorization),
      fcl.authorizations([fcl.currentUser().authorization]),
      fcl.payer(fcl.currentUser().authorization),
      fcl.limit(9999),
    ]);
    return await fcl.tx(response).onceSealed();
  }

  async getMetadata(addr, id) {
    const metadataArray = await this.executeScript(getMedatadaScript, [ fcl.arg(addr, t.Address), fcl.arg([Number(id)], t.Array(t.UInt64)) ]);
    if (!metadataArray || metadataArray.length === 0) return {};
    return metadataArray[0];
  }

  async getAllMetadata(addr) {
    const ids = await this.executeScript(getIDsScript, [ fcl.arg(addr, t.Address) ]);
    if (!ids || ids.length === 0) return [];
    return await this.executeScript(getMedatadaScript, [ fcl.arg(addr, t.Address), fcl.arg(ids.map(Number), t.Array(t.UInt64)) ]);
  }

  async getMintedMetadata(addr, id) {
    return await this.executeScript(getMintedMetadataScript, [ fcl.arg(addr, t.Address), fcl.arg(Number(id), t.UInt64) ]);
  }

  async getAllMintedMetadata(addr) {
    return await this.executeScript(getAllMintedMetadataScript, [ fcl.arg(addr, t.Address) ]);
  }

  async getAirDropsMetadata() {
    return await this.executeScript(getAirDropsMetadataScript);
  }

  async mintNFT(metadataURI) {
    return await this.sendTransaction(mintNFTTransaction, [ fcl.arg(metadataURI, t.String) ]);
  }

  async getNft(id) {
    return await this.sendTransaction(getNftTransaction, [ fcl.arg(Number(id), t.UInt64) ]);
  }

  async proposeNewMetadataURI(id, newMetadataURI) {
    return await this.sendTransaction(proposeNewMetadataURITransaction, [ fcl.arg(Number(id), t.UInt64), fcl.arg(newMetadataURI, t.String) ]);
  }

  async acceptNewMetadataURI(id) {
    return await this.sendTransaction(acceptNewMetadataURITransaction, [ fcl.arg(Number(id), t.UInt64) ]);
  }

  async transferNFTForMigration(id) {
    return await this.sendTransaction(transferNFTForMigrationTransaction, [ fcl.arg(Number(id), t.UInt64) ]);
  }
}

const flow = new FlowService();

export { flow };
