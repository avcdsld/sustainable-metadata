import fleekStorage from '@fleekhq/fleek-storage-js'

class FleekService {
  async update(json, prevMetadataURI) {
    return this.upload({
      ...json,
      prevMetadataURI
    });
  }

  async upload(json) {
    const data = JSON.stringify({
      ...json,
      createdAt: Date.now()
    });
    const result = await fleekStorage.upload({
      apiKey: process.env.REACT_APP_FLEEK_API_KEY,
      apiSecret: process.env.REACT_APP_FLEEK_API_SECRET,
      bucket: process.env.REACT_APP_FLEEK_BACKET_NAME || undefined,
      key: `metadata-${json.title}-${Date.now()}`,
      data: Buffer.from(data),
    });
    return result.hash;
  }

  async uploadSvg(svgStr, title) {
    const result = await fleekStorage.upload({
      apiKey: process.env.REACT_APP_FLEEK_API_KEY,
      apiSecret: process.env.REACT_APP_FLEEK_API_SECRET,
      bucket: process.env.REACT_APP_FLEEK_BACKET_NAME || undefined,
      key: `image-${title}-${Date.now()}`,
      data: Buffer.from(svgStr),
    });
    return result.hash;
  }

  getURL(hash) {
    return `https://ipfs.fleek.co/ipfs/${hash}`;
  }
}

const fleek = new FleekService();

export { fleek };
