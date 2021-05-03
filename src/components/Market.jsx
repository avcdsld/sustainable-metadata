import React, { useState } from 'react';
import { Button, Container, Box, SimpleGrid, useToast } from '@chakra-ui/react';
import { flow } from '../services/flow';
import Card from './Card';

export default function Market() {
  const [nftsData, setNftsData] = useState();
  const toast = useToast();

  const showItems = async (event) => {
    event.preventDefault();
    try {
      const res = await flow.getAirDropsMetadata();
      if (res.errorMessage) throw new Error(res.errorMessage);
      setNftsData(res.map(metadata => { return { ...metadata, unknownOwner: true } }));
    } catch (e) {
      toast({ description: String(e), status: 'error', position: 'top', duration: 9000, isClosable: true });
    }
  };

  return (
    <Container ml={0} mr={4} mt={4} maxWidth="3xl">
      <Box p={2}>
        <Button onClick={showItems}>Show Items</Button>
      </Box>

      <SimpleGrid columns={[1, 2, 4]}>
        {nftsData ? nftsData.map(function (data) {
          const { id, metadataURI } = data;
          return (
            <Card key={id} addr="na" tokenId={id} metadataURI={metadataURI} airDrop="true" />
          );
        }) : null}
      </SimpleGrid>
    </Container>
  );
}
