let field = document.querySelector(".field");
let resetBtn = document.querySelector(".reset");
let win = document.querySelector(".win");
let W_FIELD = 20;
let H_FIELD = 20;
let NUMBER_OF_BOMBS = W_FIELD * H_FIELD * 0.2;

let cellsElem = null;
let bombIndexArr = null;
let countBomb = NUMBER_OF_BOMBS;
let countTime = 0;
let indexIntervalTime = null;
let start = true;

//_____________Start____________
{
  createField();
  field.addEventListener("click", clickCell);
  field.addEventListener("contextmenu", addFlag);

  resetBtn.addEventListener("click", () => {
    field.addEventListener("click", clickCell);
    field.addEventListener("contextmenu", addFlag);
    clearInterval(indexIntervalTime);
    resetBtn.classList.remove("light-box");
    reset();
  });
}

//__________________________
function reset() {
  win.style.display = "none";
  countBomb = NUMBER_OF_BOMBS;
  document.querySelector(".number-bombs").textContent = countBomb;
  countTime = 0;
  document.querySelector(".time").textContent = "00:00";
  start = true;
  field.innerHTML = "";
  createField();
  field.removeEventListener("click", reset);
}

//__________________________
function startTime() {
  let m = 0;
  indexIntervalTime = setInterval(() => {
    countTime++;
    let s = countTime;
    if (s < 10) {
      s = "0" + s;
    }
    if (s == 60) {
      s = "00";
      countTime = 0;
      m += 1;
    }
    document.querySelector(".time").textContent = `${m}:${s}`;
  }, 1000);
}

//___________________________
function addFlag(event) {
  event.preventDefault();
  let elem = event.target;
  if (elem.tagName === "P") elem = elem.parentNode;
  if (!elem.classList.contains("block")) return;

  if (!elem.classList.contains("block-open")) {
    if (elem.classList.contains("flag")) {
      elem.classList.remove("flag");
      countBomb++;
    } else {
      elem.classList.add("flag");
      countBomb--;
    }
    document.querySelector(".number-bombs").textContent = countBomb;
    isWin();
  }
}

//___________________________
function createField() {
  field.style.gridTemplateColumns = `repeat(${W_FIELD}, auto)`;
  field.style.gridTemplateRows = `repeat(${H_FIELD}, auto)`;

  let countCells = W_FIELD * H_FIELD;
  for (let i = 0; i < countCells; i++) {
    let cell = document.createElement("div");
    cell.classList.add("block");
    cell.classList.add("block-cover");
    field.appendChild(cell);
  }
  cellsElem = field.children;
  addRandomBombsToField();
  addNumbersAroundBombs();
  document.querySelector(".number-bombs").textContent = countBomb;
}

//__________________________
function clickCell(event) {
  let element = event.target;

  if (start) {
    if (element.classList.contains("block") || element.tagName === "P") {
      document.querySelector(".number-bombs").textContent = countBomb;
      startTime();
      start = false;
    }
  }

  if (element.classList.contains("flag")) return;

  if (element.classList.contains("bomb")) {
    clearInterval(indexIntervalTime);
    openCellsWithBomb();
    field.addEventListener("click", reset);
    return;
  }

  if (element.tagName === "P") {
    let parend = element.parentNode;

    if (parend.classList.contains("flag")) return;
    if (parend.classList.contains("block-cover")) {
      parend.classList.remove("block-cover");
      parend.classList.add("block-open");
    }
  }

  if (element.classList.contains("block-cover")) {
    if (!element.classList.contains("block-open")) {
      element.classList.add("block-open");
      element.classList.remove("block-cover");
      openAllEmptyCellAround(element);
    }
  }
  isWin();
}

//__________________________
function isWin() {
  let countOpenCell = 0;
  let findBomb = 0;
  for (let i = 0; i < cellsElem.length; i++) {
    if (cellsElem[i].classList.contains("block-open")) {
      countOpenCell++;
    }
    if (
      cellsElem[i].classList.contains("bomb") &&
      cellsElem[i].classList.contains("flag")
    ) {
      findBomb++;
    }
  }

  if (
    W_FIELD * H_FIELD - countOpenCell === NUMBER_OF_BOMBS ||
    findBomb === NUMBER_OF_BOMBS
  ) {
    win.style.display = "flex";
    clearInterval(indexIntervalTime);
    field.removeEventListener("click", clickCell);
    field.removeEventListener("contextmenu", addFlag);
    resetBtn.classList.add("light-box");
  }
}

//__________________________
function openCellsWithBomb() {
  for (let i = 0; i < cellsElem.length; i++) {
    if (cellsElem[i].classList.contains("bomb")) {
      cellsElem[i].classList.remove("flag");
      cellsElem[i].classList.remove("block-cover");
    }
  }
}

