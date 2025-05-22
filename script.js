fetch("assets/data/gsheet_data.json")
  .then((response) => {
    if (!response.ok) throw new Error("Failed to load JSON");
    return response.json();
  })
  .then((data) => {
    renderProblems(data);
  })
  .catch((err) => {
    console.error("Error loading data:", err);
  });

function renderProblems(data) {
  const grouped = {};
  data.forEach((problem) => {
    if (!grouped[problem.Topic]) {
      grouped[problem.Topic] = [];
    }
    grouped[problem.Topic].push(problem);
  });

  const container = document.getElementById("problem-container");

  for (const topic in grouped) {
    // Create section wrapper to group heading + table
    const section = document.createElement("div");
    section.className = "topic-section";

    // Topic heading
    const topicHeader = document.createElement("h2");
    topicHeader.textContent =`${topic} (${grouped[topic].length})`;;
    section.appendChild(topicHeader);

    // Table body
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");

    grouped[topic].forEach((problem) => {
      const tr = document.createElement("tr");

      const nameTd = document.createElement("td");
      nameTd.innerHTML = `<a href="${problem.Link}" target="_blank">${problem["Problem Name"]}<span class="external-link">↗</span></a>`;

      const diffTd = document.createElement("td");
      diffTd.textContent = problem.Difficulty;

      const platformTd = document.createElement("td");
      const platformImg = document.createElement("img");

      console.log(`[${problem.Platform}]`);

      let platformIcon = "";
      switch (problem.Platform) {
        case "GeeksForGeeks":
          platformIcon = "assets/images/gfg.svg";
          break;
        case "LeetCode":
          platformIcon = "assets/images/lc.svg";
          break;
        case "Coding Ninjas":
          platformIcon = "assets/images/cn.svg";
          break;
      }

      if (platformIcon) {
        platformImg.src = platformIcon;
        platformImg.alt = problem.Platform;
        platformImg.title = problem.Platform;
        platformImg.className = "platform-icon";
        platformTd.appendChild(platformImg);
      } else {
        platformTd.textContent = problem.Platform; // fallback
      }

      // platformTd.textContent = problem.Platform;

      tr.appendChild(nameTd);
      tr.appendChild(diffTd);
      tr.appendChild(platformTd);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    // Wrap table in scrollable div
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "responsive-table";
    tableWrapper.appendChild(table);

    section.appendChild(tableWrapper);
    container.appendChild(section);
  }
}
