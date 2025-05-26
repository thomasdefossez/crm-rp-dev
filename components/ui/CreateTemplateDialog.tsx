import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import React from "react";

const CreateTemplateDialog = ({ children }: { children: React.ReactNode }) => {
  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold">Hello Popin</h2>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateDialog;