"use client"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface TemplateDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    templates: { id: string; name: string; body: string }[];
}

export default function TemplateDrawer({
    open,
    onOpenChange,
    templates,
}: TemplateDrawerProps) {
    return (
        <Dialog open={open} onClose={onOpenChange} className="relative z-50">
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true" />
            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <DialogPanel className="pointer-events-auto w-screen max-w-4xl">
                            <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                                <div className="px-4 sm:px-6 flex justify-between items-center">
                                    <DialogTitle className="text-lg font-medium text-gray-900">Choisir un template</DialogTitle>
                                    <button
                                        type="button"
                                        onClick={() => onOpenChange(false)}
                                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <span className="sr-only">Close panel</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="relative mt-6 flex-1 px-4 sm:px-6">
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {templates.map((template) => (
                                            <div key={template.id} className="rounded border overflow-hidden shadow-sm bg-white flex flex-col">
                                                <div className="h-32 w-full bg-white flex items-center justify-center overflow-hidden">
                                                    <iframe srcDoc={template.body} className="w-full h-full" sandbox="" />
                                                </div>
                                                <div className="p-3 border-t flex flex-col justify-between gap-2 h-24">
                                                    <div className="text-sm font-medium text-gray-900 truncate">{template.name || "Template sans nom"}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}