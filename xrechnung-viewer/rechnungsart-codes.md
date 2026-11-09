# Rechnungsart (BT-3): die erlaubten Codes

In einer XRechnung sollen als Rechnungsart (BT-3) nur 326 (Partial invoice), 380 (Commercial invoice), 381 (Credit note), 384 (Corrected invoice), 389 (Self-billed invoice), 875 (Partial construction invoice), 876 (Partial final construction invoice), 877 (Final construction invoice) verwendet werden (BR-DE-17, Warnung); die EN 16931 lässt in UBL Invoice 50 und in UBL CreditNote 13 Codes der UNTDID 1001 zu (BR-CL-01, Fehler).

| Code | UBL Invoice (BR-CL-01) | UBL CreditNote (BR-CL-01) | XRechnung (BR-DE-17) | Name laut BR-DE-17 |
| --- | --- | --- | --- | --- |
| 71 | ja |  |  |  |
| 80 | ja |  |  |  |
| 81 | ja | ja |  |  |
| 82 | ja |  |  |  |
| 83 |  | ja |  |  |
| 84 | ja |  |  |  |
| 102 | ja |  |  |  |
| 130 | ja |  |  |  |
| 202 | ja |  |  |  |
| 203 | ja |  |  |  |
| 204 | ja |  |  |  |
| 211 | ja |  |  |  |
| 218 | ja |  |  |  |
| 219 | ja |  |  |  |
| 261 |  | ja |  |  |
| 262 |  | ja |  |  |
| 295 | ja |  |  |  |
| 296 |  | ja |  |  |
| 308 |  | ja |  |  |
| 325 | ja |  |  |  |
| 326 | ja |  | ja | Partial invoice |
| 331 | ja |  |  |  |
| 380 | ja |  | ja | Commercial invoice |
| 381 |  | ja | ja | Credit note |
| 382 | ja |  |  |  |
| 383 | ja |  |  |  |
| 384 | ja |  | ja | Corrected invoice |
| 385 | ja |  |  |  |
| 386 | ja |  |  |  |
| 387 | ja |  |  |  |
| 388 | ja |  |  |  |
| 389 | ja |  | ja | Self-billed invoice |
| 390 | ja |  |  |  |
| 393 | ja |  |  |  |
| 394 | ja |  |  |  |
| 395 | ja |  |  |  |
| 396 |  | ja |  |  |
| 420 |  | ja |  |  |
| 456 | ja |  |  |  |
| 457 | ja |  |  |  |
| 458 |  | ja |  |  |
| 471 | ja |  |  |  |
| 472 | ja |  |  |  |
| 473 | ja |  |  |  |
| 500 | ja |  |  |  |
| 501 | ja |  |  |  |
| 502 |  | ja |  |  |
| 503 |  | ja |  |  |
| 527 | ja |  |  |  |
| 532 |  | ja |  |  |
| 553 | ja |  |  |  |
| 575 | ja |  |  |  |
| 623 | ja |  |  |  |
| 633 | ja |  |  |  |
| 751 | ja |  |  |  |
| 780 | ja |  |  |  |
| 817 | ja |  |  |  |
| 870 | ja |  |  |  |
| 875 | ja |  | ja | Partial construction invoice |
| 876 | ja |  | ja | Partial final construction invoice |
| 877 | ja |  | ja | Final construction invoice |
| 935 | ja |  |  |  |

Ein Code außerhalb der BR-CL-01-Liste macht die Rechnung ungültig; ein zulässiger Code außerhalb der BR-DE-17-Liste führt in XRechnung zu einer Warnung. Für die korrigierte Rechnung (384) soll die ursprüngliche Rechnung genannt werden: [BR-DE-26](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-26/).

## Quellen

- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31)
- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron) (gelesen am 8. November 2026)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16)

## Verwandte Seiten

- [BR-DE-17](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-17/)
- [BR-DE-26](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-26/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/rechnungsart-codes/  
Datenstand: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/rechnungsart-codes.csv
