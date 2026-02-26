"use client";

import * as React from "react";

type MachineType = "PKMN_50" | "SNS_25";

interface MachineToggleProps {
  selectedMachine: MachineType;
  onSelectMachine: (machine: MachineType) => void;
}

const MACHINES = [
  {
    id: "PKMN_50" as MachineType,
    name: "PKMN 50",
    icon: "⚡",
    color: "from-blue-500 to-purple-600",
    description: "Pokémon Cards",
  },
  {
    id: "SNS_25" as MachineType,
    name: "SNS 25",
    icon: "🔗",
    color: "from-purple-500 to-pink-600",
    description: "SNS Domains",
  },
];

export default function MachineToggle({
  selectedMachine,
  onSelectMachine,
}: MachineToggleProps) {
  return (
    <div className="flex items-center justify-center gap-2 p-2 bg-[#1A1A1A] rounded-2xl border border-gray-800">
      {MACHINES.map((machine) => (
        <button
          key={machine.id}
          onClick={() => onSelectMachine(machine.id)}
          className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            selectedMachine === machine.id
              ? `bg-gradient-to-r ${machine.color} text-white shadow-lg shadow-${machine.color.split("-")[1]}-500/25`
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          <span className="text-lg">{machine.icon}</span>
          <div className="flex flex-col items-start">
            <span>{machine.name}</span>
            <span className="text-[10px] font-normal opacity-70">
              {machine.description}
            </span>
          </div>
          {selectedMachine === machine.id && (
            <div className="absolute inset-0 rounded-xl ring-2 ring-white/20" />
          )}
        </button>
      ))}
    </div>
  );
}

export type { MachineType };