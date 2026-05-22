import io
from pypdf import PdfReader
from docx import Document

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text page-by-page from PDF bytes."""
    pdf_file = io.BytesIO(file_bytes)
    reader = PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text.strip()

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts text paragraph-by-paragraph from Word document bytes."""
    docx_file = io.BytesIO(file_bytes)
    doc = Document(docx_file)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text.strip()

def extract_text(file_bytes: bytes, filename: str) -> str:
    """Detects format and extracts text from resume files."""
    ext = filename.split(".")[-1].lower()
    try:
        if ext == "pdf":
            return extract_text_from_pdf(file_bytes)
        elif ext in ["docx", "doc"]:
            return extract_text_from_docx(file_bytes)
        else:
            # Fallback to raw text decode if possible
            return file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        raise ValueError(f"Failed to parse resume file ({filename}): {str(e)}")
