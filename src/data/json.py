import json
import os

def merge_tiers():
    # 1. Tentukan nama file
    # Pastikan nama file ini sesuai dengan file yang ada di folder Anda
    pokedex_file = 'pokedex.json'
    tier_source_file = 'pokemmo.mock.data.json'
    output_file = 'pokedex_updated.json'

    # Cek apakah file ada
    if not os.path.exists(pokedex_file) or not os.path.exists(tier_source_file):
        print(f"Error: Pastikan file '{pokedex_file}' dan '{tier_source_file}' ada di folder ini.")
        return

    print("Sedang membaca file...")
    
    # 2. Baca Data
    try:
        with open(pokedex_file, 'r', encoding='utf-8') as f:
            pokedex_data = json.load(f)
        
        with open(tier_source_file, 'r', encoding='utf-8') as f:
            tier_data_raw = json.load(f)
    except Exception as e:
        print(f"Error saat membaca JSON: {e}")
        return

    # 3. Buat Kamus (Dictionary) untuk Lookup Tier
    # Kita ubah struktur data tier agar mudah dicari berdasarkan nama
    # Format target: { "Bulbasaur": "Untiered", "Ivysaur": "Untiered", ... }
    
    tier_map = {}
    
    # Menangani struktur pokemmo.mock.data.json
    # Strukturnya: { "Pokedex": [ { "pokemon": { "name": "...", "tier": "..." } }, ... ] }
    source_list = tier_data_raw.get("Pokedex", [])
    
    for entry in source_list:
        pokemon_info = entry.get("pokemon", {})
        name = pokemon_info.get("name")
        tier = pokemon_info.get("tier")
        
        if name and tier:
            tier_map[name] = tier

    print(f"Berhasil memuat {len(tier_map)} data tier referensi.")

    # 4. Proses Penggabungan (Merging)
    updated_count = 0
    
    for pokemon in pokedex_data:
        # Ambil nama bahasa Inggris dari pokedex.json
        # Strukturnya: { "name": { "english": "Bulbasaur" } }
        name = pokemon.get("name", {}).get("english")
        
        if name in tier_map:
            # Jika ketemu, tambahkan field 'tier'
            pokemon["tier"] = tier_map[name]
            updated_count += 1
        else:
            # Jika tidak ada di data tier, set default (opsional)
            pokemon["tier"] = "Untiered"
            # Coba cari penanganan khusus untuk nama yang mungkin beda
            # misal: "Nidoran♀" vs "Nidoran-F"
            # (Logic tambahan bisa ditaruh di sini jika perlu)

    # 5. Simpan Hasil
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(pokedex_data, f, indent=2, ensure_ascii=False)
        
        print("-" * 30)
        print(f"SUKSES! Data Tier berhasil ditambahkan.")
        print(f"Total Pokemon diupdate: {updated_count}")
        print(f"File baru disimpan sebagai: {output_file}")
        print("-" * 30)
        print("Silakan rename 'pokedex_updated.json' menjadi 'pokedex.json' di folder src/data/ Anda.")
        
    except Exception as e:
        print(f"Gagal menyimpan file: {e}")

if __name__ == "__main__":
    merge_tiers()