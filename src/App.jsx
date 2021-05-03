import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { Tabs, TabList, Tab, Image, Container, Divider, Box, Text } from '@chakra-ui/react';
import Authenticate from './components/Authenticate';
import Create from './components/Create';
import Market from './components/Market';
import MyItems from './components/MyItems';
import Item from './components/Item';
import Logo from './assets/logo.png';

function App() {
  return (
    <Router>
      <Image
        maxWidth="400px"
        // margin="auto"
        src={Logo}
        alt="Sustainable Metadata"
      />
      <Tabs size="md" variant="enclosed">
        <TabList>
          <Link color="teal.500"to="/"><Tab>Sign In/Out</Tab></Link>
          <Link color="teal.500"to="/create"><Tab>Create</Tab></Link>
          <Link color="teal.500"to="/market"><Tab>Market</Tab></Link>
          <Link color="teal.500"to="/items"><Tab>My Items</Tab></Link>
        </TabList>

        <Switch>
          <Route exact path="/"><Authenticate /></Route>
          <Route exact path="/create"><Create /></Route>
          <Route exact path="/market"><Market /></Route>
          <Route exact path="/items"><MyItems /></Route>
          <Route path="/item/:id"><Item /></Route>
        </Switch>
      </Tabs>

      <Container m={4} maxWidth="3xl">
        <Box pos="fixed" w="100%" zIndex={100} bottom="0">
          <Divider mt={10} />
          <Box pt={1} pb={2} bg="white">
            <Text fontSize="sm">
              Created by <a className="footer" href="https://twitter.com/arandoros" target="_blank" rel="noopener noreferrer">@arandoros</a> 🥑 Powered by&nbsp;
                <a className="footer" href="https://onflow.org" target="_blank" rel="noopener noreferrer">Flow</a>,&nbsp;
                <a className="footer" href="https://ethereum.org" target="_blank" rel="noopener noreferrer">Ethereum</a>,&nbsp;
                <a className="footer" href="https://fleek.co" target="_blank" rel="noopener noreferrer">Fleek</a> and&nbsp;
                <a className="footer" href="https://www.npmjs.com/package/geopattern" target="_blank" rel="noopener noreferrer">GeoPattern</a>
            </Text>
          </Box>
        </Box>
      </Container>
    </Router>
  );
}

export default App;
