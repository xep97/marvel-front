import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type Hero = {
    id: string;
    name: string;
    alter_ego: string;
    power: string;
    team: string;
};

export default function App() {
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        alter_ego: "",
        power: "",
        team: "",
    });

    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchHeroes();
    }, []);

    async function fetchHeroes() {
        try {
            const res = await fetch(`${API_BASE_URL}/heroes`);
            if (!res.ok) throw new Error("Kunne ikke hente ut heltene");
            const data = await res.json();
            setHeroes(data);
        } catch {
            setError("Hvor er alle helter hen?");
        } finally {
            setLoading(false);
        }
    }

    function startEdit(hero: Hero) {
        setEditingId(hero.id);
        setFormData({
            name: hero.name,
            alter_ego: hero.alter_ego,
            power: hero.power,
            team: hero.team,
        });
    }

    async function deleteHero(id: string) {
        const res = await fetch(`${API_BASE_URL}/heroes/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) throw new Error("Kunne ikke slette helt");

        setHeroes((prev) => prev.filter((h) => h.id !== id));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            const url = editingId
                ? `${API_BASE_URL}/heroes/${editingId}`
                : `${API_BASE_URL}/heroes`;

            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Klarte ikke å lagre");

            const savedHero = await res.json();

            if (editingId) {
                setHeroes((prev) =>
                    prev.map((h) => (h.id === editingId ? savedHero : h)),
                );
            } else {
                setHeroes((prev) => [...prev, savedHero]);
            }

            setFormData({ name: "", alter_ego: "", power: "", team: "" });
            setEditingId(null);
        } catch {
            alert("Noe gikk galt ved lagring av helten din!");
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (loading) return <p>Laster helter...</p>;
    if (error) return <p>{error}</p>;

    return (
        <main>
            <h1>Marvel Superhelter🦸‍♂️</h1>

            <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
                <h2>Legg til ny superhelt</h2>

                <input
                    name='name'
                    placeholder='Spider-Man'
                    value={formData.name}
                    onChange={handleChange}
                />

                <input
                    name='alter_ego'
                    placeholder='Peter Parker'
                    value={formData.alter_ego}
                    onChange={handleChange}
                />

                <input
                    name='power'
                    placeholder='Spider-sense'
                    value={formData.power}
                    onChange={handleChange}
                />

                <input
                    name='team'
                    placeholder='Avengers'
                    value={formData.team}
                    onChange={handleChange}
                />

                <button className='btn btn--primary' type='submit'>
                    {editingId ? "Oppdater helt" : "Lagre helt"}
                </button>

                {editingId && (
                    <button
                        className='btn btn--primary'
                        type='button'
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                name: "",
                                alter_ego: "",
                                power: "",
                                team: "",
                            });
                        }}
                    >
                        Avbryt
                    </button>
                )}
            </form>

            <section>
                <h2>Helter</h2>

                {heroes.length === 0 && <p>Ingen helter registrert ennå</p>}

                <ul>
                    {heroes.map((hero) => (
                        <li key={hero.id} style={{ marginBottom: "1rem" }}>
                            <strong>{hero.name}</strong> ({hero.alter_ego})
                            <br />
                            Kraft: {hero.power}
                            <br />
                            Team: {hero.team}
                            <button
                                className='btn btn--danger'
                                onClick={() => {
                                    const ok = confirm(
                                        `Er du sikker på at du vil slette: ${hero.name}?`,
                                    );
                                    if (ok) deleteHero(hero.id);
                                }}
                            >
                                Slett
                            </button>
                            <button
                                className='btn btn--neutral'
                                onClick={() => startEdit(hero)}
                            >
                                Endre
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}