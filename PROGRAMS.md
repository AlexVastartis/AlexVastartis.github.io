# Program archive — reference for the blurbs

The companion to `DYNASTIES.md`. One capsule per program, so a tagline,
Standing or Path Forward can reach for a real number instead of a vibe.

**Generated** — `node scripts/build-program-archive.mjs` (`npm run archive`).
Do not hand-edit; edit the staging data and re-run.

## Sourcing & caveats

- All figures come from `data/staging/_staging_*` and the built
  `public/data/teams.json`, using the same counting rules as `build-data.mjs`.
- **AP poll** data is 1936–2025; **NFL draft** is through 2026 (the
  draft that follows each season); **consensus All-America** is full history,
  **unanimous** flagged from 1924.
- **National-title years** use the site selectors —
  `AP UPI FWAA NFF USA/CNN USA/ESPN AFCA BCS CFP CFRA HAF NCF` — with `claim` / `not-claimed` excluded. A year counts once.
- **Wins in a capsule** are shown *as played* (later-vacated games included);
  the site’s default "NCAA official" view removes vacated seasons, noted per
  program where non-zero. The 10-stat line uses the site (official) numbers.
- Pre-1936 wins: the ~31 programs the NCAA "FBS Records" book lists are
  calibrated to it; everyone else is summed from College Football Reference
  game logs, which thin out before ~1905 — so those all-time totals understate
  the earliest era.
- Percentiles are within the 136-team FBS set this site tracks.

## Master table

Sorted by Blue Blood Rating. Wins / Win% are the site’s "NCAA official" numbers
(vacated seasons removed); AP wks / top-10 wks are all-time weeks in the poll.

| # | Program | Conf | Tier | Rating | Wins | Win% | Natl | Conf | Heis | Cons.AA | Unan.AA | Draft | 1st | AP wks | Top-10 | Trend |
| --: | --- | --- | --- | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | :-: |
| 1 | Ohio State | Big Ten | Blue Bloods | 99.0 | 990 | .737 | 9 | 39 | 7 | 99 | 42 | 513 | 96 | 1007 | 728 | → |
| 2 | Alabama | SEC | Blue Bloods | 98.0 | 985 | .733 | 16 | 33 | 4 | 87 | 41 | 424 | 84 | 903 | 647 | → |
| 3 | Notre Dame | Independent | Blue Bloods | 98.0 | 972 | .733 | 11 | 0 | 7 | 113 | 38 | 545 | 73 | 902 | 608 | ↘ |
| 4 | Michigan | Big Ten | Blue Bloods | 97.7 | 1022 | .732 | 10 | 42 | 3 | 89 | 30 | 428 | 55 | 935 | 564 | → |
| 5 | Oklahoma | SEC | Blue Bloods | 96.7 | 960 | .723 | 7 | 50 | 7 | 83 | 35 | 424 | 48 | 912 | 628 | → |
| 6 | USC | Big Ten | Blue Bloods | 96.3 | 891 | .694 | 9 | 37 | 8 | 86 | 30 | 532 | 85 | 822 | 486 | ↘ |
| 7 | Texas | SEC | Blue Blood Fringe | 94.4 | 971 | .704 | 4 | 30 | 2 | 65 | 27 | 391 | 49 | 795 | 483 | → |
| 8 | Nebraska | Big Ten | Blue Blood Fringe | 93.7 | 931 | .676 | 5 | 46 | 3 | 54 | 20 | 364 | 32 | 728 | 515 | ↘↘ |
| 9 | Georgia | SEC | Blue Blood Contenders | 91.9 | 904 | .669 | 3 | 15 | 2 | 42 | 16 | 407 | 52 | 686 | 396 | → |
| 10 | Penn State | Big Ten | Blue Blood Contenders | 91.4 | 950 | .689 | 2 | 4 | 1 | 45 | 15 | 399 | 43 | 715 | 433 | → |
| 11 | LSU | SEC | Blue Blood Contenders | 91.0 | 822 | .644 | 4 | 16 | 3 | 43 | 13 | 397 | 54 | 679 | 330 | → |
| 12 | Tennessee | SEC | Blue Blood Contenders | 89.7 | 883 | .670 | 2 | 16 | 0 | 41 | 14 | 365 | 47 | 642 | 345 | ↘ |
| 13 | Miami (FL) | ACC | Blue Blood Contenders | 88.7 | 686 | .633 | 5 | 9 | 2 | 40 | 16 | 375 | 68 | 544 | 325 | ↘ |
| 14 | Florida | SEC | Blue Blood Contenders | 87.0 | 770 | .623 | 3 | 8 | 3 | 34 | 8 | 384 | 59 | 638 | 350 | ↘ |
| 15 | Florida State | ACC | Blue Blood Contenders | 86.7 | 588 | .661 | 3 | 15 | 3 | 46 | 15 | 285 | 47 | 584 | 386 | ↘ |
| 16 | Clemson | ACC | Blue Blood Contenders | 86.1 | 815 | .624 | 3 | 27 | 0 | 31 | 6 | 289 | 41 | 511 | 219 | ↗ |
| 17 | Texas A&M | SEC | Blue Blood Contenders | 85.9 | 797 | .605 | 2 | 18 | 2 | 36 | 10 | 317 | 37 | 516 | 226 | → |
| 18 | Auburn | SEC | Blue Blood Contenders | 85.1 | 809 | .621 | 2 | 12 | 3 | 31 | 9 | 308 | 31 | 598 | 293 | ↘ |
| 19 | UCLA | Big Ten | Blue Blood Contenders | 84.1 | 623 | .590 | 1 | 17 | 1 | 42 | 13 | 340 | 35 | 551 | 224 | ↘ |
| 20 | Pittsburgh | ACC | Blue Blood Contenders | 83.6 | 776 | .574 | 4 | 3 | 1 | 55 | 15 | 304 | 27 | 318 | 125 | ↘ |
| 21 | Washington | Big Ten | National Powers | 82.3 | 790 | .619 | 1 | 17 | 0 | 24 | 5 | 330 | 31 | 479 | 194 | → |
| 22 | Michigan State | Big Ten | National Powers | 81.4 | 620 | .575 | 3 | 9 | 0 | 33 | 11 | 328 | 36 | 418 | 189 | ↘ |
| 23 | Wisconsin | Big Ten | National Powers | 80.3 | 751 | .582 | 0 | 14 | 2 | 32 | 12 | 303 | 30 | 412 | 172 | → |
| 24 | Arkansas | SEC | National Powers | 79.4 | 749 | .572 | 1 | 13 | 0 | 25 | 9 | 290 | 24 | 430 | 201 | ↘↘ |
| 25 | Colorado | Big 12 | National Powers | 78.5 | 682 | .561 | 1 | 26 | 2 | 33 | 6 | 278 | 25 | 313 | 142 | ↘ |
| 26 | Iowa | Big Ten | National Powers | 78.3 | 677 | .546 | 1 | 13 | 1 | 37 | 17 | 292 | 26 | 363 | 129 | → |
| 27 | Minnesota | Big Ten | National Powers | 77.4 | 749 | .573 | 6 | 18 | 1 | 34 | 7 | 284 | 17 | 174 | 82 | ↘ |
| 28 | Stanford | ACC | National Powers | 76.2 | 605 | .547 | 1 | 15 | 1 | 37 | 10 | 283 | 25 | 302 | 97 | ↘ |
| 29 | Georgia Tech | ACC | National Powers | 74.9 | 772 | .581 | 3 | 15 | 0 | 22 | 3 | 226 | 11 | 316 | 147 | ↘↘ |
| 30 | TCU | Big 12 | National Powers | 74.3 | 684 | .546 | 1 | 18 | 1 | 19 | 7 | 228 | 17 | 252 | 105 | → |
| 31 | Illinois | Big Ten | National Powers | 73.3 | 641 | .504 | 3 | 15 | 0 | 27 | 8 | 261 | 19 | 204 | 79 | ↘ |
| 32 | Ole Miss | SEC | National Powers | 73.1 | 669 | .553 | 1 | 6 | 0 | 14 | 4 | 281 | 24 | 364 | 153 | → |
| 33 | Arizona State | Big 12 | National Brands | 72.5 | 647 | .597 | 0 | 17 | 0 | 18 | 3 | 254 | 28 | 299 | 67 | ↘ |
| 34 | Oregon | Big Ten | National Brands | 72.1 | 653 | .578 | 0 | 13 | 1 | 11 | 5 | 263 | 25 | 394 | 200 | ↗ |
| 35 | Syracuse | ACC | National Brands | 71.3 | 701 | .556 | 1 | 5 | 1 | 20 | 9 | 210 | 19 | 213 | 69 | ↘↘ |
| 36 | California | ACC | National Brands | 70.7 | 604 | .520 | 3 | 14 | 0 | 31 | 3 | 245 | 25 | 198 | 91 | ↘ |
| 37 | West Virginia | Big 12 | National Brands | 69.9 | 791 | .591 | 0 | 15 | 0 | 14 | 4 | 200 | 12 | 301 | 89 | ↘ |
| 38 | BYU | Big 12 | National Brands | 69.7 | 639 | .586 | 1 | 23 | 1 | 14 | 6 | 155 | 10 | 298 | 68 | → |
| 39 | Utah | Big 12 | National Brands | 67.4 | 706 | .595 | 0 | 28 | 0 | 13 | 5 | 184 | 12 | 190 | 40 | ↗ |
| 40 | Purdue | Big Ten | National Brands | 67.3 | 633 | .507 | 0 | 12 | 0 | 22 | 7 | 302 | 22 | 236 | 83 | ↘↘ |
| 41 | Missouri | SEC | National Brands | 66.3 | 674 | .541 | 0 | 12 | 0 | 16 | 2 | 242 | 21 | 291 | 95 | → |
| 42 | North Carolina | ACC | National Brands | 65.9 | 679 | .545 | 0 | 10 | 0 | 15 | 3 | 259 | 25 | 279 | 80 | ↘ |
| 43 | Virginia Tech | ACC | National Brands | 65.5 | 781 | .596 | 0 | 11 | 0 | 8 | 4 | 166 | 13 | 302 | 91 | ↘ |
| 44 | Maryland | Big Ten | National Brands | 64.8 | 594 | .514 | 1 | 11 | 0 | 12 | 5 | 237 | 18 | 189 | 79 | ↘↘ |
| 45 | Baylor | Big 12 | National Brands | 64.4 | 631 | .510 | 0 | 9 | 1 | 18 | 10 | 246 | 19 | 226 | 84 | → |
| 46 | Oklahoma State | Big 12 | National Brands | 63.6 | 610 | .522 | 0 | 10 | 1 | 21 | 9 | 177 | 21 | 291 | 75 | → |
| 47 | Army | American | National Brands | 63.4 | 746 | .571 | 3 | 0 | 3 | 37 | 8 | 28 | 3 | 156 | 104 | ↘↘ |
| 48 | Boston College | ACC | The Field | 60.5 | 554 | .540 | 0.5 | 1 | 1 | 14 | 3 | 225 | 21 | 139 | 34 | ↘ |
| 49 | SMU | ACC | The Field | 60.2 | 550 | .494 | 1.5 | 11 | 1 | 16 | 3 | 184 | 7 | 197 | 75 | ↘ |
| 50 | Texas Tech | Big 12 | The Field | 59.1 | 589 | .554 | 0 | 11 | 0 | 14 | 8 | 178 | 11 | 155 | 39 | → |
| 51 | North Carolina State | ACC | The Field | 58.1 | 631 | .514 | 0 | 11 | 0 | 12 | 4 | 181 | 18 | 189 | 12 | ↗ |
| 52 | Kentucky | SEC | The Field | 56.2 | 539 | .472 | 0.5 | 2 | 0 | 14 | 3 | 222 | 17 | 111 | 32 | ↗ |
| 53 | Arizona | Big 12 | The Field | 55.0 | 521 | .519 | 0 | 6 | 0 | 17 | 6 | 196 | 12 | 180 | 31 | ↘ |
| 54 | Houston | Big 12 | The Field | 54.4 | 475 | .549 | 0 | 11 | 1 | 10 | 0 | 192 | 15 | 206 | 55 | → |
| 55 | South Carolina | SEC | The Field | 54.3 | 616 | .507 | 0 | 1 | 1 | 5 | 2 | 231 | 16 | 197 | 39 | → |
| 56 | Navy | American | The Field | 53.8 | 729 | .549 | 0.5 | 0 | 2 | 23 | 6 | 22 | 0 | 144 | 75 | ↘ |
| 57 | Boise State † | Pac-12 | The Field | 53.6 | 511 | .724 | 0 | 20 | 0 | 4 | 1 | 77 | 6 | 173 | 57 | ↗ |
| 58 | Virginia | ACC | The Field | 53.6 | 620 | .492 | 0 | 2 | 0 | 11 | 3 | 167 | 16 | 183 | 21 | ↘ |
| 59 | Northwestern | Big Ten | The Field | 53.2 | 568 | .446 | 0 | 8 | 0 | 15 | 1 | 197 | 11 | 184 | 74 | → |
| 60 | Duke | ACC | The Field | 53.0 | 537 | .491 | 0 | 17 | 0 | 6 | 2 | 163 | 8 | 181 | 57 | ↘ |
| 61 | Indiana | Big Ten | The Field | 51.4 | 509 | .425 | 1 | 2 | 1 | 9 | 3 | 181 | 13 | 95 | 39 | → |
| 62 | Kansas State | Big 12 | The Field | 51.2 | 531 | .452 | 0 | 4 | 0 | 15 | 3 | 161 | 6 | 247 | 78 | ↗ |
| 63 | Vanderbilt | SEC | The Field | 50.1 | 573 | .469 | 0 | 13 | 0 | 8 | 4 | 130 | 9 | 47 | 6 | → |
| 64 | Washington State | Pac-12 | The Field | 49.8 | 516 | .479 | 0 | 4 | 0 | 8 | 2 | 200 | 13 | 166 | 31 | ↗ |
| 65 | Louisville | ACC | The Field | 48.9 | 413 | .536 | 0 | 9 | 1 | 3 | 2 | 141 | 16 | 160 | 40 | ↗ |
| 66 | Mississippi State | SEC | The Field | 47.6 | 611 | .505 | 0 | 1 | 0 | 3 | 0 | 210 | 13 | 209 | 20 | → |
| 67 | San Diego State | Pac-12 | The Field | 47.4 | 388 | .545 | 0 | 20 | 0 | 5 | 3 | 158 | 10 | 32 | 0 | ↗ |
| 68 | Kansas | Big 12 | The Field | 47.2 | 558 | .455 | 0 | 5 | 0 | 5 | 1 | 174 | 9 | 117 | 37 | ↘ |
| 69 | Oregon State | Pac-12 | The Field | 46.8 | 499 | .452 | 0 | 5 | 1 | 8 | 2 | 173 | 7 | 113 | 25 | → |
| 70 | Tulsa | American | The Field | 46.8 | 538 | .512 | 0 | 35 | 0 | 3 | 2 | 175 | 4 | 47 | 5 | → |
| 71 | Cincinnati | Big 12 | The Field | 45.9 | 436 | .492 | 0 | 16 | 0 | 5 | 1 | 142 | 3 | 99 | 39 | ↗↗ |
| 72 | Tulane | American | The Field | 45.8 | 560 | .460 | 0 | 10 | 0 | 5 | 1 | 153 | 4 | 86 | 19 | → |
| 73 | Fresno State | Pac-12 | The Field | 45.3 | 431 | .561 | 0 | 29 | 0 | 1 | 1 | 109 | 5 | 63 | 3 | → |
| 74 | Colorado State | Pac-12 | The Field | 44.2 | 543 | .469 | 0 | 15 | 0 | 5 | 1 | 108 | 5 | 43 | 5 | → |
| 75 | Wyoming | Mountain West | The Field | 42.4 | 547 | .475 | 0 | 14 | 0 | 4 | 0 | 87 | 4 | 56 | 11 | → |
| 76 | Iowa State | Big 12 | The Field | 41.5 | 566 | .456 | 0 | 2 | 0 | 6 | 1 | 134 | 2 | 90 | 8 | ↗ |
| 77 | Rice | American | The Field | 41.1 | 494 | .427 | 0 | 8 | 0 | 6 | 0 | 132 | 7 | 70 | 17 | ↘ |
| 78 | Utah State | Pac-12 | The Field | 40.7 | 551 | .494 | 0 | 13 | 0 | 3 | 0 | 120 | 5 | 13 | 1 | → |
| 79 | Wake Forest | ACC | The Field | 40.4 | 495 | .419 | 0 | 2 | 0 | 4 | 2 | 152 | 5 | 68 | 2 | → |
| 80 | Miami (OH) | MAC | The Field | 39.2 | 427 | .553 | 0 | 23 | 0 | 1 | 0 | 84 | 2 | 41 | 2 | → |
| 81 | Air Force | Mountain West | The Field | 38.2 | 436 | .550 | 0 | 3 | 0 | 5 | 2 | 10 | 0 | 84 | 20 | → |
| 82 | Rutgers | Big Ten | The Field | 38.2 | 522 | .468 | 0 | 1 | 0 | 4 | 1 | 70 | 3 | 37 | 2 | ↘ |
| 83 | Toledo | MAC | The Field | 37.6 | 439 | .591 | 0 | 14 | 0 | 2 | 0 | 65 | 2 | 45 | 0 | ↗ |
| 84 | Southern Miss | Sun Belt | The Field | 36.8 | 413 | .525 | 0 | 8 | 0 | 0 | 0 | 120 | 4 | 56 | 1 | ↘ |
| 85 | Memphis | American | The Field | 36.6 | 379 | .488 | 0 | 10 | 0 | 4 | 0 | 122 | 6 | 34 | 0 | ↗ |
| 86 | East Carolina | American | The Field | 36.6 | 367 | .513 | 0 | 7 | 0 | 3 | 1 | 65 | 2 | 34 | 1 | ↘ |
| 87 | Appalachian State † | Sun Belt | The Field | 36.2 | 674 | .643 | 0 | 22 | 0 | 0 | 0 | 32 | 0 | 10 | 0 | ↗ |
| 88 | Delaware † | C-USA | The Field | 35.4 | 734 | .619 | 0 | 20 | 0 | 0 | 0 | 21 | 1 | 0 | 0 | · |
| 89 | Louisiana Tech | Sun Belt | The Field | 35.1 | 300 | .483 | 0 | 25 | 0 | 3 | 1 | 69 | 5 | 6 | 0 | → |
| 90 | San Jose State | Mountain West | The Field | 35.0 | 396 | .455 | 0 | 17 | 0 | 1 | 1 | 111 | 6 | 7 | 0 | → |
| 91 | UCF | Big 12 | The Field | 35.0 | 212 | .551 | 0 | 6 | 0 | 1 | 0 | 52 | 5 | 54 | 10 | ↗ |
| 92 | Marshall † | Sun Belt | The Field | 34.3 | 286 | .462 | 0 | 13 | 0 | 1 | 1 | 47 | 3 | 36 | 1 | → |
| 93 | Northern Illinois | Mountain West | The Field | 32.9 | 324 | .479 | 0 | 14 | 0 | 2 | 1 | 41 | 2 | 25 | 0 | → |
| 94 | Bowling Green | MAC | The Field | 32.2 | 392 | .543 | 0 | 17 | 0 | 1 | 0 | 69 | 1 | 16 | 0 | → |
| 95 | Temple | American | The Field | 31.1 | 355 | .427 | 0 | 2 | 0 | 3 | 1 | 77 | 4 | 16 | 0 | → |
| 96 | South Florida | American | The Field | 29.4 | 164 | .519 | 0 | 0 | 0 | 2 | 0 | 30 | 2 | 51 | 4 | · |
| 97 | Western Michigan | MAC | The Field | 28.8 | 374 | .509 | 0 | 3 | 0 | 2 | 0 | 54 | 2 | 10 | 0 | ↗ |
| 98 | Nevada | Mountain West | The Field | 28.6 | 262 | .476 | 0 | 14 | 0 | 0 | 0 | 56 | 1 | 16 | 1 | → |
| 99 | North Texas | American | The Field | 28.2 | 323 | .421 | 0 | 25 | 0 | 1 | 0 | 81 | 3 | 7 | 0 | ↗ |
| 100 | Central Michigan | MAC | The Field | 27.7 | 319 | .528 | 0 | 16 | 0 | 0 | 0 | 45 | 2 | 2 | 0 | → |
| 101 | Hawaii | Mountain West | The Field | 27.4 | 356 | .471 | 0 | 4 | 0 | 1 | 0 | 72 | 1 | 27 | 0 | → |
| 102 | Jacksonville State † | C-USA | The Field | 27.3 | 565 | .556 | 0 | 13 | 0 | 0 | 0 | 11 | 0 | 0 | 0 | · |
| 103 | Troy | Sun Belt | The Field | 27.3 | 176 | .548 | 0 | 22 | 0 | 0 | 0 | 37 | 2 | 3 | 0 | ↗ |
| 104 | UTEP | Mountain West | The Field | 26.9 | 353 | .369 | 0 | 2 | 0 | 1 | 1 | 97 | 2 | 5 | 0 | → |
| 105 | Coastal Carolina † | Sun Belt | The Field | 26.3 | 171 | .631 | 0 | 8 | 0 | 1 | 0 | 9 | 0 | 23 | 1 | · |
| 106 | New Mexico | Mountain West | The Field | 26.3 | 430 | .418 | 0 | 4 | 0 | 3 | 0 | 69 | 2 | 0 | 0 | → |
| 107 | Sam Houston † | C-USA | The Field | 25.9 | 564 | .516 | 0 | 12 | 0 | 0 | 0 | 20 | 0 | 0 | 0 | · |
| 108 | Ball State | MAC | The Field | 25.5 | 285 | .474 | 0 | 11 | 0 | 2 | 0 | 29 | 0 | 10 | 0 | → |
| 109 | Western Kentucky † | C-USA | The Field | 24.8 | 170 | .518 | 0 | 12 | 0 | 1 | 0 | 41 | 0 | 2 | 0 | ↗ |
| 110 | Ohio | MAC | The Field | 23.9 | 348 | .460 | 0 | 11 | 0 | 0 | 0 | 34 | 1 | 9 | 0 | ↗ |
| 111 | Louisiana | Sun Belt | The Field | 23.9 | 269 | .420 | 0 | 9 | 0 | 1 | 0 | 45 | 0 | 21 | 0 | ↗ |
| 112 | Georgia Southern † | Sun Belt | The Field | 23.6 | 432 | .619 | 0 | 11 | 0 | 0 | 0 | 15 | 0 | 0 | 0 | ↗ |
| 113 | UConn † | Independent | The Field | 23.4 | 154 | .364 | 0 | 17 | 0 | 1 | 0 | 46 | 2 | 6 | 0 | → |
| 114 | Liberty † | C-USA | The Field | 22.3 | 156 | .584 | 0 | 8 | 0 | 0 | 0 | 10 | 1 | 15 | 0 | ↗ |
| 115 | James Madison † | Sun Belt | The Field | 22.0 | 463 | .721 | 0 | 8 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | · |
| 116 | UMass † | Independent | The Field | 20.8 | 171 | .350 | 0 | 22 | 0 | 1 | 0 | 26 | 2 | 0 | 0 | → |
| 117 | New Mexico State | C-USA | The Field | 20.1 | 343 | .355 | 0 | 4 | 0 | 0 | 0 | 56 | 0 | 6 | 0 | → |
| 118 | Missouri State † | C-USA | The Field | 20.0 | 514 | .472 | 0 | 5 | 0 | 0 | 0 | 14 | 0 | 0 | 0 | · |
| 119 | Eastern Michigan | MAC | The Field | 19.5 | 194 | .330 | 0 | 9 | 0 | 0 | 0 | 32 | 2 | 0 | 0 | ↗ |
| 120 | Arkansas State | Sun Belt | The Field | 19.3 | 245 | .425 | 0 | 12 | 0 | 0 | 0 | 49 | 0 | 0 | 0 | ↗ |
| 121 | UNLV | Mountain West | The Field | 18.8 | 223 | .393 | 0 | 1 | 0 | 1 | 0 | 47 | 0 | 6 | 0 | → |
| 122 | UTSA † | American | The Field | 18.7 | 98 | .530 | 0 | 2 | 0 | 0 | 0 | 5 | 1 | 9 | 0 | · |
| 123 | Kent State | MAC | The Field | 18.2 | 233 | .329 | 0 | 1 | 0 | 1 | 0 | 44 | 0 | 5 | 0 | → |
| 124 | Florida Atlantic † | American | The Field | 18.0 | 126 | .444 | 0 | 3 | 0 | 1 | 1 | 10 | 0 | 0 | 0 | · |
| 125 | Louisiana-Monroe | Sun Belt | The Field | 17.5 | 167 | .347 | 0 | 5 | 0 | 0 | 0 | 38 | 1 | 0 | 0 | → |
| 126 | Buffalo † | MAC | The Field | 17.5 | 172 | .395 | 0 | 1 | 0 | 1 | 0 | 17 | 1 | 3 | 0 | ↗ |
| 127 | Middle Tennessee | C-USA | The Field | 17.2 | 160 | .430 | 0 | 13 | 0 | 0 | 0 | 33 | 0 | 0 | 0 | ↗ |
| 128 | Texas State † | Pac-12 | The Field | 16.4 | 118 | .404 | 0 | 12 | 0 | 0 | 0 | 37 | 0 | 0 | 0 | → |
| 129 | UAB † | American | The Field | 16.4 | 148 | .440 | 0 | 2 | 0 | 0 | 0 | 16 | 2 | 0 | 0 | ↗ |
| 130 | Kennesaw State † | C-USA | The Field | 15.8 | 83 | .654 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | · |
| 131 | Akron | MAC | The Field | 14.8 | 186 | .369 | 0 | 1 | 0 | 1 | 0 | 17 | 0 | 0 | 0 | → |
| 132 | Old Dominion † | Sun Belt | The Field | 13.5 | 106 | .546 | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | · |
| 133 | FIU † | C-USA | The Field | 10.5 | 92 | .337 | 0 | 1 | 0 | 0 | 0 | 10 | 0 | 0 | 0 | · |
| 134 | South Alabama † | Sun Belt | The Field | 10.0 | 75 | .414 | 0 | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | · |
| 135 | Georgia State † | Sun Belt | The Field | 9.0 | 65 | .342 | 0 | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | · |
| 136 | Charlotte † | American | The Field | 8.9 | 48 | .322 | 0 | 0 | 0 | 0 | 0 | 5 | 0 | 0 | 0 | · |

