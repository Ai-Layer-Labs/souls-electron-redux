// ESM compatible test file to verify ENS resolution
import { ethers } from 'ethers';

async function testENSResolution() {
  console.log('Testing ENS resolution with ethers.js');
  
  // Set up provider using Infura as a fallback
  // You can use any provider that supports ENS
  const provider = new ethers.providers.InfuraProvider('mainnet');
  console.log('Provider initialized with Infura (public access)');
  
  // Test data
  const testNames = [
    'vitalik.eth',
    'ens.eth',
    'nick.eth'
  ];
  
  const testAddresses = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
    '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5', // ens.eth
    '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5'  // nick.eth
  ];
  
  // Test name to address resolution
  console.log('\nTesting name to address resolution:');
  for (const name of testNames) {
    try {
      const address = await provider.resolveName(name);
      console.log(`${name} resolves to: ${address || 'Not found'}`);
    } catch (error) {
      console.error(`Error resolving ${name}:`, error.message);
    }
  }
  
  // Test address to name resolution
  console.log('\nTesting address to name resolution:');
  for (const address of testAddresses) {
    try {
      const name = await provider.lookupAddress(address);
      console.log(`${address} resolves to: ${name || 'No ENS name found'}`);
    } catch (error) {
      console.error(`Error looking up ${address}:`, error.message);
    }
  }
}

// Run the test
testENSResolution().catch(console.error); 