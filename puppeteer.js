import puppeteer from "puppeteer";

// ----------------------
// 配置
// ----------------------
const config = {
    url: "http://127.0.0.1:8787/",    // 要截图的网址
    out: "screenshot.png",            // 输出文件名
    full: false,                      // 是否整页截图
    delay: 2000,                      // 页面加载完成后额外等待时间（毫秒）

    /**
     * devicePixelRatio（DPR）:
     * - DPR = 1 → 普通屏幕，截图可能略模糊
     * - DPR = 2 → 高清屏，截图更细腻
     * - DPR = 3 → 超高清屏，适合要求高的页面截图
     */
    dpr: 2,

    browser: {
        headless: "new",                // 无头模式（可改为 true 兼容旧版）
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: {
            width: 1920,
            height: 1080,
            deviceScaleFactor: 2,        // 对应上面 dpr 设置
        },
    },
};


// 更新 viewport 的 dpr
config.browser.defaultViewport.deviceScaleFactor = config.dpr;

// ----------------------
// 主逻辑
// ----------------------
(async () => {
    const browser = await puppeteer.launch(config.browser);

    try {
        const page = await browser.newPage();
        await page.goto(config.url, { waitUntil: "networkidle2", timeout: 60_000 });

        if (config.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, config.delay));
        }

        // 隐藏滚动条
        await page.addStyleTag({ content: `::-webkit-scrollbar{display:none}` });

        // 截图
        await page.screenshot({
            path: config.out,
            fullPage: config.full,
            type: config.out.endsWith(".jpg") || config.out.endsWith(".jpeg") ? "jpeg" : "png",
            quality: config.out.endsWith(".jpg") || config.out.endsWith(".jpeg") ? 95 : undefined,
            captureBeyondViewport: true,
        });

        console.log(`[OK] Saved to ${config.out}
URL: ${config.url}
Viewport: ${config.browser.defaultViewport.width}x${config.browser.defaultViewport.height} @ dpr=${config.dpr} ${config.full ? "(full page)" : "(viewport only)"}`);
    } catch (err) {
        console.error("[ERROR]", err);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
})();
