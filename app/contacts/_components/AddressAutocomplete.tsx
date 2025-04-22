import React, { useState, useEffect } from "react";

type AddressData = {
    label: string;
    postcode: string;
    city: string;
    region: string;
    country: string;
};

type Props = {
    onAddressSelected: (data: AddressData) => void;
};

const AddressAutocomplete: React.FC<Props> = ({ onAddressSelected }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (query.length < 3) return;

        const fetchAddresses = async () => {
            try {
                const res = await fetch(
                    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
                );
                const data = await res.json();
                setResults(data.features);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Erreur lors de la recherche d'adresse :", error);
                setResults([]);
                setShowSuggestions(false);
            }
        };

        fetchAddresses();
    }, [query]);

    const handleSelect = (feature: any) => {
        const props = feature.properties;
        onAddressSelected({
            label: props.label,
            postcode: props.postcode,
            city: props.city,
            region: props.context?.split(", ")[1] || "",
            country: "France",
        });
        setQuery(props.label);
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 3 && setShowSuggestions(true)}
                placeholder="Adresse"
                className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showSuggestions && results.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-auto shadow-lg">
                    {results.map((r, i) => (
                        <li
                            key={i}
                            onClick={() => handleSelect(r)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {r.properties.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AddressAutocomplete;