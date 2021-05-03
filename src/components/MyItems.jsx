import React, { useState } from 'react';
import { Button, Container, Box, SimpleGrid, Stack } from '@chakra-ui/react';
import { flow } from '../services/flow';
import Card from './Card';

export default function MyItems() {
  const [nftsData, setNftsData] = useState();
  const [addr, setAddr] = useState(null);

  const getOwnedIDs = async (event) => {
    event.preventDefault();
    try {
      const addr = await flow.getCurrentUserAddress();
      setAddr(addr);
      setNftsData(await flow.getAllMetadata(addr));
    } catch (e) {
      alert(String(e));
    }
  };

  const getMintedMetadata = async (event) => {
    event.preventDefault();
    try {
      const addr = await flow.getCurrentUserAddress();
      setAddr(addr);
      const metadataArray = await flow.getAllMintedMetadata(addr);
      setNftsData(metadataArray.map(metadata => { return { ...metadata, unknownOwner: true } }));
    } catch (e) {
      alert(String(e));
    }
  };

  return (
    <Container ml={0} mr={4} mt={4} maxWidth="3xl">
      <Stack>
        <Box p={2} mb={4}>
          <Button onClick={getOwnedIDs} mr={6}>Show Owned Items</Button>
          <Button onClick={getMintedMetadata}>Show Minted Items</Button>
        </Box>
      </Stack>

      <SimpleGrid columns={[1, 2, 4]}>
        {nftsData ? nftsData.map(function (data) {
          const { id, metadataURI, minter } = data;
          return (
            <Card key={id} addr={data.unknownOwner ? 'na' : addr} tokenId={id} metadataURI={metadataURI} maintainer={minter} owner={data.unknownOwner ? '' : addr} />
          );
        }) : null}
      </SimpleGrid>
    </Container>
  );
}
