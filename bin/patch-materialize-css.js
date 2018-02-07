const fsExtra = require('fs-extra');
const path = require('path');

// fixes a problem with tooltips position at the bottom of the window
// fixes a problem with tooltips, they take space at the bottom of the window when they are hidden

const materializePath = path.join(__dirname, '../node_modules/materialize-css');

checkMaterializeVersion();
patchTooltipFile();
patchMinifiedDistFile();

function checkMaterializeVersion() {
    const packageJsonPath = path.join(materializePath, 'package.json');
    const packageJsonContent = JSON.parse(fsExtra.readFileSync(packageJsonPath));

    if ('0.100.2' != packageJsonContent.version) {
        console.log(`Patch not applicable to materialize-css version "${packageJsonContent.version}"`);

        process.exit(0);
    }
}

function patchTooltipFile() {
    // 10 is tooltip margin * 2
    const tooltipFilePath = path.join(materializePath, 'dist/js/materialize.js');
    const tooltipFileContent = '' + fsExtra.readFileSync(tooltipFilePath);
    const stringToReplace1 = 'newY + height > window.innerHeight + $(window).scrollTop';
    const replacementString1 = 'newY + height + 10 > window.innerHeight + $(window).scrollTop()';
    const stringToReplace2 = 'newY -= newY + height - window.innerHeight;';
    const replacementString2 = 'newY -= (newY + height) - (window.innerHeight + $(window).scrollTop()) + 10;';
    const stringToReplace3 = "tooltipEl.css({ visibility: 'hidden', });";
    const replacementString3 = "tooltipEl.css({ visibility: 'hidden', left: '0px', top: '0px' });";
    let patchedContent = tooltipFileContent;

    if (-1 === patchedContent.indexOf(replacementString1)) {
        const indexStart = patchedContent.indexOf(stringToReplace1);
        patchedContent = patchedContent.substr(0, indexStart) + replacementString1 + patchedContent.substr(indexStart + stringToReplace1.length);
    }

    if (-1 === patchedContent.indexOf(replacementString2)) {
        const indexStart = patchedContent.indexOf(stringToReplace2);
        patchedContent = patchedContent.substr(0, indexStart) + replacementString2 + patchedContent.substr(indexStart + stringToReplace2.length);
    }

    if (-1 === patchedContent.indexOf(replacementString3)) {
        const indexStart = patchedContent.indexOf(stringToReplace3);
        patchedContent = patchedContent.substr(0, indexStart) + replacementString3 + patchedContent.substr(indexStart + stringToReplace3.length);
    }

    fsExtra.writeFileSync(tooltipFilePath, patchedContent);
}

function patchMinifiedDistFile() {
    // 10 is tooltip margin * 2
    const distFilePath = path.join(materializePath, 'dist/js/materialize.min.js');
    const distFileContent = '' + fsExtra.readFileSync(distFilePath);
    const stringToReplace1 = 'r+o>window.innerHeight+t(window).scrollTop';
    const replacementString1 = 'r+o+10>window.innerHeight+t(window).scrollTop()';
    const stringToReplace2 = 'r-=r+o-window.innerHeight';
    const replacementString2 = 'r-=(r+o)-(window.innerHeight+t(window).scrollTop())+10';
    const stringToReplace3 = 'u.css({visibility:"hidden"}),c.css({visibility:"hidden"}),h=!1';
    const replacementString3 = 'u.css({visibility:"hidden"}),c.css({visibility:"hidden",left:"0px",top:"0px"}),h=!1';
    let patchedContent = distFileContent;

    if (-1 === patchedContent.indexOf(replacementString1)) {
        const indexStart = patchedContent.indexOf(stringToReplace1);
        patchedContent = patchedContent.substr(0, indexStart) + replacementString1 + patchedContent.substr(indexStart + stringToReplace1.length);
    }

    if (-1 === patchedContent.indexOf(replacementString2)) {
        const indexStart = patchedContent.indexOf(stringToReplace2);
        patchedContent = patchedContent.substr(0, indexStart) + replacementString2 + patchedContent.substr(indexStart + stringToReplace2.length);
    }

    if (-1 === patchedContent.indexOf(replacementString3)) {
        const indexStart = patchedContent.indexOf(stringToReplace3);
        patchedContent = patchedContent.substr(0, indexStart) + replacementString3 + patchedContent.substr(indexStart + stringToReplace3.length);
    }

    fsExtra.writeFileSync(distFilePath, patchedContent);
}
