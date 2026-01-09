import { create } from "ipfs-http-client";

export function makeIpfsClient(ipfsApiUrl) {
  return create({ url: `${ipfsApiUrl}/api/v0` });
}

export async function addBuffer(ipfs, buf, fileName) {
  const added = await ipfs.add({ content: buf, path: fileName });
  return added.cid.toString();
}

export async function addJson(ipfs, obj, fileName) {
  const buf = Buffer.from(JSON.stringify(obj, null, 2));
  return addBuffer(ipfs, buf, fileName);
}
