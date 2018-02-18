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

    document.getElementById('loaderPdf').innerHTML = "<b><font color=#FE2E2E>Chargement du fichier en cours...</font></b>&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;<img src='images/ajax-loader.gif' alt='loader' height='10px' width='10px'/>";
    document.getElementById('myText0').innerHTML = "* Début du fichier PDF*\n";

    var fileList = this.files;
    var MyFile = data[0];
    var maxPages = 10;
    var fileReader = new FileReader();

    fileReader.onload = function() {

        var typedarray = new Uint8Array(this.result);
        
         PDFJS.getDocument(typedarray).then(function(pdf) {

            var pdfDocument = pdf;
            var pagesPromises = [];

            if(pdf.pdfInfo.numPages <= maxPages){

                for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
                    (function (pageNumber) {
                        pagesPromises.push(getPageText(pageNumber, pdfDocument));
                    })(i + 1);
                }

                Promise.all(pagesPromises).then(function (pagesText) {
                     document.getElementById('myText0').innerHTML += pagesText; //fill textarea with extracted text


                });
                document.getElementById('loaderPdf').innerHTML = "<b><font color=#3ADF00>Fichier pdf chargé!</font></b>";
            }else{
                alert("Le document comporte trop de pages! Maxmimum "+maxPages+" pages.");
                document.getElementById('loaderPdf').innerHTML = "<b><font color=#FE2E2E>Echec lors du chargement fichier pdf: trop de pages.</font></b>";


            }

        }, function (reason) {
            document.getElementById('loaderPdf').innerHTML = "<b><font color=#FE2E2E>"+reason+"</font></b>";

        });

    };

    fileReader.readAsArrayBuffer(MyFile);
}