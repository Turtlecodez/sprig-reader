document.getElementById('downloadButton').addEventListener('click', download);
document.getElementById('copyButton').addEventListener('click', copyToClipboard);
let finalContent = "weh";

function download() {
    saveToFile(finalContent);
}

function copyToClipboard() {
    navigator.clipboard.writeText(finalContent).then(() => {
        console.log("Text copied to clipboard");
    }).catch(err => {
        console.error("Failed to copy text: ", err);
    });
}

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        let fileContent = event.target.result;
        // Remove form feed and replace special single quotes with regular ones
        fileContent = fileContent.replace(/\f/g, '').replace(/’/g, "'");
        processFileContent(fileContent);
    };

    reader.readAsText(file);
});

function processFileContent(content) {
    const lines = [];
    let line = '';
    for (const char of content) {
        if (char === '\n' || char === '\r') {
            if (line.length > 0) lines.push(line);
            line = '';
        } else {
            line += char;
            if (line.length === 17) { 
                lines.push(line); 
                line = '';
            }
        }
    }
    if (line.length > 0) lines.push(line);
    wrapLines(lines);
}

function wrapLines(lines) {
    let yValue = 1;
    const wrappedLines = lines.map(line => {
        const wrappedLine = '\taddText(`' + line + '`, { x: 2, y: ' + yValue + ', color: color\`0\`})';
        yValue = (yValue % 14) + 1;
        return wrappedLine;
    });
    insertClrScrnCode(wrappedLines);
}

function insertClrScrnCode(array) {
    const outputArray = [];
    for (let i = 0; i < array.length; i++) {
        outputArray.push(array[i]);
        if ((i + 1) % 14 === 0) {
            outputArray.push("\tkeyPressed = await waitForKeypress();", "\tclearText()");
        }
    }
    addTemplate(outputArray);
}

function addTemplate(outputArray) {
    const templateStart = `
function waitForKeypress() {
  return new Promise(resolve => {
    document.addEventListener('keydown', function keydownListener(event) {
      document.removeEventListener('keydown', keydownListener);
      resolve(event.key);
    });
  });
}

setSolids([])

let level = 0
const levels = [
  map\`
..........
..........
..........
..........
..........
..........
..........
..........
..........\`
]

setMap(levels[level])
async function main() {
  addText("press a key to st", { 
    x: 2,
    y: 1,
    color: color\`5\`
  })
  addText("art reading.", { 
    x: 2,
    y: 2,
    color: color\`5\`
  })
  let keyPressed = await waitForKeypress();
  clearText()
`;

    const templateEnd = `
}
main()`;

    finalContent = [templateStart, ...outputArray, templateEnd].join("\n");
    document.getElementById('copyButton').style = "display: block;";
    document.getElementById('downloadButton').style = "display: block;";
    document.getElementById('le-box').style = "align-self: center; border: 2px solid black; margin-left: auto; margin-right: auto; border-radius: 20px; width: 300px; height: 125px;";
}

function saveToFile(finalContent) {
    const blob = new Blob([finalContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'output.txt';
    link.click();
}
