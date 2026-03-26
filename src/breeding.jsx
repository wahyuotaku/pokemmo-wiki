import React, { useState, useEffect } from 'react';
import { Swords, Shield, Heart, Wind, Zap, Activity, Baby, Info, GitCommit, Calculator, CheckCircle2, Archive, Trash2, Download, Save, Tent, ArrowRight, X, Maximize, Minimize } from 'lucide-react';

// Daftar stat, ikon, dan warnanya
const STATS = [
  { key: 'hp', label: 'HP', icon: Heart, color: 'text-red-400' },
  { key: 'atk', label: 'Attack', icon: Swords, color: 'text-orange-400' },
  { key: 'def', label: 'Defense', icon: Shield, color: 'text-yellow-400' },
  { key: 'spa', label: 'Sp. Atk', icon: Zap, color: 'text-blue-400' },
  { key: 'spd', label: 'Sp. Def', icon: Activity, color: 'text-indigo-400' },
  { key: 'spe', label: 'Speed', icon: Wind, color: 'text-pink-400' }
];

const STAT_COLORS = STATS.reduce((acc, stat) => ({ ...acc, [stat.key]: stat.color }), {});

// Daftar item pembiakan
const ITEMS = {
  NONE: { name: 'Tanpa Item', effect: null, cost: 0 },
  EVERSTONE: { name: 'Everstone', effect: 'nature', cost: 5000 },
  POWER_WEIGHT: { name: 'Power Weight (HP)', effect: 'hp', cost: 10000 },
  POWER_BRACER: { name: 'Power Bracer (Atk)', effect: 'atk', cost: 10000 },
  POWER_BELT: { name: 'Power Belt (Def)', effect: 'def', cost: 10000 },
  POWER_LENS: { name: 'Power Lens (SpA)', effect: 'spa', cost: 10000 },
  POWER_BAND: { name: 'Power Band (SpD)', effect: 'spd', cost: 10000 },
  POWER_ANKLET: { name: 'Power Anklet (Spe)', effect: 'spe', cost: 10000 },
};

const BRACE_MAP = {
  'hp': 'Power Weight',
  'atk': 'Power Bracer',
  'def': 'Power Belt',
  'spa': 'Power Lens',
  'spd': 'Power Band',
  'spe': 'Power Anklet'
};

const GENDER_COSTS = {
  RANDOM: { label: 'Acak (Gratis)', cost: 0 },
  NORMAL: { label: 'Biasa (50/50)', cost: 5000 },
  RARE: { label: 'Langka (Misal: Eevee Cewek)', cost: 21000 },
};

const NATURES = [
  "Adamant", "Bashful", "Bold", "Brave", "Calm", "Careful", "Docile", 
  "Gentle", "Hardy", "Hasty", "Impish", "Jolly", "Lax", "Lonely", "Mild", 
  "Modest", "Naive", "Naughty", "Quiet", "Quirky", "Rash", "Relaxed", 
  "Sassy", "Serious", "Timid"
];

// --- ALGORITMA GENERATOR POHON POKEMMO ---
function generateTreeData(targetIvs, targetNature) {
  function buildNode(ivs, nature, heldItem) {
    let node = { ivs, nature, heldItem, left: null, right: null };
    if (ivs.length === 1 && !nature) { node.isBase = true; return node; }
    if (ivs.length === 0 && nature) { node.isBase = true; return node; }

    if (nature) {
      const braceStat = ivs[ivs.length - 1];
      node.left = buildNode([...ivs], null, BRACE_MAP[braceStat]);
      node.right = buildNode(ivs.slice(0, -1), nature, 'Everstone');
    } else {
      const brace1 = ivs[ivs.length - 2];
      const brace2 = ivs[ivs.length - 1];
      node.left = buildNode(ivs.filter(i => i !== brace2), null, BRACE_MAP[brace1]);
      node.right = buildNode(ivs.filter(i => i !== brace1), null, BRACE_MAP[brace2]);
    }
    return node;
  }
  if (targetIvs.length === 0) return null;
  return buildNode(targetIvs, targetNature, null); 
}

// --- KOMPONEN RENDERER POHON ---
const TreeRender = ({ node }) => {
  if (!node) return null;
  return (
    <li>
      <div className="inline-flex flex-col items-center justify-center p-4 lg:p-5 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-2xl shadow-xl relative min-w-[180px] lg:min-w-[220px] m-3 transition-all hover:-translate-y-2 hover:border-blue-400 hover:shadow-blue-500/30 z-10 w-max">
        <div className="font-extrabold text-base lg:text-lg text-emerald-600 dark:text-emerald-400 drop-shadow-sm mb-2">
          {node.ivs.length === 0 ? 'Base Nature' : `${node.ivs.length}x31`} {node.nature || ''}
        </div>
        <div className="text-xs lg:text-sm my-1.5 font-bold uppercase flex flex-wrap justify-center gap-2">
          {node.ivs.length > 0 ? node.ivs.map(i => (
            <span key={i} className={`${STAT_COLORS[i]} bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded-md border border-gray-300 dark:border-slate-700 shadow-sm`}>{i}</span>
          )) : <span className="text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded-md border border-gray-300 dark:border-slate-700 shadow-sm">Terserah</span>}
        </div>
        {node.heldItem && (
          <div className={`mt-4 text-sm lg:text-base px-3 py-2 rounded-xl w-full text-center whitespace-nowrap font-bold shadow-inner border-2 ${node.heldItem === 'Everstone' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/50' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/50'}`}>
            Beri: {node.heldItem}
          </div>
        )}
      </div>
      {(node.left || node.right) && (
        <ul>
          {node.left && <TreeRender node={node.left} />}
          {node.right && <TreeRender node={node.right} />}
        </ul>
      )}
    </li>
  );
}

