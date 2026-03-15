import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Map as MapIcon, BookOpen, Backpack, Calculator, Menu, X, ChevronRight, Star, ArrowRight, TrendingUp, Globe, ArrowLeft, Zap, Plus, Save, Trash2, MapPin, ListFilter, CornerDownRight, Sword, Upload, FileJson, AlertCircle, CheckCircle, Bell, Calendar, Users, Activity, Trophy, Info, Target, MousePointer2, Moon, Sun, Download, ChevronDown, ChevronUp, GitBranch, Egg, Sparkles } from 'lucide-react';
import BreedingCalculator from './breeding';

// --- BAGIAN PENTING: IMPORT DATA JSON LOKAL ---
// INSTRUKSI KHUSUS UNTUK LOCAL (VS CODE):
// Agar data dari folder 'src/data/' terbaca, HAPUS tanda komentar (//) pada 3 baris import di bawah ini:

import localPokedex from './data/pokedex.json';
import localMoves from './data/pokemon_moves.json';
import localDetailedMoves from './data/moves.json';
import localItems from './data/items.json';

// Variabel Fallback (JANGAN DIHAPUS, biarkan null jika import di atas aktif)
const localPokedexRaw = (typeof localPokedex !== 'undefined') ? localPokedex : null;
const localMovesRaw = (typeof localMoves !== 'undefined') ? localMoves : null;
const localDetailedMovesRaw = (typeof localDetailedMoves !== 'undefined') ? localDetailedMoves : null;

// --- DATA IMPORT (SAMPEL DIKOSONGKAN AGAR MENGGUNAKAN FILE LOKAL) ---
const samplePokedex = [];
const sampleMoves = {};
const sampleDetailedMoves = [];

// --- DATA STATIS (GLOBAL SCOPE) ---

const regionsData = [
  { name: "Kanto", levels: "1-62", badges: 8, difficulty: "Medium", img: "from-red-600 to-orange-600" },
  { name: "Hoenn", levels: "1-58", badges: 8, difficulty: "Easy", img: "from-green-600 to-teal-600" },
  { name: "Sinnoh", levels: "1-60", badges: 8, difficulty: "Hard", img: "from-blue-600 to-indigo-600" },
  { name: "Unova", levels: "1-56", badges: 8, difficulty: "Medium", img: "from-gray-700 to-black" },
];

const typeTranslations = {
  Grass: { id: "Rumput", en: "Grass", color: "bg-green-500" },
  Poison: { id: "Racun", en: "Poison", color: "bg-purple-500" },
  Fire: { id: "Api", en: "Fire", color: "bg-red-500" },
  Water: { id: "Air", en: "Water", color: "bg-blue-500" },
  Electric: { id: "Listrik", en: "Electric", color: "bg-yellow-400 text-black" },
  Normal: { id: "Normal", en: "Normal", color: "bg-gray-400" },
  Dragon: { id: "Naga", en: "Dragon", color: "bg-indigo-600" },
  Flying: { id: "Terbang", en: "Flying", color: "bg-sky-400" },
  Ghost: { id: "Hantu", en: "Ghost", color: "bg-indigo-900" },
  Fighting: { id: "Petarung", en: "Fighting", color: "bg-orange-700" },
  Steel: { id: "Baja", en: "Steel", color: "bg-gray-500" },
  Psychic: { id: "Psikis", en: "Psychic", color: "bg-pink-500" },
  Ice: { id: "Es", en: "Ice", color: "bg-cyan-400" },
  Ground: { id: "Tanah", en: "Ground", color: "bg-yellow-600" },
  Rock: { id: "Batu", en: "Rock", color: "bg-yellow-800" },
  Bug: { id: "Serangga", en: "Bug", color: "bg-lime-500" },
  Dark: { id: "Gelap", en: "Dark", color: "bg-slate-800" },
  Fairy: { id: "Peri", en: "Fairy", color: "bg-pink-300" }
};

const guidesData = [
  { id: 1, title: { id: "Panduan Breeding 3x31", en: "3x31 Breeding Guide" }, category: "Breeding", desc: { id: "Cara hemat membuat Pokemon kompetitif dengan 3 stat sempurna.", en: "Cost-effective way to make competitive Pokemon with 3 perfect stats." } },
  { id: 2, title: { id: "Lokasi EV Training Terbaik", en: "Best EV Training Spots" }, category: "Training", desc: { id: "Daftar lokasi horde untuk melatih EV Attack, Speed, dan HP dengan cepat.", en: "List of horde locations to train EV Attack, Speed, and HP quickly." } },
  { id: 3, title: { id: "Panduan Gym Run Kanto", en: "Kanto Gym Re-run Guide" }, category: "Money", desc: { id: "Rute tercepat farming uang dengan mengalahkan ulang Gym Leader di Kanto.", en: "Fastest money farming route by remixing Gym Leaders in Kanto." } },
  { id: 4, title: { id: "Penjelasan Alpha Pokemon", en: "Alpha Pokemon Explained" }, category: "Event", desc: { id: "Apa itu Alpha Pokemon, cara menangkapnya, dan hidden ability.", en: "What are Alpha Pokemon, how to catch them, and hidden abilities." } },
];

const newsData = [
    { id: 1, title: "Lunar New Year Event Live!", date: "10 Feb 2024", type: "Event" },
    { id: 2, title: "PvP Season 9 Rewards Announced", date: "08 Feb 2024", type: "PvP" },
    { id: 3, title: "Scheduled Maintenance", date: "05 Feb 2024", type: "System" }
];

