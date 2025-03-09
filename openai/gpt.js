const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let xuanz;
async function askNumber() {
    return new Promise((resolve) => {
        rl.question('请输入一个数字：', (input) => {
            xuanz = parseInt(input); // 将输入转换为整数
            if (isNaN(xuanz)) { // 判断是否为数字
                console.log('输入错误，请重新输入！');
                resolve(askNumber()); // 如果不是数字则重新询问，并返回 Promise 对象
            } else {
                resolve(xuanz);
            }
        });
    });
}

async function askString(xuanz) {
    rl.question('请输入一个字符串：', async (string) => {
        console.log(`你输入的数字是：${xuanz}`);
        console.log(`你输入的字符串是：${string}`);
        async function fetchData(url) {
            try {
                const response = await fetch(url);
                const contentType = await response.headers.get('content-type');
                console.log(contentType);
                let data, obj;
                if (contentType.includes('application/json')) {
                    obj = await response.json();
                    data = obj;
                } else if (contentType.includes('text/html')) {
                    obj = await response.text();
                    data = obj;
                } else if (contentType.includes('application/xml')) {
                    obj = await response.text();
                    data = obj;
                } else {
                    data = '不支持的类型';
                }
                return data;
            } catch (error) {
                console.error('获取数据时出错:', error);
            }
        }
        const msg = string

        console.log(`数字${xuanz}文字${msg}`);
        // const msg = "你好，你叫什么名字"
        const urls = [
            'https://api.pearktrue.cn/api/gpt', //应用GPT-3.5-Turbo模型进行智能问答
            'http://api.sc1.fun/API/ChatGPT.php', //ChatGPT-3.5连续对话模型[无需apikey,打造最优质的API]
            'https://api.a20safe.com/api.php', //版本ChatGPT3.5，支持连续对话，支持多对话
            'https://api.pearktrue.cn/api/gpt/continuous.php', //应用GPT-3.5-Turbo模型进行记忆对话问答
        ];
        const paramsArray = [{
                message: msg
            },
            {
                msg: msg,
                type: 'wifi',
                mos: 'json',
                id: '1'
            },
            {
                api: '36',
                key: '69ecc28841a61680a37ccd236ec5e3e9',
                text: msg
            }, {
                id: '1682142620',
                message: msg
            }
        ];

        // 随机选择一个 URL 和对应的参数
        //const randomIndex = Math.floor(Math.random() * urls.length);
        let selectedUrl = urls[xuanz];
        //const selectedUrl = urls[randomIndex];
        //const selectedParams = paramsArray[randomIndex];
        let selectedParams = paramsArray[xuanz];

        // 拼接选中的 URL 和参数
        const queryParams = Object.keys(selectedParams)
            .map(key => `${key}=${selectedParams[key]}`)
            .join('&');
        const finalUrl = `${selectedUrl}?${queryParams}`;
        console.log(xuanz);
        console.log(finalUrl);
        try {
            const data = await fetchData(finalUrl); // 等待 fetchData 执行完毕并获取结果
            if (xuanz === 0) {
                console.log(data.answer);
            } else if (xuanz === 1) {
                console.log(data.message);
            } else if (xuanz === 2) {
                if (data?.data?.[0]?.reply !== undefined) {
                    console.log("有reply");
                } else {
                    console.log(data.msg)
                }
            } else if (xuanz === 3) {
                console.log(data.message);
            }
            console.log(data);

            const nextNumber = await askNumber(); // 等待 askNumber 结束并获取结果
            await askString(nextNumber); // 递归调用 askString
        } catch (error) {
            console.error(error);
        }
    });
}

(async () => {
    const number = await askNumber(); // 获取第一个输入的数字
    await askString(number); // 开始循环
})();