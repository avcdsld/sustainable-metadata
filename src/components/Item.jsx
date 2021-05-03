import React, { useState, useEffect } from 'react';
import { Container, Text, Box, Divider, Input, Grid, Link, Button, Tag, useToast } from '@chakra-ui/react';
import { useParams, useLocation } from 'react-router-dom';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { Base64 } from 'js-base64';
import { fleek } from '../services/fleek';
import { flow } from '../services/flow';
import { geoPattern } from '../services/geoPattern';
import LoadingGif from '../assets/loading.gif';

export default function Item() {
  const { id } = useParams();
  const urlSearchParams = new URLSearchParams(useLocation().search);
  const maintainer = urlSearchParams.get('maintainer');
  const owner = urlSearchParams.get('owner');
  const [metadata, setMetadata] = useState({});
  const [nftTitle, setNftTitle] = useState(null);
  const [nftDescription, setNftDescription] = useState(null);
  const [nftCreator, setNftCreator] = useState(null);
  const [svgUri, setSvgUri] = useState(LoadingGif);
  const toast = useToast();

  useEffect(() => {
    let unmounted = false;
    const execute = async () => {
      try {
        if (!unmounted) {
          const res = owner.startsWith('0x') ? await flow.getMetadata(owner, id) : await flow.getMintedMetadata(maintainer, id);

          const currentMetadataResult = await axios.get(fleek.getURL(res.metadataURI), { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, data: {}});
          const { title, description, creator, createdAt } = currentMetadataResult.data;

          let newTitle = '';
          let newDescription = '';
          let newCreator = '';
          if (res.newMetadataURI) {
            const newMetadataResult = await axios.get(fleek.getURL(res.newMetadataURI), { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, data: {}});
            newTitle = newMetadataResult.data.title;
            newDescription = newMetadataResult.data.description;
            newCreator = newMetadataResult.data.creator;
          }

          setMetadata({
            title,
            description,
            creator,
            createdAt,
            metadataURI: res.metadataURI,
            newMetadataURI: res.newMetadataURI,
            newTitle,
            newDescription,
            newCreator,
            maintainer: res.minter,
          });
          setSvgUri(geoPattern.generateSvgUri(title + description + creator));
        }
      } catch (e) {
        toast({ description: String(e), status: 'error', position: 'top', duration: 9000, isClosable: true });
      }
    };
    execute();
    return () => unmounted = true;
  // eslint-disable-next-line
  }, []);

  const updateNftTitle = (event) => { event.preventDefault(); setNftTitle(event.target.value); };
  const updateNftDescription = (event) => { event.preventDefault(); setNftDescription(event.target.value); };
  const updateNftCreator = (event) => { event.preventDefault(); setNftCreator(event.target.value); };

  const proposeNewMetadata = async (event) => {
    event.preventDefault();
    try {
      if (
        (nftTitle === metadata.title || nftTitle === null) &&
        (nftDescription === metadata.description || nftDescription === null) &&
        (nftCreator === metadata.creator || nftCreator === null)
      ) {
        throw new Error('There is nothing to change.');
      }
      const newMetadata = {
        title: nftTitle,
        description: nftDescription,
        creator: nftCreator
      }
      const newMetadataURI = await fleek.update(newMetadata, metadata.metadataURI);
      console.log({newMetadataURI});
      const res = await flow.proposeNewMetadataURI(id, newMetadataURI);
      if (res.errorMessage) throw new Error(res.errorMessage);
      toast({ description: 'Succeeded! Metadata will be updated if the owner accepts it.', status: 'success', position: 'top', duration: 9000, isClosable: true });
    } catch (e) {
      toast({ description: String(e), status: 'error', position: 'top', duration: 9000, isClosable: true });
    }
  };

  const acceptNewMetadata = async (event) => {
    event.preventDefault();
    try {
      if (!metadata.newMetadataURI) {
        throw new Error('There is no metadata proposed.');
      }
      const res = await flow.acceptNewMetadataURI(id);
      if (res.errorMessage) throw new Error(res.errorMessage);
      toast({ description: 'Succeeded! Metadata has been updated.', status: 'success', position: 'top', duration: 9000, isClosable: true });
    } catch (e) {
      toast({ description: String(e), status: 'error', position: 'top', duration: 9000, isClosable: true });
    }
  };

  // TODO: This process should be done on the api side.
  const uploadMetadataForEthereumNFT = async () => {
    if (!metadata.title) {
      throw new Error('Invalid metadata');
    }
    const svgBase64 = geoPattern.generateSvgUri(metadata.title + metadata.description + metadata.creator).split('base64,')[1];
    const imageURI = await fleek.uploadSvg(Base64.decode(svgBase64), metadata.title + metadata.description + metadata.creator);
    const metadataForEthereumNFT = {
      title: metadata.title,
      description: metadata.description,
      creator: metadata.creator,
      name: metadata.title,
      external_url: 'https://github.com/avcdsld/sustainable-metadata',
      image_data: fleek.getURL(imageURI),
      attributes: [
        {
          trait_type: 'creator', 
          value: metadata.creator
        },
        {
          display_type: 'date', 
          trait_type: 'createdAt', 
          value: Math.floor(Number(metadata.createdAt) / 1000)
        }
      ]
    };
    return await fleek.update(metadataForEthereumNFT, metadata.metadataURI);
  };

  const migrateToEthereumNFT = async (event) => {
    event.preventDefault();
    try {
      const metadataURIForEthereumNFT = 'bafybeichuklshbakivb7nyhj5w74xql4xs4ejss22g3sblhyzs7t5fef54';

      const resultTransferNFT = await flow.transferNFTForMigration(id);
      if (resultTransferNFT.errorMessage) throw new Error(resultTransferNFT.errorMessage);

      const url = 'https://us-central1-sustainable-metadata.cloudfunctions.net/mint';
      const resultMintNFT = await axios.post(url, {
        id,
        flowOwnerAddress: await flow.getCurrentUserAddress(),
        ethToAddress: '0xe996FE17B655CC6830c3319002B71AF1Fb3ceCd6',
        metadataURI: metadataURIForEthereumNFT
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!resultMintNFT || !resultMintNFT.data) throw new Error('mint error');

      const txHash = resultMintNFT.data.txHash;
      console.log(`https://rinkeby.etherscan.io/tx/${txHash}`)
      toast({ description: `Succeeded! NFT migration transaction has been sent on Ethereum.\nhttps://rinkeby.etherscan.io/tx/${txHash}`, status: 'success', position: 'top', duration: 9000, isClosable: true });

    } catch (e) {
      toast({ description: String(e), status: 'error', position: 'top', duration: 9000, isClosable: true });
    }
  };

  return (
    <Container ml={0} mr={4} mt={4} maxWidth="3xl">
      <Box p={2}>
        <Box mt={4} mb={6}>
          <img style={{ width:'300px', height: '300px' }} src={svgUri} alt={metadata.title || ''} />
        </Box>

        <Text mt={6} mb={4} fontWeight="bold" textTransform="uppercase" fontSize="lg" letterSpacing="wide" color="teal.600">
          Token Info
        </Text>
        <Grid templateColumns="120px 1fr" gap={4} alignItems="center">
          <Text color="gray.500" fontWeight="semibold">ID:</Text>
          <Text>#{id}</Text>

          <Text color="gray.500" fontWeight="semibold">Maintainer:</Text>
          <Text>{metadata.maintainer || ''}</Text>

          <Text color="gray.500" fontWeight="semibold">Owner:</Text>
          <Text>{owner || 'N/A'}</Text>
        </Grid>

        <Divider mt={8} />

        <Text mt={6} mb={4} fontWeight="bold" textTransform="uppercase" fontSize="lg" letterSpacing="wide" color="teal.600">
          Current Metadata
        </Text>
        <Grid templateColumns="120px 1fr" gap={4} alignItems="center">
          <Text color="gray.500" fontWeight="semibold">Title:</Text>
          <Text>{metadata.title || ''}</Text>

          <Text color="gray.500" fontWeight="semibold">Description:</Text>
          <Text>{metadata.description || ''}</Text>

          <Text color="gray.500" fontWeight="semibold">Creator:</Text>
          <Text>{metadata.creator || ''}</Text>

          <Text color="gray.500" fontWeight="semibold">IPFS Hash:</Text>
          <Link href={metadata.metadataURI ? fleek.getURL(metadata.metadataURI) : '#'} isExternal>
            {metadata.metadataURI || ''}<ExternalLinkIcon mx="2px" />
          </Link>
        </Grid>

        <Divider mt={8} />

        <Text mt={6} mb={4} fontWeight="bold" fontSize="lg" letterSpacing="wide" color="teal.600">
          ACCEPT NEW METADATA
          <Tag ml={2} size="sm" colorScheme="orange">Only the owner can accept proposing new metadata</Tag>
        </Text>
        <Grid templateColumns="120px 1fr" gap={2} alignItems="center">
          <Text color="gray.500" fontWeight="semibold">Title:</Text>
          <Input value={metadata.newTitle || ''} size="md" variant="filled" readOnly />
 
          <Text color="gray.500" fontWeight="semibold">Description:</Text>
          <Input value={metadata.newDescription || ''} size="md" variant="filled" readOnly />

          <Text color="gray.500" fontWeight="semibold">Creator:</Text>
          <Input value={metadata.newCreator || ''} size="md" variant="filled" readOnly />

          <Text color="gray.500" fontWeight="semibold" mt={2} mb={2}>IPFS Hash:</Text>
          <Link href={metadata.newMetadataURI ? fleek.getURL(metadata.newMetadataURI) : '#'} isExternal>
            {metadata.newMetadataURI || '-'}<ExternalLinkIcon mx="2px" style={{ display: !metadata.newMetadataURI ? 'none' : '' }} />
          </Link>
        </Grid>
        <Box mt={4} ml={-1}>
          <Button type="button" colorScheme="orange" variant="solid" onClick={acceptNewMetadata} disabled={!metadata.newTitle}>
            Accept
          </Button>
        </Box>

        <Divider mt={8} />

        <Text mt={6} mb={4} fontWeight="bold" fontSize="lg" letterSpacing="wide" color="teal.600">
          PROPOSE NEW METADATA
          <Tag ml={2} size="sm" colorScheme="cyan">Only the maintainer can propose new metadata</Tag>
        </Text>
        <Grid templateColumns="120px 1fr" gap={2} alignItems="center">
          <Text color="gray.500" fontWeight="semibold">Title:</Text>
          <Input defaultValue={metadata.title || ''} size="md" onChange={updateNftTitle} />
 
          <Text color="gray.500" fontWeight="semibold">Description:</Text>
          <Input defaultValue={metadata.description || ''} size="md" onChange={updateNftDescription} />

          <Text color="gray.500" fontWeight="semibold">Creator:</Text>
          <Input defaultValue={metadata.creator || ''} size="md" onChange={updateNftCreator} />
        </Grid>
        <Box mt={4} ml={-1}>
          <Button type="button" colorScheme="blue" variant="solid" onClick={proposeNewMetadata}>
            Propose
          </Button>
        </Box>

        <Divider mt={8} />

        <Text mt={6} mb={4} fontWeight="bold" fontSize="lg" letterSpacing="wide" color="teal.600">
          MIGRATE TO ETHEREUM NFT
          <Tag ml={2} size="sm" colorScheme="green">Only the owner can migrate to Ethereum NFT</Tag>
        </Text>
        This NFT is currently on Flow Testnet and it can be migrated to Ethereum Rinkeby Testnet.
        <Box mt={4} ml={-1} mb={10}>
          <Button type="button" colorScheme="green" variant="solid" onClick={migrateToEthereumNFT}>
            Migrate
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