const translations = {
  id: {
    nav: { home: 'Beranda', pokedex: 'Pokedex', movedex: 'Movedex', region: 'Region', guides: 'Panduan' },
    hero: {
      titlePrefix: 'Kuasai Dunia',
      subtitle: 'Wiki Terlengkap untuk PokeMMO Indonesia. Data Moves, Lokasi, dan Statistik dalam satu tempat.',
      btnPokedex: 'Buka Pokedex',
    },
    movedex: {
      title: 'Movedex',
      subtitle: 'Daftar move yang tersedia (Klik untuk melihat siapa yang mempelajarinya).',
      searchPlaceholder: 'Cari Move...',
      id: 'ID',
      name: 'Nama Move',
      type: 'Tipe',
      cat: 'Kat',
      pwr: 'Pwr',
      acc: 'Acc',
      pp: 'PP',
      learnCount: 'Dipelajari Oleh'
    },
    pokedex: {
      title: 'Pokedex', subtitle: 'Database spesifik PokeMMO', searchPlaceholder: 'Cari Pokemon, Tipe, atau Move...',
      location: 'Lokasi Utama', baseStats: 'Statistik Dasar', moves: 'Daftar Move',
      abilities: 'Ability', eggGroup: 'Egg Group', back: 'Kembali',
      level: 'Lvl', power: 'Pow', acc: 'Acc', type: 'Tipe', category: 'Kategori', tier: 'Tier', desc: 'Deskripsi',
      evolution: 'Rantai Evolusi',
      locationTable: { title: 'Daftar Lokasi Spawn', region: 'Region', place: 'Tempat', method: 'Metode', levels: 'Level', rate: 'Rate' },
      filters: { national: 'National', kanto: 'Kanto', johto: 'Johto', hoenn: 'Hoenn', sinnoh: 'Sinnoh', unova: 'Unova' }
    },
    home: {
        newsTitle: "Berita & Event Terkini",
        spotlight: "Pokemon Sorotan",
        stats: {
            database: "Database Pokemon",
            moves: "Total Jurus",
            users: "Pengguna Aktif",
            status: "Status Server"
        }
    },
    quickLinks: {
      pokedex: { title: 'Pokedex Lengkap', desc: 'Statistik, Move, dan Lokasi.' },
      calculator: { title: 'Kalkulator IV', desc: 'Hitung potensi Pokemonmu.' },
      region: { title: 'Region & Peta', desc: 'Panduan navigasi 4 region.' },
      movedex: { title: 'Movedex', desc: 'Daftar semua move dalam game.' }
    },
    featured: {
      title: 'Panduan Populer',
      viewAll: 'Lihat Semua',
      readMore: 'Baca Selengkapnya'
    },
    regions: {
      title: 'Panduan Region',
      subtitle: 'Pilih region untuk memulai petualanganmu di PokeMMO.',
      badge: 'Lencana',
      difficulty: { Easy: 'Mudah', Medium: 'Sedang', Hard: 'Sulit' }
    },
    guides: {
      title: 'Pusat Pengetahuan',
      categories: { Breeding: 'Breeding', Training: 'Training', Money: 'Uang', Event: 'Event' }
    }
  },
  en: {
    nav: { home: 'Home', pokedex: 'Pokedex', movedex: 'Movedex', region: 'Region', guides: 'Guides' },
    hero: {
      titlePrefix: 'Pokedex',
      subtitle: 'Gabut',
      btnPokedex: 'Open Pokedex',
    },
    movedex: {
      title: 'Movedex',
      subtitle: 'List of available moves (Click row to see details).',
      searchPlaceholder: 'Search Move...',
      id: 'ID',
      name: 'Move Name',
      type: 'Type',
      cat: 'Cat',
      pwr: 'Pwr',
      acc: 'Acc',
      pp: 'PP',
      learnCount: 'Learned By'
    },
    pokedex: {
      title: 'Pokedex', subtitle: 'PokeMMO specific database', searchPlaceholder: 'Search Pokemon, Type, or Move...',
      location: 'Main Location', baseStats: 'Base Stats', moves: 'Move List',
      abilities: 'Abilities', eggGroup: 'Egg Group', back: 'Back',
      level: 'Lvl', power: 'Pow', acc: 'Acc', type: 'Type', category: 'Category', tier: 'Tier', desc: 'Description',
      evolution: 'Evolution Chain',
      locationTable: { title: 'Spawn Locations List', region: 'Region', place: 'Place', method: 'Method', levels: 'Levels', rate: 'Rate' },
      filters: { national: 'National', kanto: 'Kanto', johto: 'Johto', hoenn: 'Hoenn', sinnoh: 'Sinnoh', unova: 'Unova' }
    },
    home: {
        newsTitle: "Latest News & Events",
        spotlight: "Pokemon Spotlight",
        stats: {
            database: "Pokemon Database",
            moves: "Total Moves",
            users: "Active Users",
            status: "Server Status"
        }
    },
    quickLinks: {
      pokedex: { title: 'Full Pokedex', desc: 'Stats, Moves, and Locations.' },
      calculator: { title: 'IV Calculator', desc: 'Calculate your Pokemon potential.' },
      region: { title: 'Regions & Maps', desc: 'Navigation guide for 4 regions.' },
      movedex: { title: 'Movedex', desc: 'List of all moves in game.' }
    },
    featured: {
      title: 'Popular Guides',
      viewAll: 'View All',
      readMore: 'Read More'
    },
    regions: {
      title: 'Region Guides',
      subtitle: 'Choose a region to start your PokeMMO adventure.',
      badge: 'Badges',
      difficulty: { Easy: 'Easy', Medium: 'Medium', Hard: 'Hard' }
    },
    guides: {
      title: 'Knowledge Center',
      categories: { Breeding: 'Breeding', Training: 'Training', Money: 'Money', Event: 'Event' }
    }
  }
};

// Item
const localItemsRaw = (typeof localItems !== 'undefined') ? localItems : null;

