let cfChartInstance = null;
let lcChartInstance = null;

function loadStats() {
  const leetcodeUser = document.getElementById("leetcodeInput").value.trim();
  const codeforcesUser = document.getElementById("codeforcesInput").value.trim();

  if (!leetcodeUser && !codeforcesUser) {
    alert("Please enter at least one username.");
    return;
  }

  //LeetCode
  if (leetcodeUser) {
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
        } else {
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
        }
      })
      .catch(() => {
        document.querySelector("#leetcode .stats").innerText = "Error fetching LeetCode data.";
        if (lcChartInstance) {
          lcChartInstance.destroy();
          lcChartInstance = null;
        }
      });
  } else {
    document.querySelector("#leetcode .stats").innerText = "";
    if (lcChartInstance) {
      lcChartInstance.destroy();
      lcChartInstance = null;
    }
  }

  //Codeforces
  if (codeforcesUser) {
    document.querySelector("#codeforces .stats").innerText = "Fetching records...";

    const cfUrl = `/api/codeforces?handle=${codeforcesUser}`;

    fetch(cfUrl)
      .then(res => res.json())
      .then(data => {
        if (data.status !== "OK") {
          document.querySelector("#codeforces .stats").innerText = "Invalid Codeforces username.";
          if (cfChartInstance) {
            cfChartInstance.destroy();
            cfChartInstance = null;
          }
          return;
        }

        const user = data.result[0];
        document.querySelector("#codeforces .stats").innerHTML = `
          <strong>Handle:</strong> ${user.handle}<br>
          <strong>Rank:</strong> ${user.rank}<br>
          <strong>Rating:</strong> ${user.rating} (Max: ${user.maxRating})<br>
          <strong>Contribution:</strong> ${user.contribution}
        `;


        fetch(`/api/codeforces?handle=${codeforcesUser}&type=rating`);
        fetch(ratingUrl)
          .then(res => res.json())
          .then(ratingData => {
            if (ratingData.status !== "OK") return;

            const history = ratingData.result;
            const labels = history.map(entry => entry.contestName);
            const ratings = history.map(entry => entry.newRating);

            if (cfChartInstance) cfChartInstance.destroy();

            const ctx = document.getElementById("cfChart").getContext("2d");

            cfChartInstance = new Chart(ctx, {
              type: "line",
              data: {
                labels: labels,
                datasets: [{
                  label: "Codeforces Rating",
                  data: ratings,
                  fill: false,
                  borderColor: "#2b6777",
                  backgroundColor: "#2b6777",
                  tension: 0.3
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    ticks: {
                      maxRotation: 90,
                      minRotation: 45
                    }
                  }
                },
                plugins: {

                  legend: { display: false },
                  tooltip: { enabled: true }
                }
              }
            });
          });
      })
      .catch((err) => {
        console.error("Codeforces fetch error:", err);
        document.querySelector("#codeforces .stats").innerText = "Error fetching Codeforces data.";
        if (cfChartInstance) {
          cfChartInstance.destroy();

          cfChartInstance = null;
        }
      });
  } else {
    document.querySelector("#codeforces .stats").innerText = "";
    if (cfChartInstance) {
      cfChartInstance.destroy();
      cfChartInstance = null;
    }
  }
}
