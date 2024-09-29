import ReactDOM from "react-dom/client";
import { HTATextExtractor } from "./HTATextExtractor";
import { StyleProvider } from '@ant-design/cssinjs';

// 监听鼠标移动事件
document.addEventListener('mouseover', () => {
  addElement();
  parseTableElement();
}, true);

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
  if (!document.querySelector('#hta-container')) {
    // 选择要插入按钮的位置，比如一个特定的 div
    const insertPosition = document.querySelector('h4.ant-typography')

    if (insertPosition) {
      const button = document.createElement('div');
      button.id = 'hta-container';
      const shadowRoot = button.attachShadow({ mode: 'open' });
      insertPosition.insertAdjacentElement('afterend', button);

      // 在 shaodow Root 下创建一个 div 节点，使用 ReactDOM 对这个节点进行渲染处理
      const container = document.createElement('div');
      shadowRoot.appendChild(container);
      ReactDOM.createRoot(container!).render(
        <StyleProvider container={shadowRoot}>
          <HTATextExtractor />
        </StyleProvider>
      );
    }
  }

}

addElement();
parseTableElement();

export { };
