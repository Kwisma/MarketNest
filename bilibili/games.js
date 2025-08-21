import fs from 'fs';
import fetch from 'node-fetch';

// 控制并发数的函数
async function concurrentFetch(tasks, concurrency = 5) {
    const results = [];
    const executing = [];
    
    for (const task of tasks) {
        const p = Promise.resolve().then(() => task());
        results.push(p);
        
        if (concurrency <= tasks.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            
            if (executing.length >= concurrency) {
                await Promise.race(executing);
            }
        }
    }
    
    return Promise.all(results);
}

// 添加延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchRecentGames() {
    const jsonData = {};
    const concurrency = 5; // 并发数
    const maxPages = 200;
    const failedPages = [];
    
    // 生成所有页面的任务
    const tasks = [];
    for (let i = 1; i <= maxPages; i++) {
        tasks.push(async () => {
            try {
                const URL = `https://le3-api.game.bilibili.com/pc/game/home/feed?platform=pc_web&uid=696970921&page_num=${i}&page_size=20&buvid=6C9C4CB5-6C74-03A2-D544-870A1F2DA69E76441-025080519-7yYECHo0pCJOFdiZ0Z94wQ==&sdk_type=11`;
                const Headers = {
                    method: 'get',
                    headers: {
                        "sec-ch-ua-platform": "\"Windows\"",
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0",
                        "accept": "application/json, text/plain, */*",
                        "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Microsoft Edge\";v=\"139\", \"Chromium\";v=\"139\"",
                        "dnt": "1",
                        "sec-ch-ua-mobile": "?0",
                        "origin": "https://game.bilibili.com",
                        "sec-fetch-site": "same-site",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-dest": "empty",
                        "referer": "https://game.bilibili.com/",
                        "accept-encoding": "gzip, deflate, br, zstd",
                        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                        "cookie": "b_lsid=BF1057B3C_198CC7197A7",
                        "priority": "u=1, i"
                    }
                };
                
                // 添加随机延迟，避免请求过于频繁
                await delay(Math.random() * 300 + 200);
                
                const res = await fetch(URL, Headers);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                
                const data = await res.json();
                if (!data || !data.data || !data.data.game_list || data.data.game_list.length === 0) {
                    return { page: i, data: null, success: false, reason: 'No data' };
                }
                
                // 处理当前页面的游戏数据
                const pageGames = {};
                data.data.game_list.forEach((item) => {
                    const pkg = item.android_pkg_name;
                    const name = item.title || item.game_name_v2;
                    if (pkg && name) {
                        pageGames[pkg] = name;
                    }
                });
                
                console.log(`Page ${i} fetched successfully. Found ${Object.keys(pageGames).length} games.`);
                return { page: i, data: pageGames, success: true };
                
            } catch (error) {
                console.error(`Error fetching page ${i}:`, error.message);
                return { page: i, data: null, success: false, error: error.message };
            }
        });
    }
    
    console.log(`Starting to fetch ${tasks.length} pages with concurrency ${concurrency}...`);
    
    const results = await concurrentFetch(tasks, concurrency);
    
    // 处理结果
    results.forEach(result => {
        if (result.success && result.data) {
            // 合并数据，确保去重
            Object.keys(result.data).forEach(pkg => {
                if (!jsonData[pkg]) {
                    jsonData[pkg] = result.data[pkg];
                }
            });
        } else if (!result.success) {
            failedPages.push(result.page);
        }
    });
    
    // 尝试重新获取失败的页面（单线程）
    if (failedPages.length > 0) {
        console.log(`\nRetrying ${failedPages.length} failed pages...`);
        for (const page of failedPages) {
            try {
                await delay(1000); // 重试时增加延迟
                
                const URL = `https://le3-api.game.bilibili.com/pc/game/home/feed?platform=pc_web&uid=696970921&page_num=${page}&page_size=20&buvid=6C9C4CB5-6C74-03A2-D544-870A1F2DA69E76441-025080519-7yYECHo0pCJOFdiZ0Z94wQ==&sdk_type=11`;
                const Headers = {
                    method: 'get',
                    headers: {
                        "sec-ch-ua-platform": "\"Windows\"",
                        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0",
                        "accept": "application/json, text/plain, */*",
                        "sec-ch-ua": "\"Not;A=Brand\";v=\"99\", \"Microsoft Edge\";v=\"139\", \"Chromium\";v=\"139\"",
                        "dnt": "1",
                        "sec-ch-ua-mobile": "?0",
                        "origin": "https://game.bilibili.com",
                        "sec-fetch-site": "same-site",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-dest": "empty",
                        "referer": "https://game.bilibili.com/",
                        "accept-encoding": "gzip, deflate, br, zstd",
                        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                        "cookie": "b_lsid=BF1057B3C_198CC7197A7",
                        "priority": "u=1, i"
                    }
                };
                
                const res = await fetch(URL, Headers);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                
                const data = await res.json();
                if (data && data.data && data.data.game_list && data.data.game_list.length > 0) {
                    data.data.game_list.forEach((item) => {
                        const pkg = item.android_pkg_name;
                        const name = item.title || item.game_name_v2;
                        if (pkg && name && !jsonData[pkg]) {
                            jsonData[pkg] = name;
                        }
                    });
                    console.log(`Page ${page} retry successful.`);
                }
            } catch (error) {
                console.error(`Page ${page} retry failed:`, error.message);
            }
        }
    }
    
    // 保存结果
    fs.writeFileSync('recent_games.json', JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log(`\nCompleted! Total games: ${Object.keys(jsonData).length}`);
    console.log(`Failed pages: ${failedPages.length > 0 ? failedPages.join(', ') : 'None'}`);
    
    return jsonData;
}

// 执行爬取
fetchRecentGames().catch(console.error);
