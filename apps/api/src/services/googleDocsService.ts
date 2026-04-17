import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/documents"];

export class GoogleDocsService {
  private static auth: any;

  private static getAuth() {
    if (this.auth) return this.auth;
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || "{}");
    this.auth = google.auth.fromJSON(credentials);
    this.auth.scopes = SCOPES;
    return this.auth;
  }

  /**
   * Substitui variáveis no formato {{ VAR }} por valores reais.
   * @param documentId ID do documento no Google Docs
   * @param replacements Objeto com chave sendo o nome da variável e valor o texto substituto
   */
  static async replaceVariables(
    documentId: string,
    replacements: Record<string, string>,
  ) {
    const auth = this.getAuth();
    const docs = google.docs({ version: "v1", auth });

    // Separa variáveis que contêm \n (precisam de tratamento especial)
    const simpleReplacements: Record<string, string> = {};
    const multilineReplacements: Record<string, string> = {};

    for (const [key, value] of Object.entries(replacements)) {
      if (value && value.includes('\n')) {
        multilineReplacements[key] = value;
      } else {
        simpleReplacements[key] = value;
      }
    }

    // 1. Substituições simples (sem quebra de linha) via replaceAllText
    const requests = Object.entries(simpleReplacements).flatMap(([key, value]) => [
      {
        replaceAllText: {
          containsText: {
            text: `{{${key}}}`,
            matchCase: true,
          },
          replaceText: value || "",
        },
      },
      {
        replaceAllText: {
          containsText: {
            text: `{{ ${key} }}`,
            matchCase: true,
          },
          replaceText: value || "",
        },
      },
    ]);

    if (requests.length > 0) {
      try {
        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests },
        });
      } catch (error) {
        console.error("Error replacing simple variables in Google Doc:", error);
        throw error;
      }
    }

    // 2. Substituições multiline (com \n) — precisa de find + delete + insert
    for (const [key, value] of Object.entries(multilineReplacements)) {
      try {
        await this.replaceWithMultilineText(docs, documentId, key, value);
      } catch (error) {
        console.error(`Error replacing multiline variable {{${key}}}:`, error);
        throw error;
      }
    }
  }

  /**
   * Substitui um placeholder por texto com quebras de linha.
   * O replaceAllText do Google Docs não suporta \n, então é preciso:
   * 1. Ler o documento para encontrar a posição do placeholder (pode estar em tabelas)
   * 2. Deletar o placeholder
   * 3. Inserir o texto novo (com \n) na posição
   */
  private static async replaceWithMultilineText(
    docs: any,
    documentId: string,
    key: string,
    value: string,
  ) {
    const placeholders = [`{{${key}}}`, `{{ ${key} }}`];

    for (const placeholder of placeholders) {
      const doc = await docs.documents.get({ documentId });
      const body = doc.data.body?.content;
      if (!body) continue;

      const startIndex = this.findPlaceholderIndex(body, placeholder);

      if (startIndex < 0) continue;

      const endIndex = startIndex + placeholder.length;

      // Delete o placeholder e insere o texto novo
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [
            {
              deleteContentRange: {
                range: { startIndex, endIndex },
              },
            },
            {
              insertText: {
                location: { index: startIndex },
                text: value,
              },
            },
          ],
        },
      });

      return;
    }
  }

  /**
   * Remove pares de parágrafos consecutivos cujo texto (após trim) é exatamente
   * "NOME:" seguido por "CPF:".
   *
   * Usado quando um coord cria contrato: o template Impulse tem literais
   * "NOME: {{NOME-VENDEDOR}}" e "CPF: {{CPF-VENDEDOR}}" — quando o placeholder
   * fica vazio, os rótulos "NOME:" e "CPF:" permanecem como linhas órfãs.
   */
  static async removeEmptyWitnessLabelPairs(documentId: string) {
    const auth = this.getAuth();
    const docs = google.docs({ version: "v1", auth });
    const doc = await docs.documents.get({ documentId });
    const body = doc.data.body?.content || [];

    const ranges: { startIndex: number; endIndex: number }[] = [];
    this.collectEmptyLabelRanges(body, ranges);

    if (ranges.length === 0) return;

    // Ordena em ordem decrescente para que deletes posteriores não invalidem índices anteriores
    ranges.sort((a, b) => b.startIndex - a.startIndex);

    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: ranges.map((range) => ({ deleteContentRange: { range } })),
      },
    });
  }

  private static paragraphText(paragraph: any): string {
    return (paragraph?.elements || [])
      .map((e: any) => e.textRun?.content || "")
      .join("");
  }

  private static collectEmptyLabelRanges(
    content: any[],
    out: { startIndex: number; endIndex: number }[],
  ) {
    for (let i = 0; i < content.length; i++) {
      const el = content[i];

      if (el.paragraph && i + 1 < content.length && content[i + 1].paragraph) {
        const t1 = this.paragraphText(el.paragraph).trim();
        const t2 = this.paragraphText(content[i + 1].paragraph).trim();
        if (t1 === "NOME:" && t2 === "CPF:") {
          let lastIdx = i + 1;
          // Consome UM parágrafo em branco imediatamente após o par, caso exista
          // (evita deixar "\n\n" entre o título TESTEMUNHA e o próximo bloco)
          const next = content[lastIdx + 1];
          if (next?.paragraph && this.paragraphText(next.paragraph).trim() === "") {
            lastIdx += 1;
          }
          out.push({
            startIndex: el.startIndex,
            endIndex: content[lastIdx].endIndex,
          });
          i = lastIdx; // Pula para depois do último consumido
          continue;
        }
      }

      if (el.table?.tableRows) {
        for (const row of el.table.tableRows) {
          for (const cell of row.tableCells || []) {
            if (cell.content) this.collectEmptyLabelRanges(cell.content, out);
          }
        }
      }

      if (el.tableOfContents?.content) {
        this.collectEmptyLabelRanges(el.tableOfContents.content, out);
      }
    }
  }

  /**
   * Busca recursivamente o índice de início de um placeholder no conteúdo do documento.
   * Suporta Parágrafos e Tabelas (Células).
   */
  private static findPlaceholderIndex(content: any[], placeholder: string): number {
    for (const element of content) {
      // Caso 1: Texto em Parágrafos comuns
      if (element.paragraph?.elements) {
        for (const el of element.paragraph.elements) {
          const text = el.textRun?.content;
          if (text && text.includes(placeholder)) {
            const offset = text.indexOf(placeholder);
            return el.startIndex + offset;
          }
        }
      }
      
      // Caso 2: Texto dentro de Tabelas
      if (element.table?.tableRows) {
        for (const row of element.table.tableRows) {
          if (row.tableCells) {
            for (const cell of row.tableCells) {
              if (cell.content) {
                const index = this.findPlaceholderIndex(cell.content, placeholder);
                if (index >= 0) return index;
              }
            }
          }
        }
      }

      // Caso 3: Table of Contents (opcional, mas bom ter)
      if (element.tableOfContents?.content) {
        const index = this.findPlaceholderIndex(element.tableOfContents.content, placeholder);
        if (index >= 0) return index;
      }
    }
    return -1;
  }
}
