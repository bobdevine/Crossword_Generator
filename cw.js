"use strict";

const LETTER_PLACEHOLDER = '?';
//const LETTER_BLOCKED = '#';

const DIR_ACROSS = 'ACROSS';
const DIR_DOWN = 'DOWN';
const DIR_BOTH = 'BOTH';

const TRY_MAX = 5;

const BOARD_SIZE_ROWS = 7;
const BOARD_SIZE_COLS = 13;
const BOARD_PATTERNS = [
    [
	[0,4], [0,8],
	[1,4], [1,8],
	[2,4], [2,8],
	[3,0], [3,1], [3,2], [3,10], [3,11], [3,12],
	[4,6],
	[5,6],
	[6,0], [6,1], [6,2], [6,10], [6,11], [6,12],
	[7,4], [7,8],
	[8,4], [8,8],
	[9,3], [9,4], [9,8], [9,9],
	[10,3], [10,4], [10,8], [10,9],
	[11,3], [11,4], [11,8], [11,9],
	[12,3], [12,4], [12,8], [12,9],
    ],
    [
	[0,3],
	[1,1], [1,3], [1,5], [1,7], [1,9],
	[2,10],
	[3,1], [3,3], [3,4], [3,5], [3,6], [3,8], [3,9], [3,11],
	[4,5],
	[5,1], [5,2], [5,3], [5,5], [5,7], [5,9], [5,11],
	[6,0], [6,12],
	[7,1], [7,3], [7,5], [7,7], [7,9], [7,10], [7,11],
	[8,7],
	[9,1], [9,3], [9,4], [9,6], [9,7], [9,8], [9,9], [9,11],
	[10,2],
	[11,3], [11,5], [11,7], [11,9], [11,11],
	[12,11],
    ],
    [
	[0,9],
	[1,1], [1,5], [1,7], [1,9],
	[2,2], [2,10],
	[3,1], [3,3], [3,4], [3,5], [3,7], [3,8], [3,9], [3,11],
	[4,6],
	[5,1], [5,3], [5,5], [5,6], [5,7], [5,9], [5,10], [5,12],
	[6,6],
	[7,0], [7,2], [7,3], [7,5], [7,7], [7,9], [7,11],
	[8,7],
	[9,1], [9,3], [9,4], [9,5], [9,7], [9,8], [9,9], [9,11],
	[10,8],
	[11,3], [11,5], [11,7], [11,11],
	[12,3],
    ]
];

function cellKeyup(el) {
    //alert("CELL keyup " + el.textContent);
    var ch = el.textContent[el.textContent.length - 1];
    if (ch >= 'a' && ch <= 'z') {
        el.textContent = ch.toUpperCase();;
    } else if (ch >= 'A' && ch <= 'Z') {
        el.textContent = ch;
    } else if (' \t\n\r\v'.indexOf(ch) > -1) {
        el.textContent = ' ';
    } else {
        el.textContent = ch;
    }
}
//document.getElementById("myTable").rows[0].cells.item(0).innerHTML);


function Crossword() {
    this.Rows = BOARD_SIZE_ROWS;
    this.Columns = BOARD_SIZE_COLS;
    this.tableInternal = undefined;
    this.listAcrossDown = [];

}

Crossword.prototype.getClues = function() {
    return this.listAcrossDown;
}

