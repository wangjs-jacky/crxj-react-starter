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

const processBracketsText = (str: string) => {
  // 正则表达式匹配被双引号包围的子串
  const quotedMatches = [];
  const unquotedMatches = [];
  let match;
  // 使用正则表达式的exec方法循环匹配所有结果
  while ((match = quotedRegex.exec(str)) !== null) {
    // 将匹配的字符串添加到结果数组中
    quotedMatches.push({
      text: match[0],
      index: match.index,
    });
  }

  // 处理未被双引号包裹的文本
  let index = 0;
  for (const match of quotedMatches) {
    const { index: startIndex, text } = match;
    const endIndex = startIndex + text.length;
    if (startIndex > index) {
      unquotedMatches.push({
        text: str.substring(index, startIndex),
        index,
      });
    }
    index = endIndex;
  }
  // 处理最后一个双引号后的文本
  if (index < str.length) {
    unquotedMatches.push({
      text: str.substring(index),
      index,
    });
  }

  // 根据不被双引号包裹的文本，删除其中的括号包裹的内容
  let tempStr = str;
  for (const match of unquotedMatches) {
    const { text } = match;
    // 匹配括号包裹的文本
    const bracketMatches = text.match(bracketReg) || [];
    const chineseMatches = text.match(chineseBracketReg) || [];
    // 替换括号包裹的文本为空
    for (const bracketMatch of bracketMatches) {
      tempStr = tempStr.replace(bracketMatch, "");
    }
    for (const bracketMatch of chineseMatches) {
      tempStr = tempStr.replace(bracketMatch, "");
    }
  }
  return tempStr;
};

export const preprocess = (str: string) => {
  let tempStr = str;
  // 处理不被双引号包裹的括号
  tempStr = processBracketsText(tempStr);
  // 图片转换
  tempStr = tempStr.replace(imgReg, "图片{@img: $1}");
  // 输入转换
  tempStr = tempStr.replace(inputReg, (_, group) => {
    return `输入{@input: ${group.trim()}}`;
  });
  return tempStr;
};

