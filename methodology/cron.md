# How cron expressions are checked: dialects and next runs

An expression is read by the rules of one of 9 schedulers (Linux crontab (Vixie cron), GitHub Actions, Kubernetes CronJob, Vercel Cron Jobs, n8n Schedule Trigger (Custom cron), Quartz Scheduler, Spring @Scheduled, UiPath Orchestrator time trigger, Amazon EventBridge Scheduler), described in plain English, and its next runs (up to 50) are listed in an IANA time zone. A run in a skipped or repeated hour follows that scheduler's documented rule, read on 2026-11-08.

## How does it work?

1. Spaces are evened out. For AWS EventBridge, cron(...) is unwrapped, and rate(...) and at(...) schedules are refused. CRON\_TZ= or TZ= at the start is refused, since the zone goes in its own field. An @ string is replaced by the dialect's own meaning (such as @daily as 0 0 \* \* \*), and @reboot is refused because it has no schedule to list.
2. The fields are counted: 5 for crontab, GitHub Actions, Kubernetes and Vercel; 5 or 6 for n8n (seconds first, 0 when left out); 6 for Spring and AWS EventBridge (AWS has a year last); 6 or 7 for Quartz and UiPath (seconds first, an optional year last).
3. Each field is read as a list of values, ranges and steps. Weekdays run Sunday = 0 to 6 (7 is also Sunday in crontab and Spring) or Sunday = 1 to 7 in Quartz, UiPath and AWS.
4. The two day fields: in Quartz and AWS exactly one must be "?"; in Vercel one of them must be \*. Debian crontab runs on days matching either field when both are set, but a field that starts with \* (such as \*/2) counts as unset, so both must match; a warning says so.
5. Platform warnings: GitHub Actions runs a schedule at most once every 5 minutes and says the top of the hour is busy; Vercel Hobby allows one run a day.

> Steps 6 to 11, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/cron/#what) below.

## What does it not cover?

- It refuses rate(...) and at(...) schedules, @reboot, and any expression the chosen scheduler's docs do not allow, with the reason.
- It cannot know how late a platform starts a run: GitHub, for one, says scheduled runs can be delayed or dropped at busy times.
- Where a scheduler's docs do not say what happens at a clock change, the run is flagged, not decided.
- Time zone rules are those of the runtime's tz database; a zone changed by a government after that release is not reflected.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 14 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Each scheduler's documentation was read on 2026-11-08, and the pages are checked daily for changes. Time zone rules come from the runtime's tz database (tzdata 2025c on the server). The dialect rules change only by hand, with the tests that pin them.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): Each of the 9 dialects is tested on its fields, names, weekday numbering, macros, ? and L, W and # rules, and the day-field rule, with Debian's leading-\* exception.