const ItemsPage = ({ t, items }) => {
  const [search, setSearch] = useState("");
  
  // Filter Item berdasarkan Nama atau Deskripsi
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) || 
      (item.desc && item.desc.toLowerCase().includes(search.toLowerCase()))
    );
  }, [items, search]);

  // Sorting Logic (ID, Name)
  const { items: sortedItems, requestSort, sortConfig } = useSortableData(filteredItems, { key: 'id', direction: 'ascending' });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Backpack className="text-orange-500 fill-orange-500" /> Item Database
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Daftar item dan fungsinya.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari Item..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-gray-50 dark:bg-slate-700 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-semibold uppercase text-xs">
              <tr>
                <SortableHeader label="ID" sortKey="id" currentSort={sortConfig} onSort={requestSort} className="w-24 text-center" />
                <SortableHeader label="Name" sortKey="name" currentSort={sortConfig} onSort={requestSort} />
                <th className="px-6 py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-gray-700 dark:text-gray-300">
              {sortedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4 text-center font-mono font-bold text-gray-400">#{item.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-white text-base">
                      {/* Jika ada icon, bisa ditampilkan disini */}
                      {item.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                      {/* whitespace-pre-line agar enter (\n) di JSON terbaca */}
                      {item.desc}
                  </td>
                </tr>
              ))}
              {sortedItems.length === 0 && (
                  <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-400">Item tidak ditemukan.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- SORTING HELPERS ---
const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...(items || [])];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Deteksi angka (baik tipe number maupun string angka seperti "12")
        // Kita gunakan regex sederhana atau parseFloat untuk memastikan
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        // Cek apakah KEDUANYA adalah angka yang valid
        const isANumber = !isNaN(aNum) && isFinite(aValue);
        const isBNumber = !isNaN(bNum) && isFinite(bValue);

        if (isANumber && isBNumber) {
             if (aNum < bNum) return sortConfig.direction === 'ascending' ? -1 : 1;
             if (aNum > bNum) return sortConfig.direction === 'ascending' ? 1 : -1;
             return 0;
        }

        // Fallback ke string comparison jika salah satu bukan angka
        const aStr = String(aValue || "").toLowerCase();
        const bStr = String(bValue || "").toLowerCase();

        if (aStr < bStr) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

const SortableHeader = ({ label, sortKey, currentSort, onSort, className = "" }) => {
    const isActive = currentSort?.key === sortKey;
    return (
        <th 
            className={`px-4 py-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition select-none group whitespace-nowrap ${className}`}
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center gap-1 justify-between">
                <span>{label}</span>
                <div className="flex flex-col text-gray-400">
                    <ChevronUp size={10} className={`${isActive && currentSort.direction === 'ascending' ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-30 group-hover:opacity-100'}`} />
                    <ChevronDown size={10} className={`${isActive && currentSort.direction === 'descending' ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-30 group-hover:opacity-100'}`} />
                </div>
            </div>
        </th>
    );
};
// --- HELPER FUNCTIONS ---

const getEvolutionChain = (currentPokemon, allPokemon) => {
    let root = currentPokemon;
    const visited = new Set([root.id]);
    
    while (root.evolution?.prev) {
        let prevId = null;
        if (Array.isArray(root.evolution.prev)) {
             if (Array.isArray(root.evolution.prev[0])) {
                 prevId = root.evolution.prev[0][0]; 
             } else {
                 prevId = root.evolution.prev[0];
             }
        }
        
        if (!prevId) break;
        
        const prevPoke = allPokemon.find(p => p.id === parseInt(prevId));
        if (!prevPoke || visited.has(prevPoke.id)) break;
        
        root = prevPoke;
        visited.add(root.id);
    }
    
    const stages = [];
    let currentStage = [root];
    
    let loopLimit = 0;
    while (currentStage.length > 0 && loopLimit < 5) {
        stages.push(currentStage);
        const nextStage = [];
        
        currentStage.forEach(p => {
            if (p.evolution?.next) {
                p.evolution.next.forEach(n => {
                    const nextId = Array.isArray(n) ? n[0] : n;
                    const nextCondition = Array.isArray(n) ? n[1] : "";
                    const nextPoke = allPokemon.find(pk => pk.id === parseInt(nextId));
                    if (nextPoke) {
                        nextStage.push({ ...nextPoke, evoCondition: nextCondition });
                    }
                });
            }
        });
        currentStage = nextStage;
        loopLimit++;
    }
    
    return stages;
}

const transformData = (rawPokedex, rawMoves, rawDetailedMoves) => {
  let pokedexList = [];
  let isNewFormat = false;

  const detailedMovesMap = new Map();
  if (Array.isArray(rawDetailedMoves)) {
      rawDetailedMoves.forEach(m => detailedMovesMap.set(String(m.id), m));
  }

  if (!rawPokedex) return [];

  if (Array.isArray(rawPokedex)) {
      if (rawPokedex[0]?.name?.english) {
          isNewFormat = true; 
          pokedexList = rawPokedex;
      } else if (rawPokedex[0]?.pokemon) {
          pokedexList = rawPokedex;
      } else {
          pokedexList = rawPokedex;
      }
  } else if (rawPokedex.Pokedex) {
      pokedexList = rawPokedex.Pokedex;
  }

  return pokedexList.map(entry => {
    let id, name, types, abilities, tier, stats, image, description, eggGroup, locations, evolution;

    const mapLocations = (locList) => {
        if (!locList || !Array.isArray(locList)) return [];
        return locList.map(loc => {
            let levelDisplay = "?";
            // Logic Level Display
            if (loc.levels) {
                levelDisplay = loc.levels;
            } else if (loc.level) {
                levelDisplay = loc.level;
            } else if (loc.min_level !== undefined) {
                levelDisplay = (loc.min_level === loc.max_level) 
                    ? `${loc.min_level}` 
                    : `${loc.min_level}-${loc.max_level}`;
            }

            const placeName = loc.place || loc.map || loc.location || "Unknown Area";
            
            // FIX SORTING LOKASI: Gunakan min_level sebagai patokan sort angka
            const sortVal = loc.min_level || 0; 

            return {
                region: loc.region || "Unknown",
                place: placeName,
                method: loc.type || loc.method || "Walk", 
                levels: levelDisplay,
                levelSort: sortVal, // <--- Key khusus untuk sorting level lokasi
                rate: loc.rarity || loc.rate || "-"
            };
        });
    };

    if (isNewFormat) {
        id = parseInt(entry.id); 
        name = entry.name.english;
        types = entry.type;
        abilities = entry.profile?.ability?.map(a => a[0]) || [];
        eggGroup = entry.profile?.egg || ["Unknown"];
        tier = entry.tier || (entry.tiers && entry.tiers[0]) || "Untiered";
        stats = {
            hp: entry.base.HP,
            atk: entry.base.Attack,
            def: entry.base.Defense,
            spa: entry.base["Sp. Attack"],
            spd: entry.base["Sp. Defense"],
            spe: entry.base.Speed
        };
        image = entry.image?.hires || entry.image?.sprite;
        description = entry.description;
        locations = mapLocations(entry.location || entry.locations);
        evolution = entry.evolution || {}; 
    } else {
        const p = entry.pokemon || entry;
        id = parseInt(p.number || p.id);
        name = p.name;
        types = p.types || [];
        abilities = p.abilities || [];
        tier = p.tier || "Unknown"; 
        stats = { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 }; 
        image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        description = "No description available.";
        eggGroup = ["Unknown"];
        locations = mapLocations(p.location || p.locations);
        evolution = {};
    }
    
    const moveKey = name.toLowerCase().replace(/ /g, '').replace(/[().]/g, '').replace(/-/g, '').replace('♀', 'f').replace('♂', 'm');
    const rawMovesList = rawMoves?.[moveKey]?.moves || rawMoves?.[name.toLowerCase()]?.moves || [];

    const formattedMoves = rawMovesList.map(m => {
        const details = detailedMovesMap.get(String(m.id));
        let methodDisplay = m.level; 
        
        // Logic grouping sort: 1=Level, 2=Egg, 3=TM/HM, 4=Tutor
        let sortPrefix = "9";
        const lvlVal = parseInt(m.level) || 0;

        if (m.type === 'level') {
            methodDisplay = `Lvl ${m.level}`;
            sortPrefix = "1";
        }
        else if (m.type === 'egg_move' || m.type === 'egg_moves') {
            methodDisplay = 'Egg Moves';
            sortPrefix = "2";
        }
        else if (m.type === 'move_learner_tools' || m.type === 'machine') {
            methodDisplay = 'TM/HM';
            sortPrefix = "3";
        }
        else if (m.type === 'move_tutor') {
            methodDisplay = 'Tutor';
            sortPrefix = "4";
        }

        // Generate Sort Key: "1-005", "1-012", "3-000"
        const methodSort = `${sortPrefix}-${String(lvlVal).padStart(3, '0')}`;

        return {
            lvl: lvlVal,
            method: methodDisplay,
            methodSort: methodSort, // <--- Key khusus untuk sorting method
            rawType: m.type,
            name: m.name,
            id: m.id,
            type: details?.type || "Normal",
            cat: details?.category || "Physical",
            pwr: details?.power || "-",
            acc: details?.accuracy || "-",
            pp: details?.pp || "-"
        };
    }).sort((a, b) => {
        // Default sort saat pertama load
        if (a.methodSort < b.methodSort) return -1;
        if (a.methodSort > b.methodSort) return 1;
        return 0;
    });

    return {
      id, name, type: types || [], abilities: abilities || [], tier, stats, image, description, eggGroup, 
      locations, 
      evolution, 
      moves: formattedMoves
    };
  }).sort((a, b) => a.id - b.id);
};

const generateMovedex = (rawDetailedMoves, rawMoves, pokemonList) => {
    if (!rawDetailedMoves) return [];
    
    const pokemonLookup = new Map();
    pokemonList.forEach(p => {
        const key1 = p.name.toLowerCase(); 
        const key2 = p.name.toLowerCase().replace(/ /g, '').replace(/[().]/g, '').replace(/-/g, '').replace('♀', 'f').replace('♂', 'm');
        const key3 = p.name.toLowerCase().split('-')[0];
        
        pokemonLookup.set(key1, p);
        pokemonLookup.set(key2, p);
        pokemonLookup.set(key3, p);
    });

    const movesMap = new Map();
    rawDetailedMoves.forEach(m => {
        movesMap.set(String(m.id), {
            id: parseInt(m.id),
            name: m.name.english,
            type: m.type,
            category: m.category,
            power: m.power,
            accuracy: m.accuracy,
            pp: m.pp,
            desc: m.description || "",
            learnedBy: [] 
        });
    });

    if (rawMoves) {
        Object.entries(rawMoves).forEach(([pokeKey, data]) => {
            const cleanKey = pokeKey.toLowerCase().replace(/ /g, '').replace(/[().]/g, '').replace(/-/g, '');
            const pokemon = pokemonLookup.get(cleanKey) || pokemonLookup.get(pokeKey);

            if (pokemon && data.moves) {
                data.moves.forEach(moveInstance => {
                    const moveId = String(moveInstance.id);
                    if (movesMap.has(moveId)) {
                        const moveEntry = movesMap.get(moveId);
                        
                        let methodGroup = "Other";
                        let sortOrder = 99;
                        
                        if (moveInstance.type === 'level') {
                            methodGroup = "Level Up";
                            sortOrder = 1;
                        } else if (moveInstance.type === 'move_learner_tools' || moveInstance.type === 'machine') {
                            methodGroup = "TM/HM";
                            sortOrder = 2;
                        } else if (moveInstance.type === 'move_tutor') {
                            methodGroup = "Tutor";
                            sortOrder = 3;
                        } else if (moveInstance.type === 'egg_move' || moveInstance.type === 'egg_moves') {
                            methodGroup = "Egg Moves";
                            sortOrder = 4;
                        }

                        moveEntry.learnedBy.push({
                            id: pokemon.id,
                            name: pokemon.name,
                            image: pokemon.image,
                            types: pokemon.type,
                            level: moveInstance.level,
                            methodGroup: methodGroup,
                            sortOrder: sortOrder
                        });
                    }
                });
            }
        });
    }

    return Array.from(movesMap.values())
        .map(m => {
            m.learnedBy.sort((a, b) => {
                if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
                if (a.sortOrder === 1 && a.level !== b.level) return a.level - b.level;
                return a.id - b.id;
            });
            return {
                ...m,
                learnedByCount: m.learnedBy.length
            };
        })
        .filter(m => m.learnedByCount > 0)
        .sort((a, b) => a.id - b.id);
};


// --- COMPONENTS ---

const TypeBadge = ({ type, lang, size = 'sm' }) => {
  const data = typeTranslations[type] || { id: type, en: type, color: "bg-gray-500" };
  const sizeClasses = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`${data.color} text-white ${sizeClasses} rounded-full font-medium mr-1 shadow-sm`}>
      {data[lang]}
    </span>
  );
};

