/*
 Course Generator V1.0
 Authors:
 William "Wistaro" Romiguières (this script)
 Adrien "Adriweb" Bertrand (this script + tivars_lib_cpp)
 Help: tiplanet.org
 */

let courseHeader = "";

let withMenu = false;

let chosenCalc = 'CE';
let lastFilePath = null;

let nbParties = 1;
let parties = [];

function isInt(value)
{
    return !isNaN(value) && (x => (x|0) === x)(parseFloat(value))
}

function startWizard()
{
    parties = [];
    $("#myText0").remove();

    do {
        nbParties = prompt('Combien de parties ? (1-6)');
    } while (!isInt(nbParties) || nbParties < 1 || nbParties > 6);
    nbParties = parseInt(nbParties);

    withMenu = true;

    const menuName = prompt('Titre de votre menu (sommaire des parties) ?', 'Sommaire');
    courseHeader += `\nLbl 0\nMenu("${menuName.toUpperCase()}"`;

    for (var i = 0; i < nbParties; i++)
    {
        parties[i] = prompt(`Titre de la partie n°${(i+1)}`);
        courseHeader += `,"${parties[i].toUpperCase()}",${(i+1)}`;
        $('.step2').fadeIn(1000).append(`<textarea id="myText${i}" title="Votre texte ici" name="myText${i}" placeholder="Écrivez votre texte dans cette zone">Votre cours, partie ${(i+1)}! </textarea><br />`);
    }
    registerPreviewHandler();

    courseHeader += ",\"Quitter\",Q\n";
}

function generateCourse()
{
    let courseInit = "FnOff :0→Xmin:0→Ymin:1→∆X:1→∆Y:AxesOff:ClrDraw\n";
    if (chosenCalc === "83PCE") { courseInit += "BackgroundOff\n"; }

    const MIN_PAS_X      = 0;
    const MIN_PAS_Y      = (chosenCalc === "83PCE") ? 12 :  7;
    const MAX_CHAR_LINE  = (chosenCalc === "83PCE") ? 36 : 23;
    const LAST_LINE      = (chosenCalc === "83PCE") ? 13 :  9;

    let newCourse =  ((chosenCalc === "83PCE") ? "12→W\n" : "7→W\n") + courseInit + courseHeader;

    for (var part = 0; part < nbParties; part++)
    {
        let bufferStr = "";

        newCourse += `Lbl ${(part+1)}\n`;

        let inputStr = $(`#myText${part}`).val();

        if (chosenCalc === "83") { inputStr = inputStr.toUpperCase(); }

        inputStr = inputStr.replace(/"/g, "''")     // replacing " by ''
                           .replace(/→/g, "->")     // replacing arrow
                           //.replace(/ /g, "  ");    // 2 spaces look better on screen

        const splitInput = inputStr.split('\n');

        for (var i = 0; i < splitInput.length; i++)
        {
            const val = splitInput[i];
            bufferStr += val;

            if (val.length < MAX_CHAR_LINE)
            {
                for (var idxSpace = 1; idxSpace <= MAX_CHAR_LINE - val.length; idxSpace++)
                {
                    bufferStr += " ";
                }
            } else {
                let nbFullLines = (val.length / MAX_CHAR_LINE)|0;
                let nbSpaces = MAX_CHAR_LINE - val.substring(nbFullLines*MAX_CHAR_LINE,val.length).length;

                for (var idxSpace = 1; idxSpace <= nbSpaces; idxSpace++)
                {
                    bufferStr += " ";
                }
            }
        }

        inputStr = bufferStr;

        let Cptlines = 0;
        let CptlinesSave = 0;
        let CptPages = 1;
        let YText = 0;
        let XText = 0;

        newCourse += "\nDelVar V\n";

        let currentSubStr = "";

        alert(MAX_CHAR_LINE);

        for (var i = 0; i < inputStr.length; i++)
        {
            if (!(i % MAX_CHAR_LINE))
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
