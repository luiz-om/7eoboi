import unittest

from api.pdf_parser import parse_prova_header_from_text


class ProvaHeaderParserTests(unittest.TestCase):
    def test_parse_header_from_pdf_text(self) -> None:
        texto = """
        Evento 3ª COPA APA MS DE RANCH SORTING - 5ª ETAPA
        Data 2026-06-06 Hora 15:00:00
        Endereço JCR RANCH
        Cidade CAMPO GRANDE - MS
        Categoria 3ª COPA APA - TIRA BOI Etapa CLASSIFICATÓRIA
        Passada Competidor Competidor
        """

        prova = parse_prova_header_from_text(texto)

        self.assertEqual(prova["nome"], "3ª COPA APA MS DE RANCH SORTING - 5ª ETAPA")
        self.assertEqual(prova["data"], "2026-06-06")
        self.assertEqual(prova["local"], "JCR RANCH - CAMPO GRANDE - MS")
        self.assertIn("Categoria: 3ª COPA APA - TIRA BOI", prova["observacoes"])
        self.assertIn("Etapa: CLASSIFICATÓRIA", prova["observacoes"])
        self.assertIn("Hora: 15:00:00", prova["observacoes"])


if __name__ == "__main__":
    unittest.main()
