import Collectible from 0xf8d6e0586b0a20c7

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
