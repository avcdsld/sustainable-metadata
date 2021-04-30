import Collectible from 0xf8d6e0586b0a20c7

transaction {
    prepare(acct: AuthAccount) {
        // Setup Collection
        if acct.borrow<&Collectible.Collection>(from: Collectible.CollectionStoragePath) == nil {
            acct.save(<- Collectible.createEmptyCollection(), to: Collectible.CollectionStoragePath)
            acct.link<&{Collectible.CollectibleCollectionPublic}>(Collectible.CollectionPublicPath, target: Collectible.CollectionStoragePath)
        }

        // Withdraw from AirDrops
        let airDropIDs = Collectible.getAirDropIDs()
        log(airDropIDs)
        let token <- Collectible.withdrawAirDrop(id: airDropIDs[0])

        let collection = acct.borrow<&Collectible.Collection>(from: Collectible.CollectionStoragePath)!
        collection.deposit(token: <- token)

        log("Withdraw NFT from AirDrops succeeded")
    }
}
