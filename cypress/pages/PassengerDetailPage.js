const ID = "flight.forms.i0.units.i0";
const NAMA_BULAN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// pola opsi bulan: "May", "May", "5", "05", atau nama panjang
const polaBulan = (n) => new RegExp(`^(${NAMA_BULAN[n - 1]}[a-z]*|0?${n})$`, "i");

// total akhir = angka "Rp" terakhir setelah kata "Total" terakhir
const ambilTotal = (teks) => {
  const idx = teks.lastIndexOf("Total");
  if (idx < 0) return null;
  const angka = teks.slice(idx).match(/Rp\s*[\d,]+/g) || [];
  if (!angka.length) return null;
  const n = Number(angka[angka.length - 1].replace(/[^\d]/g, ""));
  return n > 0 ? n : null;
};

class PassengerDetailPage {
  elements = {
    contactFirstName: () => cy.get('[data-testid="contact.contactFirstName"]'),
    contactLastName: () => cy.get('[data-testid="contact.contactLastName"]'),
    contactEmail: () => cy.get('[data-testid="contact.contactEmail"]'),
    contactPhone: () =>
      cy.get('[data-testid="contact.contactPhoneNumber-PhoneNumberDataTestId"]'),
    passengerFirstName: () => cy.get(`[data-testid="${ID}.passengerFirstName"]`),
    passengerLastName: () => cy.get(`[data-testid="${ID}.passengerLastName"]`),
    birthDay: () => cy.get(`[data-testid="${ID}.passengerDateOfBirth-DateInputDataTestId"]`),
    birthYear: () => cy.get(`[data-testid="${ID}.passengerDateOfBirth-YearInputDataTestId"]`),
    passportNumber: () => cy.get(`[data-testid="${ID}.passportNumber"]`),
    expiryDay: () => cy.get(`[data-testid="${ID}.passportExpiryDate-DateInputDataTestId"]`),
    expiryYear: () => cy.get(`[data-testid="${ID}.passportExpiryDate-YearInputDataTestId"]`),
    continueBtn: () => cy.get('[data-testid="continue-to-payment-button"]', { timeout: 60000 }),
  };

  // tombol berisi titik-titik selama halaman masih memuat harga
  waitForPage() {
    cy.location("pathname", { timeout: 60000 }).should("include", "/packages/book");
    this.elements.continueBtn().should("contain.text", "Continue to payment");
  }

  pilihDropdown(testid, pola) {
    cy.get(`[data-testid="${testid}"]`).then(($el) => {
      const $select = $el.is("select") ? $el : $el.find("select");
      if ($select.length) {
        const opsi = Array.from($select[0].options).find((o) => pola.test(o.text.trim()));
        expect(opsi, `opsi untuk ${pola}`).to.exist;
        cy.wrap($select.first()).select(opsi.value);
      } else {
        const $btn = $el.is("button, [role='combobox']")
          ? $el
          : $el.find("button, [role='combobox']").first();
        cy.wrap($btn).click();
        cy.contains('[role="option"], [role="listbox"] li', pola).click();
      }
    });
  }

  isiForm(p) {
    this.elements.contactFirstName().clear().type(p.firstName);
    this.elements.contactLastName().clear().type(p.lastName);
    this.elements.contactEmail().clear().type(p.email);
    this.elements.contactPhone().clear().type(p.phone);

    cy.get(`input[type="radio"][aria-label="${p.gender}"]`).check({ force: true });
    this.elements.passengerFirstName().clear().type(p.firstName);
    this.elements.passengerLastName().clear().type(p.lastName);

    this.elements.birthDay().clear().type(p.birthDay);
    this.pilihDropdown(`${ID}.passengerDateOfBirth-MonthInputDataTestId`, polaBulan(p.birthMonth));
    this.elements.birthYear().clear().type(p.birthYear);

    this.pilihDropdown(`${ID}.passengerNationality`, new RegExp(`^${p.nationality}$`, "i"));
    this.elements.passportNumber().clear().type(p.passportNumber);
    this.pilihDropdown(`${ID}.passportCountryOfIssue`, new RegExp(`^${p.passportCountry}$`, "i"));

    this.elements.expiryDay().clear().type(p.expiryDay);
    this.pilihDropdown(`${ID}.passportExpiryDate-MonthInputDataTestId`, polaBulan(p.expiryMonth));
    this.elements.expiryYear().clear().type(p.expiryYear);

    cy.get('[data-testid="radio-button-price-option-no"]').scrollIntoView().click();
  }

  // membaca total harga dan jam; mengulang sampai total benar-benar termuat
  getRingkasan() {
    return cy
      .get('[data-testid="sticky-sidebar-content"]', { timeout: 60000 })
      .should(($s) => {
        expect(ambilTotal($s[0].innerText), "total harga sudah termuat").to.be.a("number");
      })
      .then(($s) => {
        const total = ambilTotal($s[0].innerText);
        return cy.document().then((doc) => {
          const m = doc.body.innerText.match(
            /CGK\s*(\d{2}:\d{2})[\s\S]{0,40}?SIN\s*(\d{2}:\d{2})/
          );
          return { total, berangkat: m ? m[1] : null, tiba: m ? m[2] : null };
        });
      });
  }

  continueToPayment() {
    this.elements.continueBtn().scrollIntoView().click();

    // modal "Upgrade your support level" muncul di 2 dari 2 run. Tolak, jangan "Add to booking"
    cy.contains(/^No, thanks$/i, { timeout: 20000 }).should("be.visible").click();
    cy.contains(/^No, thanks$/i).should("not.exist");
  }
}

export default new PassengerDetailPage();