† spent most of its modern history in FCS / lower — cumulative totals reflect that.

## Capsules

### Blue Bloods

#### 1 · Ohio State — Big Ten · Blue Bloods · 99.0 rating

**All-time (through 2025):** 1002–337–53 (.739) as played · 12–0 later vacated (site default removes these) · site rating **#1 of 136**
**The ten:** AP wks 1007 (100) · top-10 728 (100) · cons.AA 99 (99) · unan.AA 42 (100) · natl 9 (97) · conf 39 (97) · draft 513 (98) · 1st-rnd 96 (100) · wins 990 (99) · win% .737 (100)
**National titles (9):** 1942, 1954, 1957, 1961, 1968, 1970, 2002, 2014, 2024
**Conference titles:** 39 (summary total — years not itemised)
**Heisman (7):** 1944 Les Horvath · 1950 Vic Janowicz · 1955 Howard Cassady · 1974 Archie Griffin · 1975 Archie Griffin · 1995 Eddie George · 2006 Troy Smith
**All-Americans:** 99 consensus, 42 unanimous · latest: 2025 Kayden McDonald (DL, unan.); 2025 Jeremiah Smith (WR, unan.); 2025 Caleb Downs (DB, unan.); 2025 Arvell Reese (LB)
**AP poll (1936–2025):** 1007 weeks ranked / 728 top-10 / 459 top-5 / 117 at #1 · first ranked 1936 · 5 AP-#1 finishes (1942, 1954, 1968, 2014, 2024) · 32 top-5 finishes · longest ranked streak 58 yrs (1968–2025) · best finish AP #1 (1942)
**NFL draft (through 2026):** 513 picks, 96 first-round · last 10 drafts: 84 picks, 25 first-round
**Peak 10-yr stretch:** 2012–2021 — 117–13 (.900)
**Recent decade (2016–2025):** 115–17 (.871) · 1 national title · 161 AP weeks
**Trend:** even — 2016–2025 rating 98.7/100 vs. all-time 99.0 (Δ -0.3)

#### 2 · Alabama — SEC · Blue Bloods · 98.0 rating

**All-time (through 2025):** 1006–345–43 (.737) as played · 21–0 later vacated (site default removes these) · site rating **#2 of 136**
**The ten:** AP wks 903 (97) · top-10 647 (99) · cons.AA 87 (97) · unan.AA 41 (99) · natl 16 (100) · conf 33 (95) · draft 424 (96) · 1st-rnd 84 (98) · wins 985 (98) · win% .733 (99)
**National titles (16):** 1925, 1926, 1930, 1961, 1964, 1965, 1973, 1978, 1979, 1992, 2009, 2011, 2012, 2015, 2017, 2020
**Conference titles:** 33 (summary total — years not itemised)
**Heisman (4):** 2009 Mark Ingram · 2015 Derrick Henry · 2020 DeVonta Smith · 2021 Bryce Young
**All-Americans:** 87 consensus, 41 unanimous · latest: 2022 Will Anderson Jr. (LB, unan.); 2023 Kool-Aid McKinstry (DB); 2023 Dallas Turner (LB); 2025 Kadyn Proctor (OL)
**AP poll (1936–2025):** 903 weeks ranked / 647 top-10 / 465 top-5 / 140 at #1 · first ranked 1936 · 12 AP-#1 finishes (1961, 1964, 1965, 1978, 1979, 1992, 2009, 2011, 2012, 2015, 2017, 2020) · 30 top-5 finishes · longest ranked streak 45 yrs (1959–2003) · best finish AP #1 (1961)
**NFL draft (through 2026):** 424 picks, 84 first-round · last 10 drafts: 95 picks, 33 first-round
**Peak 10-yr stretch:** 2011–2020 — 127–12 (.914)
**Recent decade (2016–2025):** 121–19 (.864) · 2 national titles · 163 AP weeks
**Trend:** even — 2016–2025 rating 99.4/100 vs. all-time 98.0 (Δ +1.3)

#### 3 · Notre Dame — Independent · Blue Bloods · 98.0 rating

**All-time (through 2025):** 993–342–42 (.736) as played · 21–1 later vacated (site default removes these) · site rating **#3 of 136**
**The ten:** AP wks 902 (97) · top-10 608 (97) · cons.AA 113 (100) · unan.AA 38 (98) · natl 11 (99) · conf 0 (3) · draft 545 (100) · 1st-rnd 73 (97) · wins 972 (97) · win% .733 (98)
**National titles (11):** 1924, 1929, 1930, 1943, 1946, 1947, 1949, 1966, 1973, 1977, 1988
**Conference titles:** none
**Heisman (7):** 1943 Angelo Bertelli · 1947 Johnny Lujack · 1949 Leon Hart · 1953 Johnny Lattner · 1956 Paul Hornung · 1964 John Huarte · 1987 Tim Brown
**All-Americans:** 113 consensus, 38 unanimous · latest: 2023 Joe Alt (OL, unan.); 2024 Xavier Watts (DB); 2025 Leonard Moore (DB, unan.); 2025 Jeremiyah Love (RB, unan.)
**AP poll (1936–2025):** 902 weeks ranked / 608 top-10 / 321 top-5 / 98 at #1 · first ranked 1936 · 8 AP-#1 finishes (1943, 1946, 1947, 1949, 1966, 1973, 1977, 1988) · 26 top-5 finishes · longest ranked streak 43 yrs (1964–2006) · best finish AP #1 (1943)
**NFL draft (through 2026):** 545 picks, 73 first-round · last 10 drafts: 51 picks, 7 first-round
**Peak 10-yr stretch:** 1940–1949 — 82–9–6 (.876)
**Recent decade (2016–2025):** 101–29 (.777) · 0 national titles · 139 AP weeks
**Trend:** down — 2016–2025 rating 89.3/100 vs. all-time 98.0 (Δ -8.7) · biggest moves: Championships ↓

#### 4 · Michigan — Big Ten · Blue Bloods · 97.7 rating

**All-time (through 2025):** 1022–362–36 (.732) as played · site rating **#4 of 136**
**The ten:** AP wks 935 (99) · top-10 564 (97) · cons.AA 89 (98) · unan.AA 30 (96) · natl 10 (98) · conf 42 (98) · draft 428 (97) · 1st-rnd 55 (95) · wins 1022 (100) · win% .732 (97)
**National titles (10):** 1901, 1902, 1903, 1904, 1918, 1923, 1933, 1948, 1997, 2023
**Conference titles:** 42 (summary total — years not itemised)
**Heisman (3):** 1940 Tom Harmon · 1991 Desmond Howard · 1997 Charles Woodson
**All-Americans:** 89 consensus, 30 unanimous · latest: 2022 Olusegun Oluwatimi (C); 2022 Blake Corum (RB, unan.); 2023 Zak Zinter (OL, unan.); 2024 Mason Graham (DL, unan.)
**AP poll (1936–2025):** 935 weeks ranked / 564 top-10 / 323 top-5 / 36 at #1 · first ranked 1938 · 3 AP-#1 finishes (1948, 1997, 2023) · 18 top-5 finishes · longest ranked streak 40 yrs (1968–2007) · best finish AP #1 (1948)
**NFL draft (through 2026):** 428 picks, 55 first-round · last 10 drafts: 76 picks, 13 first-round
**Peak 10-yr stretch:** 1969–1978 — 96–15–3 (.855)
**Recent decade (2016–2025):** 96–31 (.756) · 1 national title · 136 AP weeks
**Trend:** even — 2016–2025 rating 95.8/100 vs. all-time 97.7 (Δ -1.9)

#### 5 · Oklahoma — SEC · Blue Bloods · 96.7 rating

**All-time (through 2025):** 960–351–53 (.723) as played · site rating **#5 of 136**
**The ten:** AP wks 912 (98) · top-10 628 (98) · cons.AA 83 (96) · unan.AA 35 (97) · natl 7 (96) · conf 50 (100) · draft 424 (96) · 1st-rnd 48 (92) · wins 960 (96) · win% .723 (96)
**National titles (7):** 1950, 1955, 1956, 1974, 1975, 1985, 2000
**Conference titles:** 50 (summary total — years not itemised)
**Heisman (7):** 1952 Billy Vessels · 1969 Steve Owens · 1978 Billy Sims · 2003 Jason White · 2008 Sam Bradford · 2017 Baker Mayfield · 2018 Kyler Murray
**All-Americans:** 83 consensus, 35 unanimous · latest: 2017 Baker Mayfield (QB, unan.); 2018 Ben Powers (OL); 2019 CeeDee Lamb (WR); 2024 Danny Stutsman (LB)
**AP poll (1936–2025):** 912 weeks ranked / 628 top-10 / 425 top-5 / 101 at #1 · first ranked 1938 · 7 AP-#1 finishes (1950, 1955, 1956, 1974, 1975, 1985, 2000) · 32 top-5 finishes · longest ranked streak 30 yrs (1966–1995) · best finish AP #1 (1950)
**NFL draft (through 2026):** 424 picks, 48 first-round · last 10 drafts: 49 picks, 7 first-round
**Peak 10-yr stretch:** 1948–1957 — 97–7–2 (.925)
**Recent decade (2016–2025):** 99–32 (.756) · 0 national titles · 138 AP weeks
**Trend:** even — 2016–2025 rating 94.3/100 vs. all-time 96.7 (Δ -2.5)

#### 6 · USC — Big Ten · Blue Bloods · 96.3 rating

**All-time (through 2025):** 905–379–54 (.697) as played · 14–1 later vacated (site default removes these) · site rating **#6 of 136**
**The ten:** AP wks 822 (96) · top-10 486 (95) · cons.AA 86 (97) · unan.AA 30 (96) · natl 9 (97) · conf 37 (97) · draft 532 (99) · 1st-rnd 85 (99) · wins 891 (93) · win% .694 (94)
**National titles (9):** 1931, 1932, 1962, 1967, 1972, 1974, 1978, 2003, 2004
**Conference titles:** 37 (summary total — years not itemised)
**Heisman (8):** 1965 Mike Garrett · 1968 O.J. Simpson · 1979 Charles White · 1981 Marcus Allen · 2002 Carson Palmer · 2004 Matt Leinart · 2005 Reggie Bush · 2022 Caleb Williams
**All-Americans:** 86 consensus, 30 unanimous · latest: 2022 Tuli Tuipulotu (DL, unan.); 2022 Caleb Williams (QB, unan.); 2025 Makai Lemon (WR, unan.); 2025 Bishop Fitzgerald (DB)
**AP poll (1936–2025):** 822 weeks ranked / 486 top-10 / 281 top-5 / 88 at #1 · first ranked 1936 · 5 AP-#1 finishes (1962, 1967, 1972, 2003, 2004) · 19 top-5 finishes · longest ranked streak 39 yrs (1962–2000) · best finish AP #1 (1962)
**NFL draft (through 2026):** 532 picks, 85 first-round · last 10 drafts: 40 picks, 8 first-round
**Peak 10-yr stretch:** 2002–2011 — 109–20 (.845)
**Recent decade (2016–2025):** 78–45 (.634) · 0 national titles · 87 AP weeks
**Trend:** down — 2016–2025 rating 86.8/100 vs. all-time 96.3 (Δ -9.6) · biggest moves: Championships ↓, Wins ↓, NFL Draft Success ↓

### Blue Blood Fringe

#### 7 · Texas — SEC · Blue Blood Fringe · 94.4 rating

**All-time (through 2025):** 971–398–33 (.704) as played · site rating **#7 of 136**
**The ten:** AP wks 795 (95) · top-10 483 (94) · cons.AA 65 (95) · unan.AA 27 (95) · natl 4 (92) · conf 30 (94) · draft 391 (93) · 1st-rnd 49 (93) · wins 971 (97) · win% .704 (94)
**National titles (4):** 1963, 1969, 1970, 2005
**Conference titles:** 30 (summary total — years not itemised)
**Heisman (2):** 1977 Earl Campbell · 1998 Ricky Williams
**All-Americans:** 65 consensus, 27 unanimous · latest: 2022 Bijan Robinson (RB, unan.); 2023 T'Vondre Sweat (DL, unan.); 2024 Kelvin Banks Jr. (OL, unan.); 2024 Jahdae Barron (DB)
**AP poll (1936–2025):** 795 weeks ranked / 483 top-10 / 285 top-5 / 50 at #1 · first ranked 1940 · 3 AP-#1 finishes (1963, 1969, 2005) · 21 top-5 finishes · longest ranked streak 20 yrs (1994–2013) · best finish AP #1 (1963)
**NFL draft (through 2026):** 391 picks, 49 first-round · last 10 drafts: 49 picks, 6 first-round
**Peak 10-yr stretch:** 2000–2009 — 110–19 (.853)
**Recent decade (2016–2025):** 85–45 (.654) · 0 national titles · 103 AP weeks
**Trend:** even — 2016–2025 rating 90.9/100 vs. all-time 94.4 (Δ -3.5)

#### 8 · Nebraska — Big Ten · Blue Blood Fringe · 93.7 rating

**All-time (through 2025):** 931–436–40 (.676) as played · site rating **#8 of 136**
**The ten:** AP wks 728 (94) · top-10 515 (96) · cons.AA 54 (94) · unan.AA 20 (94) · natl 5 (94) · conf 46 (99) · draft 364 (90) · 1st-rnd 32 (86) · wins 931 (94) · win% .676 (92)
**National titles (5):** 1970, 1971, 1994, 1995, 1997
**Conference titles:** 46 (summary total — years not itemised)
**Heisman (3):** 1972 Johnny Rodgers · 1983 Mike Rozier · 2001 Eric Crouch
**All-Americans:** 54 consensus, 20 unanimous · latest: 2000 Dominic Raiola (C); 2001 Toniu Fonoti (OL); 2009 Ndamukong Suh (DL); 2010 Prince Amukamara (DB, unan.)
**AP poll (1936–2025):** 728 weeks ranked / 515 top-10 / 294 top-5 / 70 at #1 · first ranked 1936 · 4 AP-#1 finishes (1970, 1971, 1994, 1995) · 14 top-5 finishes · longest ranked streak 41 yrs (1963–2003) · best finish AP #1 (1970)
**NFL draft (through 2026):** 364 picks, 32 first-round · last 10 drafts: 14 picks, 0 first-round
**Peak 10-yr stretch:** 1992–2001 — 111–15 (.881)
**Recent decade (2016–2025):** 51–68 (.429) · 0 national titles · 17 AP weeks
**Trend:** down (emphatic) — 2016–2025 rating 42.0/100 vs. all-time 93.7 (Δ -51.7) · biggest moves: All-Americans ↓, Wins ↓, NFL Draft Success ↓

### Blue Blood Contenders

#### 9 · Georgia — SEC · Blue Blood Contenders · 91.9 rating

**All-time (through 2025):** 904–434–54 (.669) as played · site rating **#9 of 136**
**The ten:** AP wks 686 (93) · top-10 396 (93) · cons.AA 42 (90) · unan.AA 16 (93) · natl 3 (88) · conf 15 (71) · draft 407 (95) · 1st-rnd 52 (94) · wins 904 (94) · win% .669 (91)
**National titles (3):** 1980, 2021, 2022
**Conference titles:** 15 (summary total — years not itemised)
**Heisman (2):** 1942 Frank Sinkwich · 1982 Herschel Walker
**All-Americans:** 42 consensus, 16 unanimous · latest: 2022 Christopher Smith (DB, unan.); 2023 Malaki Starks (DB); 2023 Brock Bowers (TE, unan.); 2025 CJ Allen (LB)
**AP poll (1936–2025):** 686 weeks ranked / 396 top-10 / 211 top-5 / 54 at #1 · first ranked 1941 · 3 AP-#1 finishes (1980, 2021, 2022) · 15 top-5 finishes · longest ranked streak 29 yrs (1997–2025) · best finish AP #1 (1980)
**NFL draft (through 2026):** 407 picks, 52 first-round · last 10 drafts: 84 picks, 21 first-round
**Peak 10-yr stretch:** 2016–2025 — 117–21 (.848)
**Recent decade (2016–2025):** 117–21 (.848) · 2 national titles · 152 AP weeks
**Trend:** even — 2016–2025 rating 97.8/100 vs. all-time 91.9 (Δ +5.9)

#### 10 · Penn State — Big Ten · Blue Blood Contenders · 91.4 rating

**All-time (through 2025):** 950–418–41 (.689) as played · site rating **#10 of 136**
**The ten:** AP wks 715 (94) · top-10 433 (94) · cons.AA 45 (92) · unan.AA 15 (91) · natl 2 (83) · conf 4 (25) · draft 399 (94) · 1st-rnd 43 (90) · wins 950 (95) · win% .689 (93)
**National titles (2):** 1982, 1986
**Conference titles:** 4 (summary total — years not itemised)
**Heisman (1):** 1973 John Cappelletti
**All-Americans:** 45 consensus, 15 unanimous · latest: 2017 Saquon Barkley (KR/AP, unan.); 2019 Micah Parsons (LB); 2023 Olumuyiwa Fashanu (OL); 2024 Abdul Carter (DL, unan.)
**AP poll (1936–2025):** 715 weeks ranked / 433 top-10 / 186 top-5 / 21 at #1 · first ranked 1940 · 2 AP-#1 finishes (1982, 1986) · 15 top-5 finishes · longest ranked streak 34 yrs (1967–2000) · best finish AP #1 (1982)
**NFL draft (through 2026):** 399 picks, 43 first-round · last 10 drafts: 59 picks, 9 first-round
**Peak 10-yr stretch:** 1968–1977 — 99–17 (.853)
**Recent decade (2016–2025):** 94–36 (.723) · 0 national titles · 127 AP weeks
**Trend:** even — 2016–2025 rating 86.2/100 vs. all-time 91.4 (Δ -5.2)

#### 11 · LSU — SEC · Blue Blood Contenders · 91.0 rating

**All-time (through 2025):** 859–444–47 (.654) as played · 37–0 later vacated (site default removes these) · site rating **#11 of 136**
**The ten:** AP wks 679 (92) · top-10 330 (90) · cons.AA 43 (92) · unan.AA 13 (88) · natl 4 (92) · conf 16 (75) · draft 397 (94) · 1st-rnd 54 (94) · wins 822 (92) · win% .644 (89)
**National titles (4):** 1958, 2003, 2007, 2019
**Conference titles:** 16 (summary total — years not itemised)
**Heisman (3):** 1959 Billy Cannon · 2019 Joe Burrow · 2023 Jayden Daniels
**All-Americans:** 43 consensus, 13 unanimous · latest: 2023 Malik Nabers (WR, unan.); 2023 Jayden Daniels (QB); 2024 Will Campbell (OL); 2025 Mansoor Delane (DB, unan.)
**AP poll (1936–2025):** 679 weeks ranked / 330 top-10 / 137 top-5 / 38 at #1 · first ranked 1936 · 3 AP-#1 finishes (1958, 2007, 2019) · 10 top-5 finishes · longest ranked streak 26 yrs (2000–2025) · best finish AP #1 (1958)
**NFL draft (through 2026):** 397 picks, 54 first-round · last 10 drafts: 75 picks, 16 first-round
**Peak 10-yr stretch:** 2003–2012 — 108–25 (.812)
**Recent decade (2016–2025):** 89–40 (.690) · 1 national title · 111 AP weeks
**Trend:** even — 2016–2025 rating 94.1/100 vs. all-time 91.0 (Δ +3.0)

#### 12 · Tennessee — SEC · Blue Blood Contenders · 89.7 rating

**All-time (through 2025):** 894–422–53 (.672) as played · 11–0 later vacated (site default removes these) · site rating **#12 of 136**
**The ten:** AP wks 642 (92) · top-10 345 (91) · cons.AA 41 (89) · unan.AA 14 (89) · natl 2 (83) · conf 16 (75) · draft 365 (91) · 1st-rnd 47 (91) · wins 883 (92) · win% .670 (92)
**National titles (2):** 1951, 1998
**Conference titles:** 16 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 41 consensus, 14 unanimous · latest: 2009 Eric Berry (DB, unan.); 2015 Evan Berry (KR/AP); 2016 Derek Barnett (DL); 2022 Jalin Hyatt (WR, unan.)
**AP poll (1936–2025):** 642 weeks ranked / 345 top-10 / 127 top-5 / 18 at #1 · first ranked 1936 · 2 AP-#1 finishes (1951, 1998) · 12 top-5 finishes · longest ranked streak 24 yrs (1985–2008) · best finish AP #1 (1951)
**NFL draft (through 2026):** 365 picks, 47 first-round · last 10 drafts: 35 picks, 3 first-round
**Peak 10-yr stretch:** 1989–1998 — 100–20–3 (.825)
**Recent decade (2016–2025):** 74–51 (.592) · 0 national titles · 81 AP weeks
**Trend:** down — 2016–2025 rating 74.9/100 vs. all-time 89.7 (Δ -14.8) · biggest moves: Championships ↓, Wins ↓, All-Americans ↓

#### 13 · Miami (FL) — ACC · Blue Blood Contenders · 88.7 rating

**All-time (through 2025):** 686–394–19 (.633) as played · site rating **#13 of 136**
**The ten:** AP wks 544 (88) · top-10 325 (89) · cons.AA 40 (89) · unan.AA 16 (93) · natl 5 (94) · conf 9 (41) · draft 375 (92) · 1st-rnd 68 (97) · wins 686 (78) · win% .633 (87)
**National titles (5):** 1983, 1987, 1989, 1991, 2001
**Conference titles:** 9 (summary total — years not itemised)
**Heisman (2):** 1986 Vinny Testaverde · 1992 Gino Torretta
**All-Americans:** 40 consensus, 16 unanimous · latest: 2024 Xavier Restrepo (WR); 2024 Cam Ward (QB); 2025 Rueben Bain Jr. (DL); 2025 Francis Mauigoa (OL)
**AP poll (1936–2025):** 544 weeks ranked / 325 top-10 / 210 top-5 / 65 at #1 · first ranked 1950 · 6 AP-#1 finishes (1983, 1987, 1989, 1991, 2001, 2002) · 13 top-5 finishes · longest ranked streak 27 yrs (1980–2006) · best finish AP #1 (1983)
**NFL draft (through 2026):** 375 picks, 68 first-round · last 10 drafts: 52 picks, 7 first-round
**Peak 10-yr stretch:** 1985–1994 — 107–13 (.892)
**Recent decade (2016–2025):** 82–47 (.636) · 0 national titles · 91 AP weeks
**Trend:** down — 2016–2025 rating 80.1/100 vs. all-time 88.7 (Δ -8.6) · biggest moves: Championships ↓, All-Americans ↓, NFL Draft Success ↓

#### 14 · Florida — SEC · Blue Blood Contenders · 87.0 rating

