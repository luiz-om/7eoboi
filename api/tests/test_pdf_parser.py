import unittest

from api.pdf_parser import (
    append_fragment,
    append_name,
    normalize_name,
    parse_competidores_texto_from_lines,
    parse_table_rows,
)


class PdfParserTests(unittest.TestCase):
    def test_passada_1_extracts_both_competitors(self) -> None:
        table = [
            ["Passada", "Competidor", "Competidor", "Nº Sort.", "Tempo"],
            ["1", "MAURICJO BENITES", "HILARIO ALVES JUNIOR", "", ""],
        ]

        duplas = parse_table_rows(table)

        self.assertEqual(len(duplas), 1)
        self.assertEqual(duplas[0]["passada"], 1)
        self.assertEqual(duplas[0]["competitor1Name"], "MAURICJO BENITES")
        self.assertEqual(duplas[0]["competitor2Name"], "HILARIO ALVES JUNIOR")

    def test_passada_2_joins_line_break_inside_competitor2(self) -> None:
        table = [
            ["Passada", "Competidor", "Competidor", "Nº Sort.", "Tempo"],
            ["2", "MARCELO DE MACEDO MONTEIRO", "MONICA MARIA DE SOUZA\nCARNEIRO", "", ""],
        ]

        duplas = parse_table_rows(table)

        self.assertEqual(len(duplas), 1)
        self.assertEqual(duplas[0]["passada"], 2)
        self.assertEqual(duplas[0]["competitor1Name"], "MARCELO DE MACEDO MONTEIRO")
        self.assertEqual(duplas[0]["competitor2Name"], "MONICA MARIA DE SOUZA CARNEIRO")

    def test_continuation_row_appends_to_correct_column(self) -> None:
        table = [
            ["Passada", "Competidor", "Competidor"],
            ["2", "MARCELO DE MACEDO MONTEIRO", "MONICA MARIA DE SOUZA"],
            ["", "", "CARNEIRO"],
        ]

        duplas = parse_table_rows(table)

        self.assertEqual(len(duplas), 1)
        self.assertEqual(duplas[0]["competitor2Name"], "MONICA MARIA DE SOUZA CARNEIRO")

    def test_line_breaks_inside_competitor2_from_tabbed_text(self) -> None:
        linhas = [
            "Passada\tCompetidor\tCompetidor",
            "2\tGUSTAVO HENRIQUE DE ARRUDA\tMONICA MARIA DE SOUZA",
            "\t\tCARNEIRO",
        ]

        duplas = parse_competidores_texto_from_lines(linhas)

        self.assertEqual(len(duplas), 1)
        self.assertEqual(duplas[0]["competitor1Name"], "GUSTAVO HENRIQUE DE ARRUDA")
        self.assertEqual(duplas[0]["competitor2Name"], "MONICA MARIA DE SOUZA CARNEIRO")

    def test_append_fragment_joins_parts(self) -> None:
        self.assertEqual(
            append_fragment("MONICA MARIA DE SOUZA", "CARNEIRO"),
            "MONICA MARIA DE SOUZA CARNEIRO",
        )

    def test_normalize_name_removes_internal_newlines(self) -> None:
        self.assertEqual(
            normalize_name("MONICA MARIA DE SOUZA\nCARNEIRO"),
            "MONICA MARIA DE SOUZA CARNEIRO",
        )


if __name__ == "__main__":
    unittest.main()
