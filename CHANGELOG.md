# Changelog

## v2.1.0 - (_2026-03-26_)

### Changed

- Upgraded to TypeScript 6
- Upgraded all dependencies to latest versions
- Switched from npm to bun as the package manager

## v2.0.0 - (_2025-03-01_)

### Changed

- **BREAKING:** Migrated build system from webpack to electron-vite
- **BREAKING:** Renamed `Pos` prefix to cleaner `Print` naming convention across the codebase
- Improved type safety and code quality throughout the project
- Cleaned up renderer and printer modules for better maintainability
- Modernized printer implementation with improved validation
- Enhanced test coverage

### Fixed

- Implemented `AbortController` for proper timeout handling
