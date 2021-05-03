import Collectible from 0x6f48f852926e137a

pub fun main(addr: Address): [UInt64] {
    let collectionCapability = getAccount(addr).getCapability<&{Collectible.CollectibleCollectionPublic}>(Collectible.CollectionPublicPath)
    if !collectionCapability.check() {
        return []
    }
    let collection = collectionCapability.borrow()!
    return collection.getIDs()
}
