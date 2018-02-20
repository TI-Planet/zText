function getPageText(pageNum, PDFDocumentInstance)
{
    return new Promise(function(resolve, reject)
    {
        PDFDocumentInstance.getPage(pageNum).then(function(pdfPage)
        {
            pdfPage.getTextContent().then(function(textContent)
            {
                let finalString = "";
                let lastY = -1;
                textContent.items.forEach(function(i)
                {
                    if (lastY !== i.transform[5])
                    {
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

function handlePdf(files)
{
    if (typeof(files[0]) === "undefined") {
        return;
    }

    document.getElementById('loaderPdf').innerHTML = "<b><font color=#FE2E2E>Chargement du fichier PDF en cours...</font></b>&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;<img src='images/ajax-loader.gif' alt='loader' height='10px' width='10px'/>";
    document.getElementById('myText0').innerHTML = "* Début du fichier PDF*\n";

    $('#myText0').prop('disabled', true); //disable textarea while loading the pdf file

    const maxPages = 10;
    const fileReader = new FileReader();

    fileReader.onload = function()
    {
        let typedarray = new Uint8Array(this.result);
        PDFJS.getDocument(typedarray).then(function(pdfDoc)
        {
            if (pdfDoc.pdfInfo.numPages <= maxPages)
            {
                let pagesPromises = [];
                for (var i = 0; i < pdfDoc.pdfInfo.numPages; i++)
                {
                    (function(pageNumber) {
                        pagesPromises.push(getPageText(pageNumber, pdfDoc));
                    })(i + 1);
                }
                Promise.all(pagesPromises).then(function(pagesText) {
                    document.getElementById('myText0').innerHTML += pagesText; //fill textarea with extracted text
                });
                document.getElementById('loaderPdf').innerHTML = `<b><font color="#3ADF00">Fichier PDF chargé!</font></b>`;
            }
            else
            {
                alert(`Le document comporte trop de pages! Maxmimum ${maxPages} pages.`);
                document.getElementById('loaderPdf').innerHTML = `<b><font color="#FE2E2E">Échec lors du chargement du PDF : trop de pages.</font></b>`;
            }

            $('#myText0').prop('disabled', false); //enable the textarea

        }, function(reason) {
            document.getElementById('loaderPdf').innerHTML = `<b><font color="#FE2E2E">${reason}</font></b>`;
            $('#myText0').prop('disabled', false); //enable the textarea
        });
    };

    fileReader.readAsArrayBuffer(files[0]);
}
