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