Crossword.prototype.newGame = function() {
    // create table and add blanks
    this.tableInternal = new Array(this.Rows);
    for (let i = 0; i < this.Rows; i++) {
	this.tableInternal[i] = new Array(this.Columns);
    }
    let pat = Math.floor(Math.random() * BOARD_PATTERNS.length);
    for (let i = 0; i < BOARD_PATTERNS[pat].length; i++) {
	let r = BOARD_PATTERNS[pat][i][0];
	let c = BOARD_PATTERNS[pat][i][1];
	if (r < 0 || r >= this.Rows) {
	    continue;
	}
	if (c < 0 || c >= this.Columns) {
	    continue;
	}
	//console.log("BOARD_PATTERNS pat=" + pat + " r=" + r + " c=" + c);
	this.tableInternal[r][c] = {'blank': true, 'letter': LETTER_PLACEHOLDER, 'num':0};
    }
    for (let i = 0; i < this.Rows; i++) {
        for (let j = 0; j < this.Columns; j++) {
	    if (this.tableInternal[i][j] == undefined) {
		this.tableInternal[i][j] = {'blank': false, 'letter': LETTER_PLACEHOLDER, 'num':0};
	    }
	}
    }
    // after table is filled with blanks, make list of words (ACROSS and DOWN)
    let numAcrossDown = 0;
    let idx = 0;
    const workqueueAcross = [];
    const workqueueDown = [];
    for (let i = 0; i < this.Rows; i++) {
        for (let j = 0; j < this.Columns; j++) {
	    if (this.tableInternal[i][j].blank) {
		continue;
	    }
	    //console.log("i=" + i + " j=" + j + " num=" + this.tableInternal[i][j].num);
	    let lenAcross = 1;
	    while (true) {
		if (j + lenAcross >= this.Columns) {
		    // hit end of column
		    break;
		}
		if (this.tableInternal[i][j + lenAcross].blank) {
		    // hit a blank cell
		    break;
		}
		if ((j > 0) && !this.tableInternal[i][j-1].blank) {
		    // cell was already covered by an ACROSS word
		    break;
		}
		lenAcross += 1;
	    }
	    if (lenAcross > 1) {
		//console.log("  ACROSS len=" + lenAcross);
		numAcrossDown += 1;
		this.tableInternal[i][j].num = numAcrossDown;
		this.tableInternal[i][j].idx = idx;
		const rec = {
		    'idx' : idx,
		    'num' : numAcrossDown,
		    'dir' : DIR_ACROSS,
		    'len' : lenAcross,
		    'clue' : '[IDX ' + idx + ', LEN ' + lenAcross + ']',
		    'row' : i,
		    'col' : j,
		    'tries' : 0,
		};
		this.listAcrossDown.push(rec);
		workqueueAcross.push(rec);
		idx += 1;
	    }
	    
	    let lenDown = 1;
	    while (true) {
		if (i + lenDown >= this.Rows) {
		    // hit bottom
		    break;
		}
		if (this.tableInternal[i + lenDown][j].blank) {
		    // hit a blank cell
		    break;
		}
		if ((i > 0) && !this.tableInternal[i-1][j].blank) {
		    // cell was already covered
		    break;
		}
		lenDown += 1;
	    }
	    if (lenDown > 1) {
		//console.log("  DOWN len=" + lenDown);
		if (this.tableInternal[i][j].num == 0) {
		    numAcrossDown += 1;
		    this.tableInternal[i][j].num = numAcrossDown;
		}
		this.tableInternal[i][j].idx = idx;
		const rec = {
		    'idx' : idx,
		    'num' : numAcrossDown,
		    'dir' : DIR_DOWN,
		    'len' : lenDown,
		    'clue' : '[IDX ' + idx + ', LEN ' + lenDown + ']',
		    'row' : i,
		    'col' : j,
		    'tries' : 0,
		};
		this.listAcrossDown.push(rec);
		workqueueDown.push(rec);
		idx += 1;
	    }
	}
    }
    
    const workqueueAdd = [];
    const workqueueRetry = [];
    // heuristic #1 -- do longer words first to reduce chance of dead-ends
    workqueueAcross.sort(function(a,b) {return a.len - b.len});
    workqueueDown.sort(function(a,b) {return a.len - b.len});
    while (true) {
	let recAcross = workqueueAcross.pop();
	let recDown = workqueueDown.pop();
	if (recAcross != undefined && recDown != undefined) {
	    if (recAcross.len > recDown.len) {
		workqueueAdd.push(recAcross.idx);
		workqueueDown.push(recDown);
	    } else if (recDown.len > recAcross.len) {
		workqueueAdd.push(recDown.idx);
		workqueueAcross.push(recAcross);
	    } else {
		// len.s are same, so break tie with center-most
		let offsetAcross = Math.max(BOARD_SIZE_ROWS/2, recAcross.row);
		let offsetDown = Math.max(BOARD_SIZE_COLS/2,  recDown.col);
		if (Math.abs(offsetAcross - recAcross.row) < Math.abs(offsetDown - recDown.col)) {
		    workqueueAdd.push(recAcross.idx);
		    workqueueDown.push(recDown);
		} else {
		    workqueueAdd.push(recDown.idx);
		    workqueueAcross.push(recAcross);
		}
	    }
	} else if (recAcross != undefined) {
	    workqueueAdd.push(recAcross.idx);
	} else if (recDown != undefined) {
	    workqueueAdd.push(recDown.idx);
	}
	if (workqueueAcross.length == 0 && workqueueDown.length == 0) {
	    break;
	}
    }
    /***
    const clone = [].concat(this.listAcrossDown);
    clone.sort(function(a,b) {return b.len - a.len});
    for (let i = 0; i < clone.length; i++) {
	let workitem =  clone[i].idx;
	workqueueAdd.push(workitem);
    }
    ***/

    //console.log("TOP workqueueAdd=" + workqueueAdd);
    while (true) {
	//console.log("LOOP workqueueAdd=" + workqueueAdd);
	let idx = workqueueAdd.shift();
	while (idx != undefined) {
	    if (! itemAdd(idx, this.tableInternal, this.listAcrossDown)) {
		if (workqueueRetry.indexOf(idx) == -1) {
		    workqueueRetry.unshift(idx);
		}
	    }
	    idx = workqueueAdd.shift();
	}
	//console.log("LOOP workqueueRetry=" + workqueueRetry);
	idx = workqueueRetry.shift();
	while (idx != undefined) {
	    // heuristic -- delete word and all words that blocked this word
	    // NOTE: one del might cascade into many del.s
	    let listRetry = itemRetry(idx, this.tableInternal, this.listAcrossDown);
	    //console.log("Retry list len = " + listRetry.length);
	    if (listRetry.length > 0) {
		let pick = 0;
		if (listRetry.length > 0) {
		    pick = Math.floor(Math.random() * listRetry.length);
		}
		let entry = this.listAcrossDown[listRetry[pick].idx];
		//console.log("RETRY? " + entry.num + entry.dir + " oldword = " + listRetry[pick].oldword + " newword = " + listRetry[pick].newword);
		let fix = lookupWord(entry.len, listRetry[pick].newword);
		if (fix) {
		    let entryCross = this.listAcrossDown[listRetry[pick].idxcross];
		    console.log("FIXING: " + entry.num + entry.dir + " oldword = " + listRetry[pick].oldword + " newword = " + listRetry[pick].newword);
		    entry.clue = fix.clue;
		    entryCross.clue = listRetry[pick].newclue;
		    let r = entry.row;
		    let c = entry.col;
		    for (let i = 0; i < entry.len; i++) {
			this.tableInternal[r][c].letter = fix.answer[i];
			if (entry.dir == DIR_ACROSS) {
			    c += 1;
			} else if (entry.dir == DIR_DOWN) {
			    r += 1;
			}
		    }
		}
	    }

	    idx = workqueueRetry.shift();
	}
	if (workqueueAdd.length == 0 && workqueueRetry.length == 0) {
	    break;
	}
    }

    var table = document.createElement("TABLE");
    table.className = "crossword-board";
    
    // add the data rows
    for (let i = 0; i <this.Rows; i++) {
        let row = table.insertRow(-1);
        for (let j = 0; j < this.Columns; j++) {
            let cell = row.insertCell(-1);
	    if (!this.tableInternal[i][j].blank) {
		if (this.tableInternal[i][j].num > 0) {
		    cell.innerHTML = '<span class="num">' + this.tableInternal[i][j].num + '</span><br><span class="contents">' + this.tableInternal[i][j].letter + '</span>';
		} else {
		    cell.innerHTML = this.tableInternal[i][j].letter;
		}
		cell.contentEditable = "true";
		cell.addEventListener("keyup",
				      function(evt) {
					  let el = this;
					  //alert("CELL keyup " + el.textContent);
					  let ch = el.textContent[el.textContent.length - 1];
					  if (ch >= 'a' && ch <= 'z') {
					      el.textContent = ch.toUpperCase();;
					  } else if (ch >= 'A' && ch <= 'Z') {
					      el.textContent = ch;
					  } else if (' \t\n\r\v'.indexOf(ch) > -1) {
					      el.textContent = ' ';
					  } else {
					      //el.textContent = '?';
					      el.textContent = ch;
					  }
				      }
				     );
	    } else {
		cell.contentEditable = "false";
		cell.style.background = "black";
	    }
        }
    }

    var dvTable = document.getElementById("crossword-board-div");
    dvTable.innerHTML = "";
    dvTable.appendChild(table);
}


