"use client"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface Template {
    id: string
    name: string
    body: string
}

interface TemplateDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    templates: Template[]
    onSelect: (body: string) => void;
}

export default function TemplateDrawer({
    open,
    onOpenChange,
    templates,
    onSelect,
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
                                    <div className="grid grid-cols-2 gap-6">
                                        {templates.map((template) => (
                                            <button
                                                key={template.id}
                                                onClick={() => {
                                                    onSelect(template.body)
                                                    onOpenChange(false)
                                                }}
                                                className="block rounded-lg border hover:border-purple-500 transition bg-white shadow-sm overflow-hidden text-left w-full"
                                            >
                                                <div className="aspect-[3/2] w-full bg-white flex items-center justify-center overflow-hidden">
                                                    <iframe
                                                        srcDoc={template.body}
                                                        className="w-full h-full border-none"
                                                        sandbox=""
                                                    />
                                                </div>
                                                <div className="p-3 border-t">
                                                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                                                </div>
                                            </button>
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