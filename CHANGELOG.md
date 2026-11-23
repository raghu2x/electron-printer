# Changelog

## v2.7.0 - (_2026-11-23_)

### Fixed

- Cash drawers connected to Star Micronics printers now open. `@devraghu/cashdrawer` `0.5.0` detects Star printers and sends the Star drawer command instead of ESC/POS

### Added

- `commandSet` drawer option (`'auto'` | `'escpos'` | `'star'`) to override the detected command language in `printer.openCashDrawer`

### Changed

- Upgraded `@devraghu/cashdrawer` to `0.5.0`
- Migrated to TypeScript 7 and replaced `unplugin-dts` with `rolldown-plugin-dts` for type generation
- Supported Node.js versions are now 22, 24 and 26 or later (dropped Node.js 20)
- Redesigned the demo app: printer list, editable sample receipts, all cash drawer options and an activity log
- The demo can be packaged as a portable Windows executable with `npm run demo:dist`
- Replaced husky and lint-staged with lefthook for the pre-commit hook

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