**All-time (through 2025):** 770–458–40 (.623) as played · site rating **#14 of 136**
**The ten:** AP wks 638 (91) · top-10 350 (92) · cons.AA 34 (85) · unan.AA 8 (79) · natl 3 (88) · conf 8 (36) · draft 384 (92) · 1st-rnd 59 (96) · wins 770 (85) · win% .623 (85)
**National titles (3):** 1996, 2006, 2008
**Conference titles:** 8 (summary total — years not itemised)
**Heisman (3):** 1966 Steve Spurrier · 1996 Danny Wuerffel · 2007 Tim Tebow
**All-Americans:** 34 consensus, 8 unanimous · latest: 2010 Chas Henry (P); 2015 Vernon Hargreaves III (DB, unan.); 2020 Kyle Pitts (TE, unan.); 2022 O'Cyrus Torrence (OL)
**AP poll (1936–2025):** 638 weeks ranked / 350 top-10 / 185 top-5 / 40 at #1 · first ranked 1950 · 3 AP-#1 finishes (1996, 2006, 2008) · 11 top-5 finishes · longest ranked streak 34 yrs (1980–2013) · best finish AP #1 (1996)
**NFL draft (through 2026):** 384 picks, 59 first-round · last 10 drafts: 57 picks, 9 first-round
**Peak 10-yr stretch:** 1990–1999 — 102–22–1 (.820)
**Recent decade (2016–2025):** 71–54 (.568) · 0 national titles · 80 AP weeks
**Trend:** down — 2016–2025 rating 73.0/100 vs. all-time 87.0 (Δ -14.1) · biggest moves: Championships ↓, Wins ↓, All-Americans ↓

#### 15 · Florida State — ACC · Blue Blood Contenders · 86.7 rating

**All-time (through 2025):** 600–298–17 (.665) as played · 12–0 later vacated (site default removes these) · site rating **#15 of 136**
**The ten:** AP wks 584 (89) · top-10 386 (92) · cons.AA 46 (93) · unan.AA 15 (91) · natl 3 (88) · conf 15 (71) · draft 285 (81) · 1st-rnd 47 (91) · wins 588 (60) · win% .661 (90)
**National titles (3):** 1993, 1999, 2013
**Conference titles:** 15 (summary total — years not itemised)
**Heisman (3):** 1993 Charlie Ward · 2000 Chris Weinke · 2013 Jameis Winston
**All-Americans:** 46 consensus, 15 unanimous · latest: 2015 Jalen Ramsey (DB); 2016 DeMarcus Walker (DL); 2016 Dalvin Cook (RB, unan.); 2024 Alex Mastromanno (P)
**AP poll (1936–2025):** 584 weeks ranked / 386 top-10 / 257 top-5 / 72 at #1 · first ranked 1964 · 3 AP-#1 finishes (1993, 1999, 2013) · 17 top-5 finishes · longest ranked streak 42 yrs (1977–2018) · best finish AP #1 (1993)
**NFL draft (through 2026):** 285 picks, 47 first-round · last 10 drafts: 32 picks, 4 first-round
**Peak 10-yr stretch:** 1991–2000 — 110–13–1 (.891)
**Recent decade (2016–2025):** 66–57 (.537) · 0 national titles · 51 AP weeks
**Trend:** down — 2016–2025 rating 72.6/100 vs. all-time 86.7 (Δ -14.1) · biggest moves: Championships ↓, Wins ↓, All-Americans ↓

#### 16 · Clemson — ACC · Blue Blood Contenders · 86.1 rating

**All-time (through 2025):** 815–482–45 (.624) as played · site rating **#16 of 136**
**The ten:** AP wks 511 (86) · top-10 219 (86) · cons.AA 31 (81) · unan.AA 6 (74) · natl 3 (88) · conf 27 (92) · draft 289 (82) · 1st-rnd 41 (89) · wins 815 (91) · win% .624 (86)
**National titles (3):** 1981, 2016, 2018
**Conference titles:** 27 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 31 consensus, 6 unanimous · latest: 2018 Christian Wilkins (DL, unan.); 2019 John Simpson (OL); 2019 Isaiah Simmons (LB, unan.); 2020 Travis Etienne (KR/AP)
**AP poll (1936–2025):** 511 weeks ranked / 219 top-10 / 127 top-5 / 25 at #1 · first ranked 1939 · 3 AP-#1 finishes (1981, 2016, 2018) · 7 top-5 finishes · longest ranked streak 15 yrs (2011–2025) · best finish AP #1 (1981)
**NFL draft (through 2026):** 289 picks, 41 first-round · last 10 drafts: 53 picks, 14 first-round
**Peak 10-yr stretch:** 2012–2021 — 121–17 (.877)
**Recent decade (2016–2025):** 112–26 (.812) · 2 national titles · 128 AP weeks
**Trend:** up — 2016–2025 rating 95.1/100 vs. all-time 86.1 (Δ +9.0) · biggest moves: All-Americans ↑, NFL Draft Success ↑, Championships ↑

#### 17 · Texas A&M — SEC · Blue Blood Contenders · 85.9 rating

**All-time (through 2025):** 797–511–48 (.605) as played · site rating **#17 of 136**
**The ten:** AP wks 516 (87) · top-10 226 (88) · cons.AA 36 (86) · unan.AA 10 (85) · natl 2 (83) · conf 18 (83) · draft 317 (87) · 1st-rnd 37 (89) · wins 797 (89) · win% .605 (81)
**National titles (2):** 1919, 1939
**Conference titles:** 18 (summary total — years not itemised)
**Heisman (2):** 1957 John David Crow · 2012 Johnny Manziel
**All-Americans:** 36 consensus, 10 unanimous · latest: 2021 DeMarvin Leal (DL); 2023 Edgerrin Cooper (LB); 2025 KC Concepcion (AP); 2025 Cashius Howell (DL, unan.)
**AP poll (1936–2025):** 516 weeks ranked / 226 top-10 / 89 top-5 / 7 at #1 · first ranked 1936 · 1 AP-#1 finish (1939) · 4 top-5 finishes · longest ranked streak 18 yrs (1985–2002) · best finish AP #1 (1939)
**NFL draft (through 2026):** 317 picks, 37 first-round · last 10 drafts: 45 picks, 4 first-round
**Peak 10-yr stretch:** 1985–1994 — 95–24–2 (.793)
**Recent decade (2016–2025):** 80–45 (.640) · 0 national titles · 94 AP weeks
**Trend:** even — 2016–2025 rating 85.6/100 vs. all-time 85.9 (Δ -0.3)

#### 18 · Auburn — SEC · Blue Blood Contenders · 85.1 rating

**All-time (through 2025):** 809–485–47 (.621) as played · site rating **#18 of 136**
**The ten:** AP wks 598 (90) · top-10 293 (89) · cons.AA 31 (81) · unan.AA 9 (82) · natl 2 (83) · conf 12 (56) · draft 308 (86) · 1st-rnd 31 (85) · wins 809 (90) · win% .621 (84)
**National titles (2):** 1957, 2010
**Conference titles:** 12 (summary total — years not itemised)
**Heisman (3):** 1971 Pat Sullivan · 1985 Bo Jackson · 2010 Cam Newton
**All-Americans:** 31 consensus, 9 unanimous · latest: 2010 Lee Ziemba (OL); 2010 Cam Newton (QB); 2014 Reese Dismukes (C); 2019 Derrick Brown (DL, unan.)
**AP poll (1936–2025):** 598 weeks ranked / 293 top-10 / 129 top-5 / 9 at #1 · first ranked 1936 · 2 AP-#1 finishes (1957, 2010) · 9 top-5 finishes · longest ranked streak 12 yrs (2000–2011) · best finish AP #1 (1957)
**NFL draft (through 2026):** 308 picks, 31 first-round · last 10 drafts: 43 picks, 3 first-round
**Peak 10-yr stretch:** 1954–1963 — 78–22–3 (.772)
**Recent decade (2016–2025):** 68–58 (.540) · 0 national titles · 71 AP weeks
**Trend:** down — 2016–2025 rating 66.2/100 vs. all-time 85.1 (Δ -18.8) · biggest moves: Championships ↓, Wins ↓, All-Americans ↓

#### 19 · UCLA — Big Ten · Blue Blood Contenders · 84.1 rating

**All-time (through 2025):** 623–428–31 (.590) as played · site rating **#19 of 136**
**The ten:** AP wks 551 (89) · top-10 224 (87) · cons.AA 42 (90) · unan.AA 13 (88) · natl 1 (76) · conf 17 (79) · draft 340 (89) · 1st-rnd 35 (87) · wins 623 (67) · win% .590 (77)
**National titles (1):** 1954
**Conference titles:** 17 (summary total — years not itemised)
**Heisman (1):** 1967 Gary Beban
**All-Americans:** 42 consensus, 13 unanimous · latest: 2009 Kai Forbath (PK); 2013 Anthony Barr (LB); 2015 Ka'imi Fairbairn (PK); 2023 Laiatu Latu (DL, unan.)
**AP poll (1936–2025):** 551 weeks ranked / 224 top-10 / 109 top-5 / 7 at #1 · first ranked 1939 · 0 AP-#1 finishes · 9 top-5 finishes · longest ranked streak 31 yrs (1965–1995) · best finish AP #2 (1954)
**NFL draft (through 2026):** 340 picks, 35 first-round · last 10 drafts: 33 picks, 4 first-round
**Peak 10-yr stretch:** 1979–1988 — 84–29–5 (.733)
**Recent decade (2016–2025):** 53–65 (.449) · 0 national titles · 23 AP weeks
**Trend:** down — 2016–2025 rating 62.4/100 vs. all-time 84.1 (Δ -21.7) · biggest moves: Wins ↓, All-Americans ↓, Championships ↓

#### 20 · Pittsburgh — ACC · Blue Blood Contenders · 83.6 rating

**All-time (through 2025):** 776–571–42 (.574) as played · site rating **#20 of 136**
**The ten:** AP wks 318 (81) · top-10 125 (79) · cons.AA 55 (94) · unan.AA 15 (91) · natl 4 (92) · conf 3 (21) · draft 304 (86) · 1st-rnd 27 (83) · wins 776 (86) · win% .574 (72)
**National titles (4):** 1916, 1918, 1937, 1976
**Conference titles:** 3 (summary total — years not itemised)
**Heisman (1):** 1976 Tony Dorsett
**All-Americans:** 55 consensus, 15 unanimous · latest: 2020 Rashad Weaver (DL); 2020 Patrick Jones II (DL); 2021 Jordan Addison (WR); 2022 Calijah Kancy (DL, unan.)
**AP poll (1936–2025):** 318 weeks ranked / 125 top-10 / 70 top-5 / 21 at #1 · first ranked 1936 · 2 AP-#1 finishes (1937, 1976) · 6 top-5 finishes · longest ranked streak 12 yrs (1973–1984) · best finish AP #1 (1937)
**NFL draft (through 2026):** 304 picks, 27 first-round · last 10 drafts: 31 picks, 2 first-round
**Peak 10-yr stretch:** 1974–1983 — 94–23–2 (.798)
**Recent decade (2016–2025):** 72–56 (.563) · 0 national titles · 27 AP weeks
**Trend:** down — 2016–2025 rating 60.6/100 vs. all-time 83.6 (Δ -23.0) · biggest moves: AP Poll Success ↓, Championships ↓, Wins ↓

### National Powers

#### 21 · Washington — Big Ten · National Powers · 82.3 rating

**All-time (through 2025):** 790–477–50 (.619) as played · site rating **#21 of 136**
**The ten:** AP wks 479 (86) · top-10 194 (84) · cons.AA 24 (78) · unan.AA 5 (71) · natl 1 (76) · conf 17 (79) · draft 330 (89) · 1st-rnd 31 (85) · wins 790 (88) · win% .619 (82)
**National titles (1):** 1991
**Conference titles:** 17 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 24 consensus, 5 unanimous · latest: 2014 Hau'oli Kikaha (LB, unan.); 2016 Budda Baker (DB); 2017 Dante Pettis (KR/AP); 2023 Rome Odunze (WR)
**AP poll (1936–2025):** 479 weeks ranked / 194 top-10 / 85 top-5 / 15 at #1 · first ranked 1936 · 0 AP-#1 finishes · 7 top-5 finishes · longest ranked streak 27 yrs (1977–2003) · best finish AP #2 (1984)
**NFL draft (through 2026):** 330 picks, 31 first-round · last 10 drafts: 46 picks, 8 first-round
**Peak 10-yr stretch:** 1982–1991 — 87–30–2 (.739)
**Recent decade (2016–2025):** 87–37 (.702) · 0 national titles · 82 AP weeks
**Trend:** even — 2016–2025 rating 82.4/100 vs. all-time 82.3 (Δ +0.2)

#### 22 · Michigan State — Big Ten · National Powers · 81.4 rating

**All-time (through 2025):** 620–454–31 (.575) as played · site rating **#22 of 136**
**The ten:** AP wks 418 (84) · top-10 189 (83) · cons.AA 33 (83) · unan.AA 11 (86) · natl 3 (88) · conf 9 (41) · draft 328 (88) · 1st-rnd 36 (88) · wins 620 (66) · win% .575 (72)
**National titles (3):** 1952, 1965, 1966
**Conference titles:** 9 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 33 consensus, 11 unanimous · latest: 2011 Jerel Worthy (DL); 2013 Darqueze Dennard (DB, unan.); 2021 Kenneth Walker III (RB, unan.); 2022 Bryce Baringer (P)
**AP poll (1936–2025):** 418 weeks ranked / 189 top-10 / 109 top-5 / 29 at #1 · first ranked 1948 · 1 AP-#1 finish (1952) · 9 top-5 finishes · longest ranked streak 22 yrs (1948–1969) · best finish AP #1 (1952)
**NFL draft (through 2026):** 328 picks, 36 first-round · last 10 drafts: 18 picks, 0 first-round
**Peak 10-yr stretch:** 1948–1957 — 74–17–2 (.806)
**Recent decade (2016–2025):** 58–61 (.487) · 0 national titles · 44 AP weeks
**Trend:** down — 2016–2025 rating 59.7/100 vs. all-time 81.4 (Δ -21.7) · biggest moves: Championships ↓, Wins ↓, NFL Draft Success ↓

#### 23 · Wisconsin — Big Ten · National Powers · 80.3 rating

**All-time (through 2025):** 751–533–53 (.582) as played · site rating **#23 of 136**
**The ten:** AP wks 412 (83) · top-10 172 (83) · cons.AA 32 (82) · unan.AA 12 (87) · natl 0 (35) · conf 14 (66) · draft 303 (85) · 1st-rnd 30 (84) · wins 751 (84) · win% .582 (75)
**National titles:** none
**Conference titles:** 14 (summary total — years not itemised)
**Heisman (2):** 1954 Alan Ameche · 1999 Ron Dayne
**All-Americans:** 32 consensus, 12 unanimous · latest: 2018 Beau Benzschawel (OL); 2019 Zack Baun (LB); 2019 Tyler Biadasz (C, unan.); 2019 Jonathan Taylor (RB, unan.)
**AP poll (1936–2025):** 412 weeks ranked / 172 top-10 / 49 top-5 / 1 at #1 · first ranked 1937 · 0 AP-#1 finishes · 3 top-5 finishes · longest ranked streak 27 yrs (1997–2023) · best finish AP #2 (1962)
**NFL draft (through 2026):** 303 picks, 30 first-round · last 10 drafts: 31 picks, 2 first-round
**Peak 10-yr stretch:** 2009–2018 — 102–33 (.756)
**Recent decade (2016–2025):** 78–47 (.624) · 0 national titles · 80 AP weeks
**Trend:** even — 2016–2025 rating 80.1/100 vs. all-time 80.3 (Δ -0.2)

#### 24 · Arkansas — SEC · National Powers · 79.4 rating

**All-time (through 2025):** 749–555–40 (.572) as played · site rating **#24 of 136**
**The ten:** AP wks 430 (85) · top-10 201 (86) · cons.AA 25 (78) · unan.AA 9 (82) · natl 1 (76) · conf 13 (61) · draft 290 (83) · 1st-rnd 24 (77) · wins 749 (83) · win% .572 (70)
**National titles (1):** 1964
**Conference titles:** 13 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 25 consensus, 9 unanimous · latest: 2007 Felix Jones (KR); 2007 Darren McFadden (RB, unan.); 2011 Joe Adams (KR/AP); 2015 Hunter Henry (TE, unan.)
**AP poll (1936–2025):** 430 weeks ranked / 201 top-10 / 57 top-5 / 1 at #1 · first ranked 1936 · 0 AP-#1 finishes · 4 top-5 finishes · longest ranked streak 9 yrs (1974–1982) · best finish AP #2 (1964)
**NFL draft (through 2026):** 290 picks, 24 first-round · last 10 drafts: 24 picks, 2 first-round
**Peak 10-yr stretch:** 1961–1970 — 83–23–1 (.780)
**Recent decade (2016–2025):** 47–75 (.385) · 0 national titles · 21 AP weeks
**Trend:** down (emphatic) — 2016–2025 rating 46.6/100 vs. all-time 79.4 (Δ -32.8) · biggest moves: Wins ↓, All-Americans ↓, Championships ↓

#### 25 · Colorado — Big 12 · National Powers · 78.5 rating

**All-time (through 2025):** 682–530–35 (.561) as played · site rating **#25 of 136**
**The ten:** AP wks 313 (79) · top-10 142 (81) · cons.AA 33 (83) · unan.AA 6 (74) · natl 1 (76) · conf 26 (92) · draft 278 (78) · 1st-rnd 25 (80) · wins 682 (77) · win% .561 (69)
**National titles (1):** 1990
**Conference titles:** 26 (summary total — years not itemised)
**Heisman (2):** 1994 Rashaan Salaam · 2024 Travis Hunter
**All-Americans:** 33 consensus, 6 unanimous · latest: 2007 Jordan Dizon (LB); 2010 Nate Solder (OL); 2023 Travis Hunter (AP); 2024 Travis Hunter (AP, unan.)
**AP poll (1936–2025):** 313 weeks ranked / 142 top-10 / 47 top-5 / 7 at #1 · first ranked 1937 · 1 AP-#1 finish (1990) · 6 top-5 finishes · longest ranked streak 16 yrs (1988–2003) · best finish AP #1 (1990)
**NFL draft (through 2026):** 278 picks, 25 first-round · last 10 drafts: 14 picks, 1 first-round
**Peak 10-yr stretch:** 1987–1996 — 93–23–4 (.792)
**Recent decade (2016–2025):** 50–67 (.427) · 0 national titles · 23 AP weeks
**Trend:** down — 2016–2025 rating 56.9/100 vs. all-time 78.5 (Δ -21.6) · biggest moves: Wins ↓, Championships ↓, NFL Draft Success ↓

#### 26 · Iowa — Big Ten · National Powers · 78.3 rating

**All-time (through 2025):** 681–561–35 (.547) as played · 4–0 later vacated (site default removes these) · site rating **#26 of 136**
**The ten:** AP wks 363 (81) · top-10 129 (80) · cons.AA 37 (87) · unan.AA 17 (94) · natl 1 (76) · conf 13 (61) · draft 292 (83) · 1st-rnd 26 (82) · wins 677 (75) · win% .546 (58)
**National titles (1):** 1958
**Conference titles:** 13 (summary total — years not itemised)
**Heisman (1):** 1939 Nile Kinnick
**All-Americans:** 37 consensus, 17 unanimous · latest: 2024 Kaleb Johnson (RB); 2024 Jay Higgins (LB, unan.); 2025 Logan Jones (C, unan.); 2025 Kaden Wetjen (AP)
**AP poll (1936–2025):** 363 weeks ranked / 129 top-10 / 58 top-5 / 11 at #1 · first ranked 1939 · 0 AP-#1 finishes · 4 top-5 finishes · longest ranked streak 10 yrs (1983–1992) · best finish AP #2 (1958)
**NFL draft (through 2026):** 292 picks, 26 first-round · last 10 drafts: 42 picks, 6 first-round
**Peak 10-yr stretch:** 1982–1991 — 83–34–5 (.701)
**Recent decade (2016–2025):** 86–41 (.677) · 0 national titles · 59 AP weeks
**Trend:** even — 2016–2025 rating 83.3/100 vs. all-time 78.3 (Δ +5.0)

#### 27 · Minnesota — Big Ten · National Powers · 77.4 rating

**All-time (through 2025):** 749–553–44 (.573) as played · site rating **#27 of 136**
**The ten:** AP wks 174 (59) · top-10 82 (72) · cons.AA 34 (85) · unan.AA 7 (77) · natl 6 (95) · conf 18 (83) · draft 284 (81) · 1st-rnd 17 (69) · wins 749 (83) · win% .573 (71)
**National titles (6):** 1934, 1935, 1936, 1940, 1941, 1960
**Conference titles:** 18 (summary total — years not itemised)
**Heisman (1):** 1941 Bruce Smith
**All-Americans:** 34 consensus, 7 unanimous · latest: 1999 Ben Hamilton (C); 2000 Ben Hamilton (OL); 2005 Greg Eslinger (C, unan.); 2019 Antoine Winfield Jr. (DB, unan.)
**AP poll (1936–2025):** 174 weeks ranked / 82 top-10 / 46 top-5 / 18 at #1 · first ranked 1936 · 4 AP-#1 finishes (1936, 1940, 1941, 1960) · 5 top-5 finishes · longest ranked streak 8 yrs (1936–1943) · best finish AP #1 (1936)
**NFL draft (through 2026):** 284 picks, 17 first-round · last 10 drafts: 21 picks, 1 first-round
**Peak 10-yr stretch:** 1936–1945 — 57–25–2 (.690)
**Recent decade (2016–2025):** 75–48 (.610) · 0 national titles · 15 AP weeks
**Trend:** down — 2016–2025 rating 64.6/100 vs. all-time 77.4 (Δ -12.8) · biggest moves: Championships ↓, All-Americans ↓, Wins ↓

#### 28 · Stanford — ACC · National Powers · 76.2 rating

**All-time (through 2025):** 605–498–34 (.547) as played · site rating **#28 of 136**
**The ten:** AP wks 302 (78) · top-10 97 (77) · cons.AA 37 (87) · unan.AA 10 (85) · natl 1 (76) · conf 15 (71) · draft 283 (80) · 1st-rnd 25 (80) · wins 605 (63) · win% .547 (60)
**National titles (1):** 1926
**Conference titles:** 15 (summary total — years not itemised)
**Heisman (1):** 1970 Jim Plunkett
**All-Americans:** 37 consensus, 10 unanimous · latest: 2013 David Yankey (OL, unan.); 2015 Joshua Garnett (OL, unan.); 2015 Christian McCaffrey (KR/AP); 2017 Bryce Love (RB, unan.)
**AP poll (1936–2025):** 302 weeks ranked / 97 top-10 / 30 top-5 / 0 at #1 · first ranked 1937 · 0 AP-#1 finishes · 3 top-5 finishes · longest ranked streak 11 yrs (2009–2019) · best finish AP #2 (1940)
**NFL draft (through 2026):** 283 picks, 25 first-round · last 10 drafts: 28 picks, 2 first-round
**Peak 10-yr stretch:** 2009–2018 — 102–32 (.761)
**Recent decade (2016–2025):** 52–66 (.441) · 0 national titles · 30 AP weeks
**Trend:** down — 2016–2025 rating 61.8/100 vs. all-time 76.2 (Δ -14.4) · biggest moves: Wins ↓, All-Americans ↓, Championships ↓

#### 29 · Georgia Tech — ACC · National Powers · 74.9 rating

**All-time (through 2025):** 773–550–43 (.582) as played · 1–0 later vacated (site default removes these) · site rating **#29 of 136**
**The ten:** AP wks 316 (80) · top-10 147 (81) · cons.AA 22 (76) · unan.AA 3 (61) · natl 3 (88) · conf 15 (71) · draft 226 (70) · 1st-rnd 11 (58) · wins 772 (86) · win% .581 (74)
**National titles (3):** 1917, 1928, 1990
**Conference titles:** 15 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 22 consensus, 3 unanimous · latest: 1999 Joe Hamilton (QB); 2000 Chris Brown (OL); 2006 Calvin Johnson (WR, unan.); 2020 Pressley Harvin III (P, unan.)
**AP poll (1936–2025):** 316 weeks ranked / 147 top-10 / 58 top-5 / 0 at #1 · first ranked 1939 · 0 AP-#1 finishes · 5 top-5 finishes · longest ranked streak 16 yrs (1951–1966) · best finish AP #2 (1952)
**NFL draft (through 2026):** 226 picks, 11 first-round · last 10 drafts: 10 picks, 1 first-round
**Peak 10-yr stretch:** 1947–1956 — 88–20–3 (.806)
**Recent decade (2016–2025):** 58–64 (.475) · 0 national titles · 14 AP weeks
**Trend:** down (emphatic) — 2016–2025 rating 49.6/100 vs. all-time 74.9 (Δ -25.2) · biggest moves: Wins ↓, Championships ↓, NFL Draft Success ↓

#### 30 · TCU — Big 12 · National Powers · 74.3 rating

