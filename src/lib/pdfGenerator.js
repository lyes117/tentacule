import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = (invoice, companyDetails, client) => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(20);
  doc.text('FACTURE', doc.internal.pageSize.width / 2, 20, { align: 'center' });
  
  // Numéro et dates
  doc.setFontSize(10);
  doc.text([
    `Facture N° : ${invoice.invoice_number}`,
    `Date : ${new Date(invoice.invoice_date).toLocaleDateString()}`,
    `Échéance : ${new Date(invoice.due_date).toLocaleDateString()}`
  ], 15, 35);

  // Informations de l'entreprise
  const companyInfo = [
    companyDetails?.company_name || '',
    companyDetails?.address || '',
    `${companyDetails?.postal_code || ''} ${companyDetails?.city || ''}`,
    `SIRET : ${companyDetails?.siret || ''}`,
    `TVA Intra : ${companyDetails?.vat_number || ''}`,
    `Tél : ${companyDetails?.phone || ''}`,
    `Email : ${companyDetails?.email || ''}`
  ];
  doc.text(companyInfo, 15, 55);

  // Informations du client
  const clientInfo = [
    'Facturé à :',
    client.company_name,
    client.address,
    `${client.postal_code} ${client.city}`,
    `Contact : ${client.contact_name}`,
    `Email : ${client.email}`
  ];
  doc.text(clientInfo, doc.internal.pageSize.width - 80, 55);

  // Tableau des articles
  const tableColumn = ['Description', 'Quantité', 'Prix unitaire HT', 'TVA', 'Total HT'];
  const tableRows = invoice.invoice_items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unit_price.toFixed(2)} €`,
    `${item.tax_rate}%`,
    `${(item.quantity * item.unit_price).toFixed(2)} €`
  ]);

  doc.autoTable({
    startY: 100,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [75, 75, 75],
      textColor: 255,
      fontSize: 10
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    }
  });

  // Totaux
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text([
    `Total HT : ${invoice.subtotal.toFixed(2)} €`,
    `TVA (${invoice.tax_rate}%) : ${invoice.tax_amount.toFixed(2)} €`,
    `Total TTC : ${invoice.total.toFixed(2)} €`
  ], doc.internal.pageSize.width - 60, finalY);

  // Mentions légales
  doc.setFontSize(8);
  const legalText = [
    'Mentions légales :',
    `Capital social : ${companyDetails?.capital || ''} €`,
    `RCS ${companyDetails?.rcs_city || ''} ${companyDetails?.rcs_number || ''}`,
    'TVA acquittée sur les encaissements',
    `Domiciliation bancaire : ${companyDetails?.bank_name || ''}`,
    `IBAN : ${companyDetails?.iban || ''}`,
    `BIC : ${companyDetails?.bic || ''}`,
    'En cas de retard de paiement, indemnité forfaitaire pour frais de recouvrement : 40 euros (art. L.441-6 et D.441-5 du code de commerce)',
    'Pas d\'escompte en cas de paiement anticipé',
    `Conditions de règlement : ${companyDetails?.payment_terms || '30 jours'}`
  ];
  
  doc.text(legalText, 15, doc.internal.pageSize.height - 40, {
    maxWidth: doc.internal.pageSize.width - 30
  });

  return doc;
};
