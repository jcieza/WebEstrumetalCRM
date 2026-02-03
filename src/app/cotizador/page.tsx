'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import './cotizador.css';

const DEFAULT_CONFIG = {
    pricing: {
        "2mm": 4.00,
        "3mm": 3.80,
        "4mm": 3.80,
        "5mm": 3.80,
        "paint_box": 450.00,
        "person_day": 90.00,
        "overhead_fixed": 1900.00
    },
    conversion: {
        "2mm": 18700,
        "3mm": 18422,
        "4mm": 10298,
        "5mm": 5902
    },
    safety_margin: 1.02
};

const ScenarioCard = ({ scenario, index, onUpdate, config }) => {
    const [totalCost, setTotalCost] = useState(0);
    const [unitPrice, setUnitPrice] = useState(0);

    useEffect(() => {
        calculateCosts();
    }, [scenario, config]);

    const calculateCosts = () => {
        if (scenario.production.total === 0) {
            setTotalCost(0);
            setUnitPrice(0);
            return;
        }

        let cost = 0;

        // 1. Acero
        scenario.materials.forEach(mat => {
            let kg = 0;
            if (mat.unit === 'gr') kg = mat.qty / 1000;
            else if (mat.unit === 'mm') kg = mat.qty / config.conversion[mat.id];
            else kg = mat.qty;

            cost += (kg * scenario.production.total * config.pricing[mat.id] * config.safety_margin);
        });

        // 2. Arandelas
        cost += (scenario.extras.washers * scenario.production.total * 0.0583);

        // 3. Pintura
        const totalPaintKg = (scenario.extras.paint_gr * scenario.production.total) / 1000;
        const boxesNeeded = Math.ceil(totalPaintKg / 25);
        cost += (boxesNeeded * config.pricing.paint_box);

        // 4. Mano de Obra
        if (scenario.production.per_day > 0) {
            const daysNeeded = Math.ceil(scenario.production.total / scenario.production.per_day);
            cost += (daysNeeded * scenario.labor.count * config.pricing.person_day);
            const paintDays = Math.ceil(scenario.production.total / 600);
            cost += (paintDays * 3 * config.pricing.person_day);
        }

        // 5. Gastos Fijos
        cost += config.pricing.overhead_fixed;

        setTotalCost(cost);
        setUnitPrice(cost / scenario.production.total);
    };

    const handleInputChange = (path, value) => {
        const newScenario = { ...scenario };
        const keys = path.split('.');
        let current = newScenario;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        onUpdate(newScenario);
    };

    const handleMaterialChange = (matIndex, field, value) => {
        const newMaterials = [...scenario.materials];
        newMaterials[matIndex] = { ...newMaterials[matIndex], [field]: value };
        handleInputChange('materials', newMaterials);
    };

    return (
        <article className="glassCard">
            <div className="cardHeader">
                <h2>Escenario {index === 0 ? 'A' : 'B'}</h2>
                <input
                    type="text"
                    placeholder="Nombre (ej. Lote 3000)"
                    className="scenarioName"
                    value={scenario.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                />
            </div>

            <div className="inputsGroup">
                {[0, 1].map(matIdx => (
                    <div className="inputField" key={matIdx}>
                        <label>Material {matIdx + 1}</label>
                        <div className="inputRow">
                            <select
                                className="inputControl"
                                value={scenario.materials[matIdx].id}
                                onChange={(e) => handleMaterialChange(matIdx, 'id', e.target.value)}
                            >
                                <option value="2mm">Alambre 2mm</option>
                                <option value="3mm">Alambre 3mm</option>
                                <option value="4mm">Alambre 4mm</option>
                                <option value="5mm">Alambre 5mm</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Cant."
                                className="inputControl"
                                value={scenario.materials[matIdx].qty || ''}
                                onChange={(e) => handleMaterialChange(matIdx, 'qty', parseFloat(e.target.value) || 0)}
                            />
                            <select
                                className="inputControl"
                                value={scenario.materials[matIdx].unit}
                                onChange={(e) => handleMaterialChange(matIdx, 'unit', e.target.value)}
                            >
                                <option value="gr">Gramos</option>
                                <option value="mm">Milímetros</option>
                                <option value="kg">Kilos</option>
                            </select>
                        </div>
                    </div>
                ))}

                <div className="inputField">
                    <label>Otros Detalle</label>
                    <div className="inputRow">
                        <input
                            type="number"
                            placeholder="Arandelas"
                            className="inputControl"
                            value={scenario.extras.washers || ''}
                            onChange={(e) => handleInputChange('extras.washers', parseFloat(e.target.value) || 0)}
                        />
                        <input
                            type="number"
                            placeholder="Pintura (gr)"
                            className="inputControl"
                            value={scenario.extras.paint_gr || ''}
                            onChange={(e) => handleInputChange('extras.paint_gr', parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>

                <div className="inputField">
                    <label>Producción</label>
                    <div className="inputRow">
                        <input
                            type="number"
                            placeholder="Unidades Totales"
                            className="inputControl"
                            value={scenario.production.total || ''}
                            onChange={(e) => handleInputChange('production.total', parseFloat(e.target.value) || 0)}
                        />
                        <input
                            type="number"
                            placeholder="Und/Día"
                            className="inputControl"
                            value={scenario.production.per_day || ''}
                            onChange={(e) => handleInputChange('production.per_day', parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>

                <div className="inputField">
                    <label>Personal & Recursos</label>
                    <div className="inputRow">
                        <input
                            type="number"
                            placeholder="Cant. Personas"
                            className="inputControl"
                            value={scenario.labor.count || ''}
                            onChange={(e) => handleInputChange('labor.count', parseFloat(e.target.value) || 0)}
                        />
                        <input
                            type="text"
                            placeholder="Link Google Drive"
                            className="inputControl"
                            value={scenario.driveLink || ''}
                            onChange={(e) => handleInputChange('driveLink', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="resultsPanel">
                <div className="resultItem">
                    <span>Costo Directo Total</span>
                    <span className="value mainPrice">S/ {totalCost.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="resultItem secondary">
                    <span>Costo por Unidad</span>
                    <span className="value unitPrice">S/ {unitPrice.toFixed(2)}</span>
                </div>
            </div>
        </article>
    );
};

export default function CotizadorPage() {
    const [scenarios, setScenarios] = useState([
        {
            name: "Escenario A",
            materials: [
                { id: "3mm", qty: 0, unit: "gr" },
                { id: "4mm", qty: 0, unit: "mm" }
            ],
            extras: { washers: 0, paint_gr: 0 },
            production: { total: 0, per_day: 0 },
            labor: { count: 0 },
            driveLink: ""
        },
        {
            name: "Escenario B",
            materials: [
                { id: "3mm", qty: 0, unit: "gr" },
                { id: "4mm", qty: 0, unit: "mm" }
            ],
            extras: { washers: 0, paint_gr: 0 },
            production: { total: 0, per_day: 0 },
            labor: { count: 0 },
            driveLink: ""
        }
    ]);
    const [saving, setSaving] = useState(false);

    const updateScenario = (index, newData) => {
        const newScenarios = [...scenarios];
        newScenarios[index] = newData;
        setScenarios(newScenarios);
    };

    const saveToFirestore = async () => {
        setSaving(true);
        try {
            for (const s of scenarios) {
                if (s.name) {
                    await addDoc(collection(db, "quotation_scenarios"), {
                        ...s,
                        createdAt: new Date(),
                        configSnapshot: DEFAULT_CONFIG
                    });
                }
            }
            alert("¡Cotizaciones guardadas en Firestore!");
        } catch (error) {
            console.error("Error saving to Firestore:", error);
            alert("Error al guardar. Verifica la configuración de Firebase.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="cotizadorBody">
            <div className="bgGradient"></div>

            <header className="glassHeader">
                <div className="logo">
                    <span className="brand">ESTRUMETAL</span>
                    <span className="tagline">Finanzas de Guerra</span>
                </div>
                <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button
                        className="iconBtn"
                        onClick={saveToFirestore}
                        disabled={saving}
                        style={{ color: 'var(--accent-orange)', fontWeight: 'bold' }}
                    >
                        {saving ? 'Guardando...' : '💾 GUARDAR'}
                    </button>
                    <button className="iconBtn">⚙️</button>
                </nav>
            </header>

            <main className="container">
                <section className="comparisonGrid">
                    {scenarios.map((s, idx) => (
                        <ScenarioCard
                            key={idx}
                            index={idx}
                            scenario={s}
                            config={DEFAULT_CONFIG}
                            onUpdate={(newData) => updateScenario(idx, newData)}
                        />
                    ))}
                </section>
            </main>
        </div>
    );
}
