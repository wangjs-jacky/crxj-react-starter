// 匹配括号正则
const bracketReg = /\([^)]*\)/g;
// 匹配双引号正则
const quotedRegex = /"[^"]*"/g;
// 匹配中文括号正则
const chineseBracketReg = /（.+）/g;
// 图片转换正则
const imgReg =
  /图片\s*((?:https?:\/\/|\.\/|\/|www\.)[\w\-\.]+\.(gif|png|jpg|jpeg|webp|svg|bmp|tif)(?:,(?:https?:\/\/|\.\/|\/|www\.)[\w\-\.]+\.(gif|png|jpg|jpeg|webp|svg|bmp|tif))*)/gi;
// 输入转换正则
const inputReg = /输入\s*([^,框栏]+)/g;

type MatchType = {
  text: string;
  startIndex: number;
  endIndex: number;
  length: number;
  regrex: RegExp[];
  name: string;
  replace?: Function;
};

// 创建一个函数来查找所有匹配项的索引
function processBracketsText(str) {
  // 正则：
  const RegConfig = [
    {
      // 匹配括号正则
      name: "bracketReg",
      reg: /\[([^\]]*?)\]/g
    },
    {
      // 匹配中文双引号
      name: "chineseDoubleQuotesReg",
      reg: /“([^”]*?)”/g
    },
    {
      // 匹配英文双引号
      name: "englishDoubleQuotesReg",
      reg: /"([^"]*?)"/g
    },
    {
      // 匹配单引号
      name: "singleQuotesReg",
      reg: /'([^']*?)'/g
    },
    {
      // 匹配括号
      name: "QuotesReg",
      reg: [
        /\(([^)]*?)\)/g,
        /\（([^）]*?)\）/g,
      ],
    }
  ];

  let allIndices = [] as MatchType[];
  RegConfig.forEach((item) => {
    let { reg, name } = item;
    if (!Array.isArray(reg)) {
      reg = [reg];
    }
    reg.forEach((item) => {
      let match;
      while ((match = item.exec(str)) !== null) {
        allIndices.push({
          text: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          length: match[0].length,
          regrex: reg,
          name
        });
      }
    });
  });

  function mergeIntervals(intervals: MatchType[]) {
    // 首先按照区间的起始位置对区间进行排序
    intervals.sort((a, b) => a.startIndex - b.startIndex);
    const merged = [] as MatchType[];
    for (const interval of intervals) {
      // 如果合并后的数组为空，或者当前区间与合并后数组中最后一个区间不重叠，则直接添加
      if (merged.length === 0 || merged[merged.length - 1].endIndex <= interval.startIndex) {
        merged.push(interval);
      } else {
        // 否则有重叠，合并区间
        merged[merged.length - 1].endIndex = Math.max(merged[merged.length - 1].endIndex, interval.endIndex);
      }
    }
    return merged;
  }

  function clearStringRange(str, ranges) {
    // 将字符串转换成数组，便于操作
    let chars = str.split('');

    // 遍历所有的索引范围
    ranges.forEach(range => {
      // 清空指定的索引范围
      for (let i = range.startIndex; i < range.endIndex && i < chars.length; i++) {
        chars[i] = '';
      }
    });

    // 将数组重新组合成字符串
    return chars.join('');
  }
  const sortedRanges = mergeIntervals(allIndices);
  const ranges = (sortedRanges || []).filter((item) => item.name === "QuotesReg");
  str = clearStringRange(str, ranges);
  return str;
}

export const preprocess = (str: string) => {
  let tempStr = str;
  // 处理不被双引号包裹的括号
  tempStr = processBracketsText(tempStr);
  return tempStr;
};
