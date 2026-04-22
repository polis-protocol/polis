# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Reporting a vulnerability

**Do not report security vulnerabilities through public GitHub issues.**

Please email **security@deegalabs.com** with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

You will receive a response within 48 hours. We will work with you to understand and address the issue before any public disclosure.

## Scope

The following are in scope:

- `@polis/core` — schema validation, config parsing
- `@polis/bff` — authentication, authorization, API security
- `@polis/contracts` — smart contract vulnerabilities
- `@polis/react` — XSS, injection vectors

## Smart contracts

For vulnerabilities in deployed contracts on Base mainnet, please include the contract address and chain ID in your report. Critical contract vulnerabilities may qualify for a bug bounty (to be announced).
