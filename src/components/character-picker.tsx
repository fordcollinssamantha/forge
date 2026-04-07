"use client";

import { VOICE_CHARACTERS, type VoiceCharacter } from "@/lib/voice-config";

interface CharacterPickerProps {
  onSelect: (character: VoiceCharacter) => void;
}

export default function CharacterPicker({ onSelect }: CharacterPickerProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <h2 className="text-base font-semibold text-navy text-center mb-1">
        Who are you talking to?
      </h2>
      <p className="text-xs text-navy/40 text-center mb-5">
        Pick a character for this conversation.
      </p>
      <div className="flex flex-col gap-3 max-w-md mx-auto">
        {VOICE_CHARACTERS.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelect(char)}
            className="w-full bg-white border-2 border-navy/8 rounded-2xl p-4 text-left transition-all hover:border-coral/30 hover:shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-full ${char.color} flex items-center justify-center shrink-0`}
              >
                <span className="text-white text-lg font-bold">
                  {char.name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-navy">
                  {char.name}
                </p>
                <p className="text-[13px] text-navy/50 leading-relaxed mt-0.5">
                  {char.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
