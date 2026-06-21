"""Extrai duplas (passada + 2 competidores) de PDFs de lista de passadas."""

from __future__ import annotations

import io
import re
from dataclasses import dataclass

import pdfplumber

HEADER_NOISE = re.compile(
    r"^(page\s*\d+|categoria|etapa|n[oº]?\s*sort|tempo|passada|competidor|cavaleiro|"
    r"hora|classific|data|tira boi|3ª copa|copa apa|resultado|obs)",
    re.IGNORECASE,
)


@dataclass
class ColumnLayout:
    pass_index: int
    comp1_index: int
    comp2_index: int


@dataclass
class RowDraft:
    passada: int | None = None
    competitor1: str = ""
    competitor2: str = ""


@dataclass
class PdfWord:
    text: str
    x0: float
    x1: float
    top: float


@dataclass
class ColumnBoundaries:
    pass_max: float
    comp1_max: float
    comp2_max: float


def normalize_cell(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("\n", " ")).strip()


def normalize_name(value: object) -> str:
    return normalize_cell(value)


def looks_like_passada(value: object) -> bool:
    text = normalize_cell(value)
    return bool(text) and text.isdigit()


def looks_like_name(value: object) -> bool:
    text = normalize_name(value)
    if len(text) < 3:
        return False
    if text.isdigit():
        return False
    if HEADER_NOISE.match(text):
        return False
    if not re.search(r"[A-Za-zÀ-ÿ]", text):
        return False
    return True


def append_name(current: str, fragment: str) -> str:
    left = normalize_name(current)
    right = normalize_name(fragment)
    if not right:
        return left
    if not left:
        return right
    return f"{left} {right}"


def dedupe_duplas(duplas: list[dict]) -> list[dict]:
    seen: set[str] = set()
    result: list[dict] = []
    for item in sorted(duplas, key=lambda row: row["passada"]):
        key = (
            f"{item['passada']}|"
            f"{item['competitor1Name'].lower()}|"
            f"{item['competitor2Name'].lower()}"
        )
        if key in seen:
            continue
        seen.add(key)
        result.append(item)
    return result


def finalize_row(draft: RowDraft | None) -> dict | None:
    if not draft or draft.passada is None:
        return None
    comp1 = normalize_name(draft.competitor1)
    comp2 = normalize_name(draft.competitor2)
    if not looks_like_name(comp1) or not looks_like_name(comp2):
        return None
    return {
        "passada": draft.passada,
        "competitor1Name": comp1,
        "competitor2Name": comp2,
    }


def find_column_layout(header_row: list[object]) -> ColumnLayout | None:
    cells = [normalize_cell(cell) for cell in header_row]
    pass_index = next(
        (index for index, cell in enumerate(cells) if re.search(r"passada", cell, re.IGNORECASE)),
        -1,
    )
    competitor_indexes = [
        index
        for index, cell in enumerate(cells)
        if re.search(r"competidor|cavaleiro", cell, re.IGNORECASE)
    ]
    if pass_index < 0 or len(competitor_indexes) < 2:
        return None
    return ColumnLayout(
        pass_index=pass_index,
        comp1_index=competitor_indexes[0],
        comp2_index=competitor_indexes[1],
    )


def cell_value(row: list[object], index: int) -> str:
    if index < 0 or index >= len(row):
        return ""
    return normalize_name(row[index])


def parse_table_rows(table: list[list[object | None]]) -> list[dict]:
    if not table:
        return []

    header_index = -1
    layout: ColumnLayout | None = None
    for index, row in enumerate(table):
        maybe_layout = find_column_layout(row or [])
        if maybe_layout:
            header_index = index
            layout = maybe_layout
            break

    if header_index < 0 or not layout:
        return []

    duplas: list[dict] = []
    current = RowDraft()

    for row in table[header_index + 1 :]:
        if not row:
            continue

        passada_text = cell_value(row, layout.pass_index)
        comp1_text = cell_value(row, layout.comp1_index)
        comp2_text = cell_value(row, layout.comp2_index)

        if looks_like_passada(passada_text):
            finalized = finalize_row(current)
            if finalized:
                duplas.append(finalized)
            current = RowDraft(
                passada=int(passada_text),
                competitor1=comp1_text,
                competitor2=comp2_text,
            )
            continue

        if current.passada is None:
            continue

        if comp1_text:
            current.competitor1 = append_name(current.competitor1, comp1_text)
        if comp2_text:
            current.competitor2 = append_name(current.competitor2, comp2_text)

    finalized = finalize_row(current)
    if finalized:
        duplas.append(finalized)

    return duplas


def group_words_into_lines(words: list[dict], tolerance: float = 4.0) -> list[list[PdfWord]]:
    parsed_words = [
        PdfWord(
            text=normalize_cell(word.get("text")),
            x0=float(word.get("x0", 0)),
            x1=float(word.get("x1", word.get("x0", 0))),
            top=float(word.get("top", 0)),
        )
        for word in words
        if normalize_cell(word.get("text"))
    ]

    lines: list[list[PdfWord]] = []
    for word in sorted(parsed_words, key=lambda item: (-item.top, item.x0)):
        target = next((line for line in lines if abs(line[0].top - word.top) <= tolerance), None)
        if target is None:
            lines.append([word])
        else:
            target.append(word)

    for line in lines:
        line.sort(key=lambda item: item.x0)
    return sorted(lines, key=lambda line: -line[0].top)


