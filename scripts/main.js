function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

function buildChart(title, xLabel, yLabel)
{
    var ctx = document.getElementById('theChart');

    ctx.style.backgroundColor = '#ffffff';

    const chart = new Chart(ctx, {
      type: 'scatter',  
      data: {
            datasets: [{
            data: data
            }]
        },
        options: {
            title: {
                display: true,
                text: title,
                position: 'top',
                fontSize: 48,
                fontColor: '#000000'
            },
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: xLabel,
                        fontSize: 24,
                        fontColor: '#000000'
                    },
                    ticks: {
                       fontSize: 24,
                       fontColor: '#000000'
                    },
                    gridLines: {
                        color: "#000000"
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: yLabel,
                        fontSize: 24,
                        fontColor: '#000000'
                    },
                    ticks: {
                        fontSize: 24,
                        fontColor: '#000000'
                    },
                    gridLines: {
                        color: "#000000"
                    }
                }]
            }
//          ,devicePixelRatio: 10
        },
        plugins: {
            afterUpdate: chart => {
                chart.getDatasetMeta(0).data.forEach((d, i) => d._model.pointStyle = pointStyles[i]);
            }
        }
    });
}
