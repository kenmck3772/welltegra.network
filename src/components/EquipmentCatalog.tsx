

// Main Equipment Catalog Component
export default function EquipmentCatalog() {
  const equipment = [
    { name: 'Blowout Preventer BOP-47', status: 'operational', tolerance: '98%', location: 'North Sea Alpha-4' },
    { name: 'Casing String CS-12', status: 'maintenance', tolerance: '92%', location: 'Norwegian Beta-2' },
    { name: 'Drill Bit DB-33', status: 'operational', tolerance: '99%', location: 'UK Charlie-7' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
          Equipment Catalog
        </h1>
        <p className="text-slate-400">
          Structured database tracking equipment tolerances, BOP status, and metallurgy specifications
        </p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1" style={{fontFamily: 'Space Grotesk, sans-serif'}}>
              Equipment Inventory
            </h3>
            <p className="text-sm text-slate-400">Real-time tolerance monitoring and maintenance tracking</p>
          </div>
          <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg border border-white/10 transition-colors">
            Add Equipment
          </button>
        </div>

        <div className="space-y-3">
          {equipment.map((item) => (
            <div key={item.name} className="p-4 bg-slate-950/30 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-white text-sm">{item.name}</div>
                <div className={`px-2 py-1 rounded text-xs ${
                  item.status === 'operational'
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {item.status}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Location: {item.location}</span>
                <span className={item.tolerance === '99%' ? 'text-teal-400' : 'text-amber-400'}>
                  Tolerance: {item.tolerance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
