const Product = require('../models/relatorioModel');
const PdfPrinter = require("pdfmake");
const path = require("path");

// EXIBIR TODOS OS PRODUTOS
exports.getAllProducts = (req, res) => {
  Product.getAllProducts((products) => {
    if (!Array.isArray(products)) {
      console.error('Erro: O retorno de getAllProducts não é um array.');
      return res.status(500).send('Erro ao buscar produtos.');
    }
    res.render('relatorio', { products });
  });
};

// Função para gerar o PDF
async function gerarPDF(products) {
  const fonts = {
    Roboto: {
      normal: path.join(__dirname, '..', 'fonts', 'Roboto-Regular.ttf'),
      bold: path.join(__dirname, '..', 'fonts', 'Roboto-Bold.ttf'),
      italics: path.join(__dirname, '..', 'fonts', 'Roboto-Italic.ttf'),
      bolditalics: path.join(__dirname, '..', 'fonts', 'Roboto-BoldItalic.ttf'),
    },
  };

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      { text: 'Relatório de Produtos', style: 'header' },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', '*', '*', '*', '*', '*'],
          body: [
            ['ID', 'Nome', 'Descrição', 'Fornecedor', 'Marca', 'Preço Compra', 'Preço Venda', 'Estoque'],
            ...products.map(product => [
              product.ID,
              product.nome,
              product.descricao,
              product.fornecedor,
              product.marca,
              product.precocompra,
              product.precovenda,
              product.estoque
            ])
          ]
        }
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      }
    }
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  const chunks = [];

  return new Promise((resolve, reject) => {
    pdfDoc.on('data', chunk => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}

// GERAR RELATÓRIO EM PDF
exports.generatePDF = async (req, res) => {
  try {
    const products = await Product.getAllProductsToPDF();
    if (!Array.isArray(products)) {
      console.error('Erro: O retorno de getAllProductsToPDF não é um array.');
      return res.status(500).send('Erro ao buscar produtos para o PDF.');
    }

    const pdfBuffer = await gerarPDF(products);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=relatorio.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    res.status(500).send("Erro ao gerar o PDF.");
  }
};
