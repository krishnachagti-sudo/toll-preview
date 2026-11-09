# How the XRechnung validator works: scenarios and rules

The file is read as UBL or CII XML, or the XML is taken out of a ZUGFeRD or Factur-X PDF, and its specification identifier (BT-24) names the profile. The KoSIT scenario that matches it runs the official schematron rules of the KoSIT configuration 2026-08-31 (XRechnung 3.0.2), XRechnung schematron 2.6.0 and CEN EN 16931 schematron 1.3.16; the invoice is valid when no finding is at level error.

## How does it work?

1. The bytes are read as a PDF when they hold %PDF-, otherwise as XML. XML with a DOCTYPE is refused (no DTDs or external entities are read), and parsing stops past 400,000 nodes or 200 levels deep.
2. In a PDF, every indirect object (and every object inside an object stream) is read, the embedded files are listed and the invoice XML (factur-x.xml, zugferd-invoice.xml, xrechnung.xml and the like) is taken out and decompressed. An encrypted PDF is refused, since a ZUGFeRD or Factur-X PDF/A-3 is never encrypted.
3. The root element names the syntax (UBL Invoice, UBL CreditNote, UN/CEFACT CII or ZUGFeRD 1.0), and the specification identifier (BT-24) names the profile, most specific first: XRechnung 3.0 Extension, XRechnung 3.0 CVD, XRechnung 3.0, XRechnung (older version), ZUGFeRD / Factur-X EXTENDED, ZUGFeRD / Factur-X BASIC WL, ZUGFeRD / Factur-X BASIC, ZUGFeRD / Factur-X MINIMUM, Peppol BIS Billing 3.0, EN 16931, ZUGFeRD 1.0.
4. Following the BMF letter of 15 Oct 2025 and FeRD, ZUGFeRD / Factur-X BASIC WL, ZUGFeRD / Factur-X MINIMUM, ZUGFeRD 1.0 are said not to count as an e-invoice under the German VAT Act.
5. The scenarios of the KoSIT configuration 2026-08-31 are tried in order by their match expressions.

> Steps 6 to 9, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/xrechnung-viewer/#what) below.

## What does it not cover?

- It runs the schematron rules only: the XML Schema (XSD) step the KoSIT validator also runs, and PDF/A conformance, are not checked.
- A pass does not mean the invoice is right in substance, and the sorting of errors into the BMF letter's kinds is a reading aid, not tax advice.
- The XML is the invoice; the view and the PDF are reading copies.
- Files are processed in memory and not kept.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 14 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The rule files are the KoSIT configuration 2026-08-31 (XRechnung 3.0.2), XRechnung schematron 2.6.0 and CEN EN 16931 schematron 1.3.16, bundled with their licences. The sources were read on 2026-11-08. A newer CEN release (1.3.17 (published, not yet in a KoSIT configuration)) is noted and used only once a KoSIT configuration includes it.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check the bundled artefacts and their versions, that the XML reader refuses DOCTYPEs and entity bombs, exact decimal XPath, that the KoSIT test suite files and the samples pass under their scenarios with the levels scenarios.xml sets, that each rule page's demonstration fires its rule, the BMF sorting, reading the XML from ZUGFeRD PDFs, the readable PDF and the examples.

