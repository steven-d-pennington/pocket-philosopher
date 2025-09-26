"use client";

import { CreatePracticeModal } from "@/components/practices/create-practice-modal";
import { EditPracticeModal } from "@/components/practices/edit-practice-modal";

export function PracticeModals() {
  return (
    <>
      <CreatePracticeModal />
      <EditPracticeModal />
    </>
  );
}
