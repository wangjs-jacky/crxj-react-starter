import { EXPECT_CSS_SELECTOR, STEPS_CSS_SELECTOR } from "@/constant";
import { CopyFilled } from "@ant-design/icons";
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
    return <div style={{ cursor: 'move', backgroundColor: "red", ...style }}
      onMouseOver={() => {
        if (disabled) {
          setDisabled(true);
        }
      }}
      onMouseOut={() => {
        setDisabled(false);
      }}
      onFocus={() => { }}
      onBlur={() => { }}
      {...props}
    >{props.children}</div>
  }
  return {
    modalProps,
    showModal,
    closeModal,
    DragContainer,
  }
}


export const useSelectModal = (config?: any) => {
  // 是否置顶
  const [isStickyTop, setIsStickyTop] = useState(false);

  const { closeModal, showModal, DragContainer, modalProps } = useDraggableProps();
  const [messageApi, contextHolder] = message.useMessage();

  const { selectOptions, testIDMap } = config || {};

  const [stepIndex, setStepIndex] = useState(-1);
  const [expectIndex, setExpectIndex] = useState(-1);

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
      stepTextarea[stepIndex].value += text;
      stepTextarea[stepIndex].dispatchEvent(event);
    }
    if (expectTextarea && expectIndex > -1) {
      expectTextarea[expectIndex].value += text;
      expectTextarea[expectIndex].dispatchEvent(event);
    }
  }

  useEffect(() => {
    // 步骤描述区域
    const stepContainer = Array.from(document.querySelectorAll(STEPS_CSS_SELECTOR));
    // 期待描述区域
    const expectContainer = Array.from(document.querySelectorAll(EXPECT_CSS_SELECTOR));

    // 为元素绑定 input 监听事件
    stepContainer.forEach((item, index) => {
      item.addEventListener('input', function (event) {
        // 检查按下的键是否为 '[' 键
        if (event.data === '[' || event.data === ']') {
          // 手工执行 backspace 的 input 事件
          item.value = item.value.slice(0, -1);
          item.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true,
          }));
          showModal();
        }
      });
      item.addEventListener('focus', function (event) {
        if (event.target instanceof HTMLTextAreaElement) {
          setStepIndex(stepContainer.indexOf(event.target))
          setExpectIndex(-1);
        }
      })
    })

    // 为元素绑定 input 监听事件
    expectContainer.forEach((item, index) => {
      item.addEventListener('input', function (event) {
        // 检查按下的键是否为 '[' 键
        if (event.data === '[' || event.data === ']') {
          // 手工执行 backspace 的 input 事件
          item.value = item.value.slice(0, -1);
          item.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true,
          }));
          showModal();
        }
      });
      item.addEventListener('focus', function (event) {
        if (event.target instanceof HTMLTextAreaElement) {
          setStepIndex(-1);
          setExpectIndex(expectContainer.indexOf(event.target))
        }
      })
    })

  }, []);

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
          <DragContainer style={{ flex: 1 }}>
            可拖拽区域
          </DragContainer>
        </div>
      }
    >
      <Space.Compact block>
        {
          KEYWORDS.map(({ text, cursorPostion }) => {
            return <Button onClick={() => {
              inputText(text, cursorPostion)
              handleCancel();
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
      <Divider style={{ margin: "10px 0" }} />
      <Select
        showSearch
        value={"搜索选择 testID"}
        style={{ width: '100%' }}
        placeholder="搜索选择 testID"
        optionFilterProp="label"
        options={selectOptions}
        onSelect={(value) => {
          inputText("[" + value + "]")
          handleCancel();
        }}
      />
      <Divider style={{ margin: "10px 0" }} />

      <Input
        value={inputValue}
        addonBefore={"内容输入"}
        onInput={(e) => {
          setInputValue(e.target?.value)
        }}
        onPressEnter={(e) => {
          inputText(e.target?.value)
          clearInput();
          handleCancel();
        }} />

      {contextHolder}
    </Modal>
  )

  return [instance, ele] as const
}