# -*- coding: utf-8 -*-
"""Baixa as malhas do IBGE dos 36 municipios do Corede Vale do Taquari
e gera um SVG com um path por municipio (malha cartografica)."""
import json, math, urllib.request, time, sys, gzip, os

API = "https://servicodados.ibge.gov.br/api/v3/malhas/municipios/{}?formato=application/vnd.geo+json&qualidade=intermediaria"
LISTA = "https://servicodados.ibge.gov.br/api/v1/localidades/microrregioes/43021/municipios"
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")

# no Corede Vale do Taquari mas fora da microrregiao Lajeado-Estrela
EXTRAS = {
    4300703: "Anta Gorda", 4301404: "Arvorezinha", 4310306: "Ilopolis",
    4315206: "Putinga",    4318465: "Sao Jose do Herval",
}

os.makedirs(CACHE, exist_ok=True)

def get(url, chave=None, tries=3):
    cam = os.path.join(CACHE, chave + ".json") if chave else None
    if cam and os.path.exists(cam):
        return json.load(open(cam, encoding="utf-8"))
    req = urllib.request.Request(url, headers={
        "Accept": "application/json", "Accept-Encoding": "gzip",
        "User-Agent": "actus-vale-site/1.0",
    })
    for t in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                raw = r.read()
                if r.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
                d = json.loads(raw.decode("utf-8"))
                if cam: json.dump(d, open(cam, "w", encoding="utf-8"))
                return d
        except Exception:
            if t == tries - 1: raise
            time.sleep(1.5)

munis = {m["id"]: m["nome"] for m in get(LISTA, "lista")}
munis.update(EXTRAS)
print(f"municipios: {len(munis)}")

feats = []
for i, (cod, nome) in enumerate(sorted(munis.items()), 1):
    gj = get(API.format(cod), f"m{cod}")
    fs = gj["features"] if gj.get("type") == "FeatureCollection" else [gj]
    for f in fs:
        feats.append((nome, f["geometry"]))

def aneis(geom):
    t, c = geom["type"], geom["coordinates"]
    if t == "Polygon":      return c
    if t == "MultiPolygon": return [r for poly in c for r in poly]
    return []

todos = [(n, r) for n, g in feats for r in aneis(g)]
pts = [p for _, r in todos for p in r]
lons = [p[0] for p in pts]; lats = [p[1] for p in pts]
lon0, lon1 = min(lons), max(lons)
lat0, lat1 = min(lats), max(lats)
fator = math.cos(math.radians((lat0 + lat1) / 2))   # correcao de longitude
print(f"extensao: lon {lon0:.3f}..{lon1:.3f}  lat {lat0:.3f}..{lat1:.3f}")
print(f"pontos brutos: {len(pts)}")

W = 1000.0
H = W * ((lat1 - lat0) / ((lon1 - lon0) * fator))

def proj(p):
    return ((p[0] - lon0) / (lon1 - lon0) * W,
            (lat1 - p[1]) / (lat1 - lat0) * H)

def rdp(linha, tol):
    """Ramer-Douglas-Peucker em polilinha ABERTA."""
    if len(linha) < 3: return linha[:]
    keep = [False] * len(linha); keep[0] = keep[-1] = True
    pilha = [(0, len(linha) - 1)]
    while pilha:
        a, b = pilha.pop()
        if b <= a + 1: continue
        ax, ay = linha[a]; bx, by = linha[b]
        dx, dy = bx - ax, by - ay
        norma = math.hypot(dx, dy)
        pior, idx = -1.0, -1
        for i in range(a + 1, b):
            px, py = linha[i]
            if norma < 1e-12:
                d = math.hypot(px - ax, py - ay)
            else:
                d = abs(dx * (ay - py) - (ax - px) * dy) / norma
            if d > pior: pior, idx = d, i
        if pior > tol and idx > 0:
            keep[idx] = True
            pilha.append((a, idx)); pilha.append((idx, b))
    return [p for p, k in zip(linha, keep) if k]

def simplifica_anel(anel, tol):
    """RDP nao funciona direto em anel fechado: a reta base tem
    comprimento zero. Divide o anel em duas polilinhas abertas."""
    fechado = (abs(anel[0][0] - anel[-1][0]) < 1e-9 and
               abs(anel[0][1] - anel[-1][1]) < 1e-9)
    corpo = anel[:-1] if fechado else anel[:]
    if len(corpo) < 4: return anel
    p0 = corpo[0]
    longe = max(range(len(corpo)),
                key=lambda i: (corpo[i][0]-p0[0])**2 + (corpo[i][1]-p0[1])**2)
    if longe < 2: return anel
    a = rdp(corpo[:longe + 1], tol)
    b = rdp(corpo[longe:] + [corpo[0]], tol)
    saida = a[:-1] + b[:-1]
    return saida + [saida[0]] if fechado else saida

paths, total_pts = [], 0
for nome, anel in todos:
    xy = simplifica_anel([proj(p) for p in anel], tol=0.55)
    if len(xy) < 4: continue
    total_pts += len(xy)
    paths.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in xy) + "Z")

svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H:.0f}" '
       f'fill="none" stroke="#ede9e1" stroke-width="1.1" '
       f'stroke-linejoin="round" aria-hidden="true">']
svg += [f'<path d="{d}"/>' for d in paths]
svg.append("</svg>")
out = "\n".join(svg)

dest = sys.argv[1]
open(dest, "w", encoding="utf-8").write(out)
print(f"paths: {len(paths)}  pontos: {total_pts} (de {len(pts)})")
print(f"viewBox 0 0 {W:.0f} {H:.0f}  |  {len(out)/1024:.1f} KB  ->  {dest}")
