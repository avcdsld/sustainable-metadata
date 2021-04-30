import Collectible from 0xf8d6e0586b0a20c7

pub fun main(addr: Address): [UInt64] {
    let collectionCapability = getAccount(addr).getCapability<&{Collectible.CollectibleCollectionPublic}>(Collectible.CollectionPublicPath)
    if !collectionCapability.check() {
        return []
    }
    let collection = collectionCapability.borrow()!
    return collection.getIDs()
}
