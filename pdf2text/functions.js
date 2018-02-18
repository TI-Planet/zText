function getPageText(pageNum, PDFDocumentInstance) {
    return new Promise(function (resolve, reject) {
        PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
            pdfPage.getTextContent().then(function (textContent) {
                var textItems = textContent.items;
                var finalString = "";
                var lastY = -1;

                 textContent.items.forEach(function (i) {
                        if (lastY != i.transform[5]) {

                          finalString += "\n";
                          lastY = i.transform[5];
                        }

                  finalString += i.str;
                });

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