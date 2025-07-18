let lcChartInstance = null;
let latestLcData = null;
let latestUsername = null;

function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", document.body.classList.contains("dark-theme") ? "dark" : "light");
}

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }
});

function loadStats() {
  const leetcodeUser = document.getElementById("leetcodeInput").value.trim();
  if (!leetcodeUser) {
    alert("Please enter a LeetCode username.");
    return;
  }

  document.querySelector("#leetcode .stats").innerText = "Fetching records...";

  const lcUrl = `https://leetcode-stats-api.herokuapp.com/${leetcodeUser}`;
  fetch(lcUrl)
    .then(res => res.json())
    .then(data => {
      if (data.status === "error" || data.message === "user not found") {
        document.querySelector("#leetcode .stats").innerText = "Invalid LeetCode username.";
        if (lcChartInstance) {
          lcChartInstance.destroy();
          lcChartInstance = null;
        }
        return;
      }


      latestLcData = data;
      latestUsername = leetcodeUser;

      document.querySelector("#leetcode .stats").innerHTML = `
        <strong>Total Solved:</strong> ${data.totalSolved}<br>
        <strong>Easy:</strong> ${data.easySolved}, 
        <strong>Medium:</strong> ${data.mediumSolved}, 
        <strong>Hard:</strong> ${data.hardSolved}<br>
        <strong>Ranking:</strong> ${data.ranking}<br>
        <strong>Reputation:</strong> ${data.reputation}
      `;


      if (lcChartInstance) lcChartInstance.destroy();
      const ctx = document.getElementById("lcChart").getContext("2d");
      lcChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Easy", "Medium", "Hard"],
          datasets: [{
            label: "Problems Solved",
            data: [data.easySolved, data.mediumSolved, data.hardSolved],
            backgroundColor: ["#4caf50", "#ffb300", "#f44336"]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 10 }
            }
          }

        }
      });
    })

    .catch(() => {
      document.querySelector("#leetcode .stats").innerText = "Error fetching LeetCode data.";
      if (lcChartInstance) {
        lcChartInstance.destroy();
        lcChartInstance = null;
      }
    });
}


function downloadCSV() {
  if (!latestLcData || !latestUsername) {
    alert("Please load stats first.");
    return;
  }

  
  const data = latestLcData;
  const csv = `LeetCode Username,Total Solved,Easy,Medium,Hard,Ranking,Reputation\n` +
              `${latestUsername},${data.totalSolved},${data.easySolved},${data.mediumSolved},${data.hardSolved},${data.ranking},${data.reputation}`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${latestUsername}_leetcode_stats.csv`;
  a.click();
}

function downloadPDF() {
  if (!latestLcData || !latestUsername) {
    alert("Please load stats first.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const data = latestLcData;

  doc.setFontSize(16);
  doc.text("LeetCode Stats", 20, 20);

  doc.setFontSize(12);
  const lines = [
    `Username: ${latestUsername}`,
    `Total Solved: ${data.totalSolved}`,
    `Easy: ${data.easySolved}`,
    `Medium: ${data.mediumSolved}`,
    `Hard: ${data.hardSolved}`,
    `Ranking: ${data.ranking}`,
    `Reputation: ${data.reputation}`
  ];

  lines.forEach((line, i) => doc.text(line, 20, 40 + i * 10));
  doc.save(`${latestUsername}_leetcode_stats.pdf`);
}
