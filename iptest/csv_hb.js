import fs from "fs";
import path from "path";
import XLSX from "xlsx";

// 检查是否提供了必要的命令行参数
if (process.argv.length < 4) {
  console.error(
    "用法: node convert.js <输出文件路径> <输入文件1> <输入文件2> [...]",
  );
  process.exit(1);
}

const outputFilePath = process.argv[2];
const inputPaths = process.argv.slice(3);

// 将 XLSX 文件转换为 CSV 文件
const convertXlsxToCsv = (xlsxFilePath) => {
  try {
    if (!fs.existsSync(xlsxFilePath)) {
      throw new Error(`找不到文件: ${xlsxFilePath}`);
    }

    // 读取 XLSX 文件
    const workbook = XLSX.readFile(xlsxFilePath);
    const sheetName = workbook.SheetNames[0]; // 选择第一个工作表
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      throw new Error(`文件中没有工作表: ${xlsxFilePath}`);
    }

    // 转换工作表为 CSV 格式
    const csvData = XLSX.utils.sheet_to_csv(sheet);

    // 自动生成与输入文件对应的 CSV 文件名
    const csvFileName = `${path.basename(xlsxFilePath, path.extname(xlsxFilePath))}.csv`;
    fs.writeFileSync(csvFileName, csvData, "utf8");
    console.log(`已转换: ${xlsxFilePath} -> ${csvFileName}`);

    return csvFileName; // 返回生成的 CSV 文件路径
  } catch (error) {
    console.error(`转换 XLSX 为 CSV 时出错: ${error.message}`);
    process.exit(1);
  }
};

// 合并多个 CSV 文件
const mergeCsvFiles = (csvFiles, outputFile) => {
  try {
    let mergedData = "";
    csvFiles.forEach((file, index) => {
      if (!fs.existsSync(file)) {
        throw new Error(`找不到文件: ${file}`);
      }

      const fileData = fs.readFileSync(file, "utf8");

      // 去掉重复的标题行（保留第一个文件的标题）
      if (index > 0) {
        const rows = fileData.split("\n");
        rows.shift(); // 移除标题行
        mergedData += rows.join("\n");
      } else {
        mergedData += fileData;
      }

      if (!mergedData.endsWith("\n")) {
        mergedData += "\n";
      }
    });

    fs.writeFileSync(outputFile, mergedData, "utf8");
    console.log(`已成功合并到: ${outputFile}`);
  } catch (error) {
    console.error(`合并 CSV 文件时出错: ${error.message}`);
    process.exit(1);
  }
};

// 查找指定文件夹中的所有 CSV 和 XLSX 文件
const findFilesInDirectory = (directoryPath) => {
  try {
    const files = fs.readdirSync(directoryPath);
    return files
      .filter((file) =>
        [".csv", ".xlsx"].includes(path.extname(file).toLowerCase()),
      )
      .map((file) => path.join(directoryPath, file));
  } catch (error) {
    console.error(`读取目录时出错: ${error.message}`);
    process.exit(1);
  }
};

// 主逻辑：遍历输入文件并处理
const csvFiles = inputPaths
  .flatMap((inputPath) => {
    const ext = path.extname(inputPath).toLowerCase();
    const isDirectory = fs.lstatSync(inputPath).isDirectory();

    if (isDirectory) {
      // 查找目录中的所有 CSV 和 XLSX 文件
      return findFilesInDirectory(inputPath)
        .map((file) => {
          const fileExt = path.extname(file).toLowerCase();
          if (fileExt === ".xlsx") {
            return convertXlsxToCsv(file);
          } else if (fileExt === ".csv") {
            return file;
          } else {
            return null;
          }
        })
        .filter(Boolean);
    } else if (ext === ".xlsx") {
      // 转换 XLSX 为 CSV
      return convertXlsxToCsv(inputPath);
    } else if (ext === ".csv") {
      // 直接使用 CSV 文件
      return inputPath;
    } else {
      console.warn(`不支持的文件格式，跳过: ${inputPath}`);
      return null;
    }
  })
  .filter(Boolean); // 过滤掉不支持的文件

// 合并所有生成的 CSV 文件
mergeCsvFiles(csvFiles, outputFilePath);
