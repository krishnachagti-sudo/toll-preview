# Free widgets for your site: IRS mileage rate, holidays

Paste one iframe into your page and it shows a live figure from Endwise: the current IRS mileage rate, the next US federal holiday, or a business days counter. There are 3 free widgets, with no account, no script and no cookies.

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
