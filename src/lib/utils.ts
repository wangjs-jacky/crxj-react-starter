import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function convertToObj(testIDStr) {
  const lines = testIDStr.trim().split('\n');
  const obj = {};

  lines.forEach(line => {
    // 使用正则表达式匹配英文冒号或中文冒号
    const match = line.match(/(.+?)[：:](.+)/);
    if (match && match.length === 3) {
      obj[match[1].trim()] = match[2].trim();
    }
  });

  return obj;
}

export function replacePlaceholders(str, obj) {
  const notFoundTestID = new Set();
  const result = str.replace(/\[(.*?)\]/g, (match, p1) => {
    if (obj[p1] !== undefined) {
      return `[${obj[p1]}]`;
    } else {
      notFoundTestID.add(p1);
      return match;
    }
  });

  if (notFoundTestID.size > 0) {
    console.warn(`未找到以下占位符，请补全:`, Array.from(notFoundTestID));
  }

  return {
    result,
    notFoundTestID: Array.from(notFoundTestID).join(",")
  };
}

// 创建一个函数来查找所有匹配项的索引
export function findAllMatches(str) {
  // 定义一个包含多个正则表达式的数组
  // 匹配序号
  const indexReg = /[\d\-]+\./g;
  // 匹配括号正则
  const bracketReg = /\[([^\]]*?)\]/g;
  // 匹配中文双引号
  const chineseDoubleQuotesReg = /“([^”]*?)”/g;
  // 匹配英文双引号
  const englishDoubleQuotesReg = /"([^"]*?)"/g;
  // 匹配单引号
  const singleQuotesReg = /'([^']*?)'/g;
  // 匹配括号
  const QuotesReg = /\(([^)]*?)\)/g;

  // 匹配 {@color: xxx}
  const specialReg = /\{\@(\w+):\s*[^}]*\}/g;

  // 匹配特殊中文
  const chineseWordReg = [
    /点击/g,
    /展示/g,
    /,/g,
    /，/g,
    /浮层关闭/g,
    /暗文展示/g,
    /\./g
  ];

  let regexPatterns = [
    indexReg,
    ...chineseWordReg,
    bracketReg,
    chineseDoubleQuotesReg,
    englishDoubleQuotesReg,
    singleQuotesReg,
    specialReg,
    QuotesReg
  ];

  let allIndices = [] as any[];
  regexPatterns.forEach((regex, index) => {
    let match;
    while ((match = regex.exec(str)) !== null) {
      allIndices.push({
        text: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        length: match[0].length
      });
    }
  });

  // 创建一个函数来提取字符串中指定位置的字符
  function extractCharacters(str, ranges) {
    let extracted = [];
    ranges.sort((a, b) => a.startIndex - b.startIndex).forEach(range => {
      let result = str.slice(range.startIndex, range.endIndex);
      extracted.push(result);
    });
    console.log("wjs: extracted", extracted);
    return extracted;
  }


  function mergeIntervals(intervals) {
    // 首先按照区间的起始位置对区间进行排序
    intervals.sort((a, b) => a.startIndex - b.startIndex);

    const merged = [];
    for (const interval of intervals) {
      // 如果合并后的数组为空，或者当前区间与合并后数组中最后一个区间不重叠，则直接添加
      if (merged.length === 0 || merged[merged.length - 1].endIndex < interval.startIndex) {
        merged.push(interval);
      } else {
        // 否则有重叠，合并区间
        merged[merged.length - 1].endIndex = Math.max(merged[merged.length - 1].endIndex, interval.endIndex);
      }
    }
    return merged;
  }

  let filterdArr = extractCharacters(str, mergeIntervals(allIndices));
  const content = filterdArr.join(" ");

  const _content = replaceStr(content);
  return _content;
}

function replaceStr(str) {
  // 暗纹展示 "请选择" → 展示 "请选择"
  str = str.replace(/暗文展示\s*"请选择/g, (match, p1) => {
    return `展示 "请选择`
  })
  // 暗文展示 "xxx" → "{@placeholder: xxx}"
  str = str.replace(/暗文展示\s*"([^"]*?)"/g, (match, p1) => {
    return `{@placeholder: ${p1}}`
  })

  // 浮层关闭
  str = str.replace(/(\[([^\]]*?)\])\s*浮层关闭/g, (match, p1) => {
    return `${p1} {@visible: false}`
  })
  return str;
}