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
            "metadataURI": maintainer.getMetadataURI(id: id)
        })
    }
    return metadataArray
}
