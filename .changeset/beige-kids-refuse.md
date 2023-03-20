---
"@alecvision/borg": minor
---
## Breaking Changes
[IMPROVE]: Generated schemas and schema meta are now immutable and frozen, accessible via getters.
[FIX]: Clarified the symantics of `.private()`; `private` schemas parse as normal, but are not included in the output of `.serialize()`.

## Features
[FEAT]: New methods: `B.Number().range(...)`, `B.String().length(...)`, and `B.Array().length(...)`

## Bug Fixes, Refactors, and Other Changes
[IMPROVE]: Better types, better error messages, better tooltips.
[FIX]: Various bug fixes and type corrections.