//__________________________
function openAllEmptyCellAround(elementCell) {
  let openCells = multipleActionCheckAroundCell(
    Array.prototype.indexOf.call(cellsElem, elementCell),
    false,
    false,
    true
  );

  for (let i = 0; i < openCells.length; i++) {
    openAllEmptyCellAround(openCells[i]);
  }
}

//__________________________
function addRandomBombsToField() {
  bombIndexArr = getRandomUniqueNumbers(0, W_FIELD * H_FIELD, NUMBER_OF_BOMBS);
  for (let index of bombIndexArr) {
    cellsElem[index].classList.add("bomb");
  }
}

//_________________________
function getRandomUniqueNumbers(from, to, quantity) {
  let res = [];

  if (quantity > to) {
    throw Error("quantity > max");
  }

  let count = 0;
  while (count < quantity) {
    let rNum = Math.floor(Math.random() * (from - to)) + to;
    if (!res.includes(rNum)) {
      res.push(rNum);
      count++;
    }
  }
  return res;
}

//_______________________
function addNumbersAroundBombs() {
  for (let cellWithBomb of bombIndexArr) {
    calcNumbersBombAround(cellWithBomb);
  }
}

//_______________________
function calcNumbersBombAround(indexCell) {
  let arr = multipleActionCheckAroundCell(indexCell, false, true, false);
  for (let i = 0; i < arr.length; i++) {
    let currentCell = arr[i];
    if (
      !currentCell.classList.contains("bomb") &&
      currentCell.children[0] === undefined
    ) {
      let countBombsAroundCell = multipleActionCheckAroundCell(
        Array.prototype.indexOf.call(field.children, currentCell),
        true,
        false,
        false
      );

      let p = document.createElement("p");
      if (!countBombsAroundCell == 0) {
        p.textContent = countBombsAroundCell;
      }
      currentCell.appendChild(p);
    }
  }
}

//_____________________
function multipleActionCheckAroundCell(
  indexCell,
  getNumberOfBomb,
  getAllCells,
  getEmptyCells
) {
  let arr = [];
  let countBombs = 0;

  let staringCell = indexCell - W_FIELD - 1;
  let countRow = 0;
  let directionRow = 1;
  let countCol = 0;
  let directionCol = 1;
  let skipCell = arrValidCellAround(indexCell);

  for (let i = 0; i < 8; i++) {
    let elemCell = cellsElem[staringCell + countRow * W_FIELD + countCol];
    if (elemCell !== undefined) {
      if (!skipCell[i]) {
        if (getNumberOfBomb) {
          let res = elemCell.classList.contains("bomb");
          if (res) {
            countBombs++;
          }
        } else if (getAllCells) {
          arr.push(elemCell);
        } else if (getEmptyCells) {
          if (elemCell.firstChild?.tagName === "P") {
            elemCell.classList.add("block-open");
            elemCell.classList.remove("block-cover");
          }

          if (!elemCell.classList.contains("block-open")) {
            elemCell.classList.add("block-open");
            elemCell.classList.remove("block-cover");
            arr.push(elemCell);
            let cellsAround = multipleActionCheckAroundCell(
              Array.prototype.indexOf.call(cellsElem, elemCell),
              false,
              true,
              false
            );
            cellsAround.forEach((elem) => {
              if (elem.firstChild?.tagName === "P") {
                elem.classList.add("block-open");
                elem.classList.remove("block-cover");
              }
            });
          }
        }
      }
    }
    if (countCol < 2 && directionCol == 1) {
      countCol++;
    } else if (countRow < 2 && directionRow == 1) {
      countRow++;
      directionCol = -1;
    } else if (countCol > 0 && directionCol == -1) {
      countCol--;
      directionRow = -1;
    } else if (countRow > 0 && directionRow == -1) {
      countRow--;
    }
  }

  if (getAllCells || getEmptyCells) return arr;
  if (getNumberOfBomb) return countBombs;
}

//____________________________________
function arrValidCellAround(indexCell) {
  let skipCell = [];
  const currR = Math.floor(indexCell / W_FIELD);
  const currC = indexCell % W_FIELD;

  if (currR === 0) {
    skipCell = [true, true, true];
  }

  if (currR === H_FIELD - 1) {
    skipCell[4] = true;
    skipCell[5] = true;
    skipCell[6] = true;
  }

  if (currC === 0) {
    skipCell[0] = true;
    skipCell[6] = true;
    skipCell[7] = true;
  }

  if (currC === W_FIELD - 1) {
    skipCell[2] = true;
    skipCell[3] = true;
    skipCell[4] = true;
  }
  return skipCell;
}