**All-time (through 2025):** 684–565–50 (.546) as played · site rating **#30 of 136**
**The ten:** AP wks 252 (72) · top-10 105 (78) · cons.AA 19 (73) · unan.AA 7 (77) · natl 1 (76) · conf 18 (83) · draft 228 (71) · 1st-rnd 17 (69) · wins 684 (78) · win% .546 (58)
**National titles (1):** 1938
**Conference titles:** 18 (summary total — years not itemised)
**Heisman (1):** 1938 Davey O'Brien
**All-Americans:** 19 consensus, 7 unanimous · latest: 2010 Tejay Johnson (DB); 2014 Paul Dawson (LB); 2015 Josh Doctson (WR, unan.); 2022 Steve Avila (OL)
**AP poll (1936–2025):** 252 weeks ranked / 105 top-10 / 52 top-5 / 2 at #1 · first ranked 1936 · 1 AP-#1 finish (1938) · 4 top-5 finishes · longest ranked streak 15 yrs (2005–2019) · best finish AP #1 (1938)
**NFL draft (through 2026):** 228 picks, 17 first-round · last 10 drafts: 30 picks, 4 first-round
**Peak 10-yr stretch:** 2002–2011 — 103–23 (.817)
**Recent decade (2016–2025):** 76–51 (.598) · 0 national titles · 37 AP weeks
**Trend:** even — 2016–2025 rating 70.1/100 vs. all-time 74.3 (Δ -4.2)

#### 31 · Illinois — Big Ten · National Powers · 73.3 rating

**All-time (through 2025):** 641–631–49 (.504) as played · site rating **#31 of 136**
**The ten:** AP wks 204 (67) · top-10 79 (70) · cons.AA 27 (79) · unan.AA 8 (79) · natl 3 (88) · conf 15 (71) · draft 261 (77) · 1st-rnd 19 (72) · wins 641 (71) · win% .504 (39)
**National titles (3):** 1919, 1923, 1927
**Conference titles:** 15 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 27 consensus, 8 unanimous · latest: 2007 J Leman (LB); 2011 Whitney Mercilus (DL, unan.); 2022 Devon Witherspoon (DB); 2023 Jer'Zhan Newton (DL)
**AP poll (1936–2025):** 204 weeks ranked / 79 top-10 / 37 top-5 / 0 at #1 · first ranked 1942 · 0 AP-#1 finishes · 3 top-5 finishes · longest ranked streak 8 yrs (1950–1957) · best finish AP #3 (1963)
**NFL draft (through 2026):** 261 picks, 19 first-round · last 10 drafts: 19 picks, 1 first-round
**Peak 10-yr stretch:** 1944–1953 — 53–33–7 (.608)
**Recent decade (2016–2025):** 54–66 (.450) · 0 national titles · 25 AP weeks
**Trend:** down — 2016–2025 rating 53.7/100 vs. all-time 73.3 (Δ -19.7) · biggest moves: All-Americans ↓, Wins ↓, Championships ↓

#### 32 · Ole Miss — SEC · National Powers · 73.1 rating

**All-time (through 2025):** 702–538–34 (.564) as played · 33–0 later vacated (site default removes these) · site rating **#32 of 136**
**The ten:** AP wks 364 (82) · top-10 153 (82) · cons.AA 14 (65) · unan.AA 4 (67) · natl 1 (76) · conf 6 (32) · draft 281 (79) · 1st-rnd 24 (77) · wins 669 (73) · win% .553 (65)
**National titles (1):** 1960
**Conference titles:** 6 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 14 consensus, 4 unanimous · latest: 2008 Michael Oher (OL, unan.); 2014 Senquez Golson (DB, unan.); 2020 Elijah Moore (WR); 2024 Walter Nolen (DL)
**AP poll (1936–2025):** 364 weeks ranked / 153 top-10 / 68 top-5 / 5 at #1 · first ranked 1939 · 0 AP-#1 finishes · 5 top-5 finishes · longest ranked streak 13 yrs (1952–1964) · best finish AP #2 (1959)
**NFL draft (through 2026):** 281 picks, 24 first-round · last 10 drafts: 39 picks, 3 first-round
**Peak 10-yr stretch:** 1954–1963 — 90–13–4 (.860)
**Recent decade (2016–2025):** 77–48 (.616) · 0 national titles · 85 AP weeks
**Trend:** even — 2016–2025 rating 70.7/100 vs. all-time 73.1 (Δ -2.4)

### National Brands

#### 33 · Arizona State — Big 12 · National Brands · 72.5 rating

**All-time (through 2025):** 657–432–24 (.601) as played · 10–0 later vacated (site default removes these) · site rating **#33 of 136**
**The ten:** AP wks 299 (76) · top-10 67 (64) · cons.AA 18 (72) · unan.AA 3 (61) · natl 0 (35) · conf 17 (79) · draft 254 (75) · 1st-rnd 28 (83) · wins 647 (72) · win% .597 (81)
**National titles:** none
**Conference titles:** 17 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 18 consensus, 3 unanimous · latest: 2002 Terrell Suggs (DL, unan.); 2006 Zach Miller (TE); 2012 Will Sutton (DL); 2016 Zane Gonzalez (PK, unan.)
**AP poll (1936–2025):** 299 weeks ranked / 67 top-10 / 20 top-5 / 0 at #1 · first ranked 1957 · 0 AP-#1 finishes · 3 top-5 finishes · longest ranked streak 17 yrs (1968–1984) · best finish AP #2 (1975)
**NFL draft (through 2026):** 254 picks, 28 first-round · last 10 drafts: 19 picks, 4 first-round
**Peak 10-yr stretch:** 1966–1975 — 91–20 (.820)
**Recent decade (2016–2025):** 62–57 (.521) · 0 national titles · 21 AP weeks
**Trend:** down — 2016–2025 rating 59.6/100 vs. all-time 72.5 (Δ -12.9) · biggest moves: Wins ↓, All-Americans ↓, AP Poll Success ↓

#### 34 · Oregon — Big Ten · National Brands · 72.1 rating

**All-time (through 2025):** 653–472–34 (.578) as played · site rating **#34 of 136**
**The ten:** AP wks 394 (83) · top-10 200 (85) · cons.AA 11 (60) · unan.AA 5 (71) · natl 0 (35) · conf 13 (61) · draft 263 (78) · 1st-rnd 25 (80) · wins 653 (72) · win% .578 (73)
**National titles:** none
**Conference titles:** 13 (summary total — years not itemised)
**Heisman (1):** 2014 Marcus Mariota
**All-Americans:** 11 consensus, 5 unanimous · latest: 2019 Penei Sewell (OL, unan.); 2021 Verone McKinley III (DB); 2021 Kayvon Thibodeaux (DL, unan.); 2023 Jackson Powers-Johnson (C, unan.)
**AP poll (1936–2025):** 394 weeks ranked / 200 top-10 / 93 top-5 / 16 at #1 · first ranked 1939 · 0 AP-#1 finishes · 8 top-5 finishes · longest ranked streak 28 yrs (1998–2025) · best finish AP #2 (2001)
**NFL draft (through 2026):** 263 picks, 25 first-round · last 10 drafts: 47 picks, 9 first-round
**Peak 10-yr stretch:** 2005–2014 — 106–26 (.803)
**Recent decade (2016–2025):** 94–35 (.729) · 0 national titles · 122 AP weeks
**Trend:** up — 2016–2025 rating 87.9/100 vs. all-time 72.1 (Δ +15.8) · biggest moves: All-Americans ↑, Wins ↑, NFL Draft Success ↑

#### 35 · Syracuse — ACC · National Brands · 71.3 rating

**All-time (through 2025):** 712–556–42 (.560) as played · 11–0 later vacated (site default removes these) · site rating **#35 of 136**
**The ten:** AP wks 213 (69) · top-10 69 (65) · cons.AA 20 (74) · unan.AA 9 (82) · natl 1 (76) · conf 5 (29) · draft 210 (68) · 1st-rnd 19 (72) · wins 701 (79) · win% .556 (67)
**National titles (1):** 1959
**Conference titles:** 5 (summary total — years not itemised)
**Heisman (1):** 1961 Ernie Davis
**All-Americans:** 20 consensus, 9 unanimous · latest: 1990 John Flannery (C); 1992 Chris Gedney (TE, unan.); 2001 Dwight Freeney (DL, unan.); 2018 Andre Szmyt (PK, unan.)
**AP poll (1936–2025):** 213 weeks ranked / 69 top-10 / 19 top-5 / 7 at #1 · first ranked 1937 · 1 AP-#1 finish (1959) · 2 top-5 finishes · longest ranked streak 9 yrs (1991–1999) · best finish AP #1 (1959)
**NFL draft (through 2026):** 210 picks, 19 first-round · last 10 drafts: 12 picks, 0 first-round
**Peak 10-yr stretch:** 1987–1996 — 87–28–4 (.748)
**Recent decade (2016–2025):** 55–68 (.447) · 0 national titles · 17 AP weeks
**Trend:** down (emphatic) — 2016–2025 rating 40.3/100 vs. all-time 71.3 (Δ -31.0) · biggest moves: Wins ↓, NFL Draft Success ↓, AP Poll Success ↓

#### 36 · California — ACC · National Brands · 70.7 rating

**All-time (through 2025):** 608–557–31 (.521) as played · 4–0 later vacated (site default removes these) · site rating **#36 of 136**
**The ten:** AP wks 198 (67) · top-10 91 (75) · cons.AA 31 (81) · unan.AA 3 (61) · natl 3 (88) · conf 14 (66) · draft 245 (74) · 1st-rnd 25 (80) · wins 604 (62) · win% .520 (50)
**National titles (3):** 1920, 1921, 1922
**Conference titles:** 14 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 31 consensus, 3 unanimous · latest: 2006 Daymeion Hughes (DB); 2014 Vic Beasley (DL); 2019 Evan Weaver (LB, unan.); 2024 Nohl Williams (DB)
**AP poll (1936–2025):** 198 weeks ranked / 91 top-10 / 46 top-5 / 4 at #1 · first ranked 1937 · 0 AP-#1 finishes · 4 top-5 finishes · longest ranked streak 8 yrs (1947–1954) · best finish AP #2 (1937)
**NFL draft (through 2026):** 245 picks, 25 first-round · last 10 drafts: 18 picks, 0 first-round
**Peak 10-yr stretch:** 1945–1954 — 68–30–4 (.686)
**Recent decade (2016–2025):** 54–63 (.462) · 0 national titles · 3 AP weeks
**Trend:** down — 2016–2025 rating 51.0/100 vs. all-time 70.7 (Δ -19.7) · biggest moves: AP Poll Success ↓, Championships ↓, Wins ↓

#### 37 · West Virginia — Big 12 · National Brands · 69.9 rating

**All-time (through 2025):** 791–541–45 (.591) as played · site rating **#37 of 136**
**The ten:** AP wks 301 (77) · top-10 89 (74) · cons.AA 14 (65) · unan.AA 4 (67) · natl 0 (35) · conf 15 (71) · draft 200 (66) · 1st-rnd 12 (61) · wins 791 (89) · win% .591 (78)
**National titles:** none
**Conference titles:** 15 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 14 consensus, 4 unanimous · latest: 2006 Dan Mozes (C, unan.); 2020 Darius Stills (DL); 2023 Beanie Bishop Jr. (DB); 2024 Wyatt Milum (OL)
**AP poll (1936–2025):** 301 weeks ranked / 89 top-10 / 33 top-5 / 0 at #1 · first ranked 1953 · 0 AP-#1 finishes · 2 top-5 finishes · longest ranked streak 11 yrs (2002–2012) · best finish AP #5 (1988)
**NFL draft (through 2026):** 200 picks, 12 first-round · last 10 drafts: 14 picks, 0 first-round
**Peak 10-yr stretch:** 2002–2011 — 95–33 (.742)
**Recent decade (2016–2025):** 66–57 (.537) · 0 national titles · 34 AP weeks
**Trend:** down — 2016–2025 rating 60.8/100 vs. all-time 69.9 (Δ -9.1) · biggest moves: Wins ↓, All-Americans ↓, Championships ↑

#### 38 · BYU — Big 12 · National Brands · 69.7 rating

**All-time (through 2025):** 639–447–26 (.586) as played · site rating **#38 of 136**
**The ten:** AP wks 298 (75) · top-10 68 (64) · cons.AA 14 (65) · unan.AA 6 (74) · natl 1 (76) · conf 23 (89) · draft 155 (53) · 1st-rnd 10 (57) · wins 639 (70) · win% .586 (76)
**National titles (1):** 1984
**Conference titles:** 23 (summary total — years not itemised)
**Heisman (1):** 1990 Ty Detmer
**All-Americans:** 14 consensus, 6 unanimous · latest: 1991 Ty Detmer (QB); 2001 Luke Staley (RB); 2009 Dennis Pitta (TE); 2020 Brady Christensen (OL)
**AP poll (1936–2025):** 298 weeks ranked / 68 top-10 / 17 top-5 / 4 at #1 · first ranked 1974 · 1 AP-#1 finish (1984) · 2 top-5 finishes · longest ranked streak 7 yrs (1988–1994) · best finish AP #1 (1984)
**NFL draft (through 2026):** 155 picks, 10 first-round · last 10 drafts: 15 picks, 1 first-round
**Peak 10-yr stretch:** 1976–1985 — 104–21 (.832)
**Recent decade (2016–2025):** 84–45 (.651) · 0 national titles · 62 AP weeks
**Trend:** even — 2016–2025 rating 68.8/100 vs. all-time 69.7 (Δ -1.0)

#### 39 · Utah — Big 12 · National Brands · 67.4 rating

**All-time (through 2025):** 706–475–31 (.595) as played · site rating **#39 of 136**
**The ten:** AP wks 190 (64) · top-10 40 (60) · cons.AA 13 (62) · unan.AA 5 (71) · natl 0 (35) · conf 28 (93) · draft 184 (63) · 1st-rnd 12 (61) · wins 706 (80) · win% .595 (79)
**National titles:** none
**Conference titles:** 28 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 13 consensus, 5 unanimous · latest: 2021 Devin Lloyd (LB); 2022 Clark Phillips III (DB, unan.); 2023 Jonah Elliss (DL); 2025 Spencer Fano (OL, unan.)
**AP poll (1936–2025):** 190 weeks ranked / 40 top-10 / 9 top-5 / 0 at #1 · first ranked 1947 · 0 AP-#1 finishes · 2 top-5 finishes · longest ranked streak 12 yrs (2014–2025) · best finish AP #2 (2008)
**NFL draft (through 2026):** 184 picks, 12 first-round · last 10 drafts: 34 picks, 5 first-round
**Peak 10-yr stretch:** 2001–2010 — 92–32 (.742)
**Recent decade (2016–2025):** 83–42 (.664) · 0 national titles · 92 AP weeks
**Trend:** up — 2016–2025 rating 86.0/100 vs. all-time 67.4 (Δ +18.6) · biggest moves: All-Americans ↑, AP Poll Success ↑, NFL Draft Success ↑

#### 40 · Purdue — Big Ten · National Brands · 67.3 rating

**All-time (through 2025):** 633–614–48 (.507) as played · site rating **#40 of 136**
**The ten:** AP wks 236 (71) · top-10 83 (72) · cons.AA 22 (76) · unan.AA 7 (77) · natl 0 (35) · conf 12 (56) · draft 302 (84) · 1st-rnd 22 (76) · wins 633 (69) · win% .507 (42)
**National titles:** none
**Conference titles:** 12 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 22 consensus, 7 unanimous · latest: 2004 Taylor Stubblefield (WR); 2010 Ryan Kerrigan (DL, unan.); 2018 Rondale Moore (KR/AP); 2021 David Bell (WR)
**AP poll (1936–2025):** 236 weeks ranked / 83 top-10 / 27 top-5 / 5 at #1 · first ranked 1936 · 0 AP-#1 finishes · 1 top-5 finishes · longest ranked streak 6 yrs (1964–1969) · best finish AP #5 (1943)
**NFL draft (through 2026):** 302 picks, 22 first-round · last 10 drafts: 17 picks, 1 first-round
**Peak 10-yr stretch:** 1960–1969 — 65–28–3 (.693)
**Recent decade (2016–2025):** 46–73 (.387) · 0 national titles · 1 AP weeks
**Trend:** down (emphatic) — 2016–2025 rating 41.0/100 vs. all-time 67.3 (Δ -26.3) · biggest moves: Wins ↓, All-Americans ↓, AP Poll Success ↓

#### 41 · Missouri — SEC · National Brands · 66.3 rating

**All-time (through 2025):** 683–569–50 (.544) as played · 9–0 later vacated (site default removes these) · site rating **#41 of 136**
**The ten:** AP wks 291 (74) · top-10 95 (76) · cons.AA 16 (70) · unan.AA 2 (54) · natl 0 (35) · conf 12 (56) · draft 242 (73) · 1st-rnd 21 (75) · wins 674 (74) · win% .541 (55)
**National titles:** none
**Conference titles:** 12 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 16 consensus, 2 unanimous · latest: 2013 Michael Sam (DL, unan.); 2014 Shane Ray (DL); 2023 Cody Schrader (RB); 2025 Ahmad Hardy (RB)
**AP poll (1936–2025):** 291 weeks ranked / 95 top-10 / 23 top-5 / 2 at #1 · first ranked 1939 · 0 AP-#1 finishes · 3 top-5 finishes · longest ranked streak 6 yrs (2006–2011) · best finish AP #4 (2007)
**NFL draft (through 2026):** 242 picks, 21 first-round · last 10 drafts: 29 picks, 3 first-round
**Peak 10-yr stretch:** 1960–1969 — 76–23–6 (.752)
**Recent decade (2016–2025):** 71–54 (.568) · 0 national titles · 40 AP weeks
**Trend:** even — 2016–2025 rating 65.1/100 vs. all-time 66.3 (Δ -1.2)

#### 42 · North Carolina — ACC · National Brands · 65.9 rating

**All-time (through 2025):** 695–562–48 (.551) as played · 16–0 later vacated (site default removes these) · site rating **#42 of 136**
**The ten:** AP wks 279 (73) · top-10 80 (71) · cons.AA 15 (68) · unan.AA 3 (61) · natl 0 (35) · conf 10 (45) · draft 259 (76) · 1st-rnd 25 (80) · wins 679 (76) · win% .545 (57)
**National titles:** none
**Conference titles:** 10 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 15 consensus, 3 unanimous · latest: 1997 Dre' Bly (DB); 1997 Brian Simmons (LB); 2001 Julius Peppers (DL, unan.); 2012 Jonathan Cooper (OL, unan.)
**AP poll (1936–2025):** 279 weeks ranked / 80 top-10 / 27 top-5 / 1 at #1 · first ranked 1937 · 0 AP-#1 finishes · 1 top-5 finishes · longest ranked streak 8 yrs (1976–1983) · best finish AP #3 (1948)
**NFL draft (through 2026):** 259 picks, 25 first-round · last 10 drafts: 29 picks, 3 first-round
**Peak 10-yr stretch:** 1976–1985 — 77–37–3 (.671)
**Recent decade (2016–2025):** 61–65 (.484) · 0 national titles · 40 AP weeks
**Trend:** down — 2016–2025 rating 53.4/100 vs. all-time 65.9 (Δ -12.6) · biggest moves: All-Americans ↓, Wins ↓, Championships ↑

#### 43 · Virginia Tech — ACC · National Brands · 65.5 rating

**All-time (through 2025):** 781–521–46 (.596) as played · site rating **#43 of 136**
**The ten:** AP wks 302 (78) · top-10 91 (75) · cons.AA 8 (56) · unan.AA 4 (67) · natl 0 (35) · conf 11 (50) · draft 166 (56) · 1st-rnd 13 (63) · wins 781 (87) · win% .596 (80)
**National titles:** none
**Conference titles:** 11 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 8 consensus, 4 unanimous · latest: 1999 Corey Moore (DL, unan.); 2003 Kevin Jones (RB); 2003 Jake Grove (C, unan.); 2005 Jimmy Williams (DB, unan.)
**AP poll (1936–2025):** 302 weeks ranked / 91 top-10 / 44 top-5 / 0 at #1 · first ranked 1954 · 0 AP-#1 finishes · 1 top-5 finishes · longest ranked streak 22 yrs (1993–2014) · best finish AP #2 (1999)
**NFL draft (through 2026):** 166 picks, 13 first-round · last 10 drafts: 24 picks, 4 first-round
**Peak 10-yr stretch:** 1998–2007 — 99–29 (.773)
**Recent decade (2016–2025):** 63–63 (.500) · 0 national titles · 37 AP weeks
**Trend:** down — 2016–2025 rating 49.7/100 vs. all-time 65.5 (Δ -15.9) · biggest moves: AP Poll Success ↓, Wins ↓, All-Americans ↓

#### 44 · Maryland — Big Ten · National Brands · 64.8 rating

**All-time (through 2025):** 594–561–30 (.514) as played · site rating **#44 of 136**
**The ten:** AP wks 189 (63) · top-10 79 (70) · cons.AA 12 (61) · unan.AA 5 (71) · natl 1 (76) · conf 11 (50) · draft 237 (72) · 1st-rnd 18 (71) · wins 594 (61) · win% .514 (45)
**National titles (1):** 1953
**Conference titles:** 11 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 12 consensus, 5 unanimous · latest: 1979 Dale Castro (PK); 1985 J.D. Maarleveld (OL); 2001 E.J. Henderson (LB); 2002 E.J. Henderson (LB)
**AP poll (1936–2025):** 189 weeks ranked / 79 top-10 / 45 top-5 / 6 at #1 · first ranked 1949 · 1 AP-#1 finish (1953) · 3 top-5 finishes · longest ranked streak 8 yrs (1949–1956) · best finish AP #1 (1953)
**NFL draft (through 2026):** 237 picks, 18 first-round · last 10 drafts: 25 picks, 3 first-round
**Peak 10-yr stretch:** 1946–1955 — 76–21–4 (.772)
**Recent decade (2016–2025):** 51–66 (.436) · 0 national titles · 1 AP weeks
**Trend:** down (emphatic) — 2016–2025 rating 39.1/100 vs. all-time 64.8 (Δ -25.7) · biggest moves: AP Poll Success ↓, All-Americans ↓, Wins ↓

#### 45 · Baylor — Big 12 · National Brands · 64.4 rating

**All-time (through 2025):** 631–605–41 (.510) as played · site rating **#45 of 136**
**The ten:** AP wks 226 (70) · top-10 84 (73) · cons.AA 18 (72) · unan.AA 10 (85) · natl 0 (35) · conf 9 (41) · draft 246 (75) · 1st-rnd 19 (72) · wins 631 (68) · win% .510 (43)
**National titles:** none
**Conference titles:** 9 (summary total — years not itemised)
**Heisman (1):** 2011 Robert Griffin III
**All-Americans:** 18 consensus, 10 unanimous · latest: 2015 Spencer Drango (OL, unan.); 2015 Corey Coleman (WR, unan.); 2019 James Lynch (DL, unan.); 2021 Jalen Pitre (DB)
**AP poll (1936–2025):** 226 weeks ranked / 84 top-10 / 24 top-5 / 0 at #1 · first ranked 1937 · 0 AP-#1 finishes · 1 top-5 finishes · longest ranked streak 7 yrs (2010–2016) · best finish AP #5 (2021)
**NFL draft (through 2026):** 246 picks, 19 first-round · last 10 drafts: 16 picks, 0 first-round
**Peak 10-yr stretch:** 1947–1956 — 66–33–5 (.659)
**Recent decade (2016–2025):** 62–63 (.496) · 0 national titles · 37 AP weeks
**Trend:** even — 2016–2025 rating 60.1/100 vs. all-time 64.4 (Δ -4.3)

#### 46 · Oklahoma State — Big 12 · National Brands · 63.6 rating

**All-time (through 2025):** 610–558–41 (.522) as played · site rating **#46 of 136**
**The ten:** AP wks 291 (74) · top-10 75 (67) · cons.AA 21 (75) · unan.AA 9 (82) · natl 0 (35) · conf 10 (45) · draft 177 (59) · 1st-rnd 21 (75) · wins 610 (64) · win% .522 (50)
**National titles:** none
**Conference titles:** 10 (summary total — years not itemised)
**Heisman (1):** 1988 Barry Sanders
**All-Americans:** 21 consensus, 9 unanimous · latest: 2013 Justin Gilbert (DB); 2017 James Washington (WR, unan.); 2019 Chuba Hubbard (RB, unan.); 2023 Ollie Gordon II (RB, unan.)
**AP poll (1936–2025):** 291 weeks ranked / 75 top-10 / 17 top-5 / 0 at #1 · first ranked 1944 · 0 AP-#1 finishes · 2 top-5 finishes · longest ranked streak 17 yrs (2008–2024) · best finish AP #3 (2011)
**NFL draft (through 2026):** 177 picks, 21 first-round · last 10 drafts: 21 picks, 0 first-round
**Peak 10-yr stretch:** 2008–2017 — 96–34 (.738)
**Recent decade (2016–2025):** 76–52 (.594) · 0 national titles · 81 AP weeks
**Trend:** even — 2016–2025 rating 69.3/100 vs. all-time 63.6 (Δ +5.7)

