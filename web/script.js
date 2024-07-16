let chart = echarts.init(document.getElementById('chart'));

document.getElementById('uploadForm').onsubmit = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    alert(result.message);
};

document.getElementById('runButton').onclick = async () => {
    const response = await fetch('/api/run-workflow', {
        method: 'POST'
    });
    const result = await response.json();
    alert(result.message);
    if (result.results) {
        updateChart(result.results);
    }
};

async function fetchResults() {
    const response = await fetch('/api/get-results', {
        method: 'GET'
    });
    const result = await response.json();
    if (result.results) {
        updateChart(result.results);
    }
}

function updateChart(results) {
    // 根据输出价格进行排序
    results.sort((a, b) => parseFloat(a.output_price) - parseFloat(b.output_price));

    const names = results.map(row => row.name);
    const platforms = results.map(row => row.platform);
    const inputPrices = results.map(row => -parseFloat(row.input_price)); // 输入价格乘以-1
    const outputPrices = results.map(row => parseFloat(row.output_price));

    const option = {
        title: {
            text: '大模型价格统计：人民币/M tokens'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['输入价格', '输出价格']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            position: 'top',
            splitLine: { lineStyle: { type: 'dashed' } }
        },
        yAxis: {
            type: 'category',
            axisLabel: {
                interval: 0,
                // rotate: 30 // 旋转标签
            },
            splitLine: { lineStyle: { type: 'dashed' } },
            data: names
        },
        series: [
            {
                name: '输入价格',
                type: 'bar',
                stack: '总量',
                label: {
                    show: true,
                    position: 'left', // 标签位置
                    formatter: function(params) {
                        return platforms[params.dataIndex]; // 显示平台名称
                    }
                },
                data: inputPrices
            },
            {
                name: '输出价格',
                type: 'bar',
                stack: '总量',
                label: {
                    show: true,
                    position: 'right', // 标签位置
                },
                data: outputPrices
            }
        ]
    };

    chart.setOption(option);
}

window.onload = fetchResults;
