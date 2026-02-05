# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- ESLint v9 flat config with TypeScript support.
- `package-lock.json` for reproducible installs.
- Docker test runner defaults in `docker-compose.yml`.

### Changed
- Dependency versions refreshed across dev tooling.
- Docker image updated to `node:20-alpine`.
- RBAC filter and params typing tightened (generics + `unknown`).
- Docs expanded for linting and Docker usage.

### Fixed
- Async test expectations updated to await `canAsync` results.
- Filter fixtures made type-safe for `unknown` params.
