function tabulate() {
    let a = parseFloat(document.getElementById("a").value);
    let b = parseFloat(document.getElementById("b").value);
    let n = parseInt(document.getElementById("n").value);

    if (n < 2 || isNaN(a) || isNaN(b) || isNaN(n) || a >= b) {
        alert("Enter valid values!");
        return;
    }

    let tableBody = document.querySelector("#resultTable tbody");
    tableBody.innerHTML = ""; 
    let xValues = [];
    let yValues = [];

    let step = (b - a) / (n - 1);
    for (let i = 0; i < n; i++) {
        let x = a + i * step;
        let y = x + Math.sqrt(x) + Math.cbrt(x) - 2.5;

        xValues.push(x);
        yValues.push(y);

        let row = tableBody.insertRow();
        row.insertCell(0).textContent = x.toFixed(4);
        row.insertCell(1).textContent = y.toFixed(4);
    }

    drawChart(xValues, yValues);
}

function drawChart(xValues, yValues) {
    let ctx = document.getElementById("chartCanvas").getContext("2d");
    
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                label: "f(x)",
                data: yValues,
                borderColor: "blue",
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                borderWidth: 2,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "x" } },
                y: { title: { display: true, text: "f(x)" } }
            }
        }
    });
}
