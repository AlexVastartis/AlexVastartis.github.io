function calcMean(data, useY) {
  const sum = data.reduce((a, b) => a + (useY ? b.y : b), 0);
  return sum / data.length;
}

const data = new Array(500).fill(0).map((v, i) => ({x: i, y: 100 + Math.random() * 100}));

const mean = calcMean(data, true);
const tmp = data.map(p => Math.pow(p.y - mean, 2));
const variance = calcMean(data.map(p => Math.pow(p.y - mean, 2)));
const stddev = Math.sqrt(variance);
const pdf = (x) => {
  const m = stddev * Math.sqrt(2 * Math.PI);
  const e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
  return e / m;
};
const bell = [];
const startX = mean - 3.5 * stddev;
const endX = mean + 3.5 * stddev;
const step = stddev / 7;
let x;
for(x = startX; x <= mean; x += step) {
  bell.push({x, y: pdf(x)});
}
for(x = mean + step; x <= endX; x += step) {
  bell.push({x, y: pdf(x)});
}

const chart = new Chart('chart', {
  type: 'scatter',
  data: {
    datasets: [{
      label: 'Data',
      data,
      backgroundColor: 'rgba(0,200,0,0.3)',
      hoverRadius: 10,
      hoverBackgroundColor: 'yellow',
    },{
      type: 'line',
      label: 'Bell Curve',
      data: bell,
      xAxisID: 'x2',
      yAxisID: 'y2',
      fill: true,
      tension: 0.4,
      radius: 0,
      backgroundColor: 'rgba(0,0,200,0.3)',
    }]
  },
  options: {
    interaction: {
      mode: 'nearest',
      intersect: false
    },
    scales: {
      x: {min: 0, max: 500},
      y: {min: 0, max: 300, title: {display: true, text: 'Data'}},
      x2: {
        position: 'top',
        type: 'linear',
        grid: {
          display: false
        },
        afterBuildTicks(scale) {
          scale.ticks = bell.map(p => ({value: p.x}))
            .filter((tick, index) => index % 2 === 0);
        },
        ticks: {
          maxRotation: 0
        },
        min: startX,
        max: endX
      },
      y2: {
        type: 'linear',
        position: 'right',
        grid: {
          display: false
        },
        title: {display: true, text: 'Bell Curve'}
      }
    }
  }
})
