import { EXPECT_CSS_SELECTOR, STEPS_CSS_SELECTOR } from "@/constant";
import { CopyFilled, DragOutlined } from "@ant-design/icons";
import { Button, Divider, Input, message, Modal, Select, Space, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import type { DraggableData, DraggableEvent } from "react-draggable";
import Draggable from "react-draggable";
import { Pin, PinOff } from 'lucide-react';
import "./index.css"

const useDraggableProps = (config?: any) => {
  const draggleRef = useRef<HTMLDivElement>(null);
  const { modalProps: defaultModalProps = {}, } = config || {};
  const [open, setOpen] = useState(false);

  // 可拖拽状态
  const [disabled, setDisabled] = useState(true);

  // 初始定位
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });

  const showModal = () => {
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false)
  }

  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const modalProps = {
    open,
    mask: false,
    centered: true,
    onCancel: closeModal,
    footer: null,
    modalRender: (modalEle) => (
      <Draggable
        disabled={disabled}
        bounds={bounds}
        nodeRef={draggleRef}
        onStart={(event, uiData) => onStart(event, uiData)}
      >
        <div ref={draggleRef}>{modalEle}</div>
      </Draggable>
    ),
    ...defaultModalProps,
  }

  const DragContainer = (props) => {
    const { style } = props;
    return <div style={{ cursor: 'move', ...style }}
      onMouseOver={() => {
        if (disabled) {
          setDisabled(true);
        }
      }}
      onMouseOut={() => {
        console.log("wjs: onMouseOut");
        setDisabled(true);
      }}
      onFocus={() => { }}
      onBlur={() => { }}
      {...props}
    >{props.children}</div>
  }
  return {
    modalProps,
    showModal,
    open,
    closeModal,
    DragContainer,
    setDisabled,
    disabled
  }
}