function itemAdd(idx, table, listAcrossDown) {
    let entry = listAcrossDown[idx];
    //console.log("itemAdd idx=" + idx + " num=" + entry.num + entry.dir);
    let pat = '^';
    let r = entry.row;
    let c = entry.col;
    for (let i = 0; i < entry.len; i++) {
	//console.log("  pat=" + pat);
	//clone[i].clue = "Clue " + clone[i].num;
	let ch = table[r][c].letter;
	if (ch == LETTER_PLACEHOLDER) {
	    pat += '[A-Z]';
	} else {
	    pat += ch;
	}
	if (entry.dir == DIR_ACROSS) {
	    c += 1;
	} else if (entry.dir == DIR_DOWN) {
	    r += 1;
	} else {
	    console.log("itemAdd ERROR - unknown direction " + entry.dir);
	}
    }
    let matches = findMatches(entry.len, pat + '$');
    let matchMaxTries = Math.min(matches.length, 8);
    let matchPosition = Math.floor(Math.random() * matches.length);
    if (matches.length == 0) {
	//console.log("itemAdd NO MATCHES idx=" + idx + " pat" + pat + '$');
	//entry.matches = null;
	return false;
    }
    /****
    entry.oldWord = new Array(entry.len);
    r = entry.row;
    c = entry.col;
    for (let i = 0; i < entry.len; i++) {
	entry.oldWord[i] = table[r][c].letter;
	if (entry.dir == DIR_ACROSS) {
	    c += 1;
	} else if (entry.dir == DIR_DOWN) {
	    r += 1;
	}
    }
    ***/

    //console.log("itemAdd - idx=" + entry.idx + " num=" + entry.num + entry.dir + " matchStart=" + matchStart + " matchMAX=" + matchMAX + " matchPosition=" + matchPosition);
    let choice = matches[matchPosition];
    //console.log("itemAdd -- ANSWER=" + choice.answer + " CLUE=" + choice.clue);
    entry.clue = choice.clue;
    r = entry.row;
    c = entry.col;
    table[r][c].idx = entry.idx;
    for (let i = 0; i < entry.len; i++) {
	table[r][c].letter = choice.answer[i];
	if (entry.dir == DIR_ACROSS) {
	    c += 1;
	} else if (entry.dir == DIR_DOWN) {
	    r += 1;
	}
    }

    return true;
}


