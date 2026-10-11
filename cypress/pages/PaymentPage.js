// total akhir = angka "Rp" terakhir setelah kata "Total" terakhir
const ambilTotal = (teks) => {
  const idx = teks.lastIndexOf("Total");
  if (idx < 0) return null;
  const angka = teks.slice(idx).match(/Rp\s*[\d,]+/g) || [];
  if (!angka.length) return null;
  const n = Number(angka[angka.length - 1].replace(/[^\d]/g, ""));
  return n > 0 ? n : null;
};

class PaymentPage {
  elements = {
    paymentDetails: () => cy.get('[data-testid="payment-details"]', { timeout: 60000 }),
    routeInfo: () =>
      cy.get('[data-testid="flight-slice-item-origin-dest"]', { timeout: 30000 }),
  };

  waitForPage() {
    cy.location("pathname", { timeout: 60000 }).should("include", "/packages/payment");
    this.elements.paymentDetails().should("be.visible");
  }

  // membaca total, jam, dan seluruh teks halaman untuk dicek
  getRingkasan() {
    return cy
      .get("body", { timeout: 60000 })
      .should(($b) => {
        expect(ambilTotal($b[0].innerText), "total harga sudah termuat").to.be.a("number");
      })
      .then(($b) => {
        const teks = $b[0].innerText;
        return this.elements.routeInfo().invoke("text").then((rute) => {
          const m = rute.match(/CGK\s*(\d{2}:\d{2})[\s\S]*?SIN\s*(\d{2}:\d{2})/);
          return {
            teks,
            total: ambilTotal(teks),
            berangkat: m ? m[1] : null,
            tiba: m ? m[2] : null,
          };
        });
      });
  }
}

export default new PaymentPage();