- [Debian crontab(5), cron 3.0pl1-197 (Vixie cron)](https://manpages.debian.org/trixie/cron/crontab.5.en.html), see the document, read 2026-11-08
- [Debian cron(8): clock changes](https://manpages.debian.org/bookworm/cron/cron.8.en.html), see the document, read 2026-11-08
- [GitHub Docs: Events that trigger workflows, schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows), see the document, read 2026-11-08
- [Kubernetes docs: CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/), see the document, read 2026-11-08
- [Vercel docs: Cron Jobs](https://vercel.com/docs/cron-jobs), see the document, read 2026-11-08
- [Vercel docs: Cron Jobs usage and pricing](https://vercel.com/docs/cron-jobs/usage-and-pricing), see the document, read 2026-11-08
- [n8n docs: Schedule Trigger node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/), see the document, read 2026-11-08
- [Quartz 2.3 tutorial: CronTrigger](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html), see the document, read 2026-11-08
- [Quartz 2.3 API: CronExpression](https://www.quartz-scheduler.org/api/2.3.0/org/quartz/CronExpression.html), see the document, read 2026-11-08
- [Spring Framework reference: Task execution and scheduling, cron expressions](https://docs.spring.io/spring-framework/reference/integration/scheduling.html), see the document, read 2026-11-08
- [Spring Framework API: CronExpression](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/support/CronExpression.html), see the document, read 2026-11-08
- [UiPath Orchestrator: Using cron expressions](https://docs.uipath.com/orchestrator/automation-cloud/latest/user-guide/using-cron-expressions), see the document, read 2026-11-08
- [Amazon EventBridge Scheduler: Schedule types](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html), see the document, read 2026-11-08
- [Amazon EventBridge: Schedule patterns for scheduled rules (legacy)](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-scheduled-rule-pattern.html), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the cron expression checker and next run times compute?

The tool takes a cron expression and the scheduler it is for, checks it against that scheduler's documented syntax, says what it means in plain English and lists its next run times in a time zone, marking each run that a daylight saving change skips, moves or repeats.

**In detail: operations, inputs and outputs**

It writes the same schedule for every other scheduler, or says why one cannot express it. It also builds an expression from a simple schedule and lists the clock changes of a time zone in a year.

Operations (the op field):

- `explain`: Checks an expression in a dialect and returns its plain-English description, the fields and their values, how the day fields combine, the time zone and its rule, the next runs (10 by default, up to 50), the clock-change rule, warnings, the same schedule for each other scheduler with a config snippet, and the sources.
- `build`: Writes an expression from a pattern (seconds, minutes, hours, daily, weekly, monthly, last-day) with its interval, times, days, day of month and months, and returns it with its description, next runs, warnings and the version for every scheduler.
- `dst`: Lists the clock changes of an IANA time zone in a year: the date, the UTC instant, forward or back, by how many minutes, the offsets and abbreviations before and after, and the clock times skipped or repeated.

Inputs:

- `expression`: For explain: the cron expression, at most 200 characters, such as \*/5 \* \* \* \*, an @ string where the dialect has them, or cron(...) for AWS EventBridge.
- `dialect`: vixie, github, kubernetes, vercel, n8n, quartz, spring, uipath, aws. For explain the default is vixie (Linux crontab); for build, the default is crontab, or n8n when the schedule has seconds, or Quartz for the last day of the month.
- `timeZone`: An IANA time zone such as America/New\_York. Without one the runs are shown in UTC. Required for dst.
- `from, count`: The instant to list runs after, written like 2026-11-08T09:00:00Z with Z or an offset (the current time when not given), and how many runs to list, 1 to 50.
- `pattern, every, at, days, day, months, minute`: For build: the pattern; every (1 to 59) for seconds, minutes or hours; one time or up to 6 times a day as 09:30; weekdays as numbers, 0 = Sunday; the day of the month (1 to 31); months as 1 to 12; and the minute past the hour for hours.
- `year`: For dst: a year from 1970 to 2100.

Outputs:

- description: the schedule in plain English
- fields: each field's text and the values it allows; days: how the day-of-month and day-of-week fields combine
- timeZone and zoneRule: the zone the runs are shown in and how the scheduler picks its zone
- nextRuns: each run's UTC instant, local time, weekday, offset and abbreviation, with a note when a clock change skips, moves or repeats it
- dstRule and warnings: the scheduler's clock-change rule in words, and what to check (platform limits, day-field rules, wrapping ranges)
- conversions: for each scheduler, the expression or expressions, a note, a config snippet, or the reason it cannot be written
- for build, the expression and the dialect it is written for; for dst, the list of changes

**Every step in full (11) and the rules**

1. Spaces are evened out. For AWS EventBridge, cron(...) is unwrapped, and rate(...) and at(...) schedules are refused. CRON\_TZ= or TZ= at the start is refused, since the zone goes in its own field. An @ string is replaced by the dialect's own meaning (such as @daily as 0 0 \* \* \*), and @reboot is refused because it has no schedule to list.
2. The fields are counted: 5 for crontab, GitHub Actions, Kubernetes and Vercel; 5 or 6 for n8n (seconds first, 0 when left out); 6 for Spring and AWS EventBridge (AWS has a year last); 6 or 7 for Quartz and UiPath (seconds first, an optional year last). A wrong count is refused with a hint when it looks like another dialect's line.
3. Each field is read as a list of values, ranges and steps. Weekdays run Sunday = 0 to 6 (7 is also Sunday in crontab and Spring) or Sunday = 1 to 7 in Quartz, UiPath and AWS. Names (JAN, MON) are allowed where the docs allow them. "?" is allowed only in the day fields of Quartz, Kubernetes, Spring, UiPath and AWS. L, L-n, W, LW, nL and # are allowed only where that dialect's docs list them, and # takes 1 to 5. A value out of range, a backwards range or a step larger than the field is refused, except that Quartz wraps a range like 22-2, with a warning.
4. The two day fields: in Quartz and AWS exactly one must be "?"; in Vercel one of them must be \*. Debian crontab runs on days matching either field when both are set, but a field that starts with \* (such as \*/2) counts as unset, so both must match; a warning says so. The other dialects follow the POSIX rule: both must match when either is \* or ?, otherwise either may match, and Spring and UiPath are flagged because their docs do not say.
5. Platform warnings: GitHub Actions runs a schedule at most once every 5 minutes and says the top of the hour is busy; Vercel Hobby allows one run a day.
6. The time zone is the one given, by its canonical IANA name, or UTC. Vercel always runs in UTC, so its runs are shown in UTC with a note; a dialect whose default is not UTC gets a note when no zone is given.
7. Next runs: the days from the day before the start are checked one by one, up to 30 years ahead or the last year in the year field. Each matching wall-clock time is turned into instants with the runtime's time zone rules: none in a spring-forward gap, two in a repeated hour.
8. Clock changes follow each scheduler's docs. Debian cron (cron(8)): a job at a fixed time in the skipped hour runs soon after the change, and runs once in the repeated hour; a job with \* in the minute or hour field runs on the new time, so it has no run in the gap and runs twice in the repeat. GitHub: a run in the skipped hour moves to the next valid time; the repeat is not documented and is flagged. AWS EventBridge Scheduler: a run in the gap is skipped and listed as skipped, and a repeated time runs once. Vercel runs in UTC, which has no changes. For the other schedulers the docs are silent, so those runs are flagged.
9. Conversion: the meaning is written in each other dialect, renumbering weekdays, adding "?" where required, adding or dropping the seconds and year fields and wrapping AWS in cron(...). It is refused with the reason when the target has no seconds, no year, no L, W or #, or cannot run only on days matching both fields; when a scheduler cannot match a day of month or a day of week in one expression, two schedules are given.
10. Build: the pattern becomes six fields with seconds, is checked as Spring would read it, and is then written for the chosen dialect. A step that does not divide 60 or 24 is warned about, a monthly day after the 28th warns that shorter months are skipped, and several times a day must share the same minute.
11. Clock changes of a year: the zone's UTC offset is compared every 6 hours across the year, and each change is found to the minute.

**Each scheduler's documentation.**

The dialect rules (fields, weekday numbering, names, ?, L, W, #, the @ strings, the day-field rule, the time zone and the clock-change rule) were read from each project's own documentation on 2026-11-08. Where a page says nothing, the answer says so instead of guessing.

**Time zones.**

Offsets and clock changes come from the IANA time zone rules in the runtime's Intl support (tzdata 2025c on the server); the page uses the browser's copy.

## Which edge cases does it handle?

**The edge cases (7)**

- A 2:30 am job in Los Angeles on AWS EventBridge is listed as skipped on March 14, 2027, when the clocks go from 2:00 to 3:00.
- In crontab, 5-7 in the day-of-week field is Friday to Sunday, because 7 is Sunday too.
- 0 9 1 \* MON runs on the 1st and on every Monday under POSIX, but 0 9 \*/2 \* MON in Debian cron runs only on Mondays that are odd days, with a warning.
- Quartz 6L is the last Friday of the month; the same schedule in Spring is 5L, and crontab, GitHub, Kubernetes, Vercel and n8n refuse it with the reason.
- Quartz years run to 2099 and AWS years to 2199; a schedule whose years are over says there is no next run.
- Kubernetes refuses CRON\_TZ inside the schedule; set .spec.timeZone instead.
- A step such as \*/7 minutes restarts each hour, so the gap across the hour is shorter; build warns about it.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Every weekday at 9:00 am in New York on GitHub Actions, and the same schedule elsewhere**

Every weekday at 9:00 am in New York on GitHub Actions, and the same schedule elsewhere

| Result | Value |
| --- | --- |
| description | At 09:00, on weekdays (Monday to Friday). |
| day fields | both day fields must match |
| time zone | America/New\_York |
| warning | GitHub says the start of every hour is a high-load time when scheduled runs can be delayed or dropped; a minute other than 0 is less likely to be late. |
| Quartz | 0 0 9 ? \* 2-6 |
| Spring | 0 0 9 \* \* 1-5 |
| AWS EventBridge | cron(0 9 ? \* 2-6 \*) |

**The input**

```json
{
  "op": "explain",
  "expression": "0 9 * * 1-5",
  "dialect": "github",
  "timeZone": "America/New_York",
  "count": 5
}
```

**More worked examples (4)**

**A 2:30 am job in Los Angeles on AWS EventBridge across the March 14, 2027 clock change**

A 2:30 am job in Los Angeles on AWS EventBridge across the March 14, 2027 clock change

| Result | Value |
| --- | --- |
| description | At 02:30. |
| 2027-03-12 02:30 | 2027-03-12T10:30:00Z (Friday, PST) |
| 2027-03-13 02:30 | 2027-03-13T10:30:00Z (Saturday, PST) |
| 2027-03-14 02:30 | 2027-03-14 02:30 does not exist in this time zone (the clocks go forward), so this run is skipped. |
| 2027-03-15 02:30 | 2027-03-15T09:30:00Z (Monday, PDT) |
| 2027-03-16 02:30 | 2027-03-16T09:30:00Z (Tuesday, PDT) |
| clock-change rule | EventBridge Scheduler: a run at a time that does not exist when the clocks go forward is skipped; when they go back, it runs only once. |

**The input**

```json
{
  "op": "explain",
  "expression": "cron(30 2 * * ? *)",
  "dialect": "aws",
  "timeZone": "America/Los_Angeles",
  "from": "2027-03-12T00:00:00Z",
  "count": 4
}
```

**Quartz: 10:15 am on the last Friday of every month**

Quartz: 10:15 am on the last Friday of every month

| Result | Value |
| --- | --- |
| description | At 10:15, on the last Friday of the month. |
| day fields | day of week only |
| Spring | 0 15 10 \* \* 5L |
| AWS EventBridge | cron(15 10 ? \* 6L \*) |
| crontab | Linux crontab (Vixie cron) has no L or # in the day of week. |

**The input**

```json
{
  "op": "explain",
  "expression": "0 15 10 ? * 6L",
  "dialect": "quartz",
  "timeZone": "Europe/London",
  "count": 4
}
```

**Build: every 15 minutes, written for crontab**

Build: every 15 minutes, written for crontab

| Result | Value |
| --- | --- |
| expression | \*/15 \* \* \* \* |
| written for | vixie |
| description | Every 15 minutes. |
| Quartz | 0 \*/15 \* \* \* ? |
| AWS EventBridge | cron(0/15 \* \* \* ? \*) |

**The input**

```json
{
  "op": "build",
  "pattern": "minutes",
  "every": 15,
  "count": 3
}
```

**The clock changes in London in 2027**

The clock changes in London in 2027

| Result | Value |
| --- | --- |
| 2027-03-28 (Sunday) | clocks forward: 01:00 becomes 02:00, GMT to GMT+1, at 2027-03-28T01:00:00Z |
| 2027-10-31 (Sunday) | clocks back: 02:00 becomes 01:00, GMT+1 to GMT, at 2027-10-31T01:00:00Z |

**The input**

```json
{
  "op": "dst",
  "timeZone": "Europe/London",
  "year": 2027
}
```

## How is it tested?

The clock changes are checked against the IANA rules, each scheduler's clock-change rule is checked in a gap and a repeated hour, and conversion and build are checked, including the refusals with reasons.

**What its test suite asserts (3)**

- Each of the 9 dialects is pinned to its documentation as read on 2026-11-08: fields, weekday numbering, names, @ strings, ?, L, W and #, and the day-field rule with Debian's leading-\* exception.
- Time zone gaps and repeated hours, the clock changes of a year and each scheduler's clock-change rule are checked, with silent docs flagged.
- The plain-English description, conversion to every scheduler with reasons when one cannot express a schedule, and build are checked against fixed answers.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Cron expression checker and next run times tool](https://krishnachagti-sudo.github.io/toll-preview/cron/).

## Questions

### Is there any AI in the cron expression checker and next run times answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the cron expression checker and next run times refuse to answer?

It refuses rate(...) and at(...) schedules, @reboot, and any expression the chosen scheduler's docs do not allow, with the reason. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Cron expression checker and next run times tool](https://krishnachagti-sudo.github.io/toll-preview/cron/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/cron/  
Data as of: 2026-11-04
