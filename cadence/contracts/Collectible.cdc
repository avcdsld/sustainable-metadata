// import NonFungibleToken from 0xf8d6e0586b0a20c7
import NonFungibleToken from 0x631e88ae7f1d7c20 // Testnet

pub contract Collectible: NonFungibleToken {
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)

    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MaintainerStoragePath: StoragePath
    pub let MaintainerPublicPath: PublicPath

    pub var totalSupply: UInt64

    // A simple air-drop mechanism for minimum implementation
    pub var airDrops: @{UInt64: NFT}

    pub resource NFT: NonFungibleToken.INFT {
        pub let id: UInt64
        pub let minter: Address
        access(contract) var metadataURIs: [String]

        pub fun getMetadataURIs(): [String] {
            return self.metadataURIs
        }

        init(minter: Address, metadataURI: String) {
            Collectible.totalSupply = Collectible.totalSupply + 1 as UInt64
            self.id = Collectible.totalSupply
            self.minter = minter
            self.metadataURIs = [metadataURI]
        }
    }

    pub resource interface CollectibleMaintainerPublic {
        pub fun getMintedIDs(): [UInt64]
        pub fun getMetadataURI(id: UInt64): String
        pub fun getProposingMetadataURI(id: UInt64): String?
        pub fun acceptNewMetadataURI(token: &NFT, newMetadataURI: String)
    }

    pub resource Maintainer: CollectibleMaintainerPublic {
        access(self) var metadataURIs: {UInt64: String}
        access(self) var proposingMetadataURIs: {UInt64: String}

        pub fun mintNFT(metadataURI: String): @NFT {
            let token <- create NFT(minter: self.owner!.address, metadataURI: metadataURI)
            self.metadataURIs[token.id] = metadataURI
            return <- token
        }

        pub fun getMintedIDs(): [UInt64] {
            return self.metadataURIs.keys
        }

        pub fun getMetadataURI(id: UInt64): String {
            return self.metadataURIs[id]!
        }

        pub fun getProposingMetadataURI(id: UInt64): String? {
            return self.proposingMetadataURIs[id]
        }

        pub fun proposeNewMetadataURI(id: UInt64, newMetadataURI: String) {
            self.proposingMetadataURIs[id] = newMetadataURI
        }

        pub fun acceptNewMetadataURI(token: &NFT, newMetadataURI: String) {
            if (self.proposingMetadataURIs[token.id] != newMetadataURI) {
                panic("Invalid newMetadataURI")
            }
            self.proposingMetadataURIs[token.id] = nil
            self.metadataURIs[token.id] = newMetadataURI
            token.metadataURIs.append(newMetadataURI)
        }

        init() {
            self.metadataURIs = {}
            self.proposingMetadataURIs = {}
        }
    }

    pub resource interface CollectibleCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun batchDeposit(tokens: @NonFungibleToken.Collection)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowCollectible(id: UInt64): &Collectible.NFT
    }

    pub resource Collection: CollectibleCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("Cannot withdraw: Collectible does not exist in the collection.")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun batchWithdraw(ids: [UInt64]): @NonFungibleToken.Collection {
            let batchCollection <- create Collection()
            for id in ids {
                batchCollection.deposit(token: <-self.withdraw(withdrawID: id))
            }
            return <-batchCollection
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @Collectible.NFT
            let id = token.id
            let oldToken <- self.ownedNFTs[id] <- token
            if self.owner?.address != nil {
                emit Deposit(id: id, to: self.owner?.address)
            }
            destroy oldToken
        }

        pub fun batchDeposit(tokens: @NonFungibleToken.Collection) {
            let keys = tokens.getIDs()
            for key in keys {
                self.deposit(token: <-tokens.withdraw(withdrawID: key))
            }
            destroy tokens
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return &self.ownedNFTs[id] as &NonFungibleToken.NFT
        }

        pub fun borrowCollectible(id: UInt64): &Collectible.NFT {
            let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
            return ref as! &Collectible.NFT
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    pub fun createMaintainer(): @Maintainer {
        return <- create Maintainer()
    }

    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <-create Collectible.Collection()
    }

    pub fun getAirDropIDs(): [UInt64] {
        return self.airDrops.keys
    }

    pub fun depositAirDrop(token: @NFT) {
        self.airDrops[token.id] <-! token
    }

    pub fun withdrawAirDrop(id: UInt64): @NFT {
        return <- self.airDrops.remove(key: id)!
    }

    init() {
        self.CollectionStoragePath = /storage/CollectibleCollection000
        self.CollectionPublicPath = /public/CollectibleCollection000
        self.MaintainerStoragePath = /storage/CollectibleMaintainer000
        self.MaintainerPublicPath = /public/CollectibleMaintainer000

        self.totalSupply = 0
        self.airDrops <- {}
        self.account.save<@Collection>(<- create Collection(), to: self.CollectionStoragePath)
        self.account.link<&{CollectibleCollectionPublic}>(self.CollectionPublicPath, target: self.CollectionStoragePath)
        emit ContractInitialized()
    }
}
