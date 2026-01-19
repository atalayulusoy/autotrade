# -*- coding: utf-8 -*-

# Emoji-safe constants (dosyada gerçek emoji karakteri YOK)
E_ON    = "\U0001F7E2"          # green circle
E_OFF   = "\U0001F534"          # red circle
E_OK    = "\u2705"              # check
E_X     = "\u274C"              # cross
E_STOP  = "\u26D4"              # no entry
E_PLAY  = "\u25B6\uFE0F"        # play
E_PAUS  = "\u23F8\uFE0F"        # pause
E_USER  = "\U0001F464"          # user
E_MNY   = "\U0001F4B0"          # money bag
E_TST   = "\U0001F9EA"          # test tube
E_BANK  = "\U0001F3E6"          # bank
E_NOTE  = "\U0001F4DD"          # memo
E_PIN   = "\U0001F4CC"          # pin
E_HOME  = "\U0001F3E0"          # house
E_SHLD  = "\U0001F6E1\uFE0F"    # shield
E_PPL   = "\U0001F465"          # people
E_LOGS  = "\U0001F9FE"          # receipt (logs)
E_PLUS  = "\u2795"              # plus
E_EXIT  = "\U0001F6AA"          # door
E_LOCK  = "\U0001F510"          # lock
E_CHART = "\U0001F4CA"          # bar chart
E_MAIL  = "\U0001F4E8"          # incoming envelope
E_MOUSE = "\U0001F5B1\uFE0F"    # mouse
E_SAVE  = "\U0001F4BE"          # floppy
E_BOT   = "\U0001F916"          # robot
E_INBOX = "\U0001F4E5"          # inbox tray
E_WARN  = "\u26A0\uFE0F"        # warning
E_BOOM  = "\U0001F4A5"          # collision
E_BACK  = "\u21A9\uFE0F"        # back arrow
E_BROOM = "\U0001F9F9"          # broom
E_TRASH = "\U0001F5D1\uFE0F"    # trash
E_EDIT  = "\u270F\uFE0F"        # pencil
E_UP    = "\U0001F4C8"          # chart up
E_BOX   = "\U0001F4E6"          # package
E_TAB   = "\U0001F4B2"          # dollar sign style icon
E_TIME  = "\u23F0"              # alarm clock

from flask import Response

def _send_bytes(data: bytes, filename: str, mime: str = "application/octet-stream"):
    if data is None:
        data = b""
    r = Response(data, mimetype=mime)
    r.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    r.headers["Cache-Control"] = "no-store"
    return r


from io import BytesIO

def _contract_pdf_bytes(row: dict) -> bytes:
    """
    Profesyonel PDF üretimi (TR font destekli).
    """
    from io import BytesIO
    from datetime import datetime, timezone, timedelta

    # ReportLab (platypus) ile profesyonel layout
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.lib import colors

    # TR font: DejaVuSans (Ubuntu'da genelde var)
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

    # ---- data ----
    username  = safe_str(row.get("username") or "")
    full_name = safe_str(row.get("full_name") or "")
    idno      = safe_str(row.get("id_no") or row.get("tc") or "")
    ip        = safe_str(row.get("ip") or "")
    ts        = int(row.get("accepted_at") or 0)
    dt_str    = ""
    if ts:
        try:
            dt_str = datetime.fromtimestamp(ts, tz=timezone.utc).astimezone(
                timezone(timedelta(hours=3))
            ).strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            dt_str = ""

    body_txt = row.get("contract_text") or row.get("body") or ""
    body_txt = body_txt.replace("\r", "")

    # ---- font register ----
    # Not: Bu path Ubuntu'da genelde mevcut. Yoksa fallback yapar.
    font_name = "DejaVuSans"
    try:
        pdfmetrics.registerFont(TTFont(font_name, "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
    except Exception:
        # fallback (en azından patlamasın)
        font_name = "Helvetica"

    # ---- pdf build ----
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=18*mm,
        rightMargin=18*mm,
        topMargin=16*mm,
        bottomMargin=16*mm,
        title="Atalay Ulusoy Auto Trade - Sözleşme"
    )

    styles = getSampleStyleSheet()
    base = ParagraphStyle(
        "base",
        parent=styles["Normal"],
        fontName=font_name,
        fontSize=10.5,
        leading=14,
        textColor=colors.black,
    )
    h1 = ParagraphStyle(
        "h1",
        parent=base,
        fontSize=18,
        leading=22,
        spaceAfter=10,
    )
    small = ParagraphStyle(
        "small",
        parent=base,
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#222222"),
    )
    section = ParagraphStyle(
        "section",
        parent=base,
        fontSize=12.5,
        leading=16,
        spaceBefore=10,
        spaceAfter=6,
    )

    def esc(s: str) -> str:
        # reportlab Paragraph xml escape
        return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    story = []

    # Header küçük yazı
    story.append(Paragraph("Atalay Ulusoy Auto Trade", small))
    story.append(Spacer(1, 2*mm))

    # Büyük başlık
    story.append(Paragraph("Atalay Ulusoy Auto Trade — Kullanım ve Risk Sözleşmesi", h1))

    # Alt çizgi (tablo ile çizgi gibi)
    story.append(Table([[""]], colWidths=[170*mm], rowHeights=[0.6*mm],
                      style=[("BACKGROUND", (0,0),(0,0), colors.HexColor("#E5E7EB")),
                             ("LINEBELOW", (0,0),(0,0), 0, colors.white)]))
    story.append(Spacer(1, 6*mm))

    # Bilgi tablosu
    data = [
        ["Kullanıcı Adı", username],
        ["Ad Soyad", full_name],
        ["Kimlik No", idno],
        ["Tarih", dt_str],
        ["IP", ip],
    ]
    t = Table(data, colWidths=[42*mm, 120*mm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0,0), (-1,-1), font_name),
        ("FONTSIZE", (0,0), (-1,-1), 10.5),
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F3F4F6")),
        ("TEXTCOLOR", (0,0), (-1,-1), colors.HexColor("#111827")),
        ("ALIGN", (0,0), (0,-1), "LEFT"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("INNERGRID", (0,0), (-1,-1), 0.6, colors.HexColor("#D1D5DB")),
        ("BOX", (0,0), (-1,-1), 0.6, colors.HexColor("#D1D5DB")),
        ("LEFTPADDING", (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING", (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
    ]))
    story.append(t)
    story.append(Spacer(1, 8*mm))

    # Gövde metin: satır satır Paragraph (TR destekli)
    # Başlık gibi görünen satırlar için basit yakalama
    for raw in body_txt.split("\n"):
        line = raw.rstrip()
        if not line.strip():
            story.append(Spacer(1, 3*mm))
            continue

        # Bölüm başlıkları A. / B. / C. gibi
        if len(line) >= 2 and line[1] == "." and line[0].isalpha():
            story.append(Spacer(1, 2*mm))
            story.append(Paragraph(esc(line), section))
            continue

        story.append(Paragraph(esc(line), base))

    def on_page(c, d):
        # Header sol üst + sayfa sağ üst
        c.saveState()
        c.setFont(font_name if font_name != "Helvetica" else "Helvetica", 9)
        c.setFillColor(colors.HexColor("#111827"))
        c.drawString(18*mm, 286*mm, "Atalay Ulusoy Auto Trade")
        c.drawRightString(210*mm - 18*mm, 286*mm, f"Sayfa {c.getPageNumber()}")
        c.restoreState()

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    return buf.getvalue()


import requests
import time
import urllib.request
import urllib.parse
import base64
import hmac
import urllib.parse
import urllib.request
import os
import json
import time
import sqlite3
import secrets
import hashlib
import threading
import shutil
import ipaddress
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, List

COMMODITY_ALIASES = {
    "XAG": "XAG/USDT",         # Gümüş token (varsa)
    "SILVER": "XAG/USDT",

    "XPD": "XPD/USDT",         # Paladyum token (varsa)
    "PALLADIUM": "XPD/USDT",

    "COPPER": "COPPER/USDT",   # Bakır token (varsa)
    "HG": "COPPER/USDT",
}


from flask import Flask, request, redirect, session, render_template_string, jsonify

def db_conn():
    return db()

# =========================
# Config
# =========================
APP_BRAND = "Atalay Ulusoy Auto Trade"
TAB_TITLE = f"{E_TAB} AU Auto Trade"
trial_banner_html = ""  # safe default (defined later per-user on dashboard)

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8080"))
SESSION_SECRET = os.getenv("SESSION_SECRET", os.getenv("FLASK_SECRET", "change_me_session_secret"))
DB_PATH = os.getenv("DB_PATH", "data.db")

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "").strip()
DRY_RUN_DEFAULT = os.getenv("DRY_RUN", "1").strip().lower() in ("1", "true", "yes", "on")
TP_PCT_DEFAULT = float(os.getenv("TP_PCT", "0.005").strip() or "0.005")  # 0.50%
TP_CHECK_SEC = float(os.getenv("TP_CHECK_SEC", "5").strip() or "5")

DEFAULT_EXCHANGE = os.getenv("DEFAULT_EXCHANGE", "OKX").strip().upper()
DEFAULT_SYMBOL = os.getenv("DEFAULT_SYMBOL", "BTC/USDT").strip().upper()
DEFAULT_USDT = float(os.getenv("DEFAULT_USDT", "10").strip() or "10")

# SELL debounce (aynı saniye BUY->SELL gelirse OKX bakiye/pozisyon senkronu için kısa bekleme)
SELL_DEBOUNCE_SEC = float(os.getenv("SELL_DEBOUNCE_SEC", "2.0").strip() or "2.0")
_LAST_BUY_TS: Dict[str, float] = {}

# =========================
# AUTO SELL DEFER (server-side)
# =========================
# Trend güçlü ise: Gate ON + SELL DEFER
# Trend zayıf / yatay ise: SELL INSTANT
#
# Notlar:
# - UI/CSS/HTML'e dokunmaz.
# - Webhook yanıtını geciktirmemek için SELL bekletme işi arka planda thread ile yürür.
AUTO_SELL_DEFER_ENABLED = (os.getenv("AUTO_SELL_DEFER_ENABLED", "1").strip().lower() in ("1", "true", "yes", "on"))
AUTO_SELL_DEFER_CHECK_SEC = float(os.getenv("AUTO_SELL_DEFER_CHECK_SEC", "10").strip() or "10")

# Maksimum bekleme süreleri (saniye)
AUTO_SELL_DEFER_MAX_SEC_NORMAL = int(os.getenv("AUTO_SELL_DEFER_MAX_SEC_NORMAL", "300").strip() or "300")   # 5 dk
AUTO_SELL_DEFER_MAX_SEC_AGGR   = int(os.getenv("AUTO_SELL_DEFER_MAX_SEC_AGGR", "180").strip() or "180")     # 3 dk
AUTO_SELL_DEFER_MAX_SEC_HARD   = int(os.getenv("AUTO_SELL_DEFER_MAX_SEC_HARD", "120").strip() or "120")     # 2 dk

_DEFERRED_SELLS_LOCK = threading.Lock()
_DEFERRED_SELLS: Dict[str, Dict[str, Any]] = {}

USDT_TRY_RATE = float(os.getenv("USDT_TRY_RATE", "33.0").strip() or "33.0")
TZ_OFFSET_HOURS = int(os.getenv("TZ_OFFSET_HOURS", "3").strip() or "3")

# =========================
# Contract (Sözleşme)
# =========================
# Not: UI/CSS'e dokunmadan sadece içerik ve admin yönetimi eklendi.
CONTRACT_VERSION = "2026-01-08"
CONTRACT_TITLE = "Sözleşme Onayı"

CONTRACT_BODY_TEMPLATE = """A. Taraflar

Hizmet Sağlayıcı:
Atalay Ulusoy
(\"Hizmet Sağlayıcı\" olarak anılacaktır.)

Hizmet Alan (Kullanıcı):
Ad Soyad: {full_name}
Kullanıcı Adı: {username}
Kimlik No: {tc}

B. Hizmet Kapsamı

1) Sunulan hizmet bir yazılım hizmetidir. Yatırım danışmanlığı değildir.
2) Sistem; otomatik alım–satım işlemleri, manuel onaylı işlemler ve teknik işlem otomasyonu sağlayabilir.
3) Borsa, ağ, internet ve üçüncü taraf servislerdeki kesinti veya gecikmeler hizmeti etkileyebilir.

C. Risk Bildirimi

1) Kripto ve benzeri piyasalarda işlem yapmak yüksek risk içerir.
2) Kullanıcı, sermayesinin tamamını kaybedebileceğini kabul eder.
3) Açılan tüm işlemler Kullanıcı sorumluluğundadır.

D. Sorumluluk Reddi ve Sınırlar

1) Hizmet Sağlayıcı; zarar, kayıp, komisyon, slipaj, borsa kaynaklı gecikme ve hatalardan sorumlu tutulamaz.
2) Sistem hiçbir koşulda kesin kazanç, kâr veya gelir garantisi vermez.
3) Kullanıcı; API anahtarlarını gizli tutmaktan ve hesabının güvenliğinden sorumludur.
4) Kullanıcı, emirlerin borsa kuralları ve minimum miktarlar nedeniyle kısmen veya tamamen gerçekleşmeyebileceğini kabul eder.
5) Hizmet Sağlayıcı, dolaylı zararlar ve mahrum kalınan kâr gibi taleplerden sorumlu tutulamaz.

E. Veri Gizliliği ve Güvenlik

1) Sözleşme kayıtları; kullanıcı adı, ad soyad, kimlik no (opsiyonel), tarih ve IP bilgisiyle sunucuda saklanır.
2) Kullanıcı bilgileri üçüncü kişilerle paylaşılmaz; yasal zorunluluklar saklıdır.
3) Erişim ve işlem kayıtları güvenlik amaçlı loglanabilir.

F. Hizmet Kullanımı ve Kullanıcı Yükümlülükleri

1) Kullanıcı, kendi borsa hesabının ve internet bağlantısının çalışır durumda olmasından sorumludur.
2) Kullanıcı, hesabına tanımladığı API anahtarlarının yetkilerini kendi tercihleriyle belirler.
3) Kullanıcı, şifre ve erişim bilgilerini üçüncü kişilerle paylaşamaz.
4) Kullanıcı, sistemi hukuka aykırı amaçla kullanamaz.

G. Ücretlendirme ve Paketler

1) Hizmet, seçilen pakete göre kullanım limiti ile sunulabilir.
2) Borsa komisyonları, fonlama, spread ve benzeri maliyetler paket ücretine dahil değildir.
3) Ödemeler ve paket koşulları, Admin Panel'de belirtilen paket tanımlarına göre uygulanır.

H. Destek ve İletişim

1) Destek, en iyi gayret esasına göre sağlanır.
2) Bildirim ve duyurular; uygulama içi bildirimler ve Telegram mesajları ile yapılabilir.

I. Güncellemeler ve Değişiklikler

1) Hizmet Sağlayıcı, sistemin güvenlik ve kararlılığı için güncelleme yapabilir.
2) Güncellemeler; arayüz, akış ve özelliklerde iyileştirme içerebilir.
3) Kritik değişiklikler mümkün olduğunda önceden duyurulabilir.

J. Fesih

1) Hizmet Sağlayıcı; kötüye kullanım, güvenlik riski veya sözleşme ihlali durumlarında tek taraflı fesih hakkını saklı tutar.
2) Kullanıcı, hesabını kapatmayı talep edebilir.
3) Fesih halinde, devam eden işlemler ve borsa kaynaklı sonuçlar Kullanıcı sorumluluğundadır.

K. Fikri Mülkiyet

1) Yazılımın tüm hakları Hizmet Sağlayıcı'ya aittir.
2) Kullanıcı, yazılımı kopyalayamaz, çoğaltamaz, tersine mühendislik yapamaz.

L. Yetkili Mahkeme ve Yürürlük

1) İşbu sözleşmeden doğabilecek uyuşmazlıklarda Türkiye Cumhuriyeti Mahkemeleri ve İcra Daireleri yetkilidir.
2) Bu sözleşme, Kullanıcı'nın dijital ortamda onay vermesiyle yürürlüğe girer.

Kullanıcı Beyanı:
Ad Soyad: {full_name}
Tarih: {accepted_at}
IP Adresi: {ip}
İmza (Dijital Onay): {sig}

Bu belge dijital ortamda onaylanmıştır.
"""

def build_contract_text(full_name: str, username: str, tc: str, accepted_at: str, ip: str) -> str:
    full_name = safe_str(full_name)
    username = safe_str(username)
    tc = safe_str(tc)
    ip = safe_str(ip)
    sig = E_OK  # dijital onay
    return CONTRACT_BODY_TEMPLATE.format(
        full_name=full_name,
        username=username,
        tc=(tc if tc else ""),
        accepted_at=accepted_at,
        ip=ip,
        sig=sig
    )

def user_contract_accepted(u: dict) -> bool:
    try:
        if not u:
            return False
        if not isinstance(u, dict):
            u = dict(u)
        return int(u.get("contract_accepted_at") or 0) > 0
    except Exception:
        return False

def contract_pdf_bytes(contract: dict) -> bytes:
    """Render a contract PDF in the exact look/style used in the sample (header, page no, title, fields, body)."""
    try:
        from io import BytesIO
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import mm
    except Exception:
        # reportlab missing -> fallback to plain text bytes
        return safe_str(contract.get("body") or "").encode("utf-8")

    brand = APP_BRAND
    title = f"{APP_BRAND} — Kullanım ve Risk Sözleşmesi"

    username = safe_str(contract.get("username") or "")
    full_name = safe_str(contract.get("full_name") or "")
    tc = safe_str(contract.get("tc") or "")
    ip = safe_str(contract.get("ip") or "")
    ts = int(contract.get("accepted_at") or 0)

    dt_local = (datetime.utcfromtimestamp(ts) + timedelta(hours=TZ_OFFSET_HOURS)) if ts > 0 else (datetime.utcnow() + timedelta(hours=TZ_OFFSET_HOURS))
    dt_str = dt_local.strftime("%Y-%m-%d %H:%M:%S")

    body_txt = safe_str(contract.get("body") or "").strip()

    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4

    # Layout constants (close to sample)
    left = 20 * mm
    right = 20 * mm
    top = 18 * mm
    bottom = 18 * mm

    def draw_header(page_no: int):
        c.setFont("Helvetica", 10)
        c.drawString(left, h - top, brand)
        c.drawRightString(w - right, h - top, f"Sayfa {page_no}")
        c.setFont("Helvetica-Bold", 12)
        c.drawString(left, h - top - 16, title)
        c.setFont("Helvetica", 10)
        c.drawString(left, h - top - 34, brand)

    # Prepare lines: keep original line breaks but wrap long lines
    max_width = w - left - right
    font_name = "Helvetica"
    font_size = 10
    line_h = 14

    def wrap_line(text: str) -> list:
        text = safe_str(text)
        if not text:
            return [""]
        words = text.split(" ")
        out = []
        cur = ""
        for wd in words:
            trial = (cur + " " + wd).strip()
            if c.stringWidth(trial, font_name, font_size) <= max_width:
                cur = trial
            else:
                if cur:
                    out.append(cur)
                    cur = wd
                else:
                    # single very long token
                    out.append(trial)
                    cur = ""
        if cur or not out:
            out.append(cur)
        return out

    # Compose header fields block (like sample)
    fields = [
        f"Kullanıcı Adı {username}",
        f"Ad Soyad {full_name}",
        f"Kimlik No {tc}",
        f"Tarih {dt_str}",
        f"IP {ip}",
        "",
    ]

    # Body with sections
    raw_lines = body_txt.splitlines()
    lines = []
    for l in fields + raw_lines:
        if l.strip() == "":
            lines.append(" ")  # blank spacer
            continue
        lines.extend(wrap_line(l))

    page_no = 1
    draw_header(page_no)

    y = h - top - 58
    c.setFont(font_name, font_size)

    for ln in lines:
        if y <= bottom:
            c.showPage()
            page_no += 1
            draw_header(page_no)
            c.setFont(font_name, font_size)
            y = h - top - 58
        c.drawString(left, y, ln)
        y -= line_h

    c.save()
    return buf.getvalue()

TELEGRAM_TOKEN = (os.getenv("TELEGRAM_BOT_TOKEN", "") or os.getenv("TELEGRAM_TOKEN", "")).strip()
TELEGRAM_CHAT_ID_FALLBACK = os.getenv("TELEGRAM_CHAT_ID", "").strip()
TELEGRAM_GROUP_ID = os.getenv("TELEGRAM_GROUP_ID", "").strip()
TELEGRAM_GROUP_THREAD_ID = os.getenv("TELEGRAM_GROUP_THREAD_ID", "").strip()


PACKAGES = [
    {"name": "Basic", "price_try": 7500, "limit": 300},
    {"name": "Pro", "price_try": 15000, "limit": 600},
    {"name": "Ultra", "price_try": 40000, "limit": -1},  # -1 = unlimited
]

EXCHANGES = [
    ("OKX", "OKX"),
    ("BINANCE", "Binance"),
    ("BYBIT", "Bybit"),
    ("GATEIO", "Gateio"),
]

# =========================
# Flask
# =========================
app = Flask(__name__)
app.secret_key = SESSION_SECRET
@app.get("/api/signals/pending")
def api_signals_pending_list():
    # UI bekliyor, demo icin bos donuyoruz
    return jsonify([])
@app.get("/api/signals/history")
def api_signals_history():
    # UI bu endpointi istiyor, şimdilik boş liste dönelim
    return jsonify({"signals": []})

@app.get("/api/positions/open")
def api_positions_open_list():
    # UI bekliyor, demo icin bos donuyoruz
    return jsonify([])

# --- QUICK HEALTH + ALIAS ENDPOINTS (UI compatibility) ---

@app.get("/api/health")
def api_health():
    return jsonify({"ok": True})

@app.get("/api/coins")
def api_coins_alias():
    # UI /api/coins çağırıyor
    try:
        return api_public_coins()
    except Exception:
        pass
    try:
        return api_symbols()
    except Exception:
        pass
    return jsonify({"coins": []})
@app.get("/api/public/coins")
def api_public_coins():
    """Public coin list used by the React UI.

    Response shape:
      {"coins": [{"symbol":"BTC/USDT"}, ...], "source": "okx", "cached": true/false}

    Notes:
    - Always returns JSON
    - Uses in-memory cache to avoid frequent exchange calls
    """
    try:
        return jsonify(_public_coins_cached())
    except Exception:
        # absolute fallback (UI never empty)
        fallback = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "BNB/USDT"]
        return jsonify({"coins": [{"symbol": s} for s in fallback], "source": "fallback", "cached": False})


# ----- Public coins cache (OKX spot USDT) -----
_PUBLIC_COINS_CACHE = {"ts": 0, "data": None}

def _public_coins_cached(ttl_seconds: int = 600):
    now = int(time.time())
    ts = int(_PUBLIC_COINS_CACHE.get("ts") or 0)
    data = _PUBLIC_COINS_CACHE.get("data")

    if data and (now - ts) < int(ttl_seconds):
        return {**data, "cached": True}

    coins = []
    source = "okx"
    try:
        import ccxt
        ex = ccxt.okx({"enableRateLimit": True, "timeout": 15000})
        markets = ex.load_markets()
        for sym, m in (markets or {}).items():
            try:
                if not m.get("active", True):
                    continue
                if not m.get("spot"):
                    continue
                if m.get("quote") != "USDT":
                    continue
                if isinstance(sym, str) and "/" in sym:
                    coins.append(sym)
            except Exception:
                continue
        coins = sorted(set(coins))
    except Exception:
        source = "fallback"

    if not coins:
        coins = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "BNB/USDT"]

    payload = {"coins": [{"symbol": s} for s in coins], "source": source, "cached": False}
    _PUBLIC_COINS_CACHE["ts"] = now
    _PUBLIC_COINS_CACHE["data"] = payload
    return payload


@app.get("/api/public/ohlc")
def api_public_ohlc():
    """Public OHLC endpoint for charts.

    Query:
      symbol=BTC/USDT
      tf=1m|5m|15m|30m|1h|4h|1d
      limit=1..300

    Response:
      {"symbol":"BTC/USDT", "tf":"5m", "candles": [[ts_ms, o,h,l,c,v], ...]}
    """
    symbol = (request.args.get("symbol") or "").strip()
    tf = (request.args.get("tf") or "1m").strip().lower()
    try:
        limit = int(request.args.get("limit") or 300)
    except Exception:
        limit = 300

    if not symbol:
        return jsonify({"error": "symbol missing"}), 400

    # normalize limit
    limit = max(1, min(300, limit))

    try:
        data = fetch_ohlc(symbol, tf, limit)
        # safety: always include candles
        candles = data.get("candles") if isinstance(data, dict) else None
        if not isinstance(candles, list):
            data = {"symbol": symbol, "tf": tf, "candles": []}
        return jsonify(data)
    except Exception as e:
        return jsonify({"symbol": symbol, "tf": tf, "candles": [], "error": "ohlc_fetch_failed"}), 500

# =========================
# DEMO (Paper Trading) Engine - Supabase yok
# =========================
import threading
import time
from datetime import datetime

DEMO_LOCK = threading.Lock()
DEMO_STARTED = False

# user_id -> {"balance_usdt": float, "positions": [..], "auto_configs":[..]}
DEMO_STATE = {}

def _demo_get_user_id():
    # login yoksa bile demo çalışsın diye fallback
    try:
        if "user_id" in request.args:
            return str(request.args.get("user_id") or "demo")
        j = request.get_json(silent=True) or {}
        if "user_id" in j:
            return str(j.get("user_id") or "demo")
    except Exception:
        pass
    return "demo"

def _demo_ensure_user(uid: str):
    with DEMO_LOCK:
        if uid not in DEMO_STATE:
            DEMO_STATE[uid] = {
                "balance_usdt": 1000.0,
                "positions": [],
                "auto_configs": []
            }
        return DEMO_STATE[uid]

def _demo_fetch_price(symbol: str) -> float:
    # CCXT OKX public ticker
    import ccxt
    ex = ccxt.okx({"enableRateLimit": True, "timeout": 15000})
    t = ex.fetch_ticker(symbol)
    p = t.get("last") or t.get("close") or 0
    try:
        return float(p)
    except Exception:
        return 0.0

def _demo_now_iso():
    try:
        return datetime.utcnow().isoformat() + "Z"
    except Exception:
        return ""

def _demo_buy(uid: str, symbol: str, amount_usdt: float):
    amount_usdt = float(amount_usdt or 0)
    if amount_usdt <= 0:
        return {"ok": False, "error": "Geçersiz miktar"}

    user = _demo_ensure_user(uid)
    price = _demo_fetch_price(symbol)
    if price <= 0:
        return {"ok": False, "error": "Fiyat alınamadı"}

    qty = amount_usdt / price
    if qty <= 0:
        return {"ok": False, "error": "Miktar çok küçük"}

    with DEMO_LOCK:
        bal = float(user.get("balance_usdt") or 0)
        if amount_usdt > bal:
            return {"ok": False, "error": "Bakiye yetersiz"}

        user["balance_usdt"] = bal - amount_usdt

        pos = {
            "id": f"demo_{int(time.time()*1000)}",
            "symbol": symbol,
            "side": "BUY",
            "amount_usdt": amount_usdt,
            "qty": qty,
            "entry_price": price,
            "target_price": price * 1.005,  # %0.50 hedef
            "status": "OPEN",
            "opened_at": _demo_now_iso(),
            "closed_at": None,
            "exit_price": None,
            "pnl_usdt": None
        }
        user["positions"].insert(0, pos)

    return {"ok": True, "position": pos}

def _demo_try_sell(uid: str, pos: dict):
    symbol = pos.get("symbol")
    price = _demo_fetch_price(symbol)
    if price <= 0:
        return False

    target = float(pos.get("target_price") or 0)
    if target > 0 and price < target:
        return False

    qty = float(pos.get("qty") or 0)
    if qty <= 0:
        return False

    proceeds = qty * price
    entry_amount = float(pos.get("amount_usdt") or 0)
    pnl = proceeds - entry_amount

    with DEMO_LOCK:
        user = _demo_ensure_user(uid)
        user["balance_usdt"] = float(user.get("balance_usdt") or 0) + proceeds

        pos["status"] = "CLOSED"
        pos["closed_at"] = _demo_now_iso()
        pos["exit_price"] = price
        pos["pnl_usdt"] = pnl

    return True

def _demo_worker_loop():
    while True:
        try:
            time.sleep(3)
            with DEMO_LOCK:
                snapshot = [(uid, list(DEMO_STATE.get(uid, {}).get("positions", []))) for uid in DEMO_STATE.keys()]
            for uid, positions in snapshot:
                for pos in positions:
                    if pos.get("status") != "OPEN":
                        continue
                    _demo_try_sell(uid, pos)
        except Exception:
            time.sleep(2)

DEMO_STARTED = False

@app.before_request
def _demo_start_once():
    global DEMO_STARTED
    if DEMO_STARTED:
        return
    DEMO_STARTED = True
    t = threading.Thread(target=_demo_worker_loop, daemon=True)
    t.start()

@app.get("/api/demo/balance")
def api_demo_balance():
    uid = _demo_get_user_id()
    user = _demo_ensure_user(uid)
    with DEMO_LOCK:
        return jsonify({"user_id": uid, "balance_usdt": float(user.get("balance_usdt") or 0)})

@app.post("/api/demo/reset")
def api_demo_reset():
    uid = _demo_get_user_id()
    j = request.get_json(silent=True) or {}
    new_bal = j.get("balance_usdt", 1000.0)
    try:
        new_bal = float(new_bal)
    except Exception:
        new_bal = 1000.0

    user = _demo_ensure_user(uid)
    with DEMO_LOCK:
        user["balance_usdt"] = max(0.0, new_bal)
        user["positions"] = []
        user["auto_configs"] = []
    return jsonify({"ok": True, "user_id": uid, "balance_usdt": float(user.get("balance_usdt") or 0)})

@app.get("/api/demo/positions")
def api_demo_positions():
    uid = _demo_get_user_id()
    user = _demo_ensure_user(uid)
    with DEMO_LOCK:
        return jsonify({"user_id": uid, "positions": user.get("positions", [])})

@app.post("/api/demo/auto")
def api_demo_auto_add():
    uid = _demo_get_user_id()
    j = request.get_json(silent=True) or {}
    symbol = str(j.get("symbol") or "").strip()
    amount_usdt = j.get("amount_usdt", 0)

    if not symbol:
        return jsonify({"ok": False, "error": "Symbol boş"}), 400

    try:
        amount_usdt = float(amount_usdt)
    except Exception:
        amount_usdt = 0

    r = _demo_buy(uid, symbol, amount_usdt)
    if not r.get("ok"):
        return jsonify(r), 400

    return jsonify(r)


# -------------------------
# DEMO: Manual trade + Auto Rules CRUD (UI kontrol paneli)
# -------------------------

def _demo_find_open_positions(user: dict, symbol: str = ""):
    out = []
    for pos in (user.get("positions") or []):
        if pos.get("status") != "OPEN":
            continue
        if symbol and pos.get("symbol") != symbol:
            continue
        out.append(pos)
    return out

@app.post("/api/demo/trade")
def api_demo_trade():
    """Demo manual trade.

    BUY: opens a position using amount_usdt
    SELL: sells ALL open positions for symbol (project rule: sell all base)

    Body:
      {"user_id":"...","symbol":"BTC/USDT","side":"BUY|SELL","amount_usdt":123}
    """
    uid = _demo_get_user_id()
    j = request.get_json(silent=True) or {}
    symbol = str(j.get("symbol") or "").strip()
    side = str(j.get("side") or "").strip().upper()
    amount_usdt = j.get("amount_usdt", 0)

    if not symbol:
        return jsonify({"ok": False, "error": "Symbol boş"}), 400
    if side not in ("BUY", "SELL"):
        return jsonify({"ok": False, "error": "Side geçersiz"}), 400

    if side == "BUY":
        try:
            amount_usdt = float(amount_usdt)
        except Exception:
            amount_usdt = 0
        r = _demo_buy(uid, symbol, amount_usdt)
        if not r.get("ok"):
            return jsonify(r), 400
        return jsonify(r)

    # SELL: close all open positions for symbol immediately
    user = _demo_ensure_user(uid)
    open_positions = _demo_find_open_positions(user, symbol)
    if not open_positions:
        return jsonify({"ok": False, "error": "Açık pozisyon yok"}), 400

    sold = []
    for pos in list(open_positions):
        try:
            price = _demo_fetch_price(symbol)
            qty = float(pos.get("qty") or 0)
            if price <= 0 or qty <= 0:
                continue
            proceeds = qty * price
            entry_amount = float(pos.get("amount_usdt") or 0)
            pnl = proceeds - entry_amount
            with DEMO_LOCK:
                user["balance_usdt"] = float(user.get("balance_usdt") or 0) + proceeds
                pos["status"] = "CLOSED"
                pos["closed_at"] = _demo_now_iso()
                pos["exit_price"] = price
                pos["pnl_usdt"] = pnl
            sold.append(pos)
        except Exception:
            continue

    if not sold:
        return jsonify({"ok": False, "error": "Satış yapılamadı"}), 400

    return jsonify({"ok": True, "sold": sold})


@app.get("/api/demo/auto_rules")
def api_demo_auto_rules_list():
    uid = _demo_get_user_id()
    user = _demo_ensure_user(uid)
    with DEMO_LOCK:
        return jsonify({"ok": True, "user_id": uid, "rules": list(user.get("auto_configs") or [])})

@app.post("/api/demo/auto_rules")
def api_demo_auto_rules_add():
    uid = _demo_get_user_id()
    j = request.get_json(silent=True) or {}
    symbol = str(j.get("symbol") or "").strip()
    try:
        amount_usdt = float(j.get("amount_usdt") or 0)
    except Exception:
        amount_usdt = 0
    enabled = bool(j.get("enabled", True))

    if not symbol:
        return jsonify({"ok": False, "error": "Symbol boş"}), 400
    if amount_usdt <= 0:
        return jsonify({"ok": False, "error": "Geçersiz miktar"}), 400

    user = _demo_ensure_user(uid)
    rule = {
        "id": f"rule_{int(time.time()*1000)}",
        "symbol": symbol,
        "amount_usdt": amount_usdt,
        "enabled": enabled,
        "created_at": _demo_now_iso(),
        "updated_at": _demo_now_iso(),
    }
    with DEMO_LOCK:
        user.setdefault("auto_configs", []).insert(0, rule)

    return jsonify({"ok": True, "rule": rule})

@app.patch("/api/demo/auto_rules/<rule_id>")
def api_demo_auto_rules_update(rule_id: str):
    uid = _demo_get_user_id()
    j = request.get_json(silent=True) or {}
    user = _demo_ensure_user(uid)

    with DEMO_LOCK:
        rules = user.get("auto_configs") or []
        for r in rules:
            if str(r.get("id")) == str(rule_id):
                if "symbol" in j:
                    r["symbol"] = str(j.get("symbol") or r.get("symbol") or "").strip()
                if "amount_usdt" in j:
                    try:
                        r["amount_usdt"] = float(j.get("amount_usdt") or r.get("amount_usdt") or 0)
                    except Exception:
                        pass
                if "enabled" in j:
                    r["enabled"] = bool(j.get("enabled"))
                r["updated_at"] = _demo_now_iso()
                return jsonify({"ok": True, "rule": r})

    return jsonify({"ok": False, "error": "Rule bulunamadı"}), 404

@app.delete("/api/demo/auto_rules/<rule_id>")
def api_demo_auto_rules_delete(rule_id: str):
    uid = _demo_get_user_id()
    user = _demo_ensure_user(uid)
    with DEMO_LOCK:
        rules = list(user.get("auto_configs") or [])
        new_rules = [r for r in rules if str(r.get("id")) != str(rule_id)]
        user["auto_configs"] = new_rules
    return jsonify({"ok": True})
# =========================
# DEMO Engine END
# =========================

def fetch_ohlc(symbol: str, tf: str, limit: int):
    import ccxt

    ex = ccxt.okx({"enableRateLimit": True, "timeout": 15000})

    tf_map = {
        "1m": "1m", "3m": "3m", "5m": "5m", "15m": "15m", "30m": "30m",
        "1h": "1h", "2h": "2h", "4h": "4h", "6h": "6h", "12h": "12h",
        "1d": "1d",
    }
    ccxt_tf = tf_map.get(tf, "1m")

    if limit < 1:
        limit = 1
    if limit > 300:
        limit = 300

    ohlcv = ex.fetch_ohlcv(symbol, timeframe=ccxt_tf, limit=limit)
    return {"symbol": symbol, "tf": tf, "candles": ohlcv}

import traceback
from flask import Response


@app.post("/admin/users/<username>/extend")
def admin_extend_user(username: str):
    rr = require_admin()
    if rr:
        return rr
    username = safe_str(username)

    try:
        days = int(safe_str(request.form.get("days") or "0"))
    except Exception:
        days = 0
    days = max(0, min(365, days))
    if days <= 0:
        return redirect(f"/admin/users/{username}")

    conn = db()
    try:
        row = conn.execute("SELECT expires_at FROM users WHERE username=?", (username,)).fetchone()
        if not row:
            return redirect("/admin")
        old_exp = int(row["expires_at"] or 0)
        base = old_exp if old_exp > now_ts() else now_ts()
        new_exp = base + int(days * 24 * 3600)
        conn.execute("UPDATE users SET expires_at=? WHERE username=?", (new_exp, username))
        conn.commit()
    finally:
        conn.close()

    try:
        log_line("admin", "INFO", f"EXTEND: {username} +{days} gün")
    except Exception:
        pass
    return redirect(f"/admin/users/{username}")

    from werkzeug.exceptions import HTTPException

from werkzeug.exceptions import HTTPException
import traceback

@app.errorhandler(Exception)
def handle_error(e):
    # HTTP hataları (404, 401 vs) gerçek koduyla dönsün
    if isinstance(e, HTTPException):
        return jsonify({"error": e.description}), e.code

    # Diğer hataları log'a bas (traceback)
    app.logger.error("Unhandled exception: %s\n%s", str(e), traceback.format_exc())

    # Kullanıcıya sade 500 dön
    return jsonify({"error": "internal server error"}), 500

# =========================
# Helpers
# =========================
def http_get_json(url: str, headers: dict) -> dict:
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req, timeout=15) as resp:
        raw = resp.read().decode("utf-8", errors="ignore")
    try:
        return json.loads(raw)
    except Exception:
        return {"_raw": raw}

def _to_float(x, default=0.0) -> float:
    try:
        if x is None:
            return float(default)
        return float(x)
    except Exception:
        return float(default)

def safe_str(s: Any) -> str:
    return ("" if s is None else str(s)).strip()

def normalize_symbol(sym: str) -> str:
    s = safe_str(sym).strip().upper().replace(" ", "")
    if not s:
        return s
    if s in COMMODITY_ALIASES:
        return COMMODITY_ALIASES[s]
    return s


def fmt_ts(ts: Any) -> str:
    """Unix timestamp (seconds or ms) -> 'YYYY-MM-DD HH:MM:SS' in TR (+03:00)."""
    try:
        if ts is None:
            return "-"
        ts_int = int(float(ts))
    except Exception:
        return "-"
    if ts_int <= 0:
        return "-"
    # ms -> seconds
    if ts_int > 10**12:
        ts_int = int(ts_int / 1000)
    try:
        dt = datetime.fromtimestamp(ts_int, tz=timezone.utc).astimezone(timezone(timedelta(hours=3)))
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return "-"


def html_escape(s: str) -> str:
    s = "" if s is None else str(s)
    return (s.replace("&", "&amp;")
              .replace("<", "&lt;")
              .replace(">", "&gt;")
              .replace('"', "&quot;")
              .replace("'", "&#39;"))

# =========================
# App settings (global)
# =========================
def get_app_setting(key: str, default: str = "") -> str:
    k = safe_str(key)
    if not k:
        return safe_str(default)
    conn = db()
    try:
        row = conn.execute("SELECT value FROM app_settings WHERE key=?", (k,)).fetchone()
        if not row:
            return safe_str(default)
        try:
            return safe_str(row["value"])
        except Exception:
            return safe_str(row[0])
    except Exception:
        return safe_str(default)
    finally:
        try:
            conn.close()
        except Exception:
            pass

def set_app_setting(key: str, value: str) -> None:
    k = safe_str(key)
    if not k:
        return
    v = safe_str(value)
    conn = db()
    try:
        conn.execute(
            "INSERT INTO app_settings(key,value,updated_at) VALUES (?,?,?) "
            "ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
            (k, v, now_ts()),
        )
        conn.commit()
    finally:
        try:
            conn.close()
        except Exception:
            pass

def get_global_auto_mode() -> str:
    mode = get_app_setting("AUTO_MODE", os.getenv("AUTO_MODE", "NORMAL"))
    mode = safe_str(mode).upper() or "NORMAL"
    if mode not in ("NORMAL", "AGGRESSIVE", "HARD"):
        mode = "NORMAL"
    return mode



def normalize_symbol(sym: str) -> str:
    """Normalize symbols to the canonical form used throughout the app: e.g. BTC/USDT.
    Accepts forms like 'OKX:BTCUSDT', 'BTCUSDT', 'BTC-USDT', 'btc/usdt'.
    """
    s = safe_str(sym).upper()
    if not s:
        return ""
    # Handle 'OKX:BTCUSDT' style
    if ":" in s:
        s = s.split(":", 1)[1].strip()
    s = s.replace("-", "/").replace(" ", "")
    if "/" in s:
        base, quote = s.split("/", 1)
        if quote == "":
            return s
        return f"{base}/{quote}"
    # No slash: try to infer USDT quote
    if s.endswith("USDT") and len(s) > 4:
        return f"{s[:-4]}/USDT"
    return s


def is_trial_user(u: Dict[str, Any]) -> bool:
    """Trial/deneme paketlerini güvenli şekilde yakala."""
    try:
        pkg = safe_str(u.get("package_name", "")).strip().lower()
    except Exception:
        pkg = ""
    # Yaygın isimler: trial, deneme, demo
    if pkg in ("trial", "deneme", "demo"):
        return True
    if "trial" in pkg or "deneme" in pkg or "demo" in pkg:
        return True
    # Bazı kurulumlarda ayrı alan kullanılabiliyor
    try:
        if int(u.get("is_trial") or 0) == 1:
            return True
    except Exception:
        pass
    return False


def is_real_trial_user(u: Dict[str, Any]) -> bool:
    """1 Gün LIVE Trial aktif mi?"""
    if not is_trial_user(u):
        return False
    try:
        if int((u.get("trial_real_enabled") or 0)) != 1:
            return False
    except Exception:
        return False
    try:
        exp = int(u.get("trial_expires_at") or 0)
    except Exception:
        exp = 0
    if exp <= 0:
        return False
    return now_ts() < exp

def enforce_trial_expiry(username: str, u: Dict[str, Any]) -> Dict[str, Any]:
    """1 günlük LIVE trial bittiyse otomatik trade kapat."""
    try:
        tre = int((u.get("trial_real_enabled") or 0))
        exp = int(u.get("trial_expires_at") or 0)
    except Exception:
        tre, exp = 0, 0
    if tre == 1 and exp > 0 and now_ts() >= exp:
        conn = db()
        try:
            conn.execute(
                "UPDATE users SET trade_enabled=0, force_dry_run=1, trial_real_enabled=0 WHERE username=?",
                (username,),
            )
            conn.commit()
        finally:
            conn.close()
        try:
            u["trade_enabled"] = 0
            u["force_dry_run"] = 1
            u["trial_real_enabled"] = 0
        except Exception:
            pass
        set_last_msg(username, f"{E_STOP} Trial süresi bitti • Trade kapandı")
    return u


def canon_symbol(sym: str) -> str:
    """
    Canonicalize symbols to 'BASE/QUOTE' (e.g., BTC/USDT).
    Accepts BTCUSDT, BTC-USDT, btc/usdt, etc.
    """
    s = safe_str(sym).strip().upper()
    if not s:
        return s
    s = s.replace(" ", "")
    s = s.replace("-", "/")
    if "/" not in s and s.endswith("USDT") and len(s) > 4:
        s = s[:-4] + "/USDT"
    return s

# =========================
# Balance APIs (Binance/Bybit/Gate/OKX)
# =========================
def binance_get_usdt_balance(api_key: str, api_secret: str) -> float:
    if not api_key or not api_secret:
        return 0.0
    base = "https://api.binance.com"
    ts = int(time.time() * 1000)
    qs = f"recvWindow=5000&timestamp={ts}"
    sig = hmac.new(api_secret.encode(), qs.encode(), hashlib.sha256).hexdigest()
    url = f"{base}/api/v3/account?{qs}&signature={sig}"
    j = http_get_json(url, {"X-MBX-APIKEY": api_key})
    bals = j.get("balances") or []
    for b in bals:
        if (b.get("asset") or "").upper() == "USDT":
            return _to_float(b.get("free"), 0) + _to_float(b.get("locked"), 0)
    return 0.0

def bybit_get_usdt_balance(api_key: str, api_secret: str) -> float:
    if not api_key or not api_secret:
        return 0.0
    base = "https://api.bybit.com"
    path = "/v5/account/wallet-balance"
    recv = "5000"
    ts = str(int(time.time() * 1000))
    qs = "accountType=UNIFIED"
    prehash = ts + api_key + recv + qs
    sign = hmac.new(api_secret.encode(), prehash.encode(), hashlib.sha256).hexdigest()
    url = f"{base}{path}?{qs}"
    headers = {
        "X-BAPI-API-KEY": api_key,
        "X-BAPI-TIMESTAMP": ts,
        "X-BAPI-RECV-WINDOW": recv,
        "X-BAPI-SIGN": sign,
    }
    j = http_get_json(url, headers)
    result = (j.get("result") or {})
    lst = result.get("list") or []
    for acc in lst:
        coins = acc.get("coin") or []
        for c in coins:
            if (c.get("coin") or "").upper() == "USDT":
                v = c.get("walletBalance")
                if v is None:
                    v = c.get("availableToWithdraw")
                if v is None:
                    v = c.get("equity")
                return _to_float(v, 0.0)
    return 0.0

def gateio_get_usdt_balance(api_key: str, api_secret: str) -> float:
    if not api_key or not api_secret:
        return 0.0
    base = "https://api.gateio.ws"
    path = "/api/v4/spot/accounts"
    method = "GET"
    query = ""
    body = ""
    ts = str(int(time.time()))
    body_hash = hashlib.sha512(body.encode()).hexdigest()
    prehash = method + "\n" + path + "\n" + query + "\n" + body_hash + "\n" + ts
    sign = hmac.new(api_secret.encode(), prehash.encode(), hashlib.sha512).hexdigest()
    url = f"{base}{path}"
    headers = {"KEY": api_key, "Timestamp": ts, "SIGN": sign}
    j = http_get_json(url, headers)
    if isinstance(j, list):
        for row in j:
            if (row.get("currency") or "").upper() == "USDT":
                return _to_float(row.get("available"), 0) + _to_float(row.get("locked"), 0)
    return 0.0

def okx_get_usdt_balance(api_key: str, api_secret: str, api_passphrase: str) -> float:
    """
    OKX v5 account balance (USDT).
    Hata olursa 0.0 döner, UI asla çökmez.
    """
    if not api_key or not api_secret or not api_passphrase:
        return 0.0
    try:
        import requests
        base = "https://www.okx.com"
        path = "/api/v5/account/balance"
        query = "ccy=USDT"
        url = f"{base}{path}?{query}"
        ts = datetime.utcnow().isoformat(timespec="milliseconds") + "Z"
        method = "GET"
        body = ""
        prehash = ts + method + path + "?" + query + body
        sign = base64.b64encode(hmac.new(api_secret.encode(), prehash.encode(), hashlib.sha256).digest()).decode()
        headers = {
            "OK-ACCESS-KEY": api_key,
            "OK-ACCESS-SIGN": sign,
            "OK-ACCESS-TIMESTAMP": ts,
            "OK-ACCESS-PASSPHRASE": api_passphrase,
        }
        r = requests.get(url, headers=headers, timeout=15)
        j = r.json() if r is not None else {}
        data = j.get("data") or []
        if not data:
            return 0.0
        details = (data[0].get("details") or [])
        if not details:
            return 0.0
        d0 = details[0] or {}
        # cashBal genelde USDT spot/free'yi verir, yoksa availEq/eq fallback
        v = d0.get("cashBal")
        if v is None:
            v = d0.get("availEq")
        if v is None:
            v = d0.get("eq")
        return _to_float(v, 0.0)
    except Exception:
        return 0.0


def okx_get_asset_balance(ccy: str, api_key: str, api_secret: str, api_passphrase: str) -> float:
    """
    OKX v5 account balance for given asset (spot/free).
    Hata olursa 0.0 döner.
    """
    ccy = safe_str(ccy).strip().upper()
    if not ccy:
        return 0.0
    if not api_key or not api_secret or not api_passphrase:
        return 0.0
    try:
        import requests
        base = "https://www.okx.com"
        path = "/api/v5/account/balance"
        query = f"ccy={urllib.parse.quote(ccy)}"
        url = f"{base}{path}?{query}"
        ts = datetime.utcnow().isoformat(timespec="milliseconds") + "Z"
        method = "GET"
        body = ""
        prehash = f"{ts}{method}{path}?{query}{body}"
        sign = base64.b64encode(hmac.new(api_secret.encode("utf-8"), prehash.encode("utf-8"), hashlib.sha256).digest()).decode("utf-8")
        headers = {
            "OK-ACCESS-KEY": api_key,
            "OK-ACCESS-SIGN": sign,
            "OK-ACCESS-TIMESTAMP": ts,
            "OK-ACCESS-PASSPHRASE": api_passphrase,
        }
        r = requests.get(url, headers=headers, timeout=15)
        j = r.json() if r is not None else {}
        data = j.get("data") or []
        if not data:
            return 0.0
        details = (data[0].get("details") or [])
        if not details:
            return 0.0
        d0 = details[0] or {}
        v = d0.get("cashBal")
        if v is None:
            v = d0.get("availEq")
        if v is None:
            v = d0.get("eq")
        return _to_float(v, 0.0)
    except Exception:
        return 0.0


def _base_ccy_from_symbol(symbol: str) -> str:
    s = safe_str(symbol).strip().upper()
    if "/" in s:
        return safe_str(s.split("/", 1)[0]).strip().upper()
    return s


# =========================
# Fee helpers (USDT conversion)
# =========================
def _fee_ccy_to_usdt(exchange_id: str, fee_amt: float, fee_ccy: str, symbol: str, symbol_price: float) -> float:
    """Converts a fee amount in fee_ccy to USDT. Uses symbol_price if fee_ccy is base of symbol, otherwise tries fee_ccy/USDT."""
    try:
        fee_amt = abs(_to_float(fee_amt, 0.0))
        fee_ccy = safe_str(fee_ccy or '').upper()
        exchange_id = safe_str(exchange_id or '').upper()
        if fee_amt <= 0 or not fee_ccy:
            return 0.0
        if fee_ccy in ('USDT','USD'):
            return fee_amt
        base = _base_ccy_from_symbol(symbol)
        if base and fee_ccy == base and symbol_price > 0:
            return fee_amt * float(symbol_price)
        # Try direct price
        try:
            px = _to_float(get_public_price(exchange_id, f"{fee_ccy}/USDT"), 0.0)
            if px > 0:
                return fee_amt * px
        except Exception:
            pass
        # If fee_ccy equals quote USDT already handled; fallback 0
        return 0.0
    except Exception:
        return 0.0


def _sum_buy_fees_usdt(exchange_id: str, symbol: str, rows: List[dict]) -> float:
    """Sums BUY fees (usdt + coin fees converted) across stacked open_positions rows."""
    total = 0.0
    try:
        for r in (rows or []):
            try:
                entry_price = _to_float(r.get('entry_price'), 0.0)
                total += abs(_to_float(r.get('buy_fee_usdt'), 0.0))
                fee_coin = abs(_to_float(r.get('buy_fee_coin'), 0.0))
                fee_ccy = safe_str(r.get('buy_fee_coin_ccy') or '').upper()
                if fee_coin > 0 and fee_ccy:
                    total += _fee_ccy_to_usdt(exchange_id, fee_coin, fee_ccy, symbol, entry_price)
            except Exception:
                continue
    except Exception:
        pass
    return float(total)


def _sum_sell_fees_usdt(exchange_id: str, symbol: str, fill_price: float, res: Dict[str, Any]) -> float:
    """Sums SELL fees from place_order result (fee_usdt + fee_coin converted)."""
    try:
        fee_usdt = abs(_to_float((res or {}).get('fee_usdt'), 0.0))
        fee_coin = abs(_to_float((res or {}).get('fee_coin'), 0.0))
        fee_ccy = safe_str((res or {}).get('fee_coin_ccy') or '').upper()
        total = fee_usdt
        if fee_coin > 0 and fee_ccy:
            total += _fee_ccy_to_usdt(exchange_id, fee_coin, fee_ccy, symbol, fill_price)
        return float(total)
    except Exception:
        return 0.0
def get_user_exchange_usdt_balances(user: dict) -> dict:
    """
    UI için: 4 borsanın USDT bakiyesini aynı anda döner.
    API yoksa / hata varsa 0.0 döner.
    """
    out = {"OKX": 0.0, "BINANCE": 0.0, "BYBIT": 0.0, "GATE": 0.0}
    if user and not isinstance(user, dict):
        user = dict(user)

    try:
        out["OKX"] = okx_get_usdt_balance(
            safe_str(user.get("api_key")),
            safe_str(user.get("api_secret")),
            safe_str(user.get("api_passphrase")),
        )
    except Exception:
        out["OKX"] = 0.0

    try:
        k = safe_str(user.get("binance_api_key"))
        s = safe_str(user.get("binance_api_secret"))
        out["BINANCE"] = binance_get_usdt_balance(k, s) if (k and s) else 0.0
    except Exception:
        out["BINANCE"] = 0.0

    try:
        k = safe_str(user.get("bybit_api_key"))
        s = safe_str(user.get("bybit_api_secret"))
        out["BYBIT"] = bybit_get_usdt_balance(k, s) if (k and s) else 0.0
    except Exception:
        out["BYBIT"] = 0.0

    try:
        k = safe_str(user.get("gate_api_key"))
        s = safe_str(user.get("gate_api_secret"))
        out["GATE"] = gateio_get_usdt_balance(k, s) if (k and s) else 0.0
    except Exception:
        out["GATE"] = 0.0

    return out

def format_balances_line(bals: dict) -> str:
    return (
        f"OKX: {float(bals.get('OKX',0.0)):.2f} USDT  •  "
        f"Binance: {float(bals.get('BINANCE',0.0)):.2f} USDT  •  "
        f"Bybit: {float(bals.get('BYBIT',0.0)):.2f} USDT  •  "
        f"Gate: {float(bals.get('GATE',0.0)):.2f} USDT"
    )


def set_last_msg(username: str, msg: str) -> None:
    """
    Panelde 'son mesaj' göstermek için.
    Trade akışını ASLA bozmasın diye try/except ile güvenli.
    """
    try:
        uname = (username or "").strip()
        if not uname:
            return
        m = (msg or "").strip()
        if not m:
            return

        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        # users tablosunda last_msg kolonu yoksa ekle
        cur.execute("PRAGMA table_info(users)")
        cols = [r[1] for r in cur.fetchall()]  # name
        if "last_msg" not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN last_msg TEXT")

        cur.execute("UPDATE users SET last_msg=? WHERE username=?", (m, uname))
        conn.commit()
        conn.close()
    except Exception as e:
        try:
            log_line("WARN", "system", f"set_last_msg failed: {e}")
        except Exception:
            pass


# =========================
# Public price helpers (UI)
# =========================

_PRICE_CACHE: Dict[str, Dict[str, Any]] = {}

def _cache_get(key: str, ttl: int = 8) -> Optional[float]:
    v = _PRICE_CACHE.get(key)
    if not v:
        return None
    if int(time.time()) - int(v.get("ts", 0)) > ttl:
        return None
    return v.get("price")

def _cache_set(key: str, price: float) -> None:
    _PRICE_CACHE[key] = {"ts": int(time.time()), "price": float(price)}

def _sym_norm_for_price(ex: str, symbol: str) -> str:
    s = (symbol or "").strip().upper()
    s = s.replace("-", "/")
    return s

def _public_price_okx(symbol: str) -> Optional[float]:
    # OKX uses instId like BTC-USDT
    import requests
    s = _sym_norm_for_price("OKX", symbol).replace("/", "-")
    url = f"https://www.okx.com/api/v5/market/ticker?instId={s}"
    r = requests.get(url, timeout=6)
    j = r.json()
    data = (j or {}).get("data") or []
    if not data:
        return None
    last = data[0].get("last")
    return float(last) if last is not None else None

def _public_price_binance(symbol: str) -> Optional[float]:
    import requests
    s = _sym_norm_for_price("BINANCE", symbol).replace("/", "")
    url = f"https://api.binance.com/api/v3/ticker/price?symbol={s}"
    r = requests.get(url, timeout=6)
    j = r.json()
    p = (j or {}).get("price")
    return float(p) if p is not None else None

def _public_price_bybit(symbol: str) -> Optional[float]:
    import requests
    # Bybit v5: category=spot, symbol=BTCUSDT
    s = _sym_norm_for_price("BYBIT", symbol).replace("/", "")
    url = f"https://api.bybit.com/v5/market/tickers?category=spot&symbol={s}"
    r = requests.get(url, timeout=6)
    j = r.json()
    lst = (((j or {}).get("result") or {}).get("list") or [])
    if not lst:
        return None
    last = lst[0].get("lastPrice")
    return float(last) if last is not None else None

def _public_price_gate(symbol: str) -> Optional[float]:
    import requests
    # Gate spot: currency_pair=BTC_USDT
    s = _sym_norm_for_price("GATE", symbol).replace("/", "_")
    url = f"https://api.gateio.ws/api/v4/spot/tickers?currency_pair={s}"
    r = requests.get(url, timeout=6)
    j = r.json()
    if isinstance(j, list) and j:
        last = j[0].get("last")
        return float(last) if last is not None else None
    return None

def get_public_price(exchange_id: str, symbol: str) -> Optional[float]:
    ex = (exchange_id or "").strip().upper()
    key = f"{ex}:{_sym_norm_for_price(ex, symbol)}"
    cached = _cache_get(key)
    if cached is not None:
        return cached
    try:
        if ex == "OKX":
            p = _public_price_okx(symbol)
        elif ex == "BINANCE":
            p = _public_price_binance(symbol)
        elif ex == "BYBIT":
            p = _public_price_bybit(symbol)
        elif ex in ("GATE", "GATEIO", "GATE.IO"):
            p = _public_price_gate(symbol)
        else:
            p = None
        if p is None:
            return None
        _cache_set(key, float(p))
        return float(p)
    except Exception:
        return None


# Backward compatible alias
def public_price(exchange_id: str, symbol: str) -> Optional[float]:
    return get_public_price(exchange_id, symbol)


# =========================
# Open positions (manual BUY stays visible)
# =========================

def positions_for_user(username: str) -> List[Dict[str, Any]]:
    """DB'den kullanıcının açık pozisyonlarını listeler (dict döner)."""
    conn = db()
    cur = conn.cursor()
    cur.execute("""
        SELECT username, exchange_id, symbol, qty, entry_price, created_at
        FROM open_positions
        WHERE username = ?
        ORDER BY created_at DESC
        LIMIT 50
    """, (username,))
    rows = cur.fetchall() or []
    conn.close()
    # sqlite3.Row -> dict; UI tarafında p.get(...) kullanıyoruz
    out: List[Dict[str, Any]] = []
    for r in rows:
        try:
            out.append(dict(r))
        except Exception:
            # fallback (çok nadir)
            out.append({
                "username": r[0] if len(r) > 0 else username,
                "exchange_id": r[1] if len(r) > 1 else "",
                "symbol": r[2] if len(r) > 2 else "",
                "qty": r[3] if len(r) > 3 else 0.0,
                "entry_price": r[4] if len(r) > 4 else 0.0,
                "created_at": r[5] if len(r) > 5 else None,
            })
    return out



def position_add(username: str, exchange_id: str, symbol: str, qty: float, entry_price: float, entry_usdt: float, dry_run: bool, buy_fee_usdt: float = 0.0, buy_fee_coin: float = 0.0, buy_fee_coin_ccy: str = '', buy_ord_id: str = '') -> int:
    """Always INSERT a new open position (each BUY becomes a new row). Returns position id."""
    conn = db()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO open_positions(username, exchange_id, symbol, qty, entry_price, entry_usdt, buy_fee_usdt, buy_fee_coin, buy_fee_coin_ccy, buy_ord_id, dry_run, created_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
        """,
        (
            username,
            str(exchange_id).upper(),
            str(symbol).upper(),
            float(qty or 0.0),
            float(entry_price or 0.0),
            float(entry_usdt or 0.0),
            float(buy_fee_usdt or 0.0),
            float(buy_fee_coin or 0.0),
            str(buy_fee_coin_ccy or ''),
            str(buy_ord_id or ''),
            1 if dry_run else 0,
            now_ts(),
        ),
    )
    pid = int(cur.lastrowid)
    # users tablosuna AUTO regime kolonları ekle (yoksa)
    try:
        cur.execute("PRAGMA table_info(users)")
        cols = [r[1] for r in cur.fetchall()]
        if "auto_gate" not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN auto_gate INTEGER NOT NULL DEFAULT 1")
        if "auto_mode" not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN auto_mode TEXT NOT NULL DEFAULT 'NORMAL'")
        if "auto_gate_reason" not in cols:
            cur.execute("ALTER TABLE users ADD COLUMN auto_gate_reason TEXT NOT NULL DEFAULT ''")
    except Exception:
        pass


    conn.commit()
    conn.close()
    return pid

def get_position(pid: int, username: str | None = None) -> dict | None:
    # Backward compatible: allow get_position(username, pid)
    if username is not None and isinstance(pid, str) and isinstance(username, (int, float)):
        pid, username = username, pid
    if username is None:
        username = session.get('username')

    """Fetch a single open position by id. If username provided, also filters by username."""
    conn = db()
    cur = conn.cursor()
    if username is None:
        cur.execute("SELECT * FROM open_positions WHERE id=?", (int(pid),))
    else:
        cur.execute("SELECT * FROM open_positions WHERE id=? AND username=?", (int(pid), username))
    r = cur.fetchone()
    conn.close()
    return dict(r) if r else None

def delete_position(pid: int, username: str | None = None) -> bool:
    conn = db()
    cur = conn.cursor()
    if username is None:
        cur.execute("DELETE FROM open_positions WHERE id=?", (int(pid),))
    else:
        cur.execute("DELETE FROM open_positions WHERE id=? AND username=?", (int(pid), username))
    ok = cur.rowcount > 0
    conn.commit()
    conn.close()
    return ok

def now_ts() -> int:
    return int(time.time())

def iso_now_local() -> str:
    dt = datetime.utcnow() + timedelta(hours=TZ_OFFSET_HOURS)
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def hash_password(pw: str, salt: str) -> str:
    return sha256_hex(f"{salt}:{pw}")

def verify_password(pw: str, salt: str, pw_hash: str) -> bool:
    return hash_password(pw, salt) == pw_hash

def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


# Backward compatible alias (some older parts called db_connect)
def db_connect() -> sqlite3.Connection:
    return db()


def package_limit_for(name: str) -> int:
    for p in PACKAGES:
        if p["name"].lower() == safe_str(name).lower():
            return int(p["limit"])
    return 300

def user_display_name(u: Any) -> str:
    try:
        if u is None:
            return ""
        if isinstance(u, dict):
            dn = safe_str(u.get("display_name", ""))
            return dn if dn else safe_str(u.get("username", ""))
        dn = safe_str(u["display_name"])
        return dn if dn else safe_str(u["username"])
    except Exception:
        return ""

def is_expired(u) -> bool:
    exp = int((u["expires_at"] if not isinstance(u, dict) else u.get("expires_at")) or 0)
    if exp <= 0:
        return False
    return now_ts() > exp

def get_usage(username: str) -> Dict[str, Any]:
    conn = db()
    try:
        row = conn.execute("SELECT * FROM usage WHERE username=?", (username,)).fetchone()
        if not row:
            conn.execute("INSERT OR IGNORE INTO usage (username, used_count, updated_at) VALUES (?,0,?)", (username, now_ts()))
            conn.commit()
            return {"used_count": 0, "updated_at": now_ts()}
        return dict(row)
    finally:
        conn.close()

def set_usage(username: str, used_count: int) -> None:
    conn = db()
    try:
        conn.execute("""
            INSERT INTO usage (username, used_count, updated_at)
            VALUES (?,?,?)
            ON CONFLICT(username) DO UPDATE SET used_count=excluded.used_count, updated_at=excluded.updated_at
        """, (username, used_count, now_ts()))
        conn.commit()
    finally:
        conn.close()

def inc_usage(username: str) -> int:
    u = get_usage(username)
    new_used = int(u["used_count"]) + 1
    set_usage(username, new_used)
    return new_used

def usage_blocked(u) -> bool:
    limit_v = int((u["package_limit"] if not isinstance(u, dict) else u.get("package_limit")) or 300)
    if limit_v < 0:
        return False
    used = int(get_usage((u["username"] if not isinstance(u, dict) else u.get("username")) or "")["used_count"])
    return used >= limit_v

def format_usage_badge(u) -> str:
    limit_v = int((u["package_limit"] if not isinstance(u, dict) else u.get("package_limit")) or 300)
    used = int(get_usage((u["username"] if not isinstance(u, dict) else u.get("username")) or "")["used_count"])
    if limit_v < 0:
        return f"{used} / ∞"
    return f"{used} / {limit_v}"


def get_daily_loss_limit(u) -> float:
    try:
        if not u:
            return 0.0
        if not isinstance(u, dict):
            u = dict(u)
        return float(u.get("daily_loss_limit_usdt") or 0.0)
    except Exception:
        return 0.0

def set_daily_loss_limit(username: str, limit_usdt: float) -> None:
    conn = db()
    try:
        conn.execute("UPDATE users SET daily_loss_limit_usdt=? WHERE username=?", (float(limit_usdt or 0.0), username))
        conn.commit()
    finally:
        conn.close()


def daily_loss_block_msg(u) -> str:
    """
    Günlük zarar limiti dolduysa popup mesajı döner, değilse "".
    (trade_enabled kapalı olsa bile bugünkü PnL'e göre kontrol eder)
    """
    try:
        if not u:
            return ""
        if not isinstance(u, dict):
            u = dict(u)
        uname = safe_str(u.get("username") or "")
        limit_dl = float(u.get("daily_loss_limit_usdt") or 0.0)
        if limit_dl <= 0:
            return ""
        sday = stats_for_user(uname, "day") if "stats_for_user" in globals() else {"pnl_usdt": 0.0}
        pnl_day = float((sday or {}).get("pnl_usdt") or 0.0)
        if pnl_day <= -abs(limit_dl):
            return (
                f"{E_STOP} Günlük zarar limitiniz dolmuştur.\n\n"
                f"Limitinizi yükseltip tekrar deneyin.\n\n"
                f"{E_UP} Bugün: {pnl_day:.2f} USDT\n"
                f"{E_BOX} Limit: {abs(limit_dl):.2f} USDT"
            )
        return ""
    except Exception:
        return ""

def may_trade(u) -> bool:
    if int((u["trade_enabled"] if not isinstance(u, dict) else u.get("trade_enabled")) or 0) != 1:
        return False
    if is_expired(u):
        return False
    if usage_blocked(u):
        return False
    # Daily loss limit (MANUEL). AUTO bypasses may_trade elsewhere.
    try:
        limit_dl = float(get_daily_loss_limit(u) or 0.0)
        if limit_dl > 0:
            uname = (u.get("username") if isinstance(u, dict) else dict(u).get("username")) or ""
            sday = stats_for_user(uname, "day") if "stats_for_user" in globals() else {"pnl_usdt": 0.0}
            pnl_day = float((sday or {}).get("pnl_usdt") or 0.0)
            if pnl_day <= -abs(limit_dl):
                conn = db()
                try:
                    conn.execute("UPDATE users SET trade_enabled=0 WHERE username=?", (uname,))
                    conn.commit()
                finally:
                    conn.close()
                return False
    except Exception:
        pass

    return True

def log_line(username: str, level: str, message: str) -> None:
    conn = db()
    try:
        conn.execute("INSERT INTO logs (username, level, message, created_at) VALUES (?,?,?,?)",
                     (username, level, message, now_ts()))
        conn.commit()
    finally:
        conn.close()

def get_user(username: str) -> Optional[Dict[str, Any]]:
    conn = db()
    try:
        row = conn.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def require_login():
    if not session.get("username"):
        return redirect("/login")
    return None

def require_admin():
    if not session.get("username"):
        return redirect("/login")
    if not session.get("is_admin"):
        return redirect("/")
    return None

# =========================
# EXCHANGE SYMBOL LOADERS + CACHE
# =========================
_SYMBOLS_CACHE = {"ts": 0, "data": {}}
_SYMBOLS_TTL_SEC = 300  # 5 dk

POPULAR_USDT = [
    "BTC/USDT","ETH/USDT","SOL/USDT","XRP/USDT","BNB/USDT","DOGE/USDT","ADA/USDT","AVAX/USDT","TRX/USDT","LINK/USDT","PLLD/USDT",
    "MATIC/USDT","DOT/USDT","LTC/USDT","BCH/USDT","UNI/USDT","ATOM/USDT","NEAR/USDT","ETC/USDT","APT/USDT","ARB/USDT","XAG/USDT","XPD/USDT","COPPER/USDT"
]

def _now():
    return int(time.time())

def get_okx_usdt_symbols():
    import requests
    r = requests.get(
        "https://www.okx.com/api/v5/public/instruments",
        params={"instType": "SPOT"},
        timeout=10
    )
    data = r.json().get("data", [])
    return sorted([
        i["instId"].replace("-", "/")
        for i in data
        if i.get("instId", "").endswith("-USDT")
    ])

def get_binance_usdt_symbols():
    import requests
    r = requests.get("https://api.binance.com/api/v3/exchangeInfo", timeout=10)
    out = []
    for s in r.json().get("symbols", []):
        if s.get("status") == "TRADING" and s.get("quoteAsset") == "USDT":
            out.append(f'{s.get("baseAsset")}/USDT')
    return sorted(out)

def get_gateio_usdt_symbols():
    import requests
    r = requests.get("https://api.gateio.ws/api/v4/spot/currency_pairs", timeout=10)
    out = []
    for p in r.json():
        if p.get("quote") == "USDT" and p.get("trade_status") == "tradable":
            out.append(f'{p.get("base")}/USDT')
    return sorted(out)

def get_bybit_usdt_symbols():
    import requests
    r = requests.get(
        "https://api.bybit.com/v5/market/instruments-info",
        params={"category": "spot"},
        timeout=10
    )
    out = []
    for s in r.json().get("result", {}).get("list", []):
        if s.get("quoteCoin") == "USDT" and s.get("status") == "Trading":
            out.append(f'{s.get("baseCoin")}/USDT')
    return sorted(out)

def get_symbols_for_exchange(ex: str):
    ex = (ex or "OKX").strip().upper()
    if ex not in ("OKX", "BINANCE", "GATEIO", "BYBIT"):
        ex = "OKX"

    ts = _SYMBOLS_CACHE.get("ts", 0)
    data = _SYMBOLS_CACHE.get("data", {})
    if isinstance(data, dict) and data and (_now() - ts) < _SYMBOLS_TTL_SEC and ex in data:
        return data[ex]

    try:
        if ex == "OKX":
            syms = get_okx_usdt_symbols()
        elif ex == "BINANCE":
            syms = get_binance_usdt_symbols()
        elif ex == "GATEIO":
            syms = get_gateio_usdt_symbols()
        else:
            syms = get_bybit_usdt_symbols()

        # Custom instruments requested by user (may not exist on every exchange).
        # They will still appear in AUTO/MANUEL selectors; if exchange does not
        # support, order will fail with a clear reason (logged + Telegram DM).
        extra = ["XPD/USDT", "XAG/USDT", "XCU/USDT"]  # Paladyum, Gümüş, Bakır
        try:
            base_list = [safe_str(s).strip().upper().replace("-", "/").replace("_", "/") for s in (syms or [])]
            seen = set(base_list)
            for s in extra:
                if s not in seen:
                    base_list.append(s)
                    seen.add(s)
            syms = base_list
        except Exception:
            pass

        data = dict(data) if isinstance(data, dict) else {}
        data[ex] = syms
        _SYMBOLS_CACHE["data"] = data
        _SYMBOLS_CACHE["ts"] = _now()
        return syms
    except Exception:
        if isinstance(data, dict) and ex in data and data[ex]:
            return data[ex]
        return POPULAR_USDT

# =========================
# Symbols API (AUTO & MANUAL)
# =========================

# =========================
# Open Positions helpers (FIX: Pozisyonlar yüklenemedi)
# =========================

def list_positions(username: str) -> List[Dict[str, Any]]:
    """Açık pozisyonları DB'den getirir. Hata olursa [] döner (UI çökmesin)."""
    conn = db()
    try:
        cur = conn.execute(
            "SELECT id, exchange_id, symbol, qty, entry_price, entry_usdt, buy_fee_usdt, dry_run, created_at "
            "FROM open_positions WHERE username=? ORDER BY id DESC LIMIT 50",
            (username,),
        )
        out: List[Dict[str, Any]] = []
        for r in cur.fetchall():
            out.append(
                {
                    "id": int(r[0]),
                    "exchange_id": safe_str(r[1]),
                    "symbol": safe_str(r[2]),
                    "qty": float(r[3] or 0.0),
                    "entry_price": float(r[4] or 0.0),
                    "entry_usdt": float(r[5] or 0.0),
                    "buy_fee_usdt": float(r[6] or 0.0),
                    "dry_run": int(r[7] or 0),
                    "created_at": safe_str(r[8]),
                }
            )
        return out
    except Exception:
        return []

def get_market_price(exchange: str, symbol: str) -> float:
    """
    Anlık fiyat. UI çökmesin diye her şey try/except.
    Tercihen sendeki public fiyat fonksiyonunu kullanır.
    """
    try:
        ex = (exchange or "").strip().upper()
        sym = (symbol or "").strip().upper()

        # Sende varsa bunu kullan (en doğru yer)
        if "get_public_price" in globals():
            p = get_public_price(ex, sym)
            return float(p or 0.0)

        # Alternatif isimler (varsa)
        if "public_price" in globals():
            p = public_price(ex, sym)
            return float(p or 0.0)

        return 0.0
    except Exception:
        return 0.0



@app.get("/api/positions")
def api_positions():
    rr = require_login()
    if rr:
        return rr

    username = session.get("username") or ""
    raw = list_positions(username) or []

    # Aynı coin'den birden fazla satırı TEK satırda göster (stack)
    # Not: Kullanıcı isteği gereği aynı symbol farklı dry/ex olsa bile tekleştiriyoruz.
    groups: Dict[str, Dict[str, Any]] = {}

    for p in raw:
        if p is not None and not isinstance(p, dict):
            try:
                p = dict(p)
            except Exception:
                continue
        if not p:
            continue

        ex = safe_str(p.get("exchange_id") or DEFAULT_EXCHANGE).strip().upper() or "OKX"
        sym = safe_str(p.get("symbol") or "").strip().upper()
        if not sym:
            continue
        # normalize
        sym = sym.replace("-", "/").replace("_", "/")
        if "USDT" in sym and "/" not in sym and sym.endswith("USDT") and len(sym) > 4:
            sym = sym[:-4] + "/USDT"

        # tekleme anahtarı: symbol
        gid = sym

        qty = _to_float(p.get("qty"), 0.0)
        entry_price = _to_float(p.get("entry_price"), 0.0)
        entry_usdt = _to_float(p.get("entry_usdt"), 0.0)

        g = groups.get(gid)
        if not g:
            g = {
                # UI SELL butonu için temsilci id (en küçük id)
                "id": int(p.get("id") or 0),
                # aynı sembol altında toplanan id'ler
                "group_ids": [],
                "exchange_id": ex,
                "symbol": sym,
                # bilgisel: grupta LIVE ve DRY karışırsa LIVE görünür (server tarafında işlem zaten doğru modda)
                "dry_run": int(_to_int(p.get("dry_run"), 0)),
                "qty": 0.0,
                "entry_price": 0.0,
                "entry_usdt": 0.0,
                "created_at": int(p.get("created_at") or 0),
            }
            groups[gid] = g

        pid = int(p.get("id") or 0)
        g["group_ids"].append(pid)

        # qty + yatırım topla
        g["qty"] += qty
        g["entry_usdt"] += entry_usdt

        # weighted avg entry price (qty ağırlıklı)
        if qty > 0 and entry_price > 0:
            prev_qty = max(_to_float(g.get("qty"), 0.0) - qty, 0.0)
            prev_avg = _to_float(g.get("entry_price"), 0.0)
            if prev_qty <= 0:
                g["entry_price"] = entry_price
            else:
                g["entry_price"] = (prev_avg * prev_qty + entry_price * qty) / (prev_qty + qty)

        # temsilci kayıt: en küçük id + en eski created_at
        try:
            g["created_at"] = min(int(g.get("created_at") or 0), int(p.get("created_at") or 0))
        except Exception:
            pass
        try:
            g["id"] = min(int(g.get("id") or 0), pid)
        except Exception:
            pass

        # dry_run karışırsa LIVE öncelikli göster
        try:
            if int(_to_int(p.get("dry_run"), 0)) == 0:
                g["dry_run"] = 0
        except Exception:
            pass

    out = list(groups.values())

    # canlı fiyat + pnl: API her refresh'te "—" göstermesin diye server tarafında dolduruyoruz
    for g in out:
        ex = safe_str(g.get("exchange_id") or DEFAULT_EXCHANGE).strip().upper()
        sym = safe_str(g.get("symbol") or "").strip().upper()
        qty = _to_float(g.get("qty"), 0.0)
        entry_price = _to_float(g.get("entry_price"), 0.0)

        cur = 0.0
        try:
            cur = float(public_price(ex, sym) or 0.0)
        except Exception:
            cur = 0.0

        if cur <= 0:
            g["current_price"] = None
            g["pnl_usdt"] = None
        else:
            g["current_price"] = cur
            if qty > 0 and entry_price > 0:
                g["pnl_usdt"] = (cur - entry_price) * qty
            else:
                g["pnl_usdt"] = 0.0

    # newest first
    out.sort(key=lambda x: int(x.get("created_at") or 0), reverse=True)
    return jsonify({"ok": True, "positions": out})

@app.get("/api/symbols")
def api_symbols():
    rr = require_login()
    if rr:
        return rr

    ex = safe_str(request.args.get("exchange", "")).strip().upper()
    if ex not in ("OKX", "BINANCE", "GATEIO", "BYBIT"):
        ex = "OKX"

    try:
        syms = get_symbols_for_exchange(ex) or []
    except Exception:
        syms = []

    syms = [safe_str(s).strip().upper() for s in syms if s]
    return jsonify({"ok": True, "exchange": ex, "symbols": syms})

# =========================
# AUTO RULES DB HELPERS
# =========================
def auto_list(username: str) -> List[Dict[str, Any]]:
    username = safe_str(username).strip()
    conn = db()
    try:
        rows = conn.execute("""
            SELECT id, username, exchange_id, symbol, usdt, enabled, created_at
            FROM auto_rules
            WHERE username=?
            ORDER BY id DESC
        """, (username,)).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

def auto_upsert_rule(username: str, exchange_id: str, symbol: str, usdt: float, enabled: int) -> None:
    username = safe_str(username).strip()
    exchange_id = safe_str(exchange_id).strip().upper()
    symbol = safe_str(symbol).strip().upper()
    usdt = float(usdt or 0.0)
    enabled = 1 if int(enabled) == 1 else 0

    conn = db()
    try:
        row = conn.execute("""
            SELECT id FROM auto_rules
            WHERE username=? AND exchange_id=? AND UPPER(symbol)=?
            LIMIT 1
        """, (username, exchange_id, symbol)).fetchone()

        if row:
            conn.execute("""
                UPDATE auto_rules
                SET usdt=?, enabled=?, created_at=?
                WHERE id=?
            """, (usdt, enabled, now_ts(), int(row["id"])))
        else:
            conn.execute("""
                INSERT INTO auto_rules (username, exchange_id, symbol, usdt, enabled, created_at)
                VALUES (?,?,?,?,?,?)
            """, (username, exchange_id, symbol, usdt, enabled, now_ts()))

        conn.commit()
    finally:
        conn.close()

def auto_toggle_id(username: str, rid: int, enabled: int) -> None:
    conn = db()
    try:
        conn.execute("UPDATE auto_rules SET enabled=? WHERE id=? AND username=?", (enabled, rid, username))
        conn.commit()
    finally:
        conn.close()

def auto_delete_id(username: str, rid: int) -> None:
    conn = db()
    try:
        conn.execute("DELETE FROM auto_rules WHERE id=? AND username=?", (rid, username))
        conn.commit()
    finally:
        conn.close()


def auto_update_id(username: str, rid: int, usdt: float) -> None:
    conn = db()
    try:
        conn.execute("UPDATE auto_rules SET usdt=? WHERE id=? AND username=?", (float(usdt), rid, username))
        conn.commit()
    finally:
        conn.close()

def auto_get_enabled_match(username: str, exchange_id: str, symbol: str) -> Optional[Dict[str, Any]]:
    username = safe_str(username).strip()
    exchange_id = safe_str(exchange_id).strip().upper()
    sym_can = canon_symbol(symbol)

    # Variants so BTCUSDT / BTC-USDT / BTC/USDT all match the same rule
    sym_slashless = sym_can.replace("/", "")
    sym_dash = sym_can.replace("/", "-")

    conn = db()
    try:
        row = conn.execute("""
            SELECT * FROM auto_rules
            WHERE username=? AND exchange_id=? AND enabled=1
              AND (UPPER(symbol)=? OR UPPER(symbol)=? OR UPPER(symbol)=?)
            ORDER BY id DESC
            LIMIT 1
        """, (username, exchange_id, sym_can, sym_slashless, sym_dash)).fetchone()
        if not row:
            return None
        return dict(row)
    finally:
        conn.close()


    conn = db()
    try:
        row = conn.execute("""
            SELECT * FROM auto_rules
            WHERE username=? AND exchange_id=? AND UPPER(symbol)=? AND enabled=1
            ORDER BY id DESC
            LIMIT 1
        """, (username, exchange_id, symbol)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

# =========================
# Telegram
# =========================
def telegram_send_to(chat_id: str, text: str) -> None:
    if not TELEGRAM_TOKEN:
        return
    cid = safe_str(chat_id)
    if not cid:
        return
    if not safe_str(text):
        # boş text yollamayı deneme
        return
    
    # Grup mesajı tamamen kapalı
    try:
        if TELEGRAM_GROUP_ID and cid == safe_str(TELEGRAM_GROUP_ID):
            try:
                log_line("telegram", "INFO", f"Group messaging disabled, blocked chat_id={cid}")
            except Exception:
                pass
            return
    except Exception:
        pass

    try:
        import requests
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        payload = {"chat_id": cid, "text": text}

        # Eğer hedef grup ise ve topic/thread id varsa ekle
        try:
            group_id = safe_str(globals().get("TELEGRAM_GROUP_ID", "") or "")
            thread_id = safe_str(globals().get("TELEGRAM_GROUP_THREAD_ID", "") or "")
            if group_id and thread_id and cid == group_id:
                payload["message_thread_id"] = int(thread_id)
        except Exception:
            pass

        r = requests.post(url, json=payload, timeout=20)

        # Telegram hata dönerse loga yaz (en kritik kısım)
        try:
            if not r.ok:
                log_line("telegram", "WARN", f"Telegram send failed chat_id={cid} status={r.status_code} resp={r.text[:200]}")
        except Exception:
            pass

    except Exception as e:
        try:
            log_line("telegram", "WARN", f"Telegram exception chat_id={cid} err={e}")
        except Exception:
            pass
        return





def telegram_send_for_user(u, text: str) -> None:
    """
    BUY/SELL bildirimleri SADECE kullanıcı DM.
    Gruba ASLA göndermez.
    Kullanıcı chat id yoksa fallback'e (admin'e) BUY/SELL göndermez; sadece log yazar.
    """
    # token yoksa net log
    if not TELEGRAM_TOKEN:
        try:
            uname = safe_str(u.get("username")) if isinstance(u, dict) else safe_str(getattr(u, "username", ""))
            log_line(uname or "telegram", "WARN", "Telegram token yok (TELEGRAM_BOT_TOKEN boş)")
        except Exception:
            pass
        return

    # kullanıcı chat id
    try:
        user_chat = safe_str(u.get("telegram_chat_id") if isinstance(u, dict) else getattr(u, "telegram_chat_id", ""))
    except Exception:
        user_chat = ""

    uname = ""
    try:
        uname = safe_str(u.get("username")) if isinstance(u, dict) else safe_str(getattr(u, "username", ""))
    except Exception:
        uname = ""

    if not user_chat:
        # kullanıcı botu başlatmamış / chat id kayıtlı değil -> BUY/SELL DM YOK
        # ama sebebi log'a net yaz
        try:
            log_line(uname or "telegram", "WARN", f"{E_WARN} Telegram DM gönderilemedi: kullanıcı telegram_chat_id boş (bot /start gerekli)")
        except Exception:
            pass
        return

    # SADECE kullanıcıya DM
    telegram_send_to(user_chat, safe_str(text))





def build_telegram_text(action: str, u, symbol: str, requested_usdt: float, dry_run: bool,
                        extra: Dict[str, Any]) -> str:
    # Titles: EXACT
    title = f"{E_ON} BUY ALERT" if action.upper() == "BUY" else f"{E_OFF} SELL ALERT"
    ex_name = safe_str(u.get("exchange_id") if isinstance(u, dict) else u["exchange_id"]).upper() or DEFAULT_EXCHANGE
    parts: List[str] = [
        title,
        f"{E_USER} {user_display_name(u)}",
        f"{E_BANK} Borsa: {ex_name}",
        f"{E_CHART} {symbol}",
        f"{E_TST} Mod: {'DRY RUN' if dry_run else 'LIVE'}",
        f"{E_MNY} İstek: {requested_usdt:.2f} USDT",
        f"{E_TIME} Zaman: {iso_now_local()}",
    ]
    if action.upper() == "SELL":
    # NET PnL öncelikli (fee dahil)
        net_pnl = float(extra.get("net_pnl_usdt", extra.get("pnl_usdt", 0.0)) or 0.0)

    # Fee satırı (toplam fee USDT) – yoksa 0 yazar
        fee_total = float(extra.get("fee_usdt_total", extra.get("fee_usdt", 0.0)) or 0.0)

    # TL dönüşümü (net pnl üzerinden)
        net_try = float(extra.get("net_pnl_try", extra.get("pnl_try", (net_pnl * USDT_TRY_RATE))) or 0.0)

    # PnL (Net)
        if abs(net_pnl) < 0.01:
            parts.append(f"{E_UP} PnL (Net): {net_pnl:.6f} USDT")
        else:
            parts.append(f"{E_UP} PnL (Net): {net_pnl:.4f} USDT")

    # Fee ayrı satır
        if abs(fee_total) < 0.01:
            parts.append(f"{E_MNY} Fee: {fee_total:.6f} USDT")
        else:
            parts.append(f"{E_MNY} Fee: {fee_total:.4f} USDT")

    # TL net
        parts.append(f"{E_MNY} {net_try:+.2f} TL".replace(",", "."))


    status = safe_str(extra.get("status"))
    if status:
        parts.append(status)
    return "\n".join(parts)

def build_fail_text(action: str, u, symbol: str, requested_usdt: float, dry_run: bool, reason: str) -> str:
    title = f"{E_ON} BUY ALERT" if action.upper() == "BUY" else f"{E_OFF} SELL ALERT"
    ex_name = safe_str(u.get("exchange_id") if isinstance(u, dict) else u["exchange_id"]).upper() or DEFAULT_EXCHANGE
    parts = [
        title,
        f"{E_USER} {user_display_name(u)}",
        f"{E_BANK} Borsa: {ex_name}",
        f"{E_CHART} {symbol}",
        f"{E_TST} Mod: {'DRY RUN' if dry_run else 'LIVE'}",
        f"{E_MNY} İstek: {requested_usdt:.2f} USDT",
        f"{E_TIME} Zaman: {iso_now_local()}",
        f"{E_STOP} Emir başarısız: {safe_str(reason) or 'Bilinmeyen hata'}",
    ]
    return "\n".join(parts)

# =========================
# DB init and migrations
# =========================
def _ensure_column(conn: sqlite3.Connection, table: str, col: str, ddl_fragment: str) -> None:
    cols = [r["name"] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()]
    if col in cols:
        return
    conn.execute(f"ALTER TABLE {table} ADD COLUMN {col} {ddl_fragment}")


def ensure_paper_test_schema(conn):
    # Ensure paper-test (TEST) tables exist and have required columns.
    # Safe to call repeatedly.
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS paper_test_state (
            username TEXT PRIMARY KEY,
            start_usdt REAL NOT NULL DEFAULT 0.0,
            usdt REAL NOT NULL DEFAULT 0.0,
            last_reset_ts TEXT,
            created_ts TEXT,
            updated_ts TEXT
        )
    """)
    _ensure_column(cur, "paper_test_state", "start_usdt", "REAL NOT NULL DEFAULT 0.0")
    _ensure_column(cur, "paper_test_state", "usdt", "REAL NOT NULL DEFAULT 0.0")
    _ensure_column(cur, "paper_test_state", "last_reset_ts", "TEXT")
    _ensure_column(cur, "paper_test_state", "created_ts", "TEXT")
    _ensure_column(cur, "paper_test_state", "updated_ts", "TEXT")

    cur.execute("""
        CREATE TABLE IF NOT EXISTS paper_test_positions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            exchange TEXT NOT NULL,
            symbol TEXT NOT NULL,
            qty REAL NOT NULL DEFAULT 0.0,
            entry_px REAL NOT NULL DEFAULT 0.0,
            entry_ts TEXT,
            invested_usdt REAL NOT NULL DEFAULT 0.0,
            fee_buy REAL NOT NULL DEFAULT 0.0,
            fee_sell REAL NOT NULL DEFAULT 0.0,
            status TEXT NOT NULL DEFAULT 'OPEN'
        )
    """)
    _ensure_column(cur, "paper_test_positions", "username", "TEXT NOT NULL")
    _ensure_column(cur, "paper_test_positions", "exchange", "TEXT NOT NULL")
    _ensure_column(cur, "paper_test_positions", "symbol", "TEXT NOT NULL")
    _ensure_column(cur, "paper_test_positions", "qty", "REAL NOT NULL DEFAULT 0.0")
    _ensure_column(cur, "paper_test_positions", "entry_px", "REAL NOT NULL DEFAULT 0.0")
    _ensure_column(cur, "paper_test_positions", "entry_ts", "TEXT")
    _ensure_column(cur, "paper_test_positions", "invested_usdt", "REAL NOT NULL DEFAULT 0.0")
    _ensure_column(cur, "paper_test_positions", "fee_buy", "REAL NOT NULL DEFAULT 0.0")
    _ensure_column(cur, "paper_test_positions", "fee_sell", "REAL NOT NULL DEFAULT 0.0")
    _ensure_column(cur, "paper_test_positions", "status", "TEXT NOT NULL DEFAULT 'OPEN'")

    cur.execute("""
        CREATE TABLE IF NOT EXISTS paper_test_trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            exchange TEXT NOT NULL,
            symbol TEXT NOT NULL,
            entry_px REAL NOT NULL DEFAULT 0.0,
            exit_px REAL NOT NULL DEFAULT 0.0,
            qty REAL NOT NULL DEFAULT 0.0,
            invested_usdt REAL NOT NULL DEFAULT 0.0,
            received_usdt REAL NOT NULL DEFAULT 0.0,
            fee_buy REAL NOT NULL DEFAULT 0.0,
            fee_sell REAL NOT NULL DEFAULT 0.0,
            pnl_net_usdt REAL NOT NULL DEFAULT 0.0,
            pnl_pct REAL NOT NULL DEFAULT 0.0,
            ts_open TEXT,
            ts_close TEXT
        )
    """)
    for col, spec in [
        ("username", "TEXT NOT NULL"),
        ("exchange", "TEXT NOT NULL"),
        ("symbol", "TEXT NOT NULL"),
        ("entry_px", "REAL NOT NULL DEFAULT 0.0"),
        ("exit_px", "REAL NOT NULL DEFAULT 0.0"),
        ("qty", "REAL NOT NULL DEFAULT 0.0"),
        ("invested_usdt", "REAL NOT NULL DEFAULT 0.0"),
        ("received_usdt", "REAL NOT NULL DEFAULT 0.0"),
        ("fee_buy", "REAL NOT NULL DEFAULT 0.0"),
        ("fee_sell", "REAL NOT NULL DEFAULT 0.0"),
        ("pnl_net_usdt", "REAL NOT NULL DEFAULT 0.0"),
        ("pnl_pct", "REAL NOT NULL DEFAULT 0.0"),
        ("opened_at", "INTEGER"),
        ("closed_at", "INTEGER"),
        ("ts_open", "TEXT"),
        ("ts_close", "TEXT"),
    ]:
        _ensure_column(cur, "paper_test_trades", col, spec)

    try:
        cur.execute("CREATE INDEX IF NOT EXISTS idx_paper_pos_user ON paper_test_positions(username)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_paper_pos_user_sym ON paper_test_positions(username, symbol)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_paper_tr_user ON paper_test_trades(username)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_paper_tr_user_ts ON paper_test_trades(username, ts_close)")
    except Exception:
        pass
def init_db() -> None:
    conn = db()
    cur = conn.cursor()

    # Global settings (admin-only)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT '',
        updated_at INTEGER NOT NULL DEFAULT 0
    )
    """)
    try:
        cur.execute(
            "INSERT OR IGNORE INTO app_settings(key,value,updated_at) VALUES (?,?,?)",
            ("AUTO_MODE", safe_str(os.getenv("AUTO_MODE", "NORMAL")).upper() or "NORMAL", now_ts()),
        )
    except Exception:
        pass


    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        display_name TEXT NOT NULL DEFAULT '',
        salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin INTEGER NOT NULL DEFAULT 0,

        trade_enabled INTEGER NOT NULL DEFAULT 1,
        disable_on_limit INTEGER NOT NULL DEFAULT 1,

        exchange_id TEXT NOT NULL DEFAULT 'OKX',
        webhook_secret TEXT NOT NULL DEFAULT '',

        package_name TEXT NOT NULL DEFAULT 'Basic',
        package_limit INTEGER NOT NULL DEFAULT 300,
        package_months INTEGER NOT NULL DEFAULT 1,
        expires_at INTEGER NOT NULL DEFAULT 0,

        total_pnl REAL NOT NULL DEFAULT 0.0,
        created_at INTEGER NOT NULL DEFAULT 0
    )
    """)

    # ---- Contract columns (safe ALTER) ----
    try:
        cur.execute("ALTER TABLE users ADD COLUMN contract_accepted_at INTEGER NOT NULL DEFAULT 0")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE users ADD COLUMN contract_full_name TEXT NOT NULL DEFAULT ''")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE users ADD COLUMN contract_tc TEXT NOT NULL DEFAULT ''")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE users ADD COLUMN contract_ip TEXT NOT NULL DEFAULT ''")
    except Exception:
        pass

    # ---- Telegram columns (safe ALTER) ----
    try:
        cur.execute("ALTER TABLE users ADD COLUMN telegram_chat_id TEXT NOT NULL DEFAULT ''")
    except Exception:
        pass

    # ---- Take Profit (safe ALTER) ----
    try:
        cur.execute("ALTER TABLE users ADD COLUMN tp_pct REAL NOT NULL DEFAULT 0.005")
    except Exception:
        pass

    # Contract records (admin list + download + delete)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        full_name TEXT NOT NULL DEFAULT '',
        tc TEXT NOT NULL DEFAULT '',
        ip TEXT NOT NULL DEFAULT '',
        accepted_at INTEGER NOT NULL DEFAULT 0,
        version TEXT NOT NULL DEFAULT '',
        body TEXT NOT NULL DEFAULT ''
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS usage (
        username TEXT PRIMARY KEY,
        used_count INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL DEFAULT 0
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS pending_signals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        action TEXT NOT NULL,
        symbol TEXT NOT NULL,
        requested_usdt REAL NOT NULL DEFAULT 0.0,
        payload_json TEXT NOT NULL DEFAULT '{}',
        dry_run INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PENDING'
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT 0
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        exchange_id TEXT NOT NULL,
        action TEXT NOT NULL,
        symbol TEXT NOT NULL,
        real_usdt REAL NOT NULL DEFAULT 0.0,
        pnl_usdt REAL NOT NULL DEFAULT 0.0,
        dry_run INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT 0
    )
    """)

    # Açık pozisyonlar (Manuel/Auto BUY sonrası burada kalır; panelden SELL'e alırsın)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS open_positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        exchange_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        qty REAL NOT NULL DEFAULT 0.0,
        entry_price REAL NOT NULL DEFAULT 0.0,
        entry_usdt REAL NOT NULL DEFAULT 0.0,
        dry_run INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT 0
    )
    """)

    
    # ---- open_positions fee/order columns (safe ALTER) ----
    # Eski DB'lerde bu kolonlar yoksa otomatik ekler (PNL ve Telegram fee için)
    for _sql in [
        "ALTER TABLE open_positions ADD COLUMN buy_fee_usdt REAL NOT NULL DEFAULT 0.0",
        "ALTER TABLE open_positions ADD COLUMN buy_fee_coin REAL NOT NULL DEFAULT 0.0",
        "ALTER TABLE open_positions ADD COLUMN buy_fee_coin_ccy TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE open_positions ADD COLUMN buy_ord_id TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE open_positions ADD COLUMN sell_fee_usdt REAL NOT NULL DEFAULT 0.0",
        "ALTER TABLE open_positions ADD COLUMN sell_fee_coin REAL NOT NULL DEFAULT 0.0",
        "ALTER TABLE open_positions ADD COLUMN sell_fee_coin_ccy TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE open_positions ADD COLUMN sell_ord_id TEXT NOT NULL DEFAULT ''",
    ]:
        try:
            cur.execute(_sql)
        except Exception:
            pass

    cur.execute("""
    CREATE TABLE IF NOT EXISTS auto_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        exchange_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        usdt REAL NOT NULL DEFAULT 0.0,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT 0
    )
    """)

    
    # TEST (paper) schema - safe migrations
    ensure_paper_test_schema(conn)
    conn.commit()

    # OKX (zorunlu) alanları: mevcut kolonlar
    _ensure_column(conn, "users", "api_key", "TEXT NOT NULL DEFAULT ''")
    _ensure_column(conn, "users", "api_secret", "TEXT NOT NULL DEFAULT ''")
    _ensure_column(conn, "users", "api_passphrase", "TEXT NOT NULL DEFAULT ''")

    # Telegram
    _ensure_column(conn, "users", "telegram_chat_id", "TEXT NOT NULL DEFAULT ''")

    # Daily loss limit (user-defined, USDT). 0 = kapalı
    _ensure_column(conn, "users", "daily_loss_limit_usdt", "REAL NOT NULL DEFAULT 0.0")
    _ensure_column(conn, "users", "force_dry_run", "INTEGER NOT NULL DEFAULT 0")
    _ensure_column(conn, "users", "trial_real_enabled", "INTEGER NOT NULL DEFAULT 0")
    _ensure_column(conn, "users", "trial_expires_at", "INTEGER NOT NULL DEFAULT 0")



    # 3 borsa ayrı alanlar (opsiyonel)
    _ensure_column(conn, "users", "binance_api_key", "TEXT NOT NULL DEFAULT ''")
    _ensure_column(conn, "users", "binance_api_secret", "TEXT NOT NULL DEFAULT ''")
    _ensure_column(conn, "users", "bybit_api_key", "TEXT NOT NULL DEFAULT ''")
    _ensure_column(conn, "users", "bybit_api_secret", "TEXT NOT NULL DEFAULT ''")
    _ensure_column(conn, "users", "gate_api_key", "TEXT NOT NULL DEFAULT ''")
    _ensure_column(conn, "users", "gate_api_secret", "TEXT NOT NULL DEFAULT ''")

    conn.commit()

    row = conn.execute("SELECT username FROM users WHERE username='admin'").fetchone()
    if not row:
        salt = secrets.token_hex(16)
        pw = "admin"
        conn.execute("""
            INSERT INTO users
            (username, display_name, salt, password_hash, is_admin,
             trade_enabled, disable_on_limit, exchange_id, webhook_secret,
             package_name, package_limit, package_months, expires_at,
             api_key, api_secret, api_passphrase, telegram_chat_id,
             binance_api_key, binance_api_secret,
             bybit_api_key, bybit_api_secret,
             gate_api_key, gate_api_secret,
             total_pnl, created_at)
            VALUES (?,?,?,?,1, 1,1, ?,?, ?,?,?, ?, '', '', '', '', '', '', '', '', '', '', 0.0, ?)
        """, (
            "admin", "Admin", salt, hash_password(pw, salt),
            DEFAULT_EXCHANGE, "",
            "Ultra", -1, 12, now_ts() + 3650 * 24 * 3600,
            now_ts()
        ))
        conn.execute(
            "INSERT OR IGNORE INTO usage (username, used_count, updated_at) VALUES (?,0,?)",
            ("admin", now_ts())
        )
        conn.commit()


    # =========================
    # Paper Test (Simülasyon) tabloları
    # =========================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS paper_test_state (
        username TEXT PRIMARY KEY,
        usdt REAL NOT NULL DEFAULT 0.0,
        pnl REAL NOT NULL DEFAULT 0.0,
        fee REAL NOT NULL DEFAULT 0.0,
        last_px REAL NOT NULL DEFAULT 0.0,
        updated_at INTEGER NOT NULL DEFAULT 0
    )
    """)

    # Şema migrasyonu: Eski kurulumlarda paper_test_state farklı kolonlarla oluşmuş olabilir.
    # Bu blok eksik kolonları idempotent şekilde ekler (CREATE TABLE mevcut tabloyu değiştirmez).
    try:
        curx = conn.cursor()
        cols = {r[1] for r in curx.execute("PRAGMA table_info(paper_test_state)").fetchall()}
        need = {
            "usdt": "REAL NOT NULL DEFAULT 0.0",
            "pnl": "REAL NOT NULL DEFAULT 0.0",
            "fee": "REAL NOT NULL DEFAULT 0.0",
            "last_px": "REAL NOT NULL DEFAULT 0.0",
            "updated_at": "INTEGER NOT NULL DEFAULT 0",
        }
        for c, ddl in need.items():
            if c not in cols:
                curx.execute(f"ALTER TABLE paper_test_state ADD COLUMN {c} {ddl}")
        conn.commit()
    except Exception:
        # Migrasyon başarısız olsa bile test sayfası çökmesin (sonraki çağrıda tekrar dener)
        pass
    cur.execute("""
    CREATE TABLE IF NOT EXISTS paper_test_positions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        exchange_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        qty REAL NOT NULL DEFAULT 0.0,
        entry_price REAL NOT NULL DEFAULT 0.0,
        entry_usdt REAL NOT NULL DEFAULT 0.0,
        buy_fee_usdt REAL NOT NULL DEFAULT 0.0,
        opened_at INTEGER NOT NULL DEFAULT 0
    )
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS paper_test_trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        exchange_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        entry_price REAL NOT NULL,
        exit_price REAL NOT NULL,
        qty REAL NOT NULL,
        invested_usdt REAL NOT NULL,
        received_usdt REAL NOT NULL,
        fee_total_usdt REAL NOT NULL,
        pnl_net_usdt REAL NOT NULL,
        opened_at INTEGER NOT NULL,
        closed_at INTEGER NOT NULL
    )
    """)

    # paper_test_trades kolon migrasyonu (eski DB'lerde eksik kolon olabilir)
    try:
        curx.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='paper_test_trades'").fetchone()
        cols = [r[1] for r in curx.execute("PRAGMA table_info(paper_test_trades)").fetchall()]
        def _add_col(col_sql):
            try:
                curx.execute(col_sql)
            except Exception:
                pass
        if "opened_at" not in cols:
            _add_col("ALTER TABLE paper_test_trades ADD COLUMN opened_at INTEGER NOT NULL DEFAULT 0")
        if "closed_at" not in cols:
            _add_col("ALTER TABLE paper_test_trades ADD COLUMN closed_at INTEGER NOT NULL DEFAULT 0")
        if "invested_usdt" not in cols:
            _add_col("ALTER TABLE paper_test_trades ADD COLUMN invested_usdt REAL NOT NULL DEFAULT 0.0")
        if "received_usdt" not in cols:
            _add_col("ALTER TABLE paper_test_trades ADD COLUMN received_usdt REAL NOT NULL DEFAULT 0.0")
        if "fee_total_usdt" not in cols:
            _add_col("ALTER TABLE paper_test_trades ADD COLUMN fee_total_usdt REAL NOT NULL DEFAULT 0.0")
        if "pnl_net_usdt" not in cols:
            _add_col("ALTER TABLE paper_test_trades ADD COLUMN pnl_net_usdt REAL NOT NULL DEFAULT 0.0")
    except Exception:
        pass

    cur.execute("""
    CREATE TABLE IF NOT EXISTS paper_test_autorules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        exchange_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        usdt_amount REAL NOT NULL DEFAULT 0.0,
        use_all_balance INTEGER NOT NULL DEFAULT 0,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT 0
    )
    """)

    conn.commit()
    conn.close()


# =========================
# Paper Test helpers
# =========================
def _get_usdt_try_rate() -> float:
    try:
        r = requests.get("https://api.binance.com/api/v3/ticker/price", params={"symbol":"USDTTRY"}, timeout=4)
        j = r.json()
        return float(j.get("price") or 0.0)
    except Exception:
        return 0.0

def paper_test_ensure_state(username: str) -> dict:
    """Ensure paper test state exists; default balance = 100.000 TL / USDTTRY.
    Defensive: accept dict/user row and coerce to string username.
    """
    # username bazen yanlışlıkla dict gelebiliyor (örn: get_user sonucu). Güvenli hale getir.
    if isinstance(username, dict):
        username = safe_str(username.get("username") or "")
    else:
        username = safe_str(username or "")
    conn = db()

    # Şema migrasyonu: Eski kurulumlarda paper_test_state farklı kolonlarla oluşmuş olabilir.
    # Bu blok eksik kolonları idempotent şekilde ekler (CREATE TABLE mevcut tabloyu değiştirmez).
    try:
        curx = conn.cursor()
        cols = {r[1] for r in curx.execute("PRAGMA table_info(paper_test_state)").fetchall()}
        need = {
            "usdt": "REAL NOT NULL DEFAULT 0.0",
            "pnl": "REAL NOT NULL DEFAULT 0.0",
            "fee": "REAL NOT NULL DEFAULT 0.0",
            "last_px": "REAL NOT NULL DEFAULT 0.0",
            "updated_at": "INTEGER NOT NULL DEFAULT 0",
        }
        for c, ddl in need.items():
            if c not in cols:
                curx.execute(f"ALTER TABLE paper_test_state ADD COLUMN {c} {ddl}")
        conn.commit()
    except Exception:
        # Migrasyon başarısız olsa bile test sayfası çökmesin (sonraki çağrıda tekrar dener)
        pass
    try:
        row = conn.execute("SELECT * FROM paper_test_state WHERE username=? LIMIT 1", (username,)).fetchone()
        if row:
            return dict(row)
        usdt_try = _get_usdt_try_rate() or 40.0
        start_usdt = round(100000.0 / max(usdt_try, 0.0001), 2)
        conn.execute(
            "INSERT INTO paper_test_state(username, usdt, pnl, fee, last_px, updated_at) VALUES (?,?,?,?,?,?)",
            (username, start_usdt, 0.0, 0.0, 0.0, now_ts()),
        )
        conn.commit()
        return dict(conn.execute("SELECT * FROM paper_test_state WHERE username=? LIMIT 1", (username,)).fetchone())
    finally:
        conn.close()

def paper_test_reset(username: str) -> dict:
    conn = db()
    try:
        conn.execute("DELETE FROM paper_test_positions WHERE username=?", (username,))
        conn.execute("DELETE FROM paper_test_trades WHERE username=?", (username,))
        conn.execute("DELETE FROM paper_test_autorules WHERE username=?", (username,))
        usdt_try = _get_usdt_try_rate() or 40.0
        start_usdt = round(100000.0 / max(usdt_try, 0.0001), 2)
        conn.execute(
            "INSERT INTO paper_test_state(username, usdt, pnl, fee, last_px, updated_at) VALUES (?,?,?,?,?,?) "
            "ON CONFLICT(username) DO UPDATE SET usdt=excluded.usdt, pnl=0.0, fee=0.0, last_px=0.0, updated_at=excluded.updated_at",
            (username, start_usdt, 0.0, 0.0, 0.0, now_ts()),
        )
        conn.commit()
        return dict(conn.execute("SELECT * FROM paper_test_state WHERE username=? LIMIT 1", (username,)).fetchone())
    finally:
        conn.close()

def paper_test_list_positions(username: str) -> List[dict]:
    conn = db()
    try:
        rows = conn.execute(
            "SELECT * FROM paper_test_positions WHERE username=? ORDER BY opened_at DESC, id DESC",
            (username,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

def paper_test_list_trades(username: str, limit: int = 50) -> List[dict]:
    conn = db()
    try:
        rows = conn.execute(
            "SELECT * FROM paper_test_trades WHERE username=? ORDER BY closed_at DESC, id DESC LIMIT ?",
            (username, int(limit)),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

def paper_test_list_autorules(username: str) -> List[dict]:
    conn = db()
    try:
        rows = conn.execute(
            "SELECT * FROM paper_test_autorules WHERE username=? ORDER BY id DESC",
            (username,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

# =========================
# Execution stubs per exchange
# =========================
def _require_keys_for_exchange(exchange_id: str, api_key: str, api_secret: str, api_passphrase: str) -> Optional[str]:
    ex = exchange_id.upper()

    # ---- Safety: strip API credentials (trailing spaces cause OKX Invalid Sign) ----
    api_key = safe_str(api_key).strip()
    api_secret = safe_str(api_secret).strip()
    api_passphrase = safe_str(api_passphrase).strip()
    if ex == "OKX":
        if not api_key or not api_secret or not api_passphrase:
            return "OKX API bilgileri eksik"
        return None
    if ex in ("BINANCE", "BYBIT", "GATEIO"):
        if not api_key or not api_secret:
            return f"{ex} API bilgileri eksik"
        return None
    return "Borsa seçimi geçersiz"

def place_order(exchange_id: str, action: str, symbol: str, usdt_amount: float, dry_run: bool,
                api_key: str, api_secret: str, api_passphrase: str) -> Dict[str, Any]:
    """
    Unified spot MARKET order wrapper.
    Returns:
      ok, fill_price, fill_qty, real_usdt, fee_usdt, fee_coin, fee_coin_ccy, ord_id
    Notes:
      - BUY: usdt_amount is QUOTE amount (USDT)
      - SELL: usdt_amount is BASE qty (sell all)
    """
    import requests

    # ---- Safety: normalize numeric inputs ----
    usdt_amount = _to_float(usdt_amount, 0.0)
    action = (action or "").upper().strip()
    symbol = (symbol or "").upper().strip()
    ex = (exchange_id or "").upper().strip()

    # ---- Safety: strip API credentials ----
    api_key = safe_str(api_key).strip()
    api_secret = safe_str(api_secret).strip()
    api_passphrase = safe_str(api_passphrase).strip()

    # Global PANIC: block any order placement
    try:
        if is_global_panic():
            return {"ok": False, "reason": "PANIC aktif"}
    except Exception:
        pass

    if usdt_amount <= 0:
        return {"ok": False, "reason": "Miktar sıfır"}

    def _fee_to_usdt(ccy: str, amt: float, px_hint: float = 0.0) -> float:
        c = safe_str(ccy).upper()
        a = abs(_to_float(amt, 0.0))
        if a <= 0:
            return 0.0
        if c in ("USDT", "USD"):
            return a
        # if fee coin is base coin, convert with fill price hint
        try:
            base_ccy = _base_ccy_from_symbol(symbol).upper()
            if base_ccy and c == base_ccy and px_hint > 0:
                return a * float(px_hint)
        except Exception:
            pass
        # try public price for fee coin
        try:
            px = _to_float(get_public_price(ex, f"{c}/USDT"), 0.0)
            if px > 0:
                return a * px
        except Exception:
            pass
        return 0.0

    # =========================
    # DRY RUN
    # =========================
    if dry_run:
        fill_price = _to_float(get_public_price(ex, symbol), 0.0)
        if fill_price <= 0:
            fill_price = 100.0
        if action == "BUY":
            fill_qty = usdt_amount / fill_price if fill_price > 0 else 0.0
            return {
                "ok": True,
                "fill_price": fill_price,
                "fill_qty": fill_qty,
                "real_usdt": usdt_amount,
                "fee_usdt": 0.0,
                "fee_coin": 0.0,
                "fee_coin_ccy": "",
                "ord_id": "",
            }
        else:
            fill_qty = usdt_amount
            real_usdt = fill_qty * fill_price if (fill_qty > 0 and fill_price > 0) else 0.0
            return {
                "ok": True,
                "fill_price": fill_price,
                "fill_qty": fill_qty,
                "real_usdt": real_usdt,
                "fee_usdt": 0.0,
                "fee_coin": 0.0,
                "fee_coin_ccy": "",
                "ord_id": "",
            }

    # =========================
    # LIVE ORDERS
    # =========================
    try:
        if ex == "OKX":
            inst_id = symbol.replace("/", "-").replace("_", "-").upper()

            base_url = os.getenv("OKX_BASE_URL", "https://www.okx.com")
            path = "/api/v5/trade/order"
            url = base_url.rstrip("/") + path

            body_obj: Dict[str, Any] = {
                "instId": inst_id,
                "tdMode": "cash",
                "side": "buy" if action == "BUY" else "sell",
                "ordType": "market",
            }

            if action == "BUY":
                body_obj["tgtCcy"] = "quote_ccy"
                body_obj["sz"] = f"{usdt_amount:.8f}".rstrip("0").rstrip(".")
            else:
                body_obj["sz"] = f"{usdt_amount:.8f}".rstrip("0").rstrip(".")

            body_json = json.dumps(body_obj, separators=(",", ":"), ensure_ascii=False)

            ts = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
            prehash = ts + "POST" + path + body_json
            sign = base64.b64encode(hmac.new(api_secret.encode(), prehash.encode(), hashlib.sha256).digest()).decode()

            headers = {
                "OK-ACCESS-KEY": api_key,
                "OK-ACCESS-SIGN": sign,
                "OK-ACCESS-TIMESTAMP": ts,
                "OK-ACCESS-PASSPHRASE": api_passphrase,
                "Content-Type": "application/json",
            }


            # --- Balance snapshot (OKX) ---
            base_ccy = ""
            try:
                if "/" in symbol:
                    base_ccy = symbol.split("/")[0].strip().upper()
                elif "-" in inst_id:
                    base_ccy = inst_id.split("-")[0].strip().upper()
            except Exception:
                base_ccy = ""
            bal_before_usdt = okx_get_asset_balance("USDT", api_key, api_secret, api_passphrase)
            bal_before_base = okx_get_asset_balance(base_ccy, api_key, api_secret, api_passphrase) if base_ccy else 0.0

            r = requests.post(url, headers=headers, data=body_json.encode("utf-8"), timeout=15)
            j = r.json() if r is not None else {}
            if safe_str((j or {}).get("code")) != "0":
                return {"ok": False, "reason": safe_str((j or {}).get("msg") or "OKX emir hatası"), "raw": j}

            ord_id = ""
            try:
                ord_id = safe_str(((j or {}).get("data") or [{}])[0].get("ordId") or "")
            except Exception:
                ord_id = ""

            # Fill + fee
            fill_price = 0.0
            fill_qty = 0.0
            real_usdt = 0.0
            fee_usdt = 0.0
            fee_coin = 0.0
            fee_coin_ccy = ""

            if ord_id:
                try:
                    fills_url = base_url.rstrip("/") + "/api/v5/trade/fills"
                    params = {"ordId": ord_id, "instId": inst_id, "limit": "1"}
                    qs = "&".join([f"{k}={v}" for k, v in params.items()])
                    path2 = "/api/v5/trade/fills"
                    ts2 = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
                    prehash2 = ts2 + "GET" + path2 + "?" + qs
                    sign2 = base64.b64encode(hmac.new(api_secret.encode(), prehash2.encode(), hashlib.sha256).digest()).decode()
                    headers2 = dict(headers)
                    headers2["OK-ACCESS-SIGN"] = sign2
                    headers2["OK-ACCESS-TIMESTAMP"] = ts2

                    rr = requests.get(fills_url + "?" + qs, headers=headers2, timeout=15)
                    fj = rr.json() if rr is not None else {}
                    if safe_str((fj or {}).get("code")) == "0":
                        d = (fj or {}).get("data") or []
                        if d:
                            last = d[0]
                            fill_price = _to_float(last.get("fillPx"), 0.0)
                            fill_qty = _to_float(last.get("fillSz"), 0.0)
                            real_usdt = _to_float(last.get("fillNotional"), 0.0)

                            _fee = abs(_to_float(last.get("fee"), 0.0))
                            _fee_ccy = safe_str(last.get("feeCcy") or "").upper()
                            if _fee > 0 and _fee_ccy:
                                if _fee_ccy in ("USDT", "USD"):
                                    fee_usdt = _fee
                                else:
                                    fee_coin = _fee
                                    fee_coin_ccy = _fee_ccy
                except Exception:
                    pass

            if fill_price <= 0:
                fill_price = _to_float(get_public_price(ex, symbol), 0.0)
            if fill_price <= 0:
                fill_price = 100.0

            if action == "BUY":
                if fill_qty <= 0:
                    fill_qty = usdt_amount / fill_price if fill_price > 0 else 0.0
                if real_usdt <= 0:
                    real_usdt = usdt_amount
            else:
                if fill_qty <= 0:
                    fill_qty = usdt_amount
                if real_usdt <= 0:
                    real_usdt = fill_qty * fill_price

            # If fee is coin, keep it; Telegram will convert using fill_price/px

            # --- Balance-delta fee fix (OKX) ---
            try:
                bal_after_usdt = okx_get_asset_balance("USDT", api_key, api_secret, api_passphrase)
                bal_after_base = okx_get_asset_balance(base_ccy, api_key, api_secret, api_passphrase) if base_ccy else 0.0

                if action == "BUY":
                    # Notional spent (excludes fee)
                    notional = _to_float(real_usdt, 0.0)
                    usdt_delta = max(0.0, _to_float(bal_before_usdt, 0.0) - _to_float(bal_after_usdt, 0.0))
                    fee_usdt_delta = max(0.0, usdt_delta - notional)

                    base_delta = max(0.0, _to_float(bal_after_base, 0.0) - _to_float(bal_before_base, 0.0))
                    fee_coin_delta = max(0.0, _to_float(fill_qty, 0.0) - base_delta)

                    # If API returns 0 fee, use delta-derived values
                    if fee_usdt_delta > 0 and _to_float(fee_usdt, 0.0) <= 0:
                        fee_usdt = fee_usdt_delta
                    if fee_coin_delta > 0 and _to_float(fee_coin, 0.0) <= 0 and base_ccy:
                        fee_coin = fee_coin_delta
                        fee_coin_ccy = base_ccy

                else:  # SELL
                    gross = _to_float(real_usdt, 0.0)  # fill_qty * fill_price
                    net_usdt_gain = max(0.0, _to_float(bal_after_usdt, 0.0) - _to_float(bal_before_usdt, 0.0))
                    fee_usdt_delta = max(0.0, gross - net_usdt_gain)

                    base_spent = max(0.0, _to_float(bal_before_base, 0.0) - _to_float(bal_after_base, 0.0))
                    fee_coin_delta = max(0.0, base_spent - _to_float(fill_qty, 0.0))

                    if fee_usdt_delta > 0 and _to_float(fee_usdt, 0.0) <= 0:
                        fee_usdt = fee_usdt_delta
                    if fee_coin_delta > 0 and _to_float(fee_coin, 0.0) <= 0 and base_ccy:
                        fee_coin = fee_coin_delta
                        fee_coin_ccy = base_ccy
            except Exception:
                pass
            return {
                "ok": True,
                "fill_price": fill_price,
                "fill_qty": fill_qty,
                "real_usdt": real_usdt,
                "fee_usdt": fee_usdt,
                "fee_coin": fee_coin,
                "fee_coin_ccy": fee_coin_ccy,
                "ord_id": ord_id,
                "raw": j,
            }

        # -------------------------
        # BINANCE
        # -------------------------
        elif ex == "BINANCE":
            import urllib.parse
            base = "https://api.binance.com"
            sym = _sym_norm_for_price("BINANCE", symbol).replace("/", "")
            ts = int(time.time() * 1000)
            recv = 5000

            if action == "BUY":
                params = {
                    "symbol": sym,
                    "side": "BUY",
                    "type": "MARKET",
                    "quoteOrderQty": f"{usdt_amount:.8f}".rstrip("0").rstrip("."),
                    "recvWindow": str(recv),
                    "timestamp": str(ts),
                }
            else:
                params = {
                    "symbol": sym,
                    "side": "SELL",
                    "type": "MARKET",
                    "quantity": f"{usdt_amount:.8f}".rstrip("0").rstrip("."),
                    "recvWindow": str(recv),
                    "timestamp": str(ts),
                }

            qs = urllib.parse.urlencode(params)
            sig = hmac.new(api_secret.encode(), qs.encode(), hashlib.sha256).hexdigest()
            url = f"{base}/api/v3/order?{qs}&signature={sig}"
            headers = {"X-MBX-APIKEY": api_key}
            r = requests.post(url, headers=headers, timeout=15)
            j = r.json() if r is not None else {}

            if "code" in j and int(j.get("code") or 0) != 0:
                return {"ok": False, "reason": safe_str(j.get("msg") or "Binance emir hatası"), "raw": j}

            ord_id = safe_str(j.get("orderId") or "")

            executed_qty = _to_float(j.get("executedQty"), 0.0)
            cquote = _to_float(j.get("cummulativeQuoteQty"), 0.0)
            fill_price = (cquote / executed_qty) if executed_qty > 0 and cquote > 0 else _to_float(get_public_price(ex, symbol), 0.0)

            # Fee from fills (commission + commissionAsset)
            fee_usdt = 0.0
            fee_coin = 0.0
            fee_coin_ccy = ""
            fills = j.get("fills") or []
            fee_total_usdt = 0.0
            fee_coin_amt = 0.0
            fee_coin_asset = ""
            for f in fills:
                com = abs(_to_float(f.get("commission"), 0.0))
                asset = safe_str(f.get("commissionAsset") or "").upper()
                if com <= 0 or not asset:
                    continue
                # try convert to USDT
                usd = _fee_to_usdt(asset, com, fill_price)
                if usd > 0:
                    fee_total_usdt += usd
                else:
                    # keep last non-usdt fee as coin
                    fee_coin_amt += com
                    fee_coin_asset = asset

            if fee_total_usdt > 0:
                fee_usdt = fee_total_usdt
            elif fee_coin_amt > 0:
                fee_coin = fee_coin_amt
                fee_coin_ccy = fee_coin_asset

            real_usdt = cquote if cquote > 0 else (executed_qty * fill_price if fill_price > 0 else 0.0)
            return {
                "ok": True,
                "fill_price": fill_price,
                "fill_qty": executed_qty if executed_qty > 0 else (usdt_amount / fill_price if action == "BUY" and fill_price > 0 else usdt_amount),
                "real_usdt": real_usdt if real_usdt > 0 else usdt_amount,
                "fee_usdt": fee_usdt,
                "fee_coin": fee_coin,
                "fee_coin_ccy": fee_coin_ccy,
                "ord_id": ord_id,
                "raw": j,
            }

        # -------------------------
        # BYBIT (v5 spot)
        # -------------------------
        elif ex == "BYBIT":
            base = "https://api.bybit.com"
            recv = "5000"
            ts = str(int(time.time() * 1000))
            sym = _sym_norm_for_price("BYBIT", symbol).replace("/", "")

            path = "/v5/order/create"
            url = f"{base}{path}"

            if action == "BUY":
                body_obj = {
                    "category": "spot",
                    "symbol": sym,
                    "side": "Buy",
                    "orderType": "Market",
                    "qty": str(usdt_amount),
                    "marketUnit": "quoteCoin",
                }
            else:
                body_obj = {
                    "category": "spot",
                    "symbol": sym,
                    "side": "Sell",
                    "orderType": "Market",
                    "qty": str(usdt_amount),
                    "marketUnit": "baseCoin",
                }

            body = json.dumps(body_obj, separators=(",", ":"), ensure_ascii=False)
            prehash = ts + api_key + recv + body
            sign = hmac.new(api_secret.encode(), prehash.encode(), hashlib.sha256).hexdigest()
            headers = {
                "Content-Type": "application/json",
                "X-BAPI-API-KEY": api_key,
                "X-BAPI-TIMESTAMP": ts,
                "X-BAPI-RECV-WINDOW": recv,
                "X-BAPI-SIGN": sign,
            }
            r = requests.post(url, headers=headers, data=body.encode("utf-8"), timeout=15)
            j = r.json() if r is not None else {}

            if int(_to_float(j.get("retCode"), 0.0)) != 0:
                return {"ok": False, "reason": safe_str(j.get("retMsg") or "Bybit emir hatası"), "raw": j}

            ord_id = safe_str(((j.get("result") or {}).get("orderId")) or "")
            # Fetch executions to get avg/fees
            fill_price = 0.0
            fill_qty = 0.0
            real_usdt = 0.0
            fee_usdt = 0.0
            fee_coin = 0.0
            fee_coin_ccy = ""

            try:
                time.sleep(0.25)
                path2 = "/v5/execution/list"
                qs = f"category=spot&orderId={ord_id}&symbol={sym}&limit=50"
                ts2 = str(int(time.time() * 1000))
                prehash2 = ts2 + api_key + recv + qs
                sign2 = hmac.new(api_secret.encode(), prehash2.encode(), hashlib.sha256).hexdigest()
                url2 = f"{base}{path2}?{qs}"
                headers2 = {
                    "X-BAPI-API-KEY": api_key,
                    "X-BAPI-TIMESTAMP": ts2,
                    "X-BAPI-RECV-WINDOW": recv,
                    "X-BAPI-SIGN": sign2,
                }
                rr = requests.get(url2, headers=headers2, timeout=15)
                ej = rr.json() if rr is not None else {}
                if int(_to_float(ej.get("retCode"), 0.0)) == 0:
                    lst = (((ej.get("result") or {}).get("list")) or [])
                    notional = 0.0
                    qty_sum = 0.0
                    fee_sum_usdt = 0.0
                    fee_coin_sum = 0.0
                    fee_coin_asset = ""
                    for e in lst:
                        px = _to_float(e.get("execPrice"), 0.0)
                        q = _to_float(e.get("execQty"), 0.0)
                        v = _to_float(e.get("execValue"), 0.0)
                        notional += v
                        qty_sum += q
                        f = abs(_to_float(e.get("execFee"), 0.0))
                        fc = safe_str(e.get("feeCurrency") or "").upper()
                        if f > 0 and fc:
                            usd = _fee_to_usdt(fc, f, px)
                            if usd > 0:
                                fee_sum_usdt += usd
                            else:
                                fee_coin_sum += f
                                fee_coin_asset = fc
                    fill_qty = qty_sum
                    real_usdt = notional if notional > 0 else 0.0
                    fill_price = (notional / qty_sum) if qty_sum > 0 and notional > 0 else 0.0
                    if fee_sum_usdt > 0:
                        fee_usdt = fee_sum_usdt
                    elif fee_coin_sum > 0:
                        fee_coin = fee_coin_sum
                        fee_coin_ccy = fee_coin_asset
            except Exception:
                pass

            if fill_price <= 0:
                fill_price = _to_float(get_public_price(ex, symbol), 0.0)
            if fill_price <= 0:
                fill_price = 100.0

            if action == "BUY":
                if fill_qty <= 0:
                    fill_qty = usdt_amount / fill_price if fill_price > 0 else 0.0
                if real_usdt <= 0:
                    real_usdt = usdt_amount
            else:
                if fill_qty <= 0:
                    fill_qty = usdt_amount
                if real_usdt <= 0:
                    real_usdt = fill_qty * fill_price

            return {
                "ok": True,
                "fill_price": fill_price,
                "fill_qty": fill_qty,
                "real_usdt": real_usdt,
                "fee_usdt": fee_usdt,
                "fee_coin": fee_coin,
                "fee_coin_ccy": fee_coin_ccy,
                "ord_id": ord_id,
                "raw": j,
            }

        # -------------------------
        # GATE.IO (v4 spot)
        # -------------------------
        elif ex in ("GATE", "GATEIO", "GATE.IO"):
            base = "https://api.gateio.ws"
            path = "/api/v4/spot/orders"
            url = f"{base}{path}"

            # Gate spot market: amount is quote for buy, base for sell
            pair = _sym_norm_for_price("GATE", symbol).replace("/", "_")
            body_obj = {
                "currency_pair": pair,
                "side": "buy" if action == "BUY" else "sell",
                "type": "market",
                "amount": f"{usdt_amount:.8f}".rstrip("0").rstrip("."),
            }
            body = json.dumps(body_obj, separators=(",", ":"), ensure_ascii=False)

            ts = str(int(time.time()))
            body_hash = hashlib.sha512(body.encode()).hexdigest()
            prehash = "POST" + "\n" + path + "\n" + "" + "\n" + body_hash + "\n" + ts
            sign = hmac.new(api_secret.encode(), prehash.encode(), hashlib.sha512).hexdigest()
            headers = {"KEY": api_key, "Timestamp": ts, "SIGN": sign, "Content-Type": "application/json"}

            r = requests.post(url, headers=headers, data=body.encode("utf-8"), timeout=15)
            j = r.json() if r is not None else {}

            if isinstance(j, dict) and j.get("message") and j.get("label"):
                return {"ok": False, "reason": safe_str(j.get("message")), "raw": j}

            ord_id = safe_str(j.get("id") or "")

            fill_qty = _to_float(j.get("amount"), 0.0)
            # Gate returns filled_total for total quote (USDT)
            real_usdt = _to_float(j.get("filled_total"), 0.0)
            fill_price = (real_usdt / fill_qty) if fill_qty > 0 and real_usdt > 0 else _to_float(get_public_price(ex, symbol), 0.0)

            fee_amt = abs(_to_float(j.get("fee"), 0.0))
            fee_ccy = safe_str(j.get("fee_currency") or "").upper()
            fee_usdt = 0.0
            fee_coin = 0.0
            fee_coin_ccy = ""

            if fee_amt > 0 and fee_ccy:
                usd = _fee_to_usdt(fee_ccy, fee_amt, fill_price)
                if usd > 0:
                    fee_usdt = usd
                else:
                    fee_coin = fee_amt
                    fee_coin_ccy = fee_ccy

            # If Gate didn't include fee in create response, fetch order detail
            if fee_amt <= 0 and ord_id:
                try:
                    time.sleep(0.2)
                    path2 = f"/api/v4/spot/orders/{ord_id}"
                    url2 = f"{base}{path2}"
                    ts2 = str(int(time.time()))
                    prehash2 = "GET" + "\n" + path2 + "\n" + "" + "\n" + hashlib.sha512("".encode()).hexdigest() + "\n" + ts2
                    sign2 = hmac.new(api_secret.encode(), prehash2.encode(), hashlib.sha512).hexdigest()
                    headers2 = {"KEY": api_key, "Timestamp": ts2, "SIGN": sign2}
                    rr = requests.get(url2, headers=headers2, timeout=15)
                    oj = rr.json() if rr is not None else {}
                    fee_amt2 = abs(_to_float(oj.get("fee"), 0.0))
                    fee_ccy2 = safe_str(oj.get("fee_currency") or "").upper()
                    if fee_amt2 > 0 and fee_ccy2:
                        usd = _fee_to_usdt(fee_ccy2, fee_amt2, fill_price)
                        if usd > 0:
                            fee_usdt = usd
                            fee_coin = 0.0
                            fee_coin_ccy = ""
                        else:
                            fee_coin = fee_amt2
                            fee_coin_ccy = fee_ccy2
                except Exception:
                    pass

            return {
                "ok": True,
                "fill_price": fill_price,
                "fill_qty": fill_qty if fill_qty > 0 else (usdt_amount / fill_price if action == "BUY" and fill_price > 0 else usdt_amount),
                "real_usdt": real_usdt if real_usdt > 0 else usdt_amount,
                "fee_usdt": fee_usdt,
                "fee_coin": fee_coin,
                "fee_coin_ccy": fee_coin_ccy,
                "ord_id": ord_id,
                "raw": j,
            }

        return {"ok": False, "reason": f"Desteklenmeyen borsa: {ex}"}

    except Exception as e:
        return {"ok": False, "reason": f"Emir hatası: {e}"}

def record_trade(username: str, exchange_id: str, action: str, symbol: str,
                 real_usdt: float, pnl_usdt: float, dry_run: bool) -> None:
    conn = db()
    try:
        conn.execute("""
            INSERT INTO trades (username, exchange_id, action, symbol, real_usdt, pnl_usdt, dry_run, created_at)
            VALUES (?,?,?,?,?,?,?,?)
        """, (username, exchange_id.upper(), action.upper(), symbol.upper(),
              float(real_usdt), float(pnl_usdt), 1 if dry_run else 0, now_ts()))
        conn.commit()
    finally:
        conn.close()

def add_user_pnl(username: str, pnl: float) -> None:
    conn = db()
    try:
        conn.execute("UPDATE users SET total_pnl = total_pnl + ? WHERE username=?",
                     (float(pnl), username))
        conn.commit()
    finally:
        conn.close()

# =========================
# Stats
# =========================
def _window_start_ts(kind: str) -> int:
    now_local = datetime.utcnow() + timedelta(hours=TZ_OFFSET_HOURS)
    if kind == "day":
        start = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
    elif kind == "week":
        start = (now_local - timedelta(days=now_local.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        start = now_local.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    start_utc = start - timedelta(hours=TZ_OFFSET_HOURS)
    return int(start_utc.timestamp())

def stats_for_user(username: str, kind: str) -> Dict[str, Any]:
    start_ts = _window_start_ts(kind)
    conn = db()
    try:
        rows = conn.execute("""
            SELECT COUNT(1) AS c,
                   COALESCE(SUM(pnl_usdt), 0.0) AS pnl,
                   COALESCE(SUM(ABS(real_usdt)), 0.0) AS vol
            FROM trades
            WHERE username=? AND created_at>=? AND dry_run=0
        """, (username, start_ts)).fetchone()
        c = int(rows["c"] or 0)
        pnl_usdt = float(rows["pnl"] or 0.0)
        vol_usdt = float(rows["vol"] or 0.0)
    finally:
        conn.close()

    pnl_try = pnl_usdt * USDT_TRY_RATE
    pct = (pnl_usdt / vol_usdt * 100.0) if vol_usdt > 0 else 0.0
    return {"count": c, "pnl_usdt": pnl_usdt, "pnl_try": pnl_try, "pct": pct}

# =========================
# UI (CSS ASLA DEĞİŞTİRİLMEDİ)
# =========================
BASE_CSS = """
:root{
  --bg:#0b1220;
  --text:#e9eefb;
  --muted:#9fb0d3;
  --line:rgba(255,255,255,.10);
  --shadow:0 12px 30px rgba(0,0,0,.45);
  --r:22px;
  --r2:16px;
  --pad:18px;
  --font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  min-height:100vh;
  background:
    radial-gradient(1200px 700px at 20% 0%, rgba(31,94,255,.25), transparent 55%),
    radial-gradient(1000px 800px at 90% 10%, rgba(32,208,138,.14), transparent 60%),
    var(--bg);
  background-repeat:no-repeat;
  background-attachment:fixed;
  overflow-x:hidden;
  color:var(--text);
  font-family:var(--font);
  font-size:16px;
}
a{color:inherit;text-decoration:none}
.container{max-width:1120px;margin:0 auto;padding:22px}
.topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.brand{display:flex;flex-direction:column;gap:4px}
.brand .title{font-size:24px;font-weight:800;letter-spacing:.2px}
.brand .sub{color:var(--muted);font-size:14px}
.nav{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.pill{
  background:rgba(255,255,255,.06);
  border:1px solid var(--line);
  padding:10px 14px;
  border-radius:999px;
  color:var(--text);
  font-weight:700;
  font-size:14px;
}
.pill:hover{background:rgba(255,255,255,.10)}
.grid{display:grid;grid-template-columns:1.1fr .9fr;gap:16px}
@media(max-width:980px){.grid{grid-template-columns:1fr}}
.card{
  background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border:1px solid var(--line);
  border-radius:var(--r);
  box-shadow:var(--shadow);
  padding:var(--pad);
}
.card h2{margin:0 0 12px 0;font-size:18px}
.muted{color:var(--muted)}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:900px){.row{grid-template-columns:1fr}}
.input, select{
  width:100%;
  padding:14px 16px;
  border-radius:999px;
  border:1px solid var(--line);
  outline:none;
  background:rgba(0,0,0,.18);
  color:var(--text);
  font-size:16px;
}
select{appearance:auto}
select option{
  background:#0f1a2f;
  color:#e9eefb;
  font-size:16px;
}
label{display:block;margin:10px 0 8px 4px;color:var(--muted);font-weight:700}
.btn{
  display:inline-flex;align-items:center;justify-content:center;
  gap:8px;
  padding:12px 16px;
  border-radius:999px;
  border:1px solid var(--line);
  background:linear-gradient(180deg, rgba(31,94,255,.95), rgba(31,94,255,.70));
  color:white;
  font-weight:900;
  cursor:pointer;
  font-size:15px;
}
.btn:active{transform:translateY(1px)}
.btn.secondary{background:rgba(255,255,255,.06)}
.btn.danger{background:linear-gradient(180deg, rgba(255,77,109,.95), rgba(255,77,109,.70))}
.btn.good{background:linear-gradient(180deg, rgba(32,208,138,.95), rgba(32,208,138,.70))}
.hr{height:1px;background:var(--line);margin:14px 0}
.kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
@media(max-width:900px){.kpi{grid-template-columns:1fr}}
.kpi .box{
  background:rgba(255,255,255,.06);
  border:1px solid var(--line);
  border-radius:var(--r2);
  padding:12px 14px;
}
.kpi .box .k{font-size:12px;color:var(--muted);font-weight:800}
.kpi .box .v{font-size:20px;font-weight:900;margin-top:4px}

/* Balance bubbles */
.balance-bubbles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px;margin-bottom:6px}
@media(max-width:900px){.balance-bubbles{grid-template-columns:repeat(2,1fr)}}
.bb{border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:10px 12px;background:rgba(255,255,255,0.03);box-shadow:0 6px 18px rgba(0,0,0,0.18)}
.bb.off{opacity:0.55}
.bb .t{font-size:12px;color:var(--muted);font-weight:900;letter-spacing:.2px}
.bb .b{display:flex;align-items:center;justify-content:space-between;margin-top:6px}
.bb .amt{font-size:16px;font-weight:900}
.bb .st{font-size:12px;color:var(--muted);font-weight:900}
.table{width:100%;border-collapse:separate;border-spacing:0 10px}
.table th{text-align:left;color:var(--muted);font-size:12px;padding:0 10px}
.tr{background:rgba(255,255,255,.06);border:1px solid var(--line)}
.table td{padding:12px 10px;font-size:15px}
.badge{
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 12px;border-radius:999px;
  border:1px solid var(--line);
  background:rgba(0,0,0,.18);
  font-weight:900;
}
.badge.good{border-color:rgba(32,208,138,.35)}
.badge.bad{border-color:rgba(255,77,109,.35)}
.logline{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size:12px;
  background:rgba(0,0,0,.18);
  border:1px solid var(--line);
  border-radius:14px;
  padding:10px 12px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.small{font-size:13px}
.bigtitle{font-size:30px;font-weight:1000;margin:0 0 6px 0}
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.login-card{width:100%;max-width:520px;padding:22px}
.center{text-align:center}
.switch{position:relative;width:52px;height:28px;display:inline-block}
.switch input{display:none}
.slider{
  position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;
  background:rgba(255,255,255,.15);
  border:1px solid var(--line);
  transition:.18s;
  border-radius:999px;
}
.slider:before{
  position:absolute;content:"";
  height:22px;width:22px;left:3px;top:2px;
  background:white;
  transition:.18s;
  border-radius:999px;
}
.switch input:checked + .slider{
  background:rgba(32,208,138,.28);
  border-color:rgba(32,208,138,.45);
}
.switch input:checked + .slider:before{transform:translateX(24px)}
.inline{display:flex;align-items:center;gap:12px;flex-wrap:wrap}


/* ===== Bottom Ticker (Fixed) ===== */
#au_ticker_bar{
  position:fixed;
  left:0; right:0; bottom:0;
  z-index:9997;
  background: rgba(9,15,30,.72);
  border-top: 1px solid rgba(255,255,255,.10);
  backdrop-filter: blur(10px);
  overflow:hidden;
  padding:10px 0;
  font-size:15px;      /* büyüttüm */
  font-weight:700;
}
#au_ticker_track{
  display:inline-block;
  white-space:nowrap;
  padding-left:100%;
  animation: au_marquee 85s linear infinite;
}
@keyframes au_marquee{
  0%{ transform: translateX(0); }
  100%{ transform: translateX(-100%); }
}
/* Altta bar var, içerik üstüne binmesin */
body{ padding-bottom:60px; }




"""
BOTTOM_TICKER_HTML = """
<div id="au_ticker_bar">
  <div id="au_ticker_track">Loading...</div>
</div>
"""

BOTTOM_TICKER_JS = r"""
<script>
(function(){
  const track = document.getElementById("au_ticker_track");
  if(!track) return;

  function fmtTL(n){
    n = Number(n || 0);
    if(!isFinite(n) || n <= 0) return "—";
    return n.toFixed(2);          // ✅ TL daima 2 hane
  }

  function fmtTLPretty(n){
  n = Number(n || 0);
  if(!isFinite(n) || n <= 0) return "—";
  return n.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


  function fmtUSDT(n){
    n = Number(n || 0);
    if(!isFinite(n) || n <= 0) return "—";
    return n.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  async function load(){
    try{
      const r = await fetch("/api/ticker", { credentials: "same-origin" });
      const j = await r.json();
      if(!j || !j.ok) return;

      const usdtTry = Number(j.usdt_try || 0);
      const prices  = j.prices || {};

      // ✅ En başa: 1 USDT ≈ XX.XX TL
      let parts = [];
      parts.push("💵 1 USDT ≈ " + fmtTLPretty(usdtTry) + " TL");

      // ✅ Coinleri ekle: "AVAX/USDT: 13.56 USDT • 582.67 TL"
      Object.keys(prices).forEach((k)=>{
        const p = Number(prices[k] || 0);
        if(!p) return;
        const tl = p * usdtTry;
        parts.push("📈 " + k + ": " + fmtUSDT(p) + " USDT • " + fmtTLPretty(tl) + " TL");
      });

      const line = parts.join(' <span class="au_sep">•</span> ');
track.innerHTML = line + ' <span class="au_sep">•</span> ' + line;

    }catch(e){}
  }

  load();
  setInterval(load, 1000); // ✅ saniye saniye
})();
</script>

"""



def base_html(title: str, body: str, nav: str = "") -> str:
    # Login ekranında üst başlığı gizle (Atalay Ulusoy Auto Trade / Login yazısı görünmesin)
    show_topbar = not (((title or "").strip().lower() == "login") and not (nav or "").strip())

    topbar_html = f"""<div class="topbar">
        <div>
          <div class="brand">{APP_BRAND}</div>
          <div class="sub">{safe_str(title)}</div>
        </div>
        <div class="nav">{nav}</div>
      </div>""" if show_topbar else ""

    # Popup (tek sefer): session['popup_msg']
    _popup = safe_str(session.pop('popup_msg', '')).strip()
    popup_msg_js = _popup.replace('\\', '\\\\').replace('\n', '\\n').replace('"', '\\"')

    return f"""<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{safe_str(title) if title else APP_BRAND}</title>
  <style>{BASE_CSS}</style>
</head>
<body>
  <div class="bg"></div>
  <div class="container">
    {topbar_html}
    {body}
  </div>

  <!-- ✅ AU Modal (CSS'e dokunmadan inline) -->
  <div id="au_modal_backdrop" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:9998;"></div>
  <div id="au_modal" style="display:none; position:fixed; left:50%; top:18%; transform:translateX(-50%);
       width:min(520px, calc(100vw - 24px)); z-index:9999;">
    <div style="background:#0b1220; border:1px solid rgba(255,255,255,.10); border-radius:18px; padding:18px; box-shadow:0 18px 45px rgba(0,0,0,.55);">
      <div id="au_modal_title" style="font-weight:800; font-size:16px; margin-bottom:10px;"></div>
      <div id="au_modal_text" style="color:#cbd5e1; line-height:1.35; margin-bottom:14px; white-space:pre-line;"></div>
      <div style="display:flex; gap:10px; justify-content:flex-end;">
        <button id="au_modal_cancel" class="btn secondary" type="button">↩ Vazgeç</button>
        <button id="au_modal_ok" class="btn good" type="button">✅ Evet</button>
      </div>
    </div>
  </div>

  <script>
  (function(){{
    // ✅ Modal API
    window.AUConfirm = function(opts){{
      try{{
        var bd = document.getElementById("au_modal_backdrop");
        var m  = document.getElementById("au_modal");
        var t  = document.getElementById("au_modal_title");
        var tx = document.getElementById("au_modal_text");
        var ok = document.getElementById("au_modal_ok");
        var no = document.getElementById("au_modal_cancel");
        if(!bd || !m || !t || !tx || !ok || !no) return false;

        t.textContent  = (opts && opts.title) ? opts.title : "⚠ Onay";
        tx.textContent = (opts && opts.text) ? opts.text : "";
        ok.textContent = (opts && opts.okText) ? opts.okText : "✅ Onayla";
        no.textContent = (opts && opts.noText) ? opts.noText : "↩ Vazgeç";

        function close() {{
          bd.style.display = "none";
          m.style.display  = "none";
          ok.onclick = null;
          no.onclick = null;
          bd.onclick = null;
        }}

        ok.onclick = async function(){{ try{{ var r = (opts && opts.onOk) ? opts.onOk() : true; if(r && typeof r.then==="function") r = await r; if(r === false) return; close(); }}catch(e){{ try{{ console.error(e); }}catch(e2){{}} }} }};
        no.onclick = function(){{ close(); if(opts && opts.onCancel) opts.onCancel(); }};
        bd.onclick = function(){{ close(); if(opts && opts.onCancel) opts.onCancel(); }};

        bd.style.display = "block";
        m.style.display  = "block";
        return true;
      }}catch(e){{ return false; }}
    }};

    // ✅ Auto delete popup
    function bindAutoDeleteConfirms(){{
      document.querySelectorAll("form.js-auto-del").forEach(function(f){{
        if (f.__bound) return;
        f.__bound = true;
        f.addEventListener("submit", function(e){{
          e.preventDefault();
          e.stopPropagation();

          AUConfirm({{
            title: "⚠ Auto işlem silme",
            text: "Auto kuralı silinsin mi?\\n\\nOnaylarsan kalıcı olarak silinir.",
            okText: "✅ Evet, Sil",
            noText: "↩ Vazgeç",
            onOk: function(){{ f.submit(); }},
            onCancel: function(){{}}
          }});
          return false;
        }});
      }});
    }}

    document.addEventListener("DOMContentLoaded", bindAutoDeleteConfirms);
    setTimeout(bindAutoDeleteConfirms, 500);
  }})();
  </script>

  <!-- ✅ SADECE TEK ticker: alttaki iki satır -->
  {BOTTOM_TICKER_HTML}
  {BOTTOM_TICKER_JS}

  <script>
  (function(){{
    /* AU_POPUP_ONCE */
    try{{
      var msg = "{popup_msg_js}";
      if(msg && msg.trim()){{
        if(window.AUConfirm){{
          window.AUConfirm({{
            title: "⚠ Uyarı",
            text: msg,
            okText: "✅ Tamam",
            noText: "↩ Kapat",
            onOk: function(){{}},
            onCancel: function(){{}}
          }});
        }}else{{
          alert(msg);
        }}
      }}
    }}catch(e){{}}
  }})();
  </script>

</body>
</html>"""







def nav_html(is_admin: bool) -> str:
    items = [f'<a class="pill" href="/">{E_HOME} Panel</a>', f'<a class="pill" href="/test">{E_TST} Test</a>']
    if not is_admin:
        items.append(f'<a class="pill" href="/account">{E_LOCK} Şifre</a>')
    if is_admin:
        items.append(f'<a class="pill" href="/admin">{E_SHLD} Admin</a>')
        items.append(f'<a class="pill" href="/admin/contracts">{E_NOTE} Sözleşmeler</a>')
        items.append(f'<a class="pill" href="/admin/logs">{E_LOGS} Logs</a>')
        items.append(f'<a class="pill" href="/admin/new-user">{E_PLUS} Yeni Kullanıcı</a>')
    items.append(f'<a class="pill" href="/logout">{E_EXIT} Çıkış</a>')
    return "\n".join(items)

def exchange_select_options(selected: str) -> str:
    sel = safe_str(selected).upper()
    out = []
    for val, label in EXCHANGES:
        s = "selected" if val == sel else ""
        out.append(f'<option value="{val}" {s}>{label}</option>')
    return "\n".join(out)

# =========================
# GLOBAL JS (KESİNLİKLE DOSYA SEVİYESİNDE)
# =========================
AUTO_JS = r"""
<script>
(function () {
  function log(msg){
    try { console.log("[AUTO_SYMBOLS]", msg); } catch(e){}
  }

  // ✅ Searchable select (no CSS changes)
  function makeSelectSearchable(selectEl, placeholder){
    try{
      if(!selectEl || selectEl.__auSearchBound) return;
      selectEl.__auSearchBound = true;

      const wrap = document.createElement("div");
      wrap.style.margin = "8px 0 10px 0";

      const inp = document.createElement("input");
      inp.className = "input";
      inp.type = "text";
      inp.autocomplete = "off";
      inp.placeholder = placeholder || "Ara...";

      // Keep original options list (value/text)
      function snapshotOptions(){
        const opts = [];
        for(const o of Array.from(selectEl.options||[])){
          opts.push({value:o.value, text:o.textContent||""});
        }
        selectEl.__auAllOptions = opts;
      }

      function applyFilter(q){
        q = String(q||"").toLowerCase().trim();
        const all = selectEl.__auAllOptions || [];
        const curVal = selectEl.value;

        // rebuild options
        selectEl.innerHTML = "";
        for(const it of all){
          if(!q || (it.text.toLowerCase().includes(q) || it.value.toLowerCase().includes(q))){
            const o = document.createElement("option");
            o.value = it.value;
            o.textContent = it.text;
            selectEl.appendChild(o);
          }
        }

        // restore selection if still present
        if(curVal){
          const found = Array.from(selectEl.options).some(o => o.value === curVal);
          if(found) selectEl.value = curVal;
        }
      }

      snapshotOptions();

      inp.addEventListener("input", function(){
        applyFilter(inp.value);
      });

      // If options change dynamically (AUTO), caller can call refreshSnapshot()
      selectEl.__auRefreshSnapshot = function(){
        snapshotOptions();
        applyFilter(inp.value);
      };

      // Insert input right before select
      selectEl.parentNode.insertBefore(wrap, selectEl);
      wrap.appendChild(inp);

      // Small UX: focus search when select focused
      selectEl.addEventListener("focus", function(){
        try{ inp.focus(); }catch(e){}
      });

    }catch(e){}
  }

  function popup(msg){
    try{
      if (window.AUConfirm){
        window.AUConfirm({
          title: "⚠ Uyarı",
          text: String(msg||""),
          okText: "✅ Tamam",
          noText: "↩ Kapat",
          onOk: function(){},
          onCancel: function(){}
        });
        return;
      }
    }catch(e){}
    alert(String(msg||""));
  }

  async function loadAutoSymbols(){
    const exSel = document.getElementById("auto_exchange");
    const symSel = document.getElementById("auto_symbol");
    if(!exSel || !symSel) return false;

    const ex = (exSel.value || "").trim();
    symSel.innerHTML = '<option value="">COİN seç</option>';
    if(!ex) return true;

    try{
      const r = await fetch("/api/symbols?exchange=" + encodeURIComponent(ex), { credentials:"same-origin" });
      const j = await r.json().catch(()=>null);
      if(!j || !j.ok || !Array.isArray(j.symbols)){
        log("bad response: " + (j ? JSON.stringify(j) : "null"));
        return false;
      }

      for (let i=0; i<j.symbols.length; i++){
        const s = j.symbols[i];
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        symSel.appendChild(opt);
      }

      log("loaded " + j.symbols.length + " symbols for " + ex);
      try{ if(symSel && symSel.__auRefreshSnapshot) symSel.__auRefreshSnapshot(); }catch(e){}

      return true;
    }catch(e){
      log("fetch error: " + (e && e.message ? e.message : e));
      return false;
    }
  }

  function bindAuto(){
    const exSel = document.getElementById("auto_exchange");
    const symSel = document.getElementById("auto_symbol");
    const btn = document.getElementById("auto_save_btn");
    const allInCb = document.getElementById("auto_all_in");
    const usdtInp = document.getElementById("auto_usdt");
    makeSelectSearchable(symSel, "COİN ara (AUTO)");

    if(allInCb && usdtInp){
      function syncAllIn(){
        if(allInCb.checked){
          usdtInp.disabled = true;
          usdtInp.value = "";
          usdtInp.placeholder = "Tüm bakiye";
        }else{
          usdtInp.disabled = false;
          if(!usdtInp.placeholder) usdtInp.placeholder = "Örn: 20";
        }
      }
      allInCb.addEventListener("change", syncAllIn);
      syncAllIn();
    }

    if(!exSel || !symSel) return false;

    exSel.addEventListener("change", ()=>{ loadAutoSymbols(); });
    symSel.addEventListener("focus", ()=>{ loadAutoSymbols(); });

    // Kaydet butonu (HTML değişmeden)
    if(btn){
      btn.addEventListener("click", async function(){
        const ex = (exSel.value || "").trim();
        const sym = (symSel.value || "").trim();
        const allIn = (document.getElementById("auto_all_in")?.checked) ? "1" : "0";
        let usdt = (document.getElementById("auto_usdt")?.value || "").trim();

        if(!ex || !sym){
          popup("Borsa ve COİN zorunlu");
          return;
        }
        if(allIn !== "1" && !usdt){
          popup("USDT zorunlu (veya 'Tüm bakiye' seç)");
          return;
        }
        if(allIn === "1" && !usdt){
          usdt = "0";
        }
        try{
          const r = await fetch("/auto/create", {
            method: "POST",
            headers: {"Content-Type":"application/x-www-form-urlencoded"},
            body: new URLSearchParams({ exchange_id: ex, symbol: sym, usdt: usdt, all_in: allIn }),
            credentials: "same-origin"
          });
          if(!r.ok){
            const t = await r.text();
            popup("Kaydet başarısız: " + t);
            return;
          }
          location.reload();
        }catch(e){
          popup("Kaydet hata");
        }
      });
    }

    return true;
  }

  // ✅ Manual coin select search
  function bindManualSearch(){
    try{
      const ms = document.getElementById("manualSymbol");
      if(ms) makeSelectSearchable(ms, "COİN ara (MANUEL)");
    }catch(e){}
  }
  try{
    if(document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", bindManualSearch);
    }else{
      bindManualSearch();
    }
  }catch(e){}

  let tries = 0;
  const t = setInterval(async function(){
    tries++;
    bindAuto();
    const ok = await loadAutoSymbols();
    if(ok || tries >= 20){
      clearInterval(t);
      if(tries >= 20) log("giving up after 20 tries");
    }
  }, 300);

  async function pollPositions(){
    try{
      const r = await fetch("/api/positions", { credentials: "same-origin" });
      const j = await r.json().catch(()=>null);
      const arr = (j && j.positions) ? j.positions : [];
      for(const p of arr){
        const id = p.id;
        const curEl = document.getElementById("pos_cur_" + id);
        if(curEl){
          if(p.current_price === null || p.current_price === undefined){
            curEl.textContent = "—";
          }else{
            const v = Number(p.current_price);
            curEl.textContent = isFinite(v) ? v.toFixed(6) : "—";
          }
        }
        const pnlEl = document.getElementById("pos_pnl_" + id);
        if(pnlEl){
          const pnl = Number(p.pnl_usdt || 0);
          const ok = pnl >= 0;
          pnlEl.className = ok ? "badge good" : "badge bad";
          pnlEl.textContent = (ok ? "🟢 " : "🔴 ") + pnl.toFixed(4) + " USDT";
        }
      }
    }catch(e){}
  }

  pollPositions();
  setInterval(pollPositions, 1500);


// ✅ Edit (USDT) modal
function openEditModal(btn){
  try{
    var rid = btn.getAttribute("data-rid") || "";
    var ex  = btn.getAttribute("data-ex")  || "";
    var sym = btn.getAttribute("data-sym") || "";
    var usdt= btn.getAttribute("data-usdt")|| "";
    var allin = btn.getAttribute("data-allin")||"0";

    var html = ""
      + '<div style="margin:6px 0 10px 0;color:#cbd5e1"><b>' + sym + '</b> <span style="opacity:.7">(' + ex + ')</span></div>'
      + '<label style="display:flex;align-items:center;gap:10px;margin:10px 0 10px 0">'
      + '  <input type="checkbox" id="au_edit_allin" value="1"' + (allin==="1"?' checked':'') + '>'
      + '  <span>Tüm USDT bakiye ile al</span>'
      + '</label>'
      + '<div style="margin-top:10px">'
      + '  <div style="font-size:12px;opacity:.8;margin-bottom:6px">USDT</div>'
      + '  <input id="au_edit_usdt" class="input" inputmode="decimal" placeholder="Örn: 20" value="' + (allin==="1" ? '' : (String(usdt||"").trim())) + '">'
      + '</div>'
      + '<div style="margin-top:10px;color:#94a3b8;font-size:12px">Not: Tüm bakiye seçilirse USDT alanı boş kalabilir</div>';

    window.AUConfirm({
      title: "✏️ Auto kuralı düzenle",
      text: "",
      okText: "💾 Kaydet",
      noText: "↩ Vazgeç",
      onOk: async function(){
        try{
          var ck = document.getElementById("au_edit_allin");
          var allIn = ck && ck.checked ? "1" : "0";
          var inp = document.getElementById("au_edit_usdt");
          var val = inp ? String(inp.value||"").trim() : "";

          if(allIn !== "1"){
            if(!val){
              try{ popup("USDT zorunlu"); }catch(e){}
              return false;
            }
          }

          var body = new URLSearchParams({ usdt: val || "0", all_in: allIn });
          var r = await fetch("/auto/" + encodeURIComponent(rid) + "/update", {
            method:"POST",
            headers: {"Content-Type":"application/x-www-form-urlencoded"},
            body: body,
            credentials:"same-origin"
          });
          if(!r.ok){
            try{ popup("Güncelleme başarısız"); }catch(e){}
            return false;
          }
          location.reload();
          return true;
        }catch(e){
          try{ popup("Güncelleme hatası"); }catch(e2){}
          return false;
        }
      }
    });

    try{
      var t = document.getElementById("au_modal_text");
      if(t) t.innerHTML = html;
    }catch(e){}
  }catch(e){}
}

document.addEventListener("click", function(ev){
  var t = ev.target;
  if(!t) return;
  if(t.classList && t.classList.contains("js-auto-edit")){
    ev.preventDefault();
    openEditModal(t);
  }
}, true);

})();
</script>
"""

MANUAL_JS = r"""
<script>
(function(){
  function qs(id){ return document.getElementById(id); }

  async function postPrefs(){
    const ex = qs("manualExchange")?.value || "";
    const dry = qs("manualDryRun")?.value || "0";
    try{
      await fetch("/manual/prefs", {
        method: "POST",
        headers: {"Content-Type":"application/x-www-form-urlencoded"},
        body: new URLSearchParams({ exchange_id: ex, dry_run: dry }),
        credentials: "same-origin"
      });
    }catch(e){}
  }

  async function loadManualSymbols(){
    const exSel = qs("manualExchange");
    const symSel = qs("manualSymbol");
    if(!exSel || !symSel) return;

    const ex = (exSel.value || "").trim();
    const prev = symSel.value || "";
    symSel.innerHTML = '<option value="">COİN seç</option>';
    if(!ex) return;

    try{
      const r = await fetch("/api/symbols?exchange=" + encodeURIComponent(ex), { credentials:"same-origin" });
      const j = await r.json();
      if(!j || !j.ok || !Array.isArray(j.symbols)) return;

      j.symbols.forEach(s=>{
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        symSel.appendChild(opt);
      });

      if(prev) symSel.value = prev;
    }catch(e){}
  }

  function bindLiveConfirm(){
    const form = qs("manualForm");
    const drySel = qs("manualDryRun");
    if(!form || !drySel) return;

    const modal = qs("liveModal");
    const cancel = qs("liveCancel");
    const ok = qs("liveOk");

    form.addEventListener("submit", function(ev){
      // GERÇEK mod -> onaysız submit YOK
      if(drySel.value === "0"){
        ev.preventDefault();

        if(modal){
          qs("mEx").textContent  = qs("manualExchange")?.value || "-";
          qs("mSym").textContent = qs("manualSymbol")?.value || "-";
          qs("mAct").textContent = qs("manualAction")?.value || "-";
          qs("mAmt").textContent = qs("manualUsdt")?.value || "-";
          modal.style.display = "flex";
        }else{
          if(confirm("GERÇEK para ile işlem açılacak. Emin misin")) form.submit();
        }
      }
    });

    // Hızlı Miktar butonları (5 / 10 / 25 USDT)
    try{
      document.querySelectorAll('[data-qamt]').forEach(function(b){
        b.addEventListener('click', function(e){
          e.preventDefault();
          var v = (b.getAttribute('data-qamt') || '').trim();
          var inp = qs("manualUsdt");
          if(inp){ inp.value = v; inp.dispatchEvent(new Event('input')); inp.focus(); }
        });
      });
    }catch(e){}


    if(cancel && modal) cancel.addEventListener("click", ()=> modal.style.display="none");
    if(ok && modal) ok.addEventListener("click", ()=>{ modal.style.display="none"; form.submit(); });
  }

  document.addEventListener("DOMContentLoaded", function(){
    const exSel  = qs("manualExchange");
    const drySel = qs("manualDryRun");

    loadManualSymbols();
    bindLiveConfirm();

    if(exSel)  exSel.addEventListener("change", async ()=>{ await postPrefs(); await loadManualSymbols(); });
    if(drySel) drySel.addEventListener("change", async ()=>{ await postPrefs(); });
  });
})();
</script>
"""


POS_JS = r"""
<script>
(function(){
  async function refreshPositions(){
    try{
      const r = await fetch("/api/positions", {credentials:"same-origin"});
      if(!r.ok) return;
      const j = await r.json().catch(()=>null);
      if(!j || !Array.isArray(j.positions)) return;
      j.positions.forEach(p=>{
        const pid = p.id;
        const curEl = document.getElementById("pos_cur_" + pid);
        if(curEl) curEl.textContent = (p.current_price!=null) ? Number(p.current_price).toFixed(6) : "—";
        const pnlEl = document.getElementById("pos_pnl_" + pid);
        if(pnlEl){
          const pnl = Number(p.pnl_usdt||0);
          pnlEl.textContent = (p.pnl_usdt!=null) ? ((p.pnl_usdt>=0? "🟢 ":"🔴 ") + pnl.toFixed(4) + " USDT") : "—";
          if(p.pnl_usdt>=0){ pnlEl.classList.remove("bad"); pnlEl.classList.add("good"); }
          else { pnlEl.classList.remove("good"); pnlEl.classList.add("bad"); }
        }
      });
    }catch(e){}
  }
  setInterval(refreshPositions, 5000);
  window.addEventListener("load", refreshPositions);
})();
</script>
"""
# =========================
# CoinGecko Ticker Cache
# =========================
CG_MAP = {
    "BTC/USDT": "bitcoin",
    "ETH/USDT": "ethereum",
    "SOL/USDT": "solana",
    "BNB/USDT": "binancecoin",
    "XRP/USDT": "ripple",
    "ADA/USDT": "cardano",
    "DOGE/USDT": "dogecoin",
    "AVAX/USDT": "avalanche-2",
    "MATIC/USDT": "matic-network",
    "LINK/USDT": "chainlink",
    "DOT/USDT": "polkadot",
    "TRX/USDT": "tron",
    "SHIB/USDT": "shiba-inu",
    "LTC/USDT": "litecoin",
    "ATOM/USDT": "cosmos",
    "NEAR/USDT": "near",
    "ARB/USDT": "arbitrum",
    "OP/USDT": "optimism",
}

_ticker_cache = {"ts": 0.0, "usdt_try": 0.0, "prices": {}}

def _http_get_json(url: str, timeout: int = 8) -> dict:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AU-AutoTrade/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read().decode("utf-8", "ignore")
        return json.loads(raw) if raw else {}
    except Exception:
        return {}

def get_coingecko_ticker_cached(min_interval_sec: float = 3.0) -> dict:
    """
    CoinGecko'dan fiyatları çeker ama min_interval_sec içinde cache döndürür.
    Rate-limit yememek için şart.
    """
    now = time.time()
    if (now - float(_ticker_cache.get("ts") or 0.0)) < float(min_interval_sec):
        return _ticker_cache

    ids = ",".join(sorted(set(CG_MAP.values())))
    ids_q = urllib.parse.quote(ids)

    # Coin fiyatları (USD)
    url_prices = f"https://api.coingecko.com/api/v3/simple/price?ids={ids_q}&vs_currencies=usd"
    j = _http_get_json(url_prices) or {}

    # USDTRY (USDT ~ USD kabul edip TRY kuruna çarparız)
    url_fx = "https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=try"
    fx = _http_get_json(url_fx) or {}
    usdt_try = 0.0
    try:
        usdt_try = float(((fx.get("usd") or {}).get("try")) or 0.0)
    except Exception:
        usdt_try = 0.0

    out = {}
    for sym, cid in CG_MAP.items():
        try:
            px = float(((j.get(cid) or {}).get("usd")) or 0.0)
        except Exception:
            px = 0.0
        if px > 0:
            out[sym] = px

    _ticker_cache["ts"] = now
    _ticker_cache["usdt_try"] = usdt_try
    _ticker_cache["prices"] = out
    return _ticker_cache



@app.get("/symbols/<ex>")
def symbols_compat(ex: str):
    """
    Compatibility endpoint used by some older UI/JS: /symbols/OKX
    Returns: {"ok": true, "symbols": [...]}
    """
    rr = require_login()
    if rr:
        return rr

    exu = safe_str(ex).strip().upper()
    if exu not in ("OKX", "BINANCE", "GATEIO", "BYBIT"):
        exu = "OKX"
    try:
        syms = get_symbols_for_exchange(exu) or []
    except Exception:
        syms = []
    syms = [safe_str(s).strip().upper() for s in syms if safe_str(s).strip()]
    # normalize some common formats
    out = []
    for s in syms:
        s2 = s.replace("-", "/").replace("_", "/")
        if "USDT" in s2 and "/" not in s2 and s2.endswith("USDT") and len(s2) > 4:
            base = s2[:-4]
            s2 = base + "/USDT"
        out.append(s2)
    return jsonify({"ok": True, "symbols": out})

@app.get("/api/ticker")
def api_ticker():
    rr = require_login()
    if rr:
        return rr

    def _bn_price(sym: str) -> float:
        try:
            r = requests.get(
                "https://api.binance.com/api/v3/ticker/price",
                params={"symbol": sym},
                timeout=4,
            )
            j = r.json()
            return float(j.get("price") or 0.0)
        except Exception:
            return 0.0

    # USDT → TL
    usdt_try = _bn_price("USDTTRY")

    # İstediğin coin listesi (eklemek/silmek serbest)
    bn_syms = [
        "BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT",
        "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "TRXUSDT", "TONUSDT",
    ]

    prices = {}
    for s in bn_syms:
        px = _bn_price(s)
        if px > 0:
            base = s.replace("USDT", "")
            prices[f"{base}/USDT"] = px

    return jsonify({
        "ok": True,
        "usdt_try": usdt_try,
        "prices": prices
    })






# =========================
# Login
# =========================
@app.get("/login")
def login_get():
    body = f"""
{trial_banner_html}
<div class="login-wrap">
  <div class="card login-card">
    <div class="center">
      <div class="bigtitle">{APP_BRAND}</div>
      <div class="muted">Giriş yap ve kontrol paneline geç</div>
    </div>
    <div class="hr"></div>
    <form method="post" action="/login">
      <label>Kullanıcı adı</label>
      <input class="input" name="username" autocomplete="username" required>
      <label>Şifre</label>
      <input class="input" type="password" name="password" autocomplete="current-password" required>
      <div style="margin-top:14px;display:flex;gap:10px;justify-content:center">
        <button class="btn" type="submit">{E_LOCK} Giriş</button>
      </div>

      <div style="margin-top:12px;display:flex;justify-content:center">
        <a class="pill" href="/forgot">{E_MAIL} Şifremi unuttum</a>
      </div>
    </form>
  </div>
</div>
"""
    return base_html("Login", body, "")

@app.post("/login")
def login_post():
    username = safe_str(request.form.get("username"))
    password = safe_str(request.form.get("password"))

    ip = ""
    try:
        ip = _client_ip()
    except Exception:
        ip = ""

    u = get_user(username)
    if not u or not verify_password(password, u["salt"], u["password_hash"]):
        try:
            record_login_fail(ip)
        except Exception:
            pass
        time.sleep(0.6)
        return redirect("/login")

    try:
        clear_login_fail(ip)
    except Exception:
        pass

    session["username"] = u["username"]
    session["is_admin"] = int(u["is_admin"]) == 1
    # Restore manual trade prefs (persisted). Default: GERÇEK
    try:
        mex = safe_str(u.get("manual_exchange") or u.get("exchange_id") or DEFAULT_EXCHANGE).strip().upper()
        if mex not in ("OKX", "BINANCE", "GATEIO", "BYBIT"):
            mex = DEFAULT_EXCHANGE
        mdry = 1 if str(u.get("manual_dry_run") or "0").strip().lower() in ("1","true","on","yes") else 0
        session["manual_exchange"] = mex
        session["manual_dry_run"] = "1" if mdry == 1 else "0"
    except Exception:
        session["manual_exchange"] = DEFAULT_EXCHANGE
        session["manual_dry_run"] = "0"

    return redirect("/admin" if session["is_admin"] else "/")

# =========================
# Password: Forgot / Change
# =========================

# Basit rate limit (IP başına): çok spam olmasın
_PW_REQ_LAST: Dict[str, float] = {}

@app.get("/forgot")
def forgot_get():
    body = f"""
<div class="login-wrap">
  <div class="card login-card">
    <div class="center">
      <div class="bigtitle">{E_MAIL} Şifremi Unuttum</div>
      <div class="muted">Kullanıcı adını yaz. Talep admin'e iletilir</div>
    </div>
    <div class="hr"></div>

    <form method="post" action="/forgot">
      <label>Kullanıcı adı</label>
      <input class="input" name="username" autocomplete="username" required>
      <div style="margin-top:14px;display:flex;gap:10px;justify-content:center">
        <button class="btn" type="submit">{E_MAIL} Talep Gönder</button>
        <a class="btn secondary" href="/login">{E_BACK} Geri</a>
      </div>
    </form>
  </div>
</div>
"""
    return base_html("Şifre Talebi", body, "")

@app.post("/forgot")
def forgot_post():
    username = safe_str(request.form.get("username")).strip()
    ip = ""
    try:
        ip = _client_ip()
    except Exception:
        ip = ""

    # rate limit: aynı IP 60 sn
    now = time.time()
    last = float(_PW_REQ_LAST.get(ip, 0.0) or 0.0)
    if now - last < 60:
        # sessizce login'e dön
        session["popup_msg"] = f"{E_OK} Talep alındı"
        return redirect("/login")
    _PW_REQ_LAST[ip] = now

    u = get_user(username) if username else None
    display = user_display_name(u) if (u and isinstance(u, dict)) else (username or "Bilinmiyor")

    msg = "\n".join([
        f"{E_LOCK} Şifre Sıfırlama Talebi",
        f"{E_USER} Kullanıcı: {display}",
        f"{E_PIN} Username: {username}",
        f"{E_TIME} Zaman: {iso_now_local()}",
        f"{E_HOME} IP: {ip}",
        f"{E_NOTE} Admin panelden şifreyi değiştir",
    ])

    # Sadece admin DM
    telegram_send_admin_dm(msg)

    session["popup_msg"] = f"{E_OK} Talebin admin'e iletildi"
    return redirect("/login")


@app.get("/account")
def account_get():
    rr = require_login()
    if rr:
        return rr

    if bool(session.get("is_admin")):
        return redirect("/admin")

    body = f"""
<div class="grid">
  <div class="card">
    <h2>{E_LOCK} Şifre Değiştir</h2>
    <div class="muted">Eski şifreni doğrula, yeni şifreyi kaydet</div>
    <div class="hr"></div>

    <form method="post" action="/account/password">
      <label>Mevcut şifre</label>
      <input class="input" type="password" name="current_password" autocomplete="current-password" required>

      <label>Yeni şifre</label>
      <input class="input" type="password" name="new_password" autocomplete="new-password" required>

      <label>Yeni şifre tekrar</label>
      <input class="input" type="password" name="new_password2" autocomplete="new-password" required>

      <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn good" type="submit">{E_SAVE} Kaydet</button>
        <a class="btn secondary" href="/">{E_BACK} Panele dön</a>
      </div>
    </form>
  </div>
</div>
"""
    return base_html("Hesabım", body, nav_html(bool(session.get("is_admin"))))

@app.post("/account/password")
def account_password_post():
    rr = require_login()
    if rr:
        return rr

    if bool(session.get("is_admin")):
        return redirect("/admin")

    username = session.get("username") or ""
    u = get_user(username)
    if u and not isinstance(u, dict):
        u = dict(u)
    if not u:
        session.clear()
        return redirect("/login")

    cur_pw = safe_str(request.form.get("current_password"))
    new_pw = safe_str(request.form.get("new_password"))
    new_pw2 = safe_str(request.form.get("new_password2"))

    if not verify_password(cur_pw, u["salt"], u["password_hash"]):
        session["popup_msg"] = f"{E_X} Mevcut şifre yanlış"
        return redirect("/account")

    if not new_pw or len(new_pw) < 8:
        session["popup_msg"] = f"{E_WARN} Yeni şifre en az 8 karakter olmalı"
        return redirect("/account")

    if new_pw != new_pw2:
        session["popup_msg"] = f"{E_X} Yeni şifreler eşleşmiyor"
        return redirect("/account")

    salt = secrets.token_hex(8)
    pw_hash = hash_password(new_pw, salt)

    try:
        conn = db()
        conn.execute("UPDATE users SET salt=?, password_hash=? WHERE username=?",
                     (salt, pw_hash, username))
        conn.commit()
        conn.close()
    except Exception:
        try:
            conn.close()
        except Exception:
            pass
        session["popup_msg"] = f"{E_X} Şifre güncellenemedi"
        return redirect("/account")

    # Admin'e bilgi (DM only), spam yok
    try:
        msg = "\n".join([
            f"{E_LOCK} Şifre değiştirildi",
            f"{E_USER} {user_display_name(u)}",
            f"{E_TIME} {iso_now_local()}",
        ])
        telegram_send_admin_dm(msg)
    except Exception:
        pass

    # güvenlik: yeniden login
    session.clear()
    session["popup_msg"] = f"{E_OK} Şifre güncellendi. Tekrar giriş yap"
    return redirect("/login")


@app.get("/logout")
def logout():
    session.clear()
    return redirect("/login")

# =========================
# Manual prefs (F5 kalıcılık)
# =========================


# =========================
# Contract (Sözleşme) UI + accept
# =========================
@app.get("/contract")
def contract_view():
    rr = require_login()
    if rr:
        return rr

    username = session["username"]
    u = get_user(username)
    if u and not isinstance(u, dict):
        u = dict(u)
    if not u:
        session.clear()
        return redirect("/login")

    # already accepted -> home
    if user_contract_accepted(u):
        return redirect("/")

    # Prefill
    full_name_pref = safe_str(u.get("contract_full_name") or safe_str(u.get("display_name") or ""))
    tc_pref = safe_str(u.get("contract_tc") or "")

    # Build "preview" body with placeholders (signature empty)
    ip = _client_ip()
    now_local = datetime.utcnow() + timedelta(hours=TZ_OFFSET_HOURS)
    dt_str = now_local.strftime("%Y-%m-%d %H:%M:%S")
    preview_text = build_contract_text(full_name_pref, username, tc_pref, dt_str, ip)

    body = f"""
<div style="position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.65);display:flex;align-items:flex-start;justify-content:center;padding:24px;overflow:auto">
  <div class="card" style="width:min(980px,100%);margin:auto">
  <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
    <h2>{E_NOTE} {CONTRACT_TITLE}</h2>
    <div class="muted small">Zorunlu • 1 kez</div>
  </div>
  <div class="hr"></div>

  <form method="post" action="/contract/accept">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div>
        <label>Ad</label>
        <input class="input" name="first_name" placeholder="Ad" value="{safe_str((full_name_pref.split(' ')[0] if full_name_pref else ''))}">
      </div>
      <div>
        <label>Soyad</label>
        <input class="input" name="last_name" placeholder="Soyad" value="{safe_str((' '.join(full_name_pref.split(' ')[1:]) if full_name_pref and len(full_name_pref.split(' '))>1 else ''))}">
      </div>
    </div>

    <div style="margin-top:10px">
      <label>T.C. Kimlik No <span class="muted small">(opsiyonel)</span></label>
      <input class="input" name="tc" placeholder="T.C. Kimlik No" value="{tc_pref}">
    </div>

    <div class="hr"></div>

    <div style="max-height:420px;overflow:auto;padding:14px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,0.03)">
      <div class="muted small" style="white-space:pre-wrap;line-height:1.55">{html_escape(preview_text)}</div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:12px">
      <label style="display:flex;align-items:center;gap:10px;margin:0">
        <input type="checkbox" name="agree" value="1">
        <span>Okudum, kabul ediyorum</span>
      </label>
      <button class="btn good" type="submit">Onayla</button>
    </div>
  </form>
</div>
  </div>
</div>
"""
    return base_html(CONTRACT_TITLE, body, nav_html(False))

@app.post("/contract/accept")
def contract_accept():
    rr = require_login()
    if rr:
        return rr

    username = session["username"]
    u = get_user(username)
    if u and not isinstance(u, dict):
        u = dict(u)
    if not u:
        session.clear()
        return redirect("/login")

    if user_contract_accepted(u):
        return redirect("/")

    agree = safe_str(request.form.get("agree") or "")
    if agree != "1":
        # same UI, quick message
        body = f"""
<div class="card">
  <h2>{E_X} Onay Gerekli</h2>
  <div class="muted">Devam etmek için sözleşmeyi kabul etmelisin.</div>
  <div class="hr"></div>
  <a class="btn" href="/contract">{E_BACK} Geri</a>
</div>
"""
        return base_html(CONTRACT_TITLE, body, nav_html(False))

    first = safe_str(request.form.get("first_name") or "")
    last = safe_str(request.form.get("last_name") or "")
    full_name = (first + " " + last).strip()
    tc = safe_str(request.form.get("tc") or "")
    ip = _client_ip()

    now_local = datetime.utcnow() + timedelta(hours=TZ_OFFSET_HOURS)
    dt_str = now_local.strftime("%Y-%m-%d %H:%M:%S")
    body_txt = build_contract_text(full_name, username, tc, dt_str, ip)
    accepted_ts = now_ts()

    conn = db()
    try:
        conn.execute(
            "INSERT INTO contracts(username, full_name, tc, ip, accepted_at, version, body) VALUES(?,?,?,?,?,?,?)",
            (username, full_name, tc, ip, int(accepted_ts), CONTRACT_VERSION, body_txt)
        )
        conn.execute(
            "UPDATE users SET contract_accepted_at=?, contract_full_name=?, contract_tc=?, contract_ip=? WHERE username=?",
            (int(accepted_ts), full_name, tc, ip, username)
        )
        conn.commit()
    finally:
        conn.close()

    try:
        log_line(username, "INFO", f"CONTRACT accepted v={CONTRACT_VERSION} ip={ip}")
    except Exception:
        pass

    # Telegram admin DM notify (IP dahil) - grup yok
    try:
        if safe_str(globals().get("TG_ADMIN_DM_ID", "")):
            # Görseldeki stile yakın: başlık + kullanıcı + ad soyad + zaman + IP
            msg = "\\n".join([
                f"{E_NOTE} Sözleşme onayı alındı",
                f"{E_USER} {username}",
                f"{full_name if full_name else '-'}",
                f"{dt_str}",
                f"IP: {ip}",
            ])
            telegram_send_to(TG_ADMIN_DM_ID, msg)
    except Exception:
        pass


    return redirect("/")

@app.before_request
def _contract_guard_before_request():
    # Logged-in kullanıcı sözleşmeyi 1 kere kabul etmeden ana UI'ye girmesin.
    try:
        pth = safe_str(request.path or "")
        if not session.get("username"):
            return None

        # allow these paths
        if pth.startswith("/contract") or pth.startswith("/logout") or pth.startswith("/login") or pth.startswith("/forgot"):
            return None
        if pth.startswith("/admin"):
            return None
        if pth.startswith("/webhook"):
            return None
        if pth.startswith("/api/") or pth.startswith("/api"):
            return None
        if pth.startswith("/static"):
            return None

        username = safe_str(session.get("username") or "")
        if not username:
            return None
        u = get_user(username)
        if u and not isinstance(u, dict):
            u = dict(u)
        if not u:
            return None

        # Admin bypass (optional)
        if int(u.get("is_admin") or 0) == 1:
            return None

        if not user_contract_accepted(u):
            return redirect("/contract")
    except Exception:
        return None
    return None

@app.post("/manual/prefs")
def manual_prefs():
    rr = require_login()
    if rr:
        return rr

    username = session.get("username") or ""
    if not username:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    # default: LIVE (dry_run=0)
    mode_raw = safe_str(request.form.get("dry_run") or session.get("manual_dry_run") or "0").strip().lower()
    ex = safe_str(request.form.get("exchange_id") or session.get("manual_exchange") or "OKX").strip().upper()

    dry = 1 if mode_raw in ("1", "true", "on", "yes") else 0  # 1=TEST, 0=GERÇEK
    if ex not in ("OKX", "BINANCE", "GATEIO", "BYBIT"):
        ex = "OKX"

    session["manual_dry_run"] = "1" if dry == 1 else "0"
    session["manual_exchange"] = ex

    conn = db()
    try:
        conn.execute("UPDATE users SET manual_exchange=?, manual_dry_run=? WHERE username=?", (ex, int(dry), username))
        conn.commit()
    finally:
        conn.close()

    return jsonify({"ok": True})


@app.post("/settings/daily-loss")
def user_set_daily_loss():
    rr = require_login()
    if rr:
        return rr
    username = session.get("username") or ""
    raw = (request.form.get("daily_loss_limit_usdt") or "").strip().replace(",", ".")
    try:
        v = float(raw) if raw else 0.0
    except Exception:
        v = 0.0
    if v < 0:
        v = 0.0
    if v > 1000000:
        v = 1000000.0
    set_daily_loss_limit(username, v)
    return redirect("/")

@app.post("/trade/toggle")
def trade_toggle():
    rr = require_login()
    if rr:
        return rr

    username = session["username"]
    u = get_user(username)
    if not u:
        session.clear()
        return redirect("/login")

    cur = 1 if int(u.get("trade_enabled") or 0) == 1 else 0
    newv = 0 if cur == 1 else 1

    conn = db()
    try:
        conn.execute("UPDATE users SET trade_enabled=? WHERE username=?", (newv, username))
        conn.commit()
    finally:
        conn.close()

    log_line(username, "INFO", f"Trade toggled -> {newv}")
    return redirect("/")

# =========================
# User Contracts (Sözleşmeler): view + PDF download (user-side)
# =========================
@app.get("/contracts")
def user_contracts():
    rr = require_login()
    if rr:
        return rr

    # Admin panelde sözleşmeler kaldırıldı; admin bu sayfaya yönlenmesin
    if session.get("is_admin"):
        return redirect("/admin")

    username = session["username"]
    u = get_user(username)
    if u and not isinstance(u, dict):
        u = dict(u)
    if not u:
        session.clear()
        return redirect("/login")

    # Kullanıcı sözleşme onaylamadıysa direkt onay ekranına
    if not user_contract_accepted(u):
        return redirect("/contract")

    rows = []
    try:
        conn = db()
        try:
            rows = conn.execute(
                "SELECT id, accepted_at, ip, version FROM contracts WHERE username=? ORDER BY accepted_at DESC LIMIT 25",
                (username,)
            ).fetchall()
        finally:
            conn.close()
    except Exception:
        rows = []

    def _fmt_ts(ts: int) -> str:
        try:
            ts = int(ts or 0)
        except Exception:
            ts = 0
        if ts <= 0:
            return "-"
        try:
            dt = datetime.fromtimestamp(ts, tz=timezone.utc) + timedelta(hours=TZ_OFFSET_HOURS)
            return dt.strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            return safe_str(ts)

    trs = []
    for r in rows:
        # sqlite row
        rid = r["id"] if isinstance(r, dict) else r[0]
        accepted_at = r["accepted_at"] if isinstance(r, dict) else r[1]
        ip = r["ip"] if isinstance(r, dict) else r[2]
        ver = r["version"] if isinstance(r, dict) else r[3]
        trs.append(
            f"""<tr>
<td style='font-weight:800'>#{rid}</td>
<td>{html_escape(_fmt_ts(accepted_at))}</td>
<td>{html_escape(safe_str(ip))}</td>
<td>{html_escape(safe_str(ver) or "-")}</td>
<td><a class="pill" href="/contracts/{rid}.pdf" target="_blank">{E_NOTE} PDF</a></td>
</tr>"""
        )

    body = f"""
<div class="card" style="margin-top:14px">
  <div style="font-size:18px;font-weight:900;display:flex;align-items:center;gap:10px">
    {E_NOTE} Sözleşmeler
  </div>
  <div class="muted" style="margin-top:6px">Kendi sözleşme kayıtların • PDF indir</div>
  <div style="margin-top:12px;overflow:auto">
    <table class="table" style="min-width:700px">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tarih</th>
          <th>IP</th>
          <th>Versiyon</th>
          <th>İndir</th>
        </tr>
      </thead>
      <tbody>
        {''.join(trs) if trs else '<tr><td colspan="5" class="muted">Kayıt bulunamadı</td></tr>'}
      </tbody>
    </table>
  </div>
</div>
"""
    return render_page("Sözleşmeler", nav_html(False), body)

@app.get("/contracts/<int:cid>.pdf")
def user_contract_pdf(cid: int):
    rr = require_login()
    if rr:
        return rr
    if session.get("is_admin"):
        return redirect("/admin")

    username = session["username"]
    row = None
    try:
        conn = db()
        try:
            row = conn.execute("SELECT * FROM contracts WHERE id=? AND username=? LIMIT 1", (cid, username)).fetchone()
        finally:
            conn.close()
    except Exception:
        row = None

    if not row:
        return ("Not found", 404)
    if row and not isinstance(row, dict):
        row = dict(row)

    pdf_bytes = _contract_pdf_bytes(row)
    fn = f"sozlesme_{safe_str(username)}_{cid}.pdf"
    return _send_bytes(pdf_bytes, fn, "application/pdf")

# =========================
# User dashboard
# =========================
@app.get("/")
def user_dashboard():
    return _render_user_dashboard(False)

@app.get("/test")
def user_test():
    return _render_user_dashboard(True)

@app.post("/test/reset")
def test_reset():
    rr = require_login()
    if rr:
        return rr
    # Test verilerini sıfırla: varsa paper test tablolarını temizle, yoksa sessiz geç
    try:
        with sqlite3.connect(DB_PATH) as con:
            cur = con.cursor()
            for t in ["paper_test_trades", "paper_test_positions", "paper_test_state"]:
                try:
                    cur.execute(f"DELETE FROM {t}")
                except Exception:
                    pass
            # başlangıç state
            try:
                cur.execute("INSERT INTO paper_test_state(id, usdt, pnl, fee, last_px) VALUES(1, ?, 0.0, 0.0, 0.0) ON CONFLICT(id) DO UPDATE SET usdt=excluded.usdt, pnl=0.0, fee=0.0, last_px=0.0", (100000.0,))
            except Exception:
                pass
            con.commit()
    except Exception:
        pass
    return redirect("/test")

def _render_user_dashboard(test_view: bool = False):
    rr = require_login()
    if rr:
        return rr

    username = session["username"]
    u = get_user(username)
    if u and not isinstance(u, dict):
        u = dict(u)
    if not u:
        session.clear()
        return redirect("/login")


    # Sözleşme: kullanıcı ilk girişte onaylamadan panele giremez (admin hariç)
    if (not session.get("is_admin")) and (not user_contract_accepted(u)):
        return redirect("/contract")

    # 4 borsa bakiyesi (API yoksa 0.0)
    if test_view:
        st = paper_test_ensure_state(username)
        # Test: yalnızca seçili borsada sanal USDT göster, diğerleri 0
        bals = {
            "OKX": float(st.get("usdt") or 0.0),
            "BINANCE": 0.0,
            "BYBIT": 0.0,
            "GATE": 0.0,
        }
    else:
        bals = get_user_exchange_usdt_balances(u)
    balances_txt = format_balances_line(bals)

    # Balance bubbles (hangi borsaya API girdiyse sadece onda 'API ✔' görünsün)
    def _bb(slug: str, name: str, val: float, has_api: bool) -> str:
        cls = "bb" if has_api else "bb off"
        st = "API ✔" if has_api else "API YOK"
        return (
            f'<div class="{cls}">'
            f'  <div class="t">{name}</div>'
            f'  <div class="b">'
            f'    <div class="amt">{val:.2f} USDT</div>'
            f'    <div class="st">{st}</div>'
            f'  </div>'
            f'</div>'
    )


    def _has_api_for(ex_id: str) -> bool:
        try:
            kk = _keys_for_exchange(u, ex_id)
            if not isinstance(kk, dict):
                return False
            k = safe_str(kk.get("api_key") or "").strip()
            s = safe_str(kk.get("api_secret") or "").strip()
            p = safe_str(kk.get("api_passphrase") or kk.get("api_password") or "").strip()
            if ex_id.upper() == "OKX":
                return bool(k and s and p)
            return bool(k and s)
        except Exception:
            return False

    okx_has  = _has_api_for("OKX")
    bin_has  = _has_api_for("BINANCE")
    byb_has  = _has_api_for("BYBIT")
    gate_has = _has_api_for("GATE")

    balances_bubbles = (
        '<div class="balance-bubbles">'
        + _bb('okx', 'OKX', float(bals.get('OKX', 0.0) or 0.0), okx_has)
        + _bb('binance', 'Binance', float(bals.get('BINANCE', 0.0) or 0.0), bin_has)
        + _bb('bybit', 'Bybit', float(bals.get('BYBIT', 0.0) or 0.0), byb_has)
        + _bb('gate', 'Gate.io', float(bals.get('GATE', 0.0) or 0.0), gate_has)
        + '</div>'
    )

    usage_badge = format_usage_badge(u)
    trade_ok = may_trade(u)

    trade_is_on = (int(u.get("trade_enabled") or 0) == 1)

    trade_toggle_btn = f"""
     <form method="post" action="/trade/toggle" style="display:inline">
      <button class="btn {'good' if trade_is_on else 'danger'}" type="submit">
      {E_ON if trade_is_on else E_OFF} {'ON' if trade_is_on else 'OFF'}
     </button>
     </form>
     """

    trade_badge = trade_toggle_btn
    status_badge = (f'<span class="badge good">{E_OK} Aktif</span>' if trade_ok else f'<span class="badge bad">{E_STOP} Kısıtlı</span>')

    if test_view:
        # Paper test istatistikleri (kapanan işlemler)
        usdt_try = _get_usdt_try_rate() or 40.0
        nowi = now_ts()
        def _paper_period_stats(sec: int):
            conn = db_connect()
            try:
                cur = conn.cursor()
                # Determine which timestamp and pnl column exists (schema may vary)
                cur.execute("PRAGMA table_info(paper_test_trades)")
                cols = {r[1] for r in cur.fetchall()}
                ts_col = "ts_close" if "ts_close" in cols else ("closed_at" if "closed_at" in cols else ("closed_ts" if "closed_ts" in cols else ("close_ts" if "close_ts" in cols else None)))
                if not ts_col:
                    return {"count": 0, "pnl": 0.0, "ratio": 0.0}

                pnl_col = None
                for cand in ["pnl_net_usdt", "pnl_net", "pnl_usdt", "pnl"]:
                    if cand in cols:
                        pnl_col = cand
                        break
                if not pnl_col:
                    pnl_col = "pnl_net_usdt"  # will be added by migrations, but keep fallback

                since = int(time.time()) - int(sec)

                if ts_col in ("closed_at",):
                    q = f"SELECT COUNT(1), COALESCE(SUM({pnl_col}),0) FROM paper_test_trades WHERE username=? AND {ts_col}>=?"
                    row = cur.execute(q, (username, since)).fetchone()
                else:
                    # text timestamp fallback (ISO). approximate by filtering in python
                    q = f"SELECT {pnl_col}, {ts_col} FROM paper_test_trades WHERE username=?"
                    rows = cur.execute(q, (username,)).fetchall()
                    cnt = 0
                    pnl = 0.0
                    for r in rows:
                        try:
                            ts = r[1] or ""
                            # if stored as int in string
                            if ts.isdigit():
                                tsv = int(ts)
                            else:
                                tsv = 0
                            if tsv >= since:
                                cnt += 1
                                pnl += float(r[0] or 0.0)
                        except Exception:
                            pass
                    row = (cnt, pnl)

                cnt = int(row[0] or 0)
                pnl_usdt = float(row[1] or 0.0)

                # USDT->TL (approx). Use app cache if exists, else fallback.
                usdtry = float(getattr(app, "USDTRY_RATE", 43.0) or 43.0)
                pnl_tl = pnl_usdt * usdtry
                ratio = 0.0
                # ratio against start balance if exists
                try:
                    st = paper_test_get_state(username)
                    base = float(st.get("start_usdt") or st.get("usdt") or 0.0)
                    if base > 0:
                        ratio = (pnl_usdt / base) * 100.0
                except Exception:
                    pass

                return {"count": cnt, "pnl": pnl_tl, "ratio": ratio}
            finally:
                conn.close()
        day = _paper_period_stats(86400)
        week = _paper_period_stats(7*86400)
        month = _paper_period_stats(30*86400)
    else:
        day = stats_for_user(username, "day")
        week = stats_for_user(username, "week")
        month = stats_for_user(username, "month")

    manual_dry_run = session.get("manual_dry_run", "1")  # "1" TEST, "0" GERÇEK
    sel_dry = "selected" if manual_dry_run == "1" else ""
    sel_live = "selected" if manual_dry_run == "0" else ""

    u_exchange = safe_str(u.get("exchange_id", "")).strip().upper()
    default_ex = safe_str(session.get("manual_exchange") or u_exchange or DEFAULT_EXCHANGE).strip().upper()
    if default_ex not in ("OKX", "BINANCE", "GATEIO", "BYBIT"):
        default_ex = "OKX"

    ex_okx = "selected" if default_ex == "OKX" else ""
    ex_bin = "selected" if default_ex == "BINANCE" else ""
    ex_gate = "selected" if default_ex == "GATEIO" else ""
    ex_byb = "selected" if default_ex == "BYBIT" else ""

    symbols = get_symbols_for_exchange(default_ex)
    symbol_options = "".join([f'<option value="{s}">{s}</option>' for s in symbols])

    script = AUTO_JS + MANUAL_JS + POS_JS

    def stat_box(title: str, s: Dict[str, Any]) -> str:
        pnl_try = float(s["pnl_try"])
        pct = float(s["pct"])
        sign = E_ON if pnl_try >= 0 else E_OFF
        return f"""
        <div class="box">
          <div class="k">{title}</div>
          <div class="v">{sign} {int(s["count"])} işlem</div>
          <div class="muted" style="margin-top:6px;font-weight:900">Kar Zarar: {pnl_try:,.2f} TL</div>
          <div class="muted" style="font-weight:900">Oran: {pct:.2f} %</div>
        </div>
        """

    # pending signals
    conn = db()
    pending = conn.execute("""
        SELECT * FROM pending_signals
        WHERE username=? AND status='PENDING'
        ORDER BY id DESC
        LIMIT 50
    """, (username,)).fetchall()
    conn.close()

    pending_rows = ""
    if pending:
        for p in pending:
            pid = int(p["id"] or 0)
            action = safe_str(p["action"]).upper()
            symbol = safe_str(p["symbol"]).upper()
            req_usdt = float(p["requested_usdt"] or 0.0)
            dry_run = int(p["dry_run"]) == 1

            # ✅ FIX: ex tanımlı olsun (pending_signals içinden çek)
            ex_name = safe_str((p["exchange_id"] if "exchange_id" in p.keys() else "") or "").strip().upper()
            if not ex_name:
                ex_name = safe_str(u.get("exchange_id") or DEFAULT_EXCHANGE).strip().upper()

            created = datetime.utcfromtimestamp(int(p["created_at"] or 0) or 0) + timedelta(hours=TZ_OFFSET_HOURS)
            created_s = created.strftime("%Y-%m-%d %H:%M:%S")

            badge = f'<span class="badge {"good" if action=="BUY" else "bad"}">{(E_ON + " BUY") if action=="BUY" else (E_OFF + " SELL")}</span>'
            pending_rows += f"""
    <tr class="tr">
      <td>{badge}</td>
      <td><b>{symbol}</b><div class="muted small">{created_s}</div></td>
      <td>{req_usdt:.2f} USDT</td>
      <td>{(E_TST + " TEST") if dry_run else (E_BOOM + " GERÇEK")}</td>
      <td style="display:flex;gap:8px;flex-wrap:wrap">
    <form method="post" action="/signal/{pid}/approve" style="display:inline"
          data-ex="{ex_name}" data-sym="{symbol}" data-usdt="{req_usdt:.2f}" data-action="{action}">
      <button class="btn good" type="submit">{E_OK} Onayla</button>
    </form>

    <form method="post" action="/signal/{pid}/deny" style="display:inline">
      <button class="btn secondary" type="submit">{E_BROOM} Reddet</button>
    </form>
      </td>
    </tr>
    """
    else:
        pending_rows = '<tr class="tr"><td colspan="5"><div class="muted">Bekleyen sinyal yok</div></td></tr>'


    # open positions (manual buys stay here; you can enqueue SELL)
    pos_rows = ""
    try:
        positions = paper_test_list_positions(username) if test_view else list_positions(username)
        if positions:
            for p in positions:
                pid = int(p.get("id") or 0)
                ex_name = safe_str(p.get("exchange_id") or "").upper()
                sym = safe_str(p.get("symbol") or "").upper()
                qty = float(p.get("qty") or 0.0)
                entry = float(p.get("entry_price") or 0.0)
                entry_usdt = float(p.get("entry_usdt") or 0.0)

                # qty bazen yanlış kaydedilmiş olabilir; güvenli hesap
                qty_eff = qty
                if entry > 0 and entry_usdt > 0:
                    q_calc = entry_usdt / entry
                    if q_calc > 0 and (qty_eff <= 0 or qty_eff > q_calc * 5):
                        qty_eff = q_calc

                # İlk render için (sonrasında JS /api/positions ile güncellenecek)
                try:
                    cur = float(get_market_price(ex_name, sym) or 0.0) if (ex_name and sym) else 0.0
                except Exception:
                    cur = 0.0
                cur_txt = f"<span id='pos_cur_{pid}'>{cur:.6f}</span>" if cur else f"<span id='pos_cur_{pid}'>—</span>"

                pnl = (cur - entry) * qty if (cur > 0 and entry > 0 and qty > 0) else 0.0
                pnl_txt = f"<span id='pos_pnl_{pid}' class='badge {'good' if pnl>=0 else 'bad'}'>{(E_ON if pnl>=0 else E_OFF)} {pnl:.2f} USDT</span>"

                pos_rows += f"""
    <tr class="tr">
      <td><b>{sym}</b><div class="muted small">{ex_name}</div></td>
      <td>{entry:.2f}</td>
      <td>{cur_txt}</td>
      <td>{entry_usdt:.2f} USDT</td>
      <td>{pnl_txt}</td>
      <td style="display:flex;gap:8px;flex-wrap:wrap">
    {sell_btn}
      </td>
    </tr>
    """
        else:
            pos_rows = '<tr class="tr"><td colspan="6"><div class="muted">Açık pozisyon yok</div></td></tr>'
    except Exception:
        pos_rows = '<tr class="tr"><td colspan="6"><div class="muted">Pozisyonlar yüklenemedi</div></td></tr>'


    # auto rows
    auto_rows_html = ""
    try:
        rules = auto_list(username)
        if rules:
            for r in rules:
                ex_name = ""
                rid = int(r.get("id") or 0)
                ex_name = safe_str(r.get("exchange_id") or "").upper()
                sym = safe_str(r.get("symbol") or "").upper()
                usdt = float(r.get("usdt") or 0.0)

                enabled = int(r.get("enabled") or 0) == 1

                badge = f'<span class="badge good">{E_ON} Açık</span>' if enabled else f'<span class="badge bad">{E_OFF} Kapalı</span>'
                btn_txt = f"{E_PAUS} Durdur" if enabled else f"{E_PLAY} Başlat"
                btn_val = "0" if enabled else "1"

                auto_rows_html += f"""
    <tr class="tr">
      <td><b>{sym}</b><div class="muted small">{ex_name}</div></td>
      <td>{('Tüm Bakiye' if usdt < 0 else f'{usdt:.2f} USDT')}</td>
      <td>{badge}</td>
      <td style="display:flex;gap:8px;flex-wrap:wrap">
    <button class="btn secondary js-auto-edit" type="button"
      data-rid="{rid}" data-ex="{ex_name}" data-sym="{sym}" data-usdt="{usdt}" data-allin="{('1' if usdt < 0 else '0')}">✏️ Düzenle</button>
    <form method="post" action="/auto/{rid}/toggle" style="display:inline">
      <input type="hidden" name="enabled" value="{btn_val}">
      <button class="btn secondary" type="submit">{btn_txt}</button>
    </form>
    <form method="post" action="/auto/{rid}/delete" class="inline js-auto-del">
      <button class="btn secondary" type="submit">{E_TRASH} Sil</button>
    </form>
      </td>
    </tr>
    """
        else:
            auto_rows_html = '<tr class="tr"><td colspan="4"><div class="muted">Auto işlem yok</div></td></tr>'
    except Exception:
        auto_rows_html = '<tr class="tr"><td colspan="4"><div class="muted">Auto tablo hazır değil</div></td></tr>'

    
    is_trial = is_trial_user(u)

    trial_banner_html = ""
    test_banner_html = ""
    if test_view:
        test_banner_html = f"""
        <div class="card" style="margin-bottom:16px;border:1px solid rgba(255,255,255,.12)">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
            <div>
              <div style="font-weight:900;font-size:16px">🧪 TEST PANEL</div>
              <div class="muted" style="margin-top:6px">Bu sayfa gerçek emir göndermez • Sanal bakiye ile senaryo testi</div>
            </div>
            <form method="post" action="/test/reset" style="margin:0">
              <button class="btn secondary" type="submit">🔄 Test Bakiyeyi Sıfırla</button>
            </form>
          </div>
        </div>
        """

    if is_trial:
        trial_banner_html = f"""
        <div class="card" style="margin-bottom:16px;border:1px solid rgba(255,255,255,.12)">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
            <div>
              <div style="font-weight:900;font-size:16px">🧪 Deneme Modu Aktif</div>
              <div class="muted" style="margin-top:6px">Ücretli pakete geçmek için butona bas. Talep bana DM olarak gelir</div>
            </div>
            <form method="post" action="/trial/upgrade" style="margin:0">
              <button class="btn good" type="submit">💳 Ücretli Pakete Geç</button>
            </form>
          </div>
        </div>
        """

    
    # Global AUTO mod bilgisi (user değiştiremez)
    g = get_auto_gate(username) if AUTO_REGIME_ENABLED else {"gate": 1, "mode": get_global_auto_mode(), "reason": ""}
    gate_v = int((g or {}).get("gate") or 0)
    mode_v = safe_str((g or {}).get("mode") or get_global_auto_mode()).upper() or get_global_auto_mode()
    reason_v = safe_str((g or {}).get("reason") or "")

    mode_label = "✅ NORMAL"
    if mode_v == "AGGRESSIVE":
        mode_label = "🔥 AGRESİF"
    elif mode_v == "HARD":
        mode_label = "🧊 HARD"

    # User panel: teknik detay gizli, sadece özet göster
    user_reason = "Piyasa uygun • Otomatik trade aktif" if gate_v==1 else "Piyasa uygun değil • Sinyaller beklemede"

    auto_mode_box = f"""<div class="box">
        <div class="k">🔥 Auto Mod</div>
        <div class="v">
          <span class="badge">{mode_label}</span>
          <span class="badge {'good' if gate_v==1 else 'bad'}">{E_ON if gate_v==1 else E_OFF} Gate {'ON' if gate_v==1 else 'OFF'}</span>
        </div>
        <div class="muted small" style="margin-top:6px">{user_reason}</div>
      </div>"""


    body = f"""
    {test_banner_html}{trial_banner_html}
    <div class="kpi">
      <div class="box"><div class="k">Kullanıcı</div><div class="v">{E_USER} {user_display_name(u)}</div></div>
      <div class="box"><div class="k">Kullanım</div><div class="v">{E_BOX} {usage_badge}</div></div>
      <div class="box">
    <div class="k">🛑 Günlük Zarar Limiti</div>
    <div class="v">
      <form method="post" action="/settings/daily-loss" style="display:flex; gap:10px; align-items:center; margin:0;">
        <input class="input" name="daily_loss_limit_usdt" type="number" step="0.01" min="0"
               value="{get_daily_loss_limit(u):.2f}" placeholder="0 = kapalı" style="max-width:140px;">
        <button class="btn" type="submit">{E_SAVE} Kaydet</button>
      </form>
      <div class="muted small" style="margin-top:6px;">Limit aşılırsa trade otomatik kapanır</div>
    </div>
      </div>

      {auto_mode_box}
      <div class="box"><div class="k">Durum</div><div class="v">{trade_badge} {status_badge}</div></div>
    </div>

    <div class="card" style="margin-top:16px">
      <h2>{E_CHART} İstatistik</h2>
      {balances_bubbles}
      <div class="hr"></div>
      <div class="kpi">
    {stat_box("Günlük", day)}
    {stat_box("Haftalık", week)}
    {stat_box("Aylık", month)}
      </div>
    </div>

    <div class="grid" style="margin-top:16px">
      <div class="card">
    <h2>{E_MAIL} Bekleyen Sinyaller</h2>
    <div class="muted">Webhook ile gelen sinyaller burada bekler, onayla ve çalıştır</div>
    <div class="hr"></div>
    <table class="table">
      <thead>
        <tr>
          <th>İşlem</th><th>Sembol</th><th>İstek</th><th>Mod</th><th>Kontrol</th>
        </tr>
      </thead>
      <tbody>{pending_rows}</tbody>
    </table>

    <div class="hr"></div>
    <h2 style="margin:0 0 8px 0">{E_BOX} Açık Pozisyonlar</h2>
    <div class="muted">Manuel BUY sonrası burada kalır; buradan SELL beklemeye alabilirsin</div>
    <div class="hr"></div>
    <table class="table">
      <thead>
        <tr>
          <th>Sembol</th><th>Giriş</th><th>Anlık</th><th>Yatırılan</th><th>PnL (USDT)</th><th>Kontrol</th>
        </tr>
      </thead>
      <tbody>{pos_rows}</tbody>
    </table>
      </div>

      <div class="card">
    <h2>{E_MOUSE} Manuel İşlem</h2>
    <div class="muted">Borsa seç, COİN seç, beklemeye al, sonra onayla</div>
    <div class="hr"></div>

    <form id="manualForm" method="post" action="/manual/enqueue">
      <label>Borsa Seç</label>
      <select id="manualExchange" name="exchange_id">
        <option value="OKX" {ex_okx}>{E_BANK} OKX</option>
        <option value="BINANCE" {ex_bin}>{E_BANK} Binance</option>
        <option value="GATEIO" {ex_gate}>{E_BANK} Gate.io</option>
        <option value="BYBIT" {ex_byb}>{E_BANK} Bybit</option>
      </select>

      <label>COİN Seç</label>
      <select id="manualSymbol" name="symbol">{symbol_options}</select>

      <label>USDT</label>
      <input id="manualUsdt" class="input" name="usdt" value="{DEFAULT_USDT:.2f}" inputmode="decimal">

      <div class="row" style="margin-top:8px;gap:8px;justify-content:flex-start;flex-wrap:wrap">
        <button class="pill" type="button" data-qamt="5">5 USDT</button>
        <button class="pill" type="button" data-qamt="10">10 USDT</button>
        <button class="pill" type="button" data-qamt="25">25 USDT</button>
      </div>


      <div class="row" style="margin-top:6px">
        <div>
          <label>İşlem</label>
          <select id="manualAction" name="action">
            <option value="BUY">{E_ON} BUY</option>
            <option value="SELL">{E_OFF} SELL</option>
          </select>
        </div>
        <div>
          <label>Mod</label>
          <select id="manualDryRun" name="dry_run">
            <option value="1" {sel_dry}>{E_TST} TEST</option>
            <option value="0" {sel_live}>{E_BOOM} GERÇEK</option>
          </select>
        </div>
      </div>

      <div style="margin-top:14px">
        <button class="btn good" type="submit">{E_OK} Emir Gönder</button>
        <form method="post" action="/panic" style="display:inline-block;margin-left:10px">
          <button class="btn danger" type="submit">{E_STOP} PANIC</button>
        </form>

      </div>

      <div style="margin-top:12px;display:flex;justify-content:center">
        <a class="pill" href="/forgot">{E_MAIL} Şifremi unuttum</a>
      </div>
    </form>

    <div id="liveModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;align-items:center;justify-content:center;padding:18px">
      <div style="max-width:520px;width:100%;background:#0f172a;border:1px solid rgba(255,255,255,.10);border-radius:18px;padding:18px;box-shadow:0 16px 50px rgba(0,0,0,.45)">
        <div style="font-size:18px;font-weight:900">{E_WARN} GERÇEK işlem onayı</div>
        <div class="muted" style="margin-top:8px;line-height:1.5">
          {E_BOOM} GERÇEK mod seçili. Onaylarsan gerçek para ile emir oluşturulabilir.<br>
          Borsa: <b id="mEx">-</b> - COİN: <b id="mSym">-</b> - İşlem: <b id="mAct">-</b> - Tutar: <b id="mAmt">-</b> USDT
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap">
          <button id="liveCancel" class="btn secondary" type="button">{E_BACK} Vazgeç</button>
          <button id="liveOk" class="btn good" type="button">{E_OK} Evet, GERÇEK</button>
        </div>
      </div>
    </div>

    {script}
      </div>
    </div>

    <div class="grid" style="margin-top:16px">
      <div class="card">
    <h2>{E_BOT} AUTO İŞLEMLER</h2>
    <div class="muted">TradingView sinyali gelince, burada açık olan kurala göre otomatik işlem açılır</div>
    <div class="hr"></div>

    <form method="post" action="/auto/create">
      <label>Borsa</label>
      <select name="exchange_id" id="auto_exchange">
        <option value="OKX">{E_BANK} OKX</option>
        <option value="BINANCE">{E_BANK} Binance</option>
        <option value="GATEIO">{E_BANK} Gate.io</option>
        <option value="BYBIT">{E_BANK} Bybit</option>
      </select>

      <label>COİN</label>
      <select class="input" name="symbol" id="auto_symbol">
       <option value="">COİN seç</option>
      </select>

      <label>USDT</label>
      <input class="input" name="usdt" id="auto_usdt" inputmode="decimal" placeholder="Örn: 20">

      <label style="display:flex;align-items:center;gap:10px;margin-top:10px">
        <input type="checkbox" name="all_in" id="auto_all_in" value="1">
        <span>Tüm USDT bakiye ile al</span>
      </label>

      <div style="margin-top:14px">
        <button class="btn" type="button" id="auto_save_btn">{E_SAVE} Kaydet</button>
      </div>

      <div style="margin-top:12px;display:flex;justify-content:center">
        <a class="pill" href="/forgot">{E_MAIL} Şifremi unuttum</a>
      </div>
    </form>
      </div>

      <div class="card">
    <h2>{E_PLUS} Auto İşlemlerim</h2>
    <div class="muted">Açık olanlar sinyal gelince otomatik çalışır</div>
    <div class="hr"></div>

    <table class="table">
      <thead>
        <tr>
          <th>COİN / Borsa</th><th>Tutar</th><th>Durum</th><th>Kontrol</th>
        </tr>
      </thead>
      <tbody id="auto_rules_tbody">{auto_rows_html}</tbody>
    </table>
      </div>
    </div>
    """
    page_title = "Test" if test_view else "User Panel"
    return base_html(page_title, body, nav_html(bool(session.get("is_admin"))))

# =========================
# Manual enqueue
# =========================
@app.post("/manual/enqueue")
def manual_enqueue():
    rr = require_login()
    if rr:
        return rr

    username = session["username"]
    u = get_user(username)
    if not u:
        session.clear()
        return redirect("/login")
    if u and not isinstance(u, dict):
        u = dict(u)

    exchange_id = safe_str(request.form.get("exchange_id") or "").strip().upper()
    if exchange_id not in ("OKX", "BINANCE", "GATEIO", "BYBIT"):
        exchange_id = safe_str(u.get("exchange_id") or DEFAULT_EXCHANGE).strip().upper()
        if exchange_id not in ("OKX", "BINANCE", "GATEIO", "BYBIT"):
            exchange_id = DEFAULT_EXCHANGE

    symbol = normalize_symbol(safe_str(request.form.get("symbol") or DEFAULT_SYMBOL)).strip().upper()
    action = safe_str(request.form.get("action") or "BUY").strip().upper()
    if action not in ("BUY", "SELL"):
        action = "BUY"

    # DRY/LIVE seçimi
    dry_run_raw = safe_str(request.form.get("dry_run") or "1").strip().lower()
    dry_run = dry_run_raw in ("1", "true", "on", "yes")
    session["manual_dry_run"] = "1" if dry_run else "0"

    # Trial / force_dry_run: GERÇEK mod engellenir
    try:
        if int((u.get("force_dry_run") or 0)) == 1:
            dry_run = True
            session["manual_dry_run"] = "1"
    except Exception:
        pass

    try:
        usdt = float(safe_str(request.form.get("usdt") or DEFAULT_USDT))
    except Exception:
        usdt = float(DEFAULT_USDT)
    if usdt <= 0:
        usdt = float(DEFAULT_USDT)

    # kullanıcı default exchange güncelle (UI tutarlılığı)
    try:
        conn = db()
        conn.execute("UPDATE users SET exchange_id=? WHERE username=?", (exchange_id, username))
        conn.commit()
        conn.close()
    except Exception:
        pass

    # PANIC / Trade OFF: BUY engelle (SELL serbest kalsın)
    if action == "BUY" and (not dry_run) and (not may_trade(u)):
        try:
            set_last_msg(username, f"{E_STOP} Trade kapalı veya limit dolu")
        except Exception:
            pass
        telegram_send_for_user(u, f"{E_STOP} Trade kapalı veya limit dolu")
        return redirect("/")

    # =========================
    # MANUEL SELL: direkt kapat
    # =========================
    if action == "SELL":
        try:
            res = _auto_sell_execute_now(username, u, exchange_id, symbol)
        except Exception as e:
            res = {"ok": False, "error": safe_str(e)}
        if not (res or {}).get("ok"):
            err = safe_str((res or {}).get("error") or "SELL başarısız")
            try:
                set_last_msg(username, f"{E_X} SELL başarısız: {err}")
            except Exception:
                pass
            return redirect("/")
        try:
            set_last_msg(username, f"{E_OK} SELL gönderildi {symbol}")
        except Exception:
            pass
        return redirect("/")

    # =========================
    # MANUEL BUY: direkt çalıştır
    # =========================
    if dry_run:
        # DRY RUN BUY: public price ile pozisyon aç
        entry_price = 0.0
        try:
            entry_price = float(get_public_price(exchange_id, symbol) or 0.0)
        except Exception:
            entry_price = 0.0
        if entry_price <= 0:
            entry_price = 100.0

        qty = (usdt / entry_price) if entry_price > 0 else 0.0
        try:
            position_add(username, exchange_id, symbol, qty, entry_price, usdt, True, 0.0, 0.0, "", "")
        except Exception:
            try:
                conn = db()
                conn.execute(
                    "INSERT INTO open_positions(username, exchange_id, symbol, qty, entry_price, entry_usdt, dry_run, created_at) "
                    "VALUES (?,?,?,?,?,?,?,?)",
                    (username, exchange_id, symbol, float(qty), float(entry_price), float(usdt), 1, now_ts()),
                )
                conn.commit()
                conn.close()
            except Exception:
                pass

        try:
            telegram_send_for_user(u, build_telegram_text("BUY", u, symbol, usdt, True, {"mode": "MANUEL"}))
        except Exception:
            pass
        try:
            set_last_msg(username, f"{E_OK} BUY (TEST) gönderildi {symbol}")
        except Exception:
            pass
        return redirect("/")

    # LIVE BUY
    keys = _keys_for_exchange(u, exchange_id)
    res = place_order(
        exchange_id, "BUY", symbol, usdt, False,
        safe_str(keys.get("api_key")), safe_str(keys.get("api_secret")), safe_str(keys.get("api_passphrase"))
    )

    if not (res or {}).get("ok"):
        reason = safe_str((res or {}).get("reason") or "Bilinmeyen hata")
        try:
            set_last_msg(username, f"{E_X} BUY başarısız: {reason}")
        except Exception:
            pass
        log_line(username, "WARN", f"{E_X} BUY başarısız: {reason}")
        telegram_send_for_user(u, f"{E_X} BUY başarısız: {reason}")
        return redirect("/")

    fill_price = _to_float((res or {}).get("fill_price"), 0.0)
    fill_qty = _to_float((res or {}).get("fill_qty"), 0.0)
    real_usdt = _to_float((res or {}).get("real_usdt"), usdt)
    if real_usdt <= 0:
        real_usdt = usdt

    buy_fee_usdt = _to_float((res or {}).get("fee_usdt"), 0.0)
    buy_fee_coin = _to_float((res or {}).get("fee_coin"), 0.0)
    buy_fee_coin_ccy = safe_str((res or {}).get("fee_coin_ccy") or "")
    buy_ord_id = safe_str((res or {}).get("ord_id") or "")

    try:
        position_add(username, exchange_id, symbol, fill_qty, fill_price, real_usdt, False,
                     buy_fee_usdt, buy_fee_coin, buy_fee_coin_ccy, buy_ord_id)
    except Exception:
        try:
            conn = db()
            conn.execute(
                "INSERT INTO open_positions(username, exchange_id, symbol, qty, entry_price, entry_usdt, dry_run, created_at) "
                "VALUES (?,?,?,?,?,?,?,?)",
                (username, exchange_id, symbol, float(fill_qty), float(fill_price), float(real_usdt), 0, now_ts()),
            )
            conn.commit()
            conn.close()
        except Exception:
            pass

    try:
        conn = db()
        conn.execute(
            "INSERT INTO trades(username, exchange_id, action, symbol, real_usdt, pnl_usdt, dry_run, created_at) "
            "VALUES (?,?,?,?,?,?,?,?)",
            (username, exchange_id, "BUY", symbol, float(real_usdt), 0.0, 0, now_ts()),
        )
        conn.commit()
        conn.close()
    except Exception:
        pass

    try:
        inc_usage(username)
    except Exception:
        pass

    log_line(username, "INFO", f"MANUEL BUY LIVE {exchange_id} {symbol} usdt={real_usdt:.2f}")
    try:
        telegram_send_for_user(u, build_telegram_text("BUY", u, symbol, real_usdt, False, {"mode": "MANUEL"}))
    except Exception:
        pass
    try:
        set_last_msg(username, f"{E_OK} BUY gönderildi (GERÇEK) {symbol}")
    except Exception:
        pass
    return redirect("/")



def get_position_row(pid: int, username: str) -> dict:
    conn = db_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, username, exchange_id, symbol, qty, entry_price, dry_run, created_at FROM open_positions WHERE id=? AND username=?",
        (int(pid), username),
    )
    r = cur.fetchone()
    conn.close()
    if not r:
        return {}
    keys = ["id", "username", "exchange_id", "symbol", "qty", "entry_price", "dry_run", "created_at"]
    return dict(zip(keys, r))



# =========================
# PANIC BUTTON (User)
# =========================
@app.post("/panic")
def panic_button():
    rr = require_login()
    if rr:
        return rr

    username = session.get("username") or ""
    if not username:
        return redirect("/login")

    conn = db()
    try:
        conn.execute("UPDATE users SET trade_enabled=0 WHERE username=?", (username,))
        try:
            conn.execute("UPDATE auto_rules SET enabled=0 WHERE username=?", (username,))
        except Exception:
            pass
        conn.commit()
    finally:
        conn.close()

    try:
        log_line(username, "WARN", "PANIC: trade kapatıldı, auto kurallar kapandı")
    except Exception:
        pass

    try:
        telegram_send_for_user(get_user(username), f"{E_STOP} PANIC: Trade kapatıldı (AUTO kurallar kapandı)")
    except Exception:
        pass

    session["popup_msg"] = f"{E_STOP} PANIC aktif: Trade kapatıldı"
    return redirect("/")

@app.post("/position/<int:pid>/enqueue_sell")
def enqueue_sell(pid: int):
    """
    UI'daki SELL butonu: aynı coin'den (stack) açık olan tüm pozisyonu kapatır.
    """
    rr = require_login()
    if rr:
        return rr

    username = session.get("username")
    if not username:
        return redirect("/login")

    u = get_user(username)
    if u and not isinstance(u, dict):
        u = dict(u)
    if not u:
        return redirect("/login")

    # temsilci pozisyonu bul
    p = get_position(pid, username=username)
    if p and not isinstance(p, dict):
        p = dict(p)
    if not p:
        return redirect("/")

    ex = safe_str(p.get("exchange_id") or DEFAULT_EXCHANGE).upper()
    symbol = normalize_symbol(safe_str(p.get("symbol") or DEFAULT_SYMBOL))

    dry_run = bool(int(p.get("dry_run") or 0))

    # aynı symbol+exchange+diy_run olan tüm pozisyonları topla
    all_pos = list_positions(username) or []
    stack: List[Dict[str, Any]] = []
    for row in all_pos:
        if row is not None and not isinstance(row, dict):
            try:
                row = dict(row)
            except Exception:
                continue
        if not row:
            continue
        if safe_str(row.get("exchange_id") or "").upper() != ex:
            continue
        if normalize_symbol(safe_str(row.get("symbol") or "")) != symbol:
            continue
        if bool(int(row.get("dry_run") or 0)) != dry_run:
            continue
        stack.append(row)

    if not stack:
        return redirect("/")

    total_entry_usdt = sum(_to_float(r.get("entry_usdt"), 0.0) + _to_float(r.get("buy_fee_usdt"), 0.0) for r in stack)
    total_qty_db = sum(_to_float(r.get("qty"), 0.0) for r in stack)

    # OKX keys
    keys = _keys_for_exchange(u, ex)
    api_key = safe_str(keys.get("api_key"))
    api_secret = safe_str(keys.get("api_secret"))
    api_pass = safe_str(keys.get("api_passphrase"))

    # SELL miktarı: LIVE'da her zaman eldeki tüm base coin
    base_ccy = symbol.split("/")[0].strip().upper()
    qty_to_sell = total_qty_db

    if not dry_run and ex == "OKX":
        try:
            bal_qty = okx_get_asset_balance(base_ccy, api_key, api_secret, api_pass)
            if bal_qty > 0:
                qty_to_sell = bal_qty
        except Exception:
            pass

    if qty_to_sell <= 0:
        set_last_msg(username, f"{E_X} SELL iptal • {symbol} • qty sıfır")
        return redirect("/")

    # emri gönder
    res = place_order(ex, "SELL", symbol, qty_to_sell, dry_run, api_key, api_secret, api_pass)
    ok = bool((res or {}).get("ok"))
    err = safe_str((res or {}).get("reason") or "")

    if not ok:
        # hata bildir
        telegram_send_for_user(u, build_telegram_text("SELL", u, symbol, 0.0, dry_run, {"reason": err}))
        set_last_msg(username, f"{E_X} SELL başarısız • {symbol} • {err}")
        return redirect("/")

    
    fill_price = _to_float((res or {}).get("fill_price"), 0.0)
    fill_qty = _to_float((res or {}).get("fill_qty"), qty_to_sell)
    real_usdt = _to_float((res or {}).get("real_usdt"), 0.0)  # SELL gross proceeds (OKX fillNotional)
    # Fee (TOTAL) = BUY fee (stack) + SELL fee (order)
    buy_fee_total_usdt = _sum_buy_fees_usdt(ex, symbol, stack)
    sell_fee_total_usdt = _sum_sell_fees_usdt(ex, symbol, fill_price, res)
    fee_total_usdt = buy_fee_total_usdt + sell_fee_total_usdt

    # NET proceeds & NET PnL
    proceeds_net = real_usdt - sell_fee_total_usdt
    pnl_usdt = proceeds_net - float(total_entry_usdt) - buy_fee_total_usdt

    # tüm stack satıldı say → DB temizle
    for r in stack:
        try:
            delete_position(int(r.get("id") or 0), username=username)
        except Exception:
            pass

    record_trade(username, ex, "SELL", symbol, total_entry_usdt, pnl_usdt, dry_run)
    if not dry_run:
        inc_usage(username)

    telegram_send_for_user(
        u,
        build_telegram_text(
            "SELL",
            u,
            symbol,
            total_entry_usdt,
            dry_run,
            {
                "net_pnl_usdt": pnl_usdt,
                "net_pnl_try": (pnl_usdt * USDT_TRY_RATE),
                "fee_usdt_total": fee_total_usdt,
                "pnl_usdt": pnl_usdt,
                "pnl_try": (pnl_usdt * USDT_TRY_RATE),
                "fill_price": fill_price,
                "fill_qty": fill_qty,
            },
        ),
    )

    set_last_msg(username, f"{E_OK} SELL başarılı • {symbol} • NET PnL {pnl_usdt:.6f} USDT")
    return redirect("/")

@app.post("/auto/create")
def auto_create_form():
    rr = require_login()
    if rr:
        return rr
    username = session["username"]

    exchange_id = safe_str(request.form.get("exchange_id") or "").strip().upper()
    symbol = safe_str(request.form.get("symbol") or "").strip().upper()
    all_in = safe_str(request.form.get("all_in") or "").strip().lower() in ("1", "true", "on", "yes")

    try:
        usdt = float(safe_str(request.form.get("usdt") or "0"))
    except Exception:
        usdt = 0.0

    if exchange_id not in ("OKX", "BINANCE", "GATEIO", "BYBIT") or not symbol:
        return Response("BAD_INPUT", status=400)

    # 'Tüm bakiye' seçilirse usdt=-1 olarak kaydediyoruz (DB şeması değişmeden)
    if all_in:
        usdt = -1.0
    else:
        if usdt <= 0:
            return Response("BAD_INPUT", status=400)

    auto_upsert_rule(username, exchange_id, symbol, usdt, 1)
    if usdt < 0:
        log_line(username, "INFO", f"AUTO rule saved {exchange_id} {symbol} ALL_IN")
    else:
        log_line(username, "INFO", f"AUTO rule saved {exchange_id} {symbol} {usdt:.2f}")
    return ("OK", 200)

@app.post("/auto/<int:rid>/toggle")
def auto_toggle_form(rid: int):
    rr = require_login()
    if rr:
        return rr
    username = session["username"]
    enabled = 1 if safe_str(request.form.get("enabled") or "0") in ("1","true","on","yes") else 0
    auto_toggle_id(username, rid, enabled)
    return redirect("/")

@app.post("/auto/<int:rid>/delete")
def auto_delete_form(rid: int):
    rr = require_login()
    if rr:
        return rr
    username = session["username"]
    auto_delete_id(username, rid)
    return redirect("/")


@app.post("/auto/<int:rid>/update")
def auto_update_form(rid: int):
    rr = require_login()
    if rr:
        return rr
    username = session["username"]

    data = {}
    if request.is_json:
        try:
            data = request.get_json(silent=True) or {}
        except Exception:
            data = {}
    else:
        data = request.form or {}

    all_in = safe_str(data.get("all_in") or "").strip().lower() in ("1", "true", "on", "yes")
    try:
        usdt = float(safe_str(data.get("usdt") or "0"))
    except Exception:
        usdt = 0.0

    if all_in:
        usdt = -1.0
    else:
        if usdt <= 0:
            return Response("BAD_INPUT", status=400)

    auto_update_id(username, rid, usdt)
    if usdt < 0:
        log_line(username, "INFO", f"AUTO rule updated id {rid} ALL_IN")
    else:
        log_line(username, "INFO", f"AUTO rule updated id {rid} {usdt:.2f}")
    return ("OK", 200)

# =========================
# Pending approve/deny helpers
# =========================
def _set_signal_status(sid: int, status: str) -> None:
    conn = db()
    try:
        conn.execute("UPDATE pending_signals SET status=? WHERE id=?", (status, sid))
        conn.commit()
    finally:
        conn.close()

def _set_trade_enabled(username: str, enabled: bool) -> None:
    conn = db()
    try:
        conn.execute("UPDATE users SET trade_enabled=? WHERE username=?", (1 if enabled else 0, username))
        conn.commit()
    finally:
        conn.close()

@app.post("/signal/<int:sid>/deny")
def deny_signal(sid: int):
    rr = require_login()
    if rr:
        return rr
    username = session["username"]

    conn = db()
    try:
        row = conn.execute("SELECT * FROM pending_signals WHERE id=?", (sid,)).fetchone()
        if not row or row["username"] != username:
            return redirect("/")
        conn.execute("UPDATE pending_signals SET status='DENIED' WHERE id=?", (sid,))
        conn.commit()
    finally:
        conn.close()

    log_line(username, "INFO", f"Signal denied id {sid}")
    return redirect("/")

def _keys_for_exchange(u: dict, exchange_id: str) -> Dict[str, str]:
    ex = (exchange_id or "").upper()
    if ex == "OKX":
        return {
            "api_key": safe_str(u.get("api_key")),
            "api_secret": safe_str(u.get("api_secret")),
            "api_passphrase": safe_str(u.get("api_passphrase")),
        }
    if ex == "BINANCE":
        return {"api_key": safe_str(u.get("binance_api_key")), "api_secret": safe_str(u.get("binance_api_secret")), "api_passphrase": ""}
    if ex == "BYBIT":
        return {"api_key": safe_str(u.get("bybit_api_key")), "api_secret": safe_str(u.get("bybit_api_secret")), "api_passphrase": ""}
    if ex == "GATEIO":
        return {"api_key": safe_str(u.get("gate_api_key")), "api_secret": safe_str(u.get("gate_api_secret")), "api_passphrase": ""}
    return {"api_key": "", "api_secret": "", "api_passphrase": ""}


@app.post("/signal/<int:sid>/approve")
def approve_signal(sid: int):
    rr = require_login()
    if rr:
        return rr

    username = session.get("username")
    if not username:
        return redirect("/login")

    # Pending sinyali yükle (sadece bu kullanıcıya ait ve PENDING olmalı)
    conn = db()
    try:
        row = conn.execute(
            "SELECT * FROM pending_signals WHERE id=? AND username=? AND status='PENDING'",
            (int(sid), username),
        ).fetchone()
    finally:
        conn.close()

    if not row:
        try:
            set_last_msg(username, f"{E_X} Onaylanacak sinyal bulunamadı")
        except Exception:
            pass
        return redirect("/")

    sig = dict(row)
    action = safe_str(sig.get("action")).strip().upper()
    symbol = safe_str(sig.get("symbol") or DEFAULT_SYMBOL).strip().upper()
    requested_usdt = _to_float(sig.get("requested_usdt"), 0.0)
    dry_run = int(sig.get("dry_run") or 0) == 1

    # payload_json içinden borsa bilgisi gelebilir (yoksa kullanıcı default)
    payload = {}
    try:
        payload = json.loads(safe_str(sig.get("payload_json") or "{}")) or {}
    except Exception:
        payload = {}

    u = get_user(username) or {}
    if u and not isinstance(u, dict):
        u = dict(u)
    # Trial / force_dry_run: GERÇEK mod engellenir
    try:
        if int((u.get("force_dry_run") or 0)) == 1:
            dry_run = True
    except Exception:
        pass

    # Daily loss limit: Onayla'ya basınca popup göster
    dl_msg = daily_loss_block_msg(u)
    if dl_msg:
        session['popup_msg'] = dl_msg
        return redirect('/')


    exchange_id = safe_str(payload.get("exchange_id") or u.get("exchange_id") or DEFAULT_EXCHANGE).strip().upper()
    if not exchange_id:
        exchange_id = DEFAULT_EXCHANGE

    if action != "BUY":
        # Bu panel akışında sadece BUY'ı pozisyona çeviriyoruz.
        # (SELL sinyalleri panelde ayrı flow ile yönetiliyor.)
        conn = db()
        try:
            conn.execute("UPDATE pending_signals SET status='APPROVED' WHERE id=? AND username=?", (int(sid), username))
            conn.commit()
        finally:
            conn.close()
        log_line(username, "INFO", f"Signal approved (non-BUY) id {sid} {action} {exchange_id} {symbol}")
        return redirect("/")

    if requested_usdt <= 0:
        try:
            set_last_msg(username, f"{E_X} BUY başarısız: İstek miktarı geçersiz")
        except Exception:
            pass
        return redirect("/")

    # DRY RUN'da gerçek emir yok: public fiyatla hesapla
    if dry_run:
        entry_price = 0.0
        try:
            entry_price = float(get_public_price(exchange_id, symbol) or 0.0)
        except Exception:
            entry_price = 0.0

        if entry_price <= 0:
            # fallback (UI patlamasın)
            entry_price = 100.0

        qty = (requested_usdt / entry_price) if entry_price > 0 else 0.0
        try:
            position_add(username, exchange_id, symbol, qty, entry_price, requested_usdt, True)
        except Exception:
            # eğer position_add yoksa, DB insert fallback
            conn = db()
            try:
                conn.execute(
                    "INSERT INTO open_positions(username, exchange_id, symbol, qty, entry_price, entry_usdt, dry_run, created_at) "
                    "VALUES (?,?,?,?,?,?,?,?)",
                    (username, exchange_id, symbol, float(qty), float(entry_price), float(requested_usdt), 1, now_ts()),
                )
                conn.commit()
            finally:
                conn.close()

        conn = db()
        try:
            conn.execute("UPDATE pending_signals SET status='APPROVED' WHERE id=? AND username=?", (int(sid), username))
            conn.commit()
        finally:
            conn.close()

        log_line(username, "INFO", f"BUY approved DRY_RUN {exchange_id} {symbol} usdt={requested_usdt:.2f}")
        telegram_send_for_user(u, build_telegram_text("BUY", u, symbol, requested_usdt, True, {"mode": "MANUEL"}))
        try:
            set_last_msg(username, f"{E_OK} BUY onaylandı (TEST) {symbol}")
        except Exception:
            pass
        return redirect("/")

    # LIVE BUY: trade check + keys + place_order stub/real
    if not may_trade(u):
        try:
            set_last_msg(username, f"{E_STOP} Trade kapalı veya limit dolu")
        except Exception:
            pass
        telegram_send_for_user(u, f"{E_STOP} Trade kapalı veya limit dolu")
        return redirect("/")

    keys = _keys_for_exchange(u, exchange_id)
    res = place_order(exchange_id, "BUY", symbol, requested_usdt, False,
                      safe_str(keys.get("api_key")), safe_str(keys.get("api_secret")), safe_str(keys.get("api_passphrase")))

    if not (res or {}).get("ok"):
        reason = safe_str((res or {}).get("reason") or "Bilinmeyen hata")
        try:
            set_last_msg(username, f"{E_X} BUY başarısız: {reason}")
        except Exception:
            pass
        log_line(username, "WARN", f"{E_X} BUY başarısız: {reason}")
        telegram_send_for_user(u, f"{E_X} BUY başarısız: {reason}")
        return redirect("/")

    fill_price = _to_float((res or {}).get("fill_price"), 0.0)
    fill_qty = _to_float((res or {}).get("fill_qty"), 0.0)
    real_usdt = _to_float((res or {}).get("real_usdt"), requested_usdt)
    if real_usdt <= 0:
        real_usdt = requested_usdt

    buy_fee_usdt = _to_float((res or {}).get("fee_usdt"), 0.0)
    buy_fee_coin = _to_float((res or {}).get("fee_coin"), 0.0)
    buy_fee_coin_ccy = safe_str((res or {}).get("fee_coin_ccy") or "")
    buy_ord_id = safe_str((res or {}).get("ord_id") or "")

    # yeni pozisyon EKLE (overwrite yok)
    try:
        position_add(username, exchange_id, symbol, fill_qty, fill_price, real_usdt, False, buy_fee_usdt, buy_fee_coin, buy_fee_coin_ccy, buy_ord_id)
    except Exception:
        conn = db()
        try:
            conn.execute(
                "INSERT INTO open_positions(username, exchange_id, symbol, qty, entry_price, entry_usdt, dry_run, created_at) "
                "VALUES (?,?,?,?,?,?,?,?)",
                (username, exchange_id, symbol, float(fill_qty), float(fill_price), float(real_usdt), 0, now_ts()),
            )
            conn.commit()
        finally:
            conn.close()

    # pending'i approved yap
    conn = db()
    try:
        conn.execute("UPDATE pending_signals SET status='APPROVED' WHERE id=? AND username=?", (int(sid), username))
        conn.commit()
    finally:
        conn.close()

    # kullanım + trade log (LIVE'da artar)
    try:
        inc_usage(username)
    except Exception:
        pass

    try:
        conn = db()
        conn.execute(
            "INSERT INTO trades(username, exchange_id, action, symbol, real_usdt, pnl_usdt, dry_run, created_at) "
            "VALUES (?,?,?,?,?,?,?,?)",
            (username, exchange_id, "BUY", symbol, float(real_usdt), 0.0, 0, now_ts()),
        )
        conn.commit()
        conn.close()
    except Exception:
        pass

    log_line(username, "INFO", f"BUY approved LIVE {exchange_id} {symbol} usdt={real_usdt:.2f}")
    telegram_send_for_user(u, build_telegram_text("BUY", u, symbol, real_usdt, False, {"mode": "MANUEL"}))
    try:
        set_last_msg(username, f"{E_OK} BUY onaylandı (GERÇEK) {symbol}")
    except Exception:
        pass
    return redirect("/")


@app.route("/webhook", methods=["POST"], strict_slashes=False)
def webhook():
    data: Dict[str, Any] = {}
    if request.is_json:
        try:
            data = request.get_json(force=True) or {}
        except Exception:
            data = {}
    else:
        data = dict(request.form or {})

    # TradingView bazen payload'u 'alert_message' alanına string olarak yollar
    if isinstance(data, dict):
        am = data.get("alert_message") or data.get("message")
        if isinstance(am, str) and am.strip():
            s = am.strip()
            try:
                j = json.loads(s)
                if isinstance(j, dict):
                    data = j
            except Exception:
                pass

    username = safe_str(data.get("username") or data.get("user")).strip()
    action = safe_str(data.get("action") or data.get("side")).strip().upper()
    symbol = safe_str(data.get("symbol") or data.get("pair") or DEFAULT_SYMBOL).strip().upper()

    exchange_id = safe_str(data.get("exchange") or data.get("exchange_id") or "").strip().upper()
    if exchange_id not in ("OKX", "BINANCE", "GATEIO", "BYBIT"):
        exchange_id = ""

    provided_secret = safe_str(data.get("secret") or data.get("webhook_secret")).strip()

    if not username or action not in ("BUY", "SELL"):
        return jsonify({"ok": False, "error": "Bad payload"}), 400

    u = get_user(username)
    if not u:
        return jsonify({"ok": False, "error": "Unknown user"}), 404

    if not exchange_id:
        exchange_id = safe_str(u.get("exchange_id") or DEFAULT_EXCHANGE).strip().upper()
        if exchange_id not in ("OKX", "BINANCE", "GATEIO", "BYBIT"):
            exchange_id = "OKX"


        # Trial expiry enforcement
    u = enforce_trial_expiry(username, u)

# AUTO regime gate (AUTO sinyallerini filtreler)
    flow = safe_str(data.get("flow") or data.get("mode") or data.get("trade_mode") or data.get("auto") or "")
    is_manual = safe_str(data.get("manual") or "").strip().lower() in ("1", "true", "on", "yes")
    is_auto = (not is_manual) and (flow.strip().upper() in ("AUTO", "1", "TRUE", "ON", "") )

    # AUTO regime gate sadece BUY için geçerli, SELL her zaman serbest
    if AUTO_REGIME_ENABLED and is_auto and action != "SELL":
        gg = get_auto_gate(username)
        if int((gg or {}).get("gate") or 0) != 1:
            reason = safe_str((gg or {}).get("reason") or "AUTO gate kapalı")
            set_last_msg(username, f"{E_STOP} AUTO kapalı • {reason}")
            return jsonify({"ok": False, "blocked": True, "reason": reason}), 200


    user_secret = safe_str(u.get("webhook_secret") or "").strip()
    secret_ok = False
    if user_secret and provided_secret and provided_secret == user_secret:
        secret_ok = True
    elif WEBHOOK_SECRET and provided_secret and provided_secret == WEBHOOK_SECRET:
        secret_ok = True
    else:
        if not user_secret and not WEBHOOK_SECRET:
            secret_ok = True

    if not secret_ok:
        try:
            ip = request.headers.get("X-Real-IP") or request.remote_addr or ""
            _log("WEBHOOK UNAUTHORIZED | user=%s | ip=%s | provided_len=%s", username, ip, len(provided_secret or ""))
        except Exception:
            pass
        return jsonify({"ok": False, "error": "Unauthorized secret mismatch"}), 401

    # Aynı saniyede BUY→SELL gelirse (TV alarm/strategy), OKX senkronu için kısa debounce uygula
    k = f"{username}|{exchange_id}|{symbol}"
    now_ts = time.time()
    if action == "SELL":
        last_buy = _LAST_BUY_TS.get(k)
        if last_buy and (now_ts - last_buy) < SELL_DEBOUNCE_SEC:
            wait_s = max(0.0, SELL_DEBOUNCE_SEC - (now_ts - last_buy))
            if wait_s > 0:
                try:
                    log_line(username, "INFO", f"SELL debounce bekleme {wait_s:.2f}s {exchange_id} {symbol}")
                except Exception:
                    pass
                time.sleep(wait_s)
    else:
        # BUY geldiğinde timestamp kaydet
        _LAST_BUY_TS[k] = now_ts

    # DRY_RUN / TEST MODE
    # - Global DRY_RUN=1 ise her zaman dry_run
    # - Payload içinde test flag varsa dry_run zorla
    # - Payload mode: "TEST" ise dry_run
    p_mode = (payload.get("mode") or payload.get("Mod") or "").strip().upper()
    p_test = bool(payload.get("test") or payload.get("test_mode") or payload.get("dry_run"))
    dry_run = bool(DRY_RUN_DEFAULT or p_test or (p_mode == "TEST"))

    symbol = canon_symbol(symbol)

    auto_row = auto_get_enabled_match(username, exchange_id, symbol)
    if not auto_row:
        log_line(username, "WARN", f"{E_BOT} AUTO kapalı: {exchange_id} {symbol}")
        return jsonify({"ok": False, "error": "AUTO kapalı"}), 200

    try:
        requested_usdt = float(auto_row.get("usdt") or 0.0)
    except Exception:
        requested_usdt = 0.0

    # Tüm bakiye modu (usdt=-1): OKX'te anlık USDT serbest bakiye ile al
    if requested_usdt < 0:
        if exchange_id == "OKX":
            keys = _keys_for_exchange(u, exchange_id)
            bal = 0.0
            try:
                bal = float(okx_get_asset_balance("USDT",
                                                  safe_str(keys.get("api_key")),
                                                  safe_str(keys.get("api_secret")),
                                                  safe_str(keys.get("api_passphrase"))))
            except Exception:
                bal = 0.0
            # küçük buffer bırak (komisyon / yuvarlama)
            requested_usdt = max(0.0, bal - 1.0)
        else:
            requested_usdt = float(DEFAULT_USDT)

    if requested_usdt <= 0:
        requested_usdt = float(DEFAULT_USDT)

    payload = dict(data)
    payload["received_at"] = iso_now_local()
    payload["exchange_id"] = exchange_id
    payload["auto_usdt"] = requested_usdt
    # AUTO sinyali: beklemeye alma YOK — direkt çalıştır
    if action == "BUY":
        # LIVE modda yetki kontrolü
        if not may_trade(u):
            log_line(username, "WARN", f"{E_STOP} AUTO BUY engellendi: trade kapalı/limit dolu")
            return jsonify({"ok": False, "error": "Trade kapalı/limit dolu"}), 200

        keys = _keys_for_exchange(u, exchange_id)
        res = place_order(exchange_id, "BUY", symbol, requested_usdt, False,
                          safe_str(keys.get("api_key")), safe_str(keys.get("api_secret")), safe_str(keys.get("api_passphrase")))

        if not (res or {}).get("ok"):
            reason = safe_str((res or {}).get("reason") or "Bilinmeyen hata")
            log_line(username, "WARN", f"{E_X} AUTO BUY başarısız: {reason}")
            return jsonify({"ok": False, "error": reason}), 200

        fill_price = _to_float((res or {}).get("fill_price"), 0.0)
        fill_qty = _to_float((res or {}).get("fill_qty"), 0.0)
        real_usdt = _to_float((res or {}).get("real_usdt"), requested_usdt)

        buy_fee_usdt = _to_float((res or {}).get("fee_usdt"), 0.0)
        buy_fee_coin = _to_float((res or {}).get("fee_coin"), 0.0)
        buy_fee_coin_ccy = safe_str((res or {}).get("fee_coin_ccy") or "")
        buy_ord_id = safe_str((res or {}).get("ord_id") or "")

        if fill_price <= 0:
            try:
                fill_price = float(get_public_price(exchange_id, symbol) or 0.0)
            except Exception:
                fill_price = 0.0
            if fill_price <= 0:
                fill_price = 100.0
        if fill_qty <= 0 and fill_price > 0:
            fill_qty = real_usdt / fill_price

        # her BUY ayrı pozisyon
        try:
            position_add(username, exchange_id, symbol, float(fill_qty), float(fill_price), float(real_usdt), False, buy_fee_usdt, buy_fee_coin, buy_fee_coin_ccy, buy_ord_id)
        except Exception:
            conn = db()
            try:
                conn.execute(
                    "INSERT INTO open_positions(username, exchange_id, symbol, qty, entry_price, entry_usdt, dry_run, created_at) "
                    "VALUES (?,?,?,?,?,?,?,?)",
                    (username, exchange_id, symbol, float(fill_qty), float(fill_price), float(real_usdt), 0, now_ts()),
                )
                conn.commit()
            finally:
                conn.close()

        # kullanım + trades (AUTO da GERÇEK sayılır)
        try:
            inc_usage(username)
        except Exception:
            pass

        try:
            conn = db()
            conn.execute(
                "INSERT INTO trades(username, exchange_id, action, symbol, real_usdt, pnl_usdt, dry_run, created_at) "
                "VALUES (?,?,?,?,?,?,?,?)",
                (username, exchange_id, "BUY", symbol, float(real_usdt), 0.0, 0, now_ts()),
            )
            conn.commit()
            conn.close()
        except Exception:
            pass

        log_line(username, "INFO", f"{E_BOT} AUTO BUY çalıştı: {exchange_id} {symbol} usdt={real_usdt:.2f} ord={safe_str((res or {}).get('ord_id') or '')}")
        telegram_send_for_user(u, build_telegram_text("BUY", u, symbol, real_usdt, False, {"mode": "AUTO"}))
        return jsonify({"ok": True, "executed": True})

    # AUTO SELL: stack pozisyonu kapatır. Trend güçlü ise SELL DEFER'e alır.
    if action == "SELL":
        dec = _auto_sell_defer_should_queue(username, exchange_id, symbol)
        if bool((dec or {}).get("defer")):
            reason = safe_str((dec or {}).get("reason") or "Trend güçlü")
            queued = _auto_sell_defer_enqueue(username, exchange_id, symbol, reason)
            try:
                if queued:
                    log_line(username, "INFO", f"AUTO SELL DEFER kuyruğa alındı: {exchange_id} {symbol} • {reason}")
                else:
                    log_line(username, "INFO", f"AUTO SELL DEFER zaten kuyrukta: {exchange_id} {symbol}")
            except Exception:
                pass
            return jsonify({"ok": True, "queued": True, "reason": reason}), 200

        # Trend zayıf/yatay: SELL INSTANT
        res = _auto_sell_execute_now(username, u, exchange_id, symbol)
        if not bool((res or {}).get("ok")):
            err = safe_str((res or {}).get("error") or "SELL başarısız")
            try:
                log_line(username, "WARN", f"{E_X} AUTO SELL başarısız: {exchange_id} {symbol} {err}")
            except Exception:
                pass
            return jsonify({"ok": False, "error": err}), 200
        return jsonify({"ok": True, "executed": True}), 200

    return jsonify({"ok": False, "error": "Bad action"}), 400


@app.post("/admin/users/<username>/toggle-trade")
def admin_user_toggle_trade(username: str):
    rr = require_admin()
    if rr:
        return rr

    u = get_user(username)
    if not u:
        return redirect("/admin")

    cur = 1 if int(u.get("trade_enabled") or 0) == 1 else 0
    newv = 0 if cur == 1 else 1

    conn = db()
    try:
        conn.execute(
            "UPDATE users SET trade_enabled=? WHERE username=?",
            (newv, username)
        )
        conn.commit()
    finally:
        conn.close()

    log_line("admin", "INFO", f"Trade toggled for {username} -> {newv}")
    return redirect("/admin")

@app.get("/admin/new-user")
def admin_new_user_get():
    rr = require_admin()
    if rr:
        return rr

    pkg_opts = ""
    for p in PACKAGES:
        lim = int(p["limit"])
        lim_txt = "∞" if lim < 0 else str(lim)
        price = int(p.get("price_try", 0) or 0)
        pkg_opts += f'<option value="{p["name"]}">{p["name"]}  {price:,} TL  /  {lim_txt} kullanım</option>'

    months_opts = "".join([f'<option value="{m}">{m} ay</option>' for m in range(1, 13)])

    body = f"""
<div class="card">
  <h2>{E_PLUS} Yeni Kullanıcı</h2>
  <div class="muted">Borsa, API ve Telegram Chat ID alanları hazır</div>
  <div class="hr"></div>

  <form method="post" action="/admin/new-user">
    <div class="row">
      <div>
        <label>Kullanıcı adı</label>
        <input class="input" name="username" required>
      </div>
      <div>
        <label>Görünen ad</label>
        <input class="input" name="display_name" placeholder="Atalay">
      </div>
    </div>

    <div class="row">
      <div>
        <label>Şifre</label>
        <input class="input" type="password" name="password" required>
      </div>
      <div>
        <label>Borsa</label>
        <select name="exchange_id">
          {exchange_select_options("OKX")}
        </select>
      </div>
    </div>

    <div class="row">
      <div>
        <label>Paket</label>
        <select name="package_name">{pkg_opts}</select>
      <div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div>
          <div style="font-weight:800">🧪 Deneme</div>
          <div class="muted small">Ücretsiz = TEST (DRY RUN) • Ücretli = 1 Gün LIVE (gerçek işlem)</div>
        </div>
        <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
          <label class="chk"><input type="radio" name="trial_mode" value="none" checked> <span>Kapalı</span></label>
          <label class="chk"><input type="radio" name="trial_mode" value="free"> <span>Ücretsiz (TEST)</span></label>
          <label class="chk"><input type="radio" name="trial_mode" value="paid1d"> <span>Ücretli (LIVE 1 Gün)</span></label>
        </div>

      </div>
      </div>
      <div>
        <label>Paket süresi</label>
        <select name="package_months">{months_opts}</select>
      </div>
    </div>

    <div class="row">
      <div>
        <label>Webhook secret</label>
        <input class="input" name="webhook_secret" placeholder="secret">
      </div>
      <div>
        <label>Telegram Chat ID</label>
        <input class="input" name="telegram_chat_id" placeholder="2057615710">
      </div>
    </div>

    <div class="row">
      <div>
        <label>Kontroller</label>
        <div class="inline">
          <span class="muted">Trade</span>
          <label class="switch"><input type="checkbox" name="trade_enabled" checked><span class="slider"></span></label>
          <span class="muted">Limit dolunca kapat</span>
          <label class="switch"><input type="checkbox" name="disable_on_limit" checked><span class="slider"></span></label>
        </div>
      </div>
      <div>
        <label>Not</label>
        <input class="input" value="Telegram Chat ID boşsa global chat id kullanılır" disabled>
      </div>
    </div>

    <div class="hr"></div>
    <h2>{E_LOCK} API Bilgileri</h2>
    <div class="muted">OKX alanları zorunlu, diğerleri opsiyonel</div>

    <div class="row">
      <div>
        <label>OKX API Key</label>
        <input class="input" name="api_key" placeholder="okx api key">
      </div>
      <div>
        <label>OKX API Secret</label>
        <input class="input" name="api_secret" placeholder="okx api secret">
      </div>
    </div>

    <div class="row">
      <div>
        <label>OKX API Şifre</label>
        <input class="input" name="api_passphrase" placeholder="okx passphrase">
      </div>
      <div>
        <label>Bilgi</label>
        <input class="input" value="OKX zorunlu, diğerleri istersen ekle" disabled>
      </div>
    </div>

    <div class="hr"></div>
    <div class="muted" style="font-weight:900">Binance</div>
    <div class="row">
      <div>
        <label>Binance API Key</label>
        <input class="input" name="binance_api_key" value="">
      </div>
      <div>
        <label>Binance API Secret</label>
        <input class="input" name="binance_api_secret" value="">
      </div>
    </div>

    <div class="muted" style="font-weight:900">Bybit</div>
    <div class="row">
      <div>
        <label>Bybit API Key</label>
        <input class="input" name="bybit_api_key" value="">
      </div>
      <div>
        <label>Bybit API Secret</label>
        <input class="input" name="bybit_api_secret" value="">
      </div>
    </div>

    <div class="muted" style="font-weight:900">Gate.io</div>
    <div class="row">
      <div>
        <label>Gate API Key</label>
        <input class="input" name="gate_api_key" value="">
      </div>
      <div>
        <label>Gate API Secret</label>
        <input class="input" name="gate_api_secret" value="">
      </div>
    </div>

    <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn" type="submit">{E_OK} Oluştur</button>
      <a class="btn secondary" href="/admin">{E_BACK} Geri</a>
    </div>
  </form>
</div>
"""
    return base_html("Yeni Kullanıcı", body, nav_html(True))


@app.post("/admin/new-user")
def admin_new_user_post():
    rr = require_admin()
    if rr:
        return rr

    username = safe_str(request.form.get("username"))
    display_name = safe_str(request.form.get("display_name"))
    password = safe_str(request.form.get("password"))

    exchange_id = safe_str(request.form.get("exchange_id") or DEFAULT_EXCHANGE).upper()
    webhook_secret = safe_str(request.form.get("webhook_secret"))
    telegram_chat_id = safe_str(request.form.get("telegram_chat_id"))

    package_name = safe_str(request.form.get("package_name") or "Basic")
    try:
        months = int(safe_str(request.form.get("package_months") or "1"))
    except Exception:
        months = 1
    months = max(1, min(12, months))

    trial_mode = safe_str(request.form.get("trial_mode") or "none").strip().lower()
    is_trial = (trial_mode in ("free","paid1d"))
    trial_real_1d = (trial_mode == "paid1d")

    trade_enabled = 1 if request.form.get("trade_enabled") == "on" else 0
    disable_on_limit = 1 if request.form.get("disable_on_limit") == "on" else 0

    # OKX (zorunlu)
    api_key = safe_str(request.form.get("api_key"))
    api_secret = safe_str(request.form.get("api_secret"))
    api_passphrase = safe_str(request.form.get("api_passphrase"))

    # opsiyonel
    binance_api_key = safe_str(request.form.get("binance_api_key"))
    binance_api_secret = safe_str(request.form.get("binance_api_secret"))
    bybit_api_key = safe_str(request.form.get("bybit_api_key"))
    bybit_api_secret = safe_str(request.form.get("bybit_api_secret"))
    gate_api_key = safe_str(request.form.get("gate_api_key"))
    gate_api_secret = safe_str(request.form.get("gate_api_secret"))

    if not username or not password:
        return redirect("/admin/new-user")

    if exchange_id not in [x[0] for x in EXCHANGES]:
        return redirect("/admin/new-user")

    if get_user(username):
        return redirect("/admin/new-user")

    salt = secrets.token_hex(16)
    pw_hash = hash_password(password, salt)

    force_dry_run = 0
    trial_real_enabled = 0
    trial_expires_at = 0
    
    if is_trial or trial_real_1d:
        package_name = "Trial"
        trial_limit = int(os.getenv("TRIAL_LIMIT", "30") or "30")
        pkg_limit = trial_limit
        # Normal Trial: DRY RUN. LIVE Trial: 1 gün gerçek işlem.
        if trial_real_1d:
            expires_at = now_ts() + int(1 * 24 * 3600)
            force_dry_run = 0
            trial_real_enabled = 1
            trial_expires_at = expires_at
        else:
            trial_days = int(os.getenv("TRIAL_DAYS", "3") or "3")
            expires_at = now_ts() + int(trial_days * 24 * 3600)
            force_dry_run = 1
        trade_enabled = 1
        disable_on_limit = 1

    else:
        pkg_limit = package_limit_for(package_name)
        expires_at = now_ts() + int(months * 30 * 24 * 3600)

    conn = db()
    try:
        conn.execute("""
            INSERT INTO users
            (username, display_name, salt, password_hash, is_admin,
             trade_enabled, disable_on_limit, exchange_id, webhook_secret,
             package_name, package_limit, package_months, expires_at, force_dry_run, trial_real_enabled, trial_expires_at,
             api_key, api_secret, api_passphrase, telegram_chat_id,
             binance_api_key, binance_api_secret,
             bybit_api_key, bybit_api_secret,
             gate_api_key, gate_api_secret,
             total_pnl, created_at)
            VALUES (?,?,?,?,0,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0.0,?)
        """, (
            username, display_name, salt, pw_hash,
            trade_enabled, disable_on_limit, exchange_id, webhook_secret,
            package_name, pkg_limit, months, expires_at, force_dry_run, trial_real_enabled, trial_expires_at,
            api_key, api_secret, api_passphrase, telegram_chat_id,
            binance_api_key, binance_api_secret,
            bybit_api_key, bybit_api_secret,
            gate_api_key, gate_api_secret,
            now_ts()
        ))

        conn.execute(
            "INSERT OR IGNORE INTO usage (username, used_count, updated_at) VALUES (?,0,?)",
            (username, now_ts())
        )

        conn.commit()
    finally:
        conn.close()

    log_line("admin", "INFO", f"User created {username}")
    return redirect("/admin")

@app.get("/admin/users/<username>")
def admin_user_edit_get(username: str):
    rr = require_admin()
    if rr:
        return rr

    u = get_user(username)
    if not u:
        return redirect("/admin")

    pkg_opts = ""
    for p in PACKAGES:
        lim = p["limit"]
        lim_txt = "∞" if lim < 0 else str(lim)
        sel = "selected" if safe_str(u["package_name"]) == p["name"] else ""
        pkg_opts += f'<option value="{p["name"]}" {sel}>{p["name"]}  {lim_txt} kullanım</option>'

    months_opts = ""
    for m in range(1, 13):
        sel = "selected" if int(u["package_months"]) == m else ""
        months_opts += f'<option value="{m}" {sel}>{m} ay</option>'

    trade_checked = "checked" if int(u["trade_enabled"]) == 1 else ""
    dolunca_checked = "checked" if int(u["disable_on_limit"]) == 1 else ""

    expires_s = (datetime.utcfromtimestamp(int(u["expires_at"] or 0)) + timedelta(hours=TZ_OFFSET_HOURS)).strftime("%Y-%m-%d")

    def esc(v: str) -> str:
        return safe_str(v).replace('"', "").replace("<", "").replace(">", "")

    body = f"""
<div class="card">
  <h2>{E_EDIT} Kullanıcı Düzenle</h2>
  <div class="muted">Borsa seçenekleri OKX Binance Bybit Gateio</div>

    <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
      <form method="post" action="/admin/users/{u['username']}/extend" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
        <div>
          <label>Süre uzat (gün)</label>
          <input class="input" name="days" inputmode="numeric" placeholder="Örn: 30" style="max-width:160px">
        </div>
        <button class="btn" type="submit">{E_TIME} Uzat</button>
      </form>
    </div>

  <div class="hr"></div>

  <form method="post" action="/admin/users/{u['username']}/update">
    <div class="row">
      <div>
        <label>Kullanıcı adı</label>
        <input class="input" value="{u['username']}" disabled>
      </div>
      <div>
        <label>Görünen ad</label>
        <input class="input" name="display_name" value="{esc(u['display_name'])}">
      </div>
    </div>

    <div class="row">
      <div>
        <label>Yeni şifre</label>
        <input class="input" name="new_password" type="password" placeholder="Boş bırakılırsa değişmez">
      </div>
      <div>
        <label>Borsa</label>
        <select name="exchange_id">
          {exchange_select_options(safe_str(u["exchange_id"]))}
        </select>
      </div>
    </div>

    <div class="row">
      <div>
        <label>Paket</label>
        <select name="package_name">{pkg_opts}</select>
      </div>
      <div>
        <label>Paket süresi</label>
        <select name="package_months">{months_opts}</select>
      </div>
    </div>

    <div class="row">
      <div>
        <label>Webhook secret</label>
        <input class="input" name="webhook_secret" value="{esc(u['webhook_secret'])}">
      </div>
      <div>
        <label>Telegram Chat ID</label>
        <input class="input" name="telegram_chat_id" value="{esc(u['telegram_chat_id'])}">
      </div>
    </div>

    <div class="row">
      <div>
        <label>Kontroller</label>
        <div class="inline">
          <span class="muted">Trade</span>
          <label class="switch"><input type="checkbox" name="trade_enabled" {trade_checked}><span class="slider"></span></label>
          <span class="muted">Limit dolunca kapat</span>
          <label class="switch"><input type="checkbox" name="disable_on_limit" {dolunca_checked}><span class="slider"></span></label>
        </div>
      </div>
      <div>
        <label>Durum</label>
        <input class="input" value="Kullanım {format_usage_badge(u)}   Bitiş {expires_s}   Kâr {float(u['total_pnl'] or 0.0):.4f} USDT" disabled>
      </div>
    </div>

    <div class="hr"></div>
    <h2>{E_LOCK} API Bilgileri</h2>
    <div class="muted">OKX zorunlu, diğerleri opsiyonel</div>

    <div class="row">
      <div>
        <label>OKX API Key</label>
        <input class="input" name="api_key" value="{esc(u.get('api_key',''))}">
      </div>
      <div>
        <label>OKX API Secret</label>
        <input class="input" name="api_secret" value="{esc(u.get('api_secret',''))}">
      </div>
    </div>

    <div class="row">
      <div>
        <label>OKX API Şifre</label>
        <input class="input" name="api_passphrase" value="{esc(u.get('api_passphrase',''))}">
      </div>
      <div>
        <label>Bilgi</label>
        <input class="input" value="OKX alanları dolu olmalı" disabled>
      </div>
    </div>

    <div class="hr"></div>
    <div class="muted" style="font-weight:900">Binance</div>
    <div class="row">
      <div>
        <label>Binance API Key</label>
        <input class="input" name="binance_api_key" value="{esc(u.get('binance_api_key',''))}">
      </div>
      <div>
        <label>Binance API Secret</label>
        <input class="input" name="binance_api_secret" value="{esc(u.get('binance_api_secret',''))}">
      </div>
    </div>

    <div class="muted" style="font-weight:900">Bybit</div>
    <div class="row">
      <div>
        <label>Bybit API Key</label>
        <input class="input" name="bybit_api_key" value="{esc(u.get('bybit_api_key',''))}">
      </div>
      <div>
        <label>Bybit API Secret</label>
        <input class="input" name="bybit_api_secret" value="{esc(u.get('bybit_api_secret',''))}">
      </div>
    </div>

    <div class="muted" style="font-weight:900">Gate.io</div>
    <div class="row">
      <div>
        <label>Gate API Key</label>
        <input class="input" name="gate_api_key" value="{esc(u.get('gate_api_key',''))}">
      </div>
      <div>
        <label>Gate API Secret</label>
        <input class="input" name="gate_api_secret" value="{esc(u.get('gate_api_secret',''))}">
      </div>
    </div>

    <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn" type="submit">{E_SAVE} Kaydet</button>
      <a class="btn secondary" href="/admin">{E_BACK} Geri</a>
    </div>
  </form>

  <div class="hr"></div>
  <form method="post" action="/admin/users/{u['username']}/delete" onsubmit="return confirm('Kullanıcı silinsin')">
    <button class="btn danger" type="submit">{E_TRASH} Kullanıcıyı Sil</button>
  </form>
</div>
"""
    return base_html("Kullanıcı Düzenle", body, nav_html(True))


@app.post("/admin/users/<username>/update")
def admin_user_update(username: str):
    rr = require_admin()
    if rr:
        return rr

    u = get_user(username)
    if not u:
        return redirect("/admin")
    old_tg = ""
    try:
        c2 = db()
        r2 = c2.execute("SELECT telegram_chat_id FROM users WHERE username=?", (username,)).fetchone()
        if r2:
            try:
                old_tg = safe_str(r2["telegram_chat_id"])
            except Exception:
                old_tg = safe_str(r2[0])
        c2.close()
    except Exception:
        try:
            c2.close()
        except Exception:
            pass
        old_tg = ""


    display_name = safe_str(request.form.get("display_name"))
    exchange_id = safe_str(request.form.get("exchange_id") or DEFAULT_EXCHANGE).upper()
    webhook_secret = safe_str(request.form.get("webhook_secret"))
    telegram_chat_id = safe_str(request.form.get("telegram_chat_id"))

    package_name = safe_str(request.form.get("package_name") or safe_str(u["package_name"]) or "Basic")
    try:
        months = int(safe_str(request.form.get("package_months") or u["package_months"]))
    except Exception:
        months = int(u["package_months"] or 1)
    months = max(1, min(12, months))

    trade_enabled = 1 if request.form.get("trade_enabled") == "on" else 0
    disable_on_limit = 1 if request.form.get("disable_on_limit") == "on" else 0

    # OKX
    api_key = safe_str(request.form.get("api_key"))
    api_secret = safe_str(request.form.get("api_secret"))
    api_passphrase = safe_str(request.form.get("api_passphrase"))

    # Diğer 3 borsa
    binance_api_key = safe_str(request.form.get("binance_api_key"))
    binance_api_secret = safe_str(request.form.get("binance_api_secret"))
    bybit_api_key = safe_str(request.form.get("bybit_api_key"))
    bybit_api_secret = safe_str(request.form.get("bybit_api_secret"))
    gate_api_key = safe_str(request.form.get("gate_api_key"))
    gate_api_secret = safe_str(request.form.get("gate_api_secret"))

    new_password = safe_str(request.form.get("new_password"))

    if exchange_id not in [x[0] for x in EXCHANGES]:
        exchange_id = safe_str(u["exchange_id"]).upper() or DEFAULT_EXCHANGE

    pkg_limit = package_limit_for(package_name)
    expires_at = now_ts() + int(months * 30 * 24 * 3600)

    conn = db()
    try:
        conn.execute("""
            UPDATE users SET
              display_name=?,
              exchange_id=?,
              webhook_secret=?,
              telegram_chat_id=?,
              package_name=?,
              package_limit=?,
              package_months=?,
              expires_at=?,
              trade_enabled=?,
              disable_on_limit=?,
              api_key=?,
              api_secret=?,
              api_passphrase=?,
              binance_api_key=?,
              binance_api_secret=?,
              bybit_api_key=?,
              bybit_api_secret=?,
              gate_api_key=?,
              gate_api_secret=?
            WHERE username=?
        """, (
            display_name, exchange_id, webhook_secret, telegram_chat_id,
            package_name, pkg_limit, months, expires_at,
            trade_enabled, disable_on_limit,
            api_key, api_secret, api_passphrase,
            binance_api_key, binance_api_secret,
            bybit_api_key, bybit_api_secret,
            gate_api_key, gate_api_secret,
            username
        ))

        if new_password:
            salt = secrets.token_hex(16)
            pw_hash = hash_password(new_password, salt)
            conn.execute("UPDATE users SET salt=?, password_hash=? WHERE username=?",
                         (salt, pw_hash, username))

        conn.commit()
    finally:
        conn.close()
            # Telegram bağlantı testi (SADECE kullanıcı DM)
    try:
        new_tg = safe_str(telegram_chat_id)
        if new_tg and new_tg != safe_str(old_tg):
            test_msg = "\n".join([
                f"{E_OK} Telegram bağlantısı test edildi",
                f"{E_USER} {safe_str(display_name) or safe_str(username)}",
                f"{E_TIME} {iso_now_local()}",
            ])
            telegram_send_to(new_tg, test_msg)
            log_line("admin", "INFO", f"Telegram test DM sent user={username} chat_id={new_tg}")
    except Exception as e:
        try:
            log_line("admin", "WARN", f"Telegram test DM failed user={username} err={e}")
        except Exception:
            pass


    log_line("admin", "INFO", f"User updated {username}")
    return redirect(f"/admin/users/{username}")


@app.post("/admin/users/<username>/delete")
def admin_user_delete(username: str):
    rr = require_admin()
    if rr:
        return rr

    if username.strip().lower() == "admin":
        return redirect("/admin")

    conn = db()
    try:
        for tbl in ("pending_signals", "usage", "logs", "trades", "auto_rules"):
            try:
                conn.execute(f"DELETE FROM {tbl} WHERE username=?", (username,))
            except Exception:
                pass
        conn.execute("DELETE FROM users WHERE username=?", (username,))
        conn.commit()
    finally:
        conn.close()

    log_line("admin", "INFO", f"User deleted {username}")
    return redirect("/admin")


@app.get("/admin")
def admin_home():
    rr = require_admin()
    if rr:
        return rr

    conn = db()
    users = conn.execute("SELECT * FROM users ORDER BY created_at DESC").fetchall()
    total_pnl = conn.execute("SELECT COALESCE(SUM(total_pnl),0.0) AS s FROM users").fetchone()["s"]
    pending_count = conn.execute("SELECT COUNT(1) AS c FROM pending_signals WHERE status='PENDING'").fetchone()["c"]
    conn.close()

    current_mode = get_global_auto_mode()
    g = get_auto_gate(session.get("username") or "") if AUTO_REGIME_ENABLED else {"gate": 1, "mode": current_mode, "reason": ""}
    gate_v = int((g or {}).get("gate") or 0)
    gate_reason = safe_str((g or {}).get("reason") or "")

    body = f"""
<div class="kpi">
  <div class="box"><div class="k">Toplam Kullanıcı</div><div class="v">{E_PPL} {len(users)}</div></div>
  <div class="box"><div class="k">Bekleyen Sinyal</div><div class="v">{E_MAIL} {int(pending_count)}</div></div>
  <div class="box"><div class="k">Toplam Kâr</div><div class="v">{E_UP} {float(total_pnl):.4f} USDT</div></div>
</div>
<div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
  <a class="btn" href="/admin/new-user">{E_PLUS} Yeni Kullanıcı</a>
  <a class="btn secondary" href="/admin/logs">{E_LOGS} Logs</a>
</div>
<div class="card" style="margin-top:16px">
  <h2>🔥 Global AUTO Mod</h2>
  <div class="muted">Sadece admin değiştirir. Kullanıcılar sadece görür.</div>
  <div class="hr"></div>
  <form method="post" action="/admin/settings/auto-mode" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:0">
    <select name="auto_mode" class="input" style="max-width:240px">
      <option value="HARD" {'selected' if current_mode=='HARD' else ''}>🧊 HARD (daha seçici)</option>
      <option value="NORMAL" {'selected' if current_mode=='NORMAL' else ''}>✅ NORMAL</option>
      <option value="AGGRESSIVE" {'selected' if current_mode=='AGGRESSIVE' else ''}>🔥 AGRESİF (daha sık)</option>
    </select>
    <button class="btn" type="submit">{E_SAVE} Kaydet</button>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <span class="badge {'good' if gate_v==1 else 'bad'}">{E_ON if gate_v==1 else E_OFF} Gate {'ON' if gate_v==1 else 'OFF'}</span>
      <span class="badge">{E_TIME} {current_mode}</span>
    </div>
  </form>
  <div class="muted small" style="margin-top:10px">{safe_str(gate_reason) if gate_reason else ''}</div>
</div>

<div class="hr"></div>


<div class="card" style="margin-top:16px">
  <h2>{E_PPL} Kullanıcılar</h2>
  <div class="muted">Trade, paket, borsa, API, Telegram yönetimi</div>
  <div class="hr"></div>
  <table class="table">
    <thead>
      <tr>
        <th>Kullanıcı</th><th>Borsa</th><th>Paket</th><th>Kullanım</th><th>Trade</th><th>Kâr</th><th>İşlem</th>
      </tr>
    </thead>
    <tbody>
"""
    rows = ""
    for u in users:
        badge = format_usage_badge(u)
        trade = int(u["trade_enabled"] or 0) == 1

        trade_btn = f"""
<form method="post" action="/admin/users/{u["username"]}/toggle-trade" style="display:inline">
  <button class="btn {'good' if trade else 'danger'}" type="submit">
    {E_ON if trade else E_OFF} {'ON' if trade else 'OFF'}
  </button>
</form>
"""

        rows += f"""
<tr class="tr">
  <td><b>{u["username"]}</b><div class="muted small">{safe_str(u["display_name"])}</div></td>
  <td>{safe_str(u["exchange_id"]).upper()}</td>
  <td>{safe_str(u["package_name"])}<div class="muted small">{int(u["package_months"])} ay</div></td>
  <td>{badge}</td>
  <td>{trade_btn}</td>
  <td>{float(u["total_pnl"] or 0.0):.4f}</td>
  <td style="display:flex;gap:8px;flex-wrap:wrap">
    <a class="btn secondary" href="/admin/users/{u["username"]}">{E_EDIT} Düzenle</a>
  </td>
</tr>
"""

    body += rows or '<tr class="tr"><td colspan="7"><div class="muted">Kullanıcı yok</div></td></tr>'
    body += "</tbody></table></div>"
    # ---- Contracts section ----
    try:
        conn = db()
        try:
            cs = conn.execute("SELECT * FROM contracts ORDER BY accepted_at DESC LIMIT 200").fetchall()
        finally:
            conn.close()
    except Exception:
        cs = []

    return base_html("Admin Panel", body, nav_html(True))

@app.post("/admin/settings/auto-mode")
def admin_set_auto_mode():
    rr = require_admin()
    if rr:
        return rr

    mode = safe_str(request.form.get("auto_mode") or "").upper()
    if mode not in ("NORMAL", "AGGRESSIVE", "HARD"):
        mode = "NORMAL"
    set_app_setting("AUTO_MODE", mode)

    # Hemen gate/reason güncelle (beklemesin)
    try:
        ev = _auto_regime_evaluate(mode) if AUTO_REGIME_ENABLED else {"ok": True, "gate": 1, "reason": ""}
        gate = int((ev or {}).get("gate") or 0) if (ev or {}).get("ok") else 0
        reason = safe_str((ev or {}).get("reason") or "Regime eval fail")
        _set_auto_gate_for_all(gate, mode, reason)
    except Exception:
        pass

    return redirect("/admin")



@app.get("/admin/logs")
def admin_logs():
    rr = require_admin()
    if rr:
        return rr

    conn = db()
    rows = conn.execute("SELECT * FROM logs ORDER BY id DESC LIMIT 200").fetchall()
    conn.close()

    lines = ""
    for x in rows:
        t = datetime.utcfromtimestamp(int(x["created_at"] or 0)) + timedelta(hours=TZ_OFFSET_HOURS)
        ts = t.strftime("%Y-%m-%d %H:%M:%S")
        lines += f'<div class="logline">{ts}  {x["level"]}  {x["username"]}  {x["message"]}</div>'

    body = f"""
<div class="card">
  <h2>{E_LOGS} Logs</h2>
  <div class="muted">Tek satır görünüm</div>
  <div class="hr"></div>
  <div style="display:flex;flex-direction:column;gap:10px">
    {lines if lines else '<div class="muted">Log yok</div>'}
  </div>
</div>
"""
    return base_html("Logs", body, nav_html(True))



# =========================
# Admin: Contracts (Sözleşmeler)
# =========================
# =========================
# AUTO REGIME (server-side gate + mode)
# =========================
AUTO_REGIME_ENABLED = os.getenv("AUTO_REGIME_ENABLED", "1").strip().lower() in ("1", "true", "yes", "on")
AUTO_REGIME_SYMBOL = safe_str(os.getenv("AUTO_REGIME_SYMBOL", "BTC/USDT")).upper() or "BTC/USDT"
AUTO_REGIME_BAR = safe_str(os.getenv("AUTO_REGIME_BAR", "1H")).upper() or "1H"
AUTO_REGIME_CHECK_SEC = int(float(os.getenv("AUTO_REGIME_CHECK_SEC", "60") or 60))  # saniye (varsayılan 60)

def get_auto_gate(username: str) -> Dict[str, Any]:
    try:
        conn = db()
        try:
            row = conn.execute(
                "SELECT auto_gate, auto_mode, auto_gate_reason FROM users WHERE username=?",
                (safe_str(username),),
            ).fetchone()
        finally:
            conn.close()
        if not row:
            return {"gate": 1, "mode": get_global_auto_mode(), "reason": ""}
        d = dict(row)
        return {
            "gate": int(d.get("auto_gate") or 0),
            "mode": safe_str(d.get("auto_mode") or get_global_auto_mode()).upper() or get_global_auto_mode(),
            "reason": safe_str(d.get("auto_gate_reason") or ""),
        }
    except Exception:
        return {"gate": 1, "mode": get_global_auto_mode(), "reason": ""}

def _set_auto_gate_for_all(gate: int, mode: str, reason: str) -> None:
    # GLOBAL auto gate updater (tüm kullanıcılar)
    try:
        gate = int(gate or 0)
    except Exception:
        gate = 0

    mode = safe_str(mode).upper() or "NORMAL"
    if mode not in ("NORMAL", "AGGRESSIVE", "HARD"):
        mode = "NORMAL"

    reason = safe_str(reason)
    now = int(time.time())

    # DEBUG: loop çalışıyor mu kanıt
    try:
        print("GATE LOOP TICK", gate, mode, now)
    except Exception:
        pass

    conn = db()
    try:
        conn.execute(
            """
            UPDATE users
            SET auto_gate = ?,
                auto_mode = ?,
                auto_gate_reason = ?,
                updated_at = ?
            """,
            (gate, mode, reason, now)
        )
        conn.commit()
    finally:
        try:
            conn.close()
        except Exception:
            pass


def _okx_fetch_candles(symbol: str, bar: str = "1H", limit: int = 260) -> List[Dict[str, Any]]:
    try:
        import requests
        inst = safe_str(symbol).upper().replace("/", "-")
        url = "https://www.okx.com/api/v5/market/candles"
        r = requests.get(url, params={"instId": inst, "bar": bar, "limit": int(limit)}, timeout=10)
        j = r.json() if r is not None else {}
        data = (j or {}).get("data") or []
        out: List[Dict[str, Any]] = []
        for row in data:
            try:
                out.append({"ts": int(float(row[0]) / 1000.0), "o": float(row[1]), "h": float(row[2]), "l": float(row[3]), "c": float(row[4])})
            except Exception:
                continue
        out.sort(key=lambda x: int(x.get("ts") or 0))
        return out
    except Exception:
        return []

def _ema(series: List[float], length: int) -> float:
    if not series or length <= 1 or len(series) < length:
        return 0.0
    k = 2.0 / (length + 1.0)
    ema = float(series[0])
    for v in series[1:]:
        ema = (float(v) * k) + (ema * (1.0 - k))
    return float(ema)

def _rsi(series: List[float], length: int) -> float:
    if not series or length <= 1 or len(series) < (length + 1):
        return 0.0
    gains = 0.0
    losses = 0.0
    for i in range(1, length + 1):
        ch = float(series[i] - series[i - 1])
        if ch >= 0:
            gains += ch
        else:
            losses += abs(ch)
    avg_gain = gains / float(length)
    avg_loss = losses / float(length)
    for i in range(length + 1, len(series)):
        ch = float(series[i] - series[i - 1])
        g = ch if ch > 0 else 0.0
        l = abs(ch) if ch < 0 else 0.0
        avg_gain = (avg_gain * (length - 1) + g) / float(length)
        avg_loss = (avg_loss * (length - 1) + l) / float(length)
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return float(100.0 - (100.0 / (1.0 + rs)))

def _pct_range_last_n(candles: List[Dict[str, Any]], n: int = 3) -> float:
    if not candles or len(candles) < n:
        return 0.0
    sub = candles[-n:]
    hh = max([float(x.get("h") or 0.0) for x in sub] or [0.0])
    ll = min([float(x.get("l") or 0.0) for x in sub] or [0.0])
    if ll <= 0:
        return 0.0
    return float((hh - ll) / ll * 100.0)

def _auto_regime_thresholds(mode: str) -> Dict[str, float]:
    mode = safe_str(mode).upper() or "NORMAL"
    if mode == "AGGRESSIVE":
        return {"rsi_on": 52.0, "rsi_off": 48.0, "min_move": 0.25}
    if mode == "HARD":
        return {"rsi_on": 58.0, "rsi_off": 42.0, "min_move": 0.45}
    return {"rsi_on": 55.0, "rsi_off": 45.0, "min_move": 0.35}

def _auto_regime_evaluate(mode: str) -> Dict[str, Any]:
    th = _auto_regime_thresholds(mode)
    candles = _okx_fetch_candles(AUTO_REGIME_SYMBOL, AUTO_REGIME_BAR, 260)
    if not candles or len(candles) < 210:
        return {"ok": False, "gate": 0, "reason": "Candle yok"}
    closes = [float(x["c"]) for x in candles]
    ema200_now = _ema(closes[-220:], 200)
    ema200_prev = _ema(closes[-221:-1], 200) if len(closes) >= 221 else ema200_now
    slope_up = ema200_now >= ema200_prev
    last_close = float(closes[-1])
    above_ema = last_close >= ema200_now if ema200_now > 0 else False
    rsi14 = _rsi(closes[-200:], 14)
    move3 = _pct_range_last_n(candles, 3)

    # --- Gate gevşetilmiş karar mantığı ---
    RSI_MIN = 28.0          # RSI alt limiti (gevşetildi)
    MOMO_ON = 0.35            # 3 bar toplam hareket %0.90 üstüyse momentum güçlü
    ALLOW_DOWN_IF_MOMO = True

    # varsayılan kapalı
    ok = False

    # RSI filtresi
    if rsi14 >= RSI_MIN:
        ok = True

    # EMA200 trend filtresi
    if not slope_up:
        if ALLOW_DOWN_IF_MOMO and move3 >= MOMO_ON:
            ok = True
        else:
            ok = False

    # EMA altında ise momentum yoksa kapat
    if not above_ema and move3 < MOMO_ON:
        ok = False

    reason = f"EMA200 {'UP' if slope_up else 'DOWN'} • Close {'>=EMA' if above_ema else '<EMA'} • RSI {rsi14:.1f} • 3bar {move3:.2f}% • mode {mode}"
    return {"ok": True, "gate": 1 if ok else 0, "reason": reason}


def _auto_regime_eval_symbol(symbol: str, mode: str) -> Dict[str, Any]:
    """
    AUTO regime değerlendirmesini, hedef sembol bazında döndürür.
    - gate: BUY filtresi için (1/0)
    - strong: SELL DEFER için "trend güçlü" sinyali (True/False)
    """
    try:
        ex = "OKX"  # Auto-Regime şu an sadece OKX mumlarına göre çalışır
        sym = normalize_symbol(symbol)
        candles = _auto_regime_fetch_okx_candles(sym)
        if not candles:
            return {"ok": False, "gate": 0, "strong": False, "reason": "Candle yok"}

        closes = [float(x["c"]) for x in candles]
        ema200_now = _ema(closes[-220:], 200)
        ema200_prev = _ema(closes[-221:-1], 200) if len(closes) >= 221 else ema200_now
        slope_up = ema200_now >= ema200_prev
        last_close = float(closes[-1])
        above_ema = last_close >= ema200_now if ema200_now > 0 else False
        rsi14 = _rsi(closes[-200:], 14)
        move3 = _pct_range_last_n(candles, 3)

        RSI_MIN = 28.0
        MOMO_ON = 0.35
        ALLOW_DOWN_IF_MOMO = True

        ok_gate = False
        if rsi14 >= RSI_MIN:
            ok_gate = True
        if not slope_up:
            if ALLOW_DOWN_IF_MOMO and move3 >= MOMO_ON:
                ok_gate = True
            else:
                ok_gate = False
        if not above_ema and move3 < MOMO_ON:
            ok_gate = False

        # "trend güçlü" tanımı: yukarı eğim + EMA üstü + momentum
        strong = bool(slope_up and above_ema and (move3 >= MOMO_ON))

        reason = f"{ex} {sym} • EMA200 {'UP' if slope_up else 'DOWN'} • Close {'>=EMA' if above_ema else '<EMA'} • RSI {rsi14:.1f} • 3bar {move3:.2f}% • mode {mode}"
        return {"ok": True, "gate": 1 if ok_gate else 0, "strong": strong, "reason": reason}
    except Exception as e:
        return {"ok": False, "gate": 0, "strong": False, "reason": f"Eval hata: {safe_str(e)}"}


def _auto_sell_defer_should_queue(username: str, exchange_id: str, symbol: str) -> Dict[str, Any]:
    """B: Trend güçlü ise Gate ON + SELL DEFER; zayıfsa SELL INSTANT."""
    try:
        if not AUTO_SELL_DEFER_ENABLED:
            return {"defer": False, "reason": "SELL DEFER kapalı"}

        # Gate OFF ise (manuel), BUY kapalı / SELL açık. Defer yapma.
        if AUTO_REGIME_ENABLED:
            gg = get_auto_gate(username) or {}
            if int(gg.get("gate") or 0) != 1:
                return {"defer": False, "reason": "Gate OFF"}

        mode = get_global_auto_mode()
        ev = _auto_regime_eval_symbol(symbol, mode)
        if not (ev or {}).get("ok"):
            return {"defer": False, "reason": safe_str((ev or {}).get("reason") or "Eval fail")}

        if bool((ev or {}).get("strong")):
            return {"defer": True, "reason": safe_str((ev or {}).get("reason") or "Trend güçlü")}

        return {"defer": False, "reason": safe_str((ev or {}).get("reason") or "Trend zayıf")}
    except Exception as e:
        return {"defer": False, "reason": f"Defer karar hatası: {safe_str(e)}"}


def _auto_sell_defer_max_sec_for_mode(mode: str) -> int:
    m = safe_str(mode).upper()
    if m in ("HARD", "EASY", "SAFE"):
        return int(AUTO_SELL_DEFER_MAX_SEC_HARD)
    if m in ("AGGRESSIVE", "AGGR", "FAST"):
        return int(AUTO_SELL_DEFER_MAX_SEC_AGGR)
    return int(AUTO_SELL_DEFER_MAX_SEC_NORMAL)


def _auto_sell_defer_key(username: str, exchange_id: str, symbol: str) -> str:
    return f"{safe_str(username)}|{safe_str(exchange_id).upper()}|{normalize_symbol(symbol)}"


def _auto_sell_defer_enqueue(username: str, exchange_id: str, symbol: str, reason: str) -> bool:
    k = _auto_sell_defer_key(username, exchange_id, symbol)
    nowi = now_ts()
    with _DEFERRED_SELLS_LOCK:
        if k in _DEFERRED_SELLS:
            return False
        mode = get_global_auto_mode()
        _DEFERRED_SELLS[k] = {
            "username": safe_str(username),
            "exchange_id": safe_str(exchange_id).upper(),
            "symbol": normalize_symbol(symbol),
            "created_at": nowi,
            "last_check": 0,
            "max_sec": _auto_sell_defer_max_sec_for_mode(mode),
            "mode": safe_str(mode),
            "reason": safe_str(reason),
        }
    return True


def _auto_sell_execute_now(username: str, u: dict, exchange_id: str, symbol: str) -> Dict[str, Any]:
    """Webhook AUTO SELL'in mevcut davranışı: aynı semboldeki tüm pozisyonları kapat."""
    # açık pozisyon(lar) bul (stack destekli)
    conn = db()
    try:
        prows = conn.execute(
            "SELECT * FROM open_positions WHERE username=? AND exchange_id=? AND symbol=? ORDER BY id ASC",
            (username, exchange_id, symbol),
        ).fetchall()
    finally:
        conn.close()

    if not prows:
        return {"ok": False, "error": "Açık pozisyon yok"}

    positions = [dict(r) for r in prows]
    dry_run_pos = bool(int(positions[0].get("dry_run") or 0) == 1)

    total_qty = 0.0
    total_entry_usdt = 0.0
    total_entry_qty_price = 0.0
    for p in positions:
        q = float(p.get("qty") or 0.0)
        ep = float(p.get("entry_price") or 0.0)
        eu = float(p.get("entry_usdt") or 0.0)
        if q > 0:
            total_qty += q
            total_entry_qty_price += (ep * q) if ep > 0 else 0.0
        if eu > 0:
            total_entry_usdt += eu

    avg_entry_price = (total_entry_qty_price / total_qty) if (total_qty > 0 and total_entry_qty_price > 0) else 0.0

    # LIVE modda yetki kontrolü
    if (not dry_run_pos) and (not may_trade(u)):
        return {"ok": False, "error": "Trade kapalı/limit dolu"}

    ok = True
    err = ""
    pnl_usdt = 0.0
    proceeds = 0.0
    fee_total_usdt = 0.0

    if dry_run_pos:
        try:
            last_price = float(get_public_price(exchange_id, symbol) or 0.0)
        except Exception:
            last_price = 0.0
        sell_qty = total_qty
        proceeds = (last_price * sell_qty) if (last_price > 0 and sell_qty > 0) else 0.0
        cost_basis = total_entry_usdt if total_entry_usdt > 0 else ((avg_entry_price * sell_qty) if (avg_entry_price > 0 and sell_qty > 0) else 0.0)
        pnl_usdt = (proceeds - cost_basis) if (proceeds > 0 and cost_basis >= 0) else 0.0
    else:
        keys = _keys_for_exchange(u, exchange_id)
        api_key = safe_str(keys.get("api_key"))
        api_secret = safe_str(keys.get("api_secret"))
        api_pass = safe_str(keys.get("api_passphrase"))

        qty_to_sell = float(total_qty or 0.0)
        if exchange_id == "OKX":
            try:
                base_ccy = _base_ccy_from_symbol(symbol)
                bal_qty = okx_get_asset_balance(base_ccy, api_key, api_secret, api_pass)
                if bal_qty > 0:
                    qty_to_sell = bal_qty
            except Exception:
                pass

        res = place_order(exchange_id, "SELL", symbol, qty_to_sell, False, api_key, api_secret, api_pass)
        ok = bool((res or {}).get("ok"))
        err = safe_str((res or {}).get("reason") or "")
        if ok:
            # proceeds (gross)
            proceeds = _to_float((res or {}).get("real_usdt"), 0.0)
            if proceeds <= 0:
                fp = _to_float((res or {}).get("fill_price"), 0.0)
                fq = _to_float((res or {}).get("fill_qty"), 0.0)
                proceeds = fp * fq if (fp > 0 and fq > 0) else 0.0

            fill_price = _to_float((res or {}).get("fill_price"), 0.0)

            # cost basis (stack'li pozisyonlardan oransal)
            ratio = 1.0
            cost_basis = 0.0
            if total_entry_usdt > 0 and total_qty > 0 and qty_to_sell > 0:
                ratio = min(1.0, float(qty_to_sell) / float(total_qty))
                cost_basis = float(total_entry_usdt) * ratio
            else:
                buy_spent = get_last_buy_spent(username, exchange_id, symbol, False)
                if buy_spent > 0:
                    cost_basis = buy_spent

            # Fees: BUY (stack) + SELL (order)
            buy_fee_total_usdt = _sum_buy_fees_usdt(exchange_id, symbol, positions) * ratio
            sell_fee_total_usdt = _sum_sell_fees_usdt(exchange_id, symbol, fill_price, res)
            fee_total_usdt = buy_fee_total_usdt + sell_fee_total_usdt

            # NET proceeds & NET PnL
            proceeds_net = proceeds - sell_fee_total_usdt
            pnl_usdt = proceeds_net - cost_basis - buy_fee_total_usdt


    if not ok:
        return {"ok": False, "error": err or "SELL başarısız"}

    # pozisyon(lar)ı kapat
    try:
        conn = db()
        try:
            conn.execute(
                "DELETE FROM open_positions WHERE username=? AND exchange_id=? AND symbol=? AND dry_run=?",
                (username, exchange_id, symbol, 1 if dry_run_pos else 0),
            )
            conn.commit()
        finally:
            conn.close()
    except Exception:
        pass

    try:
        record_trade(username, exchange_id, "SELL", symbol, proceeds, pnl_usdt, False if not dry_run_pos else True)
    except Exception:
        pass

    try:
        inc_usage(username)
    except Exception:
        pass

    try:
        telegram_send_for_user(
            u,
            build_telegram_text(
                "SELL",
                u,
                symbol,
                (total_entry_usdt if total_entry_usdt > 0 else proceeds),
                dry_run_pos,
                {"net_pnl_usdt": pnl_usdt, "net_pnl_try": (pnl_usdt * USDT_TRY_RATE), "fee_usdt_total": fee_total_usdt, "pnl_usdt": pnl_usdt, "pnl_try": (pnl_usdt * USDT_TRY_RATE), "mode": "AUTO"},
            ),
        )
    except Exception:
        pass

    try:
        log_line(username, "INFO", f"{E_BOT} AUTO SELL çalıştı: {exchange_id} {symbol} pnl={pnl_usdt:.6f}")
    except Exception:
        pass

    return {"ok": True, "pnl_usdt": pnl_usdt, "fee_usdt_total": fee_total_usdt, "proceeds": proceeds}


def _auto_sell_defer_loop():
    if not AUTO_SELL_DEFER_ENABLED:
        return
    while True:
        try:
            time.sleep(max(3.0, float(AUTO_SELL_DEFER_CHECK_SEC)))
        except Exception:
            time.sleep(10.0)

        # snapshot keys
        with _DEFERRED_SELLS_LOCK:
            items = list(_DEFERRED_SELLS.items())

        if not items:
            continue

        for k, it in items:
            try:
                username = safe_str(it.get("username"))
                exchange_id = safe_str(it.get("exchange_id")).upper()
                symbol = normalize_symbol(safe_str(it.get("symbol")))
                created_at = int(it.get("created_at") or 0)
                max_sec = int(it.get("max_sec") or 0)
                age = max(0, now_ts() - created_at)

                u = get_user(username)
                if not u:
                    with _DEFERRED_SELLS_LOCK:
                        _DEFERRED_SELLS.pop(k, None)
                    continue

                # time limit dolduysa: zorla sat
                if max_sec > 0 and age >= max_sec:
                    _auto_sell_execute_now(username, u, exchange_id, symbol)
                    with _DEFERRED_SELLS_LOCK:
                        _DEFERRED_SELLS.pop(k, None)
                    continue

                # trend hala güçlü mü?
                dec = _auto_sell_defer_should_queue(username, exchange_id, symbol)
                if bool(dec.get("defer")):
                    # hala güçlü: bekle
                    continue

                # trend zayıfladı: sat
                _auto_sell_execute_now(username, u, exchange_id, symbol)
                with _DEFERRED_SELLS_LOCK:
                    _DEFERRED_SELLS.pop(k, None)
            except Exception:
                # bu item'da hata olursa en azından kuyrukta kalıp bir sonraki turda tekrar denensin
                continue


def start_auto_sell_defer_thread():
    if not AUTO_SELL_DEFER_ENABLED:
        return
    try:
        th = threading.Thread(target=_auto_sell_defer_loop, daemon=True)
        th.start()
    except Exception:
        pass

def _auto_regime_loop():
    if not AUTO_REGIME_ENABLED:
        return
    while True:
        try:
            mode = get_global_auto_mode()
            ev = _auto_regime_evaluate(mode)
            if (ev or {}).get("ok"):
                gate = int((ev or {}).get("gate") or 0)
                reason = safe_str((ev or {}).get("reason") or "")
                _set_auto_gate_for_all(gate, mode, reason)
            else:
                # Eval başarısızsa gate'i zorla OFF yapma: mevcut durumu koru, sadece logla
                try:
                    log_line("auto", "WARN", f"Regime eval fail mode={mode} reason={safe_str((ev or {}).get('reason') or '')}")
                except Exception:
                    pass
        except Exception:
            pass
        try:
            time.sleep(max(5, int(AUTO_REGIME_CHECK_SEC)))
        except Exception:
            time.sleep(3600)

def start_auto_regime_thread():
    if not AUTO_REGIME_ENABLED:
        return
    try:
        th = threading.Thread(target=_auto_regime_loop, daemon=True)
        th.start()
    except Exception:
        pass



# =========================
# TP Manager (net hedef kâr)
# =========================
TP_MANAGER_ENABLED = bool(int(os.getenv("TP_MANAGER_ENABLED", "1")))  # 1=aktif

# Net hedef: %0.50 = 0.005
TP_NET_TARGET_PCT = float(os.getenv("TP_NET_TARGET_PCT", "0.005"))

# Tahmini satış fee oranı (OKX spot için değişebilir)
# 0.001 = %0.10, 0.002 = %0.20 gibi düşün
TP_SELL_FEE_RATE = float(os.getenv("TP_SELL_FEE_RATE", "0.001"))

# Kontrol aralığı (saniye)
TP_CHECK_SEC = float(os.getenv("TP_CHECK_SEC", "6"))

# Min bekleme (BUY sonrası hemen satmasın)
TP_MIN_HOLD_SEC = int(os.getenv("TP_MIN_HOLD_SEC", "60"))

# Max bekleme (hedefe gelmezse zorla kapatmak istersen)
TP_MAX_HOLD_SEC = int(os.getenv("TP_MAX_HOLD_SEC", "0"))  # 0=kapalı

# Opsiyonel net stop (negatif değer): örn -0.006 = -%0.60
TP_NET_STOP_PCT = float(os.getenv("TP_NET_STOP_PCT", "0.0"))


def _tp_manager_loop():
    """
    Açık pozisyonları düzenli kontrol eder.
    NET PnL >= TP_NET_TARGET_PCT olduğunda server kendi SELL atar.
    """
    if not TP_MANAGER_ENABLED:
        return

    while True:
        try:
            time.sleep(max(2.0, float(TP_CHECK_SEC)))
        except Exception:
            time.sleep(10.0)

        # Pozisyonları oku
        try:
            conn = db()
            rows = conn.execute("""
                SELECT id, username, exchange_id, symbol, qty, entry_usdt, buy_fee_usdt, buy_fee_coin, buy_fee_coin_ccy, created_at, dry_run
                FROM open_positions
                ORDER BY id ASC
            """).fetchall()
            conn.close()
        except Exception:
            continue

        for r in (rows or []):
            try:
                p = dict(r) if r is not None else {}
                pid = int(p.get("id") or 0)
                username = safe_str(p.get("username") or "")
                exchange_id = safe_str(p.get("exchange_id") or "").upper()
                symbol = normalize_symbol(safe_str(p.get("symbol") or ""))
                qty = _to_float(p.get("qty"), 0.0)
                entry_usdt = _to_float(p.get("entry_usdt"), 0.0)
                buy_fee_usdt = _to_float(p.get("buy_fee_usdt"), 0.0)
                buy_fee_coin = _to_float(p.get("buy_fee_coin"), 0.0)
                buy_fee_coin_ccy = safe_str(p.get("buy_fee_coin_ccy") or "").upper()
                created_at = int(p.get("created_at") or 0)
                age = max(0, now_ts() - created_at)

                if qty <= 0 or entry_usdt <= 0:
                    continue
                if age < TP_MIN_HOLD_SEC:
                    continue

                u = get_user(username)
                if not u:
                    continue
                if u and not isinstance(u, dict):
                    u = dict(u)

                # Günlük zarar limiti vb. blok varsa trade etme
                try:
                    if daily_loss_block_msg(u):
                        continue
                except Exception:
                    pass

                # Anlık fiyat
                cur_px = _to_float(get_public_price(exchange_id, symbol), 0.0)
                if cur_px <= 0:
                    continue

                proceeds = qty * cur_px

                # buy fee coin -> USDT (mümkünse)
                buy_fee_coin_usdt = 0.0
                if buy_fee_coin > 0 and buy_fee_coin_ccy and buy_fee_coin_ccy not in ("USDT", "USD"):
                    try:
                        fee_sym = f"{buy_fee_coin_ccy}/USDT"
                        fee_px = _to_float(get_public_price(exchange_id, fee_sym), 0.0)
                        if fee_px > 0:
                            buy_fee_coin_usdt = buy_fee_coin * fee_px
                    except Exception:
                        pass

                cost = entry_usdt + buy_fee_usdt + buy_fee_coin_usdt

                # Tahmini sell fee
                sell_fee_est = proceeds * float(TP_SELL_FEE_RATE)

                net_pnl = proceeds - sell_fee_est - cost
                net_pnl_pct = (net_pnl / cost) if cost > 0 else 0.0

                # Zorla çık (max hold)
                if TP_MAX_HOLD_SEC > 0 and age >= TP_MAX_HOLD_SEC:
                    _auto_sell_execute_now(username, u, exchange_id, symbol)
                    continue

                # Stop loss (opsiyonel)
                if TP_NET_STOP_PCT < 0 and net_pnl_pct <= TP_NET_STOP_PCT:
                    _auto_sell_execute_now(username, u, exchange_id, symbol)
                    continue

                # Take profit
                if net_pnl_pct >= float(TP_NET_TARGET_PCT):
                    _auto_sell_execute_now(username, u, exchange_id, symbol)
                    continue

            except Exception:
                continue


def start_tp_manager_thread():
    if not TP_MANAGER_ENABLED:
        return
    try:
        th = threading.Thread(target=_tp_manager_loop, daemon=True)
        th.start()
    except Exception:
        pass


# =========================
# Startup
# =========================
init_db()
start_auto_regime_thread()
start_auto_sell_defer_thread()
start_tp_manager_thread()


def telegram_send_admin_dm(text: str) -> None:
    """
    Sadece admin DM (TELEGRAM_ADMIN_DM_ID öncelikli). Gruba ASLA atmaz.
    """
    try:
        admin_id = safe_str(os.getenv("TELEGRAM_ADMIN_DM_ID", "") or os.getenv("TELEGRAM_CHAT_ID", "") or "").strip()
        if not admin_id:
            return
        telegram_send_to(admin_id, safe_str(text))
    except Exception:
        pass


@app.post("/trial/upgrade")
def trial_upgrade_request():
    rr = require_login()
    if rr:
        return rr

    username = session.get("username") or ""
    u = get_user(username)
    if u and not isinstance(u, dict):
        u = dict(u)
    if not u:
        return redirect("/login")

    if not is_trial_user(u):
        session["popup_msg"] = f"{E_X} Bu işlem sadece Trial kullanıcılar içindir"
        return redirect("/")

    ex_name = safe_str(u.get("exchange_id") or DEFAULT_EXCHANGE).upper()
    msg = "\n".join([
        "🧪 Trial → Ücretli Geçiş Talebi",
        f"{E_USER} {user_display_name(u)}",
        f"{E_BANK} Borsa: {ex_name}",
        f"{E_TIME} Zaman: {iso_now_local()}",
        f"{E_MAIL} Panelden butona basıldı",
    ])

    if not TELEGRAM_CHAT_ID_FALLBACK:
        session["popup_msg"] = f"{E_WARN} TELEGRAM_CHAT_ID tanımlı değil"
        return redirect("/")

    telegram_send_admin_dm(msg)
    session["popup_msg"] = f"{E_OK} Talebin alındı. Sana DM atıldı"
    return redirect("/")


# =========================
# Telegram Admin Commands (DM only)
# =========================
TG_ADMIN_DM_ID = safe_str(os.getenv("TELEGRAM_ADMIN_DM_ID", "") or os.getenv("TELEGRAM_CHAT_ID", "") or "").strip()
TG_ADMIN_PIN = safe_str(os.getenv("TELEGRAM_ADMIN_PIN", "") or "").strip()
TG_ADMIN_AUTH_TTL = int(os.getenv("TELEGRAM_ADMIN_AUTH_TTL", "900") or "900")  # seconds
TG_ADMIN_CONFIRM_TTL = int(os.getenv("TELEGRAM_ADMIN_CONFIRM_TTL", "90") or "90")  # seconds

# In-memory state (safe for single-process systemd)
_tg_admin_state = {
    "authed_until": 0,
    "pending": {},   # code -> {"cmd": str, "args": str, "expires": int}
    "last_update_id": 0,
}

def _db_init_security() -> None:
    conn = db()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS ip_bans (
                ip TEXT PRIMARY KEY,
                banned_until INTEGER,
                reason TEXT,
                created_at INTEGER
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS login_fails (
                ip TEXT PRIMARY KEY,
                fails INTEGER,
                first_ts INTEGER,
                last_ts INTEGER
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS admin_flags (
                k TEXT PRIMARY KEY,
                v TEXT,
                updated_at INTEGER
            )
        """)
        conn.commit()
    finally:
        conn.close()

def get_admin_flag(k: str, default: str = "") -> str:
    try:
        conn = db()
        try:
            r = conn.execute("SELECT v FROM admin_flags WHERE k=?", (safe_str(k),)).fetchone()
            return safe_str(r[0]) if r and r[0] is not None else safe_str(default)
        finally:
            conn.close()
    except Exception:
        return safe_str(default)

def set_admin_flag(k: str, v: str) -> None:
    conn = db()
    try:
        conn.execute(
            "INSERT INTO admin_flags(k,v,updated_at) VALUES(?,?,?) "
            "ON CONFLICT(k) DO UPDATE SET v=excluded.v, updated_at=excluded.updated_at",
            (safe_str(k), safe_str(v), now_ts())
        )
        conn.commit()
    finally:
        conn.close()

def is_global_panic() -> bool:
    return safe_str(get_admin_flag("panic", "0")) == "1"

def _client_ip() -> str:
    # if behind nginx, prefer X-Forwarded-For first value
    try:
        xff = safe_str(request.headers.get("X-Forwarded-For") or "")
        if xff:
            return safe_str(xff.split(",")[0]).strip()
    except Exception:
        pass
    try:
        return safe_str(request.remote_addr or "").strip()
    except Exception:
        return ""

def is_ip_banned(ip: str) -> bool:
    ip = safe_str(ip).strip()
    if not ip:
        return False
    conn = db()
    try:
        r = conn.execute("SELECT banned_until FROM ip_bans WHERE ip=?", (ip,)).fetchone()
        if not r:
            return False
        until = int(r[0] or 0)
        if until <= now_ts():
            try:
                conn.execute("DELETE FROM ip_bans WHERE ip=?", (ip,))
                conn.commit()
            except Exception:
                pass
            return False
        return True
    finally:
        conn.close()

def ban_ip(ip: str, seconds: int, reason: str) -> None:
    ip = safe_str(ip).strip()
    if not ip:
        return
    until = now_ts() + int(max(60, seconds))
    conn = db()
    try:
        conn.execute(
            "INSERT INTO ip_bans(ip,banned_until,reason,created_at) VALUES(?,?,?,?) "
            "ON CONFLICT(ip) DO UPDATE SET banned_until=excluded.banned_until, reason=excluded.reason",
            (ip, until, safe_str(reason), now_ts())
        )
        conn.commit()
    finally:
        conn.close()

# Brute-force thresholds
BF_MAX_FAILS = int(os.getenv("BF_MAX_FAILS", "8") or "8")          # fails
BF_WINDOW_SEC = int(os.getenv("BF_WINDOW_SEC", "900") or "900")    # 15m
BF_BAN_SEC = int(os.getenv("BF_BAN_SEC", "3600") or "3600")        # 1h

def record_login_fail(ip: str) -> None:
    ip = safe_str(ip).strip()
    if not ip:
        return
    now = now_ts()
    conn = db()
    try:
        r = conn.execute("SELECT fails, first_ts FROM login_fails WHERE ip=?", (ip,)).fetchone()
        if not r:
            conn.execute("INSERT INTO login_fails(ip,fails,first_ts,last_ts) VALUES(?,?,?,?)", (ip, 1, now, now))
            conn.commit()
            return
        fails = int(r[0] or 0)
        first_ts = int(r[1] or now)
        if now - first_ts > BF_WINDOW_SEC:
            fails = 0
            first_ts = now
        fails += 1
        conn.execute("UPDATE login_fails SET fails=?, first_ts=?, last_ts=? WHERE ip=?", (fails, first_ts, now, ip))
        conn.commit()
        if fails >= BF_MAX_FAILS:
            ban_ip(ip, BF_BAN_SEC, f"bruteforce {fails}/{BF_MAX_FAILS}")
            try:
                conn.execute("DELETE FROM login_fails WHERE ip=?", (ip,))
                conn.commit()
            except Exception:
                pass
    finally:
        conn.close()

def clear_login_fail(ip: str) -> None:
    ip = safe_str(ip).strip()
    if not ip:
        return
    conn = db()
    try:
        conn.execute("DELETE FROM login_fails WHERE ip=?", (ip,))
        conn.commit()
    finally:
        conn.close()

# Global guard (admin/login paths)
@app.before_request
def _security_guard_before_request():
    try:
        _db_init_security()
    except Exception:
        pass
# ===============================
# HTTPS redirect FIX (WEBHOOK)
# ===============================
@app.before_request
def _disable_https_redirect_for_webhook():
    # 🔴 TradingView webhook ASLA redirect yemesin
    if request.path == "/webhook":
        return None

    ip = _client_ip()
    if ip and is_ip_banned(ip):
        return ("IP yasaklı", 403)

    # If global panic, block trade endpoints (but allow login/admin)
    try:
        if is_global_panic():
            pth = safe_str(request.path or "")
            if pth.startswith("/webhook") or pth.startswith("/manual/") or "/enqueue" in pth or pth.startswith("/position/") or pth.startswith("/api/execute"):
                return ("PANIC aktif", 503)
    except Exception:
        pass
    return None

def _tg_is_private_chat(update: dict) -> bool:
    try:
        chat = ((update.get("message") or {}).get("chat") or {})
        return safe_str(chat.get("type") or "") == "private"
    except Exception:
        return False

def _tg_chat_id(update: dict) -> str:
    try:
        return safe_str(((update.get("message") or {}).get("chat") or {}).get("id") or "")
    except Exception:
        return ""

def _tg_text(update: dict) -> str:
    try:
        return safe_str((update.get("message") or {}).get("text") or "")
    except Exception:
        return ""

def tg_admin_send(text: str) -> None:
    # DM only to admin chat id
    if not TG_ADMIN_DM_ID:
        return
    telegram_send_to(TG_ADMIN_DM_ID, safe_str(text))

def tg_admin_authed() -> bool:
    return int(_tg_admin_state.get("authed_until") or 0) >= now_ts()

def tg_admin_set_authed():
    _tg_admin_state["authed_until"] = now_ts() + TG_ADMIN_AUTH_TTL

def tg_admin_clear_auth():
    _tg_admin_state["authed_until"] = 0
    _tg_admin_state["pending"] = {}

def _tg_new_code() -> str:
    # 6 digit confirmation code (no ?)
    return f"{secrets.randbelow(900000)+100000}"

def tg_admin_queue_confirm(cmd: str, args: str) -> str:
    code = _tg_new_code()
    _tg_admin_state["pending"][code] = {"cmd": safe_str(cmd), "args": safe_str(args), "expires": now_ts() + TG_ADMIN_CONFIRM_TTL}
    return code

def tg_admin_pop_confirm(code: str) -> Optional[dict]:
    code = safe_str(code).strip()
    d = _tg_admin_state.get("pending", {}).get(code)
    if not d:
        return None
    if int(d.get("expires") or 0) < now_ts():
        try:
            del _tg_admin_state["pending"][code]
        except Exception:
            pass
        return None
    try:
        del _tg_admin_state["pending"][code]
    except Exception:
        pass
    return d

def _run_db_backup_now() -> str:
    # returns path or ""
    try:
        db_path = DB_PATH
        if not db_path:
            return ""
        src = os.path.abspath(db_path)
        if not os.path.exists(src):
            return ""
        bdir = os.path.join(os.path.dirname(src), "backups")
        os.makedirs(bdir, exist_ok=True)
        ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        dst = os.path.join(bdir, f"data_{ts}.db")
        shutil.copy2(src, dst)
        return dst
    except Exception:
        return ""

def _backup_scheduler_loop():
    # daily backup at 04:05 server local time
    while True:
        try:
            now = datetime.now()
            target = now.replace(hour=4, minute=5, second=0, microsecond=0)
            if target <= now:
                target = target + timedelta(days=1)
            sleep_s = int((target - now).total_seconds())
            time.sleep(max(30, sleep_s))
            _ = _run_db_backup_now()
        except Exception:
            time.sleep(60)

def _tg_handle_admin_command(text: str) -> None:
    t = safe_str(text).strip()
    if not t:
        return

    # HELP
    # HELP
    if t.startswith("/help") or t == "/start":
        tg_admin_send(
            f"{E_BOT} Admin Komutları\n"
            f"{E_PIN} /pin 123456\n"
            f"{E_STOP} /panic on  ,  /panic off\n"
            f"{E_TAB} /ipban 1.2.3.4\n"
            f"{E_SAVE} /backup now\n"
            f"{E_X} /logout\n"
            f"{E_OK} Onay: /confirm 123456   Iptal: /cancel 123456"
        )
        return

        return

    # PIN
    if t.startswith("/pin"):
        parts = t.split()
        pin = parts[1] if len(parts) >= 2 else ""
        if not TG_ADMIN_PIN or len(TG_ADMIN_PIN) != 6:
            tg_admin_send(f"{E_X} TELEGRAM_ADMIN_PIN ayarlı değil")
            return
        if safe_str(pin).strip() == TG_ADMIN_PIN:
            tg_admin_set_authed()
            tg_admin_send(f"{E_OK} PIN doğru. Yetki aktif ({TG_ADMIN_AUTH_TTL} sn)")
        else:
            tg_admin_send(f"{E_X} PIN hatalı")
        return

    if t.startswith("/logout"):
        tg_admin_clear_auth()
        tg_admin_send(f"{E_OK} Çıkış yapıldı")
        return

    if t.startswith("/confirm") or t.startswith("/cancel"):
        parts = t.split()
        code = parts[1] if len(parts) >= 2 else ""
        if t.startswith("/cancel"):
            try:
                if code and code in _tg_admin_state.get("pending", {}):
                    del _tg_admin_state["pending"][code]
                    tg_admin_send(f"{E_OK} İptal edildi")
                else:
                    tg_admin_send(f"{E_X} Kod bulunamadı")
            except Exception:
                tg_admin_send(f"{E_X} Kod bulunamadı")
            return

        # confirm
        if not tg_admin_authed():
            tg_admin_send(f"{E_X} Önce /pin gir")
            return
        d = tg_admin_pop_confirm(code)
        if not d:
            tg_admin_send(f"{E_X} Kod yok veya süresi doldu")
            return
        cmd = safe_str(d.get("cmd"))
        args = safe_str(d.get("args"))
        tg_admin_send(f"{E_OK} Onaylandı: {cmd} {args}".strip())
        # execute
        try:
            if cmd == "panic":
                if args.lower().strip() == "on":
                    set_admin_flag("panic", "1")
                    tg_admin_send(f"{E_STOP} PANIC aktif")
                else:
                    set_admin_flag("panic", "0")
                    tg_admin_send(f"{E_OK} PANIC kapandı")
            elif cmd == "ipban":
                ip = args.strip()
                try:
                    ipaddress.ip_address(ip)
                except Exception:
                    tg_admin_send(f"{E_X} IP format hatalı")
                    return
                ban_ip(ip, 24*3600, "manual")
                tg_admin_send(f"{E_OK} IP ban eklendi: {ip}")
            elif cmd == "backup":
                path = _run_db_backup_now()
                if path:
                    tg_admin_send(f"{E_OK} Backup hazır: {path}")
                else:
                    tg_admin_send(f"{E_X} Backup alınamadı")
            else:
                tg_admin_send(f"{E_X} Bilinmeyen komut")
        except Exception:
            tg_admin_send(f"{E_X} İşlem hatası")
        return

    # other commands require auth and DM match
    if not tg_admin_authed():
        tg_admin_send(f"{E_X} Önce /pin gir")
        return

    # /panic on|off
    if t.startswith("/panic"):
        parts = t.split()
        mode = (parts[1] if len(parts) >= 2 else "").strip().lower()
        if mode not in ("on", "off"):
            tg_admin_send(f"{E_X} Kullanım: /panic on  veya  /panic off")
            return
        code = tg_admin_queue_confirm("panic", mode)
        tg_admin_send(f"{E_WARN} Onay gerekiyor ({TG_ADMIN_CONFIRM_TTL} sn)\n{E_OK} /confirm {code}\n{E_X} /cancel {code}")
        return

    # /ipban 1.2.3.4
    if t.startswith("/ipban"):
        parts = t.split()
        ip = parts[1] if len(parts) >= 2 else ""
        if not ip:
            tg_admin_send(f"{E_X} Kullanım: /ipban 1.2.3.4")
            return
        code = tg_admin_queue_confirm("ipban", ip)
        tg_admin_send(f"{E_WARN} Onay gerekiyor ({TG_ADMIN_CONFIRM_TTL} sn)\n{E_OK} /confirm {code}\n{E_X} /cancel {code}")
        return

    # /backup now
    if t.startswith("/backup"):
        parts = t.split()
        sub = parts[1] if len(parts) >= 2 else ""
        if sub != "now":
            tg_admin_send(f"{E_X} Kullanım: /backup now")
            return
        code = tg_admin_queue_confirm("backup", "now")
        tg_admin_send(f"{E_WARN} Onay gerekiyor ({TG_ADMIN_CONFIRM_TTL} sn)\n{E_OK} /confirm {code}\n{E_X} /cancel {code}")
        return


    # unknown command
    tg_admin_send(f"{E_X} Bilinmeyen komut. /help")
    return

def _tg_poll_loop():
    if not TELEGRAM_TOKEN:
        return
    if not TG_ADMIN_DM_ID:
        return
    # Not: webhook yok, long-polling. Domain gerektirmez.
    offset = int(_tg_admin_state.get("last_update_id") or 0)
    while True:
        try:
            url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/getUpdates"
            params = {"timeout": 25, "offset": offset + 1, "allowed_updates": json.dumps(["message"])}
            r = requests.get(url, params=params, timeout=40)
            j = r.json() if r.ok else {}
            if not (j.get("ok") is True):
                time.sleep(3)
                continue
            for upd in (j.get("result") or []):
                try:
                    uid = int(upd.get("update_id") or 0)
                    if uid > offset:
                        offset = uid
                    # DM only + admin chat only
                    if not _tg_is_private_chat(upd):
                        continue
                    if _tg_chat_id(upd) != TG_ADMIN_DM_ID:
                        continue
                    msg = _tg_text(upd)
                    _tg_handle_admin_command(msg)
                except Exception:
                    continue
            _tg_admin_state["last_update_id"] = offset
        except Exception:
            time.sleep(5)



# -------------------------
# Admin: Contracts (Sözleşmeler)
# -------------------------
@app.get("/admin/contracts")
def admin_contracts():
    rr = require_admin()
    if rr:
        return rr

    rows = []
    try:
        conn = db()
        try:
            rows = conn.execute(
                "SELECT id, username, tc, ip, accepted_at FROM contracts ORDER BY id DESC"
            ).fetchall()

        finally:
            conn.close()
    except Exception:
        rows = []

    trs = ""
    if rows:
        for r in rows:
            if r and not isinstance(r, dict):
                r = dict(r)
            cid = int(r.get("id") or 0)
            uname = safe_str(r.get("username"))
            fn = safe_str(r.get("full_name"))
            tc = safe_str(r.get("tc"))
            ip = safe_str(r.get("ip"))
            dt = fmt_ts(int(r.get("accepted_at") or 0)) if int(r.get("accepted_at") or 0) else '<span class="muted">—</span>'
            tc_cell = tc if tc else '<span class="muted">—</span>'

            trs += f"""
<tr class="tr">
  <td><b>{uname}</b><div class="muted small">{fn if fn else '—'}</div></td>
  <td>{tc_cell}</td>
  <td>{dt}</td>
  <td class="muted small" style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{ip if ip else '—'}</td>
  <td style="padding:12px 14px;">
  <div style="display:flex; gap:10px; align-items:center; justify-content:flex-end; flex-wrap:nowrap;">
    <a class="btn secondary" style="min-width:140px; text-align:center;"
       href="/admin/contracts/{cid}/download">{E_NOTE} Download</a>

    <form method="post" action="/admin/contracts/{cid}/delete"
          style="display:inline; margin:0;"
          onsubmit="return confirm('Silinsin mi?')">
      <button class="btn danger" style="min-width:110px;" type="submit">{E_X} Sil</button>
    </form>
  </div>
</td>

</tr>
"""
    else:
        trs = f"""
<tr class="tr">
  <td colspan="5"><span class="muted">Kayıt yok</span></td>
</tr>
"""

    total = len(rows) if rows else 0
    body = f"""
<div class="card">
  <div class="card-h" style="display:flex;align-items:center;justify-content:space-between;gap:10px">
    <div style="display:flex;align-items:center;gap:10px">{E_NOTE} <b>SÖZLEŞMELER</b></div>
    <div class="muted small">Toplam: <b>{total}</b></div>
  </div>
  <div class="muted" style="margin-top:6px">Kullanıcı onay kayıtları • PDF indir • Sil</div>

  <div style="margin-top:14px;overflow:auto">
    <table class="tbl">
      <thead>
        <tr>
          <th style="min-width:180px">Kullanıcı</th>
          <th style="min-width:110px">Kimlik No</th>
          <th style="min-width:170px">Kabul Tarihi</th>
          <th style="min-width:160px">IP</th>
          <th style="min-width:180px">İşlem</th>
        </tr>
      </thead>
      <tbody>
        {trs}
      </tbody>
    </table>
  </div>
</div>
"""
    return base_html("Admin • Sözleşmeler", body, nav_html(True))

@app.get("/admin/contracts/<int:cid>/download")
def admin_contract_download(cid: int):
    rr = require_admin()
    if rr:
        return rr

    row = None
    try:
        conn = db()
        try:
            row = conn.execute("SELECT * FROM contracts WHERE id=? LIMIT 1", (cid,)).fetchone()
        finally:
            conn.close()
    except Exception:
        row = None

    if not row:
        return ("Not found", 404)

    if row and not isinstance(row, dict):
        row = dict(row)

    pdf_bytes = _contract_pdf_bytes(row)
    uname = safe_str(row.get("username") or "user")
    ts = int(row.get("accepted_at") or 0)
    stamp = datetime.fromtimestamp(ts, tz=timezone.utc).astimezone(
        timezone(timedelta(hours=3))
    ).strftime("%Y%m%d_%H%M%S") if ts else "na"
    fn = f"sozlesme_{uname}_{stamp}_{cid}.pdf"
    return _send_bytes(pdf_bytes, fn, "application/pdf")


@app.post("/admin/contracts/<int:cid>/delete")
def admin_contract_delete(cid: int):
    rr = require_admin()
    if rr:
        return rr

    try:
        conn = db()
        try:
            conn.execute("DELETE FROM contracts WHERE id=?", (cid,))
            conn.commit()
        finally:
            conn.close()
    except Exception:
        pass

    return redirect("/admin/contracts")
print("TELEGRAM ENV CHECK",
      bool(os.getenv("TELEGRAM_BOT_TOKEN")),
      os.getenv("TELEGRAM_ADMIN_DM_ID"))


if __name__ == "__main__":
    try:
        _db_init_security()
    except Exception:
        pass

    # Background jobs (non-blocking)
    try:
        threading.Thread(target=_backup_scheduler_loop, daemon=True).start()
    except Exception:
        pass
    try:
        threading.Thread(target=_tg_poll_loop, daemon=True).start()
    except Exception:
        pass

    app.run(host=HOST, port=PORT, debug=False)