export const useSelectModal = (config?: any) => {
  // 是否置顶
  const [isStickyTop, setIsStickyTop] = useState(false);

  const { closeModal, showModal, DragContainer, modalProps, open, disabled, setDisabled } = useDraggableProps();
  const [messageApi, contextHolder] = message.useMessage();

  // 获取 testID 映射选项
  const { selectOptions, testIDMap } = config || {};

  // 记录【步骤描述】 当前激活的索引值
  const [stepIndex, setStepIndex] = useState(-1);
  // 记录【预期结果】 当前激活的索引值
  const [expectIndex, setExpectIndex] = useState(-1);

  // 是否触发页面绑定
  const [signal, updateEventListener] = useState({});

  // 获取输入框对象
  const inputRef = useRef<any>(null);

  const handleCancel = () => {
    if (!isStickyTop) {
      closeModal();
    }
  }

  const KEYWORDS = [
    { text: "展示" },
    { text: "展示 \"\"", cursorPostion: 1 },
    { text: "暗文展示" },
    { text: "暗文展示 \"\"", cursorPostion: 1 },
    { text: "点击" },
    { text: "输入" },
    { text: "()", cursorPostion: 1 },
    { text: "关闭" },
    { text: "创单成功" },
    { text: "toast提示" },
    { text: "等待" },
    { text: "@MockID" },
    { text: "不展示" },
    { text: "{@value: }" }
  ];

  const inputText = (text: string) => {
    const event = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    const stepTextarea = document.querySelectorAll(STEPS_CSS_SELECTOR)!;
    const expectTextarea = document.querySelectorAll(EXPECT_CSS_SELECTOR)!;
    if (stepTextarea && stepIndex > -1) {
      stepTextarea[stepIndex].value = text;
      stepTextarea[stepIndex].dispatchEvent(event);
    }
    if (expectTextarea && expectIndex > -1) {
      expectTextarea[expectIndex].value = text;
      expectTextarea[expectIndex].dispatchEvent(event);
    }
  }

  // 监听页面所有元素的点击事件
  useEffect(() => {
    document.addEventListener('click', (event) => {
      updateEventListener({})
    })
  }, [])

  useEffect(() => {
    // 步骤描述区域
    const stepContainer = Array.from(document.querySelectorAll(STEPS_CSS_SELECTOR));
    // 期待描述区域
    const expectContainer = Array.from(document.querySelectorAll(EXPECT_CSS_SELECTOR));

    const handleStepInput = (event) => {

      // 检查按下的键是否为 '[' 键
      if (event.data === '[' || event.data === ']') {
        // if (!open) {
        // 手工执行 backspace 的 input 事件
        event.target.value = event.target.value.slice(0, -1);
        event.target.dispatchEvent(new Event('input', {
          bubbles: true,
          cancelable: true,
        }));
        setInputValue(event.target.value)
        showModal();
        // }
      }
    };

    const handleStepFocus = (event) => {
      if (event.target instanceof HTMLTextAreaElement) {
        setStepIndex(stepContainer.indexOf(event.target));
        setExpectIndex(-1);
      }
    };

    const handleExpectInput = (event) => {
      if (!open) {
        // 检查按下的键是否为 '[' 键
        if (event.data === '[' || event.data === ']') {
          // 手工执行 backspace 的 input 事件
          event.target.value = event.target.value.slice(0, -1);
          event.target.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true,
          }));
          showModal();
        }
      }
    };

    const handleExpectFocus = (event) => {
      if (event.target instanceof HTMLTextAreaElement) {
        setStepIndex(-1);
        setExpectIndex(expectContainer.indexOf(event.target));
      }
    };

    // 为元素绑定 input 和 focus 监听事件
    stepContainer.forEach((item) => {
      item.addEventListener('input', handleStepInput);
      item.addEventListener('focus', handleStepFocus);
    });

    // 为元素绑定 input 和 focus 监听事件
    expectContainer.forEach((item) => {
      item.addEventListener('input', handleExpectInput);
      item.addEventListener('focus', handleExpectFocus);
    });

    return () => {
      // 卸载组件时移除事件监听器
      stepContainer.forEach((item) => {
        item.removeEventListener('input', handleStepInput);
        item.removeEventListener('focus', handleStepFocus);
      });

      expectContainer.forEach((item) => {
        item.removeEventListener('input', handleExpectInput);
        item.removeEventListener('focus', handleExpectFocus);
      });
    };
  }, [open, signal]);

  const instance = {
    showModal,
    closeModal
  }
  const [inputValue, setInputValue] = useState("");
  const clearInput = () => {
    setInputValue("")
  };

  const ele = (
    <Modal
      {...modalProps}
      wrapClassName={isStickyTop ? "no-mask" : ""}
      maskClosable={!isStickyTop}
      style={disabled ? {} : { cursor: "move" }}
      title={
        <div style={{
          width: "100%", display: "flex", justifyItems: "space-between", alignItems: "center"
        }}>
          <Tooltip title="置顶">
            <div style={{
              marginRight: "10px",
              display: "flex",
              cursor: "pointer"
            }} onClick={() => {
              setIsStickyTop(x => {
                console.log("wjs: 当前的 stickyTop", x);
                return !x;
              });
            }}>{isStickyTop ? <Pin size={20} strokeWidth={1} /> : <PinOff size={20} strokeWidth={1} />}</div>
          </Tooltip>
          {/* 可拖拽区域禁用 */}
          {/* <DragContainer style={{ flex: 1, cursor: "move", height: 20, marginRight: "25px" }}>
          </DragContainer> */}

          {/* 拖拽控制 */}
          <Tooltip title={disabled ? "启用拖拽" : "禁用拖拽"}>
            <DragOutlined spin={!disabled} onClick={() => setDisabled(disabled => !disabled)} />
          </Tooltip>
        </div>
      }
    >
      <Space.Compact block>
        {
          KEYWORDS.map(({ text, cursorPostion }) => {
            return <Button onClick={() => {
              // inputText(text, cursorPostion)
              setInputValue(v => v + text)
            }}>{text}</Button>
          })
        }
        <Tooltip title="拷贝 testID 对象">
          <Button icon={<CopyFilled />} onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(testIDMap, null, 2))
              .then(() => {
                messageApi.open({
                  type: 'success',
                  content: 'TESTID 拷贝成功',
                  duration: 1,
                })
              })
          }} />
        </Tooltip>
      </Space.Compact>

      <Divider style={{ margin: "10px 0px" }} />

      <Input.TextArea
        value={inputValue}
        ref={inputRef}
        autoSize={{ minRows: 5, maxRows: 10 }}
        onInput={(e) => {
          setInputValue(e.target?.value)
        }}
        placeholder="输入 Enter 回车键提交， 使用 SHIFT + Enter 换行"
        onPressEnter={(e) => {
          console.log("wjs: e", e);
          if (e.shiftKey && e.key === "Enter") {
            return;
          }
          if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            inputText(e.target?.value);
            e.preventDefault();
            handleCancel();
          }
        }} />
      <Divider style={{ margin: "10px 0" }} />

      <Select
        showSearch
        value={"搜索选择 testID"}
        style={{ width: '100%' }}
        placeholder="搜索选择 testID"
        optionFilterProp="label"
        options={selectOptions}
        onSelect={(value) => {
          setInputValue(v => v + "[" + value + "]")
        }}
      />
      {contextHolder}
    </Modal>
  )
  return [instance, ele] as const
}