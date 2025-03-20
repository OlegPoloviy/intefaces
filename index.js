document.addEventListener("DOMContentLoaded", () => {
  // Налаштовуємо початкові значення слайдерів
  updateRangeValue("a");
  updateRangeValue("b");
  updateRangeValue("n");

  // Підписуємось на зміни текстових полів
  document
    .getElementById("a")
    .addEventListener("input", () => updateSlider("a"));
  document
    .getElementById("b")
    .addEventListener("input", () => updateSlider("b"));
  document
    .getElementById("n")
    .addEventListener("input", () => updateSlider("n"));

  // Відразу побудуємо графік за замовчуванням
  tabulate();
});

function updateRangeValue(id) {
  const slider = document.getElementById(`${id}-slider`);
  const input = document.getElementById(id);
  const display = document.getElementById(`${id}-value`);

  input.value = slider.value;
  display.textContent = slider.value;
}

function updateSlider(id) {
  const slider = document.getElementById(`${id}-slider`);
  const input = document.getElementById(id);
  const display = document.getElementById(`${id}-value`);

  if (input.value && !isNaN(input.value)) {
    // Обмежимо значення слайдера
    if (id === "a" || id === "b") {
      if (input.value < -10) input.value = -10;
      if (input.value > 10) input.value = 10;
    } else if (id === "n") {
      if (input.value < 2) input.value = 2;
      if (input.value > 100) input.value = 100;
    }

    slider.value = input.value;
    display.textContent = input.value;
  }
}

function selectPresetFunction() {
  const select = document.getElementById("preset-function");
  const functionInput = document.getElementById("function");

  if (select.value) {
    functionInput.value = select.value;
  }
}

function toggleOptions() {
  const panel = document.getElementById("optionsPanel");
  const button = document.getElementById("optionsButton");

  if (panel.style.display === "none") {
    panel.style.display = "block";
    button.textContent = "Параметри ⚙️ (×)";
  } else {
    panel.style.display = "none";
    button.textContent = "Параметри ⚙️";
  }
}

function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById("theme-icon");

  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    themeIcon.textContent = "☀️";
  } else {
    themeIcon.textContent = "🌙";
  }

  // Перемалюємо графік, якщо він існує
  if (window.myChart) {
    const isDarkMode = body.classList.contains("dark-mode");
    window.myChart.options.scales.x.grid.color = isDarkMode
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)";
    window.myChart.options.scales.y.grid.color = isDarkMode
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)";
    window.myChart.options.scales.x.ticks.color = isDarkMode
      ? "#ffffff"
      : "#666";
    window.myChart.options.scales.y.ticks.color = isDarkMode
      ? "#ffffff"
      : "#666";
    window.myChart.update();
  }
}

function clearResults() {
  document.querySelector("#resultTable tbody").innerHTML = "";

  if (window.myChart) {
    window.myChart.destroy();
    window.myChart = null;
  }
}

function exportData() {
  const table = document.getElementById("resultTable");
  const rows = table.querySelectorAll("tbody tr");

  if (rows.length === 0) {
    alert("Немає даних для експорту. Спочатку проведіть табуляцію.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,x,f(x)\n";

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    csvContent += `${cells[0].textContent},${cells[1].textContent}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "function_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function evaluateFunction(x, funcStr) {
  try {
    // Використовуємо безпечний спосіб виконання функції з перевіркою
    const func = new Function(
      "x",
      `
                try {
                    return ${funcStr};
                } catch (e) {
                    console.error("Помилка при обчисленні функції:", e);
                    return NaN;
                }
            `
    );

    return func(x);
  } catch (e) {
    console.error("Помилка при створенні функції:", e);
    return NaN;
  }
}

function tabulate() {
  let a = parseFloat(document.getElementById("a").value);
  let b = parseFloat(document.getElementById("b").value);
  let n = parseInt(document.getElementById("n").value);
  let functionStr = document.getElementById("function").value;
  let precision = parseInt(document.getElementById("precision").value) || 4;

  if (n < 2 || isNaN(a) || isNaN(b) || isNaN(n) || a >= b) {
    alert("Введіть коректні значення! Переконайтеся, що a < b і n >= 2");
    return;
  }

  try {
    // Перевірка валідності функції на тестовому значенні
    let testValue = evaluateFunction(1, functionStr);
    if (isNaN(testValue)) {
      throw new Error("Функція повертає NaN");
    }
  } catch (e) {
    alert("Помилка у функції: " + e.message);
    return;
  }

  let tableBody = document.querySelector("#resultTable tbody");
  tableBody.innerHTML = "";
  let xValues = [];
  let yValues = [];

  let step = (b - a) / (n - 1);
  for (let i = 0; i < n; i++) {
    let x = a + i * step;
    let y = evaluateFunction(x, functionStr);

    xValues.push(x);
    yValues.push(y);

    let row = tableBody.insertRow();
    row.insertCell(0).textContent = x.toFixed(precision);
    row.insertCell(1).textContent = y.toFixed(precision);

    // Підсвічуємо рядки, де функція змінює знак
    if (i > 0 && yValues[i - 1] * y < 0) {
      row.style.backgroundColor = "rgba(255, 241, 118, 0.3)";
      row.title = "Можливий корінь функції між цією та попередньою точкою";
    }
  }

  drawChart(xValues, yValues);
}

function drawChart(xValues, yValues) {
  let ctx = document.getElementById("chartCanvas").getContext("2d");
  let chartType = document.getElementById("chartType").value || "line";
  let chartColor = document.getElementById("chartColor").value || "#3498db";
  let isDarkMode = document.body.classList.contains("dark-mode");

  if (window.myChart) {
    window.myChart.destroy();
  }

  let chartConfig = {
    type: chartType,
    data: {
      labels: xValues.map((x) => parseFloat(x).toFixed(2)),
      datasets: [
        {
          label: "f(x)",
          data: yValues,
          borderColor: chartColor,
          backgroundColor:
            chartType === "line"
              ? `rgba(${parseInt(chartColor.slice(1, 3), 16)}, 
                                           ${parseInt(
                                             chartColor.slice(3, 5),
                                             16
                                           )}, 
                                           ${parseInt(
                                             chartColor.slice(5, 7),
                                             16
                                           )}, 0.2)`
              : chartColor,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: isDarkMode ? "#ffffff" : "#333",
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `f(${parseFloat(context.label).toFixed(
                4
              )}) = ${context.parsed.y.toFixed(4)}`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "x",
            color: isDarkMode ? "#ffffff" : "#333",
          },
          grid: {
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: isDarkMode ? "#ffffff" : "#666",
          },
        },
        y: {
          title: {
            display: true,
            text: "f(x)",
            color: isDarkMode ? "#ffffff" : "#333",
          },
          grid: {
            color: isDarkMode
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            color: isDarkMode ? "#ffffff" : "#666",
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index",
      },
    },
  };

  // Додаткові опції для точкового графіка
  if (chartType === "scatter") {
    chartConfig.data.datasets[0].showLine = false;
    chartConfig.options.scales.x.type = "linear";
  }

  window.myChart = new Chart(ctx, chartConfig);
}
