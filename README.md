# Dead Reckoning — The Midnight Files

[🎮 Play the game](https://elifertugrul777.github.io/dead-reckoning/)

**GMT 458 · Web GIS · GeoGame**  
**Author:** Elif Ertuğrul

Dead Reckoning is a Turkish-language detective GeoGame set in Lisbon, New York and Tokyo. The player searches illustrated crime scenes, collects evidence, reconstructs transit movements on interactive maps and submits a finding. The joint finale connects timestamped records across three time zones. The characters, incidents, illustrated scenes and case schedules are fictional. The public transit locations and topology reference real geography.

## Run and publish

Extract the archive and open `index.html` in a modern browser. The game starts as soon as you select **Olay yerine git**. **Nasıl oynanır?** explains the controls. The soundtrack starts with the first interaction when permitted by the browser and can be toggled using the sound control.

Put the extracted files at the root of a GitHub repository. Under **Settings → Pages → Build and deployment**, select **Deploy from a branch**, choose **main** and **/(root)**, then save. Open the published Pages URL and verify the game loads. Register the GitHub repository URL in the GMT 458 peer-review system.

## Requirements and progression

| Level | Tasks | Optional timed mode |
| --- | --- | ---: |
| Lisbon | Locate 4 clues, complete 2 map tests, submit 1 verdict | 120 s |
| New York | Locate 4 clues, complete 2 map tests, submit 1 verdict | 120 s |
| Tokyo | Locate 4 clues, complete 2 map tests, submit 1 verdict | 120 s |
| Joint finale | Select 3 city records, align them in UTC and identify 1 key custodian | 150 s |

The campaign opens untimed. The player can start the timed challenge from any unsolved phase. After timeout, the player can continue untimed with existing evidence or retry that file. There is no life count. The three chapters award 300 base points each, and the finale awards 450. An active timed file adds the displayed seconds remaining at submission. Each incorrect substantive comparison or verdict subtracts 15 from the possible time bonus, with a floor of zero for the bonus. The theoretical maximum is 1,860. In-browser storage retains progress and the local personal record. The animated interface uses the same progress and score keys as V2.

## Interface sketch

```text
HOME      Title and illustrated antagonist | Play | Resume | Audio
CASE      Current chapter and step progress | Optional timer
SEARCH    Illustrated room with four clickable traces
          Detective portrait and next action
          Evidence inventory | Open map
ANALYZE   Interactive map and timeline | Highlighted test and animated reconstruction
VERDICT   One conclusion at a time | Submit or review map
FINALE    World map and city clocks | Custody ledger | Final report
```

The main campaign uses a single central panel. The active task is shown above the play area. The finale stacks map and records on narrow screens. The soundtrack is accompanied by visible feedback and can be disabled. Hotspots and map markers are keyboard accessible.

## Data and GIS

Site and route vertices are represented by WGS 84 longitude and latitude. The local and world views use simplified hand-authored coastline geometries and an equirectangular display. The application sums Haversine distances along each polyline and uses distance-weighted interpolation to place the vehicle on the route at the selected game time. The cases use route-based reachability, geographically fixed camera identifiers and timestamp reconciliation. The three time zones use IANA identifiers via `Intl.DateTimeFormat`. The routes are schematic and scheduled times in the story are fixed game data.

JavaScript relies on native browser APIs: SVG DOM, Web Audio, Internationalization and Web Storage. No third-party JavaScript library, build step or remote map service is required.

| Handler | Target | Behavior |
| --- | --- | --- |
| `click` | Crime-scene hotspot | Adds a clue once, updates inventory and unlocks the map after four clues. |
| `input` | Local timeline | Moves the vehicle along the route and updates the clock and travel status. |
| `change` | UTC switch | Displays the same archive instants in UTC or the local city time zones. |

**Closures.** `makeAudio()` encloses its audio context, mixer, chord position and loop timer. `bindCaseMap()` encloses the current case, display settings, marker state and timeline position. Its click and input handlers use that state across interactions.

**DOM.** The game creates SVG features through `document.createElementNS()`, updates marker positions through SVG attributes and updates clue names, clock values and feedback through `textContent`. It enables the next action only when its prerequisites have been met.

## References and assets

- [Transtejo Soflusa — Cacilhas–Cais do Sodré](https://ttsl.pt/passageiros/horarios-de-ligacoes-fluviais/ligacao-cacilhas-cais-do-sodre/)
- [NYC Ferry — East River](https://www.ferry.nyc/routes-and-schedules/east-river/)
- [Tokyo Metro — Subway map](https://www.tokyometro.jp/en/subwaymap/index.html)
- [IANA — Time zone and daylight saving time data](https://www.iana.org/time-zones/tz-link)
- The illustrated environments and portraits were generated for this project. The music and interaction sounds are original synthesizer sequences implemented in `game.js`.

## AI learning log

I used ChatGPT to design a geographic deduction mechanic, structure the application and compare local event clocks across time zones. The revision focused on showing one clear action at a time, revealing the map after evidence collection and using visual and audio feedback to connect actions to outcomes.

**Interaction URL** — Add the share link to the relevant ChatGPT interaction before submission.

Use separate Git commits for your substantive edits to data, interface and documentation. The zip contains the application source and theme assets.
