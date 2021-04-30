import Collectible from 0xf8d6e0586b0a20c7

pub fun main(addr: Address): [{String: String}] {
    var newMetadataURIs: [{String: String}] = []
    let collectionCapability = getAccount(addr).getCapability<&{Collectible.CollectibleCollectionPublic}>(Collectible.CollectionPublicPath)
    if !collectionCapability.check() {
        return newMetadataURIs
    }
    let collection = collectionCapability.borrow()!
    let ids = collection.getIDs()
    for id in ids {
        let token = collection.borrowCollectible(id: id) as! &Collectible.NFT
        let maintainer = getAccount(token.minter).getCapability<&{Collectible.CollectibleMaintainerPublic}>(Collectible.MaintainerPublicPath).borrow()!
        let newMetadataURI = maintainer.getProposingMetadataURI(id: id)
        if (newMetadataURI != nil) {
            newMetadataURIs.append({
                "id": id.toString(),
                "newMetadataURI": newMetadataURI!
            })
        }
    }
    return newMetadataURIs
}