"""Make the supplied resume public-safe. Requires pypdf (only for this maintenance task).

Usage: python scripts/prepare_cv.py [source.pdf]
The original stays untouched and is excluded from Git. Phone glyphs are removed
from the PDF content stream, retaining their advance widths to preserve layout.
"""
from pathlib import Path
import re
import sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, ContentStream, FloatObject, NameObject

source = Path(sys.argv[1] if len(sys.argv) > 1 else "Jian_s_Resume.pdf")
destination = Path("assets/cv/jian-yong-zheng-wu-cv.pdf")
reader = PdfReader(source)
writer = PdfWriter()
removed = 0
phone_pattern = re.compile(r"\(?\+?506\)?\s*\d{4}[-\s]*\d{4}")

for original_page in reader.pages:
    page = writer.add_page(original_page)
    stream = ContentStream(page.get_contents(), writer)
    current_font = None
    separator_pending = False
    for operands, operator in stream.operations:
        if operator == b"Tf":
            current_font = page["/Resources"]["/Font"][operands[0]].get_object()
        if operator != b"TJ":
            continue
        parts = operands[0]
        text = "".join(part if isinstance(part, str) else " " for part in parts)
        is_phone = bool(phone_pattern.search(text))
        is_separator = separator_pending and text.strip() == "j"  # Encoded vertical separator in supplied PDF.
        if is_phone or is_separator:
            widths = current_font["/Widths"]
            first = int(current_font["/FirstChar"])
            replacement = ArrayObject()
            for part in parts:
                if isinstance(part, str):
                    replacement.append(FloatObject(-sum(float(widths[char - first]) for char in part.original_bytes)))
                else:
                    replacement.append(part)
            operands[0] = replacement
            if is_phone:
                removed += 1
            separator_pending = is_phone
        elif text.strip():
            separator_pending = False
    page.replace_contents(stream)
    if "/Annots" in page:
        page[NameObject("/Annots")] = ArrayObject(annotation for annotation in page["/Annots"] if not str(annotation.get_object().get("/A", {}).get("/URI", "")).lower().startswith("tel:"))

if removed != 1:
    raise RuntimeError("Expected exactly one phone text run; inspect the new PDF before publishing.")
writer.add_metadata({"/Title": "Jian Yong Zheng Wu — Resume", "/Author": "Jian Yong Zheng Wu"})
destination.parent.mkdir(parents=True, exist_ok=True)
writer.write(destination)
public_text = "\n".join(page.extract_text() for page in PdfReader(destination).pages)
if phone_pattern.search(public_text):
    destination.unlink()
    raise RuntimeError("Phone information remains in extracted text.")
if "jianyongzheng490@gmail.com" not in public_text.replace(" ", ""):
    raise RuntimeError("Email address missing after redaction.")
print(f"Created {destination}; phone removed from text, original unchanged.")
