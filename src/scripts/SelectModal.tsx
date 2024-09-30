import { EXPECT_CSS_SELECTOR, STEPS_CSS_SELECTOR } from "@/constant";
import { CopyFilled } from "@ant-design/icons";
import { Button, message, Modal, notification, Select, Space, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import type { DraggableData, DraggableEvent } from "react-draggable";
import Draggable from "react-draggable";

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
    return <div style={{ cursor: 'move' }}
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
  const { closeModal, showModal, DragContainer, modalProps } = useDraggableProps();
  const [messageApi, contextHolder] = message.useMessage();

  const { selectOptions, testIDMap } = config || {};
  console.log("wjs: selectOptions", selectOptions);

  const [stepIndex, setStepIndex] = useState(-1);
  const [expectIndex, setExpectIndex] = useState(-1);
  const handleCancel = () => {
    closeModal();
  }

  useEffect(() => {
    // 步骤描述区域
    const stepContainer = Array.from(document.querySelectorAll(STEPS_CSS_SELECTOR));
    // 期待描述区域
    const expectContainer = Array.from(document.querySelectorAll(EXPECT_CSS_SELECTOR));

    // 为元素绑定 input 监听事件
    stepContainer.forEach((item, index) => {
      item.addEventListener('input', function (event) {
        if (event.target instanceof HTMLTextAreaElement) {
          setStepIndex(stepContainer.indexOf(event.target))
        }
        // 检查按下的键是否为 '[' 键
        if (event.data === '[') {
          event.preventDefault();
          showModal();
        }
      });
    })

    // 为元素绑定 input 监听事件
    expectContainer.forEach((item, index) => {
      item.addEventListener('input', function (event) {
        if (event.target instanceof HTMLTextAreaElement) {
          setExpectIndex(expectContainer.indexOf(event.target))
        }
        // 检查按下的键是否为 '[' 键
        if (event.data === '[') {
          event.preventDefault();
          showModal();
        }
      });
    })
  }, []);

  const instance = {
    showModal,
    closeModal
  }

  const ele = (
    <Modal
      {...modalProps}
      title={
        <DragContainer>
          <Space>
            可拖拽区域
          </Space>
        </DragContainer>
      }
    >
      <Space direction="vertical" style={{ display: "flex" }}>
        <Space.Compact block style={{ marginBottom: "10px" }}>
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
        <Select
          showSearch
          value={""}
          style={{ width: '100%' }}
          placeholder="搜索选择 testID1"
          optionFilterProp="label"
          options={selectOptions}
          onSelect={(value) => {
            const event = new Event('input', {
              bubbles: true,
              cancelable: true,
            });
            const stepTextarea = document.querySelectorAll(STEPS_CSS_SELECTOR)!;
            const expectTextarea = document.querySelectorAll(EXPECT_CSS_SELECTOR)!;
            if (stepTextarea && stepIndex > -1) {
              stepTextarea[stepIndex].value += value + "]";
              stepTextarea[stepIndex].dispatchEvent(event);
            }
            if (expectTextarea && expectIndex > -1) {
              expectTextarea[expectIndex].value += value + "]";
              expectTextarea[expectIndex].dispatchEvent(event);
            }
            handleCancel();
          }}
        />
      </Space>

      {contextHolder}
    </Modal>
  )

  return [instance, ele] as const
}