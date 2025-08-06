// This component is no longer used and can be removed. I will keep it for now to avoid breaking changes, but it can be deleted.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export function Overview() {
  return (
    <div className="flex-1 space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Visión General</h2>
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>Bienvenido a Vendetta Latino</CardTitle>
          <CardDescription>
            Desde aquí puedes gestionar todos los aspectos de tus operaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p>Selecciona una opción del menú lateral para empezar a planificar tu próximo movimiento.</p>
            <div className="rounded-lg border overflow-hidden">
                <Image
                    src="https://placehold.co/1200x400.png"
                    alt="Placeholder de mapa de la ciudad"
                    width={1200}
                    height={400}
                    className="object-cover w-full h-auto"
                    data-ai-hint="dark city map"
                />
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
