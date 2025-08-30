// ----------------------
// 截图工具说明
// ----------------------
// 如果截图中文字/图标出现乱码，可以安装以下字体：
//   - 表情符号乱码：fonts-noto-color-emoji
//   - 中文乱码：fonts-wqy-microhei
//
// 一条命令安装：
// apt update && apt install -y fonts-wqy-microhei fonts-noto-color-emoji

import puppeteer from "puppeteer";
import fs from "fs";
import os from "os";

// ----------------------
// 配置管理
// ----------------------
const createDefaultConfig = () => ({
    // 目标网址
    url: "https://sub.ikar.eu.org/",
    
    // 输出设置
    output: {
        path: "../icon/icon.png",
        type: "png",
        quality: 95,
    },
    
    // 截图模式
    fullPage: false,
    
    // 时间控制
    delay: 2000,
    timeout: 60000,
    waitUntil: "networkidle2",
    
    // 显示设置
    deviceScaleFactor: 2,
    viewport: {
        width: 1920,
        height: 1080
    },
    
    // 功能开关
    hideScrollbar: true,
    
    // 浏览器设置
    browser: {
        headless: "new",
        args: [
            "--no-sandbox", 
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--disable-software-rasterizer"
        ],
        defaultViewport: null
    }
});

// ----------------------
// Chrome安装器
// ----------------------
class ChromeInstaller {
    static getSystemChromePaths() {
        const platform = os.platform();
        const paths = [];
        
        if (platform === 'linux') {
            paths.push(
                '/usr/bin/google-chrome',
                '/usr/bin/google-chrome-stable',
                '/usr/bin/chromium',
                '/usr/bin/chromium-browser',
                '/snap/bin/chromium'
            );
        } else if (platform === 'darwin') {
            paths.push(
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                '/Applications/Chromium.app/Contents/MacOS/Chromium'
            );
        } else if (platform === 'win32') {
            paths.push(
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
            );
        }
        
        return paths;
    }
}


// ----------------------
// 浏览器管理类
// ----------------------
class BrowserManager {
    constructor() {
        this.browser = null;
        this.config = null;
    }
    
    async initialize(config) {
        this.config = config;
        
        // 设置视口配置
        this.config.browser.defaultViewport = {
            width: this.config.viewport.width,
            height: this.config.viewport.height,
            deviceScaleFactor: this.config.deviceScaleFactor
        };
        
        // 尝试使用系统已安装的Chrome
        try {
            const systemChromePaths = ChromeInstaller.getSystemChromePaths();
            for (const path of systemChromePaths) {
                if (fs.existsSync(path)) {
                    console.log(`找到系统Chrome: ${path}`);
                    this.config.browser.executablePath = path;
                    break;
                }
            }
        } catch (error) {
            console.warn("无法确定Chrome路径:", error.message);
        }
        
        // 添加更多兼容性参数
        this.config.browser.args = [
            ...this.config.browser.args,
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote'
        ];
        
        // 启动浏览器
        console.log("启动浏览器...");
        try {
            this.browser = await puppeteer.launch(this.config.browser);
            return this.browser;
        } catch (launchError) {
            console.error("浏览器启动失败:", launchError.message);
            
            // 尝试使用更简单的配置
            console.log("尝试使用简化配置启动浏览器...");
            const simpleConfig = {
                headless: "new",
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage"
                ],
                defaultViewport: this.config.browser.defaultViewport
            };
            
            this.browser = await puppeteer.launch(simpleConfig);
            return this.browser;
        }
    }

    async newPage() {
        if (!this.browser) {
            throw new Error("浏览器未初始化");
        }
        return await this.browser.newPage();
    }
    
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            console.log("浏览器已关闭");
        }
    }
}

// ----------------------
// 页面管理类
// ----------------------
class PageManager {
    constructor(page) {
        this.page = page;
    }
    
    async navigate(url, options = {}) {
        const defaultOptions = {
            waitUntil: "networkidle2",
            timeout: 60000
        };
        
        const navigateOptions = { ...defaultOptions, ...options };
        console.log("导航到:", url);
        await this.page.goto(url, navigateOptions);
        console.log("页面加载完成");
    }
    
