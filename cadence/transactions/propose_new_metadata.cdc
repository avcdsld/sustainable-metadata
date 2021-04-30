import Collectible from 0xf8d6e0586b0a20c7

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
