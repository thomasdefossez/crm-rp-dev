// components/emails/MailyEditor.tsx
"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save, Eye, Clipboard } from "lucide-react";

// Importation dynamique du composant EmailEditor
const EmailEditor = dynamic(() => import("react-email-editor"), {
    ssr: false,
});

export default function MailyEditor() {
    const emailEditorRef = useRef<any>(null);
    const [isEditorReady, setIsEditorReady] = useState(false);

    const handleExportHtml = () => {
        if (emailEditorRef.current) {
            emailEditorRef.current.exportHtml((data: any) => {
                const { html } = data;
                console.log("Exported HTML:", html);
                toast.success("HTML exporté avec succès !");
            });
        }
    };

    const handleCopyHtml = () => {
        if (emailEditorRef.current) {
            emailEditorRef.current.exportHtml((data: any) => {
                const { html } = data;
                navigator.clipboard.writeText(html);
                toast.success("HTML copié dans le presse-papiers !");
            });
        }
    };

    const handlePreview = () => {
        if (emailEditorRef.current) {
            emailEditorRef.current.exportHtml((data: any) => {
                const { html } = data;
                const previewWindow = window.open();
                if (previewWindow) {
                    previewWindow.document.open();
                    previewWindow.document.write(html);
                    previewWindow.document.close();
                }
            });
        }
    };

    return (
        <div className="w-full h-full">
            <div className="flex items-center gap-2 mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                    disabled={!isEditorReady}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    Aperçu
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyHtml}
                    disabled={!isEditorReady}
                >
                    <Clipboard className="w-4 h-4 mr-2" />
                    Copier HTML
                </Button>
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleExportHtml}
                    disabled={!isEditorReady}
                >
                    <Save className="w-4 h-4 mr-2" />
                    Exporter HTML
                </Button>
            </div>
            <div className="h-[700px] border rounded-md overflow-hidden">
                <EmailEditor
                    ref={emailEditorRef}
                    onLoad={() => {
                        setIsEditorReady(true);
                        console.log("✅ Éditeur prêt");
                    }}
                />
            </div>
        </div>
    );
}