(function (window, document) {
  let balanceChartInstance = null;
  const CHART_LINE_TENSION = 0.6;

  const CHART_PALETTES = {
    positive: {
      line: "#20d46b",
      point: "#20d46b",
      pointMuted: "rgba(32, 212, 107, 0.22)",
      fill: "rgba(32, 212, 107, 0.16)",
      tooltipBorder: "rgba(32, 212, 107, 0.24)"
    },
    negative: {
      line: "#ff5b5b",
      point: "#ff5b5b",
      pointMuted: "rgba(255, 91, 91, 0.22)",
      fill: "rgba(255, 91, 91, 0.16)",
      tooltipBorder: "rgba(255, 91, 91, 0.24)"
    },
    neutral: {
      line: "#35c2ff",
      point: "#35c2ff",
      pointMuted: "rgba(53, 194, 255, 0.22)",
      fill: "rgba(53, 194, 255, 0.12)",
      tooltipBorder: "rgba(53, 194, 255, 0.2)"
    }
  };

  function formatChartCurrency(value, options = {}) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      ...options
    });
  }

  function destroyBalanceChart() {
    if (balanceChartInstance) {
      balanceChartInstance.destroy();
      balanceChartInstance = null;
    }
  }

  function getChartTone(value) {
    const numericValue = Number(value || 0);

    if (numericValue > 0) {
      return "positive";
    }

    if (numericValue < 0) {
      return "negative";
    }

    return "neutral";
  }

  function getChartPalette(value) {
    return CHART_PALETTES[getChartTone(value)];
  }

  function getSegmentPalette(startValue, endValue) {
    const startNumber = Number(startValue || 0);
    const endNumber = Number(endValue || 0);

    if (startNumber >= 0 && endNumber >= 0) {
      return getChartPalette(Math.max(startNumber, endNumber));
    }

    if (startNumber <= 0 && endNumber <= 0) {
      return getChartPalette(Math.min(startNumber, endNumber));
    }

    return getChartPalette(endNumber);
  }

  function render(chartSeries = {}) {
    const canvas = document.getElementById("balanceChart");
    if (!canvas) return;

    destroyBalanceChart();

    const labels = Array.isArray(chartSeries.labels) ? chartSeries.labels : [];
    const data = Array.isArray(chartSeries.data) ? chartSeries.data : [];
    const points = Array.isArray(chartSeries.points) ? chartSeries.points : [];
    const latestValue = data.length ? data[data.length - 1] : 0;
    const latestPalette = getChartPalette(latestValue);

    balanceChartInstance = new window.Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Saldo",
            data,
            fill: {
              target: "origin",
              above: CHART_PALETTES.positive.fill,
              below: CHART_PALETTES.negative.fill
            },
            tension: CHART_LINE_TENSION,
            cubicInterpolationMode: "monotone",
            borderWidth: 3,
            segment: {
              borderColor(context) {
                const startValue = context.p0.parsed.y;
                const endValue = context.p1.parsed.y;

                return getSegmentPalette(startValue, endValue).line;
              }
            },
            pointRadius(context) {
              const point = points[context.dataIndex];
              return point?.marker === "activity" ? 4 : 2;
            },
            pointHoverRadius(context) {
              const point = points[context.dataIndex];
              return point?.marker === "activity" ? 7 : 5;
            },
            pointBackgroundColor(context) {
              const point = points[context.dataIndex];
              const value = data[context.dataIndex];
              const palette = getChartPalette(value);

              return point?.marker === "activity"
                ? palette.point
                : palette.pointMuted;
            },
            pointBorderColor(context) {
              const point = points[context.dataIndex];
              const value = data[context.dataIndex];
              const palette = getChartPalette(value);

              return point?.marker === "activity"
                ? palette.point
                : palette.pointMuted;
            },
            pointHoverBackgroundColor(context) {
              const value = data[context.dataIndex];
              return getChartPalette(value).point;
            },
            pointHoverBorderColor(context) {
              const value = data[context.dataIndex];
              return getChartPalette(value).point;
            },
            borderColor: latestPalette.line,
            backgroundColor: latestPalette.fill
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 700
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: "rgba(8, 17, 31, 0.95)",
            borderColor: latestPalette.tooltipBorder,
            borderWidth: 1,
            titleColor: "#f4f7fb",
            bodyColor: "#dbe7f5",
            displayColors: false,
            callbacks: {
              title(context) {
                const point = points[context[0]?.dataIndex];
                return point?.label || context[0]?.label || "Saldo";
              },
              label(context) {
                return `Saldo: ${formatChartCurrency(context.raw)}`;
              },
              afterLabel(context) {
                const point = points[context.dataIndex];

                if (!point) {
                  return "";
                }

                if (point.marker === "start") {
                  return "Saldo no in\u00edcio do per\u00edodo";
                }

                if (point.marker === "end") {
                  return "Saldo ao final do per\u00edodo";
                }

                if (point.netChange) {
                  return `Movimenta\u00e7\u00e3o do dia: ${formatChartCurrency(point.netChange)}`;
                }

                return "";
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              display: false
            },
            grid: {
              color: "rgba(255, 255, 255, 0.05)"
            },
            border: {
              color: "rgba(255, 255, 255, 0.06)"
            }
          },
          y: {
            ticks: {
              color: "#8fa3c7",
              callback(value) {
                return formatChartCurrency(value, {
                  maximumFractionDigits: 0
                });
              }
            },
            grid: {
              color: "rgba(255, 255, 255, 0.05)"
            },
            border: {
              color: "rgba(255, 255, 255, 0.06)"
            }
          }
        }
      }
    });
  }

  window.EZSaldoBalanceChart = {
    destroy: destroyBalanceChart,
    render
  };
})(window, document);
