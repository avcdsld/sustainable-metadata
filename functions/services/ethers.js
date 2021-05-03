require('dotenv').config();

const ethers = require('ethers');
const abi = require('./CollectibleAbi.json');

class EthersService {
  constructor() {
    console.log({env: process.env})
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    this.signer = new ethers.Wallet(process.env.MINTER_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, this.signer);
  }

  async mint(to, tokenId, metadataURI) {
    const opts = {
      gasPrice: await this.provider.getGasPrice(),
      gasLimit: this.getGas(await this.contract.estimateGas.mint(to, tokenId, metadataURI))
    };
    console.log('call mint:', { to, tokenId, metadataURI, opts: this.readableOpts(opts) });
    const tx = await this.contract.mint(to, tokenId, metadataURI, opts);
    console.log('txHash:', tx.hash);
    return tx.hash;
  }

  getGas(estimatedGas) {
    return Math.floor(Number(estimatedGas.toString()) * 1.5);
  }

  readableOpts(opts) {
    const result = {};
    for (const key of Object.keys(opts)) {
      result[key] = opts[key].toString();
    }
    return result;
  }
}

exports.ethers = new EthersService();
