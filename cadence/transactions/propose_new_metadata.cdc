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
