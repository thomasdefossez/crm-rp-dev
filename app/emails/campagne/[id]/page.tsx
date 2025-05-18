"use client";
import { useParams } from 'next/navigation'

export default function Page() {
    const params = useParams();
    const campagneId = params.id;

    return <div>ID de campagne : {campagneId}</div>;
}