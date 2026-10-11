# Final Project Bootcamp Cypress AfterOffice Batch #1

E2E automation pemesanan tiket flight di agoda.com:
Jakarta -> Singapura, Malaysia Airlines, penerbangan paling awal untuk besok.

## Cara menjalankan

    npm install
    npx cypress run --browser chrome

Hasil: video di `cypress/videos`, report HTML di `cypress/reports/index.html`.

## Struktur

- `cypress/pages` : Page Object Model (HomePage, SearchResultPage, PassengerDetailPage, PaymentPage)
- `cypress/e2e/flight-booking.cy.js` : skenario utama
- `cypress.config.js` : konfigurasi dan environment variable (blok `expose`)

## Keterbatasan

Saat dijalankan lewat Cypress, Agoda hanya mengembalikan 20 hasil pertama, dan filter
maskapai serta pengurutan bawaan Agoda tidak berfungsi di browser otomatis. Karena itu
"penerbangan paling awal" dipilih dari penerbangan Malaysia Airlines yang termuat di halaman
hasil, dan hasilnya bisa berbeda tiap dijalankan. Data penumpang adalah data dummy.
Test berhenti di halaman pemilihan pembayaran dan tidak melakukan pembayaran.