def detect_column_boundaries(header_line: list[PdfWord]) -> ColumnBoundaries | None:
    pass_header = next((word for word in header_line if re.search(r"passada", word.text, re.IGNORECASE)), None)
    competitor_headers = [
        word for word in header_line if re.search(r"competidor|cavaleiro", word.text, re.IGNORECASE)
    ]
    if not pass_header or len(competitor_headers) < 2:
        return None

    comp1_header = competitor_headers[0]
    comp2_header = competitor_headers[1]
    next_headers = [
        word
        for word in header_line
        if word.x0 > comp2_header.x0 and not re.search(r"competidor|cavaleiro|passada", word.text, re.IGNORECASE)
    ]
    next_header = next_headers[0] if next_headers else None

    pass_max = (pass_header.x1 + comp1_header.x0) / 2
    comp1_max = (comp1_header.x1 + comp2_header.x0) / 2
    comp2_max = ((comp2_header.x1 + next_header.x0) / 2) if next_header else comp2_header.x1 + 500

    return ColumnBoundaries(pass_max=pass_max, comp1_max=comp1_max, comp2_max=comp2_max)


def assign_word_to_column(word: PdfWord, boundaries: ColumnBoundaries) -> str:
    center = (word.x0 + word.x1) / 2
    if center <= boundaries.pass_max:
        return "passada"
    if center <= boundaries.comp1_max:
        return "comp1"
    if center <= boundaries.comp2_max:
        return "comp2"
    return "other"


def parse_lines_by_columns(lines: list[list[PdfWord]]) -> list[dict]:
    header_index = -1
    boundaries: ColumnBoundaries | None = None

    for index, line in enumerate(lines):
        text = " ".join(word.text for word in line)
        if re.search(r"passada", text, re.IGNORECASE) and sum(
            1 for word in line if re.search(r"competidor|cavaleiro", word.text, re.IGNORECASE)
        ) >= 2:
            header_index = index
            boundaries = detect_column_boundaries(line)
            break

    if header_index < 0 or not boundaries:
        return []

    duplas: list[dict] = []
    current = RowDraft()

    for line in lines[header_index + 1 :]:
        line_text = " ".join(word.text for word in line)
        if not line_text or HEADER_NOISE.match(line_text):
            continue

        buckets: dict[str, list[str]] = {
            "passada": [],
            "comp1": [],
            "comp2": [],
        }
        for word in line:
            column = assign_word_to_column(word, boundaries)
            if column in buckets:
                buckets[column].append(word.text)

        passada_text = normalize_cell(" ".join(buckets["passada"]))
        comp1_text = normalize_cell(" ".join(buckets["comp1"]))
        comp2_text = normalize_cell(" ".join(buckets["comp2"]))

        if looks_like_passada(passada_text):
            finalized = finalize_row(current)
            if finalized:
                duplas.append(finalized)
            current = RowDraft(
                passada=int(passada_text),
                competitor1=comp1_text,
                competitor2=comp2_text,
            )
            continue

        if current.passada is None:
            continue

        if comp1_text:
            current.competitor1 = append_name(current.competitor1, comp1_text)
        if comp2_text:
            current.competitor2 = append_name(current.competitor2, comp2_text)

    finalized = finalize_row(current)
    if finalized:
        duplas.append(finalized)

    return duplas


