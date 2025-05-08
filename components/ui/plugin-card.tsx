import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PluginCardProps {
    title: string
    description: string
    icon: React.ReactNode
    badge: "Essentials" | "Mini" | "Plus"
    onConnect?: () => void
    disabled?: boolean
}

export function PluginCard({
                               title,
                               description,
                               icon,
                               badge,
                               onConnect,
                               disabled = false,
                           }: PluginCardProps) {
    const badgeStyles = {
        Essentials: "bg-gray-100 text-gray-800",
        Mini: "bg-green-100 text-green-800",
        Plus: "bg-purple-100 text-purple-800",
    }

    return (
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow gap-6">
            <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        {icon}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                </div>
                <Badge className={`text-xs px-2 py-0.5 border border-transparent ${badgeStyles[badge]}`}>
                    {badge}
                </Badge>
            </div>

            <div className="mt-6 flex justify-end">
                <Button variant="default" onClick={onConnect} disabled={disabled}>
                    Connecter
                </Button>
            </div>
        </div>
    )
}