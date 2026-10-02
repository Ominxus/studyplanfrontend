export default function DurationInput({
  value,
  onChange,
  disabled = false
}) {
  const totalMinutes = Number(value) || 0;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const updateHours = (newHours) => {
    const safeHours = Math.max(
      0,
      Number(newHours) || 0
    );

    onChange(
      safeHours * 60 + minutes
    );
  };

  const updateMinutes = (newMinutes) => {
    const safeMinutes = Math.min(
      59,
      Math.max(
        0,
        Number(newMinutes) || 0
      )
    );

    onChange(
      hours * 60 + safeMinutes
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={hours}
            disabled={disabled}
            onChange={(event) =>
              updateHours(event.target.value)
            }
            className="w-full p-4 pr-16 bg-blue-50 border-2 border-blue-100 rounded-2xl"
          />

          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
            hr
          </span>
        </div>
      </div>

      <div>
        <div className="relative">
          <input
            type="number"
            min="0"
            max="59"
            value={minutes}
            disabled={disabled}
            onChange={(event) =>
              updateMinutes(event.target.value)
            }
            className="w-full p-4 pr-16 bg-blue-50 border-2 border-blue-100 rounded-2xl"
          />

          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
            min
          </span>
        </div>
      </div>
    </div>
  );
}