    async wait(delay) {
        if (delay > 0) {
            console.log("等待", delay, "ms...");
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    async hideScrollbar() {
        await this.page.addStyleTag({ 
            content: `::-webkit-scrollbar{display:none}` 
        });
        console.log("已隐藏滚动条");
    }
    
    async setViewport(width, height, deviceScaleFactor = 1) {
        await this.page.setViewport({ width, height, deviceScaleFactor });
        console.log("设置视口:", width, "x", height, "@", deviceScaleFactor, "x");
    }

    async screenshot(options = {}) {
        console.log("正在截图...");
        return await this.page.screenshot(options);
    }
    
    async close() {
        await this.page.close();
    }
}

// ----------------------
// 截图服务类
// ----------------------
class ScreenshotService {
    constructor() {
        this.browserManager = new BrowserManager();
        this.config = null;
    }
    
    async initialize(config) {
        this.config = config;
        await this.browserManager.initialize(config);
    }
    
    async capture(url, outputPath, options = {}) {
        const page = await this.browserManager.newPage();
        const pageManager = new PageManager(page);
        
        try {
            // 设置视口
            await pageManager.setViewport(
                this.config.viewport.width, 
                this.config.viewport.height, 
                this.config.deviceScaleFactor
            );
            
            // 导航到页面
            await pageManager.navigate(url, {
                waitUntil: this.config.waitUntil,
                timeout: this.config.timeout
            });
            
            // 等待额外时间
            await pageManager.wait(this.config.delay);
            
            // 隐藏滚动条
            if (this.config.hideScrollbar) {
                await pageManager.hideScrollbar();
            }
            
            // 确定文件类型和质量
            const isJpeg = outputPath.toLowerCase().endsWith(".jpg") || 
                          outputPath.toLowerCase().endsWith(".jpeg");
            const screenshotOptions = {
                path: outputPath,
                fullPage: options.fullPage !== undefined ? options.fullPage : this.config.fullPage,
                type: isJpeg ? "jpeg" : "png",
                quality: isJpeg ? (options.quality || this.config.output.quality) : undefined,
                captureBeyondViewport: true
            };
            
            // 截图
            await pageManager.screenshot(screenshotOptions);
            
            // 使用纯文本输出成功信息
            console.log("[成功] 截图完成!");
            console.log("[文件] 保存路径:", outputPath);
            console.log("[网址] 目标网址:", url);
            console.log("[尺寸] 视口尺寸:", this.config.viewport.width, "x", this.config.viewport.height);
            console.log("[DPR] 设备像素比:", this.config.deviceScaleFactor);
            console.log("[模式] 截图模式:", screenshotOptions.fullPage ? "整页" : "视口");
            console.log("[时间] 等待时间:", this.config.delay, "ms");
            
            return outputPath;
        } catch (error) {
            console.error("截图失败:", error.message);
            throw error;
        } finally {
            await pageManager.close();
        }
    }
    
    async close() {
        await this.browserManager.close();
    }
}

// ----------------------
// 工具函数
// ----------------------
function validateConfig(config) {
    const errors = [];
    
    if (!config.url || typeof config.url !== 'string') {
        errors.push("URL不能为空且必须是字符串");
    }
    
    if (!config.output.path) {
        errors.push("输出路径不能为空");
    }
    
    if (config.delay < 0) {
        errors.push("延迟时间不能为负数");
    }
    
    if (config.deviceScaleFactor < 1) {
        errors.push("设备像素比不能小于1");
    }
    
    if (config.viewport.width < 100 || config.viewport.height < 100) {
        errors.push("视口尺寸过小");
    }
    
    if (errors.length > 0) {
        throw new Error(`配置验证失败: ${errors.join("; ")}`);
    }
}

// ----------------------
// 主函数
// ----------------------
async function main() {
    console.log("[开始] 截图任务...");
    
    // 创建默认配置
    const config = createDefaultConfig();
    
    // 验证配置
    validateConfig(config);
    
    const screenshotService = new ScreenshotService();
    
    try {
        // 初始化服务
        await screenshotService.initialize(config);
        
        // 执行截图
        await screenshotService.capture(config.url, config.output.path, {
            fullPage: config.fullPage,
            quality: config.output.quality
        });
        
    } catch (error) {
        console.error("[错误] 截图过程中发生错误:", error.message);
        
        // 提供故障排除建议
        if (error.message.includes('browser') || error.message.includes('chrome')) {
            console.log("\n[建议] 故障排除:");
            console.log("1. 安装系统Chrome: sudo apt-get install chromium-browser");
            console.log("2. 清理node_modules并重新安装: rm -rf node_modules && npm install");
            console.log("3. 检查puppeteer版本: npm list puppeteer");
        }
        
        process.exitCode = 1;
    } finally {
        // 关闭服务
        await screenshotService.close();
    }
}

main()
