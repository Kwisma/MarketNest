import fs from "fs";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

async function getDatacenterMap() {
  console.log("开始获取 Cloudflare 数据中心位置...");

  try {
    const response = await fetch("https://speed.cloudflare.com/locations");
    const data = await response.json();

    console.log("成功获取 Cloudflare 数据中心数据，开始处理数据...");

    const datacenterMap = {};

    data.forEach(({ iata, cca2 }) => {
      if (!datacenterMap[cca2]) {
        datacenterMap[cca2] = [];
      }
      datacenterMap[cca2].push(iata);
    });

    console.log("数据中心映射创建成功。");
    await fs.promises.writeFile(
      "datacenterMap.txt",
      JSON.stringify(datacenterMap, null, 2),
      "utf8",
    );
    console.log(`已成功将数据保存到 data.txt`);
    const extracted = await extractData();
    const extracted2 = await extractData2();
    const extractedData = { ...extracted2, ...extracted };
    await fs.promises.writeFile(
      "extractedData.txt",
      JSON.stringify(extractedData, null, 2),
      "utf8",
    );

    console.log("开始修改数据中心映射...");
    const newDatacenterMap = await modifyDatacenterMap(
      extractedData,
      datacenterMap,
    );

    console.log("数据中心映射修改完成，开始保存到文件...");

    await fs.promises.writeFile(
      "data-cn.txt",
      JSON.stringify(newDatacenterMap, null, 2),
      "utf8",
    );

    console.log(`已成功将数据保存到 data-cn.txt`);
    return newDatacenterMap;
  } catch (error) {
    console.error("获取数据中心映射失败:", error);
  }
}

async function extractData() {
  try {
    // 读取 HTML 文件
    const response = await fetch(
      "https://www.ssl.com/zh-CN/%E5%9B%BD%E5%AE%B6%E4%BB%A3%E7%A0%81/",
    );
    const htmlContent = await response.text();

    console.log("HTML 内容获取成功，开始解析...");

    // 解析 HTML（浏览器环境）
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // 获取表格
    const table = document.querySelector("table");
    if (!table) {
      console.error("未找到表格");
      return;
    }

    // 获取表头
    const headers = Array.from(table.querySelectorAll("tr th")).map((th) =>
      th.textContent.trim(),
    );

    // 找到目标列索引
    const nameIndex = headers.indexOf("姓名");
    const isoIndex = headers.indexOf("ISO代码 CSR");

    if (nameIndex === -1 || isoIndex === -1) {
      console.error("未找到指定的表头");
      return;
    }

    // 选择所有行（跳过表头）
    const rows = table.querySelectorAll("tr");

    // 存储提取的数据
    const extractedData = {};

    rows.forEach((row, i) => {
      if (i === 0) return; // 跳过表头

      const columns = row.querySelectorAll("td");
      if (columns.length > Math.max(nameIndex, isoIndex)) {
        const name = columns[nameIndex].textContent.trim();
        const isoCode = columns[isoIndex].textContent.trim();
        // 跳过非字母的 ISO 代码
        if (!/^[A-Za-z]+$/.test(isoCode)) return;
        // 跳过空的 ISO 代码
        if (!isoCode) return;
        const Emoji = getFlagEmoji(isoCode);
        extractedData[isoCode] = Emoji + name;
      }
    });
    console.log("提取的数据:", extractedData);
    return extractedData;
  } catch (error) {
    console.error("发生错误:", error);
  }
}
async function extractData2() {
  try {
    // 读取 HTML 文件
    const response = await fetch("https://www.aqwu.net/wp/?p=1231");
    const htmlContent = await response.text();

    console.log("HTML 内容获取成功，开始解析...");

    // 解析 HTML（浏览器环境）
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // 获取表格
    const table = document.querySelector("table");
    if (!table) {
      console.error("未找到表格");
      return;
    }

    // 获取表头
    const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
      th.textContent.trim(),
    );

    // 找到目标列索引
    const nameIndex = headers.indexOf("政治实体");
    const isoIndex = headers.indexOf("ISO 3166-1二位字母代码");

    if (nameIndex === -1 || isoIndex === -1) {
      console.error("未找到指定的表头");
      return;
    }

    // 选择所有行（跳过表头）
    const rows = table.querySelectorAll("tr");

    // 存储提取的数据
    const extractedData = {};

    rows.forEach((row, i) => {
      if (i === 0) return; // 跳过表头

      const columns = row.querySelectorAll("td");
      if (columns.length > Math.max(nameIndex, isoIndex)) {
        const name = columns[nameIndex].textContent.trim();
        const isoCode = columns[isoIndex].textContent.trim();
        // 跳过非字母的 ISO 代码
        if (!/^[A-Za-z]+$/.test(isoCode)) return;
        // 跳过空的 ISO 代码
        if (!isoCode) return;
        const Emoji = getFlagEmoji(isoCode);
        extractedData[isoCode] = Emoji + name;
      }
    });
    console.log("提取的数据:", extractedData);
    return extractedData;
  } catch (error) {
    console.error("发生错误:", error);
  }
}

// 修改 datacenterMap 的键
async function modifyDatacenterMap(extractedData, datacenterMap) {
  console.log("开始修改数据中心映射的键...");

  try {
    // 生成新的 datacenterMap
    let newDatacenterMap = {};

    Object.entries(datacenterMap).forEach(([isoCode, values]) => {
      const newKey = extractedData[isoCode] || isoCode; // 找到政治实体名称，找不到就用原键
      newDatacenterMap[newKey] = values; // 保持值不变
    });

    console.log("数据中心映射键修改完成。");
    return newDatacenterMap;
  } catch (error) {
    console.error("修改 datacenterMap 失败:", error);
  }
}

// 代码转国旗
function getFlagEmoji(countryCode) {
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt()))
    .join("");
}

// 运行提取函数
await getDatacenterMap();
