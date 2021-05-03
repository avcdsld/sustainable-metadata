const functions = require('firebase-functions');
const { flow } = require('./services/flow');
const { ethers } = require('./services/ethers');
const cors = require('cors')({ origin: true });

const execute = async req => {
  try {
    const { id, flowOwnerAddress, ethToAddress, metadataURI } = req.body;
    console.log({ id, flowOwnerAddress, ethToAddress, metadataURI });

    // TODO: Checking for sending NFTs to GateKeeper could be improved.
    await flow.validateDeposit(id);

    const txHash = await ethers.mint(ethToAddress, id, metadataURI );

    return { success: true, txHash };
  } catch (e) {
    console.log(e);
    return { error: String(e) };
  }
};

exports.mint = functions.https.onRequest((req, res) => {
  if (req.method === 'OPTIONS') {
    cors(req, res, () => res.status(200).send());
    return;
  }

  execute(req).then(result => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS, PUT, DELETE, PATCH');
    res.set('Access-Control-Allow-Headers', 'X-Requested-With, Origin, X-Csrftoken, Content-Type, Accept');
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).send(result);
    }
  });
});