- [KoSIT Validator Configuration XRechnung 2026-08-31 (scenarios.xml)](https://github.com/itplr-kosit/validator-configuration-xrechnung/releases/tag/v2026-08-31), published 2026-09-02, read 2026-11-08
- [XRechnung Schematron 2.6.0 for XRechnung 3.0.2](https://github.com/itplr-kosit/xrechnung-schematron/releases/tag/v2.6.0), published 2026-09-02, read 2026-11-08
- [CEN EN 16931 validation artefacts 1.3.16 (UBL and CII, preprocessed schematron)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.16), published 2026-04-13, read 2026-11-08
- [CEN EN 16931 validation artefacts 1.3.17 (published, not yet in a KoSIT configuration)](https://github.com/ConnectingEurope/eInvoicing-EN16931/releases/tag/validation-1.3.17), published 2026-10-12, read 2026-11-08
- [XRechnung Testsuite 2026-08-31 (sample 02.01a-cvd\_INVOICE\_ubl.xml bundled, line endings made LF)](https://github.com/itplr-kosit/xrechnung-testsuite/releases/tag/v2026-08-31), published 2026-09-02, read 2026-11-08
- [BMF-Schreiben vom 15.10.2025, III C 2 - S 7287-a/00019/007/243, Einführung der obligatorischen E-Rechnung (Rn. 6a, 6b, 22, 35a, Profile MINIMUM und BASIC WL)](https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Anwendungserlass/2025-10-15-einfuehrung-obligatorische-e-rechnung.html), see the document, read 2026-11-08
- [§ 27 Abs. 38 UStG (Übergangsregeln bis 31.12.2026 und 31.12.2027, 800.000 Euro)](https://www.gesetze-im-internet.de/ustg_1980/__27.html), see the document, read 2026-11-08
- [§ 14 Abs. 1 UStG (elektronische Rechnung, sonstige Rechnung, EN 16931)](https://www.gesetze-im-internet.de/ustg_1980/__14.html), see the document, read 2026-11-08
- [§ 14b Abs. 1 UStG (acht Jahre Aufbewahrung)](https://www.gesetze-im-internet.de/ustg_1980/__14b.html), see the document, read 2026-11-08
- [§ 33 UStDV (Rechnungen über Kleinbeträge bis 250 Euro)](https://www.gesetze-im-internet.de/ustdv_1980/__33.html), see the document, read 2026-11-08
- [FeRD, ZUGFeRD/Factur-X FAQ (Profile, Referenzprofil XRECHNUNG, führender XML-Teil)](https://www.ferd-net.de/standards/zugferd-faq), see the document, read 2026-11-08
- [FeRD, Was ist ZUGFeRD? (PDF/A-3 mit eingebetteter XML, inhaltliche Identität)](https://www.ferd-net.de/standards/zugferd), see the document, read 2026-11-08
- [FeRD, ZUGFeRD 2.5.2 veröffentlicht (04.08.2026)](https://www.ferd-net.de/aktuelles-veranstaltungen/aktuelles/news/zugferd-252-veroeffentlicht), see the document, read 2026-11-08
- [ELSTER, E-Rechnung ansehen](https://www.elster.de/eportal/e-rechnung), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the xrechnung and zugferd viewer and validator compute?

Given one e-invoice of up to 5 MB, an XRechnung or other EN 16931 XML (UBL Invoice, UBL CreditNote or UN/CEFACT CII) or a ZUGFeRD / Factur-X PDF with the XML embedded, the tool says what the file is, shows the invoice as EN 16931 business terms, and checks it against the official rules the KoSIT validator uses, with each finding's rule id, level, place in the file and, where one is written, a plain explanation and fix. It can also make a readable PDF copy with the validation report. Answers are in German by default or in English; rule messages stay as the official files write them.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `view`: Reads the file and returns what it is (syntax, profile, where it sat in the PDF), whether the profile counts as an e-invoice, a summary (number, dates, parties, totals, amount due), the invoice as business terms and the lines as CSV. Free.
- `validate`: Does the reading and runs the official rules: the status, the scenario or fallback used, the counts of errors, warnings and notices, the number of checks run, the versions, each finding with its rule id, level, location, business terms and rule page, and the errors sorted into the BMF letter's three kinds.
- `pdf`: Does what validate does and also returns a readable PDF copy of the invoice with the validation report on its own page.
- `explain`: Looks up one rule id (such as BR-DE-15) in the bundled rule files: its official message, level, the scenarios that change its level, the syntaxes it applies to, its business terms and, for the 44 rules with a rule page, what it means, the usual cause and the fix. Free.

Inputs:

- `file or xml`: The invoice as base64 (file) or as XML text (xml), one of the two, at most 5 MB.
- `lang`: de (the default) or en: the language of the answer, labels and PDF.
- `rule`: For explain: a rule id from a validation report, such as BR-DE-15, br-de-01, BR-CO-10 or UBL-CR-646; spellings with and without a leading zero both work.

Outputs:

- answer: what the file is and, for validate and pdf, the result under the named rule versions
- format and formatText: the syntax, root element, specification identifier and profile; source (xml or pdf) and the PDF attachment found
- einvoiceNote: why a profile does not count as an e-invoice, when it does not; summary: number, dates, parties, totals and amount due
- validation: status, headline, scenario or fallback, counts, checks run, versions, what is not checked, the BMF buckets and each finding
- invoice and linesCsv (view); file: the PDF as base64 (pdf); rule, message, level and explanation (explain)
- disclaimers: what the check does and does not mean

**Every step in full (9) and the rules**

1. The bytes are read as a PDF when they hold %PDF-, otherwise as XML. XML with a DOCTYPE is refused (no DTDs or external entities are read), and parsing stops past 400,000 nodes or 200 levels deep.
2. In a PDF, every indirect object (and every object inside an object stream) is read, the embedded files are listed and the invoice XML (factur-x.xml, zugferd-invoice.xml, xrechnung.xml and the like) is taken out and decompressed. An encrypted PDF is refused, since a ZUGFeRD or Factur-X PDF/A-3 is never encrypted. A PDF has at most 200,000 objects.
3. The root element names the syntax (UBL Invoice, UBL CreditNote, UN/CEFACT CII or ZUGFeRD 1.0), and the specification identifier (BT-24) names the profile, most specific first: XRechnung 3.0 Extension, XRechnung 3.0 CVD, XRechnung 3.0, XRechnung (older version), ZUGFeRD / Factur-X EXTENDED, ZUGFeRD / Factur-X BASIC WL, ZUGFeRD / Factur-X BASIC, ZUGFeRD / Factur-X MINIMUM, Peppol BIS Billing 3.0, EN 16931, ZUGFeRD 1.0.
4. Following the BMF letter of 15 Oct 2025 and FeRD, ZUGFeRD / Factur-X BASIC WL, ZUGFeRD / Factur-X MINIMUM, ZUGFeRD 1.0 are said not to count as an e-invoice under the German VAT Act.
5. The scenarios of the KoSIT configuration 2026-08-31 are tried in order by their match expressions. The first that matches names the schematron files to run and any custom levels for rules. A file no scenario matches (ZUGFeRD BASIC or EXTENDED, Peppol, older XRechnung versions) is checked with the EN 16931 rules of its syntax, and the answer names that fallback. ZUGFeRD 1.0 is not checked.
6. Every rule of every pattern runs on the nodes its context selects, with the schematron's own variables and functions and exact decimal arithmetic. In a pattern, the first rule that matches a node takes it. A failed assert (or a fired report) is a finding with the rule's message, filled in from the file, and its place in the file.
7. A finding's level is the scenario's custom level when it sets one, otherwise the rule's own flag (fatal is error). The file is valid when no finding is at level error.
8. Each error is sorted into one of the three kinds the BMF letter names: a format error (schema and code list rules such as UBL-SR, UBL-CR, CII-SR and BR-CL), a content error (calculation and VAT category rules, or any rule about a mandatory VAT item), or a business rule error (the rest). This sorting is a reading aid, cited to the letter.
9. For view and pdf, the business terms the view and PDF show are read by their UBL or CII paths, and the lines are written as CSV with cells guarded against spreadsheet formulas.

**The official rules.**

The rule files are the published KoSIT and CEN artefacts, bundled unchanged: the KoSIT Validator Configuration XRechnung 2026-08-31 (published 2026-09-02, Apache-2.0), the XRechnung Schematron 2.6.0 (Apache-2.0) and the CEN EN 16931 validation artefacts 1.3.16 (published 2026-04-13, EUPL-1.2).

Checked against the official schematron rules (KoSIT configuration 2026-08-31 (XRechnung 3.0.2), XRechnung schematron 2.6.0, CEN EN 16931 schematron 1.3.16). The XML Schema (XSD) step that the KoSIT validator also runs is not run here.

**The BMF letter of 15 Oct 2025.**

The kinds of error (format, business rule, content, Rn. 6a and 6b), the point that a pass does not mean the invoice is right in substance (Rn. 35a) and the profiles that are not e-invoices come from the letter.

Not tax advice. Placing errors in the BMF letter's categories is a reading aid.

## Which edge cases does it handle?

**The edge cases (6)**

- An XRechnung CreditNote, a CVD invoice and an XRechnung Extension each run under their own KoSIT scenario.
- A Peppol BIS Billing 3.0 file has no KoSIT scenario: the EN 16931 rules for UBL run, and the answer says no KoSIT scenario was used.
- A ZUGFeRD MINIMUM or BASIC WL file is read and checked, and the answer says the profile does not count as an e-invoice.
- A ZUGFeRD 1.0 file is named, not checked, and no PDF is made for it.
- A PDF with no embedded invoice, or an encrypted PDF, is refused with the reason.
- A rule that cannot be evaluated on a file is reported as a finding with a note, never silently passed.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**An XRechnung 3.0 (UBL) with no Leitweg-ID and a line total that does not add up**

An XRechnung 3.0 (UBL) with no Leitweg-ID and a line total that does not add up

| Result | Value |
| --- | --- |
| profile | XRechnung 3.0 |
| scenario | EN16931 XRechnung (UBL Invoice) |
| status | invalid |
| errors | 3 |
| rules that failed | BR-CO-10, BR-CO-13, BR-DE-15 |
| BMF kinds | 2 content, 1 business rule, 0 format |
| checks run | 985 |

**The input**

```json
op: "validate"
xml: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<ubl:Invoice xmlns:ubl=\"urn:oasis:names:specification:ubl:schema:xsd:Invoice-2\"\n             xmlns:cac=\"urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2\"\n             xmlns:cbc=\"urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2\">\n    <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0</cbc:CustomizationID>\n    <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>\n    <cbc:ID>RE-2026-0417</cbc:ID>\n    <cbc:IssueDate>2026-11-02</cbc:IssueDate>\n    <cbc:DueDate>2026-12-02</cbc:DueDate>\n    <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>\n    <cbc:Note>Musterrechnung für die Endwise-Seiten. Alle Firmen, Namen und Nummern sind erfunden.</cbc:Note>\n    <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>\n    \n    <cac:OrderReference>\n        <cbc:ID>4500012345</cbc:ID>\n    </cac:OrderReference>\n    <cac:AccountingSupplierParty>\n        <cac:Party>\n            <cbc:EndpointID schemeID=\"EM\">rechnung@muster-elektro.example</cbc:EndpointID>\n            <cac:PartyName>\n                <cbc:Name>Muster Elektro</cbc:Name>\n            </cac:PartyName>\n            <cac:PostalAddress>\n                <cbc:StreetName>Hauptstraße 12</cbc:StreetName>\n                <cbc:CityName>Stuttgart</cbc:CityName>\n                <cbc:PostalZone>70173</cbc:PostalZone>\n                <cac:Country>\n                    <cbc:IdentificationCode>DE</cbc:IdentificationCode>\n                </cac:Country>\n            </cac:PostalAddress>\n            <cac:PartyTaxScheme>\n                <cbc:CompanyID>DE123456789</cbc:CompanyID>\n                <cac:TaxScheme>\n                    <cbc:ID>VAT</cbc:ID>\n                </cac:TaxScheme>\n            </cac:PartyTaxScheme>\n            <cac:PartyLegalEntity>\n                <cbc:RegistrationName>Muster Elektro GmbH</cbc:RegistrationName>\n                <cbc:CompanyID>HRB 700001</cbc:CompanyID>\n                <cbc:CompanyLegalForm>Amtsgericht Stuttgart, Geschäftsführerin Anna Beispiel</cbc:CompanyLegalForm>\n            </cac:PartyLegalEntity>\n            <cac:Contact>\n                <cbc:Name>Anna Beispiel</cbc:Name>\n                <cbc:Telephone>+49 711 123456</cbc:Telephone>\n                <cbc:ElectronicMail>rechnung@muster-elektro.example</cbc:ElectronicMail>\n            </cac:Contact>\n        </cac:Party>\n    </cac:AccountingSupplierParty>\n    <cac:AccountingCustomerParty>\n        <cac:Party>\n            <cbc:EndpointID schemeID=\"EM\">eingangsrechnung@musterstadt.example</cbc:EndpointID>\n            <cac:PostalAddress>\n                <cbc:StreetName>Rathausplatz 1</cbc:StreetName>\n                <cbc:CityName>Musterstadt</cbc:CityName>\n                <cbc:PostalZone>12345</cbc:PostalZone>\n                <cac:Country>\n                    <cbc:IdentificationCode>DE</cbc:IdentificationCode>\n                </cac:Country>\n            </cac:PostalAddress>\n            <cac:PartyLegalEntity>\n                <cbc:RegistrationName>Stadt Musterstadt, Hochbauamt</cbc:RegistrationName>\n            </cac:PartyLegalEntity>\n        </cac:Party>\n    </cac:AccountingCustomerParty>\n    <cac:Delivery>\n        <cbc:ActualDeliveryDate>2026-10-28</cbc:ActualDeliveryDate>\n    </cac:Delivery>\n    <cac:PaymentMeans>\n        <cbc:PaymentMeansCode>58</cbc:PaymentMeansCode>\n        <cbc:PaymentID>RE-2026-0417</cbc:PaymentID>\n        <cac:PayeeFinancialAccount>\n            <cbc:ID>DE79000000001234567890</cbc:ID>\n            <cbc:Name>Muster Elektro GmbH</cbc:Name>\n        </cac:PayeeFinancialAccount>\n    </cac:PaymentMeans>\n    <cac:PaymentTerms>\n        <cbc:Note>Zahlbar bis 02.12.2026 ohne Abzug.</cbc:Note>\n    </cac:PaymentTerms>\n    <cac:TaxTotal>\n        <cbc:TaxAmount currencyID=\"EUR\">113.48</cbc:TaxAmount>\n        <cac:TaxSubtotal>\n            <cbc:TaxableAmount currencyID=\"EUR\">582.60</cbc:TaxableAmount>\n            <cbc:TaxAmount currencyID=\"EUR\">110.69</cbc:TaxAmount>\n            <cac:TaxCategory>\n                <cbc:ID>S</cbc:ID>\n                <cbc:Percent>19</cbc:Percent>\n                <cac:TaxScheme>\n                    <cbc:ID>VAT</cbc:ID>\n                </cac:TaxScheme>\n            </cac:TaxCategory>\n        </cac:TaxSubtotal>\n        <cac:TaxSubtotal>\n            <cbc:TaxableAmount currencyID=\"EUR\">39.90</cbc:TaxableAmount>\n            <cbc:TaxAmount currencyID=\"EUR\">2.79</cbc:TaxAmount>\n            <cac:TaxCategory>\n                <cbc:ID>S</cbc:ID>\n                <cbc:Percent>7</cbc:Percent>\n                <cac:TaxScheme>\n                    <cbc:ID>VAT</cbc:ID>\n                </cac:TaxScheme>\n            </cac:TaxCategory>\n        </cac:TaxSubtotal>\n    </cac:TaxTotal>\n    <cac:LegalMonetaryTotal>\n        <cbc:LineExtensionAmount currencyID=\"EUR\">622.40</cbc:LineExtensionAmount>\n        <cbc:TaxExclusiveAmount currencyID=\"EUR\">622.50</cbc:TaxExclusiveAmount>\n        <cbc:TaxInclusiveAmount currencyID=\"EUR\">735.98</cbc:TaxInclusiveAmount>\n        <cbc:PayableAmount currencyID=\"EUR\">735.98</cbc:PayableAmount>\n    </cac:LegalMonetaryTotal>\n    <cac:InvoiceLine>\n        <cbc:ID>1</cbc:ID>\n        <cbc:InvoicedQuantity unitCode=\"HUR\">6</cbc:InvoicedQuantity>\n        <cbc:LineExtensionAmount currencyID=\"EUR\">411.00</cbc:LineExtensionAmount>\n        <cac:Item>\n            <cbc:Description>Unterverteilung im Erdgeschoss erneuert, Montage und Prüfung</cbc:Description>\n            <cbc:Name>Elektroinstallation, Arbeitsstunden</cbc:Name>\n            <cac:SellersItemIdentification>\n                <cbc:ID>L-100</cbc:ID>\n            </cac:SellersItemIdentification>\n            <cac:ClassifiedTaxCategory>\n                <cbc:ID>S</cbc:ID>\n                <cbc:Percent>19</cbc:Percent>\n                <cac:TaxScheme>\n                    <cbc:ID>VAT</cbc:ID>\n                </cac:TaxScheme>\n            </cac:ClassifiedTaxCategory>\n        </cac:Item>\n        <cac:Price>\n            <cbc:PriceAmount currencyID=\"EUR\">68.50</cbc:PriceAmount>\n        </cac:Price>\n    </cac:InvoiceLine>\n    <cac:InvoiceLine>\n        <cbc:ID>2</cbc:ID>\n        <cbc:InvoicedQuantity unitCode=\"H87\">4</cbc:InvoicedQuantity>\n        <cbc:LineExtensionAmount currencyID=\"EUR\">171.60</cbc:LineExtensionAmount>\n        <cac:Item>\n            <cbc:Name>Fehlerstromschutzschalter 40 A</cbc:Name>\n            <cac:SellersItemIdentification>\n                <cbc:ID>FI-40</cbc:ID>\n            </cac:SellersItemIdentification>\n            <cac:ClassifiedTaxCategory>\n                <cbc:ID>S</cbc:ID>\n                <cbc:Percent>19</cbc:Percent>\n                <cac:TaxScheme>\n                    <cbc:ID>VAT</cbc:ID>\n                </cac:TaxScheme>\n            </cac:ClassifiedTaxCategory>\n        </cac:Item>\n        <cac:Price>\n            <cbc:PriceAmount currencyID=\"EUR\">42.90</cbc:PriceAmount>\n        </cac:Price>\n    </cac:InvoiceLine>\n    <cac:InvoiceLine>\n        <cbc:ID>3</cbc:ID>\n        <cbc:InvoicedQuantity unitCode=\"H87\">1</cbc:InvoicedQuantity>\n        <cbc:LineExtensionAmount currencyID=\"EUR\">39.90</cbc:LineExtensionAmount>\n        <cac:Item>\n            <cbc:Name>Fachbuch Elektroinstallation</cbc:Name>\n            <cac:SellersItemIdentification>\n                <cbc:ID>B-7</cbc:ID>\n            </cac:SellersItemIdentification>\n            <cac:ClassifiedTaxCategory>\n                <cbc:ID>S</cbc:ID>\n                <cbc:Percent>7</cbc:Percent>\n                <cac:TaxScheme>\n                    <cbc:ID>VAT</cbc:ID>\n                </cac:TaxScheme>\n            </cac:ClassifiedTaxCategory>\n        </cac:Item>\n        <cac:Price>\n            <cbc:PriceAmount currencyID=\"EUR\">39.90</cbc:PriceAmount>\n        </cac:Price>\n    </cac:InvoiceLine>\n</ubl:Invoice>\n"
```

**More worked examples (2)**

**A ZUGFeRD PDF (EN 16931 profile) read as business terms**

A ZUGFeRD PDF (EN 16931 profile) read as business terms

| Result | Value |
| --- | --- |
| profile | ZUGFeRD / Factur-X EN 16931 |
| attachment | factur-x.xml |
| invoice | RE-2026-0418 |
| total | 461.24 EUR |
| lines | 2 |

**The input**

```json
op: "view"
file: "JVBERi0xLjcKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgL05hbWVzIDw8IC9FbWJlZGRlZEZpbGVzIDw8IC9OYW1lcyBbKGZhY3R1ci14LnhtbCkgNyAwIFJdID4+ID4+IC9BRiBbNyAwIFJdID4+CmVuZG9iagoyIDAgb2JqCjw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNTk1IDg0Ml0gL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gL0NvbnRlbnRzIDQgMCBSID4+CmVuZG9iago0IDAgb2JqCjw8IC9MZW5ndGggNDk2ID4+CnN0cmVhbQpCVCAvRjEgMTYgVGYgNDIgNzkwIFRkIChSZWNobnVuZyBSRS0yMDI2LTA0MTgpIFRqIEVUCkJUIC9GMSAxMCBUZiA0MiA3NzIgVGQgKE11c3RlciBIYXVzdGVjaG5payBHbWJILCBNYXJrdHN0cmFcMzM3ZSA1LCA4MDMzMSBNXDM3NG5jaGVuKSBUaiBFVApCVCAvRjEgMTAgVGYgNDIgNzU0IFRkIChBbjogQmVpc3BpZWwgQlwzNzRyb2dlYlwzNDR1ZGUgS0csIE11c3RlcndlZyAzLCAxMDExNSBCZXJsaW4pIFRqIEVUCkJUIC9GMSAxMCBUZiA0MiA3MzYgVGQgKFdhcnR1bmcgTFwzNzRmdHVuZ3NhbmxhZ2UgMjQwLDAwIEVVUjsgOCBMdWZ0ZmlsdGVyIEc0IGplIDE4LDQ1IEVVUikgVGogRVQKQlQgL0YxIDEwIFRmIDQyIDcxOCBUZCAoTmV0dG8gMzg3LDYwIEVVUiwgVVN0LiAxOSAlIDczLDY0IEVVUiwgR2VzYW10IDQ2MSwyNCBFVVIpIFRqIEVUCkJUIC9GMSAxMCBUZiA0MiA3MDAgVGQgKE11c3RlcnJlY2hudW5nOyBhbGxlIEFuZ2FiZW4gc2luZCBlcmZ1bmRlbi4pIFRqIEVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgPj4KZW5kb2JqCjYgMCBvYmoKPDwgL1R5cGUgL0VtYmVkZGVkRmlsZSAvU3VidHlwZSAvdGV4dCMyRnhtbCAvTGVuZ3RoIDc0ODYgL1BhcmFtcyA8PCAvU2l6ZSA3NDg2ID4+ID4+CnN0cmVhbQo8P3htbCB2ZXJzaW9uPSIxLjAiIGVuY29kaW5nPSJVVEYtOCI/Pgo8cnNtOkNyb3NzSW5kdXN0cnlJbnZvaWNlIHhtbG5zOnJzbT0idXJuOnVuOnVuZWNlOnVuY2VmYWN0OmRhdGE6c3RhbmRhcmQ6Q3Jvc3NJbmR1c3RyeUludm9pY2U6MTAwIgogICAgeG1sbnM6cmFtPSJ1cm46dW46dW5lY2U6dW5jZWZhY3Q6ZGF0YTpzdGFuZGFyZDpSZXVzYWJsZUFnZ3JlZ2F0ZUJ1c2luZXNzSW5mb3JtYXRpb25FbnRpdHk6MTAwIgogICAgeG1sbnM6cWR0PSJ1cm46dW46dW5lY2U6dW5jZWZhY3Q6ZGF0YTpzdGFuZGFyZDpRdWFsaWZpZWREYXRhVHlwZToxMDAiCiAgICB4bWxuczp1ZHQ9InVybjp1bjp1bmVjZTp1bmNlZmFjdDpkYXRhOnN0YW5kYXJkOlVucXVhbGlmaWVkRGF0YVR5cGU6MTAwIj4KICA8cnNtOkV4Y2hhbmdlZERvY3VtZW50Q29udGV4dD4KICAgIDxyYW06R3VpZGVsaW5lU3BlY2lmaWVkRG9jdW1lbnRDb250ZXh0UGFyYW1ldGVyPgogICAgICA8cmFtOklEPnVybjpjZW4uZXU6ZW4xNjkzMToyMDE3PC9yYW06SUQ+CiAgICA8L3JhbTpHdWlkZWxpbmVTcGVjaWZpZWREb2N1bWVudENvbnRleHRQYXJhbWV0ZXI+CiAgPC9yc206RXhjaGFuZ2VkRG9jdW1lbnRDb250ZXh0PgogIDxyc206RXhjaGFuZ2VkRG9jdW1lbnQ+CiAgICA8cmFtOklEPlJFLTIwMjYtMDQxODwvcmFtOklEPgogICAgPHJhbTpUeXBlQ29kZT4zODA8L3JhbTpUeXBlQ29kZT4KICAgIDxyYW06SXNzdWVEYXRlVGltZT4KICAgICAgPHVkdDpEYXRlVGltZVN0cmluZyBmb3JtYXQ9IjEwMiI+MjAyNjExMDM8L3VkdDpEYXRlVGltZVN0cmluZz4KICAgIDwvcmFtOklzc3VlRGF0ZVRpbWU+CiAgICA8cmFtOkluY2x1ZGVkTm90ZT4KICAgICAgPHJhbTpDb250ZW50Pk11c3RlcnJlY2hudW5nIGbDvHIgZGllIEVuZHdpc2UtU2VpdGVuLiBBbGxlIEZpcm1lbiwgTmFtZW4gdW5kIE51bW1lcm4gc2luZCBlcmZ1bmRlbi48L3JhbTpDb250ZW50PgogICAgPC9yYW06SW5jbHVkZWROb3RlPgogIDwvcnNtOkV4Y2hhbmdlZERvY3VtZW50PgogIDxyc206U3VwcGx5Q2hhaW5UcmFkZVRyYW5zYWN0aW9uPgogICAgPHJhbTpJbmNsdWRlZFN1cHBseUNoYWluVHJhZGVMaW5lSXRlbT4KICAgICAgPHJhbTpBc3NvY2lhdGVkRG9jdW1lbnRMaW5lRG9jdW1lbnQ+CiAgICAgICAgPHJhbTpMaW5lSUQ+MTwvcmFtOkxpbmVJRD4KICAgICAgPC9yYW06QXNzb2NpYXRlZERvY3VtZW50TGluZURvY3VtZW50PgogICAgICA8cmFtOlNwZWNpZmllZFRyYWRlUHJvZHVjdD4KICAgICAgICA8cmFtOlNlbGxlckFzc2lnbmVkSUQ+V1MtMTI8L3JhbTpTZWxsZXJBc3NpZ25lZElEPgogICAgICAgIDxyYW06TmFtZT5XYXJ0dW5nIEzDvGZ0dW5nc2FubGFnZSwgUGF1c2NoYWxlPC9yYW06TmFtZT4KICAgICAgPC9yYW06U3BlY2lmaWVkVHJhZGVQcm9kdWN0PgogICAgICA8cmFtOlNwZWNpZmllZExpbmVUcmFkZUFncmVlbWVudD4KICAgICAgICA8cmFtOk5ldFByaWNlUHJvZHVjdFRyYWRlUHJpY2U+CiAgICAgICAgICA8cmFtOkNoYXJnZUFtb3VudD4yNDAuMDA8L3JhbTpDaGFyZ2VBbW91bnQ+CiAgICAgICAgPC9yYW06TmV0UHJpY2VQcm9kdWN0VHJhZGVQcmljZT4KICAgICAgPC9yYW06U3BlY2lmaWVkTGluZVRyYWRlQWdyZWVtZW50PgogICAgICA8cmFtOlNwZWNpZmllZExpbmVUcmFkZURlbGl2ZXJ5PgogICAgICAgIDxyYW06QmlsbGVkUXVhbnRpdHkgdW5pdENvZGU9IkM2MiI+MTwvcmFtOkJpbGxlZFF1YW50aXR5PgogICAgICA8L3JhbTpTcGVjaWZpZWRMaW5lVHJhZGVEZWxpdmVyeT4KICAgICAgPHJhbTpTcGVjaWZpZWRMaW5lVHJhZGVTZXR0bGVtZW50PgogICAgICAgIDxyYW06QXBwbGljYWJsZVRyYWRlVGF4PgogICAgICAgICAgPHJhbTpUeXBlQ29kZT5WQVQ8L3JhbTpUeXBlQ29kZT4KICAgICAgICAgIDxyYW06Q2F0ZWdvcnlDb2RlPlM8L3JhbTpDYXRlZ29yeUNvZGU+CiAgICAgICAgICA8cmFtOlJhdGVBcHBsaWNhYmxlUGVyY2VudD4xOTwvcmFtOlJhdGVBcHBsaWNhYmxlUGVyY2VudD4KICAgICAgICA8L3JhbTpBcHBsaWNhYmxlVHJhZGVUYXg+CiAgICAgICAgPHJhbTpTcGVjaWZpZWRUcmFkZVNldHRsZW1lbnRMaW5lTW9uZXRhcnlTdW1tYXRpb24+CiAgICAgICAgICA8cmFtOkxpbmVUb3RhbEFtb3VudD4yNDAuMDA8L3JhbTpMaW5lVG90YWxBbW91bnQ+CiAgICAgICAgPC9yYW06U3BlY2lmaWVkVHJhZGVTZXR0bGVtZW50TGluZU1vbmV0YXJ5U3VtbWF0aW9uPgogICAgICA8L3JhbTpTcGVjaWZpZWRMaW5lVHJhZGVTZXR0bGVtZW50PgogICAgPC9yYW06SW5jbHVkZWRTdXBwbHlDaGFpblRyYWRlTGluZUl0ZW0+CiAgICA8cmFtOkluY2x1ZGVkU3VwcGx5Q2hhaW5UcmFkZUxpbmVJdGVtPgogICAgICA8cmFtOkFzc29jaWF0ZWREb2N1bWVudExpbmVEb2N1bWVudD4KICAgICAgICA8cmFtOkxpbmVJRD4yPC9yYW06TGluZUlEPgogICAgICA8L3JhbTpBc3NvY2lhdGVkRG9jdW1lbnRMaW5lRG9jdW1lbnQ+CiAgICAgIDxyYW06U3BlY2lmaWVkVHJhZGVQcm9kdWN0PgogICAgICAgIDxyYW06U2VsbGVyQXNzaWduZWRJRD5GLUc0PC9yYW06U2VsbGVyQXNzaWduZWRJRD4KICAgICAgICA8cmFtOk5hbWU+THVmdGZpbHRlciBHNDwvcmFtOk5hbWU+CiAgICAgIDwvcmFtOlNwZWNpZmllZFRyYWRlUHJvZHVjdD4KICAgICAgPHJhbTpTcGVjaWZpZWRMaW5lVHJhZGVBZ3JlZW1lbnQ+CiAgICAgICAgPHJhbTpOZXRQcmljZVByb2R1Y3RUcmFkZVByaWNlPgogICAgICAgICAgPHJhbTpDaGFyZ2VBbW91bnQ+MTguNDU8L3JhbTpDaGFyZ2VBbW91bnQ+CiAgICAgICAgPC9yYW06TmV0UHJpY2VQcm9kdWN0VHJhZGVQcmljZT4KICAgICAgPC9yYW06U3BlY2lmaWVkTGluZVRyYWRlQWdyZWVtZW50PgogICAgICA8cmFtOlNwZWNpZmllZExpbmVUcmFkZURlbGl2ZXJ5PgogICAgICAgIDxyYW06QmlsbGVkUXVhbnRpdHkgdW5pdENvZGU9Ikg4NyI+ODwvcmFtOkJpbGxlZFF1YW50aXR5PgogICAgICA8L3JhbTpTcGVjaWZpZWRMaW5lVHJhZGVEZWxpdmVyeT4KICAgICAgPHJhbTpTcGVjaWZpZWRMaW5lVHJhZGVTZXR0bGVtZW50PgogICAgICAgIDxyYW06QXBwbGljYWJsZVRyYWRlVGF4PgogICAgICAgICAgPHJhbTpUeXBlQ29kZT5WQVQ8L3JhbTpUeXBlQ29kZT4KICAgICAgICAgIDxyYW06Q2F0ZWdvcnlDb2RlPlM8L3JhbTpDYXRlZ29yeUNvZGU+CiAgICAgICAgICA8cmFtOlJhdGVBcHBsaWNhYmxlUGVyY2VudD4xOTwvcmFtOlJhdGVBcHBsaWNhYmxlUGVyY2VudD4KICAgICAgICA8L3JhbTpBcHBsaWNhYmxlVHJhZGVUYXg+CiAgICAgICAgPHJhbTpTcGVjaWZpZWRUcmFkZVNldHRsZW1lbnRMaW5lTW9uZXRhcnlTdW1tYXRpb24+CiAgICAgICAgICA8cmFtOkxpbmVUb3RhbEFtb3VudD4xNDcuNjA8L3JhbTpMaW5lVG90YWxBbW91bnQ+CiAgICAgICAgPC9yYW06U3BlY2lmaWVkVHJhZGVTZXR0bGVtZW50TGluZU1vbmV0YXJ5U3VtbWF0aW9uPgogICAgICA8L3JhbTpTcGVjaWZpZWRMaW5lVHJhZGVTZXR0bGVtZW50PgogICAgPC9yYW06SW5jbHVkZWRTdXBwbHlDaGFpblRyYWRlTGluZUl0ZW0+CiAgICA8cmFtOkFwcGxpY2FibGVIZWFkZXJUcmFkZUFncmVlbWVudD4KICAgICAgPHJhbTpCdXllclJlZmVyZW5jZT5Lb3N0ZW5zdGVsbGUgNDcxMTwvcmFtOkJ1eWVyUmVmZXJlbmNlPgogICAgICA8cmFtOlNlbGxlclRyYWRlUGFydHk+CiAgICAgICAgPHJhbTpOYW1lPk11c3RlciBIYXVzdGVjaG5payBHbWJIPC9yYW06TmFtZT4KICAgICAgICA8cmFtOlNwZWNpZmllZExlZ2FsT3JnYW5pemF0aW9uPgogICAgICAgICAgPHJhbTpJRD5IUkIgODAwMDAyPC9yYW06SUQ+CiAgICAgICAgPC9yYW06U3BlY2lmaWVkTGVnYWxPcmdhbml6YXRpb24+CiAgICAgICAgPHJhbTpEZWZpbmVkVHJhZGVDb250YWN0PgogICAgICAgICAgPHJhbTpQZXJzb25OYW1lPkpvbmFzIFByb2JlPC9yYW06UGVyc29uTmFtZT4KICAgICAgICAgIDxyYW06VGVsZXBob25lVW5pdmVyc2FsQ29tbXVuaWNhdGlvbj4KICAgICAgICAgICAgPHJhbTpDb21wbGV0ZU51bWJlcj4rNDkgODkgNzY1NDMyPC9yYW06Q29tcGxldGVOdW1iZXI+CiAgICAgICAgICA8L3JhbTpUZWxlcGhvbmVVbml2ZXJzYWxDb21tdW5pY2F0aW9uPgogICAgICAgICAgPHJhbTpFbWFpbFVSSVVuaXZlcnNhbENvbW11bmljYXRpb24+CiAgICAgICAgICAgIDxyYW06VVJJSUQ+YnVjaGhhbHR1bmdAbXVzdGVyLWhhdXN0ZWNobmlrLmV4YW1wbGU8L3JhbTpVUklJRD4KICAgICAgICAgIDwvcmFtOkVtYWlsVVJJVW5pdmVyc2FsQ29tbXVuaWNhdGlvbj4KICAgICAgICA8L3JhbTpEZWZpbmVkVHJhZGVDb250YWN0PgogICAgICAgIDxyYW06UG9zdGFsVHJhZGVBZGRyZXNzPgogICAgICAgICAgPHJhbTpQb3N0Y29kZUNvZGU+ODAzMzE8L3JhbTpQb3N0Y29kZUNvZGU+CiAgICAgICAgICA8cmFtOkxpbmVPbmU+TWFya3RzdHJhw59lIDU8L3JhbTpMaW5lT25lPgogICAgICAgICAgPHJhbTpDaXR5TmFtZT5Nw7xuY2hlbjwvcmFtOkNpdHlOYW1lPgogICAgICAgICAgPHJhbTpDb3VudHJ5SUQ+REU8L3JhbTpDb3VudHJ5SUQ+CiAgICAgICAgPC9yYW06UG9zdGFsVHJhZGVBZGRyZXNzPgogICAgICAgIDxyYW06VVJJVW5pdmVyc2FsQ29tbXVuaWNhdGlvbj4KICAgICAgICAgIDxyYW06VVJJSUQgc2NoZW1lSUQ9IkVNIj5idWNoaGFsdHVuZ0BtdXN0ZXItaGF1c3RlY2huaWsuZXhhbXBsZTwvcmFtOlVSSUlEPgogICAgICAgIDwvcmFtOlVSSVVuaXZlcnNhbENvbW11bmljYXRpb24+CiAgICAgICAgPHJhbTpTcGVjaWZpZWRUYXhSZWdpc3RyYXRpb24+CiAgICAgICAgICA8cmFtOklEIHNjaGVtZUlEPSJWQSI+REU5ODc2NTQzMjE8L3JhbTpJRD4KICAgICAgICA8L3JhbTpTcGVjaWZpZWRUYXhSZWdpc3RyYXRpb24+CiAgICAgIDwvcmFtOlNlbGxlclRyYWRlUGFydHk+CiAgICAgIDxyYW06QnV5ZXJUcmFkZVBhcnR5PgogICAgICAgIDxyYW06TmFtZT5CZWlzcGllbCBCw7xyb2dlYsOkdWRlIEtHPC9yYW06TmFtZT4KICAgICAgICA8cmFtOlBvc3RhbFRyYWRlQWRkcmVzcz4KICAgICAgICAgIDxyYW06UG9zdGNvZGVDb2RlPjEwMTE1PC9yYW06UG9zdGNvZGVDb2RlPgogICAgICAgICAgPHJhbTpMaW5lT25lPk11c3RlcndlZyAzPC9yYW06TGluZU9uZT4KICAgICAgICAgIDxyYW06Q2l0eU5hbWU+QmVybGluPC9yYW06Q2l0eU5hbWU+CiAgICAgICAgICA8cmFtOkNvdW50cnlJRD5ERTwvcmFtOkNvdW50cnlJRD4KICAgICAgICA8L3JhbTpQb3N0YWxUcmFkZUFkZHJlc3M+CiAgICAgICAgPHJhbTpVUklVbml2ZXJzYWxDb21tdW5pY2F0aW9uPgogICAgICAgICAgPHJhbTpVUklJRCBzY2hlbWVJRD0iRU0iPnJlY2hudW5nc2VpbmdhbmdAYmVpc3BpZWwtYnVlcm8uZXhhbXBsZTwvcmFtOlVSSUlEPgogICAgICAgIDwvcmFtOlVSSVVuaXZlcnNhbENvbW11bmljYXRpb24+CiAgICAgIDwvcmFtOkJ1eWVyVHJhZGVQYXJ0eT4KICAgIDwvcmFtOkFwcGxpY2FibGVIZWFkZXJUcmFkZUFncmVlbWVudD4KICAgIDxyYW06QXBwbGljYWJsZUhlYWRlclRyYWRlRGVsaXZlcnk+CiAgICAgIDxyYW06QWN0dWFsRGVsaXZlcnlTdXBwbHlDaGFpbkV2ZW50PgogICAgICAgIDxyYW06T2NjdXJyZW5jZURhdGVUaW1lPgogICAgICAgICAgPHVkdDpEYXRlVGltZVN0cmluZyBmb3JtYXQ9IjEwMiI+MjAyNjEwMzA8L3VkdDpEYXRlVGltZVN0cmluZz4KICAgICAgICA8L3JhbTpPY2N1cnJlbmNlRGF0ZVRpbWU+CiAgICAgIDwvcmFtOkFjdHVhbERlbGl2ZXJ5U3VwcGx5Q2hhaW5FdmVudD4KICAgIDwvcmFtOkFwcGxpY2FibGVIZWFkZXJUcmFkZURlbGl2ZXJ5PgogICAgPHJhbTpBcHBsaWNhYmxlSGVhZGVyVHJhZGVTZXR0bGVtZW50PgogICAgICA8cmFtOlBheW1lbnRSZWZlcmVuY2U+UkUtMjAyNi0wNDE4PC9yYW06UGF5bWVudFJlZmVyZW5jZT4KICAgICAgPHJhbTpJbnZvaWNlQ3VycmVuY3lDb2RlPkVVUjwvcmFtOkludm9pY2VDdXJyZW5jeUNvZGU+CiAgICAgIDxyYW06U3BlY2lmaWVkVHJhZGVTZXR0bGVtZW50UGF5bWVudE1lYW5zPgogICAgICAgIDxyYW06VHlwZUNvZGU+NTg8L3JhbTpUeXBlQ29kZT4KICAgICAgICA8cmFtOlBheWVlUGFydHlDcmVkaXRvckZpbmFuY2lhbEFjY291bnQ+CiAgICAgICAgICA8cmFtOklCQU5JRD5ERTc5MDAwMDAwMDAxMjM0NTY3ODkwPC9yYW06SUJBTklEPgogICAgICAgICAgPHJhbTpBY2NvdW50TmFtZT5NdXN0ZXIgSGF1c3RlY2huaWsgR21iSDwvcmFtOkFjY291bnROYW1lPgogICAgICAgIDwvcmFtOlBheWVlUGFydHlDcmVkaXRvckZpbmFuY2lhbEFjY291bnQ+CiAgICAgIDwvcmFtOlNwZWNpZmllZFRyYWRlU2V0dGxlbWVudFBheW1lbnRNZWFucz4KICAgICAgPHJhbTpBcHBsaWNhYmxlVHJhZGVUYXg+CiAgICAgICAgPHJhbTpDYWxjdWxhdGVkQW1vdW50PjczLjY0PC9yYW06Q2FsY3VsYXRlZEFtb3VudD4KICAgICAgICA8cmFtOlR5cGVDb2RlPlZBVDwvcmFtOlR5cGVDb2RlPgogICAgICAgIDxyYW06QmFzaXNBbW91bnQ+Mzg3LjYwPC9yYW06QmFzaXNBbW91bnQ+CiAgICAgICAgPHJhbTpDYXRlZ29yeUNvZGU+UzwvcmFtOkNhdGVnb3J5Q29kZT4KICAgICAgICA8cmFtOlJhdGVBcHBsaWNhYmxlUGVyY2VudD4xOTwvcmFtOlJhdGVBcHBsaWNhYmxlUGVyY2VudD4KICAgICAgPC9yYW06QXBwbGljYWJsZVRyYWRlVGF4PgogICAgICA8cmFtOlNwZWNpZmllZFRyYWRlUGF5bWVudFRlcm1zPgogICAgICAgIDxyYW06RGVzY3JpcHRpb24+WmFobGJhciBpbm5lcmhhbGIgdm9uIDE0IFRhZ2VuIG9obmUgQWJ6dWcuPC9yYW06RGVzY3JpcHRpb24+CiAgICAgICAgPHJhbTpEdWVEYXRlRGF0ZVRpbWU+CiAgICAgICAgICA8dWR0OkRhdGVUaW1lU3RyaW5nIGZvcm1hdD0iMTAyIj4yMDI2MTExNzwvdWR0OkRhdGVUaW1lU3RyaW5nPgogICAgICAgIDwvcmFtOkR1ZURhdGVEYXRlVGltZT4KICAgICAgPC9yYW06U3BlY2lmaWVkVHJhZGVQYXltZW50VGVybXM+CiAgICAgIDxyYW06U3BlY2lmaWVkVHJhZGVTZXR0bGVtZW50SGVhZGVyTW9uZXRhcnlTdW1tYXRpb24+CiAgICAgICAgPHJhbTpMaW5lVG90YWxBbW91bnQ+Mzg3LjYwPC9yYW06TGluZVRvdGFsQW1vdW50PgogICAgICAgIDxyYW06VGF4QmFzaXNUb3RhbEFtb3VudD4zODcuNjA8L3JhbTpUYXhCYXNpc1RvdGFsQW1vdW50PgogICAgICAgIDxyYW06VGF4VG90YWxBbW91bnQgY3VycmVuY3lJRD0iRVVSIj43My42NDwvcmFtOlRheFRvdGFsQW1vdW50PgogICAgICAgIDxyYW06R3JhbmRUb3RhbEFtb3VudD40NjEuMjQ8L3JhbTpHcmFuZFRvdGFsQW1vdW50PgogICAgICAgIDxyYW06RHVlUGF5YWJsZUFtb3VudD40NjEuMjQ8L3JhbTpEdWVQYXlhYmxlQW1vdW50PgogICAgICA8L3JhbTpTcGVjaWZpZWRUcmFkZVNldHRsZW1lbnRIZWFkZXJNb25ldGFyeVN1bW1hdGlvbj4KICAgIDwvcmFtOkFwcGxpY2FibGVIZWFkZXJUcmFkZVNldHRsZW1lbnQ+CiAgPC9yc206U3VwcGx5Q2hhaW5UcmFkZVRyYW5zYWN0aW9uPgo8L3JzbTpDcm9zc0luZHVzdHJ5SW52b2ljZT4KCmVuZHN0cmVhbQplbmRvYmoKNyAwIG9iago8PCAvVHlwZSAvRmlsZXNwZWMgL0YgKGZhY3R1ci14LnhtbCkgL1VGIChmYWN0dXIteC54bWwpIC9BRlJlbGF0aW9uc2hpcCAvQWx0ZXJuYXRpdmUgL0VGIDw8IC9GIDYgMCBSIC9VRiA2IDAgUiA+PiA+PgplbmRvYmoKeHJlZgowIDgKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAxMzQgMDAwMDAgbiAKMDAwMDAwMDE5MSAwMDAwMCBuIAowMDAwMDAwMzE3IDAwMDAwIG4gCjAwMDAwMDA4NjQgMDAwMDAgbiAKMDAwMDAwMDk2MSAwMDAwMCBuIAowMDAwMDA4NTY1IDAwMDAwIG4gCnRyYWlsZXIKPDwgL1NpemUgOCAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKODY5NwolJUVPRgo="
```

**What BR-DE-15 means**

What BR-DE-15 means

| Result | Value |
| --- | --- |
| rule | BR-DE-15 |
| source | XRechnung-Schematron 2.6.0 (KoSIT) |
| level | error |

**The input**

```json
{
  "op": "explain",
  "rule": "br-de-15"
}
```

## How is it tested?

**What its test suite asserts (3)**

- The bundled rule files are the KoSIT configuration 2026-08-31 (XRechnung 3.0.2), XRechnung schematron 2.6.0 and CEN EN 16931 schematron 1.3.16, with their licences.
- The KoSIT test suite files and the samples pass under their own scenarios, with the levels scenarios.xml sets; the failing sample gives BR-CO-10, BR-CO-13 and BR-DE-15.
- Every rule page's demonstration fires its rule on a changed sample that passed before; XML with a DOCTYPE is refused.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the XRechnung and ZUGFeRD viewer and validator tool](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/).

## Questions

### Is there any AI in the xrechnung and zugferd viewer and validator answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the xrechnung and zugferd viewer and validator refuse to answer?

It runs the schematron rules only: the XML Schema (XSD) step the KoSIT validator also runs, and PDF/A conformance, are not checked. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the XRechnung and ZUGFeRD viewer and validator tool](https://krishnachagti-sudo.github.io/toll-preview/xrechnung-viewer/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/xrechnung-viewer/  
Data as of: 2026-11-04