const StatBar = ({ label, value }) => (
  <div className="flex items-center gap-2 mb-1">
    <div className="w-12 text-xs font-bold text-gray-500 uppercase dark:text-gray-400">{label}</div>
    <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full ${value > 100 ? 'bg-teal-500' : value > 70 ? 'bg-green-500' : value > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
        style={{ width: `${Math.min((value / 160) * 100, 100)}%` }}
      ></div>
    </div>
    <div className="w-8 text-right text-xs font-mono font-bold text-gray-700 dark:text-gray-300">{value}</div>
  </div>
);

// --- PAGES ---

const MoveDetailPage = ({ move, onBack, lang, onPokemonClick }) => { 
    const grouped = move.learnedBy.reduce((acc, curr) => {
        if (!acc[curr.methodGroup]) acc[curr.methodGroup] = [];
        acc[curr.methodGroup].push(curr);
        return acc;
    }, {});

    const sectionOrder = ["Level Up", "Egg Moves", "TM/HM", "Tutor"];

    // SCROLL KE ATAS SAAT KOMPONEN INI DIBUKA
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="animate-fadeIn space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 transition mb-4">
                <ArrowLeft size={20} /> Kembali
            </button>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-100 dark:border-slate-700 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">#{move.id}</span>
                            <TypeBadge type={move.type} lang={lang} size="md" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{move.name}</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xl">{move.desc || "Tidak ada deskripsi tersedia."}</p>
                    </div>
                    <div className="flex gap-4 text-center">
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl border border-gray-200 dark:border-slate-600">
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Power</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">{move.power}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl border border-gray-200 dark:border-slate-600">
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Acc</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">{move.accuracy}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl border border-gray-200 dark:border-slate-600">
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">PP</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">{move.pp}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-xl border border-gray-200 dark:border-slate-600">
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Category</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">{move.category}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {sectionOrder.map(section => {
                        const pokemons = grouped[section];
                        if (!pokemons || pokemons.length === 0) return null;

                        return (
                            <div key={section}>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-l-4 border-indigo-500 pl-3">
                                    {section} ({pokemons.length})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {pokemons.map((p, idx) => (
                                        <div 
                                            key={idx} 
                                            className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 transition cursor-pointer"
                                            onClick={() => onPokemonClick(p.id)} 
                                        >
                                            <img src={p.image} alt={p.name} className="w-12 h-12 object-contain mr-3" onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'; }}/>
                                            <div>
                                                <div className="text-sm font-bold text-gray-800 dark:text-white">{p.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    {section === "Level Up" && <span className="font-mono text-indigo-600 dark:text-indigo-400">Lvl {p.level}</span>}
                                                    <div className="flex gap-0.5 ml-1">
                                                        {p.types.map(t => <div key={t} className={`w-2 h-2 rounded-full ${typeTranslations[t]?.color.split(' ')[0]}`}></div>)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const RegionsPage = ({ t }) => (
    <div className="space-y-6 animate-fadeIn">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t.regions.title}</h2>
        <p className="text-gray-600 dark:text-gray-300">{t.regions.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regionsData.map((region) => (
                <div key={region.name} className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${region.img} shadow-lg hover:scale-[1.02] transition cursor-pointer`}>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <h3 className="text-3xl font-extrabold mb-2">{region.name}</h3>
                            <MapPin className="opacity-50" />
                        </div>
                        <div className="space-y-1 text-sm font-medium opacity-90 mt-4">
                            <div className="flex items-center gap-2"><TrendingUp size={14}/> Level: {region.levels}</div>
                            <div className="flex items-center gap-2"><Trophy size={14}/> Badges: {region.badges}</div>
                            <div className="flex items-center gap-2"><Target size={14}/> Difficulty: {t.regions.difficulty[region.difficulty]}</div>
                        </div>
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                </div>
            ))}
        </div>
    </div>
);

const GuidesPage = ({ t }) => (
    <div className="space-y-6 animate-fadeIn">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t.guides.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guidesData.map(guide => (
                <div key={guide.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 transition cursor-pointer group">
                    <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md mb-3 inline-block">
                        {t.guides.categories[guide.category]}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {guide.title?.id || guide.title?.en || "Panduan"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                        {guide.desc?.id || guide.desc?.en || "Deskripsi tidak tersedia."}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        {t.featured.readMore} <ChevronRight size={16} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DataImportPage = ({ t, onDataLoaded, currentStats, clearData, allPokemon }) => {
    return (
        <div className="text-center py-20 text-gray-400">
            Fitur Upload Data dinonaktifkan. Menggunakan data lokal.
        </div>
    );
};

const GroupDetailPage = ({ groupType, groupName, allPokemon, onBack, onPokemonClick }) => {
    // FILTER LOGIC
    const filteredPokemon = allPokemon.filter(p => {
        if (groupType === 'Ability') {
            // Handle jika ability berupa array [name, hidden]
            return p.abilities.some(ab => {
                const abName = Array.isArray(ab) ? ab[0] : ab;
                return String(abName) === String(groupName);
            });
        } else if (groupType === 'Egg Group') {
             return p.eggGroup.includes(groupName);
        } else if (groupType === 'Tier') {
            // FIX: Konversi ke String agar aman dari perbedaan format (Array vs String)
            // Ini mengatasi masalah "Hanya 1 pokemon muncul"
            const pTier = Array.isArray(p.tier) ? p.tier[0] : p.tier;
            const target = Array.isArray(groupName) ? groupName[0] : groupName;
            return String(pTier) === String(target);
        }
        return false;
    });

    // SCROLL KE ATAS SAAT KOMPONEN INI DIBUKA
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="animate-fadeIn space-y-6">
             <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                  <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                   <div className="text-sm font-bold text-indigo-500 uppercase tracking-wider">{groupType}</div>
                   <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">{String(groupName)}</h2>
                   <p className="text-gray-500 dark:text-gray-400">{filteredPokemon.length} Pokemon found.</p>
                </div>
              </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden p-6">
                 {filteredPokemon.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredPokemon.map((poke) => (
                            <div 
                                key={poke.id} 
                                onClick={() => onPokemonClick(poke.id)}
                                className="flex flex-col items-center p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 transition cursor-pointer"
                            >
                                <img src={poke.image} alt={poke.name} className="w-20 h-20 object-contain mb-2" onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'; }} />
                                <span className="text-sm font-bold text-gray-800 dark:text-white">{poke.name}</span>
                                <div className="flex gap-1 mt-1">
                                    {poke.type.map(t => <TypeBadge key={t} type={t} lang="en" size="xs" />)}
                                </div>
                            </div>
                        ))}
                     </div>
                 ) : (
                     <div className="text-center py-10 text-gray-400">
                         Tidak ada Pokemon ditemukan di kategori ini.
                     </div>
                 )}
            </div>
        </div>
    );
};
const LocationDetailPage = ({ locationName, region, allPokemon, onBack, t, lang, onPokemonClick }) => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // 1. Flatten Data: Buat array datar dari semua spawn di lokasi ini
  const flatSpawnData = useMemo(() => {
    const data = [];
    allPokemon.forEach(poke => {
        if (poke.locations) {
            const locs = poke.locations.filter(l => 
                l.place.toLowerCase() === locationName.toLowerCase() &&
                l.region.toLowerCase() === region.toLowerCase()
            );
            locs.forEach(detail => {
                data.push({
                    id: poke.id,
                    name: poke.name,
                    image: poke.image,
                    types: poke.type,
                    method: detail.method,
                    levels: detail.levels,
                    rate: detail.rate,
                    uniqueKey: `${poke.id}-${detail.method}-${detail.levels}`
                });
            });
        }
    });
    return data;
  }, [allPokemon, locationName, region]);

  // 2. Gunakan Hook Sorting
  const { items: sortedSpawns, requestSort, sortConfig } = useSortableData(flatSpawnData, { key: 'name', direction: 'ascending' });

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div>
           <div className="text-sm font-bold text-indigo-500 uppercase tracking-wider">{region} Region</div>
           <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">{locationName}</h2>
           <p className="text-gray-500 dark:text-gray-400">{flatSpawnData.length} Pokemon found.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
            <thead className="bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-slate-700">
              <tr>
                <SortableHeader label="Pokemon" sortKey="name" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Method" sortKey="method" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Level" sortKey="levels" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label="Rarity" sortKey="rate" currentSort={sortConfig} onSort={requestSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {sortedSpawns.map((spawn) => (
                  <tr 
                    key={spawn.uniqueKey} 
                    className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 transition cursor-pointer"
                    onClick={() => onPokemonClick(spawn.id)}
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={spawn.image} alt={spawn.name} className="w-10 h-10 object-contain" />
                      <div>
                        <div className="font-bold text-gray-800 dark:text-white">{spawn.name}</div>
                        <div className="flex gap-1 mt-1">
                          {spawn.types.map(type => <TypeBadge key={type} type={type} lang={lang} size="xs" />)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm">
                        {spawn.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">{spawn.levels}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        spawn.rate === 'Common' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        spawn.rate === 'Uncommon' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        spawn.rate === 'Rare' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {spawn.rate}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PokemonDetail = ({ pokemon, t, lang, onBack, onLocationClick, onMoveClick, allPokemon, onPokemonClick, onAbilityClick, onEggGroupClick, onTierClick }) => { 
  
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // --- UPDATE: Gunakan key 'levelSort' dan 'methodSort' yang baru dibuat ---
  const { items: sortedLocations, requestSort: sortLocs, sortConfig: locConfig } = useSortableData(pokemon.locations || [], { key: 'region', direction: 'ascending' });
  
  // FIX: Default sort Moves berdasarkan 'methodSort' agar rapi (Lvl 1, 2, 3...)
  const { items: sortedMoves, requestSort: sortMoves, sortConfig: moveConfig } = useSortableData(pokemon.moves || [], { key: 'methodSort', direction: 'ascending' });

  // Logic Evolution (Tetap)
  const renderFullEvolutionChain = () => {
      const evoStages = getEvolutionChain(pokemon, allPokemon);
      if (evoStages.length <= 1) return null; 
      return (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><GitBranch size={18} className="text-green-500"/> {t.pokedex.evolution}</h3>
            <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {evoStages.map((stage, stageIdx) => (
                    <React.Fragment key={stageIdx}>
                        {stageIdx > 0 && <ArrowRight className="text-gray-300 dark:text-slate-600 flex-shrink-0" />}
                        <div className="flex flex-col gap-2">
                            {stage.map((p) => {
                                const isCurrent = p.id === pokemon.id;
                                return (
                                    <div key={p.id} onClick={() => !isCurrent && onPokemonClick(p.id)} className={`flex flex-col items-center p-3 rounded-xl border shadow-sm transition min-w-[100px] ${isCurrent ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-200 dark:ring-indigo-800 cursor-default' : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:shadow-md cursor-pointer hover:border-indigo-300'}`}>
                                       <img src={p.image} alt={p.name} className="w-16 h-16 object-contain" onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'; }} />
                                       <span className={`text-xs font-bold mt-1 ${isCurrent ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-white'}`}>{p.name}</span>
                                       {p.evoCondition && <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center bg-gray-100 dark:bg-slate-800 px-1 rounded mt-1">{p.evoCondition}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
      );
  };

  return (
    <div className="animate-fadeIn bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
      {/* HEADER */}
      <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-10 -mt-10"></div>
         <button onClick={onBack} className="absolute top-6 left-6 z-10 p-2 bg-white/10 rounded-full hover:bg-white/20 transition"><ArrowLeft size={20} /></button>
         <div className="flex flex-col md:flex-row items-center justify-center pt-8 pb-4 relative z-0">
            <div className="text-center md:text-left md:mr-10">
              <span className="text-indigo-300 font-mono text-xl font-bold">#{pokemon.id.toString().padStart(3, '0')}</span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{pokemon.name}</h1>
              <div className="flex justify-center md:justify-start gap-2">{pokemon.type.map((type, idx) => <TypeBadge key={idx} type={type} lang={lang} size="md" />)}</div>
              {pokemon.tier !== "Unknown" && (<div className="mt-2 text-center md:text-left"><span className="bg-white/10 text-xs font-bold px-3 py-1 rounded-full border border-white/20">Tier: {pokemon.tier}</span></div>)}
            </div>
            <img src={pokemon.image} alt={pokemon.name} className="w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-2xl mt-6 md:mt-0 floating-animation" onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'; }} />
         </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-800 dark:text-slate-200">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-gray-50 dark:bg-slate-700/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-600">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-500"/> {t.pokedex.baseStats}</h3>
            <StatBar label="HP" value={pokemon.stats.hp} /><StatBar label="ATK" value={pokemon.stats.atk} /><StatBar label="DEF" value={pokemon.stats.def} /><StatBar label="SPA" value={pokemon.stats.spa} /><StatBar label="SPD" value={pokemon.stats.spd} /><StatBar label="SPE" value={pokemon.stats.spe} />
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600 flex justify-between text-sm font-bold text-gray-600 dark:text-gray-300"><span>TOTAL</span><span>{Object.values(pokemon.stats).reduce((a, b) => a + b, 0)}</span></div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
             {pokemon.description && (<div className="mb-4"><h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Info size={12}/> {t.pokedex.desc}</h4><p className="text-sm text-gray-700 dark:text-gray-300 italic">"{pokemon.description}"</p></div>)}
             <div className="mb-4"><h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Sparkles size={12}/> {t.pokedex.abilities}</h4><div className="flex flex-wrap gap-2">{pokemon.abilities && pokemon.abilities.map((ab, idx) => (<button key={idx} onClick={() => onAbilityClick(Array.isArray(ab) ? ab[0] : ab)} className="bg-white dark:bg-slate-700 px-2 py-1 rounded text-xs font-medium text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-slate-600 shadow-sm hover:bg-indigo-50 dark:hover:bg-slate-600 transition">{Array.isArray(ab) ? ab[0] : ab}</button>))}</div></div>
             <div><h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Egg size={12}/> {t.pokedex.eggGroup}</h4><div className="flex flex-wrap gap-2">{pokemon.eggGroup && pokemon.eggGroup.map((eg, idx) => (<button key={idx} onClick={() => onEggGroupClick(eg)} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition underline decoration-dotted">{eg}</button>))}</div></div>
             <div className="mt-4"><h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-2"><Trophy size={12}/> Tier</h4><div className="flex flex-wrap gap-2"><button onClick={() => onTierClick(pokemon.tier)} className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-md border border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 transition">{pokemon.tier || "Untiered"}</button></div></div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {renderFullEvolutionChain()}

          {/* TABLE LOCATION */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><MapPin size={18} className="text-red-500 fill-red-100"/> {t.pokedex.locationTable.title}</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-semibold uppercase text-xs">
                  <tr>
                    <SortableHeader label="Region" sortKey="region" currentSort={locConfig} onSort={sortLocs} />
                    <SortableHeader label="Place" sortKey="place" currentSort={locConfig} onSort={sortLocs} />
                    <SortableHeader label="Method" sortKey="method" currentSort={locConfig} onSort={sortLocs} />
                    {/* FIX: Gunakan levelSort untuk sorting */}
                    <SortableHeader label="Levels" sortKey="levelSort" currentSort={locConfig} onSort={sortLocs} />
                    <SortableHeader label="Rate" sortKey="rate" currentSort={locConfig} onSort={sortLocs} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-gray-700 dark:text-gray-300">
                  {sortedLocations.map((loc, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{loc.region}</td>
                      <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400 font-bold cursor-pointer hover:underline hover:text-indigo-800 flex items-center gap-1" onClick={() => onLocationClick(loc.region, loc.place)}>{loc.place} <CornerDownRight size={12} className="opacity-50"/></td>
                      <td className="px-4 py-3"><span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded text-xs font-medium border border-indigo-100 dark:border-indigo-800">{loc.method}</span></td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{loc.levels}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{loc.rate}</td>
                    </tr>
                  ))}
                  {sortedLocations.length === 0 && (<tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400 italic">No location data available.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* TABLE MOVES */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Zap size={18} className="text-yellow-500 fill-yellow-500"/> {t.pokedex.moves}</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-semibold uppercase text-xs">
                  <tr>
                    {/* FIX: Gunakan methodSort untuk sorting */}
                    <SortableHeader label="Method" sortKey="methodSort" currentSort={moveConfig} onSort={sortMoves} className="text-center w-24" />
                    <SortableHeader label="Move" sortKey="name" currentSort={moveConfig} onSort={sortMoves} />
                    <SortableHeader label="Type" sortKey="type" currentSort={moveConfig} onSort={sortMoves} />
                    <SortableHeader label="Cat" sortKey="cat" currentSort={moveConfig} onSort={sortMoves} />
                    <SortableHeader label="Power" sortKey="pwr" currentSort={moveConfig} onSort={sortMoves} className="text-center" />
                    <SortableHeader label="Acc" sortKey="acc" currentSort={moveConfig} onSort={sortMoves} className="text-center" />
                    <SortableHeader label="PP" sortKey="pp" currentSort={moveConfig} onSort={sortMoves} className="text-center" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-gray-700 dark:text-gray-300">
                  {sortedMoves.map((move, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition cursor-pointer" onClick={() => onMoveClick(move)}>
                      <td className="px-4 py-3 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">{move.method}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{move.name}</td>
                      <td className="px-4 py-3"><TypeBadge type={move.type} lang={lang} size="xs" /></td>
                      <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${move.cat === 'Physical' ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' : move.cat === 'Special' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600'}`}>{move.cat.substring(0,4)}</span></td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{move.pwr}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{move.acc}</td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{move.pp}</td>
                    </tr>
                  ))}
                  {sortedMoves.length === 0 && (<tr><td colSpan="7" className="px-4 py-8 text-center text-gray-400 italic">No move data available.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MovedexPage = ({ t, lang, allMoves, allPokemon }) => { 
  const [search, setSearch] = useState("");
  const [selectedMove, setSelectedMove] = useState(null); 
  const [selectedPokemon, setSelectedPokemon] = useState(null); 
  const [selectedLocation, setSelectedLocation] = useState(null); 
  const [selectedGroup, setSelectedGroup] = useState(null); 

  // Filter dulu
  const filteredMoves = useMemo(() => {
    return allMoves.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  }, [allMoves, search]);

  // Baru di-sort
  const { items: sortedMoves, requestSort, sortConfig } = useSortableData(filteredMoves, { key: 'id', direction: 'ascending' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedMove, selectedPokemon, selectedLocation, selectedGroup]);

  // (Logika return View Detail Move/Pokemon/Group/Location tetap sama, copy dari file lama jika perlu, atau gunakan flow ini)
  if (selectedMove) return <MoveDetailPage move={selectedMove} onBack={() => setSelectedMove(null)} lang={lang} onPokemonClick={(id) => { const p = allPokemon.find(pk => pk.id === id); if (p) { setSelectedPokemon(p); setSelectedMove(null); } }} />;
  if (selectedGroup) return <GroupDetailPage groupType={selectedGroup.type} groupName={selectedGroup.name} allPokemon={allPokemon} onBack={() => setSelectedGroup(null)} onPokemonClick={(id) => { const targetPokemon = allPokemon.find(p => p.id === id); if (targetPokemon) { setSelectedPokemon(targetPokemon); setSelectedGroup(null); } }} />;
  if (selectedLocation) return <LocationDetailPage locationName={selectedLocation.place} region={selectedLocation.region} allPokemon={allPokemon} onBack={() => setSelectedLocation(null)} t={t} lang={lang} onPokemonClick={(pokemonId) => { const targetPokemon = allPokemon.find(p => p.id === pokemonId); if (targetPokemon) { setSelectedPokemon(targetPokemon); setSelectedLocation(null); } }} />;
  if (selectedPokemon) return <PokemonDetail pokemon={selectedPokemon} t={t} lang={lang} onBack={() => setSelectedPokemon(null)} onLocationClick={(r, p) => setSelectedLocation({region: r, place: p})} onMoveClick={(m) => { const full = allMoves.find(mv => mv.id === m.id); if (full) setSelectedMove(full); }} allPokemon={allPokemon} onPokemonClick={(id) => { const p = allPokemon.find(pk => pk.id === id); if (p) setSelectedPokemon(p); }} onAbilityClick={(name) => setSelectedGroup({ type: 'Ability', name })} onEggGroupClick={(name) => setSelectedGroup({ type: 'Egg Group', name })} onTierClick={(name) => setSelectedGroup({ type: 'Tier', name })} />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Sword className="text-pink-500 fill-pink-500" /> {t.movedex.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">{t.movedex.subtitle}</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder={t.movedex.searchPlaceholder} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-gray-50 dark:bg-slate-700 dark:text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 font-semibold uppercase text-xs">
              <tr>
                <SortableHeader label={t.movedex.id} sortKey="id" currentSort={sortConfig} onSort={requestSort} className="w-24 text-center" />
                <SortableHeader label={t.movedex.name} sortKey="name" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label={t.movedex.type} sortKey="type" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label={t.movedex.cat} sortKey="category" currentSort={sortConfig} onSort={requestSort} />
                <SortableHeader label={t.movedex.pwr} sortKey="power" currentSort={sortConfig} onSort={requestSort} className="text-center" />
                <SortableHeader label={t.movedex.acc} sortKey="accuracy" currentSort={sortConfig} onSort={requestSort} className="text-center" />
                <SortableHeader label={t.movedex.pp} sortKey="pp" currentSort={sortConfig} onSort={requestSort} className="text-center" />
                <SortableHeader label={t.movedex.learnCount} sortKey="learnedByCount" currentSort={sortConfig} onSort={requestSort} className="text-center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-gray-700 dark:text-gray-300">
              {sortedMoves.map((move) => (
                <tr key={move.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition cursor-pointer" onClick={() => setSelectedMove(move)}>
                  <td className="px-4 py-3 text-center font-mono font-bold text-gray-400">#{move.id}</td>
                  <td className="px-4 py-3 font-bold text-gray-800 dark:text-white text-base">{move.name}</td>
                  <td className="px-4 py-3"><TypeBadge type={move.type} lang={lang} size="xs" /></td>
                  <td className="px-4 py-3"><span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${move.category === 'Physical' ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' : move.category === 'Special' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600'}`}>{move.category}</span></td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{move.power}</td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{move.accuracy}</td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{move.pp}</td>
                  <td className="px-4 py-3 text-center"><span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold">{move.learnedByCount}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PokedexPage = ({ t, lang, allPokemon, setAllPokemon, allMoves, selectedPokemon, setSelectedPokemon }) => { // TERIMA PROP allMoves
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null); // STATE BARU UNTUK MOVE TERPILIH
  const [selectedGroup, setSelectedGroup] = useState(null);  // STATE BARU UNTUK GROUP
  const [viewMode, setViewMode] = useState('National'); 
  
  // SCROLL KE ATAS SETIAP KALI VIEW BERUBAH
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedPokemon, selectedLocation, selectedMove, selectedGroup]);

  const filteredPokemon = allPokemon.filter(p => {
    const searchLower = search.toLowerCase();
    const nameMatch = p.name.toLowerCase().includes(searchLower);
    const typeMatch = p.type.some(typeKey => {
      const typeObj = typeTranslations[typeKey];
      return (
        (typeObj?.id?.toLowerCase().includes(searchLower)) || 
        (typeObj?.en?.toLowerCase().includes(searchLower)) ||
        (typeKey.toLowerCase().includes(searchLower)) 
      );
    });
    
    let regionMatch = true;
    if (viewMode === 'Kanto') regionMatch = p.id <= 151;
    else if (viewMode === 'Johto') regionMatch = p.id >= 152 && p.id <= 251;
    else if (viewMode === 'Hoenn') regionMatch = p.id >= 252 && p.id <= 386;
    else if (viewMode === 'Sinnoh') regionMatch = p.id >= 387 && p.id <= 493;
    else if (viewMode === 'Unova') regionMatch = p.id >= 494 && p.id <= 649;
    
    return (nameMatch || typeMatch) && regionMatch;
  });

  // NAVIGASI POKEDEX:

  // 1. Jika ada Group terpilih (Ability/Egg Group) -> Tampilkan Group Detail
  if (selectedGroup) {
      return <GroupDetailPage
        groupType={selectedGroup.type}
        groupName={selectedGroup.name}
        allPokemon={allPokemon}
        onBack={() => setSelectedGroup(null)}
        onPokemonClick={(id) => {
            const targetPokemon = allPokemon.find(p => p.id === id);
            if (targetPokemon) {
                setSelectedPokemon(targetPokemon);
                setSelectedGroup(null);
            }
        }}
      />
  }

  // 2. Jika ada Move terpilih -> Tampilkan Move Detail
  if (selectedMove) return <MoveDetailPage 
    move={selectedMove} 
    onBack={() => setSelectedMove(null)} 
    lang={lang} 
    onPokemonClick={(pokemonId) => {
        // Logika untuk pindah ke pokemon lain dari Move Detail
        const targetPokemon = allPokemon.find(p => p.id === pokemonId);
        if (targetPokemon) {
            setSelectedPokemon(targetPokemon);
            setSelectedMove(null); // Tutup move detail agar kembali ke pokemon detail
        }
    }}
  />;
  
  // 3. Jika ada Lokasi terpilih -> Tampilkan Lokasi Detail
  if (selectedLocation) return <LocationDetailPage 
      locationName={selectedLocation.place} 
      region={selectedLocation.region} 
      allPokemon={allPokemon} 
      onBack={() => setSelectedLocation(null)} 
      t={t} 
      lang={lang}
      onPokemonClick={(pokemonId) => { // ADD THIS
        const targetPokemon = allPokemon.find(p => p.id === pokemonId);
        if (targetPokemon) {
            setSelectedPokemon(targetPokemon);
            setSelectedLocation(null); 
        }
      }}
  />;
  
  // 4. Jika ada Pokemon terpilih -> Tampilkan Pokemon Detail
  if (selectedPokemon) {
    return <PokemonDetail 
        pokemon={selectedPokemon} 
        t={t} 
        lang={lang} 
        onBack={() => setSelectedPokemon(null)} 
        onLocationClick={(r, p) => setSelectedLocation({region: r, place: p})} 
        onMoveClick={(move) => {
            // Cari data lengkap move dari allMoves berdasarkan ID
            const fullMoveData = allMoves.find(m => m.id === move.id);
            if (fullMoveData) setSelectedMove(fullMoveData);
        }}
        // Pass allPokemon and click handler to PokemonDetail for Evolution
        allPokemon={allPokemon}
        onPokemonClick={(pokemonId) => {
             const targetPokemon = allPokemon.find(p => p.id === pokemonId);
             if (targetPokemon) {
                 setSelectedPokemon(targetPokemon);
             }
        }}
        onAbilityClick={(name) => setSelectedGroup({ type: 'Ability', name })}
        onEggGroupClick={(name) => setSelectedGroup({ type: 'Egg Group', name })}
        onTierClick={(name) => setSelectedGroup({ type: 'Tier', name })}
    />;
  }

  return (
    <div className="space-y-6 animate-fadeIn relative min-h-[500px]">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t?.pokedex?.title || 'Pokedex'}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t?.pokedex?.subtitle}</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder={t?.pokedex?.searchPlaceholder} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-gray-50 dark:bg-slate-700 dark:text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

       <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {['National', 'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova'].map((mode) => (
           <button key={mode} onClick={() => setViewMode(mode)} className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${viewMode === mode ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600'}`}>
             {mode} Dex
           </button>
        ))}
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPokemon.map((poke) => (
          <div key={poke.id} onClick={() => setSelectedPokemon(poke)} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-slate-700 group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-gray-400 font-mono text-sm">#{poke.id.toString().padStart(3, '0')}</span>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{poke.name}</h3>
                <div className="mt-2">
                  {poke.type.map((t, i) => <TypeBadge key={i} type={t} lang={lang} />)}
                </div>
              </div>
              <img src={poke.image} alt={poke.name} className="w-24 h-24 object-contain" onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'; }} />
            </div>
          </div>
        ))}
        {filteredPokemon.length === 0 && <div className="col-span-full text-center py-20 text-gray-400">No Pokemon Found</div>}
      </div>
    </div>
  );
};

const HomePage = ({ setView, t, allPokemon, allMoves, onSelectPokemon }) => {
  const randomPokemon = useMemo(() => {
    if (!allPokemon || allPokemon.length === 0) return null;
    return allPokemon[Math.floor(Math.random() * allPokemon.length)];
  }, [allPokemon]);

  return (
    <div className="space-y-12 animate-fadeIn">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white shadow-2xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between">
        <div className="space-y-6 max-w-lg z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            {t.hero.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">PokeMMO</span>
          </h1>
          <p className="text-indigo-200 text-lg">{t.hero.subtitle}</p>
          <div className="flex gap-4">
            <button onClick={() => setView('pokedex')} className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-bold py-3 px-8 rounded-xl transition shadow-lg transform hover:scale-105">{t.hero.btnPokedex}</button>
          </div>
        </div>
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" className="hidden md:block w-80 z-10 drop-shadow-2xl" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl"><BookOpen size={24}/></div>
            <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{allPokemon.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">{t.home.stats.database}</div>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl"><Sword size={24}/></div>
            <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{allMoves.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">{t.home.stats.moves}</div>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl"><Users size={24}/></div>
            <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">15k+</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">{t.home.stats.users}</div>
            </div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex items-center gap-4 shadow-sm hover:shadow-md transition">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl"><Activity size={24}/></div>
            <div>
                <div className="text-sm font-bold text-green-600 dark:text-green-400">Online</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">{t.home.stats.status}</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { title: t.quickLinks.pokedex.title, icon: <BookOpen className="w-6 h-6" />, desc: t.quickLinks.pokedex.desc, view: 'pokedex', color: "bg-red-50", darkColor: "dark:bg-red-900/20" },
                    { title: t.quickLinks.movedex.title, icon: <Sword className="w-6 h-6" />, desc: t.quickLinks.movedex.desc, view: 'movedex', color: "bg-pink-50", darkColor: "dark:bg-pink-900/20" },
                    { title: t.quickLinks.region.title, icon: <MapIcon className="w-6 h-6" />, desc: t.quickLinks.region.desc, view: 'regions', color: "bg-green-50", darkColor: "dark:bg-green-900/20" },
                    { title: t.quickLinks.calculator.title, icon: <Calculator className="w-6 h-6" />, desc: t.quickLinks.calculator.desc, view: 'breeding', color: "bg-blue-50", darkColor: "dark:bg-blue-900/20" },
                ].map((item, idx) => (
                    <div key={idx} onClick={() => setView(item.view)} className={`${item.color} ${item.darkColor} p-6 rounded-2xl cursor-pointer hover:shadow-lg transition border border-gray-100 dark:border-slate-700 group`}>
                    <div className="bg-white dark:bg-slate-700 p-3 rounded-xl w-fit shadow-sm mb-4 text-gray-800 dark:text-white group-hover:scale-110 transition">
                        {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Star className="text-yellow-500 fill-yellow-500" /> {t.featured.title}
                    </h2>
                    <button onClick={() => setView('guides')} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1">
                    {t.featured.viewAll} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guidesData.slice(0, 2).map((guide) => (
                    <div key={guide.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 transition cursor-pointer">
                        <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
                        {t.guides.categories[guide.category]}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">{guide.title?.id || guide.title?.en || "Panduan"}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{guide.desc?.id || guide.desc?.en || "Deskripsi..."}</p>
                    </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="space-y-6">
            {randomPokemon && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold uppercase text-xs tracking-wider">
                        <Trophy size={14} /> {t.home.spotlight}
                    </div>
                    <div className="text-center">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-orange-100 dark:bg-orange-900/30 rounded-full blur-xl opacity-60"></div>
                            <img src={randomPokemon.image} alt={randomPokemon.name} className="w-32 h-32 relative z-10 mx-auto mb-2" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{randomPokemon.name}</h3>
                        <div className="flex justify-center gap-1 mt-2">
                            {randomPokemon.type.map((t, i) => <TypeBadge key={i} type={t} lang="en" size="xs" />)}
                        </div>
                        <button onClick={() => { onSelectPokemon(randomPokemon); setView('pokedex');}} className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-800 dark:hover:text-orange-400">
                            Lihat Detail →
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Bell size={18} className="text-indigo-500" /> {t.home.newsTitle}
                    </h3>
                </div>
                <div className="space-y-4">
                    {newsData.map((news) => (
                        <div key={news.id} className="border-l-2 border-indigo-100 dark:border-indigo-900 pl-4 py-1 hover:border-indigo-500 transition cursor-pointer">
                            <span className="text-[10px] font-bold text-indigo-400 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{news.type}</span>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-white mt-1">{news.title}</h4>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                <Calendar size={12} /> {news.date}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [lang, setLang] = useState('en'); // Default EN
  const [theme, setTheme] = useState('dark'); // Default Dark
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [allPokemon, setAllPokemon] = useState([]);
  const [allMoves, setAllMoves] = useState([]);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [allItems, setAllItems] = useState([]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeView]);

  useEffect(() => {
      // 1. Prioritas Utama: Data Lokal dari Import
      if (localItemsRaw) {
          setAllItems(localItemsRaw);
      }

      if (localPokedexRaw && localMovesRaw && localDetailedMovesRaw) {
          console.log("Menggunakan data lokal dari src/data/...");
          const p = transformData(localPokedexRaw, localMovesRaw, localDetailedMovesRaw);
          const m = generateMovedex(localDetailedMovesRaw, localMovesRaw, p);
          setAllPokemon(p);
          setAllMoves(m);
          return;
      }

      
      // 3. Fallback: Sample Data
      console.log("Loading Sample Data (Forced refresh)...");
      const p = transformData(samplePokedex, sampleMoves, sampleDetailedMoves);
      const m = generateMovedex(sampleDetailedMoves, sampleMoves, p);
      setAllPokemon(p);
      setAllMoves(m);
      
  }, []);

  const t = translations[lang];
  const toggleLang = () => setLang(prev => prev === 'id' ? 'en' : 'id');

  const handleDataLoaded = (pData, mData, dData, shouldSave = true) => {
      setAllPokemon(pData);
      setAllMoves(mData);
      setActiveView('pokedex');

      if (shouldSave) {
          try {
              localStorage.setItem('pokemmo_wiki_pokemon', JSON.stringify(pData));
              localStorage.setItem('pokemmo_wiki_moves', JSON.stringify(mData));
          } catch (e) { console.error("Storage full or error", e); }
      }
  };

  const clearData = () => {
      localStorage.removeItem('pokemmo_wiki_pokemon');
      localStorage.removeItem('pokemmo_wiki_moves');
      // Reset logic: force reload from whatever source is available
      if (localPokedexRaw && localMovesRaw && localDetailedMovesRaw) {
          const p = transformData(localPokedexRaw, localMovesRaw, localDetailedMovesRaw);
          const m = generateMovedex(localDetailedMovesRaw, localMovesRaw, p);
          setAllPokemon(p);
          setAllMoves(m);
          alert("Data localStorage dihapus. Menggunakan data lokal (src/data/).");
      } else {
          const p = transformData(samplePokedex, sampleMoves, sampleDetailedMoves);
          const m = generateMovedex(sampleDetailedMoves, sampleMoves, p);
          setAllPokemon(p);
          setAllMoves(m);
          alert("Data berhasil dihapus. Menggunakan Sample Data.");
      }
  };

  const navItems = [
    { id: 'home', label: t.nav.home, icon: <Menu size={20} /> },
    { id: 'pokedex', label: t.nav.pokedex, icon: <BookOpen size={20} /> },
    { id: 'movedex', label: t.nav.movedex || 'Movedex', icon: <Sword size={20} /> },
    { id: 'items', label: 'Items', icon: <Backpack size={20} /> },
    { id: 'breeding', label: 'Breeding', icon: <Egg size={20} /> },
    { id: 'regions', label: t.nav.region, icon: <MapIcon size={20} /> },
    { id: 'guides', label: t.nav.guides, icon: <Star size={20} /> },
    { id: 'settings', label: t.nav.settings, icon: <Upload size={20} /> },
  ];

  return (
    <div className={theme}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.5s ease-out; } .floating-animation { animation: float 6s ease-in-out infinite; } @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } } .scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('home')}>
                <div className="w-8 h-8 bg-gradient-to-tr from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-lg">P</div>
                <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">PokeMMO<span className="text-indigo-600 dark:text-indigo-400">Wiki</span></span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <button key={item.id} onClick={() => setActiveView(item.id)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeView === item.id ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'}`}>{item.label}</button>
                ))}
                <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>
                <button onClick={toggleTheme} className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button onClick={toggleLang} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"><Globe size={16} /><span>{lang.toUpperCase()}</span></button>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                  <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-400">{theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}</button>
                  <button onClick={toggleLang} className="p-2 text-gray-600 dark:text-gray-400"><Globe size={20}/></button>
                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-400"><Menu /></button>
              </div>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 p-4 space-y-2 shadow-xl absolute w-full">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => { setActiveView(item.id); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 dark:text-gray-300 active:bg-gray-50 dark:active:bg-slate-800">{item.icon}{item.label}</button>
              ))}
            </div>
          )}
        </nav>

        <main className="max-w-6xl mx-auto px-4 py-8 min-h-[80vh]">
          {activeView === 'home' && <HomePage setView={setActiveView} t={t} allPokemon={allPokemon} allMoves={allMoves} onSelectPokemon={setCurrentPokemon}  />}
          {activeView === 'pokedex' && <PokedexPage t={t} lang={lang} allPokemon={allPokemon} setAllPokemon={setAllPokemon} allMoves={allMoves} selectedPokemon={currentPokemon} setSelectedPokemon={setCurrentPokemon} />}
          {activeView === 'movedex' && <MovedexPage t={t} lang={lang} allMoves={allMoves} allPokemon={allPokemon} />}
          {activeView === 'items' && <ItemsPage t={t} items={allItems} />}
          {activeView === 'breeding' && <BreedingCalculator />}
          {activeView === 'regions' && <RegionsPage t={t} />}
          {activeView === 'guides' && <GuidesPage t={t} />}
          {activeView === 'settings' && <DataImportPage t={t} onDataLoaded={handleDataLoaded} currentStats={{ pokemon: allPokemon.length, moves: allMoves.length }} clearData={clearData} />}
        </main>

        <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-12 py-12 text-center text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
          &copy; 2024 PokeMMO Wiki. Community Project.
        </footer>
      </div>
    </div>
  );
}