#### 47 · Army — American · National Brands · 63.4 rating

**All-time (through 2025):** 746–553–51 (.571) as played · site rating **#47 of 136**
**The ten:** AP wks 156 (56) · top-10 104 (78) · cons.AA 37 (87) · unan.AA 8 (79) · natl 3 (88) · conf 0 (3) · draft 28 (17) · 1st-rnd 3 (39) · wins 746 (82) · win% .571 (69)
**National titles (3):** 1914, 1944, 1945
**Conference titles:** none
**Heisman (3):** 1945 Doc Blanchard · 1946 Glenn Davis · 1958 Pete Dawkins
**All-Americans:** 37 consensus, 8 unanimous · latest: 1950 Dan Foldberg (E, unan.); 1957 Bob Anderson (B); 1958 Pete Dawkins (B, unan.); 1959 Bill Carpenter (E)
**AP poll (1936–2025):** 156 weeks ranked / 104 top-10 / 75 top-5 / 27 at #1 · first ranked 1936 · 2 AP-#1 finishes (1944, 1945) · 6 top-5 finishes · longest ranked streak 10 yrs (1941–1950) · best finish AP #1 (1944)
**NFL draft (through 2026):** 28 picks, 3 first-round · last 10 drafts: 0 picks, 0 first-round
**Peak 10-yr stretch:** 1941–1950 — 75–11–6 (.848)
**Recent decade (2016–2025):** 83–45 (.648) · 0 national titles · 16 AP weeks
**Trend:** down (emphatic) — 2016–2025 rating 36.5/100 vs. all-time 63.4 (Δ -26.8) · biggest moves: All-Americans ↓, AP Poll Success ↓, Championships ↓

### The Field

#### 48 · Boston College — ACC · The Field · 60.5 rating

**All-time (through 2025):** 554–471–15 (.540) as played · site rating **#48 of 136**
**The ten:** AP wks 139 (54) · top-10 34 (56) · cons.AA 14 (65) · unan.AA 3 (61) · natl 0.5 (71) · conf 1 (9) · draft 225 (69) · 1st-rnd 21 (75) · wins 554 (54) · win% .540 (54)
**National titles:** 0.5 (from summary totals — years not itemised in staging)
**Conference titles:** 1 (summary total — years not itemised)
**Heisman (1):** 1984 Doug Flutie
**All-Americans:** 14 consensus, 3 unanimous · latest: 2010 Luke Kuechly (LB, unan.); 2011 Luke Kuechly (LB); 2013 Andre Williams (RB, unan.); 2024 Donovan Ezeiruaku (DL)
**AP poll (1936–2025):** 139 weeks ranked / 34 top-10 / 16 top-5 / 1 at #1 · first ranked 1939 · 0 AP-#1 finishes · 2 top-5 finishes · longest ranked streak 5 yrs (2004–2008) · best finish AP #5 (1940)
**NFL draft (through 2026):** 225 picks, 21 first-round · last 10 drafts: 23 picks, 3 first-round
**Peak 10-yr stretch:** 1938–1947 — 59–22–2 (.723)
**Recent decade (2016–2025):** 58–66 (.468) · 0 national titles · 5 AP weeks
**Trend:** down — 2016–2025 rating 42.1/100 vs. all-time 60.5 (Δ -18.4) · biggest moves: All-Americans ↓, AP Poll Success ↓, Championships ↓

#### 49 · SMU — ACC · The Field · 60.2 rating

**All-time (through 2025):** 554–570–54 (.493) as played · 4–6 later vacated (site default removes these) · site rating **#49 of 136**
**The ten:** AP wks 197 (65) · top-10 75 (67) · cons.AA 16 (70) · unan.AA 3 (61) · natl 1.5 (81) · conf 11 (50) · draft 184 (63) · 1st-rnd 7 (53) · wins 550 (53) · win% .494 (38)
**National titles:** 1.5 (from summary totals — years not itemised in staging)
**Conference titles:** 11 (summary total — years not itemised)
**Heisman (1):** 1948 Doak Walker
**All-Americans:** 16 consensus, 3 unanimous · latest: 1980 John Simmons (DB); 1982 Eric Dickerson (RB, unan.); 1983 Russell Carter (DB, unan.); 1985 Reggie Dupard (RB)
**AP poll (1936–2025):** 197 weeks ranked / 75 top-10 / 30 top-5 / 2 at #1 · first ranked 1936 · 0 AP-#1 finishes · 3 top-5 finishes · longest ranked streak 8 yrs (1979–1986) · best finish AP #2 (1982)
**NFL draft (through 2026):** 184 picks, 7 first-round · last 10 drafts: 12 picks, 0 first-round
**Peak 10-yr stretch:** 1977–1986 — 74–38–2 (.658)
**Recent decade (2016–2025):** 80–46 (.635) · 0 national titles · 36 AP weeks
**Trend:** down — 2016–2025 rating 51.6/100 vs. all-time 60.2 (Δ -8.6) · biggest moves: All-Americans ↓, Wins ↑, Championships ↓

#### 50 · Texas Tech — Big 12 · The Field · 59.1 rating

**All-time (through 2025):** 589–471–24 (.554) as played · site rating **#50 of 136**
**The ten:** AP wks 155 (56) · top-10 39 (58) · cons.AA 14 (65) · unan.AA 8 (79) · natl 0 (35) · conf 11 (50) · draft 178 (60) · 1st-rnd 11 (58) · wins 589 (61) · win% .554 (66)
**National titles:** none
**Conference titles:** 11 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 14 consensus, 8 unanimous · latest: 2008 Brandon Carter (OL); 2013 Jace Amaro (TE, unan.); 2025 Jacob Rodriguez (LB, unan.); 2025 David Bailey (DL, unan.)
**AP poll (1936–2025):** 155 weeks ranked / 39 top-10 / 8 top-5 / 0 at #1 · first ranked 1938 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 6 yrs (2004–2009) · best finish AP #7 (2025)
**NFL draft (through 2026):** 178 picks, 11 first-round · last 10 drafts: 24 picks, 4 first-round
**Peak 10-yr stretch:** 2001–2010 — 86–42 (.672)
**Recent decade (2016–2025):** 66–59 (.528) · 0 national titles · 19 AP weeks
**Trend:** even — 2016–2025 rating 62.1/100 vs. all-time 59.1 (Δ +3.0)

#### 51 · North Carolina State — ACC · The Field · 58.1 rating

**All-time (through 2025):** 631–595–48 (.514) as played · site rating **#51 of 136**
**The ten:** AP wks 189 (63) · top-10 12 (48) · cons.AA 12 (61) · unan.AA 4 (67) · natl 0 (35) · conf 11 (50) · draft 181 (61) · 1st-rnd 18 (71) · wins 631 (68) · win% .514 (46)
**National titles:** none
**Conference titles:** 11 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 12 consensus, 4 unanimous · latest: 2018 Garrett Bradbury (C); 2021 Ikem Ekwonu (OL, unan.); 2022 Christopher Dunn (PK); 2023 Payton Wilson (LB, unan.)
**AP poll (1936–2025):** 189 weeks ranked / 12 top-10 / 4 top-5 / 0 at #1 · first ranked 1946 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 5 yrs (1991–1995) · best finish AP #11 (1974)
**NFL draft (through 2026):** 181 picks, 18 first-round · last 10 drafts: 25 picks, 3 first-round
**Peak 10-yr stretch:** 1972–1981 — 70–42–4 (.621)
**Recent decade (2016–2025):** 77–50 (.606) · 0 national titles · 41 AP weeks
**Trend:** up — 2016–2025 rating 71.4/100 vs. all-time 58.1 (Δ +13.3) · biggest moves: All-Americans ↑, Wins ↑, NFL Draft Success ↑

#### 52 · Kentucky — SEC · The Field · 56.2 rating

**All-time (through 2025):** 549–606–37 (.476) as played · 10–0 later vacated (site default removes these) · site rating **#52 of 136**
**The ten:** AP wks 111 (52) · top-10 32 (55) · cons.AA 14 (65) · unan.AA 3 (61) · natl 0.5 (71) · conf 2 (16) · draft 222 (69) · 1st-rnd 17 (69) · wins 539 (50) · win% .472 (29)
**National titles:** 0.5 (from summary totals — years not itemised in staging)
**Conference titles:** 2 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 14 consensus, 3 unanimous · latest: 2018 Josh Allen (LB, unan.); 2019 Max Duffy (P, unan.); 2019 Lynn Bowden Jr. (AP); 2021 Darian Kinnard (OL)
**AP poll (1936–2025):** 111 weeks ranked / 32 top-10 / 8 top-5 / 0 at #1 · first ranked 1939 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 7 yrs (1949–1955) · best finish AP #6 (1977)
**NFL draft (through 2026):** 222 picks, 17 first-round · last 10 drafts: 30 picks, 3 first-round
**Peak 10-yr stretch:** 1946–1955 — 73–29–6 (.704)
**Recent decade (2016–2025):** 70–56 (.556) · 0 national titles · 33 AP weeks
**Trend:** up — 2016–2025 rating 67.4/100 vs. all-time 56.2 (Δ +11.2) · biggest moves: Wins ↑, All-Americans ↑, Championships ↓

#### 53 · Arizona — Big 12 · The Field · 55.0 rating

**All-time (through 2025):** 521–481–25 (.519) as played · site rating **#53 of 136**
**The ten:** AP wks 180 (60) · top-10 31 (54) · cons.AA 17 (71) · unan.AA 6 (74) · natl 0 (35) · conf 6 (32) · draft 196 (64) · 1st-rnd 12 (61) · wins 521 (47) · win% .519 (49)
**National titles:** none
**Conference titles:** 6 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 17 consensus, 6 unanimous · latest: 2012 Ka'Deem Carey (RB); 2013 Ka'Deem Carey (RB); 2014 Scooby Wright III (LB, unan.); 2024 Tetairoa McMillan (WR)
**AP poll (1936–2025):** 180 weeks ranked / 31 top-10 / 5 top-5 / 0 at #1 · first ranked 1961 · 0 AP-#1 finishes · 1 top-5 finishes · longest ranked streak 4 yrs (1992–1995) · best finish AP #4 (1998)
**NFL draft (through 2026):** 196 picks, 12 first-round · last 10 drafts: 15 picks, 2 first-round
**Peak 10-yr stretch:** 1981–1990 — 69–39–6 (.632)
**Recent decade (2016–2025):** 48–68 (.414) · 0 national titles · 12 AP weeks
**Trend:** down — 2016–2025 rating 38.9/100 vs. all-time 55.0 (Δ -16.1) · biggest moves: All-Americans ↓, Wins ↓, AP Poll Success ↓

#### 54 · Houston — Big 12 · The Field · 54.4 rating

**All-time (through 2025):** 475–389–15 (.549) as played · site rating **#54 of 136**
**The ten:** AP wks 206 (68) · top-10 55 (61) · cons.AA 10 (58) · unan.AA 0 (19) · natl 0 (35) · conf 11 (50) · draft 192 (64) · 1st-rnd 15 (65) · wins 475 (41) · win% .549 (61)
**National titles:** none
**Conference titles:** 11 (summary total — years not itemised)
**Heisman (1):** 1989 Andre Ware
**All-Americans:** 10 consensus, 0 unanimous · latest: 1989 Andre Ware (QB); 2017 Ed Oliver (DL); 2018 Ed Oliver (DL); 2021 Marcus Jones (KR/AP)
**AP poll (1936–2025):** 206 weeks ranked / 55 top-10 / 9 top-5 / 0 at #1 · first ranked 1952 · 0 AP-#1 finishes · 2 top-5 finishes · longest ranked streak 5 yrs (1967–1971) · best finish AP #4 (1976)
**NFL draft (through 2026):** 192 picks, 15 first-round · last 10 drafts: 20 picks, 2 first-round
**Peak 10-yr stretch:** 1965–1974 — 76–28–5 (.720)
**Recent decade (2016–2025):** 69–53 (.566) · 0 national titles · 22 AP weeks
**Trend:** even — 2016–2025 rating 61.5/100 vs. all-time 54.4 (Δ +7.1)

#### 55 · South Carolina — SEC · The Field · 54.3 rating

**All-time (through 2025):** 616–598–42 (.507) as played · site rating **#55 of 136**
**The ten:** AP wks 197 (65) · top-10 39 (58) · cons.AA 5 (50) · unan.AA 2 (54) · natl 0 (35) · conf 1 (9) · draft 231 (72) · 1st-rnd 16 (67) · wins 616 (65) · win% .507 (41)
**National titles:** none
**Conference titles:** 1 (summary total — years not itemised)
**Heisman (1):** 1980 George Rogers
**All-Americans:** 5 consensus, 2 unanimous · latest: 1984 Del Wilkes (OG); 2011 Melvin Ingram (DL); 2012 Jadeveon Clowney (DL, unan.); 2024 Kyle Kennard (DL)
**AP poll (1936–2025):** 197 weeks ranked / 39 top-10 / 5 top-5 / 0 at #1 · first ranked 1953 · 0 AP-#1 finishes · 1 top-5 finishes · longest ranked streak 8 yrs (2007–2014) · best finish AP #4 (2013)
**NFL draft (through 2026):** 231 picks, 16 first-round · last 10 drafts: 32 picks, 4 first-round
**Peak 10-yr stretch:** 2004–2013 — 83–44 (.654)
**Recent decade (2016–2025):** 61–63 (.492) · 0 national titles · 14 AP weeks
**Trend:** even — 2016–2025 rating 50.9/100 vs. all-time 54.3 (Δ -3.4)

#### 56 · Navy — American · The Field · 53.8 rating

**All-time (through 2025):** 729–593–53 (.549) as played · site rating **#56 of 136**
**The ten:** AP wks 144 (55) · top-10 75 (67) · cons.AA 23 (77) · unan.AA 6 (74) · natl 0.5 (71) · conf 0 (3) · draft 22 (15) · 1st-rnd 0 (10) · wins 729 (81) · win% .549 (62)
**National titles:** 0.5 (from summary totals — years not itemised in staging)
**Conference titles:** none
**Heisman (2):** 1960 Joe Bellino · 1963 Roger Staubach
**All-Americans:** 23 consensus, 6 unanimous · latest: 1963 Roger Staubach (B, unan.); 1975 Chet Moeller (DB, unan.); 1983 Napoleon McCallum (RB); 1985 Napoleon McCallum (RB)
**AP poll (1936–2025):** 144 weeks ranked / 75 top-10 / 41 top-5 / 0 at #1 · first ranked 1936 · 0 AP-#1 finishes · 7 top-5 finishes · longest ranked streak 9 yrs (1952–1960) · best finish AP #2 (1963)
**NFL draft (through 2026):** 22 picks, 0 first-round · last 10 drafts: 4 picks, 0 first-round
**Peak 10-yr stretch:** 1954–1963 — 70–25–5 (.725)
**Recent decade (2016–2025):** 67–58 (.536) · 0 national titles · 16 AP weeks
**Trend:** down — 2016–2025 rating 34.3/100 vs. all-time 53.8 (Δ -19.5) · biggest moves: All-Americans ↓, AP Poll Success ↓, Wins ↓

#### 57 · Boise State — Pac-12 · The Field · 53.6 rating · former FCS

**All-time (through 2025):** 511–194–2 (.724) as played · site rating **#57 of 136**
**The ten:** AP wks 173 (58) · top-10 57 (63) · cons.AA 4 (45) · unan.AA 1 (44) · natl 0 (35) · conf 20 (85) · draft 77 (39) · 1st-rnd 6 (50) · wins 511 (44) · win% .724 (97)
**National titles:** none
**Conference titles:** 20 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 4 consensus, 1 unanimous · latest: 2007 Ryan Clady (OL); 2011 Nate Potter (OL); 2020 Avery Williams (KR/AP); 2024 Ashton Jeanty (WR, unan.)
**AP poll (1936–2025):** 173 weeks ranked / 57 top-10 / 29 top-5 / 0 at #1 · first ranked 2002 · 0 AP-#1 finishes · 2 top-5 finishes · longest ranked streak 19 yrs (2002–2020) · best finish AP #4 (2009)
**NFL draft (through 2026):** 77 picks, 6 first-round · last 10 drafts: 16 picks, 2 first-round
**Peak 10-yr stretch:** 2002–2011 — 118–13 (.901)
**Recent decade (2016–2025):** 94–35 (.729) · 0 national titles · 52 AP weeks
**Trend:** up — 2016–2025 rating 75.9/100 vs. all-time 53.6 (Δ +22.2) · biggest moves: Wins ↑, All-Americans ↑, NFL Draft Success ↑

#### 58 · Virginia — ACC · The Field · 53.6 rating

**All-time (through 2025):** 620–640–38 (.492) as played · site rating **#58 of 136**
**The ten:** AP wks 183 (61) · top-10 21 (52) · cons.AA 11 (60) · unan.AA 3 (61) · natl 0 (35) · conf 2 (16) · draft 167 (56) · 1st-rnd 16 (67) · wins 620 (66) · win% .492 (37)
**National titles:** none
**Conference titles:** 2 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 11 consensus, 3 unanimous · latest: 1999 Thomas Jones (RB); 2004 Heath Miller (TE, unan.); 2004 Elton Brown (OL); 2007 Chris Long (DL, unan.)
**AP poll (1936–2025):** 183 weeks ranked / 21 top-10 / 5 top-5 / 3 at #1 · first ranked 1945 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 8 yrs (1989–1996) · best finish AP #13 (1951)
**NFL draft (through 2026):** 167 picks, 16 first-round · last 10 drafts: 10 picks, 0 first-round
**Peak 10-yr stretch:** 1943–1952 — 63–24–5 (.712)
**Recent decade (2016–2025):** 58–64 (.475) · 0 national titles · 19 AP weeks
**Trend:** down — 2016–2025 rating 33.6/100 vs. all-time 53.6 (Δ -20.0) · biggest moves: NFL Draft Success ↓, All-Americans ↓, Wins ↓

#### 59 · Northwestern — Big Ten · The Field · 53.2 rating

**All-time (through 2025):** 568–709–40 (.446) as played · site rating **#59 of 136**
**The ten:** AP wks 184 (62) · top-10 74 (66) · cons.AA 15 (68) · unan.AA 1 (44) · natl 0 (35) · conf 8 (36) · draft 197 (65) · 1st-rnd 11 (58) · wins 568 (58) · win% .446 (19)
**National titles:** none
**Conference titles:** 8 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 15 consensus, 1 unanimous · latest: 1996 Pat Fitzgerald (LB); 2000 Damien Anderson (RB); 2020 Brandon Joseph (DB); 2022 Peter Skoronski (OL, unan.)
**AP poll (1936–2025):** 184 weeks ranked / 74 top-10 / 25 top-5 / 5 at #1 · first ranked 1936 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 4 yrs (1948–1951) · best finish AP #7 (1936)
**NFL draft (through 2026):** 197 picks, 11 first-round · last 10 drafts: 13 picks, 3 first-round
**Peak 10-yr stretch:** 2008–2017 — 77–51 (.602)
**Recent decade (2016–2025):** 59–64 (.480) · 0 national titles · 15 AP weeks
**Trend:** even — 2016–2025 rating 53.6/100 vs. all-time 53.2 (Δ +0.4)

#### 60 · Duke — ACC · The Field · 53.0 rating

**All-time (through 2025):** 537–558–29 (.491) as played · site rating **#60 of 136**
**The ten:** AP wks 181 (61) · top-10 57 (63) · cons.AA 6 (53) · unan.AA 2 (54) · natl 0 (35) · conf 17 (79) · draft 163 (55) · 1st-rnd 8 (54) · wins 537 (49) · win% .491 (36)
**National titles:** none
**Conference titles:** 17 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 6 consensus, 2 unanimous · latest: 1971 Ernie Jackson (DB); 1989 Clarkston Hines (WR, unan.); 2014 Laken Tomlinson (OL); 2015 Jeremy Cash (DB, unan.)
**AP poll (1936–2025):** 181 weeks ranked / 57 top-10 / 21 top-5 / 0 at #1 · first ranked 1936 · 0 AP-#1 finishes · 2 top-5 finishes · longest ranked streak 15 yrs (1943–1957) · best finish AP #2 (1941)
**NFL draft (through 2026):** 163 picks, 8 first-round · last 10 drafts: 11 picks, 2 first-round
**Peak 10-yr stretch:** 1936–1945 — 74–19–2 (.789)
**Recent decade (2016–2025):** 64–62 (.508) · 0 national titles · 9 AP weeks
**Trend:** down — 2016–2025 rating 44.6/100 vs. all-time 53.0 (Δ -8.4) · biggest moves: AP Poll Success ↓, All-Americans ↓, NFL Draft Success ↑

#### 61 · Indiana — Big Ten · The Field · 51.4 rating

**All-time (through 2025):** 509–696–38 (.425) as played · site rating **#61 of 136**
**The ten:** AP wks 95 (50) · top-10 39 (58) · cons.AA 9 (58) · unan.AA 3 (61) · natl 1 (76) · conf 2 (16) · draft 181 (61) · 1st-rnd 13 (63) · wins 509 (44) · win% .425 (14)
**National titles (1):** 2025
**Conference titles:** 2 (summary total — years not itemised)
**Heisman (1):** 2025 Fernando Mendoza
**All-Americans:** 9 consensus, 3 unanimous · latest: 1991 Vaughn Dunbar (RB, unan.); 2014 Tevin Coleman (RB, unan.); 2025 Fernando Mendoza (QB); 2025 Carter Smith (OL)
**AP poll (1936–2025):** 95 weeks ranked / 39 top-10 / 19 top-5 / 2 at #1 · first ranked 1937 · 1 AP-#1 finish (2025) · 3 top-5 finishes · longest ranked streak 3 yrs (1944–1946) · best finish AP #1 (2025)
**NFL draft (through 2026):** 181 picks, 13 first-round · last 10 drafts: 17 picks, 2 first-round
**Peak 10-yr stretch:** 1985–1994 — 63–50–3 (.556)
**Recent decade (2016–2025):** 66–57 (.537) · 1 national title · 40 AP weeks
**Trend:** even — 2016–2025 rating 54.8/100 vs. all-time 51.4 (Δ +3.4)

#### 62 · Kansas State — Big 12 · The Field · 51.2 rating

**All-time (through 2025):** 531–647–35 (.452) as played · site rating **#62 of 136**
**The ten:** AP wks 247 (72) · top-10 78 (69) · cons.AA 15 (68) · unan.AA 3 (61) · natl 0 (35) · conf 4 (25) · draft 161 (54) · 1st-rnd 6 (50) · wins 531 (48) · win% .452 (20)
**National titles:** none
**Conference titles:** 4 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 15 consensus, 3 unanimous · latest: 2014 Tyler Lockett (All-Purpose); 2021 Deuce Vaughn (KR/AP); 2022 Deuce Vaughn (KR/AP); 2023 Cooper Beebe (OL, unan.)
**AP poll (1936–2025):** 247 weeks ranked / 78 top-10 / 24 top-5 / 0 at #1 · first ranked 1969 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 12 yrs (1993–2004) · best finish AP #6 (1999)
**NFL draft (through 2026):** 161 picks, 6 first-round · last 10 drafts: 20 picks, 1 first-round
**Peak 10-yr stretch:** 1993–2002 — 98–25–1 (.794)
**Recent decade (2016–2025):** 76–50 (.603) · 0 national titles · 42 AP weeks
**Trend:** up — 2016–2025 rating 61.3/100 vs. all-time 51.2 (Δ +10.1) · biggest moves: Wins ↑, AP Poll Success ↓, All-Americans ↑

#### 63 · Vanderbilt — SEC · The Field · 50.1 rating

**All-time (through 2025):** 573–652–43 (.469) as played · site rating **#63 of 136**
**The ten:** AP wks 47 (42) · top-10 6 (45) · cons.AA 8 (56) · unan.AA 4 (67) · natl 0 (35) · conf 13 (61) · draft 130 (47) · 1st-rnd 9 (55) · wins 573 (59) · win% .469 (27)
**National titles:** none
**Conference titles:** 13 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 8 consensus, 4 unanimous · latest: 1982 Jim Arnold (P, unan.); 1984 Ricky Anderson (P, unan.); 2016 Zach Cunningham (LB, unan.); 2025 Eli Stowers (TE, unan.)
**AP poll (1936–2025):** 47 weeks ranked / 6 top-10 / 0 top-5 / 0 at #1 · first ranked 1937 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (1937–1938) · best finish AP #12 (1948)
**NFL draft (through 2026):** 130 picks, 9 first-round · last 10 drafts: 9 picks, 0 first-round
**Peak 10-yr stretch:** 1941–1950 — 48–31–1 (.606)
**Recent decade (2016–2025):** 46–75 (.380) · 0 national titles · 16 AP weeks
**Trend:** even — 2016–2025 rating 47.1/100 vs. all-time 50.1 (Δ -3.0)

