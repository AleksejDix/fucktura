# Changelog

## 1.0.0 (2026-08-26)


### Features

* filter documents by recipient in collections sidebar ([7ab0252](https://github.com/AleksejDix/fucktura/commit/7ab02527d970e5d93d3eb21133b2a4b9edb4a260))
* link reminders to invoices, client UID, sender tax note ([23e6ee5](https://github.com/AleksejDix/fucktura/commit/23e6ee5c1efdf3f5efd6fc731a550fdd3c61049c))
* long demo invoice + multi-page running header on Folgeblatt ([bc0c7db](https://github.com/AleksejDix/fucktura/commit/bc0c7db244f26d3879aa3719a297bc647130d0ce))
* payment deadline per dunning level in the country defaults ([90c05db](https://github.com/AleksejDix/fucktura/commit/90c05dbe2ff055b407037210ecf15c957bea7690))
* reminder letter body is editable inline ([016411a](https://github.com/AleksejDix/fucktura/commit/016411aec22d5ed066ffddac04a776944e06689b))
* reminder letter wording escalates with the dunning level ([9c3ee2f](https://github.com/AleksejDix/fucktura/commit/9c3ee2f23a497463eb56797ad6c3800a2361995e))
* split long invoices into A4-sized pages on screen ([5cb4330](https://github.com/AleksejDix/fucktura/commit/5cb433063af5872333d7db5f8b4e20b0bb5c0ed3))
* static marketing landing page ([7497c1b](https://github.com/AleksejDix/fucktura/commit/7497c1ba0840a9f46badd71e6e6bf1c24ff3c01a))


### Bug Fixes

* apply edits to memory first and serialize disk writes per document ([#38](https://github.com/AleksejDix/fucktura/issues/38)) ([0230867](https://github.com/AleksejDix/fucktura/commit/02308676d7bb08b22b0d573e8ca95734c5ac4b73)), closes [#4](https://github.com/AleksejDix/fucktura/issues/4)
* ask before writing demo data into an empty folder ([#40](https://github.com/AleksejDix/fucktura/issues/40)) ([5c72ebc](https://github.com/AleksejDix/fucktura/commit/5c72ebcf0bc2548ce7c1f8acc02baff124b7b8dc)), closes [#9](https://github.com/AleksejDix/fucktura/issues/9)
* changing the reminder level crashed on a nonexistent fee field ([8c187db](https://github.com/AleksejDix/fucktura/commit/8c187db3d1f2413d27ed4552e2080c46d35d6091))
* default interest starts the day after the invoice due date ([4ddebfd](https://github.com/AleksejDix/fucktura/commit/4ddebfd446da01da1c886213f5c37455262a27ca))
* keep recent folders on transient errors, prune only when gone ([#41](https://github.com/AleksejDix/fucktura/issues/41)) ([c680aa5](https://github.com/AleksejDix/fucktura/commit/c680aa5ccb69890d6f239c11e66f97a86eac8e03)), closes [#10](https://github.com/AleksejDix/fucktura/issues/10)
* move deleted documents to .trash instead of destroying them ([#39](https://github.com/AleksejDix/fucktura/issues/39)) ([00e542c](https://github.com/AleksejDix/fucktura/commit/00e542c918a8645d4077c9a20e2bcadd2ba7b3d5)), closes [#5](https://github.com/AleksejDix/fucktura/issues/5)
* prevent document number collisions from overwriting files ([#37](https://github.com/AleksejDix/fucktura/issues/37)) ([5cdfb98](https://github.com/AleksejDix/fucktura/commit/5cdfb9803e376eac6cc5f756849ad2b3b5378084)), closes [#3](https://github.com/AleksejDix/fucktura/issues/3)
* reminder emails reference the dunned invoice, not the reminder itself ([#43](https://github.com/AleksejDix/fucktura/issues/43)) ([cfddf7a](https://github.com/AleksejDix/fucktura/commit/cfddf7acfb7177eeb3b39b73c8c7e885f7e8e92a))
* surface unreadable data files instead of silently skipping them ([#35](https://github.com/AleksejDix/fucktura/issues/35)) ([f81c6f5](https://github.com/AleksejDix/fucktura/commit/f81c6f57aa5e4927035c9ccfcab11d9d9e3ce860)), closes [#1](https://github.com/AleksejDix/fucktura/issues/1)
* surface write failures instead of pretending saves succeeded ([#42](https://github.com/AleksejDix/fucktura/issues/42)) ([2ffb751](https://github.com/AleksejDix/fucktura/commit/2ffb751eddb9dcf1dfbaf5be2fe4443fec5b1a3f)), closes [#2](https://github.com/AleksejDix/fucktura/issues/2)
* translate line-item table headers ([91662c0](https://github.com/AleksejDix/fucktura/commit/91662c0143615fbce6e380767a314e2a6e31448d))