def parse_prova_header_from_text(text: str) -> dict:
    lines = [normalize_cell(line) for line in text.splitlines() if normalize_cell(line)]
    raw_text = normalize_cell(text.replace("\n", " "))
    fields: dict[str, str] = {}

    for line in lines:
        match = re.match(r"^evento\s*:?\s*(.+)$", line, re.IGNORECASE)
        if match and not fields.get("evento"):
            fields["evento"] = normalize_cell(match.group(1))
            continue

        match = re.match(r"^endere(?:c|ç)o\s*:?\s*(.+)$", line, re.IGNORECASE)
        if match and not fields.get("endereco"):
            fields["endereco"] = normalize_cell(match.group(1))
            continue

        match = re.match(r"^cidade\s*:?\s*(.+)$", line, re.IGNORECASE)
        if match and not fields.get("cidade"):
            fields["cidade"] = normalize_cell(match.group(1))
            continue

        match = re.match(r"^categoria\s*:?\s*(.+?)\s+etapa\s*:?\s*(.+)$", line, re.IGNORECASE)
        if match:
            if not fields.get("categoria"):
                fields["categoria"] = normalize_cell(match.group(1))
            if not fields.get("etapa"):
                fields["etapa"] = normalize_cell(match.group(2))
            continue

        match = re.match(r"^data\s*:?\s*(\d{4}-\d{2}-\d{2}).*?hora\s*:?\s*([\d:]+)\s*$", line, re.IGNORECASE)
        if match:
            fields["data"] = match.group(1)
            fields["hora"] = match.group(2)
            continue

        combined = re.findall(
            r"(data|hora|categoria|etapa)\s*:?\s*([^:]+?)(?=\s+(?:data|hora|categoria|etapa|passada)\s*:|\s*$)",
            line,
            re.IGNORECASE,
        )
        for label, value in combined:
            key = label.lower()
            cleaned = normalize_cell(value)
            if not cleaned:
                continue
            if key == "data":
                date_match = re.search(r"\d{4}-\d{2}-\d{2}", cleaned)
                fields[key] = date_match.group(0) if date_match else cleaned
            elif not fields.get(key):
                fields[key] = cleaned

    inline_patterns = {
        "data": r"data\s*:?\s*(\d{4}-\d{2}-\d{2})",
        "hora": r"hora\s*:?\s*([\d:]+)",
        "categoria": r"categoria\s*:?\s*(.+?)(?=\s+etapa\s*:|\s+passada\b|$)",
        "etapa": r"etapa\s*:?\s*(.+?)(?=\s+passada\b|$)",
    }

    for key, pattern in inline_patterns.items():
        if fields.get(key):
            continue
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            fields[key] = normalize_cell(match.group(1))

    if not fields.get("evento"):
        match = re.search(r"evento\s*:?\s*(.+?)(?=\s+data\s*:|\s+passada\b|$)", raw_text, re.IGNORECASE)
        if match:
            fields["evento"] = normalize_cell(match.group(1))

    if not fields.get("endereco"):
        match = re.search(r"endere(?:c|ç)o\s*:?\s*(.+?)(?=\s+cidade\s*:|\s+passada\b|$)", raw_text, re.IGNORECASE)
        if match:
            fields["endereco"] = normalize_cell(match.group(1))

    if not fields.get("cidade"):
        match = re.search(r"cidade\s*:?\s*(.+?)(?=\s+categoria\s*:|\s+passada\b|$)", raw_text, re.IGNORECASE)
        if match:
            fields["cidade"] = normalize_cell(match.group(1))

    endereco = fields.get("endereco", "")
    cidade = fields.get("cidade", "")
    local_parts = [part for part in [endereco, cidade] if part]
    local = " - ".join(local_parts) if len(local_parts) > 1 else (local_parts[0] if local_parts else "")

    observacoes_parts = []
    if fields.get("categoria"):
        observacoes_parts.append(f"Categoria: {fields['categoria']}")
    if fields.get("etapa"):
        observacoes_parts.append(f"Etapa: {fields['etapa']}")
    if fields.get("hora"):
        observacoes_parts.append(f"Hora: {fields['hora']}")

    data = fields.get("data", "")
    if data and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", data):
        date_match = re.search(r"\d{4}-\d{2}-\d{2}", data)
        data = date_match.group(0) if date_match else ""

    return {
        "nome": fields.get("evento", ""),
        "local": local,
        "data": data,
        "observacoes": " • ".join(observacoes_parts),
        "evento": fields.get("evento", ""),
        "hora": fields.get("hora", ""),
        "endereco": endereco,
        "cidade": cidade,
        "categoria": fields.get("categoria", ""),
        "etapa": fields.get("etapa", ""),
    }


def parse_duplas_pdf(pdf_bytes: bytes) -> dict:
    warnings: list[str] = []
    duplas: list[dict] = []
    prova: dict = {}

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page_index, page in enumerate(pdf.pages):
            page_text = page.extract_text() or ""
            if page_index == 0 and not prova:
                prova = parse_prova_header_from_text(page_text)

            settings = {
                "vertical_strategy": "lines",
                "horizontal_strategy": "lines",
                "intersection_tolerance": 8,
                "snap_tolerance": 6,
                "join_tolerance": 6,
            }
            tables = page.extract_tables(table_settings=settings) or []
            for table in tables:
                duplas.extend(parse_table_rows(table))

            if not duplas:
                words = page.extract_words(use_text_flow=False, keep_blank_chars=False) or []
                lines = group_words_into_lines(words)
                duplas.extend(parse_lines_by_columns(lines))

    duplas = dedupe_duplas(duplas)

    if not prova.get("nome"):
        warnings.append("Cabeçalho da prova não encontrado no PDF.")

    return {"prova": prova, "duplas": duplas, "warnings": warnings}


# Compatibilidade com testes legados de texto tabulado
def append_fragment(target: str, fragment: str) -> str:
    return append_name(target, fragment)


def nome_parece_incompleto(value: str) -> bool:
    words = normalize_name(value).split()
    if len(words) < 2:
        return True
    return words[-1].upper() in {"DE", "DA", "DO", "DOS", "DAS"}


def split_tab_columns(line: str) -> list[str]:
    return [col.strip() for col in line.split("\t")]


def parse_competidores_texto_from_lines(linhas: list[str]) -> list[dict]:
    table: list[list[str | None]] = []
    for linha in linhas:
        if "\t" in linha:
            table.append(split_tab_columns(linha))
        else:
            table.append(re.split(r" {2,}", linha.strip()))

    duplas = parse_table_rows(table)
    return duplas
