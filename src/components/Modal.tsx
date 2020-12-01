import React, { ReactChild, ReactChildren } from 'react';

type Props = {
  title?: string;
  open: boolean;
  onClose: () => void;
  children?: ReactChild | JSX.Element[];
};

const Modal = ({ title, open, children, onClose }: Props) => {
  const backdropClass = open ? 'modal-backdrop' : 'modal-backdrop hidden';
  const containerClass = open ? 'modal-container' : 'modal-container hidden';
  return (
    <>
      <div className={backdropClass} />
      <div className={containerClass} onClick={() => onClose()}>
        <div className="modal">
          {title && <div className="modal-title">{title}</div>}
          {children && <div className="modal-content">{children}</div>}
        </div>
      </div>
    </>
  );
};

export default Modal;
