# How the WARN Act checker works: sites, windows, notice

Federal WARN covers an employer with 100 or more full-time employees; a plant closing is 50 or more full-time losses at a site in 30 days, and a mass layoff is 50 or more that are at least 33% of the site, or 500 or more, in 30 days or added up over 90. Each group gets 60 days' notice before its own date.

## What does the warn act checker compute?

Given each site with its state, headcount and dated employment losses (or a whole employee list), the tool checks the layoff site by site against the federal WARN Act (20 CFR Part 639) and the state laws of Cal-WARN, NY WARN, NJ WARN, Illinois WARN, Iowa WARN, Maine 625-B, Maryland ESA, Delaware WARN, Washington WARN and Tennessee 50-1-601: whether the employer is covered, whether a plant closing or mass layoff is triggered in a rolling window, who must get notice, and the last day to send it for each separation date. It also works out the back pay, and New Jersey or Maine severance, if notice is short.

Operations (the op field):

- `check`: Returns, for each site, every law with its covered-employer test, whether it is triggered and by what, the window and the losses in it, and each group's notice-by date with the days given and short; and the earliest deadline across the sites. Free on the page.
- `list`: Classes each employee on the day notice is first due, builds the sites from the list, runs the check, and returns each affected employee's class, whether the loss counts and the notice-by date under each law, with a CSV. Up to 10,000 rows; re-runs of the same layoff plan are free for 90 days.
- `exposure`: Returns the days of notice short, the back pay and benefits owed (with the caps the law sets), any New Jersey or Maine severance, and the local government penalty ceiling, for one employee. States with their own remedy rules here: CA, NY, WA, IL, NJ, ME. Free on the page.

Inputs:

- `sites`: Up to 200 sites, each with a name, state, full-time, part-time and short-service counts, whether it is closing, any relocation distance, and the dated losses (at most 2,000 in all).
- `employer, states`: The company totals of full-time, part-time and short-service employees and the hours they work in a week; and the headcount in a state where a law counts statewide. Left out, the listed sites are added up.
- `noticeDate`: The date notice was or will be given, to count the days given and short.
- `plan, rows, countOn`: For list: the layoff plan's name, the employees (site, state, hire date, average weekly hours, separation date and reason: layoff, short-layoff, cause, quit, retirement, transfer), and the count date (default 60 days before the first loss).
- `state, hireDate, separationDate, noticeDate or noticeDays, dailyPay, averageDailyPay, dailyBenefits, wagesPaid, voluntaryPayments, weeklyPay`: For exposure: the employee's facts and pay.

Outputs:

- answer: which sites trigger which laws and the earliest deadline, in one sentence
- sites: per site, each law's employer test, trigger, window, groups with notice-by dates, recipients and citation
- summary: sites triggered under federal and state law, and the first notice-by date
- notCovered: states whose own law the tool does not cover
- employees, classes and csv (list only)
- violationDays, backPay, severance, total and penaltyCeiling (exposure only)

## How is it calculated, step by step?

1. Every count is split three ways: full-time (20 or more hours a week and 6 of the last 12 months), part-time (under 20 hours) and short-service (fewer than 6 of the 12 months). Federal law excludes the last two from every threshold (20 CFR 639.3(h)); some states count them.
2. The employer test is run at the scope each law uses: the company for federal WARN (100 full-time, or 100 working 4,000 hours a week in all), the state or the site for the state laws.
3. Losses on the same day at a site are one group. A window starts at each group's date in turn, 30 days long counting both ends; the first window whose losses meet the trigger is the one shown, and every group inside a triggering window is owed notice.
4. Where 30 days do not trigger, groups are added up over 90 days (20 CFR 639.5(a)), as in the DOL Employer's Guide example; some states use 3 months or the whole list instead.
5. A plant closing counts full-time losses at a site that is shutting; a mass layoff needs at least 50 that are at least 33% of the site's active full-time employees, or 500 regardless of share.
6. Each group's notice is due the law's number of days before its own date: 60 federally, 60 under Cal-WARN, 90 under NY WARN, 90 under NJ WARN, 60 under Illinois WARN, 30 under Iowa WARN, 90 under Maine 625-B, 60 under Maryland ESA, 60 under Delaware WARN and 60 under Washington WARN. Given a notice date, each group shows the days given and the days short.
7. For an employee list, each row is classed on the count date: hired after it, short-service, part-time or full-time by average weekly hours. Only a layoff is an employment loss; a discharge for cause, a quit, a retirement, an accepted transfer and a layoff of 6 months or less are not.
8. Back pay is the days short (at most 60, and in some states at most half the days employed) times the daily pay and benefits, less wages paid and voluntary payments. New Jersey adds one week of pay per full year of service and Maine counts partial years, with its 3-year minimum.