#### 64 · Washington State — Pac-12 · The Field · 49.8 rating

**All-time (through 2025):** 516–563–38 (.479) as played · site rating **#64 of 136**
**The ten:** AP wks 166 (58) · top-10 31 (54) · cons.AA 8 (56) · unan.AA 2 (54) · natl 0 (35) · conf 4 (25) · draft 200 (66) · 1st-rnd 13 (63) · wins 516 (46) · win% .479 (33)
**National titles:** none
**Conference titles:** 4 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 8 consensus, 2 unanimous · latest: 2005 Jerome Harrison (RB); 2016 Cody O'Connell (OL, unan.); 2017 Hercules Mata'afa (DL); 2017 Cody O'Connell (OL)
**AP poll (1936–2025):** 166 weeks ranked / 31 top-10 / 3 top-5 / 0 at #1 · first ranked 1936 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 5 yrs (2015–2019) · best finish AP #7 (2002)
**NFL draft (through 2026):** 200 picks, 13 first-round · last 10 drafts: 13 picks, 1 first-round
**Peak 10-yr stretch:** 2015–2024 — 71–49 (.592)
**Recent decade (2016–2025):** 69–51 (.575) · 0 national titles · 41 AP weeks
**Trend:** up — 2016–2025 rating 63.1/100 vs. all-time 49.8 (Δ +13.3) · biggest moves: Wins ↑, All-Americans ↑, AP Poll Success ↑

#### 65 · Louisville — ACC · The Field · 48.9 rating

**All-time (through 2025):** 413–357–8 (.536) as played · site rating **#65 of 136**
**The ten:** AP wks 160 (57) · top-10 40 (60) · cons.AA 3 (40) · unan.AA 2 (54) · natl 0 (35) · conf 9 (41) · draft 141 (50) · 1st-rnd 16 (67) · wins 413 (34) · win% .536 (53)
**National titles:** none
**Conference titles:** 9 (summary total — years not itemised)
**Heisman (1):** 2016 Lamar Jackson
**All-Americans:** 3 consensus, 2 unanimous · latest: 2005 Elvis Dumervil (DL, unan.); 2014 Gerod Holliman (DB); 2016 Lamar Jackson (QB, unan.)
**AP poll (1936–2025):** 160 weeks ranked / 40 top-10 / 8 top-5 / 0 at #1 · first ranked 1972 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 4 yrs (2004–2007) · best finish AP #6 (2004)
**NFL draft (through 2026):** 141 picks, 16 first-round · last 10 drafts: 20 picks, 3 first-round
**Peak 10-yr stretch:** 1998–2007 — 88–36 (.710)
**Recent decade (2016–2025):** 73–55 (.570) · 0 national titles · 46 AP weeks
**Trend:** up — 2016–2025 rating 66.3/100 vs. all-time 48.9 (Δ +17.4) · biggest moves: Wins ↑, AP Poll Success ↑, All-Americans ↑

#### 66 · Mississippi State — SEC · The Field · 47.6 rating

**All-time (through 2025):** 611–599–37 (.505) as played · site rating **#66 of 136**
**The ten:** AP wks 209 (69) · top-10 20 (51) · cons.AA 3 (40) · unan.AA 0 (19) · natl 0 (35) · conf 1 (9) · draft 210 (68) · 1st-rnd 13 (63) · wins 611 (64) · win% .505 (40)
**National titles:** none
**Conference titles:** 1 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 3 consensus, 0 unanimous · latest: 1974 Jimmy Webb (DL); 2000 Fred Smoot (DB); 2022 Emmanuel Forbes (DB)
**AP poll (1936–2025):** 209 weeks ranked / 20 top-10 / 8 top-5 / 5 at #1 · first ranked 1940 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 5 yrs (1997–2001) · best finish AP #9 (1940)
**NFL draft (through 2026):** 210 picks, 13 first-round · last 10 drafts: 26 picks, 5 first-round
**Peak 10-yr stretch:** 2010–2019 — 79–51 (.608)
**Recent decade (2016–2025):** 61–65 (.484) · 0 national titles · 30 AP weeks
**Trend:** even — 2016–2025 rating 52.3/100 vs. all-time 47.6 (Δ +4.7)

#### 67 · San Diego State — Pac-12 · The Field · 47.4 rating

**All-time (through 2025):** 388–323–11 (.545) as played · site rating **#67 of 136**
**The ten:** AP wks 32 (36) · top-10 0 (18) · cons.AA 5 (50) · unan.AA 3 (61) · natl 0 (35) · conf 20 (85) · draft 158 (53) · 1st-rnd 10 (57) · wins 388 (31) · win% .545 (56)
**National titles:** none
**Conference titles:** 20 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 5 consensus, 3 unanimous · latest: 1993 Marshall Faulk (RB, unan.); 1997 Kyle Turley (OL); 2017 Rashaad Penny (RB); 2021 Matt Araiza (P, unan.)
**AP poll (1936–2025):** 32 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 1970 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (1974–1975) · best finish AP #16 (1977)
**NFL draft (through 2026):** 158 picks, 10 first-round · last 10 drafts: 13 picks, 2 first-round
**Peak 10-yr stretch:** 1960–1969 — 19–2 (.905)
**Recent decade (2016–2025):** 77–48 (.616) · 0 national titles · 18 AP weeks
**Trend:** up — 2016–2025 rating 63.1/100 vs. all-time 47.4 (Δ +15.7) · biggest moves: Wins ↑, All-Americans ↑, AP Poll Success ↑

#### 68 · Kansas — Big 12 · The Field · 47.2 rating

**All-time (through 2025):** 558–675–54 (.455) as played · site rating **#68 of 136**
**The ten:** AP wks 117 (53) · top-10 37 (56) · cons.AA 5 (50) · unan.AA 1 (44) · natl 0 (35) · conf 5 (29) · draft 174 (58) · 1st-rnd 9 (55) · wins 558 (55) · win% .455 (22)
**National titles:** none
**Conference titles:** 5 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 5 consensus, 1 unanimous · latest: 1964 Gale Sayers (B); 1968 John Zook (DE); 1973 David Jaynes (QB); 2007 Aqib Talib (DB, unan.)
**AP poll (1936–2025):** 117 weeks ranked / 37 top-10 / 9 top-5 / 0 at #1 · first ranked 1947 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 4 yrs (1973–1976) · best finish AP #7 (1968)
**NFL draft (through 2026):** 174 picks, 9 first-round · last 10 drafts: 9 picks, 0 first-round
**Peak 10-yr stretch:** 1943–1952 — 59–36–6 (.614)
**Recent decade (2016–2025):** 36–83 (.303) · 0 national titles · 9 AP weeks
**Trend:** down — 2016–2025 rating 27.6/100 vs. all-time 47.2 (Δ -19.6) · biggest moves: Wins ↓, NFL Draft Success ↓, AP Poll Success ↓

#### 69 · Oregon State — Pac-12 · The Field · 46.8 rating

**All-time (through 2025):** 499–608–36 (.452) as played · site rating **#69 of 136**
**The ten:** AP wks 113 (53) · top-10 25 (53) · cons.AA 8 (56) · unan.AA 2 (54) · natl 0 (35) · conf 5 (29) · draft 173 (57) · 1st-rnd 7 (53) · wins 499 (43) · win% .452 (21)
**National titles:** none
**Conference titles:** 5 (summary total — years not itemised)
**Heisman (1):** 1962 Terry Baker
**All-Americans:** 8 consensus, 2 unanimous · latest: 1968 John Didion (C, unan.); 2010 Stephen Paea (DL); 2012 Jordan Poyer (DB); 2013 Brandin Cooks (WR)
**AP poll (1936–2025):** 113 weeks ranked / 25 top-10 / 4 top-5 / 0 at #1 · first ranked 1939 · 0 AP-#1 finishes · 1 top-5 finishes · longest ranked streak 5 yrs (2006–2010) · best finish AP #4 (2000)
**NFL draft (through 2026):** 173 picks, 7 first-round · last 10 drafts: 13 picks, 1 first-round
**Peak 10-yr stretch:** 1960–1969 — 65–35–2 (.647)
**Recent decade (2016–2025):** 46–72 (.390) · 0 national titles · 21 AP weeks
**Trend:** even — 2016–2025 rating 39.6/100 vs. all-time 46.8 (Δ -7.2)

#### 70 · Tulsa — American · The Field · 46.8 rating

**All-time (through 2025):** 538–512–22 (.512) as played · site rating **#70 of 136**
**The ten:** AP wks 47 (42) · top-10 5 (44) · cons.AA 3 (40) · unan.AA 2 (54) · natl 0 (35) · conf 35 (96) · draft 175 (58) · 1st-rnd 4 (42) · wins 538 (50) · win% .512 (44)
**National titles:** none
**Conference titles:** 35 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 3 consensus, 2 unanimous · latest: 1965 Howard Twilley (E, unan.); 1991 Jerry Ostroski (OL); 2020 Zaven Collins (LB, unan.)
**AP poll (1936–2025):** 47 weeks ranked / 5 top-10 / 1 top-5 / 0 at #1 · first ranked 1937 · 0 AP-#1 finishes · 1 top-5 finishes · longest ranked streak 5 yrs (1942–1946) · best finish AP #4 (1942)
**NFL draft (through 2026):** 175 picks, 4 first-round · last 10 drafts: 5 picks, 2 first-round
**Peak 10-yr stretch:** 1937–1946 — 70–25–5 (.725)
**Recent decade (2016–2025):** 48–71 (.403) · 0 national titles · 5 AP weeks
**Trend:** even — 2016–2025 rating 45.1/100 vs. all-time 46.8 (Δ -1.7)

#### 71 · Cincinnati — Big 12 · The Field · 45.9 rating

**All-time (through 2025):** 436–450–15 (.492) as played · site rating **#71 of 136**
**The ten:** AP wks 99 (51) · top-10 39 (58) · cons.AA 5 (50) · unan.AA 1 (44) · natl 0 (35) · conf 16 (75) · draft 142 (50) · 1st-rnd 3 (39) · wins 436 (38) · win% .492 (36)
**National titles:** none
**Conference titles:** 16 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 5 consensus, 1 unanimous · latest: 2007 Kevin Huber (P); 2008 Kevin Huber (P); 2021 Ahmad Gardner (DB); 2022 Ivan Pace Jr. (LB, unan.)
**AP poll (1936–2025):** 99 weeks ranked / 39 top-10 / 19 top-5 / 0 at #1 · first ranked 1951 · 0 AP-#1 finishes · 1 top-5 finishes · longest ranked streak 5 yrs (2018–2022) · best finish AP #4 (2021)
**NFL draft (through 2026):** 142 picks, 3 first-round · last 10 drafts: 26 picks, 1 first-round
**Peak 10-yr stretch:** 2006–2015 — 90–40 (.692)
**Recent decade (2016–2025):** 76–49 (.608) · 0 national titles · 60 AP weeks
**Trend:** up (emphatic) — 2016–2025 rating 72.2/100 vs. all-time 45.9 (Δ +26.4) · biggest moves: Wins ↑, AP Poll Success ↑, All-Americans ↑

#### 72 · Tulane — American · The Field · 45.8 rating

**All-time (through 2025):** 560–660–35 (.460) as played · site rating **#72 of 136**
**The ten:** AP wks 86 (49) · top-10 19 (50) · cons.AA 5 (50) · unan.AA 1 (44) · natl 0 (35) · conf 10 (45) · draft 153 (52) · 1st-rnd 4 (42) · wins 560 (56) · win% .460 (24)
**National titles:** none
**Conference titles:** 10 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 5 consensus, 1 unanimous · latest: 1932 Don Zimmerman (B); 1939 Harley McCollum (T); 1941 Ernie Blandin (T); 2012 Cairo Santos (PK)
**AP poll (1936–2025):** 86 weeks ranked / 19 top-10 / 7 top-5 / 0 at #1 · first ranked 1936 · 0 AP-#1 finishes · 1 top-5 finishes · longest ranked streak 4 yrs (1936–1939) · best finish AP #5 (1939)
**NFL draft (through 2026):** 153 picks, 4 first-round · last 10 drafts: 14 picks, 0 first-round
**Peak 10-yr stretch:** 1936–1945 — 49–36–5 (.572)
**Recent decade (2016–2025):** 74–56 (.569) · 0 national titles · 27 AP weeks
**Trend:** even — 2016–2025 rating 48.8/100 vs. all-time 45.8 (Δ +2.9)

#### 73 · Fresno State — Pac-12 · The Field · 45.3 rating

**All-time (through 2025):** 431–337–6 (.561) as played · site rating **#73 of 136**
**The ten:** AP wks 63 (46) · top-10 3 (42) · cons.AA 1 (27) · unan.AA 1 (44) · natl 0 (35) · conf 29 (94) · draft 109 (44) · 1st-rnd 5 (46) · wins 431 (36) · win% .561 (68)
**National titles:** none
**Conference titles:** 29 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 1 unanimous · latest: 2012 Phillip Thomas (DB, unan.)
**AP poll (1936–2025):** 63 weeks ranked / 3 top-10 / 0 top-5 / 0 at #1 · first ranked 1942 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 5 yrs (1989–1993) · best finish AP #18 (2018)
**NFL draft (through 2026):** 109 picks, 5 first-round · last 10 drafts: 5 picks, 0 first-round
**Peak 10-yr stretch:** 1982–1991 — 88–26–2 (.767)
**Recent decade (2016–2025):** 74–50 (.597) · 0 national titles · 12 AP weeks
**Trend:** even — 2016–2025 rating 43.2/100 vs. all-time 45.3 (Δ -2.0)

#### 74 · Colorado State — Pac-12 · The Field · 44.2 rating

**All-time (through 2025):** 543–617–32 (.469) as played · site rating **#74 of 136**
**The ten:** AP wks 43 (40) · top-10 5 (44) · cons.AA 5 (50) · unan.AA 1 (44) · natl 0 (35) · conf 15 (71) · draft 108 (43) · 1st-rnd 5 (46) · wins 543 (51) · win% .469 (28)
**National titles:** none
**Conference titles:** 15 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 5 consensus, 1 unanimous · latest: 1995 Greg Myers (DB); 2014 Rashard Higgins (WR); 2017 Michael Gallup (WR); 2021 Trey McBride (TE, unan.)
**AP poll (1936–2025):** 43 weeks ranked / 5 top-10 / 0 top-5 / 0 at #1 · first ranked 1994 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 7 yrs (1997–2003) · best finish AP #14 (2000)
**NFL draft (through 2026):** 108 picks, 5 first-round · last 10 drafts: 5 picks, 0 first-round
**Peak 10-yr stretch:** 1994–2003 — 86–38 (.694)
**Recent decade (2016–2025):** 43–72 (.374) · 0 national titles · 0 AP weeks
**Trend:** even — 2016–2025 rating 38.4/100 vs. all-time 44.2 (Δ -5.8)

#### 75 · Wyoming — Mountain West · The Field · 42.4 rating

**All-time (through 2025):** 547–606–27 (.475) as played · site rating **#75 of 136**
**The ten:** AP wks 56 (45) · top-10 11 (47) · cons.AA 4 (45) · unan.AA 0 (19) · natl 0 (35) · conf 14 (66) · draft 87 (42) · 1st-rnd 4 (42) · wins 547 (52) · win% .475 (31)
**National titles:** none
**Conference titles:** 14 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 4 consensus, 0 unanimous · latest: 1983 Jack Weil (P); 1984 Jay Novacek (TE); 1996 Marcus Harris (WR); 1997 Brian Lee (DB)
**AP poll (1936–2025):** 56 weeks ranked / 11 top-10 / 0 top-5 / 0 at #1 · first ranked 1950 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 4 yrs (1966–1969) · best finish AP #6 (1967)
**NFL draft (through 2026):** 87 picks, 4 first-round · last 10 drafts: 7 picks, 1 first-round
**Peak 10-yr stretch:** 1958–1967 — 74–24–4 (.745)
**Recent decade (2016–2025):** 62–59 (.512) · 0 national titles · 0 AP weeks
**Trend:** even — 2016–2025 rating 39.8/100 vs. all-time 42.4 (Δ -2.6)

#### 76 · Iowa State — Big 12 · The Field · 41.5 rating

**All-time (through 2025):** 566–679–45 (.456) as played · site rating **#76 of 136**
**The ten:** AP wks 90 (50) · top-10 8 (46) · cons.AA 6 (53) · unan.AA 1 (44) · natl 0 (35) · conf 2 (16) · draft 134 (49) · 1st-rnd 2 (31) · wins 566 (58) · win% .456 (23)
**National titles:** none
**Conference titles:** 2 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 6 consensus, 1 unanimous · latest: 1995 Troy Davis (RB); 1996 Troy Davis (RB); 2020 Breece Hall (RB, unan.); 2021 Breece Hall (RB)
**AP poll (1936–2025):** 90 weeks ranked / 8 top-10 / 0 top-5 / 0 at #1 · first ranked 1938 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 5 yrs (2017–2021) · best finish AP #9 (2020)
**NFL draft (through 2026):** 134 picks, 2 first-round · last 10 drafts: 16 picks, 1 first-round
**Peak 10-yr stretch:** 2016–2025 — 72–55 (.567)
**Recent decade (2016–2025):** 72–55 (.567) · 0 national titles · 50 AP weeks
**Trend:** up — 2016–2025 rating 63.3/100 vs. all-time 41.5 (Δ +21.9) · biggest moves: Wins ↑, AP Poll Success ↑, All-Americans ↑

#### 77 · Rice — American · The Field · 41.1 rating

**All-time (through 2025):** 494–668–32 (.427) as played · site rating **#77 of 136**
**The ten:** AP wks 70 (47) · top-10 17 (49) · cons.AA 6 (53) · unan.AA 0 (19) · natl 0 (35) · conf 8 (36) · draft 132 (48) · 1st-rnd 7 (53) · wins 494 (42) · win% .427 (17)
**National titles:** none
**Conference titles:** 8 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 6 consensus, 0 unanimous · latest: 1954 Dicky Maegle (B); 1958 Buddy Dial (E); 1976 Tommy Kramer (QB); 1991 Trevor Cobb (RB)
**AP poll (1936–2025):** 70 weeks ranked / 17 top-10 / 3 top-5 / 0 at #1 · first ranked 1937 · 0 AP-#1 finishes · 1 top-5 finishes · longest ranked streak 7 yrs (1949–1955) · best finish AP #5 (1949)
**NFL draft (through 2026):** 132 picks, 7 first-round · last 10 drafts: 1 picks, 0 first-round
**Peak 10-yr stretch:** 1945–1954 — 67–35–2 (.654)
**Recent decade (2016–2025):** 35–82 (.299) · 0 national titles · 0 AP weeks
**Trend:** down — 2016–2025 rating 21.0/100 vs. all-time 41.1 (Δ -20.1) · biggest moves: NFL Draft Success ↓, Wins ↓, AP Poll Success ↓

#### 78 · Utah State — Pac-12 · The Field · 40.7 rating

**All-time (through 2025):** 551–564–28 (.494) as played · site rating **#78 of 136**
**The ten:** AP wks 13 (29) · top-10 1 (38) · cons.AA 3 (40) · unan.AA 0 (19) · natl 0 (35) · conf 13 (61) · draft 120 (46) · 1st-rnd 5 (46) · wins 551 (53) · win% .494 (39)
**National titles:** none
**Conference titles:** 13 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 3 consensus, 0 unanimous · latest: 1961 Merlin Olsen (T); 1969 Phil Olsen (DE); 2018 Savon Scarver (KR/AP)
**AP poll (1936–2025):** 13 weeks ranked / 1 top-10 / 0 top-5 / 0 at #1 · first ranked 1960 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (1960–1961) · best finish AP #10 (1961)
**NFL draft (through 2026):** 120 picks, 5 first-round · last 10 drafts: 4 picks, 1 first-round
**Peak 10-yr stretch:** 1959–1968 — 70–30–3 (.694)
**Recent decade (2016–2025):** 61–61 (.500) · 0 national titles · 6 AP weeks
**Trend:** even — 2016–2025 rating 44.3/100 vs. all-time 40.7 (Δ +3.5)

#### 79 · Wake Forest — ACC · The Field · 40.4 rating

**All-time (through 2025):** 495–693–31 (.419) as played · site rating **#79 of 136**
**The ten:** AP wks 68 (47) · top-10 2 (41) · cons.AA 4 (45) · unan.AA 2 (54) · natl 0 (35) · conf 2 (16) · draft 152 (51) · 1st-rnd 5 (46) · wins 495 (42) · win% .419 (12)
**National titles:** none
**Conference titles:** 2 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 4 consensus, 2 unanimous · latest: 1976 Bill Armstrong (DB, unan.); 2005 Ryan Plackemeier (P, unan.); 2007 Steve Justice (OL); 2008 Alphonso Smith (DB)
**AP poll (1936–2025):** 68 weeks ranked / 2 top-10 / 0 top-5 / 0 at #1 · first ranked 1944 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 7 yrs (1944–1950) · best finish AP #15 (2021)
**NFL draft (through 2026):** 152 picks, 5 first-round · last 10 drafts: 16 picks, 0 first-round
**Peak 10-yr stretch:** 1939–1948 — 60–33–3 (.641)
**Recent decade (2016–2025):** 70–55 (.560) · 0 national titles · 27 AP weeks
**Trend:** even — 2016–2025 rating 45.0/100 vs. all-time 40.4 (Δ +4.6)

#### 80 · Miami (OH) — MAC · The Field · 39.2 rating

**All-time (through 2025):** 427–344–18 (.553) as played · site rating **#80 of 136**
**The ten:** AP wks 41 (39) · top-10 2 (41) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 23 (89) · draft 84 (41) · 1st-rnd 2 (31) · wins 427 (35) · win% .553 (64)
**National titles:** none
**Conference titles:** 23 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 2023 Graham Nicholson (PK)
**AP poll (1936–2025):** 41 weeks ranked / 2 top-10 / 0 top-5 / 0 at #1 · first ranked 1955 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 4 yrs (1973–1976) · best finish AP #10 (1974)
**NFL draft (through 2026):** 84 picks, 2 first-round · last 10 drafts: 4 picks, 0 first-round
**Peak 10-yr stretch:** 1966–1975 — 82–21–1 (.793)
**Recent decade (2016–2025):** 67–55 (.549) · 0 national titles · 0 AP weeks
**Trend:** even — 2016–2025 rating 39.1/100 vs. all-time 39.2 (Δ -0.1)

#### 81 · Air Force — Mountain West · The Field · 38.2 rating

**All-time (through 2025):** 436–356–12 (.550) as played · site rating **#81 of 136**
**The ten:** AP wks 84 (48) · top-10 20 (51) · cons.AA 5 (50) · unan.AA 2 (54) · natl 0 (35) · conf 3 (21) · draft 10 (7) · 1st-rnd 0 (10) · wins 436 (38) · win% .550 (63)
**National titles:** none
**Conference titles:** 3 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 5 consensus, 2 unanimous · latest: 1970 Ernie Jennings (E); 1985 Scott Thomas (DB); 1987 Chad Hennings (DL, unan.); 1992 Carlton McDonald (DB, unan.)
**AP poll (1936–2025):** 84 weeks ranked / 20 top-10 / 2 top-5 / 0 at #1 · first ranked 1958 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 4 yrs (1969–1972) · best finish AP #6 (1958)
**NFL draft (through 2026):** 10 picks, 0 first-round · last 10 drafts: 3 picks, 0 first-round
**Peak 10-yr stretch:** 1982–1991 — 83–40–1 (.673)
**Recent decade (2016–2025):** 72–47 (.605) · 0 national titles · 6 AP weeks
**Trend:** even — 2016–2025 rating 34.6/100 vs. all-time 38.2 (Δ -3.6)

#### 82 · Rutgers — Big Ten · The Field · 38.2 rating

