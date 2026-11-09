# Leitweg-ID

Die Leitweg-ID ist die Adresse eines öffentlichen Auftraggebers für E-Rechnungen; sie steht in der XRechnung im Feld Käuferreferenz (BT-10) und fehlt sie, meldet die Prüfung BR-DE-15: Das Element "Buyer reference" (BT-10) muss übermittelt werden.

## Wo sie steht

```xml
<cbc:BuyerReference>04011000-12345-03</cbc:BuyerReference>
```

In CII steht sie in rsm:SupplyChainTradeTransaction/ram:ApplicableHeaderTradeAgreement/ram:BuyerReference. Der Wert oben ist die Beispiel-Leitweg-ID aus der KoSIT-Testsuite und aus der erfundenen Beispielrechnung.

## Woher Sie sie bekommen

Die Leitweg-ID nennt Ihnen der öffentliche Auftraggeber, meist in der Bestellung oder im Vertrag. Bei Rechnungen an Unternehmen ist BT-10 in XRechnung ebenfalls Pflicht; dort steht die Referenz, die der Kunde vorgibt, etwa eine Kostenstelle.

## Typische Ablehnungsgründe

- BT-10 fehlt: BR-DE-15.
- Die Leitweg-ID steht im falschen Feld, etwa als Bestellnummer (BT-13).
- Eine veraltete oder falsche Leitweg-ID: die Prüfregeln erkennen das nicht, das Portal des Auftraggebers schon.

Steuerlich ist die fehlende BT-10 unbeachtlich: das BMF-Schreiben vom 15.10.2025 nennt sie ausdrücklich als Beispiel eines Geschäftsregelfehlers ohne umsatzsteuerliche Folgen (Rn. 35a). Zugestellt wird die Rechnung ohne sie trotzdem nicht.

## Beispiel ohne Leitweg-ID prüfen

[Beispiel im Viewer prüfen](https://krishnachagti-sudo.github.io/toll-preview/de/xrechnung-viewer/?sample=fehler&job=validate)

## Quellen

- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2 (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0)
- [BMF-Schreiben vom 15.10.2025, III C 2 - S 7287-a/00019/007/243, Einführung der obligatorischen E-Rechnung (Rn. 6a, 6b, 22, 35a, Profile MINIMUM und BASIC WL) (gelesen am 8. November 2026)](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-10-15-einfuehrung-obligatorische-e-rechnung.html)
- [XRechnung Testsuite 2026-08-31 (sample 02.01a-cvd\_INVOICE\_ubl.xml bundled, line endings made LF) (gelesen am 8. November 2026)](https://github.com/itplr-kosit/xrechnung-testsuite/releases/tag/v2026-08-31)

## Verwandte Seiten

- [BR-DE-15](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/fehler/br-de-15/)
- [Rechnung abgelehnt?](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/rechnung-abgelehnt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/guides/leitweg-id/  
Datenstand: 2026-11-08
