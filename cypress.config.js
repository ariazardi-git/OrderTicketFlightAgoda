const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video: true,
  defaultBrowser: "chrome",
  retries: { runMode: 0, openMode: 0 },
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  expose: {
    origin: "Jakarta",
    destination: "Singapore",
    airline: "Malaysia Airlines",
    passenger: {
      gender: "Male",
      firstName: "Budi",
      lastName: "Santoso",
      email: "budi@example.com",
      phone: "81234567890",
      birthDay: "15",
      birthMonth: 5,
      birthYear: "1995",
      nationality: "Indonesia",
      passportNumber: "A1234567",
      passportCountry: "Indonesia",
      expiryDay: "20",
      expiryMonth: 8,
      expiryYear: "2031",
    },
  },
  e2e: {
    baseUrl: "https://www.agoda.com",
    chromeWebSecurity: false,
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 60000,
    viewportWidth: 1366,
    viewportHeight: 768,
    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);
      return config;
    },
  },
});