**All-time (through 2025):** 522–596–25 (.468) as played · site rating **#82 of 136**
**The ten:** AP wks 37 (39) · top-10 2 (41) · cons.AA 4 (45) · unan.AA 1 (44) · natl 0 (35) · conf 1 (9) · draft 70 (37) · 1st-rnd 3 (39) · wins 522 (47) · win% .468 (26)
**National titles:** none
**Conference titles:** 1 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 4 consensus, 1 unanimous · latest: 1917 Paul Robeson (E); 1918 Paul Robeson (E); 1961 Alex Kroll (C); 1995 Marco Battaglia (TE, unan.)
**AP poll (1936–2025):** 37 weeks ranked / 2 top-10 / 0 top-5 / 0 at #1 · first ranked 1958 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (2006–2007) · best finish AP #12 (2006)
**NFL draft (through 2026):** 70 picks, 3 first-round · last 10 drafts: 12 picks, 0 first-round
**Peak 10-yr stretch:** 1972–1981 — 77–33–1 (.698)
**Recent decade (2016–2025):** 40–80 (.333) · 0 national titles · 0 AP weeks
**Trend:** down — 2016–2025 rating 23.1/100 vs. all-time 38.2 (Δ -15.2) · biggest moves: Wins ↓, AP Poll Success ↓, All-Americans ↓

#### 83 · Toledo — MAC · The Field · 37.6 rating

**All-time (through 2025):** 439–303–8 (.591) as played · site rating **#83 of 136**
**The ten:** AP wks 45 (41) · top-10 0 (18) · cons.AA 2 (36) · unan.AA 0 (19) · natl 0 (35) · conf 14 (66) · draft 65 (34) · 1st-rnd 2 (31) · wins 439 (39) · win% .591 (78)
**National titles:** none
**Conference titles:** 14 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 2 consensus, 0 unanimous · latest: 1971 Mel Long (DT); 2010 Eric Page (KR/AP)
**AP poll (1936–2025):** 45 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 1969 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 3 yrs (1969–1971) · best finish AP #12 (1970)
**NFL draft (through 2026):** 65 picks, 2 first-round · last 10 drafts: 13 picks, 1 first-round
**Peak 10-yr stretch:** 1949–1958 — 3–1 (.750)
**Recent decade (2016–2025):** 80–45 (.640) · 0 national titles · 2 AP weeks
**Trend:** up — 2016–2025 rating 48.9/100 vs. all-time 37.6 (Δ +11.3) · biggest moves: Wins ↑, NFL Draft Success ↑, All-Americans ↓

#### 84 · Southern Miss — Sun Belt · The Field · 36.8 rating

**All-time (through 2025):** 413–373–7 (.525) as played · site rating **#84 of 136**
**The ten:** AP wks 56 (45) · top-10 1 (38) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 8 (36) · draft 120 (46) · 1st-rnd 4 (42) · wins 413 (34) · win% .525 (51)
**National titles:** none
**Conference titles:** 8 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**AP poll (1936–2025):** 56 weeks ranked / 1 top-10 / 0 top-5 / 0 at #1 · first ranked 1953 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 5 yrs (1996–2000) · best finish AP #14 (1999)
**NFL draft (through 2026):** 120 picks, 4 first-round · last 10 drafts: 5 picks, 0 first-round
**Peak 10-yr stretch:** 1958–1967 — 41–22–1 (.648)
**Recent decade (2016–2025):** 52–70 (.426) · 0 national titles · 0 AP weeks
**Trend:** down — 2016–2025 rating 28.5/100 vs. all-time 36.8 (Δ -8.3) · biggest moves: AP Poll Success ↓, Wins ↓, NFL Draft Success ↓

#### 85 · Memphis — American · The Field · 36.6 rating

**All-time (through 2025):** 379–398–9 (.488) as played · site rating **#85 of 136**
**The ten:** AP wks 34 (37) · top-10 0 (18) · cons.AA 4 (45) · unan.AA 0 (19) · natl 0 (35) · conf 10 (45) · draft 122 (47) · 1st-rnd 6 (50) · wins 379 (31) · win% .488 (35)
**National titles:** none
**Conference titles:** 10 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 4 consensus, 0 unanimous · latest: 1992 Joe Allison (PK); 2013 Tom Hornsey (P); 2017 Anthony Miller (WR); 2018 Darrell Henderson (RB)
**AP poll (1936–2025):** 34 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2004 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (2014–2015) · best finish AP #17 (2019)
**NFL draft (through 2026):** 122 picks, 6 first-round · last 10 drafts: 13 picks, 0 first-round
**Peak 10-yr stretch:** 1960–1969 — 70–25–1 (.734)
**Recent decade (2016–2025):** 88–41 (.682) · 0 national titles · 28 AP weeks
**Trend:** up — 2016–2025 rating 57.8/100 vs. all-time 36.6 (Δ +21.2) · biggest moves: Wins ↑, AP Poll Success ↑, All-Americans ↑

#### 86 · East Carolina — American · The Field · 36.6 rating

**All-time (through 2025):** 367–348–3 (.513) as played · site rating **#86 of 136**
**The ten:** AP wks 34 (37) · top-10 1 (38) · cons.AA 3 (40) · unan.AA 1 (44) · natl 0 (35) · conf 7 (33) · draft 65 (34) · 1st-rnd 2 (31) · wins 367 (29) · win% .513 (44)
**National titles:** none
**Conference titles:** 7 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 3 consensus, 1 unanimous · latest: 1983 Terry Long (OL); 1991 Robert Jones (LB, unan.); 1999 Andrew Bayes (P)
**AP poll (1936–2025):** 34 weeks ranked / 1 top-10 / 0 top-5 / 0 at #1 · first ranked 1976 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (1976–1976) · best finish AP #9 (1991)
**NFL draft (through 2026):** 65 picks, 2 first-round · last 10 drafts: 4 picks, 0 first-round
**Peak 10-yr stretch:** 1958–1967 — 27–12–1 (.688)
**Recent decade (2016–2025):** 50–70 (.417) · 0 national titles · 0 AP weeks
**Trend:** down — 2016–2025 rating 24.8/100 vs. all-time 36.6 (Δ -11.8) · biggest moves: Wins ↓, AP Poll Success ↓, All-Americans ↓

#### 87 · Appalachian State — Sun Belt · The Field · 36.2 rating · former FCS

**All-time (through 2025):** 674–368–29 (.643) as played · site rating **#87 of 136**
**The ten:** AP wks 10 (28) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 22 (87) · draft 32 (19) · 1st-rnd 0 (10) · wins 674 (74) · win% .643 (88)
**National titles:** none
**Conference titles:** 22 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**AP poll (1936–2025):** 10 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2018 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 3 yrs (2018–2020) · best finish AP #19 (2019)
**NFL draft (through 2026):** 32 picks, 0 first-round · last 10 drafts: 7 picks, 0 first-round
**Peak 10-yr stretch:** 2001–2010 — 78–24 (.765)
**Recent decade (2016–2025):** 87–42 (.674) · 0 national titles · 10 AP weeks
**Trend:** up — 2016–2025 rating 49.1/100 vs. all-time 36.2 (Δ +12.9) · biggest moves: NFL Draft Success ↑, AP Poll Success ↑, Wins ↑

#### 88 · Delaware — C-USA · The Field · 35.4 rating · former FCS

**All-time (through 2025):** 734–443–43 (.619) as played · site rating **#88 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 20 (85) · draft 21 (14) · 1st-rnd 1 (22) · wins 734 (81) · win% .619 (83)
**National titles:** none
**Conference titles:** 20 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 21 picks, 0 first-round · last 10 drafts: 0 picks, 0 first-round
**Peak 10-yr stretch:** 2003–2012 — 71–43 (.623)
**Recent decade (2016–2025):** 68–47 (.591) · 0 national titles
**Trend:** n/a — only 23 seasons on record (needs 30+ to chart)

#### 89 · Louisiana Tech — Sun Belt · The Field · 35.1 rating

**All-time (through 2025):** 300–322–11 (.483) as played · site rating **#89 of 136**
**The ten:** AP wks 6 (22) · top-10 0 (18) · cons.AA 3 (40) · unan.AA 1 (44) · natl 0 (35) · conf 25 (90) · draft 69 (36) · 1st-rnd 5 (46) · wins 300 (22) · win% .483 (34)
**National titles:** none
**Conference titles:** 25 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 3 consensus, 1 unanimous · latest: 1992 Willie Roaf (OL); 1998 Troy Edwards (WR); 2012 Ryan Allen (P, unan.)
**AP poll (1936–2025):** 6 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 1999 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (1999–1999)
**NFL draft (through 2026):** 69 picks, 5 first-round · last 10 drafts: 8 picks, 0 first-round
**Peak 10-yr stretch:** 1954–1963 — 1–0 (1.000)
**Recent decade (2016–2025):** 61–64 (.488) · 0 national titles · 0 AP weeks
**Trend:** even — 2016–2025 rating 39.4/100 vs. all-time 35.1 (Δ +4.4)

#### 90 · San Jose State — Mountain West · The Field · 35.0 rating

**All-time (through 2025):** 396–475–15 (.455) as played · site rating **#90 of 136**
**The ten:** AP wks 7 (24) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 1 (44) · natl 0 (35) · conf 17 (79) · draft 111 (44) · 1st-rnd 6 (50) · wins 396 (33) · win% .455 (22)
**National titles:** none
**Conference titles:** 17 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 1 unanimous · latest: 2024 Nick Nash (WR, unan.)
**AP poll (1936–2025):** 7 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 1939 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (1939–1939) · best finish AP #21 (2012)
**NFL draft (through 2026):** 111 picks, 6 first-round · last 10 drafts: 3 picks, 0 first-round
**Peak 10-yr stretch:** 1973–1982 — 70–39–4 (.637)
**Recent decade (2016–2025):** 48–71 (.403) · 0 national titles · 2 AP weeks
**Trend:** even — 2016–2025 rating 38.9/100 vs. all-time 35.0 (Δ +3.9)

#### 91 · UCF — Big 12 · The Field · 35.0 rating

**All-time (through 2025):** 212–173 (.551) as played · site rating **#91 of 136**
**The ten:** AP wks 54 (44) · top-10 10 (47) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 6 (32) · draft 52 (31) · 1st-rnd 5 (46) · wins 212 (17) · win% .551 (64)
**National titles:** none
**Conference titles:** 6 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 2007 Kevin Smith (RB)
**AP poll (1936–2025):** 54 weeks ranked / 10 top-10 / 0 top-5 / 0 at #1 · first ranked 2010 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 4 yrs (2017–2020) · best finish AP #6 (2017)
**NFL draft (through 2026):** 52 picks, 5 first-round · last 10 drafts: 18 picks, 2 first-round
**Peak 10-yr stretch:** 2012–2021 — 87–40 (.685)
**Recent decade (2016–2025):** 80–46 (.635) · 0 national titles · 43 AP weeks
**Trend:** up — 2016–2025 rating 58.1/100 vs. all-time 35.0 (Δ +23.1) · biggest moves: Wins ↑, AP Poll Success ↑, NFL Draft Success ↑

#### 92 · Marshall — Sun Belt · The Field · 34.3 rating · former FCS

**All-time (through 2025):** 286–333–3 (.462) as played · site rating **#92 of 136**
**The ten:** AP wks 36 (38) · top-10 1 (38) · cons.AA 1 (27) · unan.AA 1 (44) · natl 0 (35) · conf 13 (61) · draft 47 (29) · 1st-rnd 3 (39) · wins 286 (22) · win% .462 (25)
**National titles:** none
**Conference titles:** 13 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 1 unanimous · latest: 1997 Randy Moss (WR, unan.)
**AP poll (1936–2025):** 36 weeks ranked / 1 top-10 / 0 top-5 / 0 at #1 · first ranked 1999 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (2001–2002) · best finish AP #10 (1999)
**NFL draft (through 2026):** 47 picks, 3 first-round · last 10 drafts: 7 picks, 0 first-round
**Peak 10-yr stretch:** 1990–1999 — 35–8 (.814)
**Recent decade (2016–2025):** 72–53 (.576) · 0 national titles · 8 AP weeks
**Trend:** even — 2016–2025 rating 42.0/100 vs. all-time 34.3 (Δ +7.7)

#### 93 · Northern Illinois — Mountain West · The Field · 32.9 rating

**All-time (through 2025):** 324–352–4 (.479) as played · site rating **#93 of 136**
**The ten:** AP wks 25 (34) · top-10 0 (18) · cons.AA 2 (36) · unan.AA 1 (44) · natl 0 (35) · conf 14 (66) · draft 41 (24) · 1st-rnd 2 (31) · wins 324 (25) · win% .479 (33)
**National titles:** none
**Conference titles:** 14 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 2 consensus, 1 unanimous · latest: 1993 LeShon Johnson (RB, unan.); 2017 Sutton Smith (DL)
**AP poll (1936–2025):** 25 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2003 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (2012–2013) · best finish AP #22 (2012)
**NFL draft (through 2026):** 41 picks, 2 first-round · last 10 drafts: 3 picks, 0 first-round
**Peak 10-yr stretch:** 2009–2018 — 93–43 (.684)
**Recent decade (2016–2025):** 56–65 (.463) · 0 national titles · 2 AP weeks
**Trend:** even — 2016–2025 rating 35.5/100 vs. all-time 32.9 (Δ +2.6)

#### 94 · Bowling Green — MAC · The Field · 32.2 rating

**All-time (through 2025):** 392–329–11 (.543) as played · site rating **#94 of 136**
**The ten:** AP wks 16 (31) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 17 (79) · draft 69 (36) · 1st-rnd 1 (22) · wins 392 (32) · win% .543 (56)
**National titles:** none
**Conference titles:** 17 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 2024 Harold Fannin Jr. (TE)
**AP poll (1936–2025):** 16 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 1973 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 3 yrs (2002–2004) · best finish AP #23 (2003)
**NFL draft (through 2026):** 69 picks, 1 first-round · last 10 drafts: 3 picks, 0 first-round
**Peak 10-yr stretch:** 1948–1957 — 3–0 (1.000)
**Recent decade (2016–2025):** 40–76 (.345) · 0 national titles · 0 AP weeks
**Trend:** even — 2016–2025 rating 28.4/100 vs. all-time 32.2 (Δ -3.9)

#### 95 · Temple — American · The Field · 31.1 rating

**All-time (through 2025):** 355–481–27 (.427) as played · site rating **#95 of 136**
**The ten:** AP wks 16 (31) · top-10 0 (18) · cons.AA 3 (40) · unan.AA 1 (44) · natl 0 (35) · conf 2 (16) · draft 77 (39) · 1st-rnd 4 (42) · wins 355 (28) · win% .427 (16)
**National titles:** none
**Conference titles:** 2 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 3 consensus, 1 unanimous · latest: 1985 John Rienstra (OL); 1986 Paul Palmer (RB, unan.); 2015 Tyler Matakevich (LB)
**AP poll (1936–2025):** 16 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 1936 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (2015–2016) · best finish AP #17 (1979)
**NFL draft (through 2026):** 77 picks, 4 first-round · last 10 drafts: 13 picks, 1 first-round
**Peak 10-yr stretch:** 1970–1979 — 63–31–3 (.665)
**Recent decade (2016–2025):** 51–69 (.425) · 0 national titles · 1 AP weeks
**Trend:** even — 2016–2025 rating 32.7/100 vs. all-time 31.1 (Δ +1.6)

#### 96 · South Florida — American · The Field · 29.4 rating

**All-time (through 2025):** 164–152 (.519) as played · site rating **#96 of 136**
**The ten:** AP wks 51 (43) · top-10 4 (43) · cons.AA 2 (36) · unan.AA 0 (19) · natl 0 (35) · conf 0 (3) · draft 30 (18) · 1st-rnd 2 (31) · wins 164 (10) · win% .519 (48)
**National titles:** none
**Conference titles:** none
**Heisman:** none
**All-Americans:** 2 consensus, 0 unanimous · latest: 2007 George Selvie (DL); 2021 Brian Battie (KR/AP)
**AP poll (1936–2025):** 51 weeks ranked / 4 top-10 / 2 top-5 / 0 at #1 · first ranked 2007 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 3 yrs (2007–2009) · best finish AP #19 (2016)
**NFL draft (through 2026):** 30 picks, 2 first-round · last 10 drafts: 5 picks, 0 first-round
**Peak 10-yr stretch:** 2000–2009 — 75–44 (.630)
**Recent decade (2016–2025):** 59–63 (.484) · 0 national titles · 26 AP weeks
**Trend:** n/a — only 29 seasons on record (needs 30+ to chart)

#### 97 · Western Michigan — MAC · The Field · 28.8 rating

**All-time (through 2025):** 374–360–7 (.509) as played · site rating **#97 of 136**
**The ten:** AP wks 10 (28) · top-10 0 (18) · cons.AA 2 (36) · unan.AA 0 (19) · natl 0 (35) · conf 3 (21) · draft 54 (31) · 1st-rnd 2 (31) · wins 374 (30) · win% .509 (42)
**National titles:** none
**Conference titles:** 3 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 2 consensus, 0 unanimous · latest: 2016 Corey Davis (WR); 2024 Addison West (OL)
**AP poll (1936–2025):** 10 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2016 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (2016–2016) · best finish AP #15 (2016)
**NFL draft (through 2026):** 54 picks, 2 first-round · last 10 drafts: 11 picks, 1 first-round
**Peak 10-yr stretch:** 1991–2000 — 67–43–2 (.607)
**Recent decade (2016–2025):** 70–52 (.574) · 0 national titles · 10 AP weeks
**Trend:** up — 2016–2025 rating 47.9/100 vs. all-time 28.8 (Δ +19.2) · biggest moves: All-Americans ↑, Wins ↑, NFL Draft Success ↑

#### 98 · Nevada — Mountain West · The Field · 28.6 rating

**All-time (through 2025):** 262–289–7 (.476) as played · site rating **#98 of 136**
**The ten:** AP wks 16 (31) · top-10 1 (38) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 14 (66) · draft 56 (32) · 1st-rnd 1 (22) · wins 262 (19) · win% .476 (32)
**National titles:** none
**Conference titles:** 14 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**AP poll (1936–2025):** 16 weeks ranked / 1 top-10 / 0 top-5 / 0 at #1 · first ranked 1948 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (1948–1948) · best finish AP #11 (2010)
**NFL draft (through 2026):** 56 picks, 1 first-round · last 10 drafts: 4 picks, 0 first-round
**Peak 10-yr stretch:** 1987–1996 — 44–18 (.710)
**Recent decade (2016–2025):** 48–73 (.397) · 0 national titles · 0 AP weeks
**Trend:** even — 2016–2025 rating 26.5/100 vs. all-time 28.6 (Δ -2.2)

#### 99 · North Texas — American · The Field · 28.2 rating

**All-time (through 2025):** 323–447–12 (.421) as played · site rating **#99 of 136**
**The ten:** AP wks 7 (24) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 25 (90) · draft 81 (40) · 1st-rnd 3 (39) · wins 323 (24) · win% .421 (14)
**National titles:** none
**Conference titles:** 25 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 1968 Joe Greene (DT)
**AP poll (1936–2025):** 7 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 1959 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (1959–1959) · best finish AP #24 (2025)
**NFL draft (through 2026):** 81 picks, 3 first-round · last 10 drafts: 1 picks, 0 first-round
**Peak 10-yr stretch:** 1950–1959 — 46–33–4 (.578)
**Recent decade (2016–2025):** 67–61 (.523) · 0 national titles · 5 AP weeks
**Trend:** up — 2016–2025 rating 36.7/100 vs. all-time 28.2 (Δ +8.5) · biggest moves: Wins ↑, NFL Draft Success ↓, AP Poll Success ↑

#### 100 · Central Michigan — MAC · The Field · 27.7 rating

**All-time (through 2025):** 319–285–11 (.528) as played · site rating **#100 of 136**
**The ten:** AP wks 2 (17) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 16 (75) · draft 45 (26) · 1st-rnd 2 (31) · wins 319 (23) · win% .528 (52)
**National titles:** none
**Conference titles:** 16 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**AP poll (1936–2025):** 2 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2009 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (2009–2009) · best finish AP #23 (2009)
**NFL draft (through 2026):** 45 picks, 2 first-round · last 10 drafts: 7 picks, 0 first-round
**Peak 10-yr stretch:** 1971–1980 — 57–16–2 (.773)
**Recent decade (2016–2025):** 55–65 (.458) · 0 national titles · 0 AP weeks
**Trend:** even — 2016–2025 rating 32.0/100 vs. all-time 27.7 (Δ +4.3)

#### 101 · Hawaii — Mountain West · The Field · 27.4 rating

**All-time (through 2025):** 356–400–6 (.471) as played · site rating **#101 of 136**
**The ten:** AP wks 27 (35) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 4 (25) · draft 72 (38) · 1st-rnd 1 (22) · wins 356 (28) · win% .471 (28)
**National titles:** none
**Conference titles:** 4 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 2025 Kansei Matsuzawa (PK)
**AP poll (1936–2025):** 27 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 1981 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (2006–2007) · best finish AP #19 (2007)
**NFL draft (through 2026):** 72 picks, 1 first-round · last 10 drafts: 3 picks, 0 first-round
**Peak 10-yr stretch:** 2001–2010 — 87–46 (.654)
**Recent decade (2016–2025):** 61–67 (.477) · 0 national titles · 0 AP weeks
**Trend:** even — 2016–2025 rating 31.6/100 vs. all-time 27.4 (Δ +4.1)

#### 102 · Jacksonville State — C-USA · The Field · 27.3 rating · former FCS

**All-time (through 2025):** 565–448–30 (.556) as played · site rating **#102 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 13 (61) · draft 11 (9) · 1st-rnd 0 (10) · wins 565 (57) · win% .556 (67)
**National titles:** none
**Conference titles:** 13 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 11 picks, 0 first-round · last 10 drafts: 0 picks, 0 first-round
**Peak 10-yr stretch:** 2008–2017 — 90–29 (.756)
**Recent decade (2016–2025):** 86–39 (.688) · 0 national titles
**Trend:** n/a — only 23 seasons on record (needs 30+ to chart)

#### 103 · Troy — Sun Belt · The Field · 27.3 rating

**All-time (through 2025):** 176–145 (.548) as played · site rating **#103 of 136**
**The ten:** AP wks 3 (18) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 22 (87) · draft 37 (22) · 1st-rnd 2 (31) · wins 176 (14) · win% .548 (61)
**National titles:** none
**Conference titles:** 22 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**AP poll (1936–2025):** 3 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2016 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (2016–2016) · best finish AP #19 (2022)
**NFL draft (through 2026):** 37 picks, 2 first-round · last 10 drafts: 4 picks, 0 first-round
**Peak 10-yr stretch:** 2016–2025 — 81–47 (.633)
**Recent decade (2016–2025):** 81–47 (.633) · 0 national titles · 3 AP weeks
**Trend:** up — 2016–2025 rating 44.3/100 vs. all-time 27.3 (Δ +17.0) · biggest moves: Wins ↑, AP Poll Success ↑, All-Americans ↑

#### 104 · UTEP — Mountain West · The Field · 26.9 rating

**All-time (through 2025):** 353–609–18 (.369) as played · site rating **#104 of 136**
**The ten:** AP wks 5 (20) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 1 (44) · natl 0 (35) · conf 2 (16) · draft 97 (42) · 1st-rnd 2 (31) · wins 353 (27) · win% .369 (8)
**National titles:** none
**Conference titles:** 2 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 1 unanimous · latest: 2000 Brian Natkin (TE, unan.)
**AP poll (1936–2025):** 5 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2004 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (2004–2005)
**NFL draft (through 2026):** 97 picks, 2 first-round · last 10 drafts: 4 picks, 0 first-round
**Peak 10-yr stretch:** 1948–1957 — 68–31–5 (.678)
**Recent decade (2016–2025):** 29–88 (.248) · 0 national titles · 0 AP weeks
**Trend:** even — 2016–2025 rating 20.4/100 vs. all-time 26.9 (Δ -6.5)

#### 105 · Coastal Carolina — Sun Belt · The Field · 26.3 rating · former FCS

**All-time (through 2025):** 171–100 (.631) as played · site rating **#105 of 136**
**The ten:** AP wks 23 (33) · top-10 1 (38) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 8 (36) · draft 9 (6) · 1st-rnd 0 (10) · wins 171 (13) · win% .631 (86)
**National titles:** none
**Conference titles:** 8 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 2020 Tarron Jackson (DL)
**AP poll (1936–2025):** 23 weeks ranked / 1 top-10 / 0 top-5 / 0 at #1 · first ranked 2020 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 3 yrs (2020–2022) · best finish AP #14 (2020)
**NFL draft (through 2026):** 9 picks, 0 first-round · last 10 drafts: 4 picks, 0 first-round
**Peak 10-yr stretch:** 2013–2022 — 86–39 (.688)
**Recent decade (2016–2025):** 74–51 (.592) · 0 national titles · 23 AP weeks
**Trend:** n/a — only 23 seasons on record (needs 30+ to chart)

#### 106 · New Mexico — Mountain West · The Field · 26.3 rating

