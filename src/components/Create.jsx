import React, { useState } from 'react';
import { Input, Button, Container, Box, useToast } from '@chakra-ui/react';
import { fleek } from '../services/fleek';
import { flow } from '../services/flow';

const Create = () => {
  const [nftTitle, setNftTitle] = useState(null);
  const [nftDescription, setNftDescription] = useState(null);
  const [nftCreator, setNftCreator] = useState(null);
  const toast = useToast();

  const createNFT = async (event) => {
    event.preventDefault();
    try {
      const metadata = {
        title: nftTitle,
        description: nftDescription,
        creator: nftCreator
      }
      const metadataURI = await fleek.upload(metadata);
      const res = await flow.mintNFT(metadataURI);
      if (res.errorMessage) throw new Error(res.errorMessage);
      toast({ description: 'The NFT creation was successful and is now on the market.', status: 'success', position: 'top', duration: 9000, isClosable: true });
    } catch (e) {
      toast({ description: String(e), status: 'error', position: 'top', duration: 9000, isClosable: true });
    }
  };

  const updateNftTitle = (event) => { event.preventDefault(); setNftTitle(event.target.value); };
  const updateNftDescription = (event) => { event.preventDefault(); setNftDescription(event.target.value); };
  const updateNftCreator = (event) => { event.preventDefault(); setNftCreator(event.target.value); };

  return (
    <Container ml={0} mr={4} mt={4} maxWidth="3xl">
      <Box p={2}>
        <Input mb={2} placeholder="Title" onChange={updateNftTitle} size="md" />
        <Input mb={2} placeholder="Description" onChange={updateNftDescription} size="md" />
        <Input placeholder="Creator" onChange={updateNftCreator} size="md" />
      </Box>
      <Box p={2}>
        <Button type="button" onClick={createNFT} variant="solid">
          Create Item
        </Button>
      </Box>
    </Container>
  );
};

export default Create;