// --- KOMPONEN POHON SILSILAH (LINEAGE) ---
const LineageTree = ({ poke }) => {
  if (!poke) return null;
  const count31 = Object.values(poke.ivs || {}).filter(v => v === 31).length;
  return (
    <li>
      <div className="inline-flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-xl shadow-xl relative min-w-[140px] m-2 transition-all hover:-translate-y-1 hover:border-amber-400 hover:shadow-amber-500/20 z-10">
        <div className="font-extrabold text-sm text-amber-400 drop-shadow-sm">
          {poke.name}
        </div>
        <div className="text-xs text-slate-700 dark:text-slate-300 mt-1 font-semibold">
          {count31}x31 • {poke.nature}
        </div>
        <div className="text-[10px] my-1.5 font-bold uppercase flex flex-wrap justify-center gap-1.5">
          {STATS.map(s => poke.ivs[s.key] === 31 ? (
            <span key={s.key} className={`${STAT_COLORS[s.key]} bg-gray-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700`}>{s.label}</span>
          ) : null)}
          {count31 === 0 && <span className="text-gray-600 dark:text-slate-500 bg-gray-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-gray-300 dark:border-slate-700">Polos</span>}
        </div>
        {poke.usedItem && poke.usedItem !== 'NONE' && (
          <div className={`mt-2 text-[10px] px-2 py-1 rounded w-full text-center whitespace-nowrap font-bold shadow-inner ${poke.usedItem === 'EVERSTONE' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
            Item: {ITEMS[poke.usedItem].name.split(' ')[0]}
          </div>
        )}
      </div>
      {poke.parents && poke.parents.length > 0 && (
        <ul>
          {poke.parents.map((p, idx) => <LineageTree key={idx} poke={p} />)}
        </ul>
      )}
    </li>
  );
}

// --- APP UTAMA ---
export default function BreedingCalculator() {
  const [activeTab, setActiveTab] = useState('field'); // 'calc', 'tree', 'box', 'field'

  // --- STATE INVENTORY (BOX UTAMA & TEMP) ---
  const [inventory, setInventory] = useState(() => {
    try { 
      const saved = JSON.parse(localStorage.getItem('pokemmo_box'));
      // Jika kosong, masukkan data inisial otomatis
      return saved && saved.length > 0 ? saved : [];
    } catch { 
      return []; 
    }
  });
  
  const [tempInventory, setTempInventory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pokemmo_temp_box')) || []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('pokemmo_box', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('pokemmo_temp_box', JSON.stringify(tempInventory)); }, [tempInventory]);

  // --- STATE KALKULATOR TUNGGAL ---
  const [parentA, setParentA] = useState({ name: 'Ibu (Betina)', ivs: { hp: 31, atk: 31, def: 25, spa: 10, spd: 31, spe: 20 }, nature: 'Adamant', item: 'NONE' });
  const [parentB, setParentB] = useState({ name: 'Bapak (Jantan)', ivs: { hp: 31, atk: 31, def: 31, spa: 15, spd: 31, spe: 31 }, nature: 'Jolly', item: 'NONE' });
  const [childGender, setChildGender] = useState('NORMAL');
  const [childStats, setChildStats] = useState({});
  const [childNature, setChildNature] = useState('Acak');
  const [totalCost, setTotalCost] = useState(0);

  // --- STATE LAPANGAN (FIELD) ---
  const [slotA, setSlotA] = useState(null); // { pokemon, item }
  const [slotB, setSlotB] = useState(null); // { pokemon, item }
  const [fieldChild, setFieldChild] = useState({ name: '', gender: 'Betina', nature: 'Acak', ivs: {} });
  const [genderError, setGenderError] = useState(false); // State error kelamin

  // --- STATE BOX POKEMON ---
  const [newBoxPoke, setNewBoxPoke] = useState({ name: '', gender: 'Betina', nature: 'Adamant', ivs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 } });
  
  // --- STATE TREE PLANNER ---
  const [treeIvs, setTreeIvs] = useState(['hp', 'atk', 'def', 'spd', 'spe']);
  const [treeNature, setTreeNature] = useState('Adamant');
  const [treeData, setTreeData] = useState(null);
  const [isTreeFullscreen, setIsTreeFullscreen] = useState(false);

  const treeStats = React.useMemo(() => {
    if (!treeData) return null;
    let cost = 0;
    let items = {};
    const traverse = (n) => {
      if(!n) return;
      if(n.heldItem) {
        if(n.heldItem === 'Everstone') cost += 5000;
        else cost += 10000;
        items[n.heldItem] = (items[n.heldItem] || 0) + 1;
      }
      traverse(n.left); traverse(n.right);
    };
    traverse(treeData);
    return { cost, items };
  }, [treeData]);

  // Fungsi Tree Planner
  const toggleTreeIv = (key) => {
    if (treeIvs.includes(key)) {
      setTreeIvs(treeIvs.filter(k => k !== key));
    } else {
      if (treeIvs.length < 6) setTreeIvs([...treeIvs, key]);
    }
  };

  const handleGenerateTree = () => {
    setTreeData(generateTreeData(treeIvs, treeNature));
  };

  // Function Kalkulator Tunggal
  useEffect(() => {
    if (activeTab !== 'calc') return;
    const newChildStats = {};
    STATS.forEach(stat => {
      const pA_IV = parseInt(parentA.ivs[stat.key]) || 0;
      const pB_IV = parseInt(parentB.ivs[stat.key]) || 0;
      const pA_Item = ITEMS[parentA.item];
      const pB_Item = ITEMS[parentB.item];
      let result = ''; let isGuaranteed = false;

      if (pA_Item.effect === stat.key && pB_Item.effect === stat.key) { result = pA_IV; isGuaranteed = true; }
      else if (pA_Item.effect === stat.key) { result = pA_IV; isGuaranteed = true; }
      else if (pB_Item.effect === stat.key) { result = pB_IV; isGuaranteed = true; }
      else if (pA_IV === pB_IV) { result = pA_IV; isGuaranteed = true; }
      else { result = `${Math.min(pA_IV, pB_IV)} - ${Math.floor((pA_IV + pB_IV) / 2)}`; }
      newChildStats[stat.key] = { value: result, isGuaranteed };
    });
    setChildStats(newChildStats);
    if (ITEMS[parentA.item].effect === 'nature' && ITEMS[parentB.item].effect === 'nature') {
      setChildNature(parentA.nature === parentB.nature ? parentA.nature : `${parentA.nature} / ${parentB.nature}`);
    } else if (ITEMS[parentA.item].effect === 'nature') { setChildNature(parentA.nature); }
    else if (ITEMS[parentB.item].effect === 'nature') { setChildNature(parentB.nature); }
    else { setChildNature('Acak'); }
    setTotalCost(ITEMS[parentA.item].cost + ITEMS[parentB.item].cost + GENDER_COSTS[childGender].cost);
  }, [parentA, parentB, childGender, activeTab]);

  // Function Field Child Calculation
  useEffect(() => {
    if (activeTab !== 'field') return;
    if (!slotA || !slotB) {
      setGenderError(false);
      return;
    }

    // --- VALIDASI GENDER MUTLAK ---
    const gA = slotA.pokemon.gender;
    const gB = slotB.pokemon.gender;
    const isValidPair = 
      (gA === 'Bebas' && gB !== 'Bebas') ||  // Ditto x Jantan/Betina
      (gB === 'Bebas' && gA !== 'Bebas') ||  // Jantan/Betina x Ditto
      (gA !== gB && gA !== 'Bebas' && gB !== 'Bebas'); // Jantan x Betina
      
    if (!isValidPair) {
      setGenderError(true);
      return;
    }
    setGenderError(false);
    // -----------------------

    const newIvs = {};
    let newNature = 'Acak';

    STATS.forEach(stat => {
      const valA = parseInt(slotA.pokemon.ivs[stat.key]) || 0;
      const valB = parseInt(slotB.pokemon.ivs[stat.key]) || 0;
      const itemA = ITEMS[slotA.item].effect;
      const itemB = ITEMS[slotB.item].effect;

      if (itemA === stat.key) newIvs[stat.key] = valA;
      else if (itemB === stat.key) newIvs[stat.key] = valB;
      else if (valA === valB && valA === 31) newIvs[stat.key] = 31; // Tumpang tindih mutlak
      else newIvs[stat.key] = 0; // Hilang karena RNG
    });

    const itemA_eff = ITEMS[slotA.item].effect;
    const itemB_eff = ITEMS[slotB.item].effect;
    
    if (itemA_eff === 'nature' && itemB_eff === 'nature') {
      newNature = slotA.pokemon.nature; // Anggap ambil A jika clash
    } else if (itemA_eff === 'nature') newNature = slotA.pokemon.nature;
    else if (itemB_eff === 'nature') newNature = slotB.pokemon.nature;

    setFieldChild(prev => ({
      ...prev,
      name: `Anak ${slotA.pokemon.name.split(' ')[0]} & ${slotB.pokemon.name.split(' ')[0]}`,
      ivs: newIvs,
      nature: newNature,
      parents: [
        { ...slotA.pokemon, usedItem: slotA.item },
        { ...slotB.pokemon, usedItem: slotB.item }
      ]
    }));
  }, [slotA, slotB, activeTab]);

  // Utility Drag & Drop
  const handleDragStart = (e, poke) => {
    e.dataTransfer.setData('application/json', JSON.stringify(poke));
  };

  const handleDrop = (e, targetSlot) => {
    e.preventDefault();
    try {
      const poke = JSON.parse(e.dataTransfer.getData('application/json'));
      if (targetSlot === 'A') setSlotA({ pokemon: poke, item: 'NONE' });
      if (targetSlot === 'B') setSlotB({ pokemon: poke, item: 'NONE' });
    } catch (err) {}
  };

  const saveChildToTemp = () => {
    if(!slotA || !slotB) return;
    const id = "temp_" + Date.now().toString();
    setTempInventory([...tempInventory, { ...fieldChild, id }]);
    // Reset Lapangan
    setSlotA(null); setSlotB(null);
  };

  // Komponen Kartu Pokemon Kecil (Sidebar)
  const MiniPokeCard = ({ poke, isTemp = false }) => (
    <div 
      draggable 
      onDragStart={(e) => handleDragStart(e, poke)}
      className={`p-3 rounded-lg border-2 mb-3 cursor-grab active:cursor-grabbing relative group ${isTemp ? 'bg-indigo-900/40 border-indigo-500/50 hover:border-indigo-400' : 'bg-slate-800 border-slate-600 hover:border-blue-400'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-bold text-sm text-white truncate pr-6">{poke.name}</div>
        <button onClick={() => isTemp ? setTempInventory(tempInventory.filter(p => p.id !== poke.id)) : setInventory(inventory.filter(p => p.id !== poke.id))} className="absolute top-2 right-2 text-slate-500 hover:text-red-400">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex items-center gap-2 text-[10px] mb-2 font-medium">
        <span className={poke.gender === 'Betina' ? 'text-pink-400' : poke.gender === 'Jantan' ? 'text-blue-400' : 'text-purple-400'}>{poke.gender}</span>
        <span className="text-slate-500">|</span>
        <span className="text-emerald-400">{poke.nature}</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {STATS.filter(s => poke.ivs[s.key] === 31).map(s => (
          <span key={s.key} className={`text-[9px] px-1 py-0.5 rounded bg-gray-100 dark:bg-slate-900 ${s.color} border border-gray-300 dark:border-slate-700`}>{s.label} 31</span>
        ))}
        {Object.values(poke.ivs).every(v => v !== 31) && <span className="text-[9px] text-slate-500">IV Polos</span>}
      </div>
      <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setSlotA({ pokemon: poke, item: 'NONE'})} className="flex-1 bg-gray-400 dark:bg-slate-700 hover:bg-pink-600/50 dark:hover:bg-pink-600/50 text-white text-[10px] py-1 rounded">Ke A</button>
        <button onClick={() => setSlotB({ pokemon: poke, item: 'NONE'})} className="flex-1 bg-gray-400 dark:bg-slate-700 hover:bg-blue-600/50 dark:hover:bg-blue-600/50 text-white text-[10px] py-1 rounded">Ke B</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-200 p-4 md:p-6 font-sans selection:bg-blue-500/30">
      
      {/* CSS untuk menggambar garis pohon & scrollbar */}
      <style>{`
        .tree-container ul { padding-top: 24px; position: relative; display: flex; justify-content: center; }
        .tree-container li { float: left; text-align: center; list-style-type: none; position: relative; padding: 24px 8px 0 8px; }
        .tree-container li::before, .tree-container li::after { content: ''; position: absolute; top: 0; right: 50%; border-top: 2px solid #d1d5db; width: 50%; height: 24px; }
        .tree-container li::after { right: auto; left: 50%; border-left: 2px solid #d1d5db; }
        .tree-container li:only-child::after, .tree-container li:only-child::before { display: none; }
        .tree-container li:only-child { padding-top: 0; }
        .tree-container li:first-child::before, .tree-container li:last-child::after { border: 0 none; }
        .tree-container li:last-child::before { border-right: 2px solid #d1d5db; border-radius: 0 6px 0 0; }
        .tree-container li:first-child::after { border-radius: 6px 0 0 0; }
        .tree-container ul ul::before { content: ''; position: absolute; top: 0; left: 50%; border-left: 2px solid #d1d5db; width: 0; height: 24px; }
        
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f3f4f6; border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        
        /* Dark mode scrollbar */
        :root:has(.dark .custom-scroll) .custom-scroll::-webkit-scrollbar-track { background: #1e293b; }
        :root:has(.dark .custom-scroll) .custom-scroll::-webkit-scrollbar-thumb { background: #475569; }
        
        @media (prefers-color-scheme: dark) {
          .tree-container li::before, .tree-container li::after { border-top-color: #475569; border-left-color: #475569; }
          .tree-container li:last-child::before { border-right-color: #475569; }
          .tree-container ul ul::before { border-left-color: #475569; }
          .custom-scroll::-webkit-scrollbar-track { background: #1e293b; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #475569; }
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto">
        
        {/* Header & Navigasi Tab */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center justify-center gap-3 mb-6">
            <Baby size={36} className="text-blue-400"/>
            PokeMMO Breeder Pro
          </h1>
          
          <div className="flex flex-wrap justify-center bg-white dark:bg-slate-800 p-1.5 rounded-lg inline-flex shadow-lg border border-gray-200 dark:border-slate-700 gap-1">
            <button onClick={() => setActiveTab('field')} className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-bold transition-all ${activeTab === 'field' ? 'bg-amber-500 text-white shadow-md' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
              <Tent size={18} /> Lapangan
            </button>
            <button onClick={() => setActiveTab('tree')} className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-bold transition-all ${activeTab === 'tree' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
              <GitCommit size={18} /> Pohon
            </button>
            <button onClick={() => setActiveTab('calc')} className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-bold transition-all ${activeTab === 'calc' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
              <Calculator size={18} /> Kalkulator
            </button>
            <button onClick={() => setActiveTab('box')} className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-bold transition-all ${activeTab === 'box' ? 'bg-pink-500 text-white shadow-md' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>
              <Archive size={18} /> Box Utama
            </button>
          </div>
        </div>

        {/* ================= TAB 0: LAPANGAN BREEDING ================= */}
        {activeTab === 'field' && (
          <div className="grid lg:grid-cols-4 gap-6 animate-fadeIn h-[75vh]">
            {/* Sidebar Kiri: Box Inventory */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col h-full overflow-hidden shadow-xl">
              <div className="p-3 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 font-bold flex justify-between items-center text-slate-900 dark:text-slate-200">
                <span>Box Utama ({inventory.length})</span>
                <Archive size={16} className="text-blue-400"/>
              </div>
              <div className="p-3 overflow-y-auto custom-scroll flex-1">
                {inventory.length === 0 ? <div className="text-xs text-slate-500 text-center py-4">Box Utama kosong</div> : inventory.map(p => <MiniPokeCard key={p.id} poke={p} />)}
              </div>
              
              <div className="p-3 bg-indigo-100 dark:bg-indigo-950 border-y border-indigo-200 dark:border-indigo-800 font-bold flex justify-between items-center text-indigo-700 dark:text-indigo-300">
                <span>Box Temp ({tempInventory.length})</span>
                <Tent size={16} className="text-indigo-600 dark:text-indigo-400"/>
              </div>
              <div className="p-3 overflow-y-auto custom-scroll flex-1 bg-indigo-50 dark:bg-indigo-950/30">
                {tempInventory.length === 0 ? <div className="text-xs text-indigo-500/50 text-center py-4">Box Sementara kosong</div> : tempInventory.map(p => <MiniPokeCard key={p.id} poke={p} isTemp />)}
              </div>
            </div>

            {/* Area Kanan: Drag & Drop Lapangan */}
            <div className="lg:col-span-3 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-slate-600 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600"></div>
              
              <div className="p-6 text-center">
                <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2 drop-shadow-md">
                  <Tent className="text-amber-400" size={28} />
                  Tempat Penitipan (Daycare)
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Tarik & Lepas (Drag & Drop) Pokémon dari Box ke slot di bawah ini.</p>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-center items-center gap-8">
                {/* Slot Parent A & B */}
                <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl">
                  {/* Slot A */}
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, 'A')}
                    className={`flex-1 rounded-2xl border-4 border-dashed transition-all p-4 flex flex-col items-center justify-center min-h-[220px] relative ${slotA ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-500/50' : 'bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 hover:border-pink-300 dark:hover:border-pink-400/50 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                  >
                    {slotA ? (
                      <div className="w-full h-full flex flex-col items-center animate-fadeIn">
                        <button onClick={() => setSlotA(null)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400"><X size={20}/></button>
                        <div className="text-pink-400 font-bold mb-2 text-lg text-center">{slotA.pokemon.name}</div>
                        <div className="flex gap-2 flex-wrap justify-center mb-4">
                          {STATS.filter(s => slotA.pokemon.ivs[s.key] === 31).map(s => (
                            <span key={s.key} className={`text-xs px-2 py-1 rounded bg-slate-900 ${s.color} border border-slate-700 font-bold`}>{s.label} 31</span>
                          ))}
                        </div>
                        <div className="w-full mt-auto">
                          <label className="text-[10px] text-gray-700 dark:text-slate-400 uppercase tracking-wider block text-center mb-1">Berikan Item:</label>
                          <select value={slotA.item} onChange={(e) => setSlotA({...slotA, item: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-900 border border-pink-300 dark:border-pink-500/50 rounded-lg p-2 text-sm text-center outline-none focus:border-pink-400 text-slate-900 dark:text-slate-200">
                            {Object.entries(ITEMS).map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 pointer-events-none">
                        <ArrowRight size={32} className="mx-auto mb-2 opacity-50 text-pink-400 rotate-90 md:rotate-0" />
                        <span className="font-bold">SLOT INDUK A</span>
                        <div className="text-xs mt-1">Lepas Pokémon ke sini</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center text-slate-600 font-black text-2xl">+</div>

                  {/* Slot B */}
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, 'B')}
                    className={`flex-1 rounded-2xl border-4 border-dashed transition-all p-4 flex flex-col items-center justify-center min-h-[220px] relative ${slotB ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500/50' : 'bg-gray-50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-400/50 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                  >
                    {slotB ? (
                      <div className="w-full h-full flex flex-col items-center animate-fadeIn">
                        <button onClick={() => setSlotB(null)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400"><X size={20}/></button>
                        <div className="text-blue-400 font-bold mb-2 text-lg text-center">{slotB.pokemon.name}</div>
                        <div className="flex gap-2 flex-wrap justify-center mb-4">
                          {STATS.filter(s => slotB.pokemon.ivs[s.key] === 31).map(s => (
                            <span key={s.key} className={`text-xs px-2 py-1 rounded bg-slate-900 ${s.color} border border-slate-700 font-bold`}>{s.label} 31</span>
                          ))}
                        </div>
                        <div className="w-full mt-auto">
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider block text-center mb-1">Berikan Item:</label>
                          <select value={slotB.item} onChange={(e) => setSlotB({...slotB, item: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-900 border border-blue-300 dark:border-blue-500/50 rounded-lg p-2 text-sm text-center outline-none focus:border-blue-400 text-slate-900 dark:text-slate-200">
                            {Object.entries(ITEMS).map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 pointer-events-none">
                        <ArrowRight size={32} className="mx-auto mb-2 opacity-50 text-blue-400 rotate-90 md:-rotate-180" />
                        <span className="font-bold">SLOT INDUK B</span>
                        <div className="text-xs mt-1">Lepas Pokémon ke sini</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Anak Preview & Tombol Simpan */}
                {genderError ? (
                  <div className="w-full max-w-2xl bg-red-900/80 backdrop-blur-sm border-2 border-red-500 rounded-xl p-5 text-center transform animate-bounce">
                    <h3 className="text-xl font-black text-red-200 mb-2">❌ Pasangan Tidak Valid! ❌</h3>
                    <p className="text-red-300 font-medium">Pembiakan HANYA bisa dilakukan dengan kombinasi:<br/><b>Jantan × Betina</b> ATAU <b>Ditto × Jantan/Betina</b>.</p>
                  </div>
                ) : (
                  <div className={`w-full max-w-2xl bg-white dark:bg-slate-900/80 backdrop-blur-sm border-2 rounded-xl p-5 transition-all duration-500 ${slotA && slotB ? 'border-amber-500 opacity-100 translate-y-0' : 'border-gray-300 dark:border-slate-700 opacity-50 translate-y-4 pointer-events-none'}`}>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1 w-full">
                        <div className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Baby size={16}/> Pratinjau Anak Sementara
                        </div>
                        <div className="flex gap-2 mb-3">
                          <input type="text" value={fieldChild.name} onChange={(e) => setFieldChild({...fieldChild, name: e.target.value})} className="flex-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white font-bold outline-none focus:border-amber-400" placeholder="Nama Anak..."/>
                          <select value={fieldChild.gender} onChange={(e) => setFieldChild({...fieldChild, gender: e.target.value})} className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white outline-none focus:border-amber-400 w-28">
                            <option value="Betina">Betina</option>
                            <option value="Jantan">Jantan</option>
                          </select>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {STATS.map(s => {
                            const val = fieldChild.ivs[s.key] || 0;
                            if (val === 0) return null;
                            return <span key={s.key} className={`text-xs px-2 py-1 bg-slate-950 border ${s.color} border-slate-700 rounded-md font-bold`}>{s.label} {val}</span>;
                          })}
                          {Object.values(fieldChild.ivs).every(v => v === 0) && <span className="text-xs text-red-400 italic">IV Hilang (Tidak di-brace/overlap)</span>}
                        </div>
                      </div>
                      
                      <button onClick={saveChildToTemp} className="w-full md:w-auto bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transform hover:scale-105 active:scale-95 transition-all flex flex-col items-center">
                        <Tent size={24} className="mb-1"/>
                        Tetaskan ke Temp!
                      </button>
                    </div>
                  </div>
                )}

                {/* Silsilah Anak (Lineage Tree) */}
                {slotA && slotB && !genderError && (
                  <div className="w-full mt-4 pt-6 border-t border-slate-700/50 overflow-x-auto custom-scroll">
                    <h3 className="text-center font-bold text-gray-600 dark:text-slate-400 mb-6 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                      <GitCommit size={18} /> Pohon Silsilah (Real-Time)
                    </h3>
                    <div className="tree-container flex justify-center pb-6">
                      <ul><LineageTree poke={fieldChild} /></ul>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 1: PEMBUAT POHON (TREE) ================= */}
        {activeTab === 'tree' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <CheckCircle2 size={24} className="text-blue-400" /> Tentukan Target IV
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">Pilih status mana yang ingin kamu jadikan nilai 31 di hasil akhir.</p>
                    <div className="grid grid-cols-3 gap-3">
                      {STATS.map(stat => (
                        <button key={stat.key} onClick={() => toggleTreeIv(stat.key)} className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${treeIvs.includes(stat.key) ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-gray-400 dark:hover:border-slate-500'}`}>
                          <stat.icon size={20} className={stat.color} />
                          <span className={`text-xs mt-1 font-bold ${treeIvs.includes(stat.key) ? 'text-emerald-400' : 'text-gray-500 dark:text-slate-500'}`}>{stat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Target Nature</h2>
                    <select value={treeNature} onChange={(e) => setTreeNature(e.target.value)} className="w-full bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-700 focus:border-blue-400 rounded-lg p-3 outline-none text-slate-900 dark:text-slate-200 font-semibold">
                      <option value="">-- Tanpa Nature (Polos) --</option>
                      {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <button onClick={handleGenerateTree} disabled={treeIvs.length === 0} className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-400 hover:to-emerald-400 text-white font-black py-4 rounded-lg shadow-lg transform active:scale-95 transition-all disabled:opacity-50">
                    JANA POHON BREEDING!
                  </button>
                </div>
                <div className="flex-1 bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Info size={20} className="text-blue-400"/> Cara Membaca Pohon:</h3>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
                    <li>Pohon dibaca dari <strong>bawah ke atas</strong>. Pokemon target kamu berada di paling atas.</li>
                    <li>Kotak terbawah adalah bahan dasar (1x31 atau pembawa Nature) yang bisa kamu tangkap atau beli di GTL.</li>
                    <li>Tulisan <strong className="text-blue-400">Beri: [Item]</strong> artinya item tersebut wajib dipakaikan.</li>
                    <li>Perhatikan urutan kotak yang dipasangkan (kiri dan kanan). Mereka harus kawin dan memiliki status kelamin silang (Satu Jantan, Satu Betina).</li>
                  </ul>
                </div>
              </div>
            </div>
            {treeData && (
              <div className={isTreeFullscreen ? "fixed inset-0 z-[100] bg-gray-200 dark:bg-slate-950 p-6 md:p-10 overflow-auto custom-scroll w-screen h-screen" : "bg-gray-100 dark:bg-slate-950 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-300 dark:border-slate-800 overflow-x-auto custom-scroll"}>
                
                {treeStats && (
                  <div className={`mb-8 ${isTreeFullscreen ? 'max-w-6xl mx-auto' : 'w-full min-w-fit'} bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 flex flex-col xl:flex-row gap-6 items-center transition-all`}>
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                          <Calculator size={24} className="text-blue-500" />Estimasi Kebutuhan
                        </h3>
                        <button 
                          onClick={() => setIsTreeFullscreen(!isTreeFullscreen)}
                          className={`p-1.5 rounded-lg border transition-colors shadow-sm flex items-center gap-2 text-xs font-bold ${isTreeFullscreen ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:border-red-800 dark:hover:bg-red-900/50 dark:text-red-400' : 'bg-gray-100 text-slate-600 border-gray-200 hover:border-blue-400 hover:text-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:text-blue-400'}`}
                        >
                          {isTreeFullscreen ? <><Minimize size={16} /> Tutup Fullscreen</> : <><Maximize size={16} /> Fullscreen Pohon</>}
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Biaya item dihitung persis dari pohon breeding di bawah (<span className="text-red-400 text-xs">*tanpa biaya kel. ganda</span>).</p>
                    </div>
                    
                    <div className="flex gap-4 items-center justify-center">
                      <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700/50 px-6 py-4 rounded-xl text-center min-w-[160px] shadow-sm transform hover:scale-105 transition-transform">
                        <div className="text-amber-600 dark:text-amber-400 text-xs font-bold uppercase mb-1">Total Biaya Item</div>
                        <div className="text-3xl font-black text-amber-700 dark:text-amber-400">${treeStats.cost.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full flex flex-wrap gap-2 justify-center xl:justify-end">
                      {Object.entries(treeStats.items).map(([itemName, count]) => (
                        <div key={itemName} className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-lg flex items-center gap-3 shadow-sm hover:border-blue-400 transition-colors">
                          <span className={`text-sm font-bold ${itemName === 'Everstone' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'}`}>{itemName}</span>
                          <span className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-black px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-inner">x{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`min-w-max flex flex-col items-center pb-10 transition-all ${isTreeFullscreen ? 'max-w-fit mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800' : ''}`}>
                  <div className="text-center mb-10 border-b border-gray-300 dark:border-slate-800 pb-4 w-full">
                    <h2 className={`font-black text-slate-800 dark:text-white ${isTreeFullscreen ? 'text-3xl' : 'text-2xl'}`}>Cetak Biru Pembiakan</h2>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg mt-1 tracking-wide">Target: {treeIvs.length}x31 {treeNature ? treeNature : 'Polos'}</p>
                  </div>
                  <div className="tree-container flex justify-center w-full"><ul><TreeRender node={treeData} /></ul></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: KALKULATOR TUNGGAL ================= */}
        {activeTab === 'calc' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Parent A Card */}
              <div className="p-5 rounded-xl shadow-lg border-t-4 border-pink-500 bg-white dark:bg-slate-800">
                <div className="flex justify-between items-center mb-4 gap-2">
                  <input type="text" value={parentA.name} onChange={(e) => setParentA({...parentA, name: e.target.value})} className="w-full bg-transparent text-xl font-bold border-b border-gray-300 dark:border-slate-600 focus:border-pink-400 outline-none pb-1 text-slate-900 dark:text-white"/>
                  <select onChange={(e) => {
                      const selected = [...inventory, ...tempInventory].find(p => p.id === e.target.value);
                      if (selected) setParentA(prev => ({...prev, name: selected.name, nature: selected.nature, ivs: {...selected.ivs}}));
                      e.target.value = "";
                    }} className="bg-gray-100 dark:bg-slate-700 text-xs text-slate-900 dark:text-slate-300 p-1.5 rounded outline-none border border-gray-300 dark:border-slate-600 focus:border-pink-400 max-w-[120px]">
                    <option value="">+ Dari Box...</option>
                    {[...inventory, ...tempInventory].filter(p => p.gender === 'Betina' || p.gender === 'Bebas').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider">Nature</label>
                    <select value={parentA.nature} onChange={(e) => setParentA({...parentA, nature: e.target.value})} className="w-full mt-1 bg-gray-100 dark:bg-slate-700 rounded p-2 text-sm outline-none text-slate-900 dark:text-white border border-gray-300 dark:border-slate-600">
                      {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wider">Held Item</label>
                    <select value={parentA.item} onChange={(e) => setParentA({...parentA, item: e.target.value})} className="w-full mt-1 bg-gray-100 dark:bg-slate-700 rounded p-2 text-sm outline-none text-slate-900 dark:text-white border border-gray-300 dark:border-slate-600">
                      {Object.entries(ITEMS).map(([key, item]) => (<option key={key} value={key}>{item.name}</option>))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 uppercase tracking-wider">Individal Values (IVs)</label>
                  {STATS.map(stat => (
                    <div key={stat.key} className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                      <div className="flex items-center space-x-2 w-24"><stat.icon size={16} className={stat.color} /><span className="text-sm font-medium">{stat.label}</span></div>
                      <input type="number" min="0" max="31" value={parentA.ivs[stat.key]} onChange={(e) => {
                        let val=parseInt(e.target.value)||0; if(val>31)val=31; if(val<0)val=0;
                        setParentA({...parentA, ivs:{...parentA.ivs, [stat.key]:val}});
                      }} className={`w-16 bg-gray-50 dark:bg-slate-900 border ${parentA.ivs[stat.key] === 31 ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-gray-300 dark:border-slate-600'} rounded p-1 text-center outline-none text-slate-900 dark:text-white`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Parent B Card */}
              <div className="p-5 rounded-xl shadow-lg border-t-4 border-blue-500 bg-white dark:bg-slate-800">
                <div className="flex justify-between items-center mb-4 gap-2">
                  <input type="text" value={parentB.name} onChange={(e) => setParentB({...parentB, name: e.target.value})} className="w-full bg-transparent text-xl font-bold border-b border-gray-300 dark:border-slate-600 focus:border-blue-400 outline-none pb-1 text-slate-900 dark:text-white"/>
                  <select onChange={(e) => {
                      const selected = [...inventory, ...tempInventory].find(p => p.id === e.target.value);
                      if (selected) setParentB(prev => ({...prev, name: selected.name, nature: selected.nature, ivs: {...selected.ivs}}));
                      e.target.value = "";
                    }} className="bg-gray-100 dark:bg-slate-700 text-xs text-slate-900 dark:text-slate-300 p-1.5 rounded outline-none border border-gray-300 dark:border-slate-600 focus:border-blue-400 max-w-[120px]">
                    <option value="">+ Dari Box...</option>
                    {[...inventory, ...tempInventory].filter(p => p.gender === 'Jantan' || p.gender === 'Bebas').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-gray-700 dark:text-slate-400 uppercase tracking-wider">Nature</label>
                    <select value={parentB.nature} onChange={(e) => setParentB({...parentB, nature: e.target.value})} className="w-full mt-1 bg-white dark:bg-slate-700 rounded p-2 text-sm outline-none text-slate-900 dark:text-white border border-gray-300 dark:border-slate-600">
                      {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 dark:text-slate-400 uppercase tracking-wider">Held Item</label>
                    <select value={parentB.item} onChange={(e) => setParentB({...parentB, item: e.target.value})} className="w-full mt-1 bg-white dark:bg-slate-700 rounded p-2 text-sm outline-none text-slate-900 dark:text-white border border-gray-300 dark:border-slate-600">
                      {Object.entries(ITEMS).map(([key, item]) => (<option key={key} value={key}>{item.name}</option>))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-700 dark:text-slate-400 uppercase tracking-wider">Individal Values (IVs)</label>
                  {STATS.map(stat => (
                    <div key={stat.key} className="flex items-center justify-between bg-gray-100 dark:bg-slate-700/50 p-2 rounded">
                      <div className="flex items-center space-x-2 w-24"><stat.icon size={16} className={stat.color} /><span className="text-sm font-medium text-slate-900 dark:text-white">{stat.label}</span></div>
                      <input type="number" min="0" max="31" value={parentB.ivs[stat.key]} onChange={(e) => {
                        let val=parseInt(e.target.value)||0; if(val>31)val=31; if(val<0)val=0;
                        setParentB({...parentB, ivs:{...parentB.ivs, [stat.key]:val}});
                      }} className={`w-16 bg-white dark:bg-slate-900 border ${parentB.ivs[stat.key] === 31 ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-gray-300 dark:border-slate-600'} rounded p-1 text-center outline-none text-slate-900 dark:text-white`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden relative;">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Baby size={28} className="text-emerald-400" /> Pratinjau Keturunan</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-700 dark:text-slate-400">Nature:</span>
                      <span className={`font-semibold px-2 py-1 rounded text-sm ${childNature !== 'Acak' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300'}`}>{childNature}</span>
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-slate-900 p-4 rounded-lg border border-gray-300 dark:border-slate-700 w-full md:w-auto">
                    <label className="block text-xs text-gray-700 dark:text-slate-400 uppercase tracking-wider mb-2">Pilih Jenis Kelamin</label>
                    <select value={childGender} onChange={(e) => setChildGender(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm outline-none mb-3 focus:border-blue-400 text-slate-900 dark:text-white">
                      {Object.entries(GENDER_COSTS).map(([key, data]) => (<option key={key} value={key}>{data.label} (${data.cost.toLocaleString()})</option>))}
                    </select>
                    <div className="flex justify-between items-center text-sm"><span className="text-gray-700 dark:text-slate-400">Estimasi Biaya:</span><span className="font-bold text-yellow-600 dark:text-yellow-400">${totalCost.toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {STATS.map(stat => (
                    <div key={stat.key} className="bg-gray-100 dark:bg-slate-900 p-4 rounded-lg border border-gray-300 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group">
                      {childStats[stat.key]?.value === 31 && <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>}
                      <div className="flex items-center gap-2 mb-2 z-10"><stat.icon size={18} className={stat.color} /><span className="text-sm text-gray-700 dark:text-slate-400 font-medium uppercase">{stat.label}</span></div>
                      <div className={`text-2xl font-black z-10 ${childStats[stat.key]?.value === 31 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-gray-800 dark:text-slate-200'}`}>{childStats[stat.key]?.value}</div>
                      <div className="h-4 mt-1 z-10">
                        {childStats[stat.key]?.isGuaranteed ? <span className="text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Pasti (Diwarisi)</span> : <span className="text-[10px] text-gray-500 dark:text-slate-500 uppercase tracking-wider">Rentang RNG</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: BOX POKEMON (INVENTORY) ================= */}
        {activeTab === 'box' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Download size={24} className="text-pink-400" /> Masukkan Pokemon ke Box Utama</h2>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-700 dark:text-slate-400 uppercase tracking-wider">Nama Pokemon</label>
                  <input type="text" placeholder="Misal: Excadrill Cewek" value={newBoxPoke.name} onChange={(e) => setNewBoxPoke({...newBoxPoke, name: e.target.value})} className="w-full mt-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm outline-none focus:border-pink-400 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-700 dark:text-slate-400 uppercase tracking-wider">Kelamin</label>
                  <select value={newBoxPoke.gender} onChange={(e) => setNewBoxPoke({...newBoxPoke, gender: e.target.value})} className="w-full mt-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm outline-none text-slate-900 dark:text-white">
                    <option value="Jantan">Jantan (Cowok)</option><option value="Betina">Betina (Cewek)</option><option value="Bebas">Bebas / Ditto</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-700 dark:text-slate-400 uppercase tracking-wider">Nature</label>
                  <select value={newBoxPoke.nature} onChange={(e) => setNewBoxPoke({...newBoxPoke, nature: e.target.value})} className="w-full mt-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded p-2 text-sm outline-none text-slate-900 dark:text-white">
                    {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <label className="text-xs text-gray-700 dark:text-slate-400 uppercase tracking-wider block mb-2">Individual Values (IVs)</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {STATS.map(stat => (
                  <div key={stat.key} className="bg-white dark:bg-slate-900 p-2 rounded border border-gray-300 dark:border-slate-700 text-center">
                    <div className="flex justify-center mb-1"><stat.icon size={16} className={stat.color} /></div>
                    <div className="text-[10px] text-gray-700 dark:text-slate-400 uppercase mb-1">{stat.label}</div>
                    <input type="number" min="0" max="31" value={newBoxPoke.ivs[stat.key]} onChange={(e) => {
                      let val=parseInt(e.target.value)||0; if(val>31)val=31; if(val<0)val=0;
                      setNewBoxPoke({...newBoxPoke, ivs:{...newBoxPoke.ivs, [stat.key]:val}});
                    }} className={`w-full bg-white dark:bg-slate-800 text-center text-sm p-1 rounded outline-none border ${newBoxPoke.ivs[stat.key] === 31 ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-gray-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-pink-400'}`} />
                  </div>
                ))}
              </div>
              <button onClick={() => {
                if(!newBoxPoke.name.trim()) return;
                setInventory([...inventory, {...newBoxPoke, id: "box_"+Date.now().toString()}]);
                setNewBoxPoke({name:'', gender:'Betina', nature:'Adamant', ivs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}});
              }} disabled={!newBoxPoke.name.trim()} className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 transform active:scale-95 transition-all">
                <Save size={20} /> Simpan ke Box
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Archive size={24} className="text-blue-400" /> Isi Box Kamu ({inventory.length})</h2>
              {inventory.length === 0 ? <div className="text-center bg-gray-100 dark:bg-slate-800 p-10 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-400 border-dashed">Box kamu masih kosong. Tambahkan Pokémon di atas!</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventory.map(poke => (
                    <div key={poke.id} className="bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-700 rounded-xl p-4 relative hover:border-blue-400 transition-colors group">
                      <button onClick={() => setInventory(inventory.filter(p=>p.id!==poke.id))} className="absolute top-3 right-3 text-gray-400 dark:text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                      <div className="font-bold text-lg text-slate-900 dark:text-white pr-6 truncate">{poke.name}</div>
                      <div className="text-xs text-gray-700 dark:text-slate-400 mb-3 flex items-center gap-2"><span className={poke.gender === 'Betina' ? 'text-pink-400' : poke.gender === 'Jantan' ? 'text-blue-400' : 'text-purple-400'}>{poke.gender}</span><span>•</span><span className="text-emerald-400">{poke.nature}</span></div>
                      <div className="grid grid-cols-6 gap-1 text-center">
                        {STATS.map(stat => (
                          <div key={stat.key} className="flex flex-col items-center"><span className="text-[9px] text-gray-500 dark:text-slate-500 uppercase">{stat.label}</span><span className={`text-sm font-bold ${poke.ivs[stat.key] === 31 ? 'text-emerald-400' : 'text-gray-700 dark:text-slate-300'}`}>{poke.ivs[stat.key]}</span></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
