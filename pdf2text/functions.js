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

function handlePdf(data){

    document.getElementById('myText0').innerHTML = "* Début du fichier PDF*\n";

    var fileList = this.files;
    var MyFile = data[0];
    var fileReader = new FileReader();

    fileReader.onload = function() {

        var typedarray = new Uint8Array(this.result);
        
         PDFJS.getDocument(typedarray).then(function(pdf) {

            var pdfDocument = pdf;
            var pagesPromises = [];

        for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
            (function (pageNumber) {
                pagesPromises.push(getPageText(pageNumber, pdfDocument));
            })(i + 1);
        }

        Promise.all(pagesPromises).then(function (pagesText) {
             document.getElementById('myText0').innerHTML += pagesText; //fill textarea with extracted text
        });

        delete data;

        }, function (reason) {
            alert(reason);
        });
    };

    fileReader.readAsArrayBuffer(MyFile);
}