**20 CFR Part 639 and the DOL Employer's Guide.**

The thresholds, the windows, the counting rules and the recipients are read from the eCFR, up to date as of 2026-11-05 (last amended 2016-10-24), and the DOL Employer's Guide, whose 90-day example the tests reproduce.

**State laws.**

Each state law comes from that state's own statute or labor department site, read 2026-11-08, and each answer carries its citation. Not read on the state's own site in this build, so the tool says the state's law is not covered. Several of these sites refused automated reads (403 or no connection), and no block was worked around.

## Which edge cases does it handle?

- Losses on day 30 count in the same window as day 1; a loss on day 31 falls to the 90-day test.
- Four small rounds of 30, 29, 6 and 5 at a 180-person site add up to a mass layoff over 90 days, as in the DOL Employer's Guide.
- Part-time employees do not count toward the federal thresholds but are still owed notice.
- A state law triggered where federal WARN is not (such as New York's 25 employees) is reported on its own, with the earliest deadline named.
- Two sites with the same name, or a company total smaller than the sites listed, are refused.
- In the employee list, a spreadsheet formula in a cell is defused, and a bad row is named.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Three sites in three states**

```json
{
  "op": "check",
  "employer": {
    "fullTime": 400,
    "partTime": 40
  },
  "sites": [
    {
      "name": "Fresno plant",
      "state": "CA",
      "fullTime": 160,
      "partTime": 20,
      "losses": [
        {
          "date": "2027-01-15",
          "fullTime": 40,
          "partTime": 5
        },
        {
          "date": "2027-02-05",
          "fullTime": 15
        }
      ]
    },
    {
      "name": "Albany office",
      "state": "NY",
      "fullTime": 90,
      "losses": [
        {
          "date": "2027-01-29",
          "fullTime": 30
        }
      ]
    },
    {
      "name": "Dallas warehouse",
      "state": "TX",
      "fullTime": 120,
      "closing": true,
      "losses": [
        {
          "date": "2027-03-01",
          "fullTime": 48
        }
      ]
    }
  ],
  "noticeDate": "2026-12-01"
}
```

Three sites in three states

| Result | Value |
| --- | --- |
| answer | Your list triggers federal WARN at 1 of 3 sites (Fresno plant: 55 full-time employees lost of 160, 34.3%, a mass layoff); 60 days' notice is due by November 16, 2026; Cal-WARN is triggered at Fresno plant, where 60 days' notice is due by November 16, 2026; NY WARN is triggered at Albany office, where 90 days' notice is due by October 31, 2026. The earliest deadline is October 31, 2026 at Albany office. State law in Texas is not covered by this tool. |
| Fresno plant | federal WARN, notice by November 16, 2026 |
| Albany office | NY WARN, notice by October 31, 2026 |
| Dallas warehouse | no notice triggered |

**The DOL Employer's Guide 90-day example**

```json
{
  "op": "check",
  "employer": {
    "fullTime": 180
  },
  "sites": [
    {
      "name": "Plant",
      "state": "OH",
      "fullTime": 180,
      "losses": [
        {
          "date": "2027-01-02",
          "fullTime": 30
        },
        {
          "date": "2027-01-31",
          "fullTime": 29
        },
        {
          "date": "2027-03-01",
          "fullTime": 6
        },
        {
          "date": "2027-03-31",
          "fullTime": 5
        }
      ]
    }
  ]
}
```

The DOL Employer's Guide 90-day example

| Result | Value |
| --- | --- |
| answer | Your list triggers federal WARN at 1 of 1 site (Plant: 70 full-time employees lost of 180, 38.8%, a mass layoff added up over 90 days); 60 days' notice is due by November 3, 2026. State law in Ohio is not covered by this tool. |
| 30 on January 2, 2027 | notice by November 3, 2026 |
| 29 on January 31, 2027 | notice by December 2, 2026 |
| 6 on March 1, 2027 | notice by December 31, 2026 |
| 5 on March 31, 2027 | notice by January 30, 2027 |

**Back pay for a New York employee given 45 days' notice instead of 90**

```json
{
  "op": "exposure",
  "state": "NY",
  "hireDate": "2023-06-05",
  "separationDate": "2027-01-29",
  "noticeDate": "2026-12-15",
  "dailyPay": "230",
  "dailyBenefits": "38"
}
```

Back pay for a New York employee given 45 days' notice instead of 90

| Result | Value |
| --- | --- |
| answer | With 45 days of notice the exposure under NY WARN (and federal WARN where it applies) is 45 days of back pay and benefits, $12,060.00, for this employee. |
| step 1 | 45 days of notice given against 90 required: 45 days short. |
| step 2 | Back pay and benefits: 45 days x $268.00 = $12,060.00. |

**New Jersey: severance for each full year of service**

```json
{
  "op": "exposure",
  "state": "NJ",
  "hireDate": "2019-04-01",
  "separationDate": "2027-03-31",
  "noticeDate": "2027-01-15",
  "dailyPay": "240",
  "dailyBenefits": "35",
  "weeklyPay": "1200"
}
```

New Jersey: severance for each full year of service

| Result | Value |
| --- | --- |
| answer | With 75 days of notice there is no back-pay exposure under NJ WARN (and federal WARN where it applies); the $8,400.00 of NJ WARN severance is still owed. |
| severance | 7 full years of service: 7 weeks of pay. |

## What does it not do?

- It does not decide whether locations are one single site of employment, whether an exception applies (faltering company, unforeseeable business circumstances, natural disaster) or who the employer is.
- Only the state laws read are covered; in the other 40 jurisdictions only federal WARN is checked, and the answer names the state.
- Your counts and dates are yours; the tool cannot check them.
- It is not legal advice.

## Where does the data come from, and how fresh is it?

20 CFR Part 639 was read through the eCFR, up to date as of 2026-11-05; the DOL Employer's Guide and each state's statute or labor department page were read on 2026-11-08. The rules change only by hand, with the tests that pin the data file and the engine together.

- [20 CFR Part 639, Worker Adjustment and Retraining Notification (eCFR versioner API)](https://www.ecfr.gov/current/title-20/chapter-V/part-639)
- [U.S. DOL ETA, Employer's Guide to Advance Notice of Closings and Layoffs (July 2003)](https://www.dol.gov/sites/dolgov/files/ETA/Layoff/pdfs/_EmployerWARN2003.pdf)
- [Cal-WARN: Cal. Labor Code 1400 to 1408 (1400.5, 1401, 1403)](https://edd.ca.gov/en/jobs_and_training/Layoff_Services_WARN/)
- [NY WARN: N.Y. Labor Law Article 25-A (860 et seq.); 12 NYCRR Part 921](https://dol.ny.gov/warn-regulations)
- [NJ WARN: N.J.S.A. 34:21-1 et seq., as amended effective April 10, 2023](https://business.nj.gov/updates/important-updates-to-employee-rights-under-new-jersey-warn-law)
- [Illinois WARN: 820 ILCS 65; 56 Ill. Adm. Code 230](https://dceo.illinois.gov/workforcedevelopment/warn.html)
- [Iowa WARN: Iowa Code chapter 84C](https://www.legis.iowa.gov/docs/code/84C.pdf)
- [Maine 625-B: 26 M.R.S. 625-B](https://legislature.maine.gov/statutes/26/title26sec625-B.html)
- [Maryland ESA: Md. Code Ann., Lab. & Empl. 11-301 et seq.](https://labor.maryland.gov/employment/dwdal-esa-frequently-asked-questions.shtml)
- [Delaware WARN: 19 Del. C. 1901 to 1911](https://delcode.delaware.gov/title19/c019/index.html)
- [Washington WARN: RCW 49.45 (2025 c 277; 2026 c 86)](https://app.leg.wa.gov/RCW/default.aspx?cite=49.45&full=true)
- [Tennessee 50-1-601: Tenn. Code Ann. 50-1-601 to 50-1-604](https://www.tn.gov/content/dam/tn/workforce/documents/employers/WARN_Technical_Assistance_Guide.pdf)
- [Connecticut: Connecticut Department of Labor, WARN](https://portal.ct.gov/dol/divisions/rapid-response/warn)

20 CFR Part 639 was read through the eCFR, up to date as of 2026-11-05; the DOL Employer's Guide and each state's statute or labor department page were read on 2026-11-08. The rules change only by hand, with the tests that pin the data file and the engine together.

WARN Act checker: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [20 CFR Part 639, Worker Adjustment and Retraining Notification (eCFR versioner API)](https://www.ecfr.gov/current/title-20/chapter-V/part-639) | up to date as of 2026-11-05 | 2026-11-08 |
| [U.S. DOL ETA, Employer's Guide to Advance Notice of Closings and Layoffs (July 2003)](https://www.dol.gov/sites/dolgov/files/ETA/Layoff/pdfs/_EmployerWARN2003.pdf) | July 2003 | 2026-11-08 |
| [Cal-WARN: Cal. Labor Code 1400 to 1408 (1400.5, 1401, 1403)](https://edd.ca.gov/en/jobs_and_training/Layoff_Services_WARN/) | see the document | 2026-11-08 |
| [NY WARN: N.Y. Labor Law Article 25-A (860 et seq.); 12 NYCRR Part 921](https://dol.ny.gov/warn-regulations) | see the document | 2026-11-08 |
| [NJ WARN: N.J.S.A. 34:21-1 et seq., as amended effective April 10, 2023](https://business.nj.gov/updates/important-updates-to-employee-rights-under-new-jersey-warn-law) | see the document | 2026-11-08 |
| [Illinois WARN: 820 ILCS 65; 56 Ill. Adm. Code 230](https://dceo.illinois.gov/workforcedevelopment/warn.html) | see the document | 2026-11-08 |
| [Iowa WARN: Iowa Code chapter 84C](https://www.legis.iowa.gov/docs/code/84C.pdf) | see the document | 2026-11-08 |
| [Maine 625-B: 26 M.R.S. 625-B](https://legislature.maine.gov/statutes/26/title26sec625-B.html) | see the document | 2026-11-08 |
| [Maryland ESA: Md. Code Ann., Lab. & Empl. 11-301 et seq.](https://labor.maryland.gov/employment/dwdal-esa-frequently-asked-questions.shtml) | see the document | 2026-11-08 |
| [Delaware WARN: 19 Del. C. 1901 to 1911](https://delcode.delaware.gov/title19/c019/index.html) | see the document | 2026-11-08 |
| [Washington WARN: RCW 49.45 (2025 c 277; 2026 c 86)](https://app.leg.wa.gov/RCW/default.aspx?cite=49.45&full=true) | see the document | 2026-11-08 |
| [Tennessee 50-1-601: Tenn. Code Ann. 50-1-601 to 50-1-604](https://www.tn.gov/content/dam/tn/workforce/documents/employers/WARN_Technical_Assistance_Guide.pdf) | see the document | 2026-11-08 |
| [Connecticut: Connecticut Department of Labor, WARN](https://portal.ct.gov/dol/divisions/rapid-response/warn) | see the document | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests check the federal employer test, the mass layoff tiers, plant closings, the 30-day window counting both ends, the DOL Employer's Guide 90-day example, notice against each group, each state law with its own numbers, the employee list classing, and back pay with the federal 60-day cap and each state's caps and severance.

What its test suite asserts:

- The federal thresholds, windows and the DOL Employer's Guide 90-day example are checked against 20 CFR Part 639 as of 2026-11-05.
- Each state law read (Cal-WARN, NY WARN, NJ WARN, Illinois WARN, Iowa WARN, Maine 625-B, Maryland ESA, Delaware WARN, Washington WARN and Tennessee 50-1-601) is checked with its own numbers; states not read are reported as not covered.
- The employee list classing, defused formulas and the back pay caps and severance for each state are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the WARN Act checker tool](https://krishnachagti-sudo.github.io/toll-preview/warn-act-checker/).

## Questions

### Is there any AI in the warn act checker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the warn act checker refuse to answer?

It does not decide whether locations are one single site of employment, whether an exception applies (faltering company, unforeseeable business circumstances, natural disaster) or who the employer is. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the WARN Act checker tool](https://krishnachagti-sudo.github.io/toll-preview/warn-act-checker/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/warn-act-checker/  
Data as of: 2026-11-04
