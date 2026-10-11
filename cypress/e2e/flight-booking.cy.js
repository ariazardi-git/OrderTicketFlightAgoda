import dayjs from "dayjs";
import HomePage from "../pages/HomePage";
import SearchResultPage from "../pages/SearchResultPage";
import PassengerDetailPage from "../pages/PassengerDetailPage";
import PaymentPage from "../pages/PaymentPage";

describe("Agoda - Booking Flight Jakarta ke Singapore", () => {
  it("memesan Malaysia Airlines paling awal sampai halaman pembayaran", () => {
    const pax = Cypress.expose("passenger");
    const hasil = {};

    cy.intercept("POST", "**/api/flights-bff/search/v1/flights*").as("flightsApi");

    // poin a: cari penerbangan Jakarta -> Singapore untuk besok
    HomePage.visit();
    HomePage.selectOrigin(Cypress.expose("origin"));
    HomePage.selectDestination(Cypress.expose("destination"));
    HomePage.selectDepartureDate(dayjs().add(1, "day"));
    HomePage.clickSearch();
    cy.wait("@flightsApi", { timeout: 60000 });

    // poin b: pilih Malaysia Airlines dengan jam berangkat paling awal
    SearchResultPage.pilihPenerbanganTerawal(Cypress.expose("airline")).then((f) => {
      hasil.dipilih = f;
      cy.log(`Dipilih: ${f.departure} -> ${f.arrival}, Rp ${f.price}`);
    });

    // poin c: isi data penumpang di halaman passenger detail
    PassengerDetailPage.waitForPage();
    PassengerDetailPage.isiForm(pax);
    PassengerDetailPage.getRingkasan().then((r) => {
      hasil.passengerDetail = r;
    });
    cy.screenshot("passenger-detail-terisi");

    PassengerDetailPage.continueToPayment();

    // poin d, e, f: semua pengecekan di halaman pemilihan pembayaran
    PaymentPage.waitForPage();
    PaymentPage.getRingkasan().then((p) => {
      // d: total harga dan data penumpang sama seperti di passenger detail
      expect(p.total, "total harga").to.eq(hasil.passengerDetail.total);
      expect(p.total, "total harga sama dengan kartu penerbangan").to.eq(hasil.dipilih.price);

      const nama = `${pax.firstName} ${pax.lastName}`.toUpperCase();
      expect(p.teks.toUpperCase(), "nama penumpang").to.include(nama);
      expect(p.teks, "nomor paspor").to.include(pax.passportNumber);
      expect(p.teks, "email").to.include(pax.email);
      expect(p.teks, "telepon").to.include(pax.phone);

      // e: jam berangkat dan tiba sama seperti saat memilih penerbangan
      expect(p.berangkat, "jam berangkat").to.eq(hasil.dipilih.departure);
      expect(p.tiba, "jam tiba").to.eq(hasil.dipilih.arrival);
    });

    // f: berada di halaman memilih pembayaran (tidak perlu membayar)
    cy.contains("Payment method").should("be.visible");
    cy.contains(/pay now/i).should("exist");
    cy.screenshot("halaman-pembayaran");
  });
});