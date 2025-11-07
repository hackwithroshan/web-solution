import { Payment, User } from '../types';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
};

export const generateInvoice = async (payment: Payment, user: User): Promise<void> => {
    // Dynamically import jspdf and its autotable plugin to prevent build-time import issues
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    // Define the augmented type inside the function scope
    type jsPDFWithAutoTable = import('jspdf').jsPDF & {
        autoTable: (options: any) => jsPDFWithAutoTable;
        lastAutoTable: { finalY: number };
    };
    
    const doc = new jsPDF() as jsPDFWithAutoTable;
    (doc as any).autoTable = autoTable;

    // --- Fonts & Colors ---
    const headerFont = 'helvetica'; // sans-serif
    const titleFont = 'times';     // serif
    const bodyFont = 'helvetica';
    const primaryColor = '#000000';
    const secondaryColor = '#555555';
    const accentColor = '#3CB371'; // Green for 'PAID' status

    // --- Header Section ---
    // Left side: Company Info
    doc.setFont(headerFont, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text('APEXNUCLEUS', 14, 22);

    doc.setFont(bodyFont, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.text('ApexNucleus Cloud Solutions', 14, 30);
    doc.text('123 Innovation Drive, Tech City, 10001', 14, 35);
    doc.text('India', 14, 40);
    doc.text('GST Reg #: 27AAPCU0000A1Z5', 14, 45);

    // Right side: Invoice Info
    doc.setFont(titleFont, 'bold');
    doc.setFontSize(28);
    doc.setTextColor(primaryColor);
    doc.text('INVOICE', 200, 22, { align: 'right' });

    let rightHeaderY = 35;
    const writeRightHeader = (label: string, value: string, isBold: boolean = true) => {
        doc.setFont(bodyFont, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(secondaryColor);
        doc.text(label, 150, rightHeaderY, { align: 'right' });
        doc.setFont(bodyFont, isBold ? 'bold' : 'normal');
        doc.setTextColor(primaryColor);
        doc.text(value, 200, rightHeaderY, { align: 'right' });
        rightHeaderY += 6;
    };

    if (!payment.order) {
        throw new Error("Cannot generate invoice: Order data is missing.");
    }
    
    writeRightHeader('Invoice #', `AN-${payment.transactionId.slice(-8).toUpperCase()}`);
    writeRightHeader('Invoice Issued #', formatDate(payment.date));
    writeRightHeader('Invoice Amount #', `₹${payment.amount.toFixed(2)} (INR)`);
    
    const nextBillingDate = new Date(payment.date);
    nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    
    writeRightHeader('Next Billing Date #', formatDate(nextBillingDate.toISOString()));
    writeRightHeader('Order Nr. #', payment.order._id.toString().slice(-12));

    if (payment.status === 'completed') {
        rightHeaderY += 2;
        doc.setFont(bodyFont, 'bold');
        doc.setFontSize(10);
        doc.setTextColor(accentColor);
        doc.text('PAID', 200, rightHeaderY, { align: 'right' });
    }

    // --- Billed To Section ---
    let billedToY = 75;
    doc.setFont(headerFont, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(secondaryColor);
    doc.text('BILLED TO', 14, billedToY);

    billedToY += 6;
    doc.setFont(bodyFont, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.text(user.name, 14, billedToY);

    const addressLines = doc.splitTextToSize(user.address || 'N/A', 80);
    billedToY += 5;
    doc.text(addressLines, 14, billedToY);

    billedToY += (addressLines.length * 5);
    doc.text(user.email, 14, billedToY);
    billedToY += 5;
    doc.text(user.phone, 14, billedToY);

    // --- Table ---
    const tableColumn = ["DESCRIPTION", "PRICE", "QTY", "AMOUNT (INR)"];
    const tableRows: any[] = [];
    
    payment.order.items.forEach(item => {
        const plan = item.plan as any; // Assuming populated
        const service = item.service as any; // Assuming populated
        const description = item.itemType === 'new_purchase' ? plan?.name : service?.planName;
        const domain = item.domainName || service?.domainName;
        
        let fullDescription: any[] = [];
        
        fullDescription.push({ content: description || 'N/A', styles: { fontStyle: 'bold', fontSize: 10, textColor: primaryColor } });
        
        if (domain) {
            fullDescription.push({ content: domain, styles: { fontStyle: 'normal', fontSize: 9, textColor: secondaryColor } });
        }
        
        const startDate = new Date(payment.date);
        const endDate = new Date(startDate);
        endDate.setFullYear(startDate.getFullYear() + 1);
        const dateRange = `${formatDate(startDate.toISOString())} to ${formatDate(endDate.toISOString())}`;
        fullDescription.push({ content: dateRange, styles: { fontStyle: 'normal', fontSize: 9, textColor: secondaryColor } });
        
        const row = [
            fullDescription,
            `₹${item.price.toFixed(2)}`,
            '1',
            { content: `₹${item.price.toFixed(2)}`, styles: { fontStyle: 'bold' } }
        ];
        tableRows.push(row);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: billedToY + 15,
        theme: 'plain',
        headStyles: { 
            textColor: secondaryColor, 
            fontStyle: 'bold',
            fontSize: 8,
            lineWidth: { bottom: 0.3 },
            lineColor: [180, 180, 180]
        },
        styles: {
            font: bodyFont,
            fontSize: 10,
            cellPadding: { top: 4, bottom: 4 },
            valign: 'middle',
        },
        bodyStyles: {
            lineWidth: { bottom: 0.2 },
            lineColor: [220, 220, 220]
        },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { halign: 'right' },
            2: { halign: 'center' },
            3: { halign: 'right' },
        },
        didDrawPage: (data: any) => {
            if (!payment.order) return;
            // --- Totals Section ---
            const finalY = (doc.lastAutoTable as any).finalY + 10;
            
            doc.setFontSize(10);
            doc.setFont(bodyFont, 'normal');
            doc.setTextColor(secondaryColor);

            const totalsX = 165;
            const valuesX = 200;

            doc.text('Subtotal', totalsX, finalY, { align: 'right' });
            doc.text(`₹${payment.order.subtotal.toFixed(2)}`, valuesX, finalY, { align: 'right' });
            
            doc.text('GST (18%)', totalsX, finalY + 7, { align: 'right' });
            doc.text(`₹${payment.order.taxAmount.toFixed(2)}`, valuesX, finalY + 7, { align: 'right' });

            doc.setLineWidth(0.2);
            doc.line(130, finalY + 12, 200, finalY + 12);

            doc.setFontSize(12);
            doc.setFont(headerFont, 'bold');
            doc.setTextColor(primaryColor);
            doc.text('Total', totalsX, finalY + 19, { align: 'right' });
            doc.text(`₹${payment.order.totalAmount.toFixed(2)}`, valuesX, finalY + 19, { align: 'right' });

            doc.setFontSize(10);
            doc.setFont(bodyFont, 'normal');
            doc.setTextColor(secondaryColor);
            doc.text(`Payments (₹${payment.order.totalAmount.toFixed(2)})`, totalsX, finalY + 26, {align: 'right'});

            doc.setLineWidth(0.2);
            doc.line(130, finalY + 31, 200, finalY + 31);

            doc.setFontSize(11);
            doc.setFont(headerFont, 'bold');
            doc.setTextColor(primaryColor);
            doc.text('Amount Due (INR)', totalsX, finalY + 38, { align: 'right' });
            doc.text('₹0.00', valuesX, finalY + 38, { align: 'right' });
        }
    });

    doc.save(`Invoice-ApexNucleus-${payment.transactionId.slice(-8)}.pdf`);
};