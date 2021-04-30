import Collectible from 0xf8d6e0586b0a20c7

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
