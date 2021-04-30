import Collectible from 0xf8d6e0586b0a20c7

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
        metadataArray.append({
            "id": id.toString(),
            "metadataURI": metadataURIs[metadataURIs.length - 1]
        })
    }
    return metadataArray
}
