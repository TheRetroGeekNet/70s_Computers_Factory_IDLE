// ...existing code...
let brandsJSON = [
    "apple.json",
    "atari.json",
    "commodore.json",
    "exidy.json",
    "heathkit.json",
    "ibm.json",
    "magnavox.json",
    "mits.json",
    "ohio_scientific.json",
    "osborne.json",
    "processor_tech.json",
    "sinclair.json",
    "tandy.json",
    "texas_instruments.json",
    "vector_graphic.json"
];

export { brandsJSON };

function resolveBrandArg(arg) {
    if (!arg) return null;
    const formatBrand = f => f.replace('.json', '').replace(/_/g, ' ');
    if (/^\d+$/.test(arg)) {
        const idx = parseInt(arg, 10) - 1;
        if (brandsJSON[idx]) return { file: brandsJSON[idx], name: formatBrand(brandsJSON[idx]) };
        return null;
    } else {
        const key = arg.replace(/_/g, ' ').toLowerCase();
        const match = brandsJSON.map(formatBrand).find(b => b.toLowerCase() === key);
        if (match) return { file: `${match.replace(/ /g, '_')}.json`, name: match };
        return null;
    }
}

export { resolveBrandArg };

async function loadBrandData(arg) {
    const resolved = resolveBrandArg(arg);
    if (!resolved) throw new Error('Marque introuvable');
    const resp = await fetch(`data/brands/${resolved.file}`);
    if (!resp.ok) throw new Error(`Erreur HTTP ${resp.status} pour ${resolved.file}`);
    const data = await resp.json();
    return { meta: resolved, data };
}

export { loadBrandData };

async function listAllMachines(printFn) {
    const results = await Promise.all(brandsJSON.map(f =>
        fetch(`data/brands/${f}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
    ));
    let count = 0;
    results.forEach((bd, bi) => {
        if (!bd) return;
        const brandName = bd.name || brandsJSON[bi].replace('.json', '').replace(/_/g, ' ');
        if (Array.isArray(bd.machines) && bd.machines.length) {
            printFn(`--- ${brandName} ---`);
            bd.machines.forEach(m => {
                count++;
                if (typeof m === 'string') {
                    printFn(`${count}) ${m} (${brandName})`);
                } else if (m.name) {
                    printFn(`${count}) ${m.name} — ${brandName}`);
                } else {
                    printFn(`${count}) Machine inconnue (${brandName})`);
                }
            });
        }
    });
    if (count === 0) printFn('Aucune machine trouvée dans les fichiers de marques.');
}

export { listAllMachines };