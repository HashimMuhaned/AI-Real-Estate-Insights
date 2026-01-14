"use client";
import { createContext, useContext, useState } from "react";
import PremiumModal from "@/components/premium_modal/PremiumModal";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modalProps, setModalProps] = useState(null);

  const openModal = (props: any) => setModalProps(props);
  const closeModal = () => setModalProps(null);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {modalProps && (
        <PremiumModal
          showModal={true}
          setShowModal={closeModal}
          {...modalProps}
        />
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
