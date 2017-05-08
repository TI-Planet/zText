/*
 Course Generator V1.0
 Authors:
 William "Wistaro" Romiguières (this script)
 Adrien "Adriweb" Bertrand (this script + tivars_lib_cpp)
 Help: tiplanet.org
 */

let newCourse = "";

let withMenu = false;

let chosenCalc = 'CE';
let lastFilePath = null;

let nbParties = 1;
let parties = [];

function isInt(value) {
    return !isNaN(value) && (x => (x|0) === x)(parseFloat(value))
}

function initNewCourse()
{
    newCourse = "FnOff :0→Xmin:0→Ymin:1→∆X:1→∆Y:AxesOff:ClrDraw\n";
}

function startWizard()
{
    initNewCourse();
    $("#myText0").remove();

    do {
        nbParties = prompt('Combien de parties ? (1-6)');
    } while (!isInt(nbParties) || nbParties < 1 || nbParties > 6);

    withMenu = true;

    const menuName = prompt('Titre de votre menu (sommaire des parties) ?', 'Sommaire');
    newCourse += `\nLbl 0\nMenu("${menuName.toUpperCase()}"`;

    for (var i = 0; i < nbParties; i++)
    {
        parties[i] = prompt(`Titre de la partie n°${(i+1)}`);
        newCourse += `,"${parties[i].toUpperCase()}",${(i+1)}`;
        $('.step2').fadeIn(1000).append(`<textarea id="myText${i}" title="Votre texte ici" name="myText${i}" placeholder="Écrivez votre texte dans cette zone">Votre cours, partie ${(i+1)}! </textarea><br />`);
    }
    registerPreviewHandler();

    newCourse += ",\"Quitter\",Q\n";
}

function generateCourse()
{
    let inputStr = "";
    let bufferStr = "";

    for (var j = 0; j < nbParties; j++)
    {
        newCourse += `Lbl ${(j+1)}\n`;

        inputStr = $(`#myText${j}`).val();

        inputStr = inputStr.replace(/"/g, "''")	// replacing " by '' 
                           .replace(/→/g, "->")	// replacing arrow
                           .replace(/ /g, "  ") // 2 spaces look better on screen
                        



         var arrayExp = inputStr.split('\n');

             for(var i = 0;i<=arrayExp.length - 1;i++){

                bufferStr+=arrayExp[i];

                if(arrayExp[i].length < 33 && arrayExp[i].trim() != ""){

                    for(var j = 1;j<=33-arrayExp[i].length;j++){
                        bufferStr+=" ";
                     }

                 }

            }

        inputStr = bufferStr;

        

        const MIN_PAS_Y = 12;
        const MIN_PAS_X = 0;
        const MAX_CHAR_LINE = 33;
        const LAST_LINE = 13;

        let Cptlines = 0;
        let CptlinesSave = 0;
        let CptPages = 1;
        let YText = 0;
        let XText = 0;

        newCourse += "\nDelVar V\n";

        let currentSubStr = "";

        for (var i = 0; i < inputStr.length; i++)
        {
            if ((i % MAX_CHAR_LINE) === 0)
            {
                currentSubStr = inputStr.substring(i, i + MAX_CHAR_LINE);

                newCourse += `"${currentSubStr}\nprgmZTEXT\n`;

                Cptlines++;
                CptlinesSave++;
                YText += MIN_PAS_Y;
            }
            if (Cptlines === LAST_LINE)
            {
                newCourse += "Pause :ClrDraw:DelVar V\n";
                YText = 0;
                Cptlines = 0;
                CptPages++;
            }

        }

        newCourse += "Pause :ClrDraw\n";
        newCourse += withMenu ? "Goto 0\n" : "Disp \"";
    }

    newCourse += "\nLbl Q\nClrDraw:Disp \"";

    const titlePrgm = $("#prgmName").val();
    //newCourse+="\n\"      Titre:"+titlePrgm+"→Y₁\n";

    create8xpFile(titlePrgm, newCourse);
}

function create8xpFile(title, content)
{
    try
    {
        const lib = Module;

        if (lastFilePath !== null)
        {
            FS.unlink(lastFilePath);
            lastFilePath = null;
        }

        const txt = unescape(encodeURIComponent(content)); // encoding issues...

        const prgm = lib.TIVarFile.createNew(lib.TIVarType.createFromName("Program"), title, lib.TIModel.createFromName(chosenCalc));

        prgm.setContentFromString(txt);
        const filePath = prgm.saveVarToFile("", title);
        lastFilePath = filePath;

        const file = FS.readFile(filePath, {encoding: 'binary'});
        if (file)
        {
            const blob = new Blob([file], {type: 'application/octet-stream'});
            window['saveAs'](blob, filePath.split('/').pop());
        } else {
            alert('Impossible de récupérer le fichier généré:(');
        }

    } catch (e)
    {
        alert('Hmmm. Une erreur est survenue. ' + e.toString());
    }
}