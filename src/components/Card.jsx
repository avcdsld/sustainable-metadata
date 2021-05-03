import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Image, Text, LinkBox, Stack, AspectRatio, Button, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { fleek } from '../services/fleek';
import { flow } from '../services/flow';
import { geoPattern } from '../services/geoPattern';
import LoadingGif from '../assets/loading.gif';

function Card(props) {
  const { tokenId, metadataURI, maintainer, owner } = props;
  const [metadata, setMetadata] = useState({});
  const [svgUri, setSvgUri] = useState(LoadingGif);
  const toast = useToast();

  useEffect(() => {
    let unmounted = false;
    axios.get(fleek.getURL(metadataURI), { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, data: {}}).then(({ data }) => {
      const { title, description, creator } = data;
      if (!unmounted) {
        setMetadata({ title, description, creator });
        setSvgUri(geoPattern.generateSvgUri(title + description + creator));
      }
    }).catch(e => {
      alert(String(e));
    });
    return () => unmounted = true;
  // eslint-disable-next-line
  }, []);

  const getNFT = async (id) => {
    try {
      const res = await flow.getNft(id);
      if (res.errorMessage) throw new Error(res.errorMessage);
      toast({ description: 'You\'ve got NFT', status: 'success', position: 'top', duration: 9000, isClosable: true });
    } catch (e) {
      toast({ description: String(e), status: 'error', position: 'top', duration: 9000, isClosable: true });
    }
  };

  return (
    <Box p={4} borderWidth={1} margin={2}>
      {props.airDrop ?
        (
          <div>
            <Text my={2} fontSize="xs" as="kbd">#{tokenId}</Text>
            <AspectRatio maxW="400px" ratio={1}>
              <Image src={svgUri} alt={'#' + tokenId} objectFit="cover" />
            </AspectRatio>
            <Stack align={{ base: "center", md: "stretch" }} textAlign={{ base: "center", md: "left" }} mt={{ base: 4, md: 2 }} ml={{ md: 2 }}>
              <Text fontWeight="bold" textTransform="uppercase" fontSize="lg" letterSpacing="wide" color="teal.600">
                {metadata.title || ''}
              </Text>
              <Text my={1} color="gray.800" fontWeight="semibold">
                {metadata.creator || ''}
              </Text>
              <Text my={2} color="gray.500">
                {metadata.description || ''}
              </Text>
            </Stack>
            <Button mt={2} onClick={() => getNFT(tokenId)}>Get for Free</Button>
          </div>
        ) : (
          <LinkBox>
            <Link to={`/item/${tokenId}?maintainer=${maintainer}&owner=${owner}`}>
              <Text my={2} fontSize="xs" as="kbd">#{tokenId}</Text>
              <AspectRatio maxW="400px" ratio={1}>
                <Image src={svgUri} alt={'#' + tokenId} objectFit="cover" />
              </AspectRatio>
              <Stack align={{ base: "center", md: "stretch" }} textAlign={{ base: "center", md: "left" }} mt={{ base: 4, md: 2 }} ml={{ md: 2 }}>
                <Text fontWeight="bold" textTransform="uppercase" fontSize="lg" letterSpacing="wide" color="teal.600">
                  {metadata.title || ''}
                </Text>
                <Text my={1} color="gray.800" fontWeight="semibold">
                  {metadata.creator || ''}
                </Text>
                <Text my={2} color="gray.500">
                  {metadata.description || ''}
                </Text>
              </Stack>
            </Link>
          </LinkBox>
        )
      }
    </Box>
  );
}

export default Card;
