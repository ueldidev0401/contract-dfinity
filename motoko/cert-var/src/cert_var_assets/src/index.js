import { HttpAgent } from '@dfinity/agent';
import { Certificate } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal'
import { cert_var, canisterId } from '../../declarations'

const agent = new HttpAgent({});
const hostname = agent._host.hostname;
if (process.env.NODE_ENV !== "production") {
  agent.fetchRootKey();
}

document.getElementById("certifyBtn").addEventListener("click", async () => {
  const newVal = BigInt(document.getElementById("newValue").value);
  await cert_var.set(newVal);
  const resp = await cert_var.get();

  const log = document.getElementById("var");
  log.innerText = "Verifying...";

  const readState = { certificate: new Uint8Array(resp.certificate[0]) };
  const cert = new Certificate(readState, agent);

  // Check: Certificate verifies.
  if(!(await cert.verify())) {
    log.innerText = "Verification failed.";
    return;
  }
  
  const te = new TextEncoder();
  const pathTime = [te.encode('time')];
  const rawTime = cert.lookup(pathTime);
  const idlMessage = new Uint8Array([
      ...new TextEncoder().encode('DIDL\x00\x01\x7d'),
      ...new Uint8Array(rawTime),
  ]);
  const decodedTime = IDL.decode(
    [IDL.Nat], idlMessage
  )[0];
  const time = Number(decodedTime) / 1e9;

  // Check: The diff between decoded time and local time is within 5s.
  const now = Date.now() / 1000;
  if(Math.abs(time - now) > 5) {
    document.getElementById("var").innerText = "Timing is wrong.";
    return;
  };

  // Checks:
  // - Canister ID is correct.
  // - Certified data is correct.
  const cid = Principal.fromText(canisterId);
  const pathData = [te.encode('canister'),
                    cid.toUint8Array(),
                    te.encode('certified_data')];
  const rawData = cert.lookup(pathData);
  const decodedData = IDL.decode(
    [IDL.Nat32],
    new Uint8Array([
      ...new TextEncoder().encode('DIDL\x00\x01\x79'),
      ...new Uint8Array(rawData),
    ]),
  )[0];
  const expectedData = resp.value;
  if (expectedData !== decodedData) {
    log.innerText = "Wrong certified data!";
    return;
  }

  log.innerText = "Certified response.";
});
