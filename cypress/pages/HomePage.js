import dayjs from "dayjs";

class HomePage {
  elements = {
    originInput: () => cy.get("#flight-origin-search-input"),
    destinationBox: () => cy.get("#flight-destination-text-search"),
    departureBox: () => cy.get("#flight-departure"),
    calendar: () => cy.get(".rdp-months"),
    searchButton: () => cy.contains("button", /search flights/i),
  };

  visit() {
    cy.visit("/flights", {
      onBeforeLoad(win) {
        // matikan service worker Agoda agar tidak mengganggu test
        if (win.navigator && win.navigator.serviceWorker) {
          delete win.navigator.__proto__.serviceWorker;
        }
      },
    });
  }

  selectOrigin(city) {
    this.elements.originInput().click().type(city);
    // pilih saran pertama yang mengandung nama kota
    cy.contains(city, { matchCase: false }).first().click();
  }

  selectDestination(city) {
    this.elements.destinationBox().click();
    // setelah diklik, biasanya muncul input untuk mengetik
    cy.focused().type(city);
    cy.contains(city, { matchCase: false }).first().click();
  }

  selectDepartureDate(date) {
    const target = dayjs(date).format("YYYY-MM-DD");

    // beri waktu agar kalender yang terbuka otomatis sempat muncul
    cy.wait(1000);

    cy.get("body").then(($body) => {
      // buka kalender hanya jika belum terbuka
      if ($body.find(".rdp-months:visible").length === 0) {
        this.elements.departureBox().click();
      }
    });

    this.elements.calendar().should("be.visible");
    // PERLU DICEK: atribut tanggal di sel kalender
    this.elements.calendar().find(`[data-day="${target}"]`).first().click();
  }

  clickSearch() {
    this.elements.searchButton().click();
  }
}

export default new HomePage();