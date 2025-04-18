# ENS Utility for Dive

This utility adds Ethereum Name Service (ENS) resolution capabilities to the Dive platform. It allows you to:

1. Resolve ENS names to Ethereum addresses (`resolve_ens`)
2. Look up ENS names for Ethereum addresses (`lookup_address`)

## How It Works

The ENS utility integrates with the MCP server infrastructure to provide ENS resolution tools. It uses the Infura provider for Ethereum network access and doesn't require any API keys.

## Using the Tools

### 1. Resolve ENS Name to Address

Use the `resolve_ens` tool to convert an ENS name to an Ethereum address.

**Input:**
```json
{
  "name": "vitalik.eth"
}
```

**Output:**
```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
}
```

### 2. Look up Address to ENS Name

Use the `lookup_address` tool to find the primary ENS name for an Ethereum address.

**Input:**
```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
}
```

**Output:**
```json
{
  "name": "vitalik.eth"
}
```

## Implementation Notes

- The ENS utility uses Infura's public gateway for Ethereum network access.
- For better performance or higher request limits, you could modify the code to use an Alchemy API key by changing the provider initialization in `ensUtility.ts`.
- The tools are registered as high-priority tools in the MCP server manager.

## Testing

You can test the ENS resolution functionality directly using the `ensTest.mjs` script:

```bash
cd services
node utils/ensTest.mjs
```

This will perform test lookups for common ENS names and addresses. 