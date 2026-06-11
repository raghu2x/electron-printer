# Changelog

## v2.5.0 - (_2026-06-11_)

### Fixed

- Background colors (`background-color`) now print correctly via `print-color-adjust: exact` CSS rule applied globally to the print document

### Deprecated

- `printBackground` option has no effect and will be removed in a future major version — background printing is now always enabled

## v2.4.0 - (_2026-06-11_)

### Changed

- `sanitizeHtml` now uses a denylist approach instead of an allowlist, allowing more valid HTML tags through while still blocking dangerous ones

## v2.3.0 - (_2026-05-20_)

### Changed

- Bumped all packages to latest versions

### Fixed

- Allow `table`, `pre`, `heading`, and `list` HTML tags in DOMPurify sanitization

## v2.2.0 - (_2026-03-28_)

### Changes

- Migrated from `vite-plugin-dts` to `unplugin-dts` for improved type generation support
- Rolled back TypeScript from `6.0.2` to `5.9.3` due to compatibility issues

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
