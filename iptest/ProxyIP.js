import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import fetch from "node-fetch";

// 获取当前脚本路径
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 文件路径
const csvFilePath = path.resolve(__dirname, "init.csv");
const proxyFilePath = "proxy_ips.txt"; // Proxy IP 输出文件
const reverseFilePath = "reverse_ips.txt"; // 反代 IP 输出文件

// CSV列名
const ipcom = "ip";
const portcom = "port";

async function extractIpAndPort() {
  try {
    // 读取 CSV 文件内容
    const data = await fs.promises.readFile(csvFilePath, "utf8");
    const lines = data
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line); // 去掉空行

    if (lines.length < 2) throw new Error("CSV 文件内容不足或格式不正确");

    // 解析表头
    const headers = lines[0].split(",");
    const ipIndex = headers.indexOf(ipcom);
    const portIndex = headers.indexOf(portcom);

    if (ipIndex === -1 || portIndex === -1) {
      throw new Error(`CSV 文件缺少 ${ipcom} 或 ${portcom} 列`);
    }

    // 解析并去重
    const resultSet = new Set();
    lines.slice(1).forEach((line, index) => {
      const fields = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // 兼容带引号的 CSV 格式
      if (fields.length <= Math.max(ipIndex, portIndex)) return;

      const ip = fields[ipIndex].trim();
      const port = fields[portIndex].trim();

      if (!Number(port)) {
        console.log(`第 ${index + 2} 行无效端口: ${ip}:${port}`);
        return;
      }
      resultSet.add(`${ip} ${port}`);
    });

    console.log(`提取到 ${resultSet.size} 个代理IP，开始验证...`);

    // 顺序验证 IP
    const proxyList = [];
    const reverseList = [];

    for (const entry of resultSet) {
      const result = await validateProxy(entry);
      if (result) {
        if (result.type === "proxyip") {
          proxyList.push(result.entry);
        } else if (result.type === "reverse") {
          reverseList.push(result.entry);
        }
      }
    }

    await fs.promises.writeFile(proxyFilePath, proxyList.join("\n"), "utf8");
    await fs.promises.writeFile(
      reverseFilePath,
      reverseList.join("\n"),
      "utf8",
    );

    console.log(
      `已成功提取到 ${proxyList.length} 个有效 ProxyIP，结果已写入 ${proxyFilePath}`,
    );
    console.log(
      `已成功提取到 ${reverseList.length} 个有效 反代IP，结果已写入 ${reverseFilePath}`,
    );
  } catch (error) {
    console.error("处理文件时发生错误:", error.message);
  }
}

// 验证代理
async function validateProxy(entry) {
  const [ip, port] = entry.split(" ");
  try {
    const response = await fetch(
      `https://proxyip.edtunnel.best/api?host=speedtest.cloudflare.com&ip=${ip}&port=${port}&tls=true`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
          Accept: "application/json, text/plain, */*",
          Referer: "https://proxyip.edtunnel.best/",
        },
      },
    );

    let resultData;
    try {
      resultData = await response.json();
    } catch {
      const textData = await response.text();
      console.log(`无效 ProxyIP/反代: ${ip}:${port} -> ${textData}`);
      return null;
    }

    if (resultData && resultData.proxyip) {
      console.log(`发现有效 ProxyIP: ${ip}:${port}`);
      return { type: "proxyip", entry: `${ip}:${port}` };
    }

    if (resultData && resultData.reverse) {
      console.log(`发现有效 反代IP: ${ip}:${port}`);
      return { type: "reverse", entry: `${ip}:${port}` };
    }
  } catch (error) {
    console.error(`请求失败: ${ip}:${port} -> ${error.message}`);
  }
  return null;
}

await extractIpAndPort();
