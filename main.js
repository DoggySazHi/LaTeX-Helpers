"use strict";

onInit();

function onInit() {
    document.getElementById("addRow").addEventListener("click", (e) => {
        e.preventDefault();
        addRow();
    });
    document.getElementById("copyRow").addEventListener("click", (e) => {
        e.preventDefault();
        copyRow();
    });
}

function tryParseInt(i) {
    try {
        return parseInt(i);
    } catch (ignore) {
        return null;
    }
}

function getMatrixSize(row) {
    return [...row.querySelectorAll("label > input[type=number]")].map(o => tryParseInt(o.value));
}

function resizeMatrix(row) {
    let table = row.querySelector(".matrix");
    let matrix = tableToMatrix(table);
    let size = getMatrixSize(row);

    let matrixResized = math.resize(matrix, size, "");
    let tableResized = matrixToTable(matrixResized);

    table.replaceWith(tableResized);

    updateLatex(row);
}

function updateLatex(row) {
    let table = row.querySelector(".matrix");
    let matrix = tableToMatrix(table);

    let codeOutput = row.querySelector("code");
    let latexOutput = row.querySelector("td:nth-child(2)");

    let latex = matrixToBMatrix(matrix);

    codeOutput.innerText = latex;
    latexOutput.innerText = latex;

    MathJax.typeset();

    updateOutput();
}

function updateOutput() {
    document.getElementById("final").innerText =
        [...document.querySelectorAll("td > code")].map(o => o.innerText).reduce((a, b) => `${a}\\\\\n${b}`);
}

function tableToMatrix(table) {
    return [...table.children].map(o => [...o.children].map(p => p.firstChild.value));
}

function matrixToTable(matrix) {
    let rows = matrix.length;
    let columns = matrix[0].length;

    let table = document.createElement("table");
    table.classList.add("matrix");

    for (let i = 0; i < rows; ++i) {
        let row = document.createElement("tr");
        for (let j = 0; j < columns; ++j) {
            let col = document.createElement("td");
            let input = document.createElement("input");
            input.type = "text";
            if (matrix[i][j] != null)
                input.value = matrix[i][j];
            input.addEventListener("change", (e) => {
                e.preventDefault();
                // This is ugly.
                updateLatex(row.parentElement.parentElement.parentElement);
            });
            col.appendChild(input);
            row.append(col);
        }
        table.appendChild(row);
    }

    return table;
}

function matrixToEnvironment(matrix, env) {
    let rows = matrix.length;

    let output = `\\begin{${env}}\n`;

    for (let i = 0; i < rows; ++i) {
        output += "  "; // Indentation
        output += matrix[i].reduce((a, b) => `${a != null ? a : ""} & ${b != null ? b : ""}`);
        output += i !== rows - 1 ? " \\\\\n" : " \n";
    }

    output += `\\end{${env}}`
    return output;
}

function matrixToBMatrix(matrix) {
    return matrixToEnvironment(matrix, "bmatrix");
}

function matrixToVMatrix(matrix) {
    return matrixToEnvironment(matrix, "vmatrix");
}

function defaultRow() {
    let row = document.createElement("tr");
    let colCode = document.createElement("td");
    let colMath = document.createElement("td");
    let colConf = document.createElement("td");

    let code = document.createElement("code");
    colCode.appendChild(code);

    let sizeLabel = document.createElement("label");
    sizeLabel.innerHTML = "Matrix Size: "
    let rowCount = document.createElement("input");
    rowCount.type = "number";
    rowCount.min = "1";
    rowCount.value = "2";
    let sizeSplit = document.createElement("span");
    sizeSplit.innerHTML = "x";
    let colCount = rowCount.cloneNode(false);

    let deleteButton = document.createElement("button");
    deleteButton.classList.add("delete");
    deleteButton.innerHTML = "Delete Matrix";

    deleteButton.addEventListener("click", (e) => {
        e.preventDefault();
        row.parentElement.removeChild(row);
    });

    rowCount.addEventListener("change", (e) => {
        e.preventDefault();
        resizeMatrix(row);
    });
    colCount.addEventListener("change", (e) => {
        e.preventDefault();
        resizeMatrix(row);
    });

    sizeLabel.appendChild(rowCount);
    sizeLabel.appendChild(sizeSplit);
    sizeLabel.appendChild(colCount);
    sizeLabel.appendChild(deleteButton);

    let divider = document.createElement("hr");

    let matrix = [[null, null], [null, null]];
    let matrixTable = matrixToTable(matrix);
    let matrixLatex = matrixToBMatrix(matrix);

    colConf.appendChild(sizeLabel);
    colConf.appendChild(divider);
    colConf.appendChild(matrixTable);

    code.innerText = matrixLatex;
    colMath.innerText = matrixLatex;

    row.appendChild(colCode);
    row.appendChild(colMath);
    row.appendChild(colConf);

    return row;
}

function addRow() {
    let tableBody = document.querySelector("tbody");
    tableBody.append(defaultRow());

    MathJax.typeset();
}

function copyRow() {
    let tableBody = document.querySelector("tbody");
    let previous = document.querySelector("body > table > tbody > tr:last-child");
    if (previous != null) {
        let clone = previous.cloneNode(true);
        // Rebind matrix edits.
        [...clone.querySelectorAll("input[type=text]")].forEach(o => o.addEventListener("change", (e) => {
            e.preventDefault();
            updateLatex(clone);
        }));
        // Rebind matrix size
        [...clone.querySelectorAll("label > input[type=number]")].forEach(o => o.addEventListener("change", (e) => {
            e.preventDefault();
            resizeMatrix(clone);
        }));
        // Fix delete button
        clone.querySelector(".delete").addEventListener("click", (e) => {
            e.preventDefault();
            clone.parentElement.removeChild(clone);
        });
        tableBody.append(clone);
    } else {
        alert("No rows found!");
    }
    MathJax.typeset();
}