**All-time (through 2025):** 430–602–19 (.418) as played · site rating **#106 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 3 (40) · unan.AA 0 (19) · natl 0 (35) · conf 4 (25) · draft 69 (36) · 1st-rnd 2 (31) · wins 430 (36) · win% .418 (11)
**National titles:** none
**Conference titles:** 4 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 3 consensus, 0 unanimous · latest: 1989 Terance Mathis (WR); 1999 Brian Urlacher (DB); 2007 John Sullivan (PK)
**NFL draft (through 2026):** 69 picks, 2 first-round · last 10 drafts: 3 picks, 0 first-round
**Peak 10-yr stretch:** 1956–1965 — 59–42–1 (.583)
**Recent decade (2016–2025):** 42–75 (.359) · 0 national titles
**Trend:** even — 2016–2025 rating 20.9/100 vs. all-time 26.3 (Δ -5.4)

#### 107 · Sam Houston — C-USA · The Field · 25.9 rating · former FCS

**All-time (through 2025):** 564–528–32 (.516) as played · site rating **#107 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 12 (56) · draft 20 (14) · 1st-rnd 0 (10) · wins 564 (56) · win% .516 (47)
**National titles:** none
**Conference titles:** 12 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 20 picks, 0 first-round · last 10 drafts: 0 picks, 0 first-round
**Peak 10-yr stretch:** 2011–2020 — 98–28 (.778)
**Recent decade (2016–2025):** 78–42 (.650) · 0 national titles
**Trend:** n/a — only 23 seasons on record (needs 30+ to chart)

#### 108 · Ball State — MAC · The Field · 25.5 rating

**All-time (through 2025):** 285–316–6 (.474) as played · site rating **#108 of 136**
**The ten:** AP wks 10 (28) · top-10 0 (18) · cons.AA 2 (36) · unan.AA 0 (19) · natl 0 (35) · conf 11 (50) · draft 29 (17) · 1st-rnd 0 (10) · wins 285 (21) · win% .474 (31)
**National titles:** none
**Conference titles:** 11 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 2 consensus, 0 unanimous · latest: 1995 Brad Maynard (P); 1996 Brad Maynard (P)
**AP poll (1936–2025):** 10 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2008 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (2008–2008) · best finish AP #23 (2020)
**NFL draft (through 2026):** 29 picks, 0 first-round · last 10 drafts: 2 picks, 0 first-round
**Peak 10-yr stretch:** 1969–1978 — 41–16–2 (.712)
**Recent decade (2016–2025):** 44–73 (.376) · 0 national titles · 1 AP weeks
**Trend:** even — 2016–2025 rating 26.0/100 vs. all-time 25.5 (Δ +0.6)

#### 109 · Western Kentucky — C-USA · The Field · 24.8 rating · former FCS

**All-time (through 2025):** 170–158 (.518) as played · site rating **#109 of 136**
**The ten:** AP wks 2 (17) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 12 (56) · draft 41 (24) · 1st-rnd 0 (10) · wins 170 (11) · win% .518 (47)
**National titles:** none
**Conference titles:** 12 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 2025 Cole Maynard (P)
**AP poll (1936–2025):** 2 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2015 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (2015–2015) · best finish AP #24 (2015)
**NFL draft (through 2026):** 41 picks, 0 first-round · last 10 drafts: 9 picks, 0 first-round
**Peak 10-yr stretch:** 1954–1963 — 1–0 (1.000)
**Recent decade (2016–2025):** 77–55 (.583) · 0 national titles · 0 AP weeks
**Trend:** up — 2016–2025 rating 44.4/100 vs. all-time 24.8 (Δ +19.6) · biggest moves: Wins ↑, All-Americans ↑, NFL Draft Success ↑

#### 110 · Ohio — MAC · The Field · 23.9 rating

**All-time (through 2025):** 348–409–9 (.460) as played · site rating **#110 of 136**
**The ten:** AP wks 9 (26) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 11 (50) · draft 34 (21) · 1st-rnd 1 (22) · wins 348 (26) · win% .460 (25)
**National titles:** none
**Conference titles:** 11 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**AP poll (1936–2025):** 9 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 1968 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (1968–1968) · best finish AP #20 (1968)
**NFL draft (through 2026):** 34 picks, 1 first-round · last 10 drafts: 3 picks, 0 first-round
**Peak 10-yr stretch:** 2016–2025 — 78–44 (.639)
**Recent decade (2016–2025):** 78–44 (.639) · 0 national titles · 0 AP weeks
**Trend:** up — 2016–2025 rating 37.5/100 vs. all-time 23.9 (Δ +13.5) · biggest moves: Wins ↑, All-Americans ↑, Championships ↑

#### 111 · Louisiana — Sun Belt · The Field · 23.9 rating

**All-time (through 2025):** 291–372–5 (.439) as played · 22–0 later vacated (site default removes these) · site rating **#111 of 136**
**The ten:** AP wks 21 (33) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 9 (41) · draft 45 (26) · 1st-rnd 0 (10) · wins 269 (20) · win% .420 (13)
**National titles:** none
**Conference titles:** 9 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 2024 Kenneth Almendares (PK)
**AP poll (1936–2025):** 21 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 1943 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (2020–2021) · best finish AP #15 (2020)
**NFL draft (through 2026):** 45 picks, 0 first-round · last 10 drafts: 12 picks, 0 first-round
**Peak 10-yr stretch:** 2012–2021 — 83–46 (.643)
**Recent decade (2016–2025):** 80–51 (.611) · 0 national titles · 19 AP weeks
**Trend:** up — 2016–2025 rating 47.3/100 vs. all-time 23.9 (Δ +23.5) · biggest moves: Wins ↑, All-Americans ↑, AP Poll Success ↑

#### 112 · Georgia Southern — Sun Belt · The Field · 23.6 rating · former FCS

**All-time (through 2025):** 432–264–10 (.619) as played · site rating **#112 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 11 (50) · draft 15 (11) · 1st-rnd 0 (10) · wins 432 (37) · win% .619 (83)
**National titles:** none
**Conference titles:** 11 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 15 picks, 0 first-round · last 10 drafts: 3 picks, 0 first-round
**Peak 10-yr stretch:** 2007–2016 — 76–42 (.644)
**Recent decade (2016–2025):** 62–65 (.488) · 0 national titles
**Trend:** up — 2016–2025 rating 33.5/100 vs. all-time 23.6 (Δ +9.9) · biggest moves: Wins ↓, NFL Draft Success ↑, All-Americans ↑

#### 113 · UConn — Independent · The Field · 23.4 rating · former FCS

**All-time (through 2025):** 154–270–3 (.364) as played · site rating **#113 of 136**
**The ten:** AP wks 6 (22) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 17 (79) · draft 46 (28) · 1st-rnd 2 (31) · wins 154 (8) · win% .364 (6)
**National titles:** none
**Conference titles:** 17 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 2025 Skyler Bell (WR)
**AP poll (1936–2025):** 6 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2007 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (2007–2008)
**NFL draft (through 2026):** 46 picks, 2 first-round · last 10 drafts: 7 picks, 0 first-round
**Peak 10-yr stretch:** 2002–2011 — 70–53 (.569)
**Recent decade (2016–2025):** 37–74 (.333) · 0 national titles · 0 AP weeks
**Trend:** even — 2016–2025 rating 30.4/100 vs. all-time 23.4 (Δ +7.0)

#### 114 · Liberty — C-USA · The Field · 22.3 rating · former FCS

**All-time (through 2025):** 156–111 (.584) as played · site rating **#114 of 136**
**The ten:** AP wks 15 (30) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 8 (36) · draft 10 (7) · 1st-rnd 1 (22) · wins 156 (8) · win% .584 (75)
**National titles:** none
**Conference titles:** 8 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**AP poll (1936–2025):** 15 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2020 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (2022–2023) · best finish AP #17 (2020)
**NFL draft (through 2026):** 10 picks, 1 first-round · last 10 drafts: 3 picks, 0 first-round
**Peak 10-yr stretch:** 2015–2024 — 79–42 (.653)
**Recent decade (2016–2025):** 77–45 (.631) · 0 national titles · 15 AP weeks
**Trend:** up — 2016–2025 rating 39.2/100 vs. all-time 22.3 (Δ +16.9) · biggest moves: Wins ↑, AP Poll Success ↑, All-Americans ↑

#### 115 · James Madison — Sun Belt · The Field · 22.0 rating · former FCS

**All-time (through 2025):** 463–179 (.721) as played · site rating **#115 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 8 (36) · draft 5 (4) · 1st-rnd 0 (10) · wins 463 (40) · win% .721 (95)
**National titles:** none
**Conference titles:** 8 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 5 picks, 0 first-round · last 10 drafts: 0 picks, 0 first-round
**Peak 10-yr stretch:** 2016–2025 — 110–22 (.833)
**Recent decade (2016–2025):** 110–22 (.833) · 0 national titles
**Trend:** n/a — only 23 seasons on record (needs 30+ to chart)

#### 116 · UMass — Independent · The Field · 20.8 rating · former FCS

**All-time (through 2025):** 171–321–8 (.350) as played · site rating **#116 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 22 (87) · draft 26 (16) · 1st-rnd 2 (31) · wins 171 (13) · win% .350 (5)
**National titles:** none
**Conference titles:** 22 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 2018 Andy Isabella (WR)
**NFL draft (through 2026):** 26 picks, 2 first-round · last 10 drafts: 3 picks, 0 first-round
**Peak 10-yr stretch:** 1945–1954 — 1–0 (1.000)
**Recent decade (2016–2025):** 18–94 (.161) · 0 national titles
**Trend:** even — 2016–2025 rating 28.3/100 vs. all-time 20.8 (Δ +7.5)

#### 117 · New Mexico State — C-USA · The Field · 20.1 rating

**All-time (through 2025):** 343–628–14 (.355) as played · site rating **#117 of 136**
**The ten:** AP wks 6 (22) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 4 (25) · draft 56 (32) · 1st-rnd 0 (10) · wins 343 (25) · win% .355 (6)
**National titles:** none
**Conference titles:** 4 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**AP poll (1936–2025):** 6 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 1960 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (1960–1960) · best finish AP #17 (1960)
**NFL draft (through 2026):** 56 picks, 0 first-round · last 10 drafts: 2 picks, 0 first-round
**Peak 10-yr stretch:** 1959–1968 — 64–35–3 (.642)
**Recent decade (2016–2025):** 42–73 (.365) · 0 national titles · 0 AP weeks
**Trend:** even — 2016–2025 rating 21.0/100 vs. all-time 20.1 (Δ +0.9)

#### 118 · Missouri State — C-USA · The Field · 20.0 rating · former FCS

**All-time (through 2025):** 514–577–35 (.472) as played · site rating **#118 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 5 (29) · draft 14 (10) · 1st-rnd 0 (10) · wins 514 (45) · win% .472 (30)
**National titles:** none
**Conference titles:** 5 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 14 picks, 0 first-round · last 10 drafts: 0 picks, 0 first-round
**Peak 10-yr stretch:** 2016–2025 — 49–64 (.434)
**Recent decade (2016–2025):** 49–64 (.434) · 0 national titles
**Trend:** n/a — only 23 seasons on record (needs 30+ to chart)

#### 119 · Eastern Michigan — MAC · The Field · 19.5 rating

**All-time (through 2025):** 194–397–7 (.330) as played · site rating **#119 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 9 (41) · draft 32 (19) · 1st-rnd 2 (31) · wins 194 (16) · win% .330 (2)
**National titles:** none
**Conference titles:** 9 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 32 picks, 2 first-round · last 10 drafts: 4 picks, 0 first-round
**Peak 10-yr stretch:** 2016–2025 — 58–62 (.483)
**Recent decade (2016–2025):** 58–62 (.483) · 0 national titles
**Trend:** up — 2016–2025 rating 31.4/100 vs. all-time 19.5 (Δ +11.9) · biggest moves: Wins ↑, NFL Draft Success ↑, All-Americans ↑

#### 120 · Arkansas State — Sun Belt · The Field · 19.3 rating

**All-time (through 2025):** 255–333–7 (.434) as played · 10–0 later vacated (site default removes these) · site rating **#120 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 12 (56) · draft 49 (30) · 1st-rnd 0 (10) · wins 245 (19) · win% .425 (15)
**National titles:** none
**Conference titles:** 12 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 49 picks, 0 first-round · last 10 drafts: 0 picks, 0 first-round
**Peak 10-yr stretch:** 1966–1975 — 26–11 (.703)
**Recent decade (2016–2025):** 61–64 (.488) · 0 national titles
**Trend:** up — 2016–2025 rating 31.4/100 vs. all-time 19.3 (Δ +12.0) · biggest moves: NFL Draft Success ↓, Wins ↑, All-Americans ↑

#### 121 · UNLV — Mountain West · The Field · 18.8 rating

**All-time (through 2025):** 223–345–3 (.393) as played · site rating **#121 of 136**
**The ten:** AP wks 6 (22) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 1 (9) · draft 47 (29) · 1st-rnd 0 (10) · wins 223 (17) · win% .393 (8)
**National titles:** none
**Conference titles:** 1 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 1998 Joe Kristosik (P)
**AP poll (1936–2025):** 6 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2024 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (2024–2024) · best finish AP #23 (2024)
**NFL draft (through 2026):** 47 picks, 0 first-round · last 10 drafts: 1 picks, 0 first-round
**Peak 10-yr stretch:** 1971–1980 — 26–14–2 (.643)
**Recent decade (2016–2025):** 54–66 (.450) · 0 national titles · 6 AP weeks
**Trend:** even — 2016–2025 rating 26.6/100 vs. all-time 18.8 (Δ +7.8)

#### 122 · UTSA — American · The Field · 18.7 rating · former FCS

**All-time (through 2025):** 98–87 (.530) as played · site rating **#122 of 136**
**The ten:** AP wks 9 (26) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 2 (16) · draft 5 (4) · 1st-rnd 1 (22) · wins 98 (4) · win% .530 (53)
**National titles:** none
**Conference titles:** 2 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**AP poll (1936–2025):** 9 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2021 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 2 yrs (2021–2022)
**NFL draft (through 2026):** 5 picks, 1 first-round · last 10 drafts: 4 picks, 1 first-round
**Peak 10-yr stretch:** 2016–2025 — 72–55 (.567)
**Recent decade (2016–2025):** 72–55 (.567) · 0 national titles · 9 AP weeks
**Trend:** n/a — only 15 seasons on record (needs 30+ to chart)

#### 123 · Kent State — MAC · The Field · 18.2 rating

**All-time (through 2025):** 233–478–5 (.329) as played · site rating **#123 of 136**
**The ten:** AP wks 5 (20) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 1 (9) · draft 44 (25) · 1st-rnd 0 (10) · wins 233 (18) · win% .329 (1)
**National titles:** none
**Conference titles:** 1 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 2012 Dri Archer (KR/AP)
**AP poll (1936–2025):** 5 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 1973 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (1973–1973)
**NFL draft (through 2026):** 44 picks, 0 first-round · last 10 drafts: 0 picks, 0 first-round
**Peak 10-yr stretch:** 1951–1960 — 1–0 (1.000)
**Recent decade (2016–2025):** 35–80 (.304) · 0 national titles · 0 AP weeks
**Trend:** even — 2016–2025 rating 17.2/100 vs. all-time 18.2 (Δ -1.0)

#### 124 · Florida Atlantic — American · The Field · 18.0 rating · former FCS

**All-time (through 2025):** 126–158 (.444) as played · site rating **#124 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 1 (44) · natl 0 (35) · conf 3 (21) · draft 10 (7) · 1st-rnd 0 (10) · wins 126 (6) · win% .444 (19)
**National titles:** none
**Conference titles:** 3 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 1 unanimous · latest: 2019 Harrison Bryant (TE, unan.)
**NFL draft (through 2026):** 10 picks, 0 first-round · last 10 drafts: 4 picks, 0 first-round
**Peak 10-yr stretch:** 2001–2010 — 54–49 (.524)
**Recent decade (2016–2025):** 56–65 (.463) · 0 national titles
**Trend:** n/a — only 25 seasons on record (needs 30+ to chart)

#### 125 · Louisiana-Monroe — Sun Belt · The Field · 17.5 rating

**All-time (through 2025):** 167–315–3 (.347) as played · site rating **#125 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 5 (29) · draft 38 (23) · 1st-rnd 1 (22) · wins 167 (11) · win% .347 (4)
**National titles:** none
**Conference titles:** 5 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 38 picks, 1 first-round · last 10 drafts: 1 picks, 0 first-round
**Peak 10-yr stretch:** 1962–1971 — 3–1 (.750)
**Recent decade (2016–2025):** 37–81 (.314) · 0 national titles
**Trend:** even — 2016–2025 rating 21.0/100 vs. all-time 17.5 (Δ +3.5)

#### 126 · Buffalo — MAC · The Field · 17.5 rating · former FCS

**All-time (through 2025):** 172–265–4 (.395) as played · site rating **#126 of 136**
**The ten:** AP wks 3 (18) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 1 (9) · draft 17 (13) · 1st-rnd 1 (22) · wins 172 (14) · win% .395 (9)
**National titles:** none
**Conference titles:** 1 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 2024 Shaun Dolac (LB)
**AP poll (1936–2025):** 3 weeks ranked / 0 top-10 / 0 top-5 / 0 at #1 · first ranked 2020 · 0 AP-#1 finishes · 0 top-5 finishes · longest ranked streak 1 yrs (2020–2020) · best finish AP #25 (2020)
**NFL draft (through 2026):** 17 picks, 1 first-round · last 10 drafts: 3 picks, 0 first-round
**Peak 10-yr stretch:** 1960–1969 — 45–35–4 (.560)
**Recent decade (2016–2025):** 60–60 (.500) · 0 national titles · 3 AP weeks
**Trend:** up — 2016–2025 rating 33.0/100 vs. all-time 17.5 (Δ +15.5) · biggest moves: Wins ↑, All-Americans ↑, AP Poll Success ↑

#### 127 · Middle Tennessee — C-USA · The Field · 17.2 rating

**All-time (through 2025):** 160–212–1 (.430) as played · site rating **#127 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 13 (61) · draft 33 (20) · 1st-rnd 0 (10) · wins 160 (9) · win% .430 (17)
**National titles:** none
**Conference titles:** 13 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 33 picks, 0 first-round · last 10 drafts: 2 picks, 0 first-round
**Peak 10-yr stretch:** 1962–1971 — 1–0 (1.000)
**Recent decade (2016–2025):** 55–68 (.447) · 0 national titles
**Trend:** up — 2016–2025 rating 28.2/100 vs. all-time 17.2 (Δ +11.0) · biggest moves: Wins ↑, NFL Draft Success ↑, All-Americans ↑

#### 128 · Texas State — Pac-12 · The Field · 16.4 rating · former FCS

**All-time (through 2025):** 118–174–1 (.404) as played · site rating **#128 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 12 (56) · draft 37 (22) · 1st-rnd 0 (10) · wins 118 (6) · win% .404 (10)
**National titles:** none
**Conference titles:** 12 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 37 picks, 0 first-round · last 10 drafts: 0 picks, 0 first-round
**Peak 10-yr stretch:** 1996–2005 — 22–20 (.524)
**Recent decade (2016–2025):** 43–80 (.350) · 0 national titles
**Trend:** even — 2016–2025 rating 23.3/100 vs. all-time 16.4 (Δ +6.9)

#### 129 · UAB — American · The Field · 16.4 rating · former FCS

**All-time (through 2025):** 148–188 (.440) as played · site rating **#129 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 2 (16) · draft 16 (11) · 1st-rnd 2 (31) · wins 148 (7) · win% .440 (18)
**National titles:** none
**Conference titles:** 2 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 16 picks, 2 first-round · last 10 drafts: 4 picks, 0 first-round
**Peak 10-yr stretch:** 1995–2004 — 50–54 (.481)
**Recent decade (2016–2025):** 61–51 (.545) · 0 national titles
**Trend:** up — 2017–2025 rating 29.6/100 vs. all-time 16.4 (Δ +13.2) · biggest moves: Wins ↑, NFL Draft Success ↑, All-Americans ↑

#### 130 · Kennesaw State — C-USA · The Field · 15.8 rating · former FCS

**All-time (through 2025):** 83–44 (.654) as played · site rating **#130 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 4 (25) · draft 0 (0) · 1st-rnd 0 (10) · wins 83 (3) · win% .654 (89)
**National titles:** none
**Conference titles:** 4 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**Peak 10-yr stretch:** 2016–2025 — 77–39 (.664)
**Recent decade (2016–2025):** 77–39 (.664) · 0 national titles
**Trend:** n/a — only 11 seasons on record (needs 30+ to chart)

#### 131 · Akron — MAC · The Field · 14.8 rating

**All-time (through 2025):** 186–319–4 (.369) as played · site rating **#131 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 1 (27) · unan.AA 0 (19) · natl 0 (35) · conf 1 (9) · draft 17 (13) · 1st-rnd 0 (10) · wins 186 (15) · win% .369 (7)
**National titles:** none
**Conference titles:** 1 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 1 consensus, 0 unanimous · latest: 2000 Dwight Smith (DB)
**NFL draft (through 2026):** 17 picks, 0 first-round · last 10 drafts: 1 picks, 0 first-round
**Peak 10-yr stretch:** 1975–1984 — 20–17 (.541)
**Recent decade (2016–2025):** 32–84 (.276) · 0 national titles
**Trend:** even — 2016–2025 rating 18.0/100 vs. all-time 14.8 (Δ +3.3)

#### 132 · Old Dominion — Sun Belt · The Field · 13.5 rating · former FCS

**All-time (through 2025):** 106–88 (.546) as played · site rating **#132 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 0 (3) · draft 5 (4) · 1st-rnd 0 (10) · wins 106 (5) · win% .546 (59)
**National titles:** none
**Conference titles:** none
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 5 picks, 0 first-round · last 10 drafts: 5 picks, 0 first-round
**Peak 10-yr stretch:** 2009–2018 — 75–44 (.630)
**Recent decade (2016–2025):** 50–62 (.446) · 0 national titles
**Trend:** n/a — only 21 seasons on record (needs 30+ to chart)

#### 133 · FIU — C-USA · The Field · 10.5 rating · former FCS

**All-time (through 2025):** 97–181 (.349) as played · 5–0 later vacated (site default removes these) · site rating **#133 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 1 (9) · draft 10 (7) · 1st-rnd 0 (10) · wins 92 (3) · win% .337 (3)
**National titles:** none
**Conference titles:** 1 (summary total — years not itemised)
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 10 picks, 0 first-round · last 10 drafts: 4 picks, 0 first-round
**Peak 10-yr stretch:** 2010–2019 — 55–70 (.440)
**Recent decade (2016–2025):** 47–70 (.402) · 0 national titles
**Trend:** n/a — only 24 seasons on record (needs 30+ to chart)

#### 134 · South Alabama — Sun Belt · The Field · 10.0 rating · former FCS

**All-time (through 2025):** 75–106 (.414) as played · site rating **#134 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 0 (3) · draft 4 (2) · 1st-rnd 0 (10) · wins 75 (2) · win% .414 (11)
**National titles:** none
**Conference titles:** none
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 4 picks, 0 first-round · last 10 drafts: 4 picks, 0 first-round
**Peak 10-yr stretch:** 2015–2024 — 53–70 (.431)
**Recent decade (2016–2025):** 52–71 (.423) · 0 national titles
**Trend:** n/a — only 15 seasons on record (needs 30+ to chart)

#### 135 · Georgia State — Sun Belt · The Field · 9.0 rating · former FCS

**All-time (through 2025):** 65–125 (.342) as played · site rating **#135 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 0 (3) · draft 3 (1) · 1st-rnd 0 (10) · wins 65 (1) · win% .342 (3)
**National titles:** none
**Conference titles:** none
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 3 picks, 0 first-round · last 10 drafts: 3 picks, 0 first-round
**Peak 10-yr stretch:** 2015–2024 — 53–69 (.434)
**Recent decade (2016–2025):** 48–73 (.397) · 0 national titles
**Trend:** n/a — only 16 seasons on record (needs 30+ to chart)

#### 136 · Charlotte — American · The Field · 8.9 rating · former FCS

**All-time (through 2025):** 48–101 (.322) as played · site rating **#136 of 136**
**The ten:** AP wks 0 (8) · top-10 0 (18) · cons.AA 0 (10) · unan.AA 0 (19) · natl 0 (35) · conf 0 (3) · draft 5 (4) · 1st-rnd 0 (10) · wins 48 (0) · win% .322 (0)
**National titles:** none
**Conference titles:** none
**Heisman:** none
**All-Americans:** 0 consensus, 0 unanimous (summary totals)
**NFL draft (through 2026):** 5 picks, 0 first-round · last 10 drafts: 5 picks, 0 first-round
**Peak 10-yr stretch:** 2013–2022 — 39–74 (.345)
**Recent decade (2016–2025):** 36–79 (.313) · 0 national titles
**Trend:** n/a — only 16 seasons on record (needs 30+ to chart)

