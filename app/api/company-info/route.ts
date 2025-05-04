import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { siret } = await req.json()

        if (!siret || typeof siret !== "string") {
            return NextResponse.json({ error: "SIRET invalide" }, { status: 400 })
        }

        const res = await fetch(`https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${siret}`)

        if (!res.ok) {
            return NextResponse.json({ error: "Établissement non trouvé" }, { status: 404 })
        }

        const data = await res.json()
        const etablissement = data.etablissement

        const companyInfo = {
            companyName: etablissement.unite_legale.denomination || "",
            address: etablissement.adresse_ligne_1 || "",
            zipcode: etablissement.code_postal || "",
            city: etablissement.libelle_commune || "",
            country: "France",
        }

        return NextResponse.json(companyInfo)
    } catch (error) {
        console.error("Erreur API SIRET :", error)
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
    }
}