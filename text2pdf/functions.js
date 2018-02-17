function getPageText(pageNum, PDFDocumentInstance) {
    // Return a Promise that is solved once the text of the page is retrieven
    return new Promise(function (resolve, reject) {
        PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
            // The main trick to obtain the text of the PDF page, use the getTextContent method
            pdfPage.getTextContent().then(function (textContent) {
                var textItems = textContent.items;
                var finalString = "";

                // Concatenate the string of the item to the final string
                for (var i = 0; i < textItems.length; i++) {
                    var item = textItems[i];

                    finalString += item.str + " ";
                }

                // Solve promise with the text retrieven from the page
                resolve(finalString);
            });
        });
    });
}
function pdf2text(fileUrl){

        document.getElementById('myText0').innerHTML = "* Début du fichier PDF*\n";

        var PDF_URL = fileUrl;

        PDFJS.workerSrc = 'text2pdf/pdf.worker.js';

        PDFJS.getDocument(PDF_URL).then(function (PDFDocumentInstance) {

        var pdfDocument = pdf;
        var pagesPromises = [];

        for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
            (function (pageNumber) {
                pagesPromises.push(getPageText(pageNumber, pdfDocument));
            })(i + 1);
        }

        // Execute all the promises
        Promise.all(pagesPromises).then(function (pagesText) {
             document.getElementById('myText0').innerHTML = pagesText; //fill textarea with extracted text
        });


    }, function (reason) {
        // PDF loading error
        console.error(reason);
        alert(reason);
    });
}

function loadPdf(){

    var myPdfUrl =  document.getElementById('pdfurl').value;
    var isFileOk = false;

    /*Secure datas*/
    myPdfUrl = myPdfUrl.replace(/&/g, "&amp;");
    myPdfUrl = myPdfUrl.replace(/"/g, "&quot;");
    myPdfUrl = myPdfUrl.replace(/'/g, "&#039;");
    myPdfUrl = myPdfUrl.replace(/</g, "&lt;");
    myPdfUrl = myPdfUrl.replace(/>/g, "&gt;");

    if(myPdfUrl.substr(-4,4) != '.pdf'){

        alert("Ce n'est pas un fichier pdf! Vérifiez l'URL!");

    }else{
        isFileOk = true;
    }

    if(isFileOk == true) pdf2text(myPdfUrl);


}