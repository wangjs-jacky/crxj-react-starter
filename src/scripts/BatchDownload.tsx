import { Button } from 'antd';
import React, { useEffect } from 'react';
import { parseTableElement } from './content-scripts';

export const BatchDownload: React.FC = () => {
  const handleDownload = () => {
    // 获取 caseId 数组
    const aGroups = document.querySelectorAll('tbody > tr.ant-table-row-selected > td > a');
    const platformGroups = Array.from(document.querySelectorAll("tbody > tr.ant-table-row.ant-table-row-level-0.ant-table-row-selected > td:nth-child(5)") || [])
      .map(node => node?.querySelectorAll(".ant-tag-blue")).filter(Boolean)
    Array.from(aGroups).forEach((node, index) => {
      const id = node?.innerText;
      fetch("https://testhub.package.ctripcorp.com/library/149/module/219962/case/" + id + "?download=true", {
        credentials: 'include',
        headers: {
          'Cookie': document.cookie
        }
      })
        .then(response => response.text())
        .then(htmlString => {
          // 使用 DOMParser 解析 HTML 字符串
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlString, 'text/html');
          parseTableElement(doc, {
            caseId: id,
            title: doc.querySelector('div.title-main > div > textarea')?.value,
            platform: Array.from(platformGroups[index] || [])?.map(item => item?.innerText)
          })
        })
        .catch(error => console.error('Download error:', error));
    });
  };

  return (
    <Button type="primary" style={{ marginRight: "3px" }} onClick={handleDownload}>批量下载</Button>
  );
};
