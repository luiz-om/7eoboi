import unittest

from api.import_service import is_pdf_bytes, is_pdf_upload, import_pdf_bytes


class ImportServiceTests(unittest.TestCase):
    def test_is_pdf_bytes_detects_pdf_signature(self) -> None:
        self.assertTrue(is_pdf_bytes(b"%PDF-1.7\n"))
        self.assertFalse(is_pdf_bytes(b"not a pdf"))

    def test_is_pdf_upload_accepts_any_filename_when_bytes_are_pdf(self) -> None:
        self.assertTrue(is_pdf_upload("lista qualquer.txt", "", b"%PDF-1.7"))
        self.assertTrue(is_pdf_upload("relatorio final", "application/octet-stream", b"%PDF-1.7"))

    def test_is_pdf_upload_accepts_pdf_extension(self) -> None:
        self.assertTrue(is_pdf_upload("minha prova.PDF", "", b""))

    def test_import_pdf_bytes_rejects_non_pdf(self) -> None:
        with self.assertRaises(Exception):
            import_pdf_bytes(b"conteudo invalido", filename="teste.txt", content_type="text/plain")


if __name__ == "__main__":
    unittest.main()
