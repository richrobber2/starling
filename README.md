# Starling browser build

Build the actual starling-client/starling Rust client at pinned upstream revision 17ea954d6f131405261dba41aa21ad0c2b5b3ae3 with the browser-port source overlay. This isolated build branch does not change the fork’s default branch.

The workflow verifies and reconstructs source, executes WASI threading/JavaScript/TLS checks, then builds the actual client and packages its launcher. It uses the standard Ubuntu runner and retains output for one day. No Microsoft tokens, Minecraft resources, local credentials or phone state are supplied.

Compilation does not prove browser gameplay. Microsoft-account and Minecraft Java ownership checks remain required.