function itemRetry(idx, table, listAcrossDown) {
    //console.log("itemRetry idx=" + idx);
    let entry = listAcrossDown[idx];
    //console.log("itemRetry idx=" + idx + " num=" + entry.num + entry.dir);
    let word = '';
    let r = entry.row;
    let c = entry.col;
    let listFixes = [];

    // find intersecting words
    let intersections = [];
    if (entry.dir == DIR_ACROSS) {
	for (let i=0; i<entry.len; i++) {
	    word += table[r][c+i].letter;
	    // find upper-most cell of word in each col
	    for (let j=r; j>=0; j--) {
		//console.log("ACROSS - row/col [" + j + "," + (c+i) + "]");
		if (j == 0 || table[j-1][c+i].blank == true) {
		    if (table[j][c+i].num > 0) {
			// note: some cells re-use numbers for across & down
			let idx = indexFind(listAcrossDown, table[j][c+i].num, DIR_DOWN);
			//console.log("ACROSS INTERSECT - row/col [" + j + "," + (c+i) + "] idx = " + idx + " table num=" + table[j][c+i].num);
			if (idx >= 0) { intersections.push(idx); }
		    }
		    break;
		}
	    }
	}
    } else if (entry.dir == DIR_DOWN) {
	for (let i=0; i<entry.len; i++) {
	    word += table[r+i][c].letter;
	    for (let j=c; j>=0; j--) {
		// find left-most cell of word in each row
		if (j == 0 || table[r+i][j-1].blank == true) {
		    if (table[r+i][j].num > 0) {
			// note: some cells re-use numbers for across & down
			let idx = indexFind(listAcrossDown, table[r+i][j].num, DIR_ACROSS);
			//console.log("DOWN INTERSECT - row/col [" + (r+i) + "," + j + "] blank=" + table[r+i][j].blank + " idx = " + idx + " table num=" + table[r+i][j].num);
			if (idx >= 0) { intersections.push(idx); }
		    }
		    break;
		}
	    }
	}
    }

    //console.log("itemRetry(" + idx + ") " + entry.num + entry.dir + " word = " + word + " intersections = " + intersections);    

    let matches = findCloseMatches(entry.len, word);
    //console.log("   ALT: word: " + word + " len=" + matches.length);
    
    for (let i=0; i<intersections.length; i++) {
	let entryCross = listAcrossDown[intersections[i]];
	let wordCross = getWordFromTable(table, entryCross);
	let positionTry = i;
	let positionCross = 0;
	if (entry.dir == DIR_ACROSS) {
	    positionCross = entry.row - entryCross.row;
	} else if (entry.dir == DIR_DOWN) {
	    positionCross = entry.col - entryCross.col;
	}
	//console.log("   > " + intersections[i] + ' : ' + entryCross.num + entryCross.dir + ' : ' + wordCross + " intersect letter = " + wordCross.charAt(positionCross));

	let lastChar = '';
	//for (let m=0; m<Math.min(5,matches.length); m++) {
	for (let m=0; m<matches.length; m++) {
	    if (matches[m].word[i] == lastChar) continue;
	    lastChar = matches[m].word[i];
	    //console.log("   ALT> " + matches[m].word);
	    //console.log("   CROSS m=" + m + " matches[m].word[i] = " +  matches[m].word[i]);
	    if (matches[m].word[i] == wordCross.charAt(positionCross)) continue;
	    let newcross = '';
	    for (let l=0; l<wordCross.length; l++) {
		if (l == positionCross) {
		    newcross += matches[m].word[i];
		} else {
		    newcross += wordCross.charAt(l);
		}
	    }
	    let newword = '';
	    for (let l=0; l<entry.len; l++) {
		if (l == positionTry) {
		    newword += matches[m].word[i];
		} else {
		    newword += word.charAt(l);
		}
	    }
	    //console.log("   NEW> " + newcross);
	    let alt = lookupWord(wordCross.length, newcross);
	    if (alt) {
		//console.log("   WORDS TO TRY  new: " + newword + " cross: " + newcross);
		let rec = {
		    'idx': idx,
		    'oldword': word,
		    'newword': newword,
		    'idxcross': intersections[i],
		    'newcross': newcross,
		    'newclue': alt.clue,
		};
		listFixes.push(rec);
	    } else {
		//console.log("   NEW CROSS - miss " + newcross);
	    }
	}
    }
    //console.log("   Before filter() len= " + listFixes.length);
    let lst = listFixes.sort().filter(function(item, pos, ary) {
        return !pos || (item.newword != ary[pos - 1].newword && item.oldword != ary[pos - 1].oldword);
    });
    //console.log("   After filter() len= " + lst.length);
    return lst;
}


