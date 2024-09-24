import ReactDOM from "react-dom/client";
import { MyComponent } from "./App";
import "./index.css"

// 此代码将被注入到目标页面结构中，因此具备共享 DOM 结构能力
console.log("🔥 Hello from content script (src/scripts/content-scripts.ts)");

// 监听 document

// 监听鼠标移动事件
document.addEventListener('mouseover', () => {
  addElement();
  parseTableElement();
}, true);
// document.addEventListener('DOMContentLoaded', () => {
//   addElement();
// })

function parseTableElement() {
  const tableRows = document.querySelectorAll('tbody tr');
  const result: { 步骤编号: string | null; 步骤描述: any; 预期结果: any; }[] = [];
  const url = document.querySelector("div.ant-row.precondition p a")?.href;
  tableRows.forEach(row => {
    const stepNumber = row.querySelector('td:nth-child(1) span').textContent;
    // @ts-ignore
    const stepDescription = row.querySelector('td:nth-child(2) textarea').value;
    // @ts-ignore
    const expectedResults = row.querySelector('td:nth-child(3) textarea').value;
    result.push({
      '步骤编号': stepNumber,
      '步骤描述': stepDescription.replaceAll("“", "\"").replaceAll("”", "\""),
      '预期结果': expectedResults.replaceAll("“", "\"").replaceAll("”", "\""),
    });
  });
  chrome.runtime.sendMessage({ type: 'parseHtml', data: result, url: url });
}

function addElement() {
  if (!document.querySelector('#myButton')) {
    // 创建一个新的按钮元素
    const button = document.createElement('div');
    button.id = 'myButton';  // 设置按钮的 ID，以便可以通过 ID 选择

    // 选择要插入按钮的位置，比如一个特定的 div
    const container = document.querySelector('h4.ant-typography')

    // const container = document.querySelector('.nav-banner')

    // 将按钮添加到选定的位置
    // container.appendChild(button); 
    if (container) {
      container.insertAdjacentElement('afterend', button);
      ReactDOM.createRoot(document.getElementById("myButton")!).render(
        <MyComponent />
      );
    }
  }

}

addElement();
parseTableElement();

export { };
