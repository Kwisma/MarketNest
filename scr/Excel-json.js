/**
 * @Author: Lycofuture
 * @Date: 2023-08-12 19:51:00
 * @LastEditors: Lycofuture
 * @LastEditTime: 2023-08-12 23:40:00
 */
import xlsx from 'node-xlsx'
import fs from 'fs'

const numbers = 1

function Anime() {
    const LayerData = JSON.parse((fs.readFileSync('../AnimeThesaurus/data.json')).toString())
    const dataex = JSON.parse((fs.readFileSync('../AnimeThesaurus/可爱系二次元bot词库1.5万词V1.2.json')).toString())
    const datajs = JSON.parse((fs.readFileSync('../AnimeThesaurus/傲娇系二次元bot词库5千词V1.2.json')).toString())
    const woeksheets = xlsx.parse(fs.readFileSync('./可爱系二次元bot词库1.5万词V1.2.xlsx'))
    // 解析指定路径的 Excel 文件（从缓冲区读取）
    const workSheetsFromBuffer = xlsx.parse(fs.readFileSync('./傲娇系二次元bot词库5千词V1.2.xlsx'))
    // 获取第一个 Excel 文件解析后的数据
    let jsonData = workSheetsFromBuffer[0].data
    // 获取第二个 Excel 文件解析后的数据
    const json = woeksheets[0].data
    // 合并两个数据数组
    const dataARR = [...jsonData, ...json]
    const data = {...LayerData, ...dataex, ...datajs}
    const jsondata = {}
    let num = 0
    for (let i in data) {
        if (!jsondata[i]) {
            jsondata[i] = []
        }
        for (let j in data[i]) {
            console.log(data[i])
            jsondata[i].push([{
                type: 'text', text: data[i][j]
            }])
            num++
        }
    }
    for (let i in dataARR) {
        let key = dataARR[i]
        // 打印每个键的值
        // 检查文本数组的首个元素是否已经是 text 对象的属性
        if (!jsondata[key[0]]) {
            // 如果不是，则创建一个空数组作为该属性的值
            jsondata[key[0]] = []
        }
        // 向相应的数组中推入包含文本值的对象
        jsondata[key[0]].push([{
            type: 'text', text: key[1]
        }])
        num++
    }
    console.log(num)
    fs.writeFileSync('./Excel_Anime_ALL.json', JSON.stringify(jsondata, null, 4))
}

/**
 * @param path - 路径
 * @param path.excel - xlsx路径
 * @param path.json - json路劲
 * @param path.excelname - xlsx保存文件名
 * @param path.jsonname - json保存文件名
 * @package
 * **/
function Exceljson(path = {}) {
    let num = 0
    if (path.excel) {
        for (let i in path.excel) {
            // 创建一个空对象用于存储转换后的数据
            const datacse = {}
            // 解析指定路径的 Excel 文件
            const woeksheets = xlsx.parse(fs.readFileSync(path.excel[i]))
            // 获取第二个 Excel 文件解析后的数据
            const data = woeksheets[0].data
            for (let i in data) {
                if (!datacse[i]) {
                    datacse[i] = []
                }
                for (let j in data[i]) {
                    console.log(data[i][j])
                    datacse[i].push([{
                        type: 'text', text: data[i][j]
                    }])
                    num++
                }
            }
            // 将转换后的数据写入
            fs.writeFileSync(path.excelname[i], JSON.stringify(datacse, null, 4))
        }
    }
    if (path.json) {
        for (let i in path.json) {
            // 创建一个空对象用于存储转换后的数据
            const text = {}
            const data = JSON.parse((fs.readFileSync(path.json[i])).toString())
            // 遍历数据对象
            for (let i in data) {
                let key = data[i]
                // 打印每个键的值
                console.log(key)
                // 检查文本数组的首个元素是否已经是 text 对象的属性
                if (!text[key[0]]) {
                    // 如果不是，则创建一个空数组作为该属性的值
                    text[key[0]] = []
                }
                // 向相应的数组中推入包含文本值的对象
                text[key[0]].push([{
                    type: 'text', text: key[1]
                }])
                num++
            }
            // 将转换后的数据写入
            fs.writeFileSync(path.jsonname[i], JSON.stringify(text, null, 4))
        }
    }
    console.log(num)
}

if (numbers === 0) {
    const path = {
        excel: ['./可爱系二次元bot词库1.5万词V1.2.xlsx', './傲娇系二次元bot词库5千词V1.2.xlsx'],
        excelname: ['可爱系二次元bot词库1.5万词.json', '傲娇系二次元bot词库5千词.json'],
        json: ['../AnimeThesaurus/data.json', '../AnimeThesaurus/可爱系二次元bot词库1.5万词V1.2.json', '../AnimeThesaurus/傲娇系二次元bot词库5千词V1.2.json'],
        jsonname: ['数据2.json', '可爱系二次元bot词库1.5万词2.json', '傲娇系二次元bot词库5千词2.json']
    }
    Exceljson(path)
} else {
    Anime()
}