function lookupWord(len, word) {
    for (let i = 0; i < WORDS[len].length; i++) {
	if (word == WORDS[len][i].answer) {
	    return WORDS[len][i];
	}
    }
    return null;
}


function getWordFromTable(table, entry) {
    let word = '';
    let r = entry.row;
    let c = entry.col;

    let intersections = [];
    if (entry.dir == DIR_ACROSS) {
	for (let i=0; i<entry.len; i++) {
	    word += table[r][c+i].letter;
	}
    } else if (entry.dir == DIR_DOWN) {
	for (let i=0; i<entry.len; i++) {
	    word += table[r+i][c].letter;
	}
    }
    return word;
}


function findCloseMatches(len, word) {
    let lastMatch = '';
    let matches = [];
    let hasWild = false;
    let re = null;
    if (word.indexOf(LETTER_PLACEHOLDER) > -1) {
	//console.log("findCloseMatches() hasWild");
	hasWild = true;
	let pat = '';
	for (let i = 0; i < len; i++) {
	    let ch = word.charAt(i);
	    if (ch == LETTER_PLACEHOLDER) {
		pat += '[A-Z]';
	    } else {
		pat += ch;
	    }
	}
	re = new RegExp(pat);
    }
    for (let i = 0; i < WORDS[len].length; i++) {
	if (hasWild && !WORDS[len][i].answer.match(re)) continue;
	if (WORDS[len][i].answer == lastMatch) continue;
	lastMatch = WORDS[len][i].answer;
	// for now, only want 1-letter diffs
	let sim = wordsimilarity(WORDS[len][i].answer, word);
	let rec = {
	    'sim': sim,
	    'word': WORDS[len][i].answer
	}
	matches.push(rec);
    }
    matches.sort(function(a,b) {return b.sim - a.sim});
    /***
    console.log("findCloseMatches word: " + word);
    for (let i=0; i<matches.length; i++) {
	if (i > 4) break;
	console.log("   ALT: " + matches[i].word + ' (' + matches[i].sim + ')');
    }
    ***/
    return matches;
}

