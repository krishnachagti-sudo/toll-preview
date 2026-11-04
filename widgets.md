# Free widgets for your site: IRS rates, tax dates

Paste one iframe into your page and it shows a live figure from Endwise: an IRS rate, a tax due date, the next US federal holiday or a business days counter. There are 6 free widgets, with no account, no script and no cookies.

## How do I add a widget to my site?

Paste the iframe code for the widget you want into your page where it should appear. An iframe is a window onto another web page. Each widget is a page on Endwise made to fit a small window, so your site shows the figure without you running any code.

The widgets are readable at 300 pixels wide and fit phone screens. They change with the visitor's light or dark setting, and they link to the tool they come from.

## Current IRS mileage rate widget

**What it shows:** The IRS business mileage rate in cents a mile, the dates it covers, and the IRS release it comes from. It switches on its own when the IRS rate period changes.

**Where it comes from:** The IRS standard mileage rates table, read from the mileage calculator's dated data. Open the [live widget](https://krishnachagti-sudo.github.io/toll-preview/embed/mileage-rate) to see it.

Copy this code:

```html
<iframe src="https://krishnachagti-sudo.github.io/toll-preview/embed/mileage-rate" title="Current IRS standard mileage rate" width="320" height="130" style="border:0;max-width:100%" loading="lazy"></iframe>
```

## Next US federal holiday widget

**What it shows:** The next US federal holiday, how many days away it is, and how many business days fall before it. On the day itself it says so.

**Where it comes from:** The federal holiday rules in the business days calculator, including the observed-date shifts when a holiday falls on a weekend. Open the [live widget](https://krishnachagti-sudo.github.io/toll-preview/embed/next-holiday) to see it.

Copy this code:

```html
<iframe src="https://krishnachagti-sudo.github.io/toll-preview/embed/next-holiday" title="Next US federal holiday" width="320" height="150" style="border:0;max-width:100%" loading="lazy"></iframe>
```

## Trucker per diem rate widget

**What it shows:** The IRS special meals rate for the transportation industry, for the continental US and for outside it, the dates it covers and the IRS notice it comes from. It switches on its own when a new notice period starts.

**Where it comes from:** The IRS transportation-industry per diem notices, read from the trucker per diem worksheet's dated data. Open the [live widget](https://krishnachagti-sudo.github.io/toll-preview/embed/trucker-per-diem) to see it.

Copy this code:

```html
<iframe src="https://krishnachagti-sudo.github.io/toll-preview/embed/trucker-per-diem" title="Current IRS per diem rate for truckers" width="320" height="150" style="border:0;max-width:100%" loading="lazy"></iframe>
```

## Next IFTA return due date widget

**What it shows:** The next IFTA quarterly return due date, the quarter it covers and how many days away it is. A due date on a weekend or holiday is shown on the next business day.

**Where it comes from:** The IFTA due dates in the IFTA calculator, with the weekend and holiday shift worked out by the business days calculator. Open the [live widget](https://krishnachagti-sudo.github.io/toll-preview/embed/ifta-due-date) to see it.

Copy this code:

```html
<iframe src="https://krishnachagti-sudo.github.io/toll-preview/embed/ifta-due-date" title="Next IFTA quarterly return due date" width="320" height="150" style="border:0;max-width:100%" loading="lazy"></iframe>
```

## 1099-NEC reporting line widget

**What it shows:** The amount paid to one contractor at which a 1099-NEC is required for the current payment year, and the date the forms are due, moved to the next business day when it falls on a weekend or holiday.

**Where it comes from:** The IRS Instructions for Forms 1099-MISC and 1099-NEC, read from the 1099 threshold check's dated data. It shows the latest year the IRS has published. Open the [live widget](https://krishnachagti-sudo.github.io/toll-preview/embed/1099-threshold) to see it.

Copy this code:

```html
<iframe src="https://krishnachagti-sudo.github.io/toll-preview/embed/1099-threshold" title="1099-NEC reporting line for the current tax year" width="320" height="150" style="border:0;max-width:100%" loading="lazy"></iframe>
```

## Business days counter widget

**What it shows:** A small form with a start date set to today. Visitors pick an end date and the calculator opens with both dates filled in. The widget itself makes no calculation and no API call.

**Where it comes from:** Opens the business days calculator, which skips weekends and US federal holidays. Open the [live widget](https://krishnachagti-sudo.github.io/toll-preview/embed/business-days) to see it.

Copy this code:

```html
<iframe src="https://krishnachagti-sudo.github.io/toll-preview/embed/business-days" title="Count business days between two dates" width="320" height="230" style="border:0;max-width:100%" loading="lazy"></iframe>
```

## Do the widgets track visitors?

No. A widget is a single HTML page with its own styles. It has no scripts, sets no cookies, makes no calls to other sites and has no account or metering behind it. Its only link goes to the tool page, and it opens there in the full window.

## How fresh is the data?

The server works each figure out from the tool's own engine when the widget is requested. Browsers and caches may keep it for up to an hour, so a change shows within about an hour. Dates use UTC. The sources behind the tools are listed on the [sources page](https://krishnachagti-sudo.github.io/toll-preview/sources/).

## Can I change the theme?

Add `?theme=dark` or `?theme=light` to the iframe address to force a theme, for example `https://krishnachagti-sudo.github.io/toll-preview/embed/mileage-rate?theme=dark`. Without it, the widget follows the visitor's setting.

## Questions

### Are the widgets free?

Yes. They cost nothing, need no account and no API key, and do not use your balance or anyone's. Each one shows a small "by" link back to the tool it comes from.

### Do the widgets track my visitors?

No. A widget is one small HTML page with its own styles. It runs no scripts, sets no cookies, loads nothing from other sites and stores nothing about who viewed it. As with any web request, the server sees the request itself.

### How fresh is the data?

The figures are worked out on our server from each tool's own data when the widget loads, and browsers may keep a copy for up to an hour. The IRS rate comes from a dated table that is updated by hand when the IRS announces a change.

### Can I change the colors?

Widgets follow the visitor's light or dark setting. Add ?theme=light or ?theme=dark to the iframe address to force one. The size is set by the iframe's width and height.

## Related

- [Holiday calendars](https://krishnachagti-sudo.github.io/toll-preview/calendars/)
- [Where the data comes from](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Business days calculator](https://krishnachagti-sudo.github.io/toll-preview/business-days/)
- [Use the tools from your own code](https://krishnachagti-sudo.github.io/toll-preview/developers/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/widgets/  
Data as of: 2026-11-04
