import { Modal } from "antd";
import { ModalProps } from "antd/es/modal/interface";

export function MyModal(
  props: {
    close: () => void;
  } & ModalProps
) {
  const { close, children, ...rest } = props;
  return (
    <Modal open={true} onCancel={close} footer={null} {...rest}>
      {children}
    </Modal>
  );
}
