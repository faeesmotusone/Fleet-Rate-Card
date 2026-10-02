import { DATA } from '@/lib/data';

export function About() {
  return (
    <div className="about">
      <section className="panel narrow">
        <h2>Where these rates come from</h2>
        <p>Every rate is a unit price Motus One actually paid, taken from purchase orders raised between {DATA.period}. Rates exclude VAT. Supplier names are not shown; counts tell you how many suppliers sit behind a range.</p>
        <table className="about-table">
          <tbody>
            <tr><th>Saudi Arabia</th><td>Motus One Company, all PO detail. {DATA.included.KSA.toLocaleString()} rates used, {DATA.excluded.KSA.toLocaleString()} fleet lines left out. SAR.</td></tr>
            <tr><th>UAE</th><td>Motus One Parking Management Services, all PO detail. {DATA.included.UAE.toLocaleString()} rates used, {DATA.excluded.UAE.toLocaleString()} fleet lines left out. AED.</td></tr>
            <tr><th>International</th><td>Same UAE entity's POs for bookings outside the UAE. {DATA.included.International.toLocaleString()} rates used, {DATA.excluded.International.toLocaleString()} fleet lines left out. Shown in AED (converted from USD, GBP, EUR and other local currencies at the PO exchange rate).</td></tr>
          </tbody>
        </table>
        <h3>How a line is counted</h3>
        <ul className="rules">
          <li><strong>Daily</strong> lines mention 12 hrs including driver and fuel, or a full day.</li>
          <li><strong>One-way transfer</strong> lines mention a transfer, one way, airport, arrival or departure. Each is tagged airport, in-city or intercity, because an intercity run isn’t comparable to an airport drop.</li>
          <li><strong>Left out:</strong> overtime and extra hours, insurance, fuel, parking and tolls, self-drive and monthly rentals, drivers without a vehicle, other shift lengths, deleted or draft POs, and package prices entered as one line.</li>
          <li><strong>Vehicle names</strong> follow the 38-vehicle list from the supplier rate card, so “GMC or similar” and “Yukon 2025” count as one vehicle.</li>
          <li><strong>The middle half</strong> of bookings (the shaded band) is a steadier guide than the lowest or highest single booking.</li>
        </ul>
        <h3>Not yet included</h3>
        <p>Other shift lengths (6, 8, 10 and 24 hrs where not captured as full day), self-drive rentals, and categories beyond fleet. The Fleet Rate Master workbook lists every line with the reason it was used or left out.</p>
      </section>
    </div>
  );
}
