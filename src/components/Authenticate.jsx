import React, { useState, useEffect } from 'react';
import * as fcl from '@onflow/fcl';
import { Button, Container, Box, Flex, Text } from '@chakra-ui/react';

const SignInOutButton = ({ user: { loggedIn } }) => {
  const signInOrOut = async (event) => {
    event.preventDefault();

    if (loggedIn) {
      fcl.unauthenticate();
    } else {
      fcl.authenticate();
    }
  };

  return (
    <Button onClick={signInOrOut}>
      {loggedIn ? 'Sign Out' : 'Sign In / Up'}
    </Button>
  );
};

const Authenticate = () => {
  const [user, setUser] = useState({});

  useEffect(
    () =>
      fcl.currentUser().subscribe((currentUser) => setUser({ ...currentUser })),
    []
  );

  return (
    <Container ml={0} mr={4} mt={4} maxWidth="3xl">
      <Box p={2} mb={4}>
        <SignInOutButton user={user} />
      </Box>

      <Flex>
        <Text ml={4} mr={4} color="gray.500" fontWeight="semibold">Current Address: </Text>
        <Text as="kbd">{user.addr || 'N/A'}</Text>
      </Flex>
    </Container>
  );
};

export default Authenticate;