function wordsimilarity(left, right) {
    //console.log("wordsimilarity left: " + left + " right: " + right);
    let sim = 0;
    if (left != right) {
	let len = Math.min(left.length, right.length);
	for (let i=0; i<len; i++) {
	    if (left.charAt(i) == right.charAt(i)) {
		sim += 1;
	    }
	}
	if (left.length > right.length) {
	    sim -= left.length - right.length;
	} else if (right.length > left.length) {
	    sim -= right.length - left.length;
	}
    }
    //console.log("wordsimilarity left: " + left + " right: " + right + " sim = " + sim);
    return sim;
}


function indexFind(listAcrossDown, num, dir) {
    for (let i=0; i<listAcrossDown.length; i++) {
	if (listAcrossDown[i].num == num && listAcrossDown[i].dir == dir) {
	    return listAcrossDown[i].idx;
	}
    }
    console.log("indexFind(): failed to find num=" + num + " dir:" + dir);
    return -1;
}


function findMatches(len, pat) {
    //console.log("findMatches pat: " + pat);
    let matches = [];
    let re = new RegExp(pat);
    for (let i = 0; i < WORDS[len].length; i++) {
	let result = WORDS[len][i].answer.match(re);
	if (result) {
	    //console.log("  " + WORDS[i].answer + " CLUE=" + WORDS[i].clue);
	    matches.push(WORDS[len][i]);
	}
    }
    return matches;
}
