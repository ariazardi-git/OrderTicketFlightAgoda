const CARD = '[data-testid="flightCard-flight-detail"]';
const SELECT_BTN = '[data-testid="flight-detail-select-button"]';

const ambilJam = (txt) => (txt.match(/\d{2}:\d{2}/) || [""])[0];

class SearchResultPage {
  // memilih penerbangan paling awal milik satu maskapai dari kartu yang termuat,
  // lalu klik kartunya dan tombol Select. Mengembalikan data penerbangan terpilih.
  pilihPenerbanganTerawal(airline) {
    return cy
      .get(CARD, { timeout: 60000 })
      .should("have.length.greaterThan", 0)
      .then(($cards) => {
        const daftar = Array.from($cards)
          .map((el, index) => {
            const $el = Cypress.$(el);
            const hargaTeks = $el
              .find('[data-testid="flight-price-breakdown"] span')
              .last()
              .text();
            return {
              index,
              airline: $el.find('img[data-testid="airline-logo"]').attr("alt"),
              departure: ambilJam($el.find('[data-testid="departure-time"]').text()),
              arrival: ambilJam($el.find('[data-testid="arrival-time"]').text()),
              price: Number(hargaTeks.replace(/[^\d]/g, "")),
            };
          })
          .filter((f) => f.airline === airline && f.departure);

        expect(daftar, `kartu ${airline} yang termuat`).to.not.be.empty;

        // format HH:MM bisa diurutkan sebagai teks; jam sama -> urutan di daftar
        daftar.sort((a, b) => a.departure.localeCompare(b.departure) || a.index - b.index);
        const terpilih = daftar[0];

        cy.get(CARD).eq(terpilih.index).scrollIntoView().click();
        cy.get(SELECT_BTN, { timeout: 15000 }).first().click();

        return cy.wrap(terpilih);
      });
  }
}

export default new SearchResultPage();