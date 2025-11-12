// main.js — Complete TrainLink Booking Flow
document.addEventListener("DOMContentLoaded", () => {
  // ============ GLOBAL HELPERS ============
  const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));
  const load = (key) => JSON.parse(localStorage.getItem(key) || "null");
  const remove = (key) => localStorage.removeItem(key);

  // ============ QUICK SEARCH (Home Page) ============
  const qsBtn = document.getElementById("qs-search");
  if (qsBtn) {
    qsBtn.addEventListener("click", () => {
      const from = document.getElementById("qs-from").value;
      const to = document.getElementById("qs-to").value;
      const date = document.getElementById("qs-date").value;

      if (!from || !to || !date) {
        alert("⚠ Please fill all fields to search.");
        return;
      }
      if (from === to) {
        alert("❌ Source and destination cannot be the same.");
        return;
      }
      const chosen = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        alert("❌ Date cannot be in the past.");
        return;
      }

      save("quickSearch", { from, to, date });
      window.location.href = "booking.html";
    });
  }

  // ============ BOOKING PAGE ============
  const searchBtn = document.getElementById("searchTrains");
  if (searchBtn) {
    // If quick search was used, prefill
    const quick = load("quickSearch");
    if (quick) {
      document.getElementById("from").value = quick.from;
      document.getElementById("to").value = quick.to;
      document.getElementById("date").value = quick.date;
      remove("quickSearch");
    }

    searchBtn.addEventListener("click", () => {
      const from = document.getElementById("from").value;
      const to = document.getElementById("to").value;
      const date = document.getElementById("date").value;
      const travelClass = document.getElementById("class").value;
      const error = document.getElementById("bookError");
      const trainList = document.querySelector(".train-list");
      trainList.innerHTML = "";
      error.textContent = "";

      if (!from || !to || !date || !travelClass) {
        error.textContent = "⚠ Please fill all fields before searching.";
        return;
      }
      if (from === to) {
        error.textContent = "❌ Source and destination cannot be the same.";
        return;
      }
      const chosen = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        error.textContent = "❌ Date cannot be in the past.";
        return;
      }

      // Dummy train data
      const trains = [
        { name: "Rajdhani Express", time: "07:30 AM", fare: 1200 },
        { name: "Shatabdi Express", time: "10:00 AM", fare: 900 },
        { name: "Duronto Express", time: "02:45 PM", fare: 1100 },
        { name: "Garib Rath", time: "08:15 PM", fare: 700 },
      ];

      trains.forEach((t) => {
        const div = document.createElement("div");
        div.classList.add("train-card");
        div.innerHTML = `
          <div>
            <h3>${t.name}</h3>
            <p>${from} → ${to}</p>
            <p>Departure: ${t.time}</p>
          </div>
          <div>
            <p><strong>₹${t.fare}</strong></p>
            <button class="btn-primary select-train">Select</button>
          </div>`;
        trainList.appendChild(div);

        div.querySelector(".select-train").addEventListener("click", () => {
          save("selectedTrain", {
            name: t.name,
            time: t.time,
            fare: t.fare,
            from,
            to,
            date,
            travelClass,
          });
          window.location.href = "confirm.html";
        });
      });
    });
  }

  // ============ CONFIRM PAGE ============
  if (window.location.pathname.includes("confirm.html")) {
    const train = load("selectedTrain");
    const box = document.getElementById("selectedTrain");
    if (!train) {
      box.innerHTML = "<p>No train selected. Go back and choose one.</p>";
    } else {
      box.innerHTML = `
        <h3>${train.name}</h3>
        <p>${train.from} → ${train.to}</p>
        <p>Date: ${train.date} | Class: ${train.travelClass}</p>
        <p>Fare: ₹${train.fare}</p>`;
    }

    document
      .getElementById("confirmBooking")
      .addEventListener("click", (e) => {
        const name = document.getElementById("pname").value.trim();
        const age = document.getElementById("page").value.trim();
        const gender = document.getElementById("pgender").value;
        const error = document.getElementById("confirmError");
        error.textContent = "";

        if (!name || !age || !gender) {
          error.textContent = "⚠ Please fill all fields (name, age, gender).";
          e.preventDefault();
          return;
        }
        if (isNaN(age) || age <= 0) {
          error.textContent = "❌ Please enter a valid age.";
          e.preventDefault();
          return;
        }

        save("passenger", { name, age, gender });
        window.location.href = "payment.html";
      });
  }

  // ============ PAYMENT PAGE ============
  if (window.location.pathname.includes("payment.html")) {
    const train = load("selectedTrain");
    const summary = document.getElementById("summaryBox");
    const cardSection = document.getElementById("cardPayment");
    const upiSection = document.getElementById("upiPayment");

    if (train) {
      summary.innerHTML = `
        <h3>${train.name}</h3>
        <p>${train.from} → ${train.to}</p>
        <p>Date: ${train.date} | Class: ${train.travelClass}</p>
        <p><strong>Fare: ₹${train.fare}</strong></p>`;
    }

    // Toggle payment method
    document
      .querySelectorAll('input[name="payMethod"]')
      .forEach((r) =>
        r.addEventListener("change", () => {
          if (r.value === "card") {
            cardSection.classList.remove("hidden");
            upiSection.classList.add("hidden");
          } else {
            cardSection.classList.add("hidden");
            upiSection.classList.remove("hidden");
          }
        })
      );

    document.getElementById("payNow").addEventListener("click", (e) => {
      const payMethod = document.querySelector(
        'input[name="payMethod"]:checked'
      ).value;
      const error = document.getElementById("payError");
      error.textContent = "";

      if (payMethod === "card") {
        const num = document.getElementById("cardNumber").value.trim();
        const cvv = document.getElementById("cardCVV").value.trim();
        const exp = document.getElementById("cardExpiry").value.trim();
        if (!num || num.length < 16 || !cvv || cvv.length < 3 || !exp) {
          error.textContent =
            "⚠ Please enter valid card details (16-digit number, CVV, expiry).";
          e.preventDefault();
          return;
        }
      } else {
        const upi = document.getElementById("upiId").value.trim();
        if (!upi || !upi.includes("@")) {
          error.textContent = "⚠ Please enter a valid UPI ID (example@upi).";
          e.preventDefault();
          return;
        }
      }

      const passenger = load("passenger");
      save("ticketData", { train, passenger });
      window.location.href = "success.html";
    });
  }

  // ============ SUCCESS PAGE ============
  if (window.location.pathname.includes("success.html")) {
    const data = load("ticketData");
    const box = document.getElementById("ticketDetails");

    if (!data) {
      box.innerHTML = "<p>No booking found.</p>";
    } else {
      box.innerHTML = `
        <h3>${data.train.name}</h3>
        <p><strong>Passenger:</strong> ${data.passenger.name}, ${data.passenger.age} (${data.passenger.gender})</p>
        <p><strong>Route:</strong> ${data.train.from} → ${data.train.to}</p>
        <p><strong>Date:</strong> ${data.train.date}</p>
        <p><strong>Class:</strong> ${data.train.travelClass}</p>
        <p><strong>Fare Paid:</strong> ₹${data.train.fare}</p>`;
    }

    document
      .getElementById("downloadTicket")
      .addEventListener("click", () => {
        window.print();
      });